"""
Export smoke test results to Excel (.xlsx) and CSV format.
"""
import pandas as pd
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

data = [
    {
        "Smoke_ID": "S1",
        "Category": "Direct Entitlement",
        "Question": "I am full-time, have worked eight months, and want learning leave in 2026. How many days?",
        "Department": "None (General)",
        "As_Of_Date": "2026-06-01",
        "Expected_Decision": "answer",
        "Expected_Answer": "5 working days per calendar year; manager approval required.",
        "Expected_Passage": "LEARN-CURR-P2",
        "Actual_Decision": "abstain",
        "Actual_Answer": "The policy passages provided do not specify the number of learning leave days for 2026.",
        "Retrieved_Passage_IDs": "LEARN-CURR-P1, TRAVEL-CURR-P5, TRAVEL-FAQ-P3, EQUIP-CURR-P2, LEARN-ARCH-P4",
        "Verified_Citations": "LEARN-CURR-P1",
        "Model": "openai/gpt-oss-20b",
        "Latency_ms": 2645,
        "QA_Verdict": "DEFECT (Retrieval Recall)",
        "QA_Finding_Notes": "BM25 keyword fragmentation ranked LEARN-CURR-P2 at #10. Because top_k=5, it was excluded from prompt. Model correctly abstained rather than hallucinating."
    },
    {
        "Smoke_ID": "S2",
        "Category": "Outdated / Archived",
        "Question": "What was the learning-leave allowance in 2025?",
        "Department": "None (General)",
        "As_Of_Date": "2025-06-01",
        "Expected_Decision": "answer",
        "Expected_Answer": "3 working days per calendar year with manager approval (2025 only).",
        "Expected_Passage": "LEARN-ARCH-P2 / LEARN-ARCH-P4",
        "Actual_Decision": "answer",
        "Actual_Answer": "The learning‑leave allowance in 2025 was three days. [LEARN-ARCH-P4]",
        "Retrieved_Passage_IDs": "LEARN-ARCH-P1, LEARN-ARCH-P4, LEARN-ARCH-P2, LEARN-CURR-P5, LEARN-CURR-P2",
        "Verified_Citations": "LEARN-ARCH-P4",
        "Model": "openai/gpt-oss-20b",
        "Latency_ms": 778,
        "QA_Verdict": "PASS",
        "QA_Finding_Notes": "Correctly retrieved archived 2025 policy and cited the 3-day rule without confusing it with 2026."
    },
    {
        "Smoke_ID": "S3",
        "Category": "Conditional / Exception",
        "Question": "I work in Support Operations. How many remote days can I take in April 2026?",
        "Department": "Support Operations",
        "As_Of_Date": "2026-04-15",
        "Expected_Decision": "answer",
        "Expected_Answer": "Up to 1 day per week with manager approval (effective 1 March 2026).",
        "Expected_Passage": "REMOTE-SOPEX-P2",
        "Actual_Decision": "answer",
        "Actual_Answer": "You may work remotely up to one day per week, and you must obtain manager approval for each remote day before it begins. [REMOTE-SOPEX-P2] [REMOTE-SOPEX-P3]",
        "Retrieved_Passage_IDs": "REMOTE-SOPEX-P2, REMOTE-SOPEX-P4, REMOTE-SOPEX-P1, REMOTE-SOPEX-P5, REMOTE-SOPEX-P3",
        "Verified_Citations": "REMOTE-SOPEX-P2, REMOTE-SOPEX-P3",
        "Model": "openai/gpt-oss-20b",
        "Latency_ms": 575,
        "QA_Verdict": "PASS",
        "QA_Finding_Notes": "Correctly applied Support Operations department exception in effect for April 2026."
    },
    {
        "Smoke_ID": "S4",
        "Category": "Ambiguous Context",
        "Question": "How many remote days can I work?",
        "Department": "None (Unstated)",
        "As_Of_Date": "2026-04-15",
        "Expected_Decision": "clarify / answer",
        "Expected_Answer": "Ask for department or state general 2 days subject to department exceptions.",
        "Expected_Passage": "REMOTE-CURR-P2 / REMOTE-CURR-P4",
        "Actual_Decision": "answer",
        "Actual_Answer": "You may work remotely up to two days per week, subject to manager approval and the conditions in the general Remote Work Policy. [REMOTE-CURR-P2]",
        "Retrieved_Passage_IDs": "REMOTE-CURR-P2, REMOTE-CURR-P3, REMOTE-CURR-P4, REMOTE-CURR-P1, REMOTE-SOPEX-P2",
        "Verified_Citations": "REMOTE-CURR-P2",
        "Model": "openai/gpt-oss-20b",
        "Latency_ms": 831,
        "QA_Verdict": "BASELINE LIMITATION",
        "QA_Finding_Notes": "Answered with general allowance but did not clarify unstated department. Candidate should prompt for department clarification."
    },
    {
        "Smoke_ID": "S5",
        "Category": "Direct Entitlement",
        "Question": "What is the meal limit on approved business travel?",
        "Department": "None (General)",
        "As_Of_Date": "2026-04-15",
        "Expected_Decision": "answer",
        "Expected_Answer": "CAD 35 per day; 30-day receipt window; alcohol excluded.",
        "Expected_Passage": "TRAVEL-CURR-P2",
        "Actual_Decision": "answer",
        "Actual_Answer": "The meal reimbursement limit for approved business travel is CAD 35 per calendar day. This cap applies to the total of all meals (breakfast, lunch, and dinner) within a single day of travel. [TRAVEL-FAQ-P1] [TRAVEL-CURR-P2]",
        "Retrieved_Passage_IDs": "TRAVEL-CURR-P1, TRAVEL-FAQ-P1, TRAVEL-CURR-P2, TRAVEL-CURR-P4, REMOTE-CURR-P5",
        "Verified_Citations": "TRAVEL-FAQ-P1, TRAVEL-CURR-P2",
        "Model": "openai/gpt-oss-20b",
        "Latency_ms": 1645,
        "QA_Verdict": "PASS",
        "QA_Finding_Notes": "Accurate CAD 35 daily limit with verified citations to current policy and FAQ."
    },
    {
        "Smoke_ID": "S6",
        "Category": "Unknown / Out-of-Scope",
        "Question": "How many days of parental leave do I get?",
        "Department": "None (General)",
        "As_Of_Date": "2026-04-15",
        "Expected_Decision": "abstain",
        "Expected_Answer": "Not established in policy corpus.",
        "Expected_Passage": "(none)",
        "Actual_Decision": "abstain",
        "Actual_Answer": "The provided policy passages do not contain information about parental leave entitlements.",
        "Retrieved_Passage_IDs": "DISTRACT-P4, REMOTE-CURR-P5, TRAVEL-CURR-P5, EQUIP-CURR-P5, ONBOARD-CURR-P5",
        "Verified_Citations": "(none)",
        "Model": "openai/gpt-oss-20b",
        "Latency_ms": 668,
        "QA_Verdict": "PASS",
        "QA_Finding_Notes": "Successfully abstained without hallucinating an ungrounded parental leave entitlement."
    }
]

df = pd.DataFrame(data)

# 1. Save CSV
csv_path = "D:/project2-antigravity/eval/smoke_results.csv"
df.to_csv(csv_path, index=False, encoding="utf-8-sig")
print(f"CSV saved: {csv_path}")

# 2. Save Styled Excel (.xlsx)
xlsx_path = "D:/project2-antigravity/eval/smoke_results.xlsx"
with pd.ExcelWriter(xlsx_path, engine="openpyxl") as writer:
    df.to_excel(writer, sheet_name="Smoke_Results", index=False)
    ws = writer.sheets["Smoke_Results"]

    # Header styling
    header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    thin_border = Border(
        left=Side(style="thin", color="CBD5E1"),
        right=Side(style="thin", color="CBD5E1"),
        top=Side(style="thin", color="CBD5E1"),
        bottom=Side(style="thin", color="CBD5E1")
    )

    for cell in ws[1]:
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

    # Data row styling & auto column width
    for row in ws.iter_rows(min_row=2):
        for cell in row:
            cell.border = thin_border
            cell.alignment = Alignment(vertical="top", wrap_text=True)
            # Highlight verdicts
            if cell.column_letter == "N":  # QA_Verdict column
                val = str(cell.value)
                if "PASS" in val:
                    cell.fill = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")
                    cell.font = Font(name="Calibri", size=10, bold=True, color="166534")
                elif "DEFECT" in val:
                    cell.fill = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid")
                    cell.font = Font(name="Calibri", size=10, bold=True, color="991B1B")
                else:
                    cell.fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")
                    cell.font = Font(name="Calibri", size=10, bold=True, color="92400E")

    ws.row_dimensions[1].height = 28
    for col in ws.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = min(max(max_len + 3, 12), 45)

print(f"Excel (.xlsx) saved: {xlsx_path}")
