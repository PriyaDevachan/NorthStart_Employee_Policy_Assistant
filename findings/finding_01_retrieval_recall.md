# Finding 01: BM25 Keyword Fragmentation and Retrieval Recall Loss on Annual Entitlement

- **Case ID, question, context and risk:**  
  `TC01_LEARN_2026`: *"I am a full-time employee with eight months of service. How many days of learning leave can I take in 2026?"* (Split: Dev, Risk: Retrieval Recall).
- **Baseline or candidate release; model and retrieval settings:**  
  Baseline release; hosted Groq `openai/gpt-oss-20b`, standard BM25Okapi, `top_k = 5`, unigram tokenization, no date or authority filtering.
- **Expected decision and exact applicable source passage IDs:**  
  Expected Decision: `answer`  
  Applicable Passage IDs: `LEARN-CURR-P2` (and `LEARN-CURR-P1` for service tenure).
- **Actual retrieved passage IDs/text:**  
  Baseline retrieved top-5 passages:  
  1. `LEARN-CURR-P1` (Rank 1, BM25 score: 17.75) — Eligibility: full-time employees, 6 months service  
  2. `REMOTE-SOPEX-P2` (Rank 2, BM25 score: 7.16) — Support Operations remote work exception  
  3. `LEARN-ARCH-P4` (Rank 3, BM25 score: 6.47) — Archived 2025 forfeiture rules  
  4. `EQUIP-CURR-P2` (Rank 4, BM25 score: 6.24) — Laptop replacement after 36 months of use  
  5. `LEARN-CURR-P4` (Rank 5, BM25 score: 5.21) — Unused learning leave forfeiture  
  *Excluded from context:* `LEARN-CURR-P2` (Annual Entitlement of 5 days) was pushed down to **Rank 11** (score: 4.53).
- **Actual answer, citations and decision:**  
  Decision: `abstain`  
  Actual Answer: *"The policy passages provided do not specify the number of learning leave days available to full-time employees in 2026."*  
  Citations: `[LEARN-CURR-P1]`, `[LEARN-CURR-P4]`
- **Raw response file or trace ID:**  
  Trace ID: `234cb3d9-698f-4107-b3f9-ff650a256dfb` (Baseline Trial 1), logged in `eval/raw_runs.jsonl`.
- **Observed failure (quote the relevant part of your own run):**  
  The assistant completely failed to answer an explicit, answerable employee policy question despite the corpus possessing the exact rule in `LEARN-CURR-P2`. The assistant correctly observed: *"The policy passages provided do not specify the number of learning leave days available to full-time employees in 2026"*, which was honest under its provided context, but represented a complete retrieval failure.
- **Suspected layer (retrieval, authority, generation, citation, evaluator or source label):**  
  **Retrieval Layer (BM25 Keyword Fragmentation).**  
  *Root Cause:* In standard unigram BM25, rare tokens carry disproportionate Inverse Document Frequency (IDF). The query contained *"eight months of service"*. The token `"months"` had a high corpus IDF of 2.923. In `EQUIP-CURR-P2`, the phrase *"after 36 months of use... At the 36-month point"* contained `"months"` twice, giving it a score of 6.24. Conversely, `LEARN-CURR-P2` contains *"five working days of learning leave per calendar year"*; it does not mention `"months"` or `"service"`. Its overlapping tokens (`"learning"`, `"leave"`) had lower IDF (0.41–0.50) because they appear across all learning documents. Consequently, equipment noise outranked the core entitlement passage.
- **Why it matters to an employee:**  
  An employee seeking to schedule professional development is erroneously told Northstar policy does not state an annual learning leave entitlement, causing confusion and unnecessary HR escalations.
- **Retest steps and actual result:**  
  *Candidate Change:* Implemented multi-token phrase/bigram boosting in `app/retriever.py` for candidate release. If consecutive tokens (e.g. `"learning leave"`) appear in the passage text, an additional relevance boost (+3.0) is awarded. Additionally, candidate authority filtering pruned archived documents (`LEARN-ARCH-*`).  
  *Retest Result:* In the Candidate benchmark run (`TC01_LEARN_2026`), `LEARN-CURR-P2` rose from Rank 11 to **Rank 2** (BM25 score: 10.53) across all three trials (Trials 1, 2, 3). The Candidate assistant responded with `decision: "answer"` and verified citations `[LEARN-CURR-P1], [LEARN-CURR-P2]`, accurately stating the 5-day annual entitlement.
- **Confidence/uncertainty and remaining limitation:**  
  *Confidence:* High (100% verified across 3 baseline repeats and 3 candidate repeats).  
  *Remaining Limitation:* Phrase boosting relies on exact multi-word token sequences. Highly paraphrased questions (e.g. *"time off for self-study"*) without lexical overlap would still require semantic/dense vector embeddings to achieve robust retrieval recall.
