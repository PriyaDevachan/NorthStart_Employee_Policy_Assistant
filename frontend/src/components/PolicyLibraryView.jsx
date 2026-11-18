import React, { useState } from 'react';
import { 
  BookOpen, Search, Filter, Building2, Calendar, Clock, 
  ShieldCheck, FileText, ChevronDown, ChevronRight, ArrowRight, 
  Sparkles, ExternalLink, X, CheckCircle2, AlertCircle, Bookmark
} from 'lucide-react';

const CATEGORY_CARDS = [
  { id: 'all', label: 'All Policies', icon: BookOpen, count: 10, color: 'cat-indigo' },
  { id: 'learning_leave', label: 'Learning & Leave', icon: Sparkles, count: 3, color: 'cat-purple' },
  { id: 'remote_work', label: 'Remote & Hybrid', icon: Building2, count: 3, color: 'cat-blue' },
  { id: 'travel_expenses', label: 'Travel & Per Diem', icon: Clock, count: 2, color: 'cat-pink' },
  { id: 'equipment', label: 'IT & Hardware', icon: ShieldCheck, count: 1, color: 'cat-emerald' },
  { id: 'onboarding', label: 'Security Onboarding', icon: FileText, count: 1, color: 'cat-amber' },
];

export default function PolicyLibraryView({ 
  policiesData = { documents: [], passages: [] }, 
  onAskPolicy 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [expandedPassageId, setExpandedPassageId] = useState(null);
  const [selectedDocModal, setSelectedDocModal] = useState(null);

  const documents = policiesData.documents || [];
  const passages = policiesData.passages || [];

  const filteredDocs = documents.filter(doc => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      doc.title.toLowerCase().includes(query) ||
      doc.doc_id.toLowerCase().includes(query) ||
      doc.topic.toLowerCase().includes(query) ||
      (doc.department && doc.department.toLowerCase().includes(query));

    const matchesTopic = selectedTopic === 'all' || doc.topic === selectedTopic;
    const matchesDept = 
      selectedDeptFilter === 'all' ? true : 
      selectedDeptFilter === 'general' ? !doc.department : 
      doc.department === selectedDeptFilter;
    const matchesStatus = selectedStatusFilter === 'all' || doc.status === selectedStatusFilter;

    return matchesSearch && matchesTopic && matchesDept && matchesStatus;
  });

  return (
    <div className="policy-library-container">
      {/* Category Pills Header Row */}
      <div className="policy-category-row">
        {CATEGORY_CARDS.map(cat => {
          const IconComponent = cat.icon;
          const isActive = selectedTopic === cat.id;
          return (
            <button
              key={cat.id}
              className={`category-hero-card ${cat.color} ${isActive ? 'active' : ''} card-pop-3d`}
              onClick={() => setSelectedTopic(cat.id)}
            >
              <div className="cat-icon-wrap">
                <IconComponent size={18} />
              </div>
              <div className="cat-text-wrap">
                <span className="cat-title">{cat.label}</span>
                <span className="cat-count">{cat.count} Documents</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modern Filter and Search Bar */}
      <div className="policy-filters-bar glass-panel-3d">
        <div className="search-box-animated">
          <Search size={16} className="search-icon-anim" />
          <input 
            type="text"
            className="policy-search-input-field"
            placeholder="Search policies, guidelines, topics, or document IDs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-dropdowns-group">
          {/* Department Filter */}
          <div className="select-wrapper-custom">
            <Building2 size={14} className="text-muted" />
            <select 
              value={selectedDeptFilter} 
              onChange={e => setSelectedDeptFilter(e.target.value)}
              className="custom-select-element"
            >
              <option value="all">All Scopes</option>
              <option value="general">General / Enterprise-Wide</option>
              <option value="Support Operations">Support Operations</option>
              <option value="Engineering">Engineering</option>
              <option value="Finance and Operations">Finance & Ops</option>
              <option value="People Operations">People Operations</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="select-wrapper-custom">
            <Clock size={14} className="text-muted" />
            <select 
              value={selectedStatusFilter} 
              onChange={e => setSelectedStatusFilter(e.target.value)}
              className="custom-select-element"
            >
              <option value="all">All Statuses</option>
              <option value="current">Current Active</option>
              <option value="archived">Archived / Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Policy Bento Document Grid */}
      <div className="policy-bento-cards-grid">
        {filteredDocs.map(doc => {
          const docPassages = passages.filter(p => p.doc_id === doc.doc_id);
          const isArchived = doc.status === 'archived';
          const isException = !!doc.department;

          return (
            <div 
              key={doc.doc_id} 
              className={`policy-document-card glass-panel-3d card-pop-3d ${isArchived ? 'doc-archived' : ''} ${isException ? 'doc-exception' : ''}`}
            >
              {/* Document Header Tag */}
              <div className="doc-card-head">
                <span className={`status-badge ${isArchived ? 'badge-conflict' : 'badge-answer'}`}>
                  {doc.status.toUpperCase()}
                </span>
                <span className="doc-version-pill">v{doc.version || '1.0'}</span>
                <span className="doc-code-pill">{doc.doc_id}</span>
              </div>

              <h3 className="doc-card-title">{doc.title}</h3>

              <div className="doc-metadata-list">
                <div className="doc-meta-row">
                  <Calendar size={13} className="text-muted" />
                  <span>
                    Effective: <strong>{doc.effective_start}</strong> {doc.effective_end ? `to ${doc.effective_end}` : '(Active)'}
                  </span>
                </div>
                <div className="doc-meta-row">
                  <Building2 size={13} className="text-muted" />
                  <span>
                    Scope: <strong>{doc.department || 'Enterprise-Wide (General)'}</strong>
                  </span>
                </div>
                <div className="doc-meta-row">
                  <Bookmark size={13} className="text-muted" />
                  <span>Topic: <strong>{doc.topic?.replace('_', ' ').toUpperCase()}</strong></span>
                </div>
              </div>

              {/* Segmented Passages Tray */}
              <div className="doc-passages-tray">
                <div className="tray-label">
                  <span>{doc.passage_ids.length} Segmented Grounding Passages:</span>
                </div>
                <div className="passage-chips-wrap">
                  {doc.passage_ids.map(pid => (
                    <button
                      key={pid}
                      className={`passage-chip ${expandedPassageId === pid ? 'active' : ''}`}
                      onClick={() => setExpandedPassageId(expandedPassageId === pid ? null : pid)}
                      title="Inspect passage text"
                    >
                      <span>{pid}</span>
                      {expandedPassageId === pid ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expanded Inline Passage Drawer */}
              {expandedPassageId && doc.passage_ids.includes(expandedPassageId) && (
                <div className="inline-passage-viewer card-pop-3d">
                  <div className="viewer-head">
                    <span style={{ fontWeight: 600, color: '#3b82f6' }}>{expandedPassageId}</span>
                    <button onClick={() => setExpandedPassageId(null)} className="close-btn-tiny">
                      <X size={12} />
                    </button>
                  </div>
                  <div className="viewer-body">
                    {docPassages.find(p => p.passage_id === expandedPassageId)?.text || 'Passage content retrieved.'}
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="doc-card-footer">
                <button 
                  className="doc-full-btn"
                  onClick={() => setSelectedDocModal({ ...doc, passages: docPassages })}
                >
                  <FileText size={13} /> View Full Policy
                </button>
                <button 
                  className="doc-ask-btn glow-gradient"
                  onClick={() => {
                    let sampleQ = `What are the governing rules under ${doc.title}?`;
                    if (doc.topic === 'learning_leave') sampleQ = 'How many days of learning leave can I take in 2026?';
                    if (doc.topic === 'remote_work') sampleQ = 'How many remote days can I take per week?';
                    if (doc.topic === 'travel_expenses') sampleQ = 'What is the meal reimbursement cap on business travel?';
                    if (doc.topic === 'equipment') sampleQ = 'When am I eligible for a laptop replacement?';
                    if (onAskPolicy) onAskPolicy(sampleQ, doc.department || null, doc.effective_start);
                  }}
                  title="Ask assistant with this policy scope"
                >
                  <span>Ask Assistant</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Document Modal */}
      {selectedDocModal && (
        <div className="pipeline-modal-backdrop" onClick={() => setSelectedDocModal(null)}>
          <div className="document-modal-card glass-panel-3d card-pop-3d" onClick={e => e.stopPropagation()}>
            <div className="doc-modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={20} className="text-indigo" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>{selectedDocModal.title}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Doc ID: {selectedDocModal.doc_id} • v{selectedDocModal.version || '1.0'}
                  </span>
                </div>
              </div>
              <button className="close-modal-btn" onClick={() => setSelectedDocModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="doc-modal-body">
              <div className="modal-scope-pills">
                <span className="stat-pill"><Building2 size={12} /> {selectedDocModal.department || 'Enterprise-Wide'}</span>
                <span className="stat-pill"><Calendar size={12} /> Effective: {selectedDocModal.effective_start}</span>
                <span className={`status-badge ${selectedDocModal.status === 'archived' ? 'badge-conflict' : 'badge-answer'}`}>
                  {selectedDocModal.status.toUpperCase()}
                </span>
              </div>

              <div className="modal-passages-list">
                <h4 style={{ fontSize: '0.88rem', color: '#1e293b', marginBottom: '8px' }}>
                  Policy Sections ({selectedDocModal.passages.length}):
                </h4>
                {selectedDocModal.passages.map(p => (
                  <div key={p.passage_id} className="modal-passage-item">
                    <div className="p-item-head">
                      <span className="p-item-id">[{p.passage_id}]</span>
                      <span className="p-item-title">{p.title}</span>
                      <span className="p-item-auth">{p.authority_level || 'standard'}</span>
                    </div>
                    <div className="p-item-text">{p.text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="doc-modal-foot">
              <button 
                className="panel-ask-btn glow-gradient"
                onClick={() => {
                  setSelectedDocModal(null);
                  let sampleQ = `What are the governing rules under ${selectedDocModal.title}?`;
                  if (onAskPolicy) onAskPolicy(sampleQ, selectedDocModal.department || null, selectedDocModal.effective_start);
                }}
              >
                <span>Ask Assistant About This Document</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
