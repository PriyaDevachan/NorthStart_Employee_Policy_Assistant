import React, { useRef, useEffect } from 'react';
import { 
  Send, Sparkles, Building2, Calendar, ShieldCheck, 
  ChevronDown, ChevronRight, Activity, BookOpen, AlertCircle,
  HelpCircle, CheckCircle2, RefreshCw, Code2, Layers,
  ExternalLink, ArrowRight, CornerDownLeft
} from 'lucide-react';
import AssistantAvatar3D from './AssistantAvatar3D';

const SUGGESTED_QUESTIONS = [
  {
    title: "Learning Leave 2026",
    desc: "Annual allowance & service requirements",
    q: "I am a full-time employee with eight months of service. How many days of learning leave can I take in 2026?",
    dept: "",
    date: "2026-06-01",
    tag: "Entitlement"
  },
  {
    title: "Travel Meal Cap",
    desc: "Per diem limit & alcohol rules",
    q: "What is the meal reimbursement limit on approved business travel?",
    dept: "",
    date: "2026-04-15",
    tag: "Finance"
  },
  {
    title: "Laptop Replacement",
    desc: "36 months cycle & hardware failures",
    q: "When am I eligible for a laptop replacement?",
    dept: "",
    date: "2026-04-15",
    tag: "IT & Hardware"
  },
  {
    title: "Support Ops Remote",
    desc: "1 day exception effective 1 March 2026",
    q: "I work in Support Operations. How many remote days can I take in April 2026?",
    dept: "Support Operations",
    date: "2026-04-15",
    tag: "Department Exception"
  }
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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
    <main className="workspace chat-workspace-centered">
      <div className={`central-chat-terminal glass-panel-3d ${is3DView ? 'element-3d-card' : ''}`}>
        {/* Terminal Header Chrome */}
        <div className="terminal-top-bar">
          <div className="terminal-left-group">
            <AssistantAvatar3D is3DView={is3DView} loading={loading} size={42} />
            <div className="terminal-assistant-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="status-label">Northstar Policy AI</span>
                <span className="beacon-dot beacon-green pulse-glow"></span>
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
              <span>{release.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="messages-stream">
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
                  <span className="typing-text">Retrieving passages & verifying authority with Groq LLM...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Question Cards */}
        <div className="suggested-questions-tray">
          <span className="suggested-label">Suggested Questions (Click to Ask):</span>
          <div className="suggested-cards-scroller">
            {SUGGESTED_QUESTIONS.map((sq, i) => (
              <button 
                key={i} 
                type="button"
                className="suggested-card glass-panel-3d"
                onClick={() => handleSuggestedClick(sq)}
              >
                <div className="s-card-top">
                  <span className="s-card-tag">{sq.tag}</span>
                  <Sparkles size={11} className="text-indigo" />
                </div>
                <div className="s-card-title">{sq.title}</div>
                <div className="s-card-desc">{sq.desc}</div>
              </button>
            ))}
          </div>
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
    </main>
  );
}
