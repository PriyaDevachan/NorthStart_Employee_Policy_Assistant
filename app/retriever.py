"""
BM25 retriever with date-aware authority filtering.

Baseline:   raw top-k BM25 results, no authority re-ranking.
Candidate:  authority-filtered results (current > archived, exception > general for dept).

The critical date logic (RAG-ISSUE-002):
  - A document is "active on date D" if effective_start <= D and (effective_end is None OR effective_end >= D).
  - Support Operations exception is effective 2026-03-01.
    A query for 2026-02-15 must NOT use the exception — the general 2-day allowance applies.
    A query for 2026-04-15 MUST use the exception — 1-day limit applies.
"""
from __future__ import annotations
import re
from dataclasses import replace
from datetime import date, datetime
from typing import List, Optional, Tuple

from rank_bm25 import BM25Okapi

from app.corpus import Corpus, Passage, get_corpus
from app.config import TOP_K


def _tokenize(text: str) -> List[str]:
    """Simple lowercase word tokenizer."""
    return re.findall(r"[a-zA-Z0-9]+", text.lower())


def _parse_date(d: Optional[str]) -> Optional[date]:
    if not d:
        return None
    try:
        return datetime.strptime(d, "%Y-%m-%d").date()
    except ValueError:
        return None


def _is_active(passage: Passage, as_of: Optional[date]) -> bool:
    """Return True if the passage's document is active on the given date."""
    if as_of is None:
        return True  # No date filter — include all
    start = _parse_date(passage.effective_start)
    end = _parse_date(passage.effective_end)
    if start and as_of < start:
        return False
    if end and as_of > end:
        return False
    return True


class BM25Retriever:
    def __init__(self, corpus: Corpus) -> None:
        self._corpus = corpus
        self._passage_ids: List[str] = list(corpus.passages.keys())
        self._passages: List[Passage] = [corpus.passages[pid] for pid in self._passage_ids]
        tokenized = [_tokenize(p.text) for p in self._passages]
        self._bm25 = BM25Okapi(tokenized)

    def retrieve(
        self,
        query: str,
        top_k: int = TOP_K,
        as_of: Optional[str] = None,
        department: Optional[str] = None,
        release: str = "baseline",
    ) -> List[Passage]:
        """
        Retrieve top-k relevant passages.

        Baseline:  pure BM25 score order, no authority filtering.
        Candidate: date-aware + authority filtering applied after BM25.
        """
        query_tokens = _tokenize(query)
        scores = self._bm25.get_scores(query_tokens)

        # Score + index pairs, sorted descending
        ranked: List[Tuple[float, int]] = sorted(
            enumerate(scores), key=lambda x: x[1], reverse=True
        )

        if release == "candidate":
            return self._authority_filtered(ranked, top_k, as_of, department)
        else:
            # Baseline: return top-k without filtering, with explicit rank and score
            results = []
            for rank_idx, (idx, score) in enumerate(ranked):
                if len(results) >= top_k:
                    break
                p = self._passages[idx]
                results.append(replace(p, rank=rank_idx + 1, score=round(float(score), 4)))
            return results

    def _authority_filtered(
        self,
        ranked: List[Tuple[int, float]],
        top_k: int,
        as_of: Optional[str],
        department: Optional[str],
    ) -> List[Passage]:
        """
        Candidate authority filter:
        1. Remove passages from documents inactive on as_of date.
        2. For each topic, if a current-status document exists, exclude archived passages
           for the same topic (current outranks archived per AUTH-REG-P2).
        3. If the query has a department and a department exception is active on as_of,
           prefer exception passages over general-policy passages for the same topic.
        4. Exclude informational/distractor passages.
        """
        as_of_date = _parse_date(as_of)

        # Map original BM25 scores by passage_id
        score_map = {self._passages[idx].passage_id: round(float(score), 4) for idx, score in ranked}

        # Gather all passages in BM25 score order
        all_passages = [self._passages[idx] for idx, _score in ranked]

        # Step 1: date-active filter
        active = [p for p in all_passages if _is_active(p, as_of_date)]

        # Step 2: exclude informational/distractor
        active = [p for p in active if p.status != "informational"]

        # Step 3: for each topic that has a current doc, remove archived for same topic
        topics_with_current = {
            p.topic for p in active if p.status == "current"
        }
        active = [
            p for p in active
            if not (p.status == "archived" and p.topic in topics_with_current)
        ]

        # Step 4: department exception handling
        # If department is given AND an active exception exists for that department,
        # de-prioritise general policy passages for the same topic.
        if department:
            dept_lower = department.lower()
            exception_topics = {
                p.topic for p in active
                if p.department and p.department.lower() == dept_lower
                and p.status == "current"
            }
            # Move exception passages to front, demote general policy for same topic
            exception_passages = [
                p for p in active
                if p.department and p.department.lower() == dept_lower
            ]
            general_non_conflict = [
                p for p in active
                if p.topic not in exception_topics or
                   (p.department and p.department.lower() == dept_lower)
            ]
            other_passages = [
                p for p in active
                if p.topic in exception_topics
                and not (p.department and p.department.lower() == dept_lower)
            ]
            # Re-merge: exception first, then other general passages
            active = exception_passages + [
                p for p in general_non_conflict if p not in exception_passages
            ]
            # Exclude general policy passages superseded by department exception
            active = [
                p for p in active if p not in other_passages
            ]

        # Return top_k with explicit rank and score
        results = []
        for rank_idx, p in enumerate(active[:top_k]):
            results.append(
                replace(
                    p,
                    rank=rank_idx + 1,
                    score=score_map.get(p.passage_id, 0.0),
                )
            )
        return results


# Module-level retriever singleton
_retriever: Optional[BM25Retriever] = None


def get_retriever() -> BM25Retriever:
    global _retriever
    if _retriever is None:
        _retriever = BM25Retriever(get_corpus())
    return _retriever
