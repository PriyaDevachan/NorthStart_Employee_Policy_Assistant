import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, Building2, Calendar, ShieldCheck, 
  ChevronDown, ChevronRight, Activity, BookOpen, AlertCircle,
  HelpCircle, CheckCircle2, RefreshCw, Code2, Box, Layers,
  Cpu, Database, X, Zap
} from 'lucide-react';

export default function App() {
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
  const [release, setRelease] = useState('baseline');
  const [loading, setLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [expandedCitations, setExpandedCitations] = useState({});
  const [expandedTraces, setExpandedTraces] = useState({});
  const [showJsonRaw, setShowJsonRaw] = useState({});
  
  // 3D View & Spatial Interaction States
  const [is3DView, setIs3DView] = useState(true);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [show3DPipeline, setShow3DPipeline] = useState(false);
  const [selectedPipelineNode, setSelectedPipelineNode] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    checkHealth();
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

  // 3D Mouse Parallax Effect
  const handleMouseMove = (e) => {
    if (!is3DView) return;
    const { innerWidth, innerHeight } = window;
    const tiltY = ((e.clientX / innerWidth) - 0.5) * 10; // max +/- 5 deg
    const tiltX = ((e.clientY / innerHeight) - 0.5) * -10; // max +/- 5 deg
    setMouseTilt({ x: tiltX, y: tiltY });
  };

  const handleSend = async (customQuery = null) => {
    const q = customQuery || question;
    if (!q.trim() || loading) return;

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
          department: department || null,
          as_of: asOfDate || null,
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

  const samplePrompts = [
    { label: "S1: Learning leave 2026", q: "I am full-time, have worked eight months, and want learning leave in 2026. How many days?" },
    { label: "S2: Learning leave 2025", q: "What was the learning-leave allowance in 2025?" },
    { label: "S3: Support Ops Remote", q: "I work in Support Operations. How many remote days can I take in April 2026?", dept: "Support Operations", date: "2026-04-15" },
    { label: "S5: Travel Meal Limit", q: "What is the meal limit on approved business travel?" },
    { label: "S6: Parental leave (Unknown)", q: "How many days of parental leave do I get?" },
    { label: "RAG-001: Part-time", q: "I am a part-time employee with eight months of service. Am I eligible for learning leave?" }
  ];

  const latestAssistantMsg = messages.filter(m => m.role === 'assistant').slice(-1)[0] || messages[0];

  return (
    <div 
      className={`app-container ${is3DView ? 'mode-3d' : 'mode-2d'}`}
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic 3D Perspective Background Elements */}
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
        {/* Header with 3D Depth */}
        <header className="app-header depth-level-1">
          <div className="header-brand">
            <div className="logo-icon glow-3d">
              <Sparkles size={20} />
            </div>
            <div className="header-title">
              <h1>Northstar Policy Knowledge Assistant</h1>
              <span>AI Quality Engineering & Policy RAG System</span>
            </div>
          </div>

          <div className="header-actions">
            {/* 3D Pipeline Visualizer Toggle */}
            <button 
              className={`spatial-btn ${show3DPipeline ? 'active' : ''}`}
              onClick={() => setShow3DPipeline(!show3DPipeline)}
              title="Toggle Interactive 3D Architecture Pipeline Visualizer"
            >
              <Layers size={15} />
              <span>3D Architecture Map</span>
            </button>

            {/* 3D View Mode Toggle */}
            <button 
              className={`spatial-toggle-btn ${is3DView ? 'active' : ''}`}
              onClick={() => setIs3DView(!is3DView)}
              title={is3DView ? "Switch to 2D Standard View" : "Switch to 3D Spatial View"}
            >
              <Box size={16} />
              <span>{is3DView ? '3D View: ON' : '3D View: OFF'}</span>
            </button>

            <div className="system-status">
              <span className="status-dot"></span>
              <span>
                {systemHealth 
                  ? `${systemHealth.document_count} Policies | ${systemHealth.passage_count} Passages | ${systemHealth.model}`
                  : 'Connecting...'}
              </span>
            </div>
          </div>
        </header>

        {/* Controls Bar with 3D Float */}
        <div className="controls-bar depth-level-2">
          <div className="control-group">
            <Building2 size={16} className="text-muted" />
            <span className="control-label">Department:</span>
            <select 
              className="select-input" 
              value={department} 
              onChange={e => setDepartment(e.target.value)}
            >
              <option value="">(All Departments / General)</option>
              <option value="Support Operations">Support Operations</option>
              <option value="Engineering">Engineering</option>
              <option value="Finance and Operations">Finance and Operations</option>
              <option value="People Operations">People Operations</option>
            </select>
          </div>

          <div className="control-group">
            <Calendar size={16} className="text-muted" />
            <span className="control-label">Policy Date:</span>
            <input 
              type="date" 
              className="date-input" 
              value={asOfDate} 
              onChange={e => setAsOfDate(e.target.value)} 
            />
          </div>

          <div className="control-group" style={{ marginLeft: 'auto' }}>
            <ShieldCheck size={16} className="text-muted" />
            <span className="control-label">Release:</span>
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

        {/* Main Workspace */}
        <main className="workspace">
          <div className="chat-panel depth-level-3">
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

                    {/* Citations Panel with 3D Depth */}
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
                                style={{ 
                                  background: 'transparent', 
                                  border: '1px solid #334155', 
                                  color: '#94a3b8', 
                                  borderRadius: '4px', 
                                  padding: '2px 6px', 
                                  fontSize: '0.68rem',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Code2 size={10} /> {showJsonRaw[idx] ? 'Hide JSON' : 'View Raw JSON'}
                              </button>
                              {showJsonRaw[idx] && (
                                <pre style={{ 
                                  marginTop: '0.4rem', 
                                  padding: '0.5rem', 
                                  backgroundColor: '#020617', 
                                  borderRadius: '4px', 
                                  overflowX: 'auto',
                                  fontSize: '0.68rem'
                                }}>
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
                      <span>Searching policy corpus & invoking Groq LLM in 3D pipeline...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="quick-prompts depth-level-1">
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', fontWeight: '600' }}>
                Quick Tests:
              </span>
              {samplePrompts.map((p, i) => (
                <button 
                  key={i} 
                  className="prompt-pill glow-hover"
                  onClick={() => {
                    if (p.dept) setDepartment(p.dept);
                    if (p.date) setAsOfDate(p.date);
                    handleSend(p.q);
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input Bar with 3D Elevation */}
            <div className="chat-input-bar depth-level-2">
              <input 
                type="text" 
                className="input-box" 
                placeholder="Ask an employee policy question (e.g. learning leave, travel meals, remote days)..."
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                disabled={loading}
              />
              <button 
                className="send-btn glow-3d" 
                onClick={() => handleSend()}
                disabled={loading || !question.trim()}
              >
                <Send size={16} />
                <span>Ask Policy Assistant</span>
              </button>
            </div>
          </div>
        </main>
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
                {/* Node 1 */}
                <div 
                  className={`pipeline-isometric-block ${selectedPipelineNode === 1 ? 'selected' : ''}`}
                  onClick={() => setSelectedPipelineNode(1)}
                >
                  <div className="block-face block-top">
                    <Building2 size={16} />
                  </div>
                  <div className="block-title">1. Intake Context</div>
                  <div className="block-sub">Dept: {department || 'General'} | Date: {asOfDate}</div>
                </div>

                <div className="pipeline-connector-glow">
                  <div className="energy-pulse"></div>
                </div>

                {/* Node 2 */}
                <div 
                  className={`pipeline-isometric-block ${selectedPipelineNode === 2 ? 'selected' : ''}`}
                  onClick={() => setSelectedPipelineNode(2)}
                >
                  <div className="block-face block-top">
                    <Database size={16} />
                  </div>
                  <div className="block-title">2. BM25 Retriever</div>
                  <div className="block-sub">Phrase-boosted | Top-{release === 'candidate' ? '8' : '5'}</div>
                </div>

                <div className="pipeline-connector-glow">
                  <div className="energy-pulse"></div>
                </div>

                {/* Node 3 */}
                <div 
                  className={`pipeline-isometric-block ${selectedPipelineNode === 3 ? 'selected' : ''}`}
                  onClick={() => setSelectedPipelineNode(3)}
                >
                  <div className="block-face block-top">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="block-title">3. Authority Filter</div>
                  <div className="block-sub">Temporal Gate & Dept Carveouts</div>
                </div>

                <div className="pipeline-connector-glow">
                  <div className="energy-pulse"></div>
                </div>

                {/* Node 4 */}
                <div 
                  className={`pipeline-isometric-block ${selectedPipelineNode === 4 ? 'selected' : ''}`}
                  onClick={() => setSelectedPipelineNode(4)}
                >
                  <div className="block-face block-top">
                    <Cpu size={16} />
                  </div>
                  <div className="block-title">4. Groq LLM Engine</div>
                  <div className="block-sub">{systemHealth?.model || 'gpt-oss-20b'}</div>
                </div>

                <div className="pipeline-connector-glow">
                  <div className="energy-pulse"></div>
                </div>

                {/* Node 5 */}
                <div 
                  className={`pipeline-isometric-block ${selectedPipelineNode === 5 ? 'selected' : ''}`}
                  onClick={() => setSelectedPipelineNode(5)}
                >
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
