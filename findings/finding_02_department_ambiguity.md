# Finding 02: Missing Department Context Leading to Unhedged General Allowance Assumption

- **Case ID, question, context and risk:**  
  `TC11_REMOTE_AMBIG_DEPT`: *"How many remote days can I work each week?"* (Context: `department: None`, `as_of: 2026-04-15`, Risk: Ambiguous Department Context).
- **Baseline or candidate release; model and retrieval settings:**  
  Baseline vs. Candidate release; hosted Groq `openai/gpt-oss-20b`, `top_k = 5`.
- **Expected decision and exact applicable source passage IDs:**  
  Expected Decision: `clarify`  
  Applicable Passages: `REMOTE-CURR-P2` (general 2-day allowance) and `REMOTE-CURR-P4` (explicit notice that department-level exceptions govern specific teams, e.g. Support Operations 1-day limit).
- **Actual retrieved passage IDs/text:**  
  Baseline retrieved passages: `REMOTE-CURR-P4`, `REMOTE-CURR-P2`, `REMOTE-SOPEX-P2`, `REMOTE-CURR-P1`, `REMOTE-SOPEX-P4`.  
  Candidate retrieved passages: `REMOTE-CURR-P4`, `REMOTE-CURR-P2`, `REMOTE-CURR-P1`, `REMOTE-CURR-P5`, `REMOTE-CURR-P3`.
- **Actual answer, citations and decision:**  
  *Baseline Smoke (Day 2):* `decision: "answer"`. Stated: *"Employees may work remotely up to two days per week with manager approval"* without asking which department the employee belongs to.  
  *Candidate (Trial 1):* `decision: "clarify"`. Stated: *"Which department do you work in? The standard policy allows up to two days per week, but some departments (like Support Operations) have specific exceptions."*
- **Raw response file or trace ID:**  
  Candidate Trace ID: `9a8f4c28-98e6-4277-bf30-589578641eb3`, logged in `eval/raw_runs.jsonl`.
- **Observed failure (quote the relevant part of your own run):**  
  In the early baseline implementation, the assistant answered the query unconditionally as a global truth: *"Employees may work remotely up to two days per week"*. It overlooked `REMOTE-CURR-P4`'s provision that departmental exceptions take precedence over general rules.
- **Suspected layer (retrieval, authority, generation, citation, evaluator or source label):**  
  **Generation Layer & Prompt Guardrails (Ambiguity Handling).**  
  *Root Cause:* When an employee question omits a required variable (such as department), a generic RAG prompt defaults to asserting the majority general rule. Unless system instructions explicitly mandate clarifying ambiguous departmental scope when exceptions exist in retrieved context, the LLM treats the question as answered.
- **Why it matters to an employee:**  
  A Support Operations employee who asks this question without specifying their team would be told they can take 2 days remote per week. If they schedule 2 days, they violate the 1-day departmental limit (`POL-REMOTE-SOPEX-2026`), leading to compliance and scheduling disputes with department managers.
- **Retest steps and actual result:**  
  *Candidate Change:* Strengthened Rule 6 in the candidate prompt: *"If the question requires context you do not have (department, date, eligibility), ask for it — do not assume."* Decision rule `clarify` was reinforced.  
  *Retest Result:* On candidate benchmark execution, the assistant output `decision: "clarify"` and asked a single, helpful question clarifying the department.
- **Confidence/uncertainty and remaining limitation:**  
  *Confidence:* High (Confirmed in candidate evaluation).  
  *Remaining Limitation:* If the employee refuses to specify their department on a follow-up turn, the system needs fallback hedging logic to state both the general rule and all known departmental carve-outs simultaneously.
