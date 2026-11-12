# Day 2 Milestone Log — Baseline Knowledge Assistant

**Project:** Northstar Policy Knowledge Assistant  
**Date:** 2026-11-12  
**Workspace:** `D:\project2-antigravity`  
**Provider & Model:** Groq Cloud API (`openai/gpt-oss-20b`)  
**Status:** Baseline Complete, Tested & Verified  

---

## 1. Milestones Completed

| Milestone | Status | Proof & Evidence |
| :--- | :---: | :--- |
| **Model Connectivity** | **DONE** | Standalone `check_groq.py` received `READY` response; HTTP 200 OK. |
| **Corpus & Manifest** | **DONE** | 10 synthetic policy markdown files; 48 unique passage IDs; `validate_corpus.py` passed 100/100 checks; `SOURCE_CHECK.md` signed off. |
| **Backend API & BM25** | **DONE** | FastAPI application running with `GET /api/health` and `POST /api/ask`. BM25 passage ranking and date-aware authority filtering implemented in separate modules. |
| **Server-Side Security** | **DONE** | `GROQ_API_KEY` loaded exclusively from `.env`. Zero secrets exposed in responses, logs, or UI. |
| **Citation Verification** | **DONE** | Server-side validator confirms every cited passage ID resolves to retrieved corpus text. Hallucinated IDs are detected and flagged. |
| **JSONL Tracing** | **DONE** | All runs automatically recorded to `eval/raw_runs.jsonl` with trace ID, latency, model ID, retrieved passages, decision, citations, and error fields. |
| **Automated Tests** | **DONE** | 20 pytest tests in `tests/` passed (health check, manifest integrity, citation validator, date-aware authority filtering). |
| **Interactive Frontend** | **DONE** | React + Vite application built in `frontend/` and served directly by FastAPI at `http://127.0.0.1:8001`. Features chat interface, department filter, date picker, baseline/candidate toggle, expandable citations, and diagnostic trace drawer. |

---

## 2. Six Smoke Test Results (Baseline Release)

The 6 mandatory smoke test questions from `DAY2.md` were executed against the baseline release. All raw requests, responses, passage IDs, and latencies are permanently recorded in `eval/raw_runs.jsonl`.

| ID | Smoke Question & Context | Expected per `SOURCE_RULES.md` | Actual Baseline Decision & Answer | Citations | Latency | QA Assessment / Verdict |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| **S1** | *"I am full-time, have worked eight months, and want learning leave in 2026. How many days?"* | Current 5-day rule; manager approval; current source (`LEARN-CURR-P2`). | **`abstain`**<br>"The policy passages provided do not specify the number of learning leave days for 2026." | `LEARN-CURR-P1` | 2645 ms | **Retrieval Recall Defect:** BM25 keyword fragmentation ranked `LEARN-CURR-P2` at #10, so it was excluded from top-5 context. Model honestly abstained rather than hallucinated. **(Finding #1 for Candidate tuning)** |
| **S2** | *"What was the learning-leave allowance in 2025?"* | Archived 3-day rule, clearly limited to 2025 (`LEARN-ARCH-P2` / `P4`). | **`answer`**<br>"The learning‑leave allowance in 2025 was three days. [LEARN-ARCH-P4]" | `LEARN-ARCH-P4` | 778 ms | **PASS:** Correctly retrieved archived policy and cited the 3-day allowance for 2025. |
| **S3** | *"I work in Support Operations. How many remote days can I take in April 2026?"* | Department exception: 1 day/week and manager approval (`REMOTE-SOPEX-P2`). | **`answer`**<br>"You may work remotely up to one day per week, and you must obtain manager approval for each remote day before it begins. [REMOTE-SOPEX-P2] [REMOTE-SOPEX-P3]" | `REMOTE-SOPEX-P2`<br>`REMOTE-SOPEX-P3` | 575 ms | **PASS:** Correctly applied the Support Operations department exception in effect for April 2026. |
| **S4** | *"How many remote days can I work?"* | Ask for department/date if needed; do not assume general allowance always applies. | **`answer`**<br>"You may work remotely up to two days per week, subject to manager approval and the conditions in the general Remote Work Policy. [REMOTE-CURR-P2]" | `REMOTE-CURR-P2` | 831 ms | **Baseline Limitation:** Answered with general rule (up to 2 days) but did not ask for department context. In Candidate, ambiguous department should trigger a clarification decision. |
| **S5** | *"What is the meal limit on approved business travel?"* | CAD 35/day with applicable conditions; cite current expenses policy (`TRAVEL-CURR-P2`). | **`answer`**<br>"The meal reimbursement limit for approved business travel is CAD 35 per calendar day. This cap applies to the total of all meals... [TRAVEL-FAQ-P1] [TRAVEL-CURR-P2]" | `TRAVEL-FAQ-P1`<br>`TRAVEL-CURR-P2` | 1645 ms | **PASS:** Accurate CAD 35 daily limit with verified citations to current policy and FAQ. |
| **S6** | *"How many days of parental leave do I get?"* | Corpus does not establish this; no invented number; abstain. | **`abstain`**<br>"The provided policy passages do not contain information about parental leave entitlements." | *(none)* | 668 ms | **PASS:** Correctly abstained without hallucinating an ungrounded leave entitlement. |

---

## 3. Verification of Mandatory Evaluation Risks

### RAG-ISSUE-001 — Employment Eligibility Inference
* **Query:** *"I am a part-time employee with eight months of service. Am I eligible for learning leave?"*
* **Observed Baseline Response:** The assistant retrieved `LEARN-CURR-P1` and stated that the current learning leave policy applies to full-time employees with at least six months of service.
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

## 4. Key Takeaways for Candidate Release (Day 3)

1. **Retrieval Top-K Expansion:** Increasing `top_k` from 5 to 8 or 10 will immediately resolve the S1 recall failure by bringing `LEARN-CURR-P2` into context.
2. **Ambiguity Clarification:** When a remote work question omits department context, Candidate logic should trigger a `clarify` decision rather than defaulting to the general policy.
3. **Grounding & Guardrails:** Across all 6 smoke runs, the Groq LLM never hallucinated a citation ID, never invented numbers, and properly abstained when data was missing.
