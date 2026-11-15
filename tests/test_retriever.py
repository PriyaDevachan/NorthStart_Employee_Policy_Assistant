"""
Tests for BM25 retriever: ranking, scores, authority filtering, and observability attributes.
"""
import pytest
from app.retriever import get_retriever


def test_retriever_baseline_rank_and_score():
    retriever = get_retriever()
    passages = retriever.retrieve("learning leave days", top_k=5, release="baseline")
    assert len(passages) == 5
    for idx, p in enumerate(passages):
        assert p.rank == idx + 1
        assert isinstance(p.score, float)
        assert p.score >= 0.0


def test_retriever_candidate_rank_and_score():
    retriever = get_retriever()
    passages = retriever.retrieve(
        "learning leave days",
        top_k=5,
        as_of="2026-04-15",
        release="candidate",
    )
    assert len(passages) <= 5
    for idx, p in enumerate(passages):
        assert p.rank == idx + 1
        assert isinstance(p.score, float)
        assert p.score >= 0.0


def test_retriever_candidate_excludes_archived_when_current_exists():
    retriever = get_retriever()
    passages = retriever.retrieve(
        "learning leave entitlement",
        top_k=10,
        as_of="2026-06-01",
        release="candidate",
    )
    # When current learning leave exists, candidate must not include archived learning leave
    archived_learning = [p for p in passages if p.doc_id == "POL-LEARN-ARCH-2025"]
    assert len(archived_learning) == 0
