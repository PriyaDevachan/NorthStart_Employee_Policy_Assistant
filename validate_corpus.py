"""
Corpus Validator for Northstar Policy Knowledge Assistant.
Validates that all 10 policy documents, manifest metadata, and passage IDs
are consistent and correctly structured.

Run: python validate_corpus.py
"""

import json
import os
import re
import sys
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent
POLICIES_DIR = ROOT / "policies"
MANIFEST_PATH = ROOT / "manifest.json"

# ── Expected constants (from SOURCE_RULES.md) ─────────────────────────────
REQUIRED_DOC_COUNT = 10
REQUIRED_TOPICS = {
    "learning_leave",
    "travel_expenses",
    "remote_work",
    "equipment",
    "onboarding",
    "authority",
    "distractor",
}
REQUIRED_STATUSES = {"current", "archived", "informational"}

# Passage ID format: UPPERCASE letters and hyphens, e.g. LEARN-CURR-P1
PASSAGE_ID_PATTERN = re.compile(r"^[A-Z][A-Z0-9\-]+P\d+$")

# ── Helpers ──────────────────────────────────────────────────────────────────

def load_manifest() -> dict:
    with open(MANIFEST_PATH, encoding="utf-8") as f:
        return json.load(f)


def collect_passage_ids_from_file(filepath: Path) -> list[str]:
    """Extract all passage IDs (## SOME-ID-Pn headers) from a policy file."""
    text = filepath.read_text(encoding="utf-8")
    return re.findall(r"^##\s+([A-Z][A-Z0-9\-]+P\d+)", text, re.MULTILINE)


def section_header(title: str) -> None:
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


# ── Checks ───────────────────────────────────────────────────────────────────

errors: list[str] = []
warnings: list[str] = []
passed: list[str] = []


def ok(msg: str) -> None:
    passed.append(msg)
    print(f"  [PASS] {msg}")


def warn(msg: str) -> None:
    warnings.append(msg)
    print(f"  [WARN] {msg}")


def fail(msg: str) -> None:
    errors.append(msg)
    print(f"  [FAIL] {msg}")


# ── Check 1: Manifest file exists ────────────────────────────────────────────
section_header("CHECK 1 — Manifest File Exists")
if MANIFEST_PATH.exists():
    ok(f"manifest.json found at {MANIFEST_PATH}")
    manifest = load_manifest()
else:
    fail(f"manifest.json NOT found at {MANIFEST_PATH}")
    print("\nCannot continue without manifest. Exiting.")
    sys.exit(1)

# ── Check 2: Policies directory exists ───────────────────────────────────────
section_header("CHECK 2 — Policies Directory Exists")
if POLICIES_DIR.is_dir():
    ok(f"policies/ directory found at {POLICIES_DIR}")
else:
    fail(f"policies/ directory NOT found at {POLICIES_DIR}")
    sys.exit(1)

# ── Check 3: Document count ───────────────────────────────────────────────────
section_header("CHECK 3 — Document Count")
documents = manifest.get("documents", [])
count = len(documents)
if count == REQUIRED_DOC_COUNT:
    ok(f"Manifest contains exactly {count} documents (required: {REQUIRED_DOC_COUNT})")
else:
    fail(f"Manifest contains {count} documents; expected {REQUIRED_DOC_COUNT}")

# ── Check 4: Required files exist on disk ────────────────────────────────────
section_header("CHECK 4 — All Manifest Files Exist on Disk")
for doc in documents:
    fpath = POLICIES_DIR / doc["filename"]
    if fpath.exists():
        ok(f"  Found: {doc['filename']}")
    else:
        fail(f"  MISSING: {doc['filename']} (doc_id={doc['doc_id']})")

# ── Check 5: No extra unexpected files in policies/ ──────────────────────────
section_header("CHECK 5 — No Unexpected Files in policies/")
manifest_filenames = {d["filename"] for d in documents}
disk_files = {f.name for f in POLICIES_DIR.iterdir() if f.is_file()}
extra = disk_files - manifest_filenames
missing_from_disk = manifest_filenames - disk_files
for f in sorted(extra):
    warn(f"File on disk not referenced in manifest: {f}")
for f in sorted(missing_from_disk):
    fail(f"File in manifest not found on disk: {f}")
if not extra and not missing_from_disk:
    ok("policies/ directory matches manifest exactly (no extra or missing files)")

# ── Check 6: Unique passage IDs across all documents ─────────────────────────
section_header("CHECK 6 — Unique Passage IDs (Manifest)")
all_manifest_ids: list[str] = []
for doc in documents:
    all_manifest_ids.extend(doc.get("passage_ids", []))

seen_ids: set[str] = set()
duplicate_ids: list[str] = []
for pid in all_manifest_ids:
    if pid in seen_ids:
        duplicate_ids.append(pid)
    seen_ids.add(pid)

if duplicate_ids:
    for dup in duplicate_ids:
        fail(f"Duplicate passage ID in manifest: {dup}")
else:
    ok(f"All {len(all_manifest_ids)} passage IDs in manifest are unique")

# ── Check 7: Passage ID format validation ────────────────────────────────────
section_header("CHECK 7 — Passage ID Format")
bad_format: list[str] = []
for pid in all_manifest_ids:
    if not PASSAGE_ID_PATTERN.match(pid):
        bad_format.append(pid)
if bad_format:
    for pid in bad_format:
        fail(f"Passage ID has unexpected format: {pid}")
else:
    ok(f"All {len(all_manifest_ids)} passage IDs match expected format (e.g. LEARN-CURR-P1)")

# ── Check 8: Every passage ID in manifest resolves to actual text ─────────────
section_header("CHECK 8 — Passage IDs Resolve to Actual Text in Files")
for doc in documents:
    fpath = POLICIES_DIR / doc["filename"]
    if not fpath.exists():
        warn(f"Skipping {doc['filename']} (file missing, caught in Check 4)")
        continue
    found_in_file = collect_passage_ids_from_file(fpath)
    for pid in doc.get("passage_ids", []):
        if pid in found_in_file:
            ok(f"  {pid} → found in {doc['filename']}")
        else:
            fail(f"  {pid} → NOT found as heading in {doc['filename']}")

# ── Check 9: Passage IDs in files match manifest (no undeclared passages) ─────
section_header("CHECK 9 — No Undeclared Passage IDs in Files")
for doc in documents:
    fpath = POLICIES_DIR / doc["filename"]
    if not fpath.exists():
        continue
    found_in_file = collect_passage_ids_from_file(fpath)
    declared = set(doc.get("passage_ids", []))
    for pid in found_in_file:
        if pid not in declared:
            warn(f"  {pid} in {doc['filename']} is NOT declared in manifest")
    if all(pid in declared for pid in found_in_file):
        ok(f"  {doc['filename']}: all file passage IDs are declared in manifest")

# ── Check 10: Required metadata fields present ────────────────────────────────
section_header("CHECK 10 — Required Metadata Fields in Each Document")
required_fields = ["doc_id", "filename", "title", "version", "status",
                   "effective_start", "scope", "topic", "passage_ids"]
for doc in documents:
    missing_fields = [f for f in required_fields if f not in doc]
    if missing_fields:
        fail(f"  {doc.get('doc_id','?')}: Missing fields: {missing_fields}")
    else:
        ok(f"  {doc.get('doc_id')}: All required metadata fields present")

# ── Check 11: Status values are valid ────────────────────────────────────────
section_header("CHECK 11 — Valid Status Values")
for doc in documents:
    status = doc.get("status", "")
    if status in REQUIRED_STATUSES:
        ok(f"  {doc['doc_id']}: status='{status}' is valid")
    else:
        fail(f"  {doc['doc_id']}: status='{status}' is not in {REQUIRED_STATUSES}")

# ── Check 12: Archived docs have effective_end date ─────────────────────────
section_header("CHECK 12 — Archived Documents Have Effective End Date")
for doc in documents:
    if doc.get("status") == "archived":
        if doc.get("effective_end"):
            ok(f"  {doc['doc_id']}: archived with effective_end={doc['effective_end']}")
        else:
            fail(f"  {doc['doc_id']}: archived but missing effective_end date")

# ── Check 13: Distractor doc has correct topic ───────────────────────────────
section_header("CHECK 13 — Distractor Document Classification")
distractors = [d for d in documents if d.get("topic") == "distractor"]
if len(distractors) == 1:
    ok(f"Exactly 1 distractor document found: {distractors[0]['doc_id']}")
elif len(distractors) == 0:
    fail("No distractor document found in manifest (required by SOURCE_RULES.md)")
else:
    warn(f"Multiple distractor documents found: {[d['doc_id'] for d in distractors]}")

# ── Check 14: Support Operations exception present ───────────────────────────
section_header("CHECK 14 — Support Operations Remote-Work Exception")
sopex = [d for d in documents if d.get("department") == "Support Operations"]
if sopex:
    doc = sopex[0]
    ok(f"Support Operations exception found: {doc['doc_id']}")
    if doc.get("effective_start") == "2026-03-01":
        ok(f"  Correct effective_start: 2026-03-01")
    else:
        fail(f"  Wrong effective_start: {doc.get('effective_start')} (expected 2026-03-01)")
else:
    fail("No Support Operations department exception found in manifest")

# ── Check 15: Current/archived learning leave pair exists ────────────────────
section_header("CHECK 15 — Learning Leave Current + Archived Pair")
ll_docs = [d for d in documents if d.get("topic") == "learning_leave"]
ll_statuses = {d["status"] for d in ll_docs}
if "current" in ll_statuses:
    ok("Learning leave CURRENT document present")
else:
    fail("Learning leave CURRENT document MISSING")
if "archived" in ll_statuses:
    ok("Learning leave ARCHIVED document present")
else:
    fail("Learning leave ARCHIVED document MISSING")

# ── Summary ───────────────────────────────────────────────────────────────────
section_header("VALIDATION SUMMARY")
total_passage_ids = len(all_manifest_ids)
print(f"\n  Total documents in manifest : {len(documents)}")
print(f"  Total passage IDs           : {total_passage_ids}")
print(f"\n  Checks PASSED : {len(passed)}")
print(f"  Warnings      : {len(warnings)}")
print(f"  FAILURES      : {len(errors)}")

if warnings:
    print("\n  Warnings:")
    for w in warnings:
        print(f"    ⚠  {w}")

if errors:
    print("\n  Failures:")
    for e in errors:
        print(f"    ✗  {e}")
    print("\n[RESULT] CORPUS VALIDATION FAILED — fix the issues above before proceeding.")
    sys.exit(1)
else:
    print("\n[RESULT] CORPUS VALIDATION PASSED — all checks green.")
