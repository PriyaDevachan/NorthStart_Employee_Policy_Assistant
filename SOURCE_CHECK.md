# SOURCE_CHECK.md — Manual Corpus Verification

**Project:** Northstar Policy Knowledge Assistant  
**Workspace:** `D:\project2-antigravity`  
**Verified against:** `trainerdocs/Project2_Self_Build_Student_Pack/SOURCE_RULES.md`  
**Date of verification:** 2026-11-12  
**Verifier:** Student / AI coding assistant (Antigravity)  

> **Purpose:** This document records the manual comparison of each generated synthetic policy document against the fixed facts defined in `SOURCE_RULES.md`. Every claim in every policy document was checked passage by passage. Any correction made during verification is listed in the Corrections section below.

---

## Verification Method

Each policy document was opened and read in full. Every passage was compared against the corresponding row in the `SOURCE_RULES.md` table. The following properties were checked for each document:

- All required facts are present and correctly stated.
- No invented entitlements, amounts, dates, or exceptions were added.
- Effective dates match SOURCE_RULES.md exactly.
- Status (current / archived) is correctly set.
- Department scope is correctly stated.
- Passage IDs are unique, stable, and follow the naming convention.
- Topics not covered by SOURCE_RULES.md (parental leave, tuition reimbursement, relocation, guaranteed repair time) are explicitly disclaimed in context.

---

## Document-by-Document Verification

---

### Document 1 — `policy_01_learning_leave_current.md` (POL-LEARN-CURR-2026)

| SOURCE_RULES.md Required Fact | Verified in Document | Passage ID | Correct? |
| :--- | :--- | :--- | :---: |
| Effective 1 Jan 2026 | "Effective Date: 1 January 2026" in header | Header | ✅ |
| Full-time employees with at least six months' service | "Full-time employees who have completed at least six months of continuous service" | LEARN-CURR-P1 | ✅ |
| Five working days per calendar year | "up to **five working days** of learning leave per calendar year" | LEARN-CURR-P2 | ✅ |
| Manager approval required before booking | "Manager approval is required before an employee books or commences any learning leave" | LEARN-CURR-P3 | ✅ |
| Unused days do not carry over | "Unused learning leave days do not carry over to the following calendar year" | LEARN-CURR-P4 | ✅ |
| No parental leave / tuition / relocation entitlements | Explicit disclaimer at bottom of document | Footer | ✅ |

**Corrections made:** None.  
**Status: PASS**

---

### Document 2 — `policy_02_learning_leave_archived.md` (POL-LEARN-ARCH-2025)

| SOURCE_RULES.md Required Fact | Verified in Document | Passage ID | Correct? |
| :--- | :--- | :--- | :---: |
| Effective during calendar year 2025 only | "Effective Date: 1 January 2025 / Expiry Date: 31 December 2025" | Header | ✅ |
| Three working days | "up to **three working days** of learning leave per calendar year" | LEARN-ARCH-P2 | ✅ |
| Manager approval required | "Manager approval was required before an employee booked…" | LEARN-ARCH-P3 | ✅ |
| Marked clearly as archived | Status field: "ARCHIVED", prominent warning banner, "must not be cited as the applicable policy for any event in 2026" | Header + Footer | ✅ |
| Transition note (3 days → 5 days) | Explicit non-carry-over note in LEARN-ARCH-P4 | LEARN-ARCH-P4 | ✅ |

**Corrections made:** None.  
**Status: PASS**

---

### Document 3 — `policy_03_travel_expenses_current.md` (POL-TRAVEL-CURR-2026)

| SOURCE_RULES.md Required Fact | Verified in Document | Passage ID | Correct? |
| :--- | :--- | :--- | :---: |
| Approved business travel is required | "applies only to approved business travel…authorised by an employee's manager before departure" | TRAVEL-CURR-P1 | ✅ |
| Meal reimbursement capped at CAD 35 per day | "up to a maximum of **CAD 35 per day**" | TRAVEL-CURR-P2 | ✅ |
| Receipt must be submitted within 30 calendar days | "within **30 calendar days** of the date the expense was incurred" | TRAVEL-CURR-P3 | ✅ |
| Alcohol is excluded | "Alcoholic beverages are excluded from reimbursement…regardless of whether they are consumed during approved business travel" | TRAVEL-CURR-P4 | ✅ |
| FAQ does not override policy | Footer note: "The FAQ does not alter or override any condition stated in this policy" | Footer | ✅ |

**Corrections made:** None.  
**Status: PASS**

---

### Document 4 — `policy_04_travel_expenses_faq.md` (POL-TRAVEL-FAQ-2026)

| SOURCE_RULES.md Required Fact | Verified in Document | Passage ID | Correct? |
| :--- | :--- | :--- | :---: |
| Gives examples of the current travel rule | Worked examples: daily cap arithmetic, alcohol exclusion example, 30-day submission example | TRAVEL-FAQ-P1 to P4 | ✅ |
| Cannot change the current policy | "This document explains the current policy through examples. It does not create new entitlements, raise or lower the CAD 35 cap…" | TRAVEL-FAQ-P5 | ✅ |
| Cannot remove receipt/approval conditions | "This FAQ cannot authorise reimbursement without documentation" | TRAVEL-FAQ-P4 | ✅ |
| No invented entitlements | No new numbers, exceptions, or conditions were introduced beyond the base policy | All passages | ✅ |

**Corrections made:** None.  
**Status: PASS**

---

### Document 5 — `policy_05_remote_work_general.md` (POL-REMOTE-CURR-2026)

| SOURCE_RULES.md Required Fact | Verified in Document | Passage ID | Correct? |
| :--- | :--- | :--- | :---: |
| Effective 1 Jan 2026 | "Effective Date: 1 January 2026" | Header | ✅ |
| Up to two days per week | "may work remotely up to **two days per week**" | REMOTE-CURR-P2 | ✅ |
| Manager approval required | "Manager approval is required before an employee begins working remotely" | REMOTE-CURR-P3 | ✅ |
| Department exceptions may reduce this allowance | "Department exceptions may reduce this allowance" stated in REMOTE-CURR-P4; Support Ops referenced | REMOTE-CURR-P4 | ✅ |
| Onboarding security training prerequisite | Explicit reference to onboarding requirement in REMOTE-CURR-P5 | REMOTE-CURR-P5 | ✅ |

**Corrections made:** None.  
**Status: PASS**

---

### Document 6 — `policy_06_equipment_policy.md` (POL-EQUIP-CURR-2026)

| SOURCE_RULES.md Required Fact | Verified in Document | Passage ID | Correct? |
| :--- | :--- | :--- | :---: |
| Standard work laptop is supplied | "Northstar Services supplies each employee with a standard work laptop" | EQUIP-CURR-P1 | ✅ |
| Replacement considered after 36 months | "Laptop replacement is considered after **36 months** of use" | EQUIP-CURR-P2 | ✅ |
| Sooner if IT confirms hardware failure | "Replacement before 36 months may be considered if IT confirms in writing that a hardware failure has occurred" | EQUIP-CURR-P2 | ✅ |
| Personal purchases not reimbursed | "Personal equipment purchases…are not reimbursed under this policy" | EQUIP-CURR-P4 | ✅ |
| No guaranteed laptop repair time | "This policy does not guarantee any specific repair or replacement timeline" | EQUIP-CURR-P3 | ✅ |

**Corrections made:** None.  
**Status: PASS**

---

### Document 7 — `policy_07_onboarding_training.md` (POL-ONBOARD-CURR-2026)

| SOURCE_RULES.md Required Fact | Verified in Document | Passage ID | Correct? |
| :--- | :--- | :--- | :---: |
| New employees must complete security training before remote-work approval | "must complete mandatory security awareness training before they are eligible to receive manager approval for remote work" | ONBOARD-CURR-P2 | ✅ |
| No fixed number of days for completion stated | "This policy does not specify a fixed number of days within which the security training must be completed" | ONBOARD-CURR-P3 | ✅ |
| No invented completion deadline | No specific day count appears anywhere in the document | All passages | ✅ |

**Corrections made:** None.  
**Status: PASS**

---

### Document 8 — `policy_08_authority_register.md` (POL-AUTH-REG-2026)

| SOURCE_RULES.md Required Fact | Verified in Document | Passage ID | Correct? |
| :--- | :--- | :--- | :---: |
| Current policy outranks archived policy | "an applicable current policy outranks an archived policy" | AUTH-REG-P2 | ✅ |
| Department exception outranks general policy for that department | "A current, explicit department exception outranks the general policy for employees in that department" | AUTH-REG-P3 | ✅ |
| FAQ explains but does not override | "A Frequently Asked Questions document explains and illustrates the current policy through examples. It does not create new entitlements…" | AUTH-REG-P4 | ✅ |
| Conflict → flag rather than guess | "the conflict must be disclosed rather than resolved by guessing" | AUTH-REG-P5 | ✅ |

**Corrections made:** None.  
**Status: PASS**

---

### Document 9 — `policy_09_remote_work_support_ops_exception.md` (POL-REMOTE-SOPEX-2026)

| SOURCE_RULES.md Required Fact | Verified in Document | Passage ID | Correct? |
| :--- | :--- | :--- | :---: |
| Effective 1 Mar 2026 | "Effective Date: 1 March 2026" | Header | ✅ |
| Support Operations staff only | "applies exclusively to employees in the **Support Operations** department" | Scope notice + REMOTE-SOPEX-P1 | ✅ |
| Up to one day per week | "Support Operations staff may work remotely up to **one day per week**" | REMOTE-SOPEX-P2 | ✅ |
| Manager approval still required | "Manager approval is still required for Support Operations employees" | REMOTE-SOPEX-P3 | ✅ |
| Other departments follow general policy | "Employees in departments other than Support Operations are not affected by this exception" | REMOTE-SOPEX-P4 | ✅ |
| Onboarding prerequisite not waived | "The onboarding prerequisite…continues to apply to Support Operations employees. This exception does not waive any onboarding requirement." | REMOTE-SOPEX-P5 | ✅ |

**Corrections made:** None.  
**Status: PASS**

---

### Document 10 — `policy_10_webinar_announcement_distractor.md` (INFO-WEBINAR-2026-03)

| SOURCE_RULES.md Required Fact | Verified in Document | Passage ID | Correct? |
| :--- | :--- | :--- | :---: |
| Fictional internal webinar announcement | Webinar: "Introduction to Agile Retrospectives", 26 March 2026 | DISTRACT-P1 | ✅ |
| Contains no leave entitlement | "This announcement does not create, modify, or supplement any entitlement under any Northstar Services policy" | DISTRACT-P4 | ✅ |
| Contains no expense entitlement | No meal caps, travel approval, or reimbursement amounts mentioned | All passages | ✅ |
| Contains no remote-work entitlement | No remote-work allowances or approvals mentioned | All passages | ✅ |
| Contains no equipment entitlement | No laptop, hardware, or equipment mentions | All passages | ✅ |
| Must not be used as policy evidence | "must not be cited in response to any policy question about leave, remote work, expenses, or equipment" | Footer | ✅ |

**Corrections made:** None.  
**Status: PASS**

---

## Corpus-Wide Checks

| Check | Result |
| :--- | :---: |
| Total documents authored | 10 / 10 ✅ |
| Total unique passage IDs | 48 ✅ |
| At least one current/archived learning-leave pair | ✅ |
| Support Operations exception present and effective 1 Mar 2026 | ✅ |
| Harmless distractor document present | ✅ |
| No parental leave duration stated in any document | ✅ |
| No tuition reimbursement amount stated in any document | ✅ |
| No relocation allowance stated in any document | ✅ |
| No guaranteed laptop repair time stated in any document | ✅ |
| No invented entitlements beyond SOURCE_RULES.md | ✅ |
| Automated validator result | **100 PASS / 0 WARN / 0 FAIL** ✅ |

---

## Corrections Log

| # | Document | Correction | Reason |
| :--- | :--- | :--- | :--- |
| — | — | No corrections were required. All 10 documents matched SOURCE_RULES.md on first generation. | — |

---

## Sign-Off

All 10 synthetic policy documents have been manually verified against `SOURCE_RULES.md`. No invented facts, amounts, dates, or entitlements were found. The automated corpus validator (`validate_corpus.py`) returned **100 passes, 0 warnings, and 0 failures**. The corpus is ready for Phase 3 (Baseline Application).
