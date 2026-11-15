# Release Decision Recommendation: Northstar Policy Knowledge Assistant

**Release Candidate:** `1.0.0-candidate`  
**Evaluation Date:** 15 November 2026  
**Auditor / AI Quality Analyst:** AI Quality Assurance Team  
**Evaluation Evidence Base:** 32 Total Raw Benchmark Attempts (16 Baseline, 16 Candidate) across 12 Frozen Cases; 24 First-Pass Human Reviews.

---

## 1. Recommendation: CONDITIONAL-GO

We recommend a **CONDITIONAL-GO** for internal phased deployment (Beta / Pilot) of the Northstar Policy Knowledge Assistant to a controlled user group.

### Core Justification
1. **Critical Defect Resolution (TC01):** The Candidate release successfully resolved the Baseline retrieval recall failure on annual learning leave entitlement (`LEARN-CURR-P2`). Retrieval Hit@5 increased from **57.1% (8/14)** to **100.0% (14/14)** on applicable benchmark cases, moving human correctness score from `0` to `2`.
2. **Zero Hallucinated Facts / Citations:** Across all 32 recorded attempts, the assistant produced **0 hallucinated citations** and **0 invented policy numbers**. All 26 candidate citations were verified server-side (100.0% citation precision).
3. **Robust Abstention & Guardrails:** On unsupported policy topics (TC07 Parental Leave, TC08 Tuition Reimbursement), the assistant consistently abstained without fabricating rules, directing employees to People Operations (HR).
4. **Human Review Quality:** Candidate achieved a mean human correctness score of **1.88 / 2.00** (up from 1.62 in Baseline), with **100.0% (8/8)** of scored responses meeting or exceeding acceptable quality (scores $\ge 1$).

---

## 2. Evidence Summary Matrix

| Metric | Baseline Release | Candidate Release | Quality Impact |
| :--- | :---: | :---: | :---: |
| **Total Project Attempts** | 16 attempts | 16 attempts | 32 total runs completed |
| **System Error Rate** | 0.0% (0 errors) | 0.0% (0 errors) | 100% API stability |
| **Retrieval Evidence Hit@5** | 57.1% (8 / 14) | **100.0% (14 / 14)** | **+42.9% Recall Gain** |
| **Citation Verification Rate** | 89.7% (26 / 29) | **100.0% (26 / 26)** | Clean 1:1 Grounding |
| **Human Correctness Score** | 1.62 / 2.00 | **1.88 / 2.00** | +0.26 Net Gain |
| **Human Grounding Score** | 1.75 / 2.00 | **2.00 / 2.00** | Perfect Anchor to Corpus |
| **Human Citation Support** | 1.75 / 2.00 | **2.00 / 2.00** | 100% Passage Alignment |
| **Acceptable Response Rate ($\ge 1$)** | 87.5% (7 / 8) | **100.0% (8 / 8)** | 0 Material Failures |

---

## 3. Mandatory Pre-Conditions for Full General Availability (GA)

The "Conditional" designation requires that the following three technical criteria are satisfied before broader enterprise rollout:

1. **Prerequisite Handling vs. Clarification Hedges (Finding 03):**  
   *Observation:* In `TC10_REMOTE_SO_FEB`, Candidate oscillated between conditional answering and halting to clarify security training prerequisites.  
   *Pre-Condition:* Update prompt guidelines to allow the model to provide a **conditional answer** (e.g. *"You are eligible for up to 2 days/week, provided you have completed mandatory security training"*) rather than forcing a blocking clarification turn.
2. **Dense Semantic Embedding Support (Finding 01 Limitation):**  
   *Observation:* Lexical phrase-boosting resolved keyword fragmentation for exact phrase matches, but semantic paraphrases remain vulnerable to BM25 vocabulary mismatch.  
   *Pre-Condition:* Complement BM25 with dense hybrid retrieval (e.g. BGE-small or text-embedding-3-small) prior to GA.
3. **Expanded Benchmark Scale:**  
   *Observation:* The current benchmark comprises 12 frozen cases (8 development, 4 held-out).  
   *Pre-Condition:* Expand the benchmark suite to at least 50 test cases covering edge cases across parental leave, travel expense caps, and contractor scopes.

---

## 4. Key Limitations & Known Risks

* **Benchmark Size Limitation:** The system is **NOT production-ready for autonomous enterprise deployment** based solely on a 12-case benchmark. The evaluation confirms architectural correctness and defect resolution within tested boundaries, not unbounded domain competence.
* **Corpus Boundary:** The assistant is grounded strictly in 10 synthetic policies (48 passages). Queries on unrepresented topics (health insurance, 401k/pension, severance) must continue to trigger hard abstentions.
* **LLM Stochasticity:** While `temperature = 0.0` was configured, reasoning model variations (`openai/gpt-oss-20b`) can occasionally yield differing decisions on nuanced multi-condition prompts.

---

## 5. Recommended 10-Minute Demonstration Script

To present this system to stakeholders or technical evaluators, follow this exact sequence:

1. **Start the Application:**  
   Launch backend on port `8001`:  
   ```powershell
   .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001
   ```
   Open `http://localhost:8001` in the browser.
2. **Answerable Case (`TC01_LEARN_2026`):**  
   Query: *"I am a full-time employee with eight months of service. How many days of learning leave can I take in 2026?"*  
   Show: Assistant responds with **5 working days** and cites `[LEARN-CURR-P1]` and `[LEARN-CURR-P2]`.
3. **Abstention & Clarification Cases:**  
   - *Unknown Case (`TC07_PARENTAL_LEAVE`):* Query: *"How many days of parental leave do I get?"* — Show assistant cleanly abstaining without hallucination and advising HR escalation.  
   - *Ambiguous Case (`TC11_REMOTE_AMBIG_DEPT`):* Query: *"How many remote days can I work each week?"* — Show assistant requesting department clarification.
4. **Inspection of Raw Observability Trace:**  
   Open [`eval/raw_runs.jsonl`](file:///D:/project2-antigravity/eval/raw_runs.jsonl), navigate to the latest record, and highlight the `"rank"` and `"score"` attributes inside `retrieved_passages`.
5. **Baseline vs. Candidate Paired Comparison:**  
   Show the comparison table: Baseline scored `0` on TC01 due to BM25 keyword fragmentation; Candidate scored `2` with 100% verified citations.
6. **State the Release Recommendation:**  
   Deliver the **Conditional-Go** verdict with clear explanation of the three GA pre-conditions.
