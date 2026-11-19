import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, Building2, Calendar, ShieldCheck, 
  ChevronDown, ChevronRight, Activity, BookOpen, AlertCircle,
  HelpCircle, CheckCircle2, RefreshCw, Code2, Layers,
  ExternalLink, ArrowRight, Compass, Zap
} from 'lucide-react';
import AssistantAvatar3D from './AssistantAvatar3D';

const QUESTION_SETS = [
  // Set 1: Entitlement, Finance & Hardware
  [
    {
      id: "sample-1",
      title: "Learning Leave 2026",
      desc: "5 days annual allowance & 6-month tenure",
      q: "I am a full-time employee with eight months of service. How many days of learning leave can I take in 2026?",
      dept: "",
      date: "2026-06-01",
      tag: "Entitlement",
      colorTheme: "theme-purple"
    },
    {
      id: "sample-2",
      title: "Travel Meal Cap",
      desc: "CAD 35 per diem & alcohol exclusion",
      q: "What is the meal reimbursement limit on approved business travel?",
      dept: "",
      date: "2026-04-15",
      tag: "Finance",
      colorTheme: "theme-green"
    },
    {
      id: "sample-3",
      title: "Laptop Replacement",
      desc: "36-month cycle & IT failure proof",
      q: "When am I eligible for a laptop replacement?",
      dept: "",
      date: "2026-04-15",
      tag: "Hardware",
      colorTheme: "theme-blue"
    },
    {
      id: "sample-4",
      title: "Support Ops Remote",
      desc: "1 day/week exception effective March 1",
      q: "I work in Support Operations. How many remote days can I take in April 2026?",
      dept: "Support Operations",
      date: "2026-04-15",
      tag: "Exception",
      colorTheme: "theme-amber"
    }
  ],
  // Set 2: Compliance, Onboarding & Security
  [
    {
      id: "sample-5",
      title: "Expense Receipt Deadline",
      desc: "30 calendar days submission deadline",
      q: "How many days do I have to submit meal receipts after business travel?",
      dept: "",
      date: "2026-04-15",
      tag: "Compliance",
      colorTheme: "theme-rose"
    },
    {
      id: "sample-6",
      title: "Security Training Rule",
      desc: "Mandatory prerequisite for remote work",
      q: "I am a new employee who has not completed security training. Am I allowed to work remotely?",
      dept: "Engineering",
      date: "2026-04-15",
      tag: "Onboarding",
      colorTheme: "theme-indigo"
    },
    {
      id: "sample-7",
      title: "Meal Alcohol Policy",
      desc: "Strictly excluded from company claims",
      q: "Can I expense alcoholic drinks during business travel dinners?",
      dept: "Finance and Operations",
      date: "2026-04-15",
      tag: "Finance",
      colorTheme: "theme-cyan"
    },
    {
      id: "sample-8",
      title: "Probation Remote Rules",
      desc: "In-office requirements during first 90 days",
      q: "Can probationary employees work remotely before completing 90 days?",
      dept: "",
      date: "2026-04-15",
      tag: "People Ops",
      colorTheme: "theme-emerald"
    }
  ],
  // Set 3: Lifecycle, Rollover & Approvals
  [
    {
      id: "sample-9",
      title: "Hardware Refresh Cycle",
      desc: "Standard 3-year IT hardware lifecycle",
      q: "What is the standard cycle for replacing corporate laptops?",
      dept: "Engineering",
      date: "2026-04-15",
      tag: "Hardware",
      colorTheme: "theme-blue"
    },
    {
      id: "sample-10",
      title: "Travel Pre-Approval",
      desc: "Manager signoff required prior to travel",
      q: "Do I need manager pre-approval before booking business flights and hotels?",
      dept: "Finance and Operations",
      date: "2026-04-15",
      tag: "Travel",
      colorTheme: "theme-orange"
    },
    {
      id: "sample-11",
      title: "Leave Rollover Policy",
      desc: "Unused days forfeit Dec 31 each year",
      q: "Do unused learning leave days roll over into the next calendar year?",
      dept: "",
      date: "2026-04-15",
      tag: "Entitlement",
      colorTheme: "theme-purple"
    },
    {
      id: "sample-12",
      title: "Incident Reporting",
      desc: "IT security notice within 24 hours",
      q: "How quickly must a lost or stolen laptop be reported to IT security?",
      dept: "Engineering",
      date: "2026-04-15",
      tag: "Security",
      colorTheme: "theme-rose"
    }
  ]
];

export default function ChatAssistantView({
  messages,
  question,
  setQuestion,
  onSend,
  loading,
  department,
  asOfDate,
  release,
  is3DView,
  expandedCitations,
  toggleCitation,
  expandedTraces,
  toggleTrace,
  showJsonRaw,
  toggleJsonRaw,
  onOpenMap
}) {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Dynamic Fade Out & In State for Sample Questions
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [fadeState, setFadeState] = useState('in'); // 'in' | 'out'
  const [isHovered, setIsHovered] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Transition helper: Fades out, updates set, then fades in
  const transitionToSet = (newIndex) => {
    if (fadeState === 'out') return;
    setFadeState('out');
    setTimeout(() => {
      setActiveSetIndex(newIndex);
      setFadeState('in');
    }, 350);
  };

  const handleNextSet = () => {
    const next = (activeSetIndex + 1) % QUESTION_SETS.length;
    transitionToSet(next);
  };

  // Auto-cycle through question sets every 6.5s (pauses on hover)
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      handleNextSet();
    }, 6500);
    return () => clearInterval(timer);
  }, [isHovered, activeSetIndex, fadeState]);

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (question && question.trim() && !loading) {
      onSend();
    }
  };

  const handleSuggestedClick = (sq) => {
    onSend(sq.q, sq.dept, sq.date);
  };

  const currentQuestions = QUESTION_SETS[activeSetIndex] || QUESTION_SETS[0];

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

  return (
    <main className="workspace chat-workspace-split">
      {/* LEFT CORNER: Sample Questions aligned Top to Bottom with Dynamic Fade Out & In Effect */}
      <aside 
        className="sample-questions-left-column"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="sample-questions-header">
          <div className="sq-title-wrap">
            <Sparkles size={14} className="text-indigo" />
            <span>Sample Questions</span>
          </div>

          <div className="sq-controls-row">
            {/* Interactive Dot Indicators with Fade Transition */}
            <div className="sq-dots-indicator" title="Switch sample question sets">
              {QUESTION_SETS.map((_, idx) => (
                <span 
                  key={idx}
                  className={`sq-dot ${activeSetIndex === idx ? 'active' : ''}`}
                  onClick={() => transitionToSet(idx)}
                />
              ))}
            </div>

            {/* Manual Cycle Button with Fade Out & In */}
            <button 
              type="button" 
              className={`sq-cycle-btn ${fadeState === 'out' ? 'rotating' : ''}`}
              onClick={handleNextSet}
              title="Next Sample Questions (Fade Out & In)"
            >
              <RefreshCw size={11} />
            </button>
          </div>
        </div>

        {/* Dynamic List with Fade Out & In Classes */}
        <div className={`sample-questions-list fade-${fadeState}`}>
          {currentQuestions.map(sq => (
            <button
              key={sq.id}
              type="button"
              className={`sample-q-card ${sq.colorTheme} card-pop-3d`}
              onClick={() => handleSuggestedClick(sq)}
              title={`Click to ask: "${sq.q}"`}
            >
              <div className="sample-q-card-head">
                <span className="sample-q-tag">{sq.tag}</span>
                <ArrowRight size={12} className="sample-q-arrow" />
              </div>
              <div className="sample-q-title">{sq.title}</div>
              <div className="sample-q-desc">{sq.desc}</div>
            </button>
          ))}
        </div>
      </aside>

      {/* CENTERPIECE: Main Chatbot Command Center */}
      <div className="chat-main-column">
        {/* Prominent Centerpiece Header Bar */}
        <div className="chat-window-header-pill-row">
          <div className="centerpiece-left-title">
            <div className="ask-assistant-hero-pill glow-3d">
              <div className="hero-pill-icon-circle">
                <Compass size={15} />
              </div>
              <span>Ask Assistant</span>
            </div>
            <span className="chat-window-subtitle">
              Enterprise Policy Intelligence • Verified to the word
            </span>
          </div>

          <div className="centerpiece-quick-scopes">
            <span className="scope-micro-badge"><Building2 size={11} /> {department || 'All Departments'}</span>
            <span className="scope-micro-badge"><Calendar size={11} /> {asOfDate}</span>
          </div>
        </div>

        {/* Central Chat Terminal — Visual Centerpiece with Rich Dark Blue Background */}
        <div className={`central-chat-terminal ${is3DView ? 'element-3d-card' : ''}`}>
          {/* Terminal Header Chrome */}
          <div className="terminal-top-bar">
            <div className="terminal-left-group">
              <AssistantAvatar3D is3DView={is3DView} loading={loading} size={40} />
              <div className="terminal-assistant-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="status-label">Northstar Policy AI</span>
                  <span className="beacon-dot beacon-green pulse-glow"></span>
                  <span className="ready-text">Grounded & Active</span>
                </div>
                <span className="terminal-model-badge">Groq • gpt-oss-20b</span>
              </div>
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
              <div className="terminal-release-pill" title="RAG Mode">
                <span className={`rel-dot ${release === 'candidate' ? 'rel-cand' : 'rel-base'}`}></span>
                <span>{release.toUpperCase()} (Phrase Boosted)</span>
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="messages-stream">
            {/* Visual Centerpiece Hero Card (shown initially) with Rich Dark Blue Glass and Highlighted Writing */}
            {messages.length === 1 && messages[0].trace_id === 'init' && (
              <div className="chat-centerpiece-welcome anim-entrance">
                <div className="welcome-avatar-spot">
                  <AssistantAvatar3D is3DView={is3DView} loading={false} size={56} />
                </div>
                <h2 className="welcome-hero-title">Northstar Policy AI Center</h2>
                <p className="welcome-hero-desc">
                  Your verified digital guide to Northstar Services corporate policies. Get precise, instant answers on <span className="highlight-pill hp-purple">Annual Learning Leave</span>, <span className="highlight-pill hp-amber">Hybrid & Remote Schedules</span>, <span className="highlight-pill hp-green">Meal Per Diem Claims</span>, <span className="highlight-pill hp-blue">Equipment Refresh</span>, and <span className="highlight-pill hp-rose">Security Prerequisites</span>.
                </p>
                <div className="welcome-badges-row">
                  <span className="welcome-badge badge-emerald-glow">
                    <ShieldCheck size={13} className="text-emerald" /> 100% Server-Verified Citations
                  </span>
                  <span className="welcome-badge badge-amber-glow">
                    <Zap size={13} className="text-amber" /> Groq High-Speed Inference
                  </span>
                  <span className="welcome-badge badge-indigo-glow">
                    <BookOpen size={13} className="text-indigo" /> 10 Active & Historical Policies
                  </span>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`message-row ${msg.role} ${is3DView ? 'floating-card-3d' : ''} anim-entrance`}
              >
                <div className={`avatar ${msg.role === 'user' ? 'user-av' : 'bot-av'}`}>
                  {msg.role === 'user' ? 'U' : (
                    <AssistantAvatar3D is3DView={false} loading={false} size={28} />
                  )}
                </div>

                <div className="message-content">
                  {msg.role === 'assistant' && (
                    <div className="meta-tags">
                      {renderStatusBadge(msg.decision)}
                      {msg.model && <span className="release-tag">{msg.model}</span>}
                      {msg.elapsed_ms > 0 && <span className="release-tag">{msg.elapsed_ms} ms</span>}
                      <span className="release-tag mode-tag">RAG: {release.toUpperCase()}</span>
                    </div>
                  )}

                  <div className="message-text-body">{msg.answer || msg.content}</div>

                  {/* Citations Panel */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="citations-wrapper">
                      <div className="citations-header">
                        <BookOpen size={14} className="text-indigo" />
                        <span>Verified Policy Sources ({msg.citations.length}):</span>
                      </div>
                      <div className="citations-pills-row">
                        {msg.citations.map(cid => {
                          const passage = msg.retrieved_passages?.find(p => p.passage_id === cid);
                          const isExpanded = expandedCitations[`${idx}-${cid}`];
                          return (
                            <div key={cid} style={{ display: 'inline-block' }}>
                              <button 
                                type="button"
                                className="citation-pill glow-hover"
                                onClick={() => toggleCitation(idx, cid)}
                                title="Click to view full passage text"
                              >
                                <span>[{cid}]</span>
                                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                              </button>
                              {isExpanded && passage && (
                                <div className="passage-card card-pop-3d glass-panel-3d">
                                  <div className="passage-card-head">
                                    <span>{passage.title}</span>
                                    <span className="passage-card-status">
                                      {passage.status.toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="passage-card-body">
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
                                <span key={p.passage_id} className="retrieved-tag-chip">
                                  {p.passage_id} {p.rank ? `(Rank ${p.rank})` : ''}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div style={{ marginTop: '0.5rem' }}>
                            <button 
                              type="button"
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

            {/* Typing Indicator */}
            {loading && (
              <div className="message-row assistant floating-card-3d anim-entrance">
                <div className="avatar bot-av">
                  <AssistantAvatar3D is3DView={false} loading={true} size={28} />
                </div>
                <div className="message-content">
                  <div className="typing-indicator-box">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <span className="typing-text">Retrieving grounding passages & generating verified response...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Modern Interactive Form Input Dock */}
          <form 
            className="terminal-input-dock glass-panel-3d"
            onSubmit={handleSubmit}
          >
            <div className="dock-left-icons">
              <button 
                type="button"
                className="dock-icon-btn" 
                title="View 3D Policy Universe Map" 
                onClick={onOpenMap}
              >
                <Layers size={16} />
              </button>
            </div>
            <input 
              ref={inputRef}
              type="text" 
              className="dock-input-field" 
              placeholder="Ask any policy question (e.g. learning leave days, meal reimbursement cap, remote work exceptions)..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button 
              type="submit"
              className="dock-send-btn glow-gradient" 
              disabled={loading || !question.trim()}
              title="Ask Policy Assistant"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
