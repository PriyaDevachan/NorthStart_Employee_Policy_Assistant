# Finding 03: Date Boundary Authority and Prerequisite Condition Sensitivity

- **Case ID, question, context and risk:**  
  `TC10_REMOTE_SO_FEB`: *"I work in Support Operations. How many remote days can I take in February 2026?"* (Context: `department: Support Operations`, `as_of: 2026-02-15`, Risk: Effective Date Authority Boundary / RAG-ISSUE-002).
- **Baseline or candidate release; model and retrieval settings:**  
  Baseline vs. Candidate release; hosted Groq `openai/gpt-oss-20b`, `top_k = 5`.
- **Expected decision and exact applicable source passage IDs:**  
  Expected Decision: `answer` (Up to 2 days per week under general policy; Support Operations 1-day exception is not effective until 1 March 2026).  
  Applicable Passage ID: `REMOTE-CURR-P2`.
- **Actual retrieved passage IDs/text:**  
  *Baseline:* Retrieved `REMOTE-SOPEX-P4`, `REMOTE-SOPEX-P2`, `REMOTE-SOPEX-P1`, `REMOTE-SOPEX-P5`, `REMOTE-CURR-P4`. (All 4 exception passages retrieved despite query date being February 15, because baseline lacked date filtering).  
  *Candidate:* Retrieved `REMOTE-CURR-P4`, `AUTH-REG-P3`, `ONBOARD-CURR-P5`, `REMOTE-CURR-P1`, `REMOTE-CURR-P2`. (`REMOTE-SOPEX` correctly suppressed; `ONBOARD-CURR-P5` mandatory security training prerequisite promoted to Rank 3).
- **Actual answer, citations and decision:**  
  *Baseline (Trial 1):* `decision: "answer"`. The LLM reasoned through the text of `REMOTE-SOPEX-P2` ("Effective 1 March 2026") and recognized that in February the exception had not yet started.  
  *Candidate (Trial 1):* `decision: "answer"`. Accurately identified that Support Ops exception starts March 1, calculating up to 2 days/week under the general policy, conditionally noting security training completion `[ONBOARD-CURR-P5]`.  
  *Candidate (Trials 2 & 3):* `decision: "clarify"`. The LLM halted to ask: *"Could you confirm whether you have completed the mandatory security training required for remote work eligibility?"*
- **Raw response file or trace ID:**  
  Trace IDs: `c901f782-9bc1-4965-b778-e5ab9dd4006c` (Trial 1, `answer`), `501fa382-747d-41da-ae3f-36fa6c9a405c` (Trial 2, `clarify`), logged in `eval/candidate_runs.jsonl`.
- **Observed failure (quote the relevant part of your own run):**  
  In Trials 2 & 3 of the Candidate run, the assistant shifted decision from `answer` to `clarify`:  
  *"To determine how many remote days you can take in February 2026, I need to confirm whether you have completed the mandatory security training required by the Onboarding Policy. Once that is confirmed, the general policy allows up to two remote days per week..."*
- **Suspected layer (retrieval, authority, generation, citation, evaluator or source label):**  
  **Cross-Policy Prerequisite Leakage into Decision Guardrails.**  
  *Root Cause:* In Baseline, `REMOTE-SOPEX` passages crowded out the onboarding policy. In Candidate, temporal authority filtering correctly suppressed `POL-REMOTE-SOPEX-2026` because `as_of: 2026-02-15` predates its effective start (`2026-03-01`). This allowed `ONBOARD-CURR-P5` (security training prerequisite) to enter context at Rank 3. Because the query did not specify whether the employee had completed onboarding training, the strict system prompt instruction (*"If the question requires context you do not have (eligibility), ask for it"*) triggered clarification behavior rather than a conditional answer.
- **Why it matters to an employee:**  
  While strictly accurate from a compliance perspective (an employee who has not completed security training cannot take remote days), halting with a clarification when the user was asking about the temporal date boundary creates user friction.
- **Retest steps and actual result:**  
  Retested across 3 trials. When the model answered conditionally in Trial 1, human evaluation scored it `2 / 2 / 2`. In Trials 2 & 3, human evaluation scored the clarification `N/A` with reviewer comment noting that the system prompted for prerequisite clarification.
- **Confidence/uncertainty and remaining limitation:**  
  *Confidence:* High. Demonstrates how fixing one layer (temporal authority filtering) surfaces secondary interactions in generation guardrails (prerequisite condition enforcement).  
  *Remaining Limitation:* Prompt tuning should distinguish between *blocking* missing variables (e.g. unknown department) versus *conditional* policy prerequisites (e.g. mandatory training), allowing the assistant to answer with a stated condition rather than halting.
