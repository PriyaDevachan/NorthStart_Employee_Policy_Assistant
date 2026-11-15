"""
Prepare eval/human_review.csv for manual scoring across all 24 first-pass outputs
(12 baseline Trial 1 + 12 candidate Trial 1).

Leaves all scoring columns and reviewer comments 100% BLANK for manual human judgment.
Sets review_status to 'NOT_REVIEWED'.
"""
import openpyxl
import pandas as pd
from pathlib import Path

BENCHMARK_PATH = Path("eval/benchmark.csv")
BASELINE_XLSX = Path("eval/phase4_baseline_evaluation.xlsx")
CANDIDATE_CSV = Path("eval/candidate_results.csv")
OUTPUT_CSV = Path("eval/human_review.csv")

# 1. Load benchmark for expected answers (required_facts)
df_bench = pd.read_csv(BENCHMARK_PATH).set_index("case_id")

rows = []

# 2. Extract 12 baseline first-pass outputs (Trial 1)
wb_base = openpyxl.load_workbook(BASELINE_XLSX)
ws_base = wb_base["Baseline Results"]
for r in range(2, ws_base.max_row + 1):
    trial = int(ws_base.cell(r, 2).value)
    if trial == 1:
        cid = ws_base.cell(r, 1).value
        rows.append({
            "case_id": cid,
            "release": "baseline",
            "trial_id": 1,
            "question": ws_base.cell(r, 6).value,
            "expected_decision": ws_base.cell(r, 9).value,
            "actual_decision": ws_base.cell(r, 10).value,
            "expected_answer": df_bench.loc[cid, "required_facts"] if cid in df_bench.index else "",
            "actual_answer": ws_base.cell(r, 11).value,
            "cited_passages": ws_base.cell(r, 12).value if ws_base.cell(r, 12).value else "",
            "correctness_score": "",
            "grounding_score": "",
            "citation_support_score": "",
            "reviewer_comments": "",
            "review_status": "NOT_REVIEWED",
        })

# 3. Extract 12 candidate first-pass outputs (Trial 1)
df_cand = pd.read_csv(CANDIDATE_CSV)
cand_trial1 = df_cand[df_cand["trial_id"] == 1]
for _, r in cand_trial1.iterrows():
    cid = r["case_id"]
    rows.append({
        "case_id": cid,
        "release": "candidate",
        "trial_id": 1,
        "question": r["question"],
        "expected_decision": r["expected_decision"],
        "actual_decision": r["actual_decision"],
        "expected_answer": df_bench.loc[cid, "required_facts"] if cid in df_bench.index else "",
        "actual_answer": r["answer"],
        "cited_passages": r["citations"] if pd.notna(r["citations"]) and str(r["citations"]).strip() != "None" else "",
        "correctness_score": "",
        "grounding_score": "",
        "citation_support_score": "",
        "reviewer_comments": "",
        "review_status": "NOT_REVIEWED",
    })

# 4. Save to eval/human_review.csv
df_out = pd.DataFrame(rows)
df_out.to_csv(OUTPUT_CSV, index=False, encoding="utf-8")
print(f"Successfully generated {OUTPUT_CSV} with {len(df_out)} rows.")
