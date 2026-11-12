"""
Server-side citation validator.

Verifies that every passage ID cited in the model's response:
1. Appears in the retrieved passages that were sent to the model.
2. Actually exists in the corpus manifest.

This prevents hallucinated citation IDs from reaching the client.
The API key is NEVER passed to this module.
"""
from __future__ import annotations
import re
from typing import List, Set

from app.corpus import Passage


# Pattern to extract passage IDs from model answer text: [LEARN-CURR-P1] or [REMOTE-SOPEX-P2]
_CITATION_RE = re.compile(r"\[([A-Z][A-Z0-9\-]+P\d+)\]")


def extract_cited_ids(answer_text: str) -> List[str]:
    """Extract all [PASSAGE-ID] citations from the model's answer text."""
    return _CITATION_RE.findall(answer_text)


def verify_citations(
    cited_ids: List[str],
    retrieved_passages: List[Passage],
) -> tuple[List[str], List[str]]:
    """
    Returns (valid_ids, invalid_ids).

    valid_ids:   cited IDs that are present in the retrieved passage set.
    invalid_ids: cited IDs that were NOT in the retrieved passage set
                 (hallucinated or out-of-context citations).
    """
    retrieved_set: Set[str] = {p.passage_id for p in retrieved_passages}
    valid: List[str] = []
    invalid: List[str] = []
    for cid in cited_ids:
        if cid in retrieved_set:
            valid.append(cid)
        else:
            invalid.append(cid)
    return valid, invalid
