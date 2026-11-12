"""
Groq LLM adapter — server-side only.

Builds the system prompt, sends the request to Groq, and parses the response.
The API key is loaded from config and NEVER returned to callers or logged.
"""
from __future__ import annotations
import json
import re
from typing import List, Optional, Tuple

import truststore
truststore.inject_into_ssl()

from groq import Groq, AuthenticationError, BadRequestError, RateLimitError, APIStatusError

from app.config import GROQ_API_KEY, GROQ_MODEL
from app.corpus import Passage

_client: Optional[Groq] = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=GROQ_API_KEY)
    return _client


def _build_system_prompt() -> str:
    return """You are the Northstar Services Policy Knowledge Assistant. Your role is to answer employee policy questions using ONLY the policy passages provided below.

STRICT RULES:
1. Answer using ONLY the provided policy passages. Do not use any outside knowledge.
2. Cite every factual claim using the passage ID in square brackets, e.g. [LEARN-CURR-P2].
3. Only cite passage IDs that appear in the passages provided to you.
4. Do NOT invent passage IDs, policy facts, numbers, dates, or exceptions.
5. Do NOT present inferences as confirmed policy facts. If a policy passage implies something but does not state it explicitly, say so.
6. If the question requires context you do not have (department, date, eligibility), ask for it — do not assume.
7. If the corpus does not establish an answer, say so clearly — do not invent one.
8. If two authoritative current documents conflict, disclose the conflict — do not guess.

DECISION RULES — choose exactly one:
- "answer": The corpus fully answers the question. Provide the answer with citations.
- "clarify": You need more context (department, date, eligibility) to give the right answer. Ask one clear question.
- "abstain": The corpus does not establish an answer to this question. State this clearly.
- "conflict": Two current authoritative passages contradict each other on the same point. Disclose the conflict.

RESPONSE FORMAT — return valid JSON only, no markdown code fences:
{
  "decision": "answer|clarify|abstain|conflict",
  "answer": "Your full response text here, with [PASSAGE-ID] citations inline.",
  "citations": ["PASSAGE-ID-1", "PASSAGE-ID-2"]
}"""


def _build_passages_block(passages: List[Passage]) -> str:
    lines = ["POLICY PASSAGES PROVIDED:"]
    for p in passages:
        lines.append(f"\n[{p.passage_id}] ({p.status.upper()}, effective: {p.effective_start} to {p.effective_end or 'present'}, dept: {p.department or 'all'}):")
        lines.append(p.text)
    return "\n".join(lines)


def _build_user_message(
    question: str,
    passages: List[Passage],
    department: Optional[str],
    as_of: Optional[str],
) -> str:
    passages_block = _build_passages_block(passages)
    context_parts = []
    if department:
        context_parts.append(f"Employee department: {department}")
    if as_of:
        context_parts.append(f"Policy date: {as_of}")
    context_line = " | ".join(context_parts) if context_parts else "No department or date specified."

    return f"""{passages_block}

EMPLOYEE CONTEXT: {context_line}

QUESTION: {question}

Respond with valid JSON only."""


def _parse_model_response(raw_content: str) -> Tuple[str, str, List[str]]:
    """
    Parse the JSON response from the model.
    Returns (decision, answer, citations).
    Falls back gracefully if JSON is malformed.
    """
    # Strip markdown code fences if present
    text = raw_content.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    try:
        data = json.loads(text)
        decision = data.get("decision", "abstain")
        answer = data.get("answer", "")
        citations = data.get("citations", [])
        # Validate decision
        if decision not in ("answer", "clarify", "abstain", "conflict"):
            decision = "abstain"
        return decision, answer, citations
    except (json.JSONDecodeError, ValueError):
        # If JSON parse fails, treat as abstain with raw text
        return "abstain", f"[Model response could not be parsed as JSON] {raw_content[:500]}", []


def call_groq(
    question: str,
    retrieved_passages: List[Passage],
    department: Optional[str] = None,
    as_of: Optional[str] = None,
) -> Tuple[str, str, List[str], str]:
    """
    Call the Groq API and return (decision, answer, citations, error_or_empty).
    API key stays server-side — never returned.
    """
    if not retrieved_passages:
        return "abstain", "No relevant policy passages were found for this question.", [], ""

    client = _get_client()
    system_prompt = _build_system_prompt()
    user_message = _build_user_message(question, retrieved_passages, department, as_of)

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=0.0,
            max_tokens=1024,
        )
        content = (response.choices[0].message.content or "").strip()
        if not content:
            # Reasoning model may put the answer in reasoning field
            reasoning = getattr(response.choices[0].message, "reasoning", None) or ""
            content = reasoning.strip()

        decision, answer, citations = _parse_model_response(content)
        return decision, answer, citations, ""

    except AuthenticationError:
        return "abstain", "API authentication error. Check GROQ_API_KEY in .env.", [], "AuthenticationError (401)"
    except BadRequestError as e:
        return "abstain", f"API bad request: model may be unavailable.", [], f"BadRequestError (400): {str(e)[:200]}"
    except RateLimitError:
        return "abstain", "Rate limit reached. Please wait before retrying.", [], "RateLimitError (429)"
    except APIStatusError as e:
        return "abstain", f"API error ({e.status_code}).", [], f"APIStatusError ({e.status_code})"
    except Exception as e:
        return "abstain", "Unexpected error during model call.", [], f"{type(e).__name__}: {str(e)[:200]}"
