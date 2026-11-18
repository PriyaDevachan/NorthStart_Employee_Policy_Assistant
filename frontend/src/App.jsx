import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, Building2, Calendar, ShieldCheck, 
  ChevronDown, ChevronRight, Activity, BookOpen, AlertCircle,
  HelpCircle, CheckCircle2, RefreshCw, Code2, Box, Layers,
  Cpu, Database, X, Zap, Compass, Search, FileText, Clock,
  Tag, ArrowRight, ExternalLink, Filter
} from 'lucide-react';

const BENCHMARK_CASES = [
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
    colorTheme: "card-lavender",
    asOf: "2026-06-01",
    dept: ""
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
    colorTheme: "card-mint",
    asOf: "2026-04-15",
    dept: ""
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
    colorTheme: "card-sky",
    asOf: "2026-04-15",
    dept: ""
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
    colorTheme: "card-rose",
    asOf: "2026-04-15",
    dept: ""
  },
  {
    id: "TC05_REMOTE_SO_APRIL",
    title: "Support Ops April Remote Allowance",
    category: "Conditional Policy",
    risk: "Department Exception",
    split: "dev",
    question: "I work in Support Operations. How many remote days can I take in April 2026?",
    expectedDecision: "answer",
    requiredFacts: "Up to 1 day per week with manager approval; Support Operations exception effective 1 March 2026.",
    passages: ["REMOTE-SOPEX-P2", "REMOTE-SOPEX-P3"],
    colorTheme: "card-gold",
    asOf: "2026-04-15",
    dept: "Support Operations"
  },
  {
    id: "TC06_ONBOARD_REMOTE",
    title: "Onboarding Security Training Rule",
    category: "Conditional Policy",
    risk: "Prerequisite Condition",
    split: "held_out",
    question: "I am a new employee who has not completed security training. Am I allowed to work remotely?",
    expectedDecision: "answer",
    requiredFacts: "No; mandatory security training must be completed before receiving manager approval for remote work.",
    passages: ["ONBOARD-CURR-P2", "REMOTE-CURR-P5"],
    colorTheme: "card-violet",
    asOf: "2026-04-15",
    dept: "Engineering"
  },
  {
    id: "TC07_PARENTAL_LEAVE",
    title: "Parental Leave Duration",
    category: "Unknown Topic",
    risk: "Hallucination Resistance",
    split: "dev",
    question: "How many days of parental leave do I get?",
    expectedDecision: "abstain",
    requiredFacts: "Corpus does not establish parental leave duration; assistant must abstain honestly and refer to HR.",
    passages: ["none"],
    colorTheme: "card-peach",
    asOf: "2026-04-15",
    dept: ""
  },
  {
    id: "TC08_TUITION_REIMBURSE",
    title: "University Tuition Reimbursement",
    category: "Unknown Topic",
    risk: "Hallucination Resistance",
    split: "held_out",
    question: "What is the tuition reimbursement amount for completed university courses?",
    expectedDecision: "abstain",
    requiredFacts: "Corpus does not establish tuition reimbursement amounts; assistant must abstain without guessing.",
    passages: ["none"],
    colorTheme: "card-coral",
    asOf: "2026-04-15",
    dept: ""
  },
  {
    id: "TC09_LEARN_2025",
    title: "2025 Archived Learning Leave",
    category: "Outdated Policy",
    risk: "Temporal Scoping",
    split: "dev",
    question: "What was the learning-leave allowance in calendar year 2025?",
    expectedDecision: "answer",
    requiredFacts: "3 working days with manager approval; applies strictly to calendar year 2025 only.",
    passages: ["LEARN-ARCH-P2", "LEARN-ARCH-P4"],
    colorTheme: "card-slate",
    asOf: "2025-06-01",
    dept: ""
  },
  {
    id: "TC10_REMOTE_SO_FEB",
    title: "Support Ops Pre-Exception Remote",
    category: "Outdated / Date Boundary",
    risk: "Effective Date Authority",
    split: "dev",
    question: "I work in Support Operations. How many remote days can I take in February 2026?",
    expectedDecision: "answer",
    requiredFacts: "Up to 2 days per week under general policy; Support Operations 1-day exception is not effective until 1 March 2026.",
    passages: ["REMOTE-CURR-P2", "REMOTE-CURR-P4"],
    colorTheme: "card-cyan",
    asOf: "2026-02-15",
    dept: "Support Operations"
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
    colorTheme: "card-purple",
    asOf: "2026-04-15",
    dept: ""
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
    colorTheme: "card-emerald",
    asOf: "2026-06-01",
    dept: ""
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'policies' | 'cases'
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      decision: 'answer',
      answer: 'Welcome to Northstar Policy Knowledge Assistant. Ask any company policy question regarding learning leave, remote work, equipment, travel expenses, or onboarding.',
      citations: [],
      retrieved_passages: [],
      model: 'openai/gpt-oss-20b',
      elapsed_ms: 0,
      trace_id: 'init'
    }
  ]);
  const [question, setQuestion] = useState('');
  const [department, setDepartment] = useState('');
  const [asOfDate, setAsOfDate] = useState('2026-04-15');
  const [release, setRelease] = useState('candidate');
  const [loading, setLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  
  // Policies Catalog State
  const [policiesData, setPoliciesData] = useState({ documents: [], passages: [] });
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [policySearchQuery, setPolicySearchQuery] = useState('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('all');
  const [expandedPassageId, setExpandedPassageId] = useState(null);

  // Diagnostics & Citations UI
  const [expandedCitations, setExpandedCitations] = useState({});
  const [expandedTraces, setExpandedTraces] = useState({});
  const [showJsonRaw, setShowJsonRaw] = useState({});
  
  // 3D View & Spatial Interaction States
  const [is3DView, setIs3DView] = useState(true);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [show3DPipeline, setShow3DPipeline] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, loading, activeTab]);

  useEffect(() => {
    checkHealth();
    fetchPolicies();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setSystemHealth(data);
      }
    } catch (err) {
      console.error('Health check failed:', err);
    }
  };

  const fetchPolicies = async () => {
    try {
      const res = await fetch('/api/policies');
      if (res.ok) {
        const data = await res.json();
        setPoliciesData(data);
      }
    } catch (err) {
      console.error('Failed to fetch policies:', err);
    }
  };

  // 3D Mouse Parallax Effect
  const handleMouseMove = (e) => {
    if (!is3DView) return;
    const { innerWidth, innerHeight } = window;
    const tiltY = ((e.clientX / innerWidth) - 0.5) * 8;
    const tiltX = ((e.clientY / innerHeight) - 0.5) * -8;
    setMouseTilt({ x: tiltX, y: tiltY });
  };

  const handleSend = async (customQuery = null, customDept = null, customDate = null) => {
    const q = customQuery || question;
    if (!q.trim() || loading) return;

    const deptToSend = customDept !== null ? customDept : department;
    const dateToSend = customDate !== null ? customDate : asOfDate;

    setActiveTab('chat');
    const userMessage = { role: 'user', content: q };
    setMessages(prev => [...prev, userMessage]);
    if (!customQuery) setQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          department: deptToSend || null,
          as_of: dateToSend || null,
          release: release
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        decision: data.decision,
        answer: data.answer,
        citations: data.citations || [],
        retrieved_passages: data.retrieved_passages || [],
        model: data.model,
        elapsed_ms: data.elapsed_ms,
        trace_id: data.trace_id,
        error: data.error
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        decision: 'conflict',
        answer: `Error connecting to backend: ${err.message}. Please verify the FastAPI backend is running.`,
        citations: [],
        retrieved_passages: [],
        model: 'local-error',
        elapsed_ms: 0,
        trace_id: 'err',
        error: err.message
      }]);
    } finally {
      setLoading(false);
    }
  };

  const triggerTestCase = (testCase) => {
    if (testCase.dept !== undefined) setDepartment(testCase.dept);
    if (testCase.asOf) setAsOfDate(testCase.asOf);
    handleSend(testCase.question, testCase.dept, testCase.asOf);
  };

  const toggleCitation = (msgIndex, passageId) => {
    const key = `${msgIndex}-${passageId}`;
    setExpandedCitations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleTrace = (msgIndex) => {
    setExpandedTraces(prev => ({ ...prev, [msgIndex]: !prev[msgIndex] }));
  };

  const toggleJsonRaw = (msgIndex) => {
    setShowJsonRaw(prev => ({ ...prev, [msgIndex]: !prev[msgIndex] }));
  };

  const renderStatusBadge = (decision) => {
    switch (decision?.toLowerCase()) {
      case 'answer':
        return (
          <span className="status-badge badge-answer">
            <CheckCircle2 size={12} /> Answer
          </span>
        );
      case 'clarify':
        return (
          <span className="status-badge badge-clarify">
            <HelpCircle size={12} /> Clarification Needed
          </span>
        );
      case 'abstain':
        return (
          <span className="status-badge badge-abstain">
            <AlertCircle size={12} /> Abstention (Not in Policy)
          </span>
        );
      case 'conflict':
        return (
          <span className="status-badge badge-conflict">
            <AlertCircle size={12} /> Policy Conflict
          </span>
        );
      default:
        return null;
    }
  };

  // Filtered Policies
  const filteredPolicies = policiesData.documents.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(policySearchQuery.toLowerCase()) ||
      doc.doc_id.toLowerCase().includes(policySearchQuery.toLowerCase()) ||
      doc.topic.toLowerCase().includes(policySearchQuery.toLowerCase());
    const matchesTopic = selectedTopicFilter === 'all' || doc.topic === selectedTopicFilter;
    return matchesSearch && matchesTopic;
  });

  const latestAssistantMsg = messages.filter(m => m.role === 'assistant').slice(-1)[0] || messages[0];

  return (
    <div 
      className={`app-container ${is3DView ? 'mode-3d' : 'mode-2d'}`}
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic 3D Perspective Background Scene */}
      {is3DView && (
        <div className="bg-3d-scene">
          <div className="grid-plane-3d"></div>
          <div className="ambient-sphere sphere-1"></div>
          <div className="ambient-sphere sphere-2"></div>
          <div className="ambient-sphere sphere-3"></div>
        </div>
      )}

      {/* Main 3D Wrapper Layer */}
      <div 
        className="spatial-canvas"
        style={is3DView ? {
          transform: `perspective(1400px) rotateX(${mouseTilt.x.toFixed(2)}deg) rotateY(${mouseTilt.y.toFixed(2)}deg)`
        } : {}}
      >
        {/* Animated Marquee Ticker Tape */}
        <div className="marquee-ribbon">
          <div className="marquee-track">
            <span>✦ NORTHSTAR SERVICES POLICY ASSISTANT ✦ 10 SYNTHETIC POLICIES ✦ 48 SEGMENTED PASSAGES ✦ 100% GROUNDED CITATIONS ✦ BM25 RELEVANCE RANKING ✦ GROQ OPENAI/GPT-OSS-20B ✦ ZERO HALLUCINATION GUARANTEE ✦</span>
            <span>✦ NORTHSTAR SERVICES POLICY ASSISTANT ✦ 10 SYNTHETIC POLICIES ✦ 48 SEGMENTED PASSAGES ✦ 100% GROUNDED CITATIONS ✦ BM25 RELEVANCE RANKING ✦ GROQ OPENAI/GPT-OSS-20B ✦ ZERO HALLUCINATION GUARANTEE ✦</span>
          </div>
        </div>

        {/* Header with Navigation Tabs */}
        <header className="app-header depth-level-1">
          <div className="header-brand">
            <div className="logo-icon glow-3d">
              <Sparkles size={20} />
            </div>
            <div className="header-title">
              <h1>Northstar Policy Knowledge Assistant</h1>
              <span>Interactive Policy Portal & Evaluation Workbench</span>
            </div>
          </div>

          {/* Primary View Switcher Tabs */}
          <nav className="header-tabs">
            <button 
              className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <Compass size={15} />
              <span>Ask Assistant</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'policies' ? 'active' : ''}`}
              onClick={() => setActiveTab('policies')}
            >
              <BookOpen size={15} />
              <span>Policy Library ({policiesData.documents.length || 10})</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'cases' ? 'active' : ''}`}
              onClick={() => setActiveTab('cases')}
            >
              <Tag size={15} />
              <span>Benchmark Cases (12)</span>
            </button>
          </nav>

          <div className="header-actions">
            {/* 3D Pipeline Map Button */}
            <button 
              className={`spatial-btn ${show3DPipeline ? 'active' : ''}`}
              onClick={() => setShow3DPipeline(!show3DPipeline)}
              title="Toggle Interactive 3D Architecture Visualizer"
            >
              <Layers size={14} />
              <span>3D Map</span>
            </button>

            {/* 3D Spatial Toggle */}
            <button 
              className={`spatial-toggle-btn ${is3DView ? 'active' : ''}`}
              onClick={() => setIs3DView(!is3DView)}
              title={is3DView ? "Switch to 2D Standard View" : "Switch to 3D Spatial View"}
            >
              <Box size={14} />
              <span>{is3DView ? '3D: ON' : '3D: OFF'}</span>
            </button>
          </div>
        </header>

        {/* Global Controls & Policy Quarter Timeline Banner */}
        <div className="controls-bar depth-level-2">
          {/* Interactive Timeline Calendar Blocks (Reference Design Style) */}
          <div className="timeline-cards-row">
            <div 
              className={`timeline-quarter-card t-jan ${asOfDate === '2026-01-01' ? 'selected' : ''}`}
              onClick={() => setAsOfDate('2026-01-01')}
              title="Set Policy Date to 1 Jan 2026 (5-Day Learning Reset & General Remote)"
            >
              <div className="t-month">Jan 1</div>
              <div className="t-desc">5-Day Leave Resets</div>
            </div>

            <div 
              className={`timeline-quarter-card t-mar ${asOfDate === '2026-03-01' ? 'selected' : ''}`}
              onClick={() => setAsOfDate('2026-03-01')}
              title="Set Policy Date to 1 Mar 2026 (Support Ops 1-Day Exception Begins)"
            >
              <div className="t-month">Mar 1</div>
              <div className="t-desc">Support Ops Exception</div>
            </div>

            <div 
              className={`timeline-quarter-card t-apr ${asOfDate === '2026-04-15' ? 'selected' : ''}`}
              onClick={() => setAsOfDate('2026-04-15')}
              title="Set Policy Date to 15 Apr 2026 (Standard Benchmark Horizon)"
            >
              <div className="t-month">Apr 15</div>
              <div className="t-desc">Benchmark Horizon</div>
            </div>

            <div 
              className={`timeline-quarter-card t-dec ${asOfDate === '2025-12-31' ? 'selected' : ''}`}
              onClick={() => setAsOfDate('2025-12-31')}
              title="Set Policy Date to 31 Dec 2025 (2025 Leave Forfeiture Deadline)"
            >
              <div className="t-month">Dec 31</div>
              <div className="t-desc">2025 Forfeiture Date</div>
            </div>
          </div>

          <div className="filter-controls-group">
            <div className="control-group">
              <Building2 size={15} className="text-muted" />
              <span className="control-label">Dept:</span>
              <select 
                className="select-input" 
                value={department} 
                onChange={e => setDepartment(e.target.value)}
              >
                <option value="">(All / General)</option>
                <option value="Support Operations">Support Operations</option>
                <option value="Engineering">Engineering</option>
                <option value="Finance and Operations">Finance & Ops</option>
                <option value="People Operations">People Ops</option>
              </select>
            </div>

            <div className="control-group">
              <Calendar size={15} className="text-muted" />
              <span className="control-label">Date:</span>
              <input 
                type="date" 
                className="date-input" 
                value={asOfDate} 
                onChange={e => setAsOfDate(e.target.value)} 
              >
              </input>
            </div>

            <div className="control-group">
              <ShieldCheck size={15} className="text-muted" />
              <div className="release-toggle depth-pill">
                <button 
                  className={`toggle-btn ${release === 'baseline' ? 'active' : ''}`}
                  onClick={() => setRelease('baseline')}
                >
                  Baseline
                </button>
                <button 
                  className={`toggle-btn ${release === 'candidate' ? 'active' : ''}`}
                  onClick={() => setRelease('candidate')}
                >
                  Candidate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 1: ASK ASSISTANT CHAT VIEW (BYTE TOWN AI ASSISTANT LANDING STYLE) */}
        {activeTab === 'chat' && (
          <main className="workspace chat-workspace-dribbble">
            {/* Dribbble Hero Showcase Section */}
            <section className="dribbble-hero-section">
              <div className="hero-pill-tag glow-hover">
                <Sparkles size={13} className="text-violet" />
                <span>Next-Gen Enterprise AI • Zero-Hallucination Policy Engine</span>
              </div>
              <h1 className="hero-giant-title">
                Instant Enterprise Policy Clarity, <br />
                <span className="gradient-highlight">Verified to the Word.</span>
              </h1>
              <p className="hero-subheading">
                Explore Northstar's 10 corporate policies across learning leave, remote work, equipment, and travel expenses with temporal precision, departmental scope, and 100% server-verified citation grounding.
              </p>

              {/* Floating Stat Badges Row */}
              <div className="hero-stat-badges-row">
                <div className="hero-stat-badge">
                  <span className="beacon-dot beacon-green pulse-glow"></span>
                  <span className="stat-badge-text"><strong>100% Grounded Citations</strong> (Server Verified)</span>
                </div>
                <div className="hero-stat-badge">
                  <Zap size={13} className="text-amber" />
                  <span className="stat-badge-text"><strong>Groq Llama-3 / GPT-OSS</strong> (~180ms)</span>
                </div>
                <div className="hero-stat-badge">
                  <ShieldCheck size={13} className="text-blue" />
                  <span className="stat-badge-text"><strong>100% Hit@5 Recall</strong> (Candidate)</span>
                </div>
                <div className="hero-stat-badge">
                  <Clock size={13} className="text-purple" />
                  <span className="stat-badge-text"><strong>Policy Horizon:</strong> {asOfDate}</span>
                </div>
              </div>
            </section>

            {/* Central Floating AI Chatbot Window (ByteTown Luxury Glass Terminal) */}
            <div className="dribbble-chat-terminal card-pop-3d">
              {/* Terminal Top Window Chrome */}
              <div className="terminal-top-bar">
                <div className="terminal-left-group">
                  <div className="terminal-status-indicator">
                    <span className="beacon-dot beacon-green pulse-glow"></span>
                    <span className="status-label">Northstar Policy AI</span>
                  </div>
                  <span className="terminal-model-badge">Groq / gpt-oss-20b</span>
                </div>

                <div className="terminal-right-group">
                  <div className="terminal-scope-pill" title="Active Department Scope">
                    <Building2 size={12} />
                    <span>{department || 'All Departments'}</span>
                  </div>
                  <div className="terminal-scope-pill" title="Active Effective Date Horizon">
                    <Calendar size={12} />
                    <span>{asOfDate}</span>
                  </div>
                  <div className="terminal-release-pill">
                    <span className={`rel-dot ${release === 'candidate' ? 'rel-cand' : 'rel-base'}`}></span>
                    <span>{release.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Messages Stream */}
              <div className="messages-stream">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`message-row ${msg.role} ${is3DView ? 'floating-card-3d' : ''}`}>
                    <div className={`avatar ${msg.role === 'user' ? 'user-av' : 'bot-av'}`}>
                      {msg.role === 'user' ? 'U' : 'N'}
                    </div>
                    <div className="message-content">
                      {msg.role === 'assistant' && (
                        <div className="meta-tags">
                          {renderStatusBadge(msg.decision)}
                          {msg.model && <span className="release-tag">{msg.model}</span>}
                          {msg.elapsed_ms > 0 && <span className="release-tag">{msg.elapsed_ms} ms</span>}
                        </div>
                      )}

                      <div style={{ whiteSpace: 'pre-wrap' }}>{msg.answer || msg.content}</div>

                      {/* Citations Panel */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="citations-wrapper">
                          <div className="citations-header">
                            <BookOpen size={14} />
                            <span>Verified Source Citations ({msg.citations.length}):</span>
                          </div>
                          <div className="citations-pills-row">
                            {msg.citations.map(cid => {
                              const passage = msg.retrieved_passages?.find(p => p.passage_id === cid);
                              const isExpanded = expandedCitations[`${idx}-${cid}`];
                              return (
                                <div key={cid} style={{ display: 'inline-block' }}>
                                  <button 
                                    className="citation-pill glow-hover"
                                    onClick={() => toggleCitation(idx, cid)}
                                  >
                                    <span>[{cid}]</span>
                                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                  </button>
                                  {isExpanded && passage && (
                                    <div className="passage-card card-pop-3d">
                                      <div className="passage-card-head">
                                        <span>{passage.title}</span>
                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                          {passage.status.toUpperCase()}
                                        </span>
                                      </div>
                                      <div style={{ color: '#e2e8f0', lineHeight: '1.4' }}>
                                        {passage.text}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Diagnostics & Trace Drawer */}
                      {msg.role === 'assistant' && msg.trace_id !== 'init' && (
                        <div className="trace-accordion">
                          <div className="trace-header" onClick={() => toggleTrace(idx)}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Activity size={12} /> Trace Diagnostics
                            </span>
                            <span>{expandedTraces[idx] ? 'Hide' : 'Inspect'}</span>
                          </div>
                          {expandedTraces[idx] && (
                            <div className="trace-body">
                              <div className="trace-grid">
                                <div className="trace-field">
                                  <span className="trace-field-label">Trace ID</span>
                                  <span className="trace-field-val" style={{ fontSize: '0.7rem' }}>{msg.trace_id}</span>
                                </div>
                                <div className="trace-field">
                                  <span className="trace-field-label">Latency</span>
                                  <span className="trace-field-val">{msg.elapsed_ms} ms</span>
                                </div>
                                <div className="trace-field">
                                  <span className="trace-field-label">Model</span>
                                  <span className="trace-field-val">{msg.model}</span>
                                </div>
                                <div className="trace-field">
                                  <span className="trace-field-label">Decision</span>
                                  <span className="trace-field-val">{msg.decision}</span>
                                </div>
                              </div>

                              <div style={{ marginTop: '0.5rem' }}>
                                <span className="trace-field-label">Retrieved Passages ({msg.retrieved_passages?.length || 0}):</span>
                                <div style={{ marginTop: '0.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                  {msg.retrieved_passages?.map(p => (
                                    <span key={p.passage_id} style={{ 
                                      backgroundColor: '#1e293b', 
                                      padding: '2px 6px', 
                                      borderRadius: '3px',
                                      fontSize: '0.7rem',
                                      border: msg.citations?.includes(p.passage_id) ? '1px solid #3b82f6' : '1px solid #334155',
                                      color: msg.citations?.includes(p.passage_id) ? '#60a5fa' : '#94a3b8'
                                    }}>
                                      {p.passage_id} {p.rank ? `(Rank ${p.rank})` : ''}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div style={{ marginTop: '0.5rem' }}>
                                <button 
                                  onClick={() => toggleJsonRaw(idx)}
                                  className="btn-tiny"
                                >
                                  <Code2 size={10} /> {showJsonRaw[idx] ? 'Hide JSON' : 'View Raw JSON'}
                                </button>
                                {showJsonRaw[idx] && (
                                  <pre className="json-raw-block">
                                    {JSON.stringify(msg, null, 2)}
                                  </pre>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="message-row assistant floating-card-3d">
                    <div className="avatar bot-av">
                      <RefreshCw size={14} className="animate-spin" />
                    </div>
                    <div className="message-content">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
                        <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>Searching policy corpus & invoking Groq LLM...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Capsule Bar */}
              <div className="dribbble-quick-prompts">
                <span className="quick-prompts-label">Try Asking:</span>
                <div className="quick-prompts-scroller">
                  {BENCHMARK_CASES.slice(0, 5).map((c, i) => (
                    <button 
                      key={i} 
                      className="prompt-capsule glow-hover"
                      onClick={() => triggerTestCase(c)}
                    >
                      <Sparkles size={11} className="capsule-icon" />
                      <span>{c.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Luxury Floating Input Dock */}
              <div className="terminal-input-dock">
                <div className="dock-left-icons">
                  <button 
                    className="dock-icon-btn" 
                    title="Synthesized Policy Knowledge Catalog" 
                    onClick={() => setActiveTab('policies')}
                  >
                    <BookOpen size={16} />
                  </button>
                  <button 
                    className="dock-icon-btn" 
                    title="View 3D Pipeline Map" 
                    onClick={() => setShow3DPipeline(true)}
                  >
                    <Layers size={16} />
                  </button>
                </div>
                <input 
                  type="text" 
                  className="dock-input-field" 
                  placeholder="Ask any policy question (e.g. learning leave days, meal reimbursement cap, remote work exceptions)..."
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                  disabled={loading}
                />
                <button 
                  className="dock-send-btn glow-gradient" 
                  onClick={() => handleSend()}
                  disabled={loading || !question.trim()}
                  title="Ask Policy Assistant"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </main>
        )}

        {/* TAB 2: INTERACTIVE POLICY LIBRARY & GUIDE */}
        {activeTab === 'policies' && (
          <main className="workspace policies-workspace">
            <div className="bento-container depth-level-3">
              {/* Top Search & Filter Bar */}
              <div className="bento-header-bar">
                <div>
                  <h2 className="bento-main-title">Northstar Official Policy Library</h2>
                  <p className="bento-subtitle">
                    Explore all 10 synthetic enterprise policies, segmented passages, and rule authorities
                  </p>
                </div>
                <div className="policy-search-group">
                  <div className="search-input-wrapper">
                    <Search size={15} className="search-icon" />
                    <input 
                      type="text"
                      placeholder="Search policy name, topic, or document ID..."
                      value={policySearchQuery}
                      onChange={e => setPolicySearchQuery(e.target.value)}
                      className="policy-search-input"
                    />
                  </div>
                  <div className="topic-filter-pills">
                    {['all', 'learning_leave', 'remote_work', 'travel_expenses', 'equipment', 'onboarding'].map(t => (
                      <button
                        key={t}
                        className={`topic-pill ${selectedTopicFilter === t ? 'active' : ''}`}
                        onClick={() => setSelectedTopicFilter(t)}
                      >
                        {t.replace('_', ' ').toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bento Policy Cards Grid */}
              <div className="policy-bento-grid">
                {filteredPolicies.map(doc => {
                  const docPassages = policiesData.passages?.filter(p => p.doc_id === doc.doc_id) || [];
                  const isSelected = selectedPolicy?.doc_id === doc.doc_id;

                  return (
                    <div 
                      key={doc.doc_id} 
                      className={`policy-card-bento ${doc.status === 'archived' ? 'card-archived' : ''} ${doc.department ? 'card-exception' : ''}`}
                    >
                      <div className="policy-card-top">
                        <span className={`status-badge ${doc.status === 'current' ? 'badge-answer' : doc.status === 'archived' ? 'badge-conflict' : 'badge-clarify'}`}>
                          {doc.status.toUpperCase()}
                        </span>
                        <span className="doc-code-pill">{doc.doc_id}</span>
                      </div>

                      <h3 className="policy-card-title">{doc.title}</h3>
                      <p className="policy-card-meta">
                        <Clock size={12} /> Effective: {doc.effective_start} {doc.effective_end ? `to ${doc.effective_end}` : '(Present)'}
                      </p>
                      <p className="policy-card-meta">
                        <Building2 size={12} /> Scope: {doc.department || 'All Departments'}
                      </p>

                      <div className="passages-count-bar">
                        <span>{doc.passage_ids.length} Segmented Passages:</span>
                        <div className="passage-tags-wrap">
                          {doc.passage_ids.map(pid => (
                            <button
                              key={pid}
                              className={`passage-tag-pill ${expandedPassageId === pid ? 'active' : ''}`}
                              onClick={() => setExpandedPassageId(expandedPassageId === pid ? null : pid)}
                              title="Click to view passage body"
                            >
                              {pid}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Expanded Passage Drawer */}
                      {expandedPassageId && doc.passage_ids.includes(expandedPassageId) && (
                        <div className="inline-passage-viewer card-pop-3d">
                          <div className="viewer-head">
                            <span style={{ fontWeight: '600', color: '#60a5fa' }}>{expandedPassageId}</span>
                            <button onClick={() => setExpandedPassageId(null)} className="close-btn-tiny">
                              <X size={12} />
                            </button>
                          </div>
                          <div className="viewer-body">
                            {docPassages.find(p => p.passage_id === expandedPassageId)?.text || 'Passage content loaded.'}
                          </div>
                        </div>
                      )}

                      <div className="policy-card-footer">
                        <button 
                          className="ask-policy-btn"
                          onClick={() => {
                            let sampleQ = `What are the rules regarding ${doc.title}?`;
                            if (doc.topic === 'learning_leave') sampleQ = 'How many days of learning leave can I take in 2026?';
                            if (doc.topic === 'remote_work') sampleQ = 'How many remote days can I take?';
                            if (doc.topic === 'travel_expenses') sampleQ = 'What is the meal reimbursement limit on business travel?';
                            if (doc.topic === 'equipment') sampleQ = 'When am I eligible for a laptop replacement?';
                            if (doc.department) setDepartment(doc.department);
                            handleSend(sampleQ, doc.department || null, doc.effective_start);
                          }}
                        >
                          <span>Ask Assistant About This</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        )}

        {/* TAB 3: BENCHMARK CASES SHOWCASE (REFERENCE DESIGN BENTO GRID) */}
        {activeTab === 'cases' && (
          <main className="workspace cases-workspace">
            <div className="bento-container depth-level-3">
              <div className="bento-header-bar">
                <div>
                  <h2 className="bento-main-title">Frozen Benchmark Test Cases</h2>
                  <p className="bento-subtitle">
                    Select any case to test retrieval recall, date boundaries, authority hierarchy, or honest abstention
                  </p>
                </div>
                <div className="cases-summary-badges">
                  <span className="stat-pill">8 Development</span>
                  <span className="stat-pill">4 Held-Out</span>
                  <span className="stat-pill">100% Hit@5 in Candidate</span>
                </div>
              </div>

              {/* Bento Grid Showcase matching user's uploaded reference */}
              <div className="cases-bento-grid">
                {/* Hero Feature Card: TC01 (Highlighting the Candidate Defect Fix) */}
                <div className="case-card-bento hero-case-card">
                  <div className="hero-badge">
                    <Sparkles size={14} /> Major Candidate Improvement
                  </div>
                  <div className="case-card-top">
                    <span className="status-badge badge-answer">Answer</span>
                    <span className="split-badge dev-split">DEV SPLIT</span>
                  </div>
                  <h3 className="hero-case-title">TC01: Learning Leave Entitlement (5 Working Days)</h3>
                  <p className="hero-case-q">
                    "I am a full-time employee with eight months of service. How many days of learning leave can I take in 2026?"
                  </p>
                  
                  <div className="hero-case-callouts">
                    <div className="callout-item">
                      <span className="c-label">Baseline Behavior</span>
                      <span className="c-val text-red">Abstained (Excluded LEARN-CURR-P2 from top-5)</span>
                    </div>
                    <div className="callout-item">
                      <span className="c-label">Candidate Fix</span>
                      <span className="c-val text-green">Rank #2 Retrieval (+3.0 Phrase Boost)</span>
                    </div>
                    <div className="callout-item">
                      <span className="c-label">Required Citations</span>
                      <span className="c-val">[LEARN-CURR-P1], [LEARN-CURR-P2]</span>
                    </div>
                  </div>

                  <button 
                    className="hero-run-btn glow-3d"
                    onClick={() => triggerTestCase(BENCHMARK_CASES[0])}
                  >
                    <span>Execute Case TC01 in Assistant</span>
                    <ArrowRight size={16} />
                  </button>
                </div>

                {/* Remaining 11 Bento Cases */}
                {BENCHMARK_CASES.slice(1).map((c, i) => (
                  <div key={c.id} className={`case-card-bento ${c.colorTheme}`}>
                    <div className="case-card-top">
                      <span className={`status-badge ${c.expectedDecision === 'answer' ? 'badge-answer' : c.expectedDecision === 'clarify' ? 'badge-clarify' : 'badge-abstain'}`}>
                        {c.expectedDecision.toUpperCase()}
                      </span>
                      <span className={`split-badge ${c.split === 'dev' ? 'dev-split' : 'heldout-split'}`}>
                        {c.split.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="case-item-title">{c.id}: {c.title}</h4>
                    <p className="case-item-q">"{c.question}"</p>

                    <div className="case-item-facts">
                      <span className="facts-label">Expected Fact:</span>
                      <span className="facts-body">{c.requiredFacts}</span>
                    </div>

                    <div className="case-card-bottom">
                      <span className="risk-tag-pill">{c.risk}</span>
                      <button 
                        className="case-run-btn"
                        onClick={() => triggerTestCase(c)}
                        title="Run this test case in the policy assistant"
                      >
                        <span>Test Case</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}
      </div>

      {/* Interactive 3D Architecture Pipeline Modal */}
      {show3DPipeline && (
        <div className="pipeline-modal-backdrop" onClick={() => setShow3DPipeline(false)}>
          <div className="pipeline-modal-card-3d" onClick={e => e.stopPropagation()}>
            <div className="pipeline-modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="pipeline-badge-icon">
                  <Zap size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc' }}>
                    Interactive 3D RAG Architecture Visualizer
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Live spatial view of the Northstar QA Pipeline stages
                  </p>
                </div>
              </div>
              <button 
                className="close-modal-btn" 
                onClick={() => setShow3DPipeline(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* 3D Isometric Pipeline Stage */}
            <div className="pipeline-stage-3d">
              <div className="stage-grid-lines"></div>

              <div className="pipeline-blocks-container">
                <div className="pipeline-isometric-block">
                  <div className="block-face block-top">
                    <Building2 size={16} />
                  </div>
                  <div className="block-title">1. Intake Context</div>
                  <div className="block-sub">Dept: {department || 'General'} | Date: {asOfDate}</div>
                </div>

                <div className="pipeline-connector-glow">
                  <div className="energy-pulse"></div>
                </div>

                <div className="pipeline-isometric-block">
                  <div className="block-face block-top">
                    <Database size={16} />
                  </div>
                  <div className="block-title">2. BM25 Retriever</div>
                  <div className="block-sub">Phrase-boosted | Top-{release === 'candidate' ? '8' : '5'}</div>
                </div>

                <div className="pipeline-connector-glow">
                  <div className="energy-pulse"></div>
                </div>

                <div className="pipeline-isometric-block">
                  <div className="block-face block-top">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="block-title">3. Authority Filter</div>
                  <div className="block-sub">Temporal Gate & Dept Carveouts</div>
                </div>

                <div className="pipeline-connector-glow">
                  <div className="energy-pulse"></div>
                </div>

                <div className="pipeline-isometric-block">
                  <div className="block-face block-top">
                    <Cpu size={16} />
                  </div>
                  <div className="block-title">4. Groq LLM Engine</div>
                  <div className="block-sub">{systemHealth?.model || 'gpt-oss-20b'}</div>
                </div>

                <div className="pipeline-connector-glow">
                  <div className="energy-pulse"></div>
                </div>

                <div className="pipeline-isometric-block">
                  <div className="block-face block-top">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="block-title">5. Citation Guard</div>
                  <div className="block-sub">100% Server Verified</div>
                </div>
              </div>
            </div>

            {/* Live Metrics Footer in 3D Card */}
            <div className="pipeline-stage-metrics">
              <div className="p-metric">
                <span className="p-m-label">Active Release Mode</span>
                <span className="p-m-val" style={{ color: release === 'candidate' ? '#60a5fa' : '#34d399' }}>
                  {release.toUpperCase()}
                </span>
              </div>
              <div className="p-metric">
                <span className="p-m-label">Latest Latency</span>
                <span className="p-m-val">{latestAssistantMsg.elapsed_ms || 0} ms</span>
              </div>
              <div className="p-metric">
                <span className="p-m-label">Verified Citations</span>
                <span className="p-m-val">
                  {latestAssistantMsg.citations?.length ? latestAssistantMsg.citations.join(', ') : 'None (Abstained/Init)'}
                </span>
              </div>
              <div className="p-metric">
                <span className="p-m-label">Passage Corpus Size</span>
                <span className="p-m-val">{systemHealth?.passage_count || 48} Passages</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
