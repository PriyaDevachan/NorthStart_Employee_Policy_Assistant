"""
JSONL trace logger.

Appends one record per request to eval/raw_runs.jsonl.
NEVER logs the API key, full model prompts containing the key,
or any credential. Only fictional policy content and results are logged.
"""
from __future__ import annotations
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.config import TRACES_PATH
from app.corpus import Passage


def _ensure_dir() -> None:
    TRACES_PATH.parent.mkdir(parents=True, exist_ok=True)


def new_trace_id() -> str:
    return str(uuid.uuid4())


def log_trace(
    trace_id: str,
    question: str,
    department: Optional[str],
    as_of: Optional[str],
    release: str,
    retrieved_passages: List[Passage],
    decision: str,
    answer: str,
    citations: List[str],
    invalid_citations: List[str],
    model: str,
    elapsed_ms: int,
    error: Optional[str] = None,
) -> None:
    """Append a structured trace record to eval/raw_runs.jsonl."""
    _ensure_dir()

    record: Dict[str, Any] = {
        "trace_id": trace_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "release": release,
        "question": question,
        "department": department,
        "as_of": as_of,
        "retrieved_passage_ids": [p.passage_id for p in retrieved_passages],
        "retrieved_passages": [
            {
                "rank": p.rank if p.rank is not None else (i + 1),
                "score": p.score,
                "passage_id": p.passage_id,
                "doc_id": p.doc_id,
                "status": p.status,
                "text_preview": p.text[:200],
            }
            for i, p in enumerate(retrieved_passages)
        ],
        "decision": decision,
        "answer": answer,
        "citations": citations,
        "invalid_citations": invalid_citations,
        "model": model,
        "elapsed_ms": elapsed_ms,
        "error": error,
        # API key is explicitly excluded — never logged
    }

    with open(TRACES_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(record) + "\n")
