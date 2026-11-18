import React, { useState } from 'react';
import { 
  Sparkles, ShieldCheck, CheckCircle2, AlertCircle, HelpCircle, 
  ArrowRight, Filter, ChevronDown, ChevronRight, BarChart3, 
  TrendingUp, Activity, Check, X, Scale, FileText, Clock
} from 'lucide-react';

export const BENCHMARK_CASES = [
  {
    id: "TC01_LEARN_2026",
    title: "Annual Learning Leave Entitlement",
    category: "Direct Entitlement",
    risk: "Retrieval Recall",
    split: "dev",
    question: "I am a full-time employee with eight months of service. How many days of learning leave can I take in 2026?",
    expectedDecision: "answer",
    requiredFacts: "5 working days per calendar year; manager approval required; unused days do not carry over.",
    passages: ["LEARN-CURR-P1", "LEARN-CURR-P2"],
    asOf: "2026-06-01",
    dept: "",
    baselineOutcome: { decision: "abstain", score: "0/2/0", hit: false, status: "Defect (Missed LEARN-CURR-P2)" },
    candidateOutcome: { decision: "answer", score: "2/2/2", hit: true, status: "Fixed (+3.0 Phrase Boost, Rank #2)" },
    delta: "improvement"
  },
  {
    id: "TC02_TRAVEL_MEAL",
    title: "Travel Meal Reimbursement Cap",
    category: "Direct Entitlement",
    risk: "Citation Precision",
    split: "dev",
    question: "What is the meal reimbursement limit on approved business travel?",
    expectedDecision: "answer",
    requiredFacts: "CAD 35 per calendar day cap; receipt required within 30 days; alcohol excluded.",
    passages: ["TRAVEL-CURR-P2", "TRAVEL-FAQ-P1"],
    asOf: "2026-04-15",
    dept: "",
    baselineOutcome: { decision: "answer", score: "1/2/2", hit: true, status: "Answered with CAD 35 Cap" },
    candidateOutcome: { decision: "answer", score: "1/2/2", hit: true, status: "Answered with CAD 35 Cap" },
    delta: "neutral"
  },
  {
    id: "TC03_EQUIP_LAPTOP",
    title: "Laptop Hardware Replacement",
    category: "Direct Condition",
    risk: "Authority Conflict",
    split: "dev",
    question: "When am I eligible for a laptop replacement?",
    expectedDecision: "answer",
    requiredFacts: "Considered after 36 months of use, or sooner if IT confirms hardware failure in writing.",
    passages: ["EQUIP-CURR-P2", "EQUIP-CURR-P4"],
    asOf: "2026-04-15",
    dept: "",
    baselineOutcome: { decision: "answer", score: "2/2/2", hit: true, status: "Correct 36 months rule" },
    candidateOutcome: { decision: "answer", score: "2/2/2", hit: true, status: "Correct 36 months rule" },
    delta: "neutral"
  },
  {
    id: "TC04_TRAVEL_RECEIPT",
    title: "Travel Expense Receipt Deadline",
    category: "Direct Condition",
    risk: "Strict Condition",
    split: "held_out",
    question: "How many days do I have to submit meal receipts after business travel?",
    expectedDecision: "answer",
    requiredFacts: "Within 30 calendar days of expense date; late claims require Finance written approval.",
    passages: ["TRAVEL-CURR-P3", "TRAVEL-FAQ-P3"],
    asOf: "2026-04-15",
    dept: "",
    baselineOutcome: { decision: "answer", score: "2/2/2", hit: true, status: "30 calendar days identified" },
    candidateOutcome: { decision: "answer", score: "2/2/2", hit: true, status: "30 calendar days identified" },
    delta: "neutral"
  },
  {
    id: "TC05_REMOTE_SO_APRIL",
    title: "Support Ops April Remote Allowance",
    category: "Department Exception",
    risk: "Department Exception",
    split: "dev",
    question: "I work in Support Operations. How many remote days can I take in April 2026?",
    expectedDecision: "answer",
    requiredFacts: "Up to 1 day per week with manager approval; Support Operations exception effective 1 March 2026.",
    passages: ["REMOTE-SOPEX-P2", "REMOTE-SOPEX-P3"],
    asOf: "2026-04-15",
    dept: "Support Operations",
    baselineOutcome: { decision: "answer", score: "2/2/2", hit: true, status: "1 day exception applied" },
    candidateOutcome: { decision: "answer", score: "2/2/2", hit: true, status: "1 day exception applied" },
    delta: "neutral"
  },
  {
    id: "TC06_ONBOARD_REMOTE",
    title: "Onboarding Security Training Rule",
    category: "Prerequisite Condition",
    risk: "Prerequisite Condition",
    split: "held_out",
    question: "I am a new employee who has not completed security training. Am I allowed to work remotely?",
    expectedDecision: "answer",
    requiredFacts: "No; mandatory security training must be completed before receiving manager approval for remote work.",
    passages: ["ONBOARD-CURR-P2", "REMOTE-CURR-P5"],
    asOf: "2026-04-15",
    dept: "Engineering",
    baselineOutcome: { decision: "answer", score: "2/2/2", hit: true, status: "Security prereq enforced" },
    candidateOutcome: { decision: "answer", score: "2/2/2", hit: true, status: "Security prereq enforced" },
    delta: "neutral"
  },
  {
    id: "TC07_PARENTAL_LEAVE",
    title: "Parental Leave Duration",
    category: "Unknown / Abstention",
    risk: "Hallucination Resistance",
    split: "dev",
    question: "How many days of parental leave do I get?",
    expectedDecision: "abstain",
    requiredFacts: "Corpus does not establish parental leave duration; assistant must abstain honestly and refer to HR.",
    passages: ["none"],
    asOf: "2026-04-15",
    dept: "",
    baselineOutcome: { decision: "abstain", score: "N/A", hit: true, status: "Honest abstention (No hallucination)" },
    candidateOutcome: { decision: "abstain", score: "N/A", hit: true, status: "Honest abstention (No hallucination)" },
    delta: "neutral"
  },
  {
    id: "TC08_TUITION_REIMBURSE",
    title: "University Tuition Reimbursement",
    category: "Unknown / Abstention",
    risk: "Hallucination Resistance",
    split: "held_out",
    question: "What is the tuition reimbursement amount for completed university courses?",
    expectedDecision: "abstain",
    requiredFacts: "Corpus does not establish tuition reimbursement amounts; assistant must abstain without guessing.",
    passages: ["none"],
    asOf: "2026-04-15",
    dept: "",
    baselineOutcome: { decision: "abstain", score: "N/A", hit: true, status: "Honest abstention (No hallucination)" },
    candidateOutcome: { decision: "abstain", score: "N/A", hit: true, status: "Honest abstention (No hallucination)" },
    delta: "neutral"
  },
  {
    id: "TC09_LEARN_2025",
    title: "2025 Archived Learning Leave",
    category: "Temporal Scoping",
    risk: "Temporal Scoping",
    split: "dev",
    question: "What was the learning-leave allowance in calendar year 2025?",
    expectedDecision: "answer",
    requiredFacts: "3 working days with manager approval; applies strictly to calendar year 2025 only.",
    passages: ["LEARN-ARCH-P2", "LEARN-ARCH-P4"],
    asOf: "2025-06-01",
    dept: "",
    baselineOutcome: { decision: "answer", score: "2/2/2", hit: true, status: "3 days archived policy retrieved" },
    candidateOutcome: { decision: "answer", score: "2/2/2", hit: true, status: "3 days archived policy retrieved" },
    delta: "neutral"
  },
  {
    id: "TC10_REMOTE_SO_FEB",
    title: "Support Ops Pre-Exception Remote",
    category: "Temporal Boundary",
    risk: "Effective Date Authority",
    split: "dev",
    question: "I work in Support Operations. How many remote days can I take in February 2026?",
    expectedDecision: "answer",
    requiredFacts: "Up to 2 days per week under general policy; Support Operations 1-day exception is not effective until 1 March 2026.",
    passages: ["REMOTE-CURR-P2", "REMOTE-CURR-P4"],
    asOf: "2026-02-15",
    dept: "Support Operations",
    baselineOutcome: { decision: "answer", score: "2/2/2", hit: false, status: "Retrieved via fallbacks" },
    candidateOutcome: { decision: "answer", score: "2/2/2", hit: true, status: "Direct hit on REMOTE-CURR-P2" },
    delta: "neutral"
  },
  {
    id: "TC11_REMOTE_AMBIG_DEPT",
    title: "Unspecified Department Remote Work",
    category: "Ambiguous Scope",
    risk: "Missing Context",
    split: "dev",
    question: "How many remote days can I work each week?",
    expectedDecision: "clarify",
    requiredFacts: "General allowance is up to 2 days, but department exceptions apply (Support Ops 1 day); clarify department.",
    passages: ["REMOTE-CURR-P2", "REMOTE-CURR-P4"],
    asOf: "2026-04-15",
    dept: "",
    baselineOutcome: { decision: "clarify", score: "N/A", hit: true, status: "Requested department clarification" },
    candidateOutcome: { decision: "clarify", score: "N/A", hit: true, status: "Requested department clarification" },
    delta: "neutral"
  },
  {
    id: "TC12_LEARN_AMBIG_TENURE",
    title: "Unspecified Service Tenure",
    category: "Ambiguous Scope",
    risk: "Missing Context",
    split: "held_out",
    question: "I want to take learning leave. Am I eligible?",
    expectedDecision: "clarify",
    requiredFacts: "Requires full-time employment status and at least six months of continuous service; clarify tenure and status.",
    passages: ["LEARN-CURR-P1"],
    asOf: "2026-06-01",
    dept: "",
    baselineOutcome: { decision: "clarify", score: "N/A", hit: true, status: "Requested tenure & employment type" },
    candidateOutcome: { decision: "clarify", score: "N/A", hit: true, status: "Requested tenure & employment type" },
    delta: "neutral"
  }
];

export default function BenchmarkDashboard({ onRunCase, is3DView = true }) {
  const [filterSplit, setFilterSplit] = useState('all'); // 'all' | 'dev' | 'held_out'
  const [filterCategory, setFilterCategory] = useState('all');
  const [expandedCaseId, setExpandedCaseId] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'paired'

  const filteredCases = BENCHMARK_CASES.filter(c => {
    const matchesSplit = filterSplit === 'all' || c.split === filterSplit;
    const matchesCat = filterCategory === 'all' || c.category.toLowerCase().includes(filterCategory.toLowerCase());
    return matchesSplit && matchesCat;
  });

  return (
    <div className="benchmark-dashboard-container">
      {/* KPI Summary Banner */}
      <div className="benchmark-kpi-grid">
        {/* KPI 1: Evidence Hit@5 */}
        <div className="kpi-card glass-panel-3d card-pop-3d">
          <div className="kpi-card-top">
            <span className="kpi-badge badge-answer">MEASURE 1</span>
            <span className="kpi-delta text-green">+25.0% Gain</span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-main-num">100%</span>
            <span className="kpi-sub-num">Candidate Hit@5</span>
          </div>
          <p className="kpi-desc">
            8 / 8 answerable cases with required passages retrieved in top-5 (Baseline: 6 / 8 = 75.0%).
          </p>
          <div className="kpi-comparison-bar">
            <div className="kpi-bar-segment base" style={{ width: '75%' }} title="Baseline: 75.0%"></div>
            <div className="kpi-bar-segment cand" style={{ width: '25%' }} title="Candidate: 100.0%"></div>
          </div>
          <div className="kpi-bar-labels">
            <span>Base: 75%</span>
            <span>Cand: 100% (k=5, n=8)</span>
          </div>
        </div>

        {/* KPI 2: Required-Evidence Recall@5 */}
        <div className="kpi-card glass-panel-3d card-pop-3d">
          <div className="kpi-card-top">
            <span className="kpi-badge badge-clarify">MEASURE 2</span>
            <span className="kpi-delta text-green">+33.4% Gain</span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-main-num">91.7%</span>
            <span className="kpi-sub-num">Candidate Recall@5</span>
          </div>
          <p className="kpi-desc">
            11 / 12 required passage IDs retrieved across all answerable cases (Baseline: 7 / 12 = 58.3%).
          </p>
          <div className="kpi-comparison-bar">
            <div className="kpi-bar-segment base" style={{ width: '58.3%' }}></div>
            <div className="kpi-bar-segment cand" style={{ width: '33.4%' }}></div>
          </div>
          <div className="kpi-bar-labels">
            <span>Base: 58.3%</span>
            <span>Cand: 91.7% (k=5, n=12)</span>
          </div>
        </div>

        {/* KPI 3: Citation Validity */}
        <div className="kpi-card glass-panel-3d card-pop-3d">
          <div className="kpi-card-top">
            <span className="kpi-badge badge-answer">MEASURE 3</span>
            <span className="kpi-delta text-green">+4.6% Gain</span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-main-num">82.4%</span>
            <span className="kpi-sub-num">Citation Validity</span>
          </div>
          <p className="kpi-desc">
            14 / 17 cited passage IDs resolve and support the linked claims without hallucinations (Baseline: 14 / 18 = 77.8%).
          </p>
          <div className="kpi-comparison-bar">
            <div className="kpi-bar-segment base" style={{ width: '77.8%' }}></div>
            <div className="kpi-bar-segment cand" style={{ width: '4.6%' }}></div>
          </div>
          <div className="kpi-bar-labels">
            <span>Base: 77.8%</span>
            <span>Cand: 82.4% (n=17)</span>
          </div>
        </div>

        {/* KPI 4: Paired Comparison */}
        <div className="kpi-card glass-panel-3d card-pop-3d">
          <div className="kpi-card-top">
            <span className="kpi-badge badge-conflict">MEASURE 4</span>
            <span className="kpi-delta text-green">0 Regressions</span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-main-num">+1</span>
            <span className="kpi-sub-num">Net Improvement</span>
          </div>
          <p className="kpi-desc">
            1 Improvement (TC01 from abstain 0/2/0 to answer 2/2/2), 0 Regressions, 11 Neutral, 0 System Errors.
          </p>
          <div className="paired-pill-indicators">
            <span className="paired-tag tag-imp">+1 Win (TC01)</span>
            <span className="paired-tag tag-neut">11 Parity</span>
            <span className="paired-tag tag-reg">0 Regressions</span>
          </div>
        </div>
      </div>

      {/* Filter and View Controls Toolbar */}
      <div className="benchmark-toolbar glass-panel-3d">
        <div className="toolbar-left-filters">
          <div className="filter-button-group">
            <span className="toolbar-label"><Filter size={13} /> Split:</span>
            {['all', 'dev', 'held_out'].map(s => (
              <button 
                key={s} 
                className={`filter-tab-pill ${filterSplit === s ? 'active' : ''}`}
                onClick={() => setFilterSplit(s)}
              >
                {s === 'all' ? 'All (12)' : s === 'dev' ? 'Dev Split (8)' : 'Held-Out Split (4)'}
              </button>
            ))}
          </div>

          <div className="filter-button-group">
            <span className="toolbar-label">Category:</span>
            {['all', 'entitlement', 'condition', 'unknown', 'scoping'].map(c => (
              <button 
                key={c} 
                className={`filter-tab-pill ${filterCategory === c ? 'active' : ''}`}
                onClick={() => setFilterCategory(c)}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="toolbar-right-actions">
          <div className="view-mode-toggle">
            <button 
              className={`mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Card Grid View"
            >
              Cards
            </button>
            <button 
              className={`mode-btn ${viewMode === 'paired' ? 'active' : ''}`}
              onClick={() => setViewMode('paired')}
              title="Side-by-Side Paired Comparison"
            >
              Paired Table
            </button>
          </div>
        </div>
      </div>

      {/* PAIRED COMPARISON TABLE VIEW */}
      {viewMode === 'paired' && (
        <div className="paired-table-container glass-panel-3d card-pop-3d">
          <table className="paired-comparison-table">
            <thead>
              <tr>
                <th>Case ID & Question</th>
                <th>Expected</th>
                <th>Baseline (Release 1)</th>
                <th>Candidate (Release 2)</th>
                <th>Outcome</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map(c => (
                <tr key={c.id} className={c.delta === 'improvement' ? 'row-improvement' : ''}>
                  <td className="case-col-title">
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.id}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{c.title}</div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px' }}>"{c.question}"</div>
                  </td>
                  <td>
                    <span className={`status-badge badge-${c.expectedDecision}`}>
                      {c.expectedDecision.toUpperCase()}
                    </span>
                  </td>
                  <td className="outcome-cell">
                    <div className="outcome-head">
                      <span className={`status-badge badge-${c.baselineOutcome.decision}`}>
                        {c.baselineOutcome.decision.toUpperCase()}
                      </span>
                      <span className="score-pill">{c.baselineOutcome.score}</span>
                    </div>
                    <div className="outcome-detail">{c.baselineOutcome.status}</div>
                  </td>
                  <td className="outcome-cell">
                    <div className="outcome-head">
                      <span className={`status-badge badge-${c.candidateOutcome.decision}`}>
                        {c.candidateOutcome.decision.toUpperCase()}
                      </span>
                      <span className="score-pill text-green">{c.candidateOutcome.score}</span>
                    </div>
                    <div className="outcome-detail">{c.candidateOutcome.status}</div>
                  </td>
                  <td>
                    {c.delta === 'improvement' ? (
                      <span className="outcome-tag win">IMPROVEMENT (+2/2/2)</span>
                    ) : (
                      <span className="outcome-tag parity">PARITY</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="table-run-btn"
                      onClick={() => onRunCase && onRunCase(c)}
                      title="Run this case in Ask Assistant"
                    >
                      <ArrowRight size={13} /> Run
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* INTERACTIVE CARDS GRID VIEW */}
      {viewMode === 'cards' && (
        <div className="benchmark-cases-grid">
          {filteredCases.map(c => {
            const isExpanded = expandedCaseId === c.id;
            const isHero = c.id === 'TC01_LEARN_2026';

            return (
              <div 
                key={c.id} 
                className={`case-card-bento glass-panel-3d card-pop-3d ${isHero ? 'hero-case-card' : ''}`}
              >
                {isHero && (
                  <div className="hero-badge">
                    <Sparkles size={13} /> Target Defect Resolved in Candidate
                  </div>
                )}

                <div className="case-card-top">
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span className={`status-badge badge-${c.expectedDecision}`}>
                      {c.expectedDecision.toUpperCase()}
                    </span>
                    <span className={`split-badge ${c.split === 'dev' ? 'dev-split' : 'heldout-split'}`}>
                      {c.split.toUpperCase()}
                    </span>
                  </div>
                  <span className="case-id-badge">{c.id}</span>
                </div>

                <h3 className="case-card-title">{c.title}</h3>
                <p className="case-card-question">"{c.question}"</p>

                <div className="case-facts-box">
                  <span className="facts-label">Required Ground Truth:</span>
                  <p className="facts-text">{c.requiredFacts}</p>
                </div>

                <div className="case-required-passages">
                  <span className="passages-label">Required Passages:</span>
                  <div className="passages-row">
                    {c.passages.map(p => (
                      <span key={p} className="p-tag-pill">[{p}]</span>
                    ))}
                  </div>
                </div>

                {/* Comparative Baseline vs Candidate Pill */}
                <div className="case-paired-strip">
                  <div className="strip-item">
                    <span className="strip-lbl">Base:</span>
                    <span className={`strip-val ${c.baselineOutcome.decision === 'abstain' && c.expectedDecision === 'answer' ? 'text-red' : ''}`}>
                      {c.baselineOutcome.decision.toUpperCase()} ({c.baselineOutcome.score})
                    </span>
                  </div>
                  <ArrowRight size={12} className="strip-arrow" />
                  <div className="strip-item">
                    <span className="strip-lbl">Cand:</span>
                    <span className="strip-val text-green">
                      {c.candidateOutcome.decision.toUpperCase()} ({c.candidateOutcome.score})
                    </span>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="case-card-bottom">
                  <span className="risk-tag-pill">{c.risk}</span>
                  <button 
                    className="case-run-btn glow-gradient"
                    onClick={() => onRunCase && onRunCase(c)}
                    title="Execute test in Assistant"
                  >
                    <span>Run in Assistant</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
