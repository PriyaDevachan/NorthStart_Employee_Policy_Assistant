"""
Test: Citation validator and date-aware authority filtering (RAG-ISSUE-002).
No real Groq calls are made in these tests.
"""
import pytest
from app.corpus import load_corpus, Passage
from app.validator import extract_cited_ids, verify_citations
from app.retriever import BM25Retriever


# ── Citation validator tests ────────────────────────────────────────────────

def _make_passage(pid: str) -> Passage:
    corpus = load_corpus()
    if pid in corpus.passages:
        return corpus.passages[pid]
    # Fallback minimal passage
    return Passage(
        passage_id=pid, doc_id="TEST", title="Test", text="Test text.",
        status="current", effective_start="2026-01-01", effective_end=None,
        scope="all_departments", department=None, topic="test",
        authority_level=None,
    )


def test_extract_cited_ids_finds_inline_citations():
    text = "You may take five days [LEARN-CURR-P2] with manager approval [LEARN-CURR-P3]."
    ids = extract_cited_ids(text)
    assert "LEARN-CURR-P2" in ids
    assert "LEARN-CURR-P3" in ids


def test_extract_cited_ids_empty_when_no_citations():
    text = "There are no citation brackets in this sentence."
    ids = extract_cited_ids(text)
    assert ids == []


def test_verify_citations_all_valid():
    passages = [_make_passage("LEARN-CURR-P2"), _make_passage("LEARN-CURR-P3")]
    valid, invalid = verify_citations(["LEARN-CURR-P2", "LEARN-CURR-P3"], passages)
    assert valid == ["LEARN-CURR-P2", "LEARN-CURR-P3"]
    assert invalid == []


def test_verify_citations_detects_hallucinated_id():
    passages = [_make_passage("LEARN-CURR-P2")]
    valid, invalid = verify_citations(["LEARN-CURR-P2", "HALLUCINATED-P99"], passages)
    assert "LEARN-CURR-P2" in valid
    assert "HALLUCINATED-P99" in invalid


def test_verify_citations_empty_input():
    valid, invalid = verify_citations([], [])
    assert valid == []
    assert invalid == []


# ── Date-aware authority filtering tests (RAG-ISSUE-002) ────────────────────

@pytest.fixture
def retriever():
    corpus = load_corpus()
    return BM25Retriever(corpus)


def test_rag_issue_002_feb_2026_support_ops_uses_general_policy(retriever):
    """
    RAG-ISSUE-002: Support Operations, 15 Feb 2026.
    Exception effective 2026-03-01 is NOT yet active.
    Candidate retriever must NOT return Support Ops exception passages.
    """
    results = retriever.retrieve(
        query="how many remote days can I work",
        as_of="2026-02-15",
        department="Support Operations",
        release="candidate",
    )
    ids = [p.passage_id for p in results]
    # Exception passages (REMOTE-SOPEX-*) must NOT appear because
    # effective_start=2026-03-01 > as_of=2026-02-15
    sopex_ids = [pid for pid in ids if "SOPEX" in pid]
    assert sopex_ids == [], (
        f"RAG-ISSUE-002 FAIL: Support Ops exception passages {sopex_ids} "
        f"should not appear for Feb 2026 query. Effective date is 2026-03-01."
    )


def test_rag_issue_002_apr_2026_support_ops_uses_exception(retriever):
    """
    RAG-ISSUE-002: Support Operations, 15 Apr 2026.
    Exception effective 2026-03-01 IS active.
    Candidate retriever should prefer Support Ops exception passages.
    """
    results = retriever.retrieve(
        query="how many remote days can I work",
        as_of="2026-04-15",
        department="Support Operations",
        release="candidate",
    )
    ids = [p.passage_id for p in results]
    sopex_ids = [pid for pid in ids if "SOPEX" in pid]
    assert len(sopex_ids) > 0, (
        f"RAG-ISSUE-002 FAIL: Expected Support Ops exception passages in results "
        f"for Apr 2026 query, but got: {ids}"
    )


def test_current_outranks_archived_learning_leave(retriever):
    """
    For a 2026 learning leave query, archived (2025) passages must not appear
    in candidate results when current passages exist for the same topic.
    """
    results = retriever.retrieve(
        query="how many days of learning leave do I get in 2026",
        as_of="2026-06-01",
        department=None,
        release="candidate",
    )
    ids = [p.passage_id for p in results]
    archived_ids = [pid for pid in ids if "ARCH" in pid]
    assert archived_ids == [], (
        f"Archived passages {archived_ids} should not appear in candidate results "
        f"for a 2026 query when current learning leave policy exists."
    )


def test_distractor_excluded_from_candidate_results(retriever):
    """Distractor (informational) passages must never appear in candidate results."""
    results = retriever.retrieve(
        query="webinar agile retrospectives learning",
        as_of="2026-04-01",
        department=None,
        release="candidate",
    )
    ids = [p.passage_id for p in results]
    distractor_ids = [pid for pid in ids if "DISTRACT" in pid]
    assert distractor_ids == [], (
        f"Distractor passages {distractor_ids} appeared in candidate results."
    )
