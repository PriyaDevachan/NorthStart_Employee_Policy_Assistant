# Northstar Services Policy Knowledge Assistant

An enterprise policy Question-Answering (QA) and Retrieval-Augmented Generation (RAG) assistant built for Northstar Services employees. Evaluated under strict AI Quality Assurance methodology across Baseline and Candidate releases.

---

## 1. Overview & System Architecture

The assistant helps employees navigate internal policies (remote work, travel expenses, learning leave, equipment, and onboarding) with full grounding and inline citation verification.

```
                  +----------------------------------+
                  |   React + Vite Browser UI        |
                  |   (Mounted at http://127.0.0.1:8001) |
                  +-----------------+----------------+
                                    | POST /api/ask
                                    v
+------------------------------------------------------------------------+
|                          FastAPI Application                           |
|                                                                        |
|  1. Request Intake: question, department (optional), as_of date        |
|  2. Passage Retrieval: BM25 with Phrase Boosting                       |
|  3. Authority Filter: Date-active validation, exception prioritization |
|  4. LLM Generation: Groq Cloud API (openai/gpt-oss-20b)                |
|  5. Citation Guard: Server-side verification against retrieved IDs     |
|  6. Observability: JSONL trace logging with ranks and BM25 scores      |
+------------------------------------------------------------------------+
```

### Core Components
* **Backend:** FastAPI (Python 3.12) exposing `/api/health` and `/api/ask`.
* **Retriever:** BM25Okapi over 48 segmented policy passages, augmented in Candidate release with multi-token phrase boosting.
* **Authority Filtering:** Enforces temporal validity (`as_of` date resolution) and department exception hierarchy (e.g. Support Operations carve-outs).
* **Generation Engine:** Groq Cloud hosted LLM (`openai/gpt-oss-20b`) with temperature 0.0 and JSON schema enforcement.
* **Frontend:** Interactive single-page React + Vite application served directly by FastAPI.

---

## 2. Directory Structure

```text
D:\project2-antigravity\
├── README.md                           # Project documentation and launch guide
├── requirements.txt                    # Python dependencies
├── SOURCE_RULES.md                     # Fixed ground truth rules for policy corpus
├── manifest.json                       # Machine-readable corpus metadata (10 docs, 48 passages)
├── policies/                           # 10 synthetic policy documents in Markdown
│   ├── POL-LEARN-CURR-2026.md
│   ├── POL-REMOTE-CURR-2026.md
│   ├── POL-REMOTE-SOPEX-2026.md
│   └── ...
├── app/                                # Application package
│   ├── config.py                       # Configuration & environment paths
│   ├── corpus.py                       # Passage segmentation & manifest parser
│   ├── retriever.py                    # BM25 retriever & authority filter
│   ├── groq_client.py                  # Groq API adapter & system prompts
│   ├── validator.py                    # Citation extraction & server-side verification
│   ├── logger.py                       # JSONL trace logger (rank & score attributes)
│   ├── models.py                       # Pydantic schemas
│   └── main.py                         # FastAPI routes & static file mounting
├── frontend/                           # React + Vite web interface
│   ├── src/                            # UI source code
│   └── dist/                           # Production web build served by FastAPI
├── tests/                              # Pytest automated test suite
│   ├── test_manifest.py                # Manifest & passage ID integrity
│   ├── test_retriever.py               # BM25 ranking, scores, and candidate filtering
│   ├── test_citations.py               # Citation extraction and validation checks
│   └── test_health.py                  # API health check
├── eval/                               # Evaluation deliverables
│   ├── benchmark.csv                   # Frozen 12-case benchmark (8 dev, 4 held-out)
│   ├── raw_runs.jsonl                  # 32 total raw JSON traces (16 baseline, 16 candidate)
│   ├── candidate_runs.jsonl            # Dedicated 16 candidate runs with rank/score data
│   ├── candidate_results.csv           # Flat CSV export of candidate benchmark results
│   ├── candidate_results.xlsx          # Multi-tab styled candidate workbook
│   ├── human_review.csv                # 24 first-pass human scores (12 base, 12 cand)
│   ├── human_review.xlsx               # Excel review workbook with scoring rubric
│   ├── phase4_baseline_evaluation.xlsx # Multi-tab baseline evaluation workbook
│   └── analysis.py                     # Automated evaluation metrics calculator
├── findings/                           # Defect investigation records
│   ├── finding_01_retrieval_recall.md  # TC01 keyword fragmentation defect
│   ├── finding_02_department_ambiguity.md # TC11 missing department clarification
│   └── finding_03_date_authority_prerequisite.md # TC10 date boundary & prerequisite sensitivity
└── release_decision.md                 # 1-page structured Conditional-Go release decision
```

---

## 3. Setup and Launch Instructions (Windows Verified)

### Prerequisites
* Windows 10/11
* Python 3.12+ installed
* A free Groq Cloud API key (`gsk_...`)

### Step 1: Environment Setup
Open PowerShell in the project directory:
```powershell
cd D:\project2-antigravity

# Create virtual environment (if not already created)
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install required dependencies
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables
Create or verify `.env` in the project root:
```ini
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-20b
```
*(Note: `.env` is listed in `.gitignore` and is never committed or logged.)*

### Step 3: Run Automated Test Suite
```powershell
.\.venv\Scripts\python.exe -m pytest tests/
```
*Expected: All 18 automated unit tests pass.*

### Step 4: Launch the Application
Start the FastAPI server on port `8001`:
```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

### Step 5: Access the Interface
Open your web browser and navigate to:
**`http://localhost:8001`**

---

## 4. Evaluation and QA Results Summary

The assistant was evaluated using a frozen 12-case benchmark (8 development, 4 held-out cases) across two releases:
* **Baseline Release:** Raw unigram BM25 retrieval (`top_k = 5`), standard prompt.
* **Candidate Release:** Phrase-boosted BM25 retrieval, temporal date filtering, department exception re-ranking, and enhanced ambiguity guardrails.

### Quality Comparison (32 Total Benchmark Runs)

| Evaluation Metric | Baseline | Candidate | Delta / Impact |
| :--- | :---: | :---: | :---: |
| **Total Attempts** | 16 attempts | 16 attempts | 32 total completed |
| **System Error Rate** | 0.0% (0 errors) | 0.0% (0 errors) | 100% API stability |
| **Evidence Hit@5** | 57.1% (8 / 14) | **100.0% (14 / 14)** | **+42.9% Recall Gain** |
| **Server Citation Validity** | 89.7% (26 / 29) | **100.0% (26 / 26)** | 0 Hallucinations |
| **Human Mean Correctness** | 1.62 / 2.00 | **1.88 / 2.00** | +0.26 Net Gain |
| **Human Mean Grounding** | 1.75 / 2.00 | **2.00 / 2.00** | Perfect 1:1 Grounding |
| **Human Citation Support** | 1.75 / 2.00 | **2.00 / 2.00** | 100% Passage Support |
| **Acceptable Response Rate** | 87.5% (7 / 8) | **100.0% (8 / 8)** | Zero Material Failures |

To recompute metrics at any time:
```powershell
.\.venv\Scripts\python.exe eval/analysis.py
```

---

## 5. Key Defect Investigations

Detailed findings in `findings/`:
1. **Finding 01 (`findings/finding_01_retrieval_recall.md`):** BM25 keyword fragmentation in `TC01_LEARN_2026` caused `EQUIP-CURR-P2` to outrank `LEARN-CURR-P2` due to high IDF on `"months"`. Resolved via multi-token phrase boosting.
2. **Finding 02 (`findings/finding_02_department_ambiguity.md`):** Missing department context in `TC11_REMOTE_AMBIG_DEPT` previously defaulted to assuming general policy; candidate correctly triggers clarification.
3. **Finding 03 (`findings/finding_03_date_authority_prerequisite.md`):** Resolving date boundary filtering on `TC10_REMOTE_SO_FEB` promoted onboarding security prerequisites into context, causing model sensitivity between conditional answers and prerequisite clarification.

---

## 6. Release Recommendation

See **[`release_decision.md`](file:///D:/project2-antigravity/release_decision.md)** for the complete 1-page release review:
* **Status:** **CONDITIONAL-GO** for internal beta/pilot deployment.
* **Pre-conditions for General Availability:** Dense semantic hybrid retrieval, prompt tuning to decouple prerequisite conditions from blocking clarifications, and benchmark expansion to $\ge 50$ cases.

---

## 7. Security and Data Protection
* **Server-Side API Key Shielding:** `GROQ_API_KEY` is loaded exclusively inside Python processes via `os.environ` and is never returned in any API response, HTML page, or trace log.
* **Zero Logging of Credentials:** All trace records (`eval/raw_runs.jsonl`) store only query text, retrieved passages, model responses, and timing metrics.
* **Windows Native Trust:** Injects `truststore` into SSL contexts for secure enterprise certificate verification.
