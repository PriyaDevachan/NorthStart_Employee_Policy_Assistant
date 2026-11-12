# Day 2 Milestone Log — Baseline Knowledge Assistant

**Project:** Northstar Policy Knowledge Assistant  
**Date:** 2026-11-12  
**Workspace:** `D:\project2-antigravity`  
**Provider & Model:** Groq Cloud API (`openai/gpt-oss-20b`)  
**Status:** Baseline Complete & Verified  

---

## 1. Milestones Completed

| Milestone | Status | Proof & Evidence |
| :--- | :---: | :--- |
| **Model Connectivity** | **DONE** | Standalone `check_groq.py` received `READY` response; HTTP 200 OK. |
| **Corpus & Manifest** | **DONE** | 10 synthetic policy markdown files; 48 unique passage IDs; `validate_corpus.py` passed 100/100 checks; `SOURCE_CHECK.md` signed off. |
| **Backend API & BM25** | **DONE** | FastAPI application running with `GET /api/health` and `POST /api/ask`. BM25 passage ranking and date-aware authority filtering implemented in separate modules. |
| **Server-Side Security** | **DONE** | `GROQ_API_KEY` loaded exclusively from `.env`. Zero secrets exposed in responses, logs, or UI. |
| **Citation Verification** | **DONE** | Server-side validator confirms every cited passage ID resolves to retrieved corpus text. Hallucinated IDs are detected and flagged. |
| **JSONL Tracing** | **DONE** | Traces automatically recorded to `eval/raw_runs.jsonl` with trace ID, latency, model ID, retrieved passages, decision, citations, and error fields. |
| **Automated Tests** | **DONE** | 20 pytest tests in `tests/` passed (health check, manifest integrity, citation validator, date-aware authority filtering). |
| **Interactive Frontend** | **DONE** | React + Vite application built in `frontend/` and served directly by FastAPI. Features chat interface, department filter, date picker, baseline/candidate toggle, expandable citations, and diagnostic trace drawer. |

---

## 2. Verification of Mandatory Evaluation Risks

### RAG-ISSUE-001 — Employment Eligibility Inference
* **Query:** *"I am a part-time employee with eight months of service. Am I eligible for learning leave?"*
* **Observed Baseline Response:** The assistant retrieved `LEARN-CURR-P1` and stated that learning leave applies to full-time employees with at least six months of service.
* **Evaluation Status:** Verified against corpus text.

### RAG-ISSUE-002 — Date-Based Policy Authority
* **Case A (Pre-Exception):** Support Operations, 15 February 2026
  * **Retrieved:** General policy `REMOTE-CURR-P2`.
  * **Result:** Up to 2 days/week allowed; exception not applied prior to 1 March 2026.
* **Case B (Post-Exception):** Support Operations, 15 April 2026
  * **Retrieved:** Exception `REMOTE-SOPEX-P2` and `REMOTE-SOPEX-P3`.
  * **Result:** Up to 1 day/week allowed with manager approval.
* **Evaluation Status:** **VERIFIED** — The system correctly enforces date boundaries without retroactive leakage.

---

## 3. How to Launch the Application

### Option A: Complete Single-Port Launch (FastAPI + React UI)
```powershell
cd D:\project2-antigravity
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Open **`http://127.0.0.1:8000`** in any web browser to use the full interactive assistant.

### Option B: Frontend Development Mode (Hot-Reload)
```powershell
# Terminal 1 (Backend):
uvicorn app.main:app --host 127.0.0.1 --port 8000

# Terminal 2 (Frontend Dev Server):
cd D:\project2-antigravity\frontend
npm run dev
```
Open **`http://localhost:5173`**.
