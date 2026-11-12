"""
Test: Manifest integrity — every passage ID in the manifest resolves to actual corpus text.
Tests the corpus loader directly (no HTTP calls needed).
"""
import json
import pytest
from pathlib import Path
from app.corpus import load_corpus

ROOT = Path(__file__).parent.parent
MANIFEST_PATH = ROOT / "manifest.json"


def test_manifest_loads():
    with open(MANIFEST_PATH, encoding="utf-8") as f:
        manifest = json.load(f)
    assert "documents" in manifest
    assert len(manifest["documents"]) == 10


def test_all_passage_ids_resolve_to_text():
    corpus = load_corpus()
    with open(MANIFEST_PATH, encoding="utf-8") as f:
        manifest = json.load(f)

    for doc in manifest["documents"]:
        for pid in doc["passage_ids"]:
            assert pid in corpus.passages, (
                f"Passage ID '{pid}' from manifest not found in loaded corpus"
            )
            passage = corpus.passages[pid]
            assert len(passage.text) > 0, (
                f"Passage '{pid}' has empty text in corpus"
            )


def test_passage_ids_are_unique():
    corpus = load_corpus()
    ids = list(corpus.passages.keys())
    assert len(ids) == len(set(ids)), "Duplicate passage IDs found in corpus"


def test_archived_learning_leave_has_end_date():
    corpus = load_corpus()
    archived_ll = [
        p for p in corpus.passages.values()
        if p.topic == "learning_leave" and p.status == "archived"
    ]
    assert len(archived_ll) > 0, "No archived learning leave passages found"
    for p in archived_ll:
        assert p.effective_end is not None, (
            f"Archived passage '{p.passage_id}' has no effective_end date"
        )
        assert p.effective_end == "2025-12-31", (
            f"Archived passage '{p.passage_id}' effective_end should be 2025-12-31, got {p.effective_end}"
        )


def test_support_ops_exception_effective_date():
    corpus = load_corpus()
    sopex = [
        p for p in corpus.passages.values()
        if p.department == "Support Operations"
    ]
    assert len(sopex) > 0, "No Support Operations exception passages found"
    for p in sopex:
        assert p.effective_start == "2026-03-01", (
            f"Support Ops passage '{p.passage_id}' should be effective 2026-03-01, got {p.effective_start}"
        )


def test_distractor_has_no_policy_topic():
    corpus = load_corpus()
    distractors = [p for p in corpus.passages.values() if p.topic == "distractor"]
    assert len(distractors) > 0, "No distractor passages found"
    for p in distractors:
        assert p.status == "informational", (
            f"Distractor passage '{p.passage_id}' should have status 'informational'"
        )
