"""
Export eval/human_review.csv to eval/human_review.xlsx with professional formatting.

Contains:
- Sheet 1: 'Human Review' (all 24 first-pass records, scoring columns left 100% blank)
- Sheet 2: 'Rubric & Guidelines' (scoring rubric 0, 1, 2, N/A)
"""
import pandas as pd
from pathlib import Path
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

INPUT_CSV = Path("eval/human_review.csv")
OUTPUT_XLSX = Path("eval/human_review.xlsx")

df = pd.read_csv(INPUT_CSV, keep_default_na=False)

wb = openpyxl.Workbook()
wb.remove(wb.active)  # remove default sheet

# Color palette
HEADER_FILL = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid") # Dark Navy
HEADER_FONT = Font(name="Calibri", size=11, bold=True, color="FFFFFF")

SCORE_HEADER_FILL = PatternFill(start_color="B45309", end_color="B45309", fill_type="solid") # Amber/Bronze for human input columns
SCORE_HEADER_FONT = Font(name="Calibri", size=11, bold=True, color="FFFFFF")

ZEBRA_FILL = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
WHITE_FILL = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")

SCORE_CELL_FILL = PatternFill(start_color="FFFBEB", end_color="FFFBEB", fill_type="solid") # subtle warm tint for manual entry cells

THIN_BORDER = Border(
    left=Side(style="thin", color="CBD5E1"),
    right=Side(style="thin", color="CBD5E1"),
    top=Side(style="thin", color="CBD5E1"),
    bottom=Side(style="thin", color="CBD5E1"),
)

SCORE_BORDER = Border(
    left=Side(style="medium", color="D97706"),
    right=Side(style="medium", color="D97706"),
    top=Side(style="thin", color="D97706"),
    bottom=Side(style="thin", color="D97706"),
)

# ----------------------------------------------------------------------
# Sheet 1: Human Review
# ----------------------------------------------------------------------
ws = wb.create_sheet(title="Human Review")
ws.views.sheetView[0].showGridLines = True

headers = [
    "case_id", "release", "trial_id", "question",
    "expected_decision", "actual_decision", "expected_answer",
    "actual_answer", "cited_passages", "correctness_score",
    "grounding_score", "citation_support_score", "reviewer_comments", "review_status"
]

ws.append(headers)
for col_idx, h in enumerate(headers, start=1):
    cell = ws.cell(1, col_idx)
    if "score" in h or "comments" in h:
        cell.fill = SCORE_HEADER_FILL
        cell.font = SCORE_HEADER_FONT
    else:
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    cell.border = THIN_BORDER

ws.row_dimensions[1].height = 28

for row_idx, r in df.iterrows():
    row_num = row_idx + 2
    is_zebra = (row_num % 2 == 0)
    base_fill = ZEBRA_FILL if is_zebra else WHITE_FILL

    row_vals = [
        r["case_id"],
        r["release"],
        r["trial_id"],
        r["question"],
        r["expected_decision"],
        r["actual_decision"],
        r["expected_answer"],
        r["actual_answer"],
        r["cited_passages"],
        "",  # correctness_score (BLANK)
        "",  # grounding_score (BLANK)
        "",  # citation_support_score (BLANK)
        "",  # reviewer_comments (BLANK)
        "NOT_REVIEWED",
    ]
    ws.append(row_vals)

    for col_idx in range(1, len(row_vals) + 1):
        cell = ws.cell(row_num, col_idx)
        cell.font = Font(name="Calibri", size=10)
        cell.border = THIN_BORDER
        cell.fill = base_fill

        # Alignments
        if col_idx in [1, 2, 3, 5, 6, 14]:
            cell.alignment = Alignment(horizontal="center", vertical="center")
        elif col_idx in [4, 7, 8, 9, 13]:
            cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
        elif col_idx in [10, 11, 12]:
            cell.alignment = Alignment(horizontal="center", vertical="center")
            cell.fill = SCORE_CELL_FILL  # Highlight for user entry

    ws.row_dimensions[row_num].height = 55

# Column widths
col_widths = {
    "A": 24, # case_id
    "B": 12, # release
    "C": 8,  # trial_id
    "D": 38, # question
    "E": 18, # expected_decision
    "F": 16, # actual_decision
    "G": 40, # expected_answer
    "H": 55, # actual_answer
    "I": 28, # cited_passages
    "J": 18, # correctness_score
    "K": 18, # grounding_score
    "L": 22, # citation_support_score
    "M": 35, # reviewer_comments
    "N": 16, # review_status
}
for col_letter, width in col_widths.items():
    ws.column_dimensions[col_letter].width = width

# ----------------------------------------------------------------------
# Sheet 2: Rubric & Scoring Guidelines
# ----------------------------------------------------------------------
ws_rubric = wb.create_sheet(title="Rubric & Guidelines")
ws_rubric.views.sheetView[0].showGridLines = True

ws_rubric.column_dimensions["A"].width = 5
ws_rubric.column_dimensions["B"].width = 22
ws_rubric.column_dimensions["C"].width = 25
ws_rubric.column_dimensions["D"].width = 55

ws_rubric.cell(2, 2, "Human Review Scoring Rubric").font = Font(name="Calibri", size=16, bold=True, color="1E3A8A")
ws_rubric.cell(3, 2, "Manual scoring guide for evaluating the 24 first-pass system outputs").font = Font(name="Calibri", size=11, italic=True, color="64748B")

rubric_data = [
    ("Score", "Level", "Definition / Criteria"),
    ("0", "Unsatisfactory", "Materially wrong, factually conflicting, or unsupported claim."),
    ("1", "Partially Acceptable", "Partially correct with a minor noncritical gap (e.g. missing disclaimer or minor scope nuance)."),
    ("2", "Fully Acceptable", "All material requirements met; accurate, well-hedged, and completely supported by policy."),
    ("N/A", "Not Applicable", "Not applicable to this case (e.g. unanswerable query with no citations); reason documented in comments.")
]

r_start = 5
for r_i, (c1, c2, c3) in enumerate(rubric_data):
    row_num = r_start + r_i
    ws_rubric.cell(row_num, 2, c1)
    ws_rubric.cell(row_num, 3, c2)
    ws_rubric.cell(row_num, 4, c3)

    is_head = (r_i == 0)
    for c_i in [2, 3, 4]:
        cell = ws_rubric.cell(row_num, c_i)
        cell.border = THIN_BORDER
        if is_head:
            cell.fill = HEADER_FILL
            cell.font = HEADER_FONT
            cell.alignment = Alignment(horizontal="center", vertical="center")
        else:
            cell.font = Font(name="Calibri", size=10)
            cell.alignment = Alignment(horizontal="left", vertical="center")
            if c_i == 2:
                cell.font = Font(name="Calibri", size=11, bold=True)
                cell.alignment = Alignment(horizontal="center", vertical="center")
    ws_rubric.row_dimensions[row_num].height = 24

# Dimension explanations
dim_start = 12
ws_rubric.cell(dim_start, 2, "Scoring Dimensions").font = Font(name="Calibri", size=14, bold=True, color="1E3A8A")

dims = [
    ("Correctness", "Does the answer directly and accurately address the prompt according to the true policy facts?"),
    ("Grounding", "Is every statement in the answer strictly anchored in the retrieved policy text, with zero hallucination?"),
    ("Citation Support", "Do the cited passage IDs actually contain and verify the exact factual claims made in the answer?")
]

for d_i, (d_name, d_desc) in enumerate(dims):
    rn = dim_start + 2 + d_i
    ws_rubric.cell(rn, 2, d_name).font = Font(name="Calibri", size=11, bold=True, color="B45309")
    ws_rubric.cell(rn, 3, d_desc).font = Font(name="Calibri", size=10)
    ws_rubric.merge_cells(start_row=rn, start_column=3, end_row=rn, end_column=4)
    ws_rubric.cell(rn, 2).border = THIN_BORDER
    ws_rubric.cell(rn, 3).border = THIN_BORDER
    ws_rubric.cell(rn, 4).border = THIN_BORDER
    ws_rubric.row_dimensions[rn].height = 22

wb.save(OUTPUT_XLSX)
print(f"Successfully generated {OUTPUT_XLSX}")
