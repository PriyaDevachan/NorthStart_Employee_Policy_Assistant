"""
Candidate Benchmark Runner:
Executes 16 candidate attempts against the frozen 12-case benchmark.
- 12 single attempts (TC01 to TC12, Trial 1)
- 4 repeat attempts (TC01 Trials 2 & 3, TC10 Trials 2 & 3)
- release="candidate"
- Enriched traces with rank and BM25 scores
- Appends to eval/raw_runs.jsonl and writes eval/candidate_runs.jsonl
"""
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
import pandas as pd

# Ensure project root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Injects truststore
import truststore
truststore.inject_into_ssl()

from app.config import TOP_K, GROQ_MODEL, TRACES_PATH
from app.corpus import get_corpus
from app.retriever import get_retriever
from app.groq_client import call_groq
from app.validator import extract_cited_ids, verify_citations
from app.logger import log_trace, new_trace_id

BENCHMARK_PATH = Path("eval/benchmark.csv")
CANDIDATE_RUNS_PATH = Path("eval/candidate_runs.jsonl")

def main():
    print("=" * 70)
    print("NORTHSTAR POLICY KNOWLEDGE ASSISTANT — CANDIDATE BENCHMARK RUN")
    print("=" * 70)

    # 1. Load frozen benchmark
    df_bench = pd.read_csv(BENCHMARK_PATH)
    cases = df_bench.to_dict(orient="records")
    print(f"Loaded {len(cases)} frozen benchmark cases from {BENCHMARK_PATH}")

    # 2. Build 16 planned attempts
    high_risk_ids = ["TC01_LEARN_2026", "TC10_REMOTE_SO_FEB"]
    attempt_plan = []
    for c in cases:
        attempt_plan.append((c, 1))
    for c in cases:
        if c["case_id"] in high_risk_ids:
            attempt_plan.append((c, 2))
            attempt_plan.append((c, 3))

    print(f"Total planned candidate attempts: {len(attempt_plan)} (12 single + 4 repeat)")
    print("-" * 70)

    retriever = get_retriever()
    candidate_records = []

    for idx, (case, trial) in enumerate(attempt_plan, 1):
        cid = case["case_id"]
        q = case["question"]
        dept = case["department"] if case["department"] != "None" and pd.notna(case["department"]) else None
        as_of = case["as_of"] if pd.notna(case["as_of"]) else None

        print(f"[{idx:02d}/16] Case: {cid:22} | Trial: {trial} | Dept: {str(dept):18} | As-Of: {str(as_of)}")
        print(f"     Query: '{q[:60]}...'")

        start_time = time.time()
        trace_id = new_trace_id()

        # Step 1: Candidate retrieval (phrase-boosted + authority-filtered)
        retrieved = retriever.retrieve(
            query=q,
            top_k=TOP_K,
            as_of=as_of,
            department=dept,
            release="candidate",
        )

        # Step 2: Groq LLM call (candidate prompt with escalation guidance on abstain)
        decision, answer, model_citations, error = call_groq(
            question=q,
            retrieved_passages=retrieved,
            department=dept,
            as_of=as_of,
            release="candidate",
        )

        # Step 3: Citation extraction & server-side verification
        inline_ids = extract_cited_ids(answer)
        all_cited = list(dict.fromkeys(model_citations + inline_ids))
        valid_citations, invalid_citations = verify_citations(all_cited, retrieved)

        elapsed_ms = int((time.time() - start_time) * 1000)

        # Step 4: Log to raw_runs.jsonl (appends with rank and score)
        log_trace(
            trace_id=trace_id,
            question=q,
            department=dept,
            as_of=as_of,
            release="candidate",
            retrieved_passages=retrieved,
            decision=decision,
            answer=answer,
            citations=valid_citations,
            invalid_citations=invalid_citations,
            model=GROQ_MODEL,
            elapsed_ms=elapsed_ms,
            error=error or None,
        )

        # Step 5: Save to dedicated candidate list
        rec = {
            "case_id": cid,
            "trial_id": trial,
            "trace_id": trace_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "release": "candidate",
            "split": case.get("split", ""),
            "primary_category": case.get("primary_category", ""),
            "question": q,
            "department": dept,
            "as_of": as_of,
            "expected_decision": case.get("expected_decision", ""),
            "actual_decision": decision,
            "answer": answer,
            "citations": valid_citations,
            "invalid_citations": invalid_citations,
            "retrieved_passage_ids": [p.passage_id for p in retrieved],
            "retrieved_passages": [
                {
                    "rank": p.rank if p.rank is not None else (i + 1),
                    "score": p.score,
                    "passage_id": p.passage_id,
                    "doc_id": p.doc_id,
                    "status": p.status,
                    "text_preview": p.text[:200],
                }
                for i, p in enumerate(retrieved)
            ],
            "model": GROQ_MODEL,
            "elapsed_ms": elapsed_ms,
            "error": error or None,
        }
        candidate_records.append(rec)

        print(f"     -> Decision: {decision:8} | Citations: {valid_citations} | Elapsed: {elapsed_ms}ms")
        if error:
            print(f"     [!] Recorded error: {error}")
        print()

        # Polite delay to respect Groq TPM/RPM limits
        time.sleep(1.5)

    # Save dedicated candidate JSONL
    with open(CANDIDATE_RUNS_PATH, "w", encoding="utf-8") as f:
        for r in candidate_records:
            f.write(json.dumps(r) + "\n")

    print("=" * 70)
    print(f"Candidate run completed successfully! 16 attempts recorded.")
    print(f"Appended to: {TRACES_PATH}")
    print(f"Saved to:    {CANDIDATE_RUNS_PATH}")
    print("=" * 70)

if __name__ == "__main__":
    main()
