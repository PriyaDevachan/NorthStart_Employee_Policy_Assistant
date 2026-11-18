import React, { useState, useEffect } from 'react';
import { 
  Compass, BookOpen, Tag, Layers, Box, Sparkles, 
  Building2, Calendar, ShieldCheck, Zap, X, Database, Cpu, CheckCircle2
} from 'lucide-react';

import Background3D from './components/Background3D';
import ChatAssistantView from './components/ChatAssistantView';
import PolicyLibraryView from './components/PolicyLibraryView';
import BenchmarkDashboard, { BENCHMARK_CASES } from './components/BenchmarkDashboard';
import Canvas3DMap from './components/Canvas3DMap';
import ControlsToolbar from './components/ControlsToolbar';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'policies' | 'cases' | 'map'
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      decision: 'answer',
      answer: 'Welcome to Northstar Policy Knowledge Assistant. I am your verified enterprise guide for company policies covering learning leave, remote and hybrid work, IT equipment replacement, travel expense reimbursement, and onboarding compliance.',
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
  
  // Diagnostics & Citations UI States
  const [expandedCitations, setExpandedCitations] = useState({});
  const [expandedTraces, setExpandedTraces] = useState({});
  const [showJsonRaw, setShowJsonRaw] = useState({});
  
  // 3D View & Spatial Interaction States
  const [is3DView, setIs3DView] = useState(true);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [show3DPipeline, setShow3DPipeline] = useState(false);

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

  // 3D Mouse Parallax
  const handleMouseMove = (e) => {
    if (!is3DView) return;
    const { innerWidth, innerHeight } = window;
    const tiltY = ((e.clientX / innerWidth) - 0.5) * 6;
    const tiltX = ((e.clientY / innerHeight) - 0.5) * -6;
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

  const latestAssistantMsg = messages.filter(m => m.role === 'assistant').slice(-1)[0] || messages[0];

  return (
    <div 
      className={`app-container ${is3DView ? 'mode-3d' : 'mode-2d'}`}
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic 3D Perspective Background */}
      <Background3D is3DView={is3DView} mouseTilt={mouseTilt} />

      <div className="spatial-canvas">
        {/* Navigation Header */}
        <header className="app-header glass-panel-3d">
          <div className="header-brand">
            <div className="logo-icon glow-3d">
              <Sparkles size={20} />
            </div>
            <div className="header-title">
              <h1>Northstar Policy Knowledge Assistant</h1>
              <span>Enterprise AI Policy Intelligence & QA Workbench</span>
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
              <span>Policy Library ({policiesData.documents?.length || 10})</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'cases' ? 'active' : ''}`}
              onClick={() => setActiveTab('cases')}
            >
              <Tag size={15} />
              <span>Benchmark Cases (12)</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
              onClick={() => setActiveTab('map')}
            >
              <Layers size={15} />
              <span>3D Map</span>
            </button>
          </nav>

          {/* Header Action Controls */}
          <div className="header-actions">
            {/* 3D Pipeline Architecture Modal Trigger */}
            <button 
              className={`spatial-btn ${show3DPipeline ? 'active' : ''}`}
              onClick={() => setShow3DPipeline(!show3DPipeline)}
              title="Inspect 3D RAG Architecture Pipeline"
            >
              <Zap size={14} />
              <span>Architecture</span>
            </button>

            {/* 3D Effects Genuine Toggle */}
            <button 
              className={`spatial-toggle-btn ${is3DView ? 'active' : ''}`}
              onClick={() => setIs3DView(!is3DView)}
              title={is3DView ? "Turn off 3D effects, particle canvas, and tilt" : "Turn on 3D effects"}
            >
              <Box size={14} />
              <span>{is3DView ? '3D Effects: ON' : '3D Effects: OFF'}</span>
            </button>
          </div>
        </header>

        {/* Global Controls & Scope Bar */}
        <ControlsToolbar 
          department={department}
          setDepartment={setDepartment}
          asOfDate={asOfDate}
          setAsOfDate={setAsOfDate}
          release={release}
          setRelease={setRelease}
        />

        {/* TAB 1: ASK ASSISTANT */}
        {activeTab === 'chat' && (
          <ChatAssistantView 
            messages={messages}
            question={question}
            setQuestion={setQuestion}
            onSend={handleSend}
            loading={loading}
            department={department}
            asOfDate={asOfDate}
            release={release}
            is3DView={is3DView}
            mouseTilt={mouseTilt}
            expandedCitations={expandedCitations}
            toggleCitation={toggleCitation}
            expandedTraces={expandedTraces}
            toggleTrace={toggleTrace}
            showJsonRaw={showJsonRaw}
            toggleJsonRaw={toggleJsonRaw}
            onOpenMap={() => setActiveTab('map')}
          />
        )}

        {/* TAB 2: POLICY LIBRARY */}
        {activeTab === 'policies' && (
          <PolicyLibraryView 
            policiesData={policiesData}
            onAskPolicy={(q, dept, date) => {
              if (dept) setDepartment(dept);
              if (date) setAsOfDate(date);
              handleSend(q, dept, date);
            }}
          />
        )}

        {/* TAB 3: BENCHMARK CASES */}
        {activeTab === 'cases' && (
          <BenchmarkDashboard 
            onRunCase={triggerTestCase}
            is3DView={is3DView}
          />
        )}

        {/* TAB 4: 3D MAP */}
        {activeTab === 'map' && (
          <div className="map-view-workspace">
            <Canvas3DMap 
              onAskPolicy={(q, dept, date) => {
                if (dept) setDepartment(dept);
                if (date) setAsOfDate(date);
                handleSend(q, dept, date);
              }}
            />
          </div>
        )}
      </div>

      {/* Interactive 3D Architecture Pipeline Modal */}
      {show3DPipeline && (
        <div className="pipeline-modal-backdrop" onClick={() => setShow3DPipeline(false)}>
          <div className="pipeline-modal-card-3d glass-panel-3d" onClick={e => e.stopPropagation()}>
            <div className="pipeline-modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="pipeline-badge-icon">
                  <Zap size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                    Interactive 3D RAG Architecture Visualizer
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
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
                <span className="p-m-val" style={{ color: release === 'candidate' ? '#2563eb' : '#059669' }}>
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
