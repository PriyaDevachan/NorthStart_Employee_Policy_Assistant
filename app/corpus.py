"""
Corpus loader — reads all 10 policy documents and manifest.json into memory.
Extracts individual passages keyed by their stable passage IDs.
"""
from __future__ import annotations
import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional

from app.config import POLICIES_DIR, MANIFEST_PATH


@dataclass
class Passage:
    passage_id: str
    doc_id: str
    title: str
    text: str
    status: str                     # current | archived | informational
    effective_start: Optional[str]  # ISO date YYYY-MM-DD
    effective_end: Optional[str]    # ISO date YYYY-MM-DD or None
    scope: str
    department: Optional[str]
    topic: str
    authority_level: Optional[str]  # None | faq | informational_only


@dataclass
class Corpus:
    passages: Dict[str, Passage] = field(default_factory=dict)   # passage_id → Passage
    documents: List[dict] = field(default_factory=list)          # raw manifest docs


def _extract_passages_from_file(filepath: Path, doc_meta: dict) -> List[Passage]:
    """
    Splits a policy markdown file into individual passages at ## HEADING level.
    Each ## heading with a valid passage ID starts a new passage.
    Text continues until the next ## heading or end of file.
    """
    text = filepath.read_text(encoding="utf-8")
    lines = text.splitlines()

    # Regex matches a ## heading that is a valid passage ID (e.g. ## LEARN-CURR-P1 — Title)
    id_pattern = re.compile(r"^##\s+([A-Z][A-Z0-9\-]+P\d+)(.*)?$")

    passages = []
    current_id: Optional[str] = None
    current_lines: List[str] = []

    def flush(pid: Optional[str], body_lines: List[str]) -> None:
        if pid is None:
            return
        body = "\n".join(body_lines).strip()
        if body:
            passages.append(Passage(
                passage_id=pid,
                doc_id=doc_meta["doc_id"],
                title=doc_meta["title"],
                text=body,
                status=doc_meta.get("status", "current"),
                effective_start=doc_meta.get("effective_start"),
                effective_end=doc_meta.get("effective_end"),
                scope=doc_meta.get("scope", "all_departments"),
                department=doc_meta.get("department"),
                topic=doc_meta.get("topic", "unknown"),
                authority_level=doc_meta.get("authority_level"),
            ))

    for line in lines:
        m = id_pattern.match(line)
        if m:
            flush(current_id, current_lines)
            current_id = m.group(1)
            current_lines = []
        else:
            if current_id is not None:
                current_lines.append(line)

    flush(current_id, current_lines)
    return passages


def load_corpus() -> Corpus:
    """Load all policy documents and return a Corpus object."""
    if not MANIFEST_PATH.exists():
        raise FileNotFoundError(f"manifest.json not found at {MANIFEST_PATH}")

    with open(MANIFEST_PATH, encoding="utf-8") as f:
        manifest = json.load(f)

    corpus = Corpus(documents=manifest["documents"])

    for doc_meta in manifest["documents"]:
        filepath = POLICIES_DIR / doc_meta["filename"]
        if not filepath.exists():
            raise FileNotFoundError(f"Policy file missing: {filepath}")

        doc_passages = _extract_passages_from_file(filepath, doc_meta)
        for p in doc_passages:
            corpus.passages[p.passage_id] = p

    return corpus


# Module-level singleton — loaded once at startup
_corpus: Optional[Corpus] = None


def get_corpus() -> Corpus:
    global _corpus
    if _corpus is None:
        _corpus = load_corpus()
    return _corpus
