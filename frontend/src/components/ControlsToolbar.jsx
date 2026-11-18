import React from 'react';
import { Building2, Calendar, ShieldCheck, X } from 'lucide-react';

export default function ControlsToolbar({
  department,
  setDepartment,
  asOfDate,
  setAsOfDate,
  release,
  setRelease
}) {
  return (
    <div className="controls-bar glass-panel-3d">
      <div className="filter-controls-group">
        {/* Department Filter with Feedback */}
        <div className="control-group">
          <Building2 size={15} className="control-icon text-indigo" />
          <span className="control-label">Department:</span>
          <div className="custom-dropdown-container">
            <select 
              className="select-input-animated" 
              value={department} 
              onChange={e => setDepartment(e.target.value)}
            >
              <option value="">All / General Enterprise</option>
              <option value="Support Operations">Support Operations</option>
              <option value="Engineering">Engineering</option>
              <option value="Finance and Operations">Finance & Ops</option>
              <option value="People Operations">People Ops</option>
            </select>
          </div>
        </div>

        {/* Effective Date Filter with Feedback */}
        <div className="control-group">
          <Calendar size={15} className="control-icon text-indigo" />
          <span className="control-label">Effective Date:</span>
          <div className="date-input-container">
            <input 
              type="date" 
              className="date-input-animated" 
              value={asOfDate} 
              onChange={e => setAsOfDate(e.target.value)} 
            />
          </div>
        </div>

        {/* RAG Mode Switcher */}
        <div className="control-group">
          <ShieldCheck size={15} className="control-icon text-indigo" />
          <span className="control-label">RAG Engine:</span>
          <div className="release-toggle depth-pill">
            <button 
              className={`toggle-btn ${release === 'baseline' ? 'active base-active' : ''}`}
              onClick={() => setRelease('baseline')}
              title="Baseline BM25 without phrase boosting"
            >
              Baseline
            </button>
            <button 
              className={`toggle-btn ${release === 'candidate' ? 'active cand-active' : ''}`}
              onClick={() => setRelease('candidate')}
              title="Candidate BM25 with phrase boosting + authority gating"
            >
              Candidate
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      <div className="active-filters-summary">
        {department && (
          <span className="active-pill-tag">
            <Building2 size={11} /> Dept: {department}
            <button className="pill-remove-btn" onClick={() => setDepartment('')}>
              <X size={10} />
            </button>
          </span>
        )}
        {asOfDate && asOfDate !== '2026-04-15' && (
          <span className="active-pill-tag">
            <Calendar size={11} /> Date: {asOfDate}
            <button className="pill-remove-btn" onClick={() => setAsOfDate('2026-04-15')}>
              <X size={10} />
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
