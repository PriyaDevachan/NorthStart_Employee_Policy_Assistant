import React, { useRef, useEffect, useState } from 'react';
import { 
  Compass, RotateCcw, ZoomIn, ZoomOut, Info, ArrowRight, 
  Sparkles, Building2, Calendar, ShieldCheck, BookOpen, Layers
} from 'lucide-react';

const POLICY_NODES = [
  // Core Node
  { id: 'CORE', type: 'core', label: 'Northstar Enterprise Core', sub: 'Policy Knowledge Graph', x: 0, y: 0, z: 0, radius: 24, color: '#4f46e5' },

  // Department Clusters
  { id: 'DEPT_GEN', type: 'dept', label: 'General / Enterprise', sub: 'Universal Policies', x: -160, y: -70, z: 60, radius: 18, color: '#3b82f6' },
  { id: 'DEPT_SO', type: 'dept', label: 'Support Operations', sub: 'Department Exceptions', x: 170, y: -60, z: -40, radius: 18, color: '#f59e0b' },
  { id: 'DEPT_ENG', type: 'dept', label: 'Engineering Dept', sub: 'Technical & Onboarding', x: -90, y: 150, z: -80, radius: 18, color: '#10b981' },
  { id: 'DEPT_FIN', type: 'dept', label: 'Finance & Ops', sub: 'Travel & Expense Governance', x: 140, y: 120, z: 70, radius: 18, color: '#ec4899' },
  { id: 'DEPT_HR', type: 'dept', label: 'People Operations', sub: 'Leave & Benefits Authority', x: 0, y: -170, z: -60, radius: 18, color: '#8b5cf6' },

  // Policy Documents
  { 
    id: 'POL-LEARN-CURR-2026', 
    type: 'policy', 
    label: 'Learning Leave 2026', 
    docId: 'POL-LEARN-CURR-2026',
    dept: 'People Operations', 
    status: 'current', 
    scope: 'All Full-Time Employees',
    effective: '2026-01-01 to Present',
    passages: ['LEARN-CURR-P1', 'LEARN-CURR-P2', 'LEARN-CURR-P3', 'LEARN-CURR-P4', 'LEARN-CURR-P5'],
    summary: '5 working days per calendar year for full-time employees with 6+ months service. Resets Jan 1; unused days forfeit on Dec 31.',
    x: -60, y: -230, z: -30, radius: 14, color: '#8b5cf6' 
  },
  { 
    id: 'POL-LEARN-ARCH-2025', 
    type: 'policy', 
    label: 'Archived Leave 2025', 
    docId: 'POL-LEARN-ARCH-2025',
    dept: 'People Operations', 
    status: 'archived', 
    scope: 'Historical 2025 Employees',
    effective: '2025-01-01 to 2025-12-31',
    passages: ['LEARN-ARCH-P1', 'LEARN-ARCH-P2', 'LEARN-ARCH-P3', 'LEARN-ARCH-P4'],
    summary: '3 working days in calendar year 2025. Strictly expired and non-transferable to 2026.',
    x: 80, y: -230, z: -90, radius: 12, color: '#94a3b8' 
  },
  { 
    id: 'POL-TRAVEL-CURR-2026', 
    type: 'policy', 
    label: 'Travel Expenses 2026', 
    docId: 'POL-TRAVEL-CURR-2026',
    dept: 'Finance and Operations', 
    status: 'current', 
    scope: 'Approved Business Travelers',
    effective: '2026-01-01 to Present',
    passages: ['TRAVEL-CURR-P1', 'TRAVEL-CURR-P2', 'TRAVEL-CURR-P3', 'TRAVEL-CURR-P4', 'TRAVEL-CURR-P5'],
    summary: 'CAD 35/day meal reimbursement maximum. Receipts required within 30 days. Alcohol excluded.',
    x: 210, y: 150, z: 90, radius: 14, color: '#ec4899' 
  },
  { 
    id: 'POL-TRAVEL-FAQ-2026', 
    type: 'policy', 
    label: 'Travel Expense FAQ', 
    docId: 'POL-TRAVEL-FAQ-2026',
    dept: 'Finance and Operations', 
    status: 'current', 
    scope: 'Guidance & Examples',
    effective: '2026-01-01 to Present',
    passages: ['TRAVEL-FAQ-P1', 'TRAVEL-FAQ-P2', 'TRAVEL-FAQ-P3'],
    summary: 'Per diem meal split examples and clarification on submission deadlines and manager approvals.',
    x: 260, y: 70, z: 40, radius: 12, color: '#f43f5e' 
  },
  { 
    id: 'POL-EQUIP-CURR-2026', 
    type: 'policy', 
    label: 'Equipment & Hardware', 
    docId: 'POL-EQUIP-CURR-2026',
    dept: 'Engineering', 
    status: 'current', 
    scope: 'All Staff Issued Hardware',
    effective: '2026-01-01 to Present',
    passages: ['EQUIP-CURR-P1', 'EQUIP-CURR-P2', 'EQUIP-CURR-P3', 'EQUIP-CURR-P4'],
    summary: 'Laptop refresh considered after 36 months of service, or earlier if written IT assessment confirms hardware failure.',
    x: -160, y: 180, z: -100, radius: 14, color: '#10b981' 
  },
  { 
    id: 'POL-ONBOARD-CURR-2026', 
    type: 'policy', 
    label: 'Security Onboarding', 
    docId: 'POL-ONBOARD-CURR-2026',
    dept: 'Engineering', 
    status: 'current', 
    scope: 'New Hires & Transfers',
    effective: '2026-01-01 to Present',
    passages: ['ONBOARD-CURR-P1', 'ONBOARD-CURR-P2', 'ONBOARD-CURR-P3', 'ONBOARD-CURR-P4', 'ONBOARD-CURR-P5'],
    summary: 'Mandatory security training prerequisite before any employee is eligible for manager approval of remote work.',
    x: -30, y: 220, z: -60, radius: 14, color: '#059669' 
  },
  { 
    id: 'POL-REMOTE-CURR-2026', 
    type: 'policy', 
    label: 'Remote Work Baseline', 
    docId: 'POL-REMOTE-CURR-2026',
    dept: 'General / Enterprise', 
    status: 'current', 
    scope: 'Eligible Regular Staff',
    effective: '2026-01-01 to Present',
    passages: ['REMOTE-CURR-P1', 'REMOTE-CURR-P2', 'REMOTE-CURR-P3', 'REMOTE-CURR-P4', 'REMOTE-CURR-P5'],
    summary: 'Up to 2 days per week remote allowance with manager approval and prerequisite onboarding security training.',
    x: -240, y: -50, z: 80, radius: 14, color: '#3b82f6' 
  },
  { 
    id: 'POL-REMOTE-SOPEX-2026', 
    type: 'policy', 
    label: 'Support Ops Remote Exception', 
    docId: 'POL-REMOTE-SOPEX-2026',
    dept: 'Support Operations', 
    status: 'current', 
    scope: 'Support Operations Department Only',
    effective: '2026-03-01 to Present',
    passages: ['REMOTE-SOPEX-P1', 'REMOTE-SOPEX-P2', 'REMOTE-SOPEX-P3'],
    summary: 'Overrides general policy for Support Ops starting March 1, 2026: limited to maximum 1 remote day per week.',
    x: 230, y: -90, z: -60, radius: 14, color: '#f59e0b' 
  }
];

const POLICY_EDGES = [
  // Connect core to departments
  { from: 'CORE', to: 'DEPT_GEN', color: 'rgba(59, 130, 246, 0.4)', dash: [] },
  { from: 'CORE', to: 'DEPT_SO', color: 'rgba(245, 158, 11, 0.4)', dash: [] },
  { from: 'CORE', to: 'DEPT_ENG', color: 'rgba(16, 185, 129, 0.4)', dash: [] },
  { from: 'CORE', to: 'DEPT_FIN', color: 'rgba(236, 72, 153, 0.4)', dash: [] },
  { from: 'CORE', to: 'DEPT_HR', color: 'rgba(139, 92, 246, 0.4)', dash: [] },

  // Department to Policies
  { from: 'DEPT_HR', to: 'POL-LEARN-CURR-2026', color: 'rgba(139, 92, 246, 0.5)', dash: [] },
  { from: 'DEPT_HR', to: 'POL-LEARN-ARCH-2025', color: 'rgba(148, 163, 184, 0.4)', dash: [4, 4] },
  { from: 'DEPT_FIN', to: 'POL-TRAVEL-CURR-2026', color: 'rgba(236, 72, 153, 0.5)', dash: [] },
  { from: 'DEPT_FIN', to: 'POL-TRAVEL-FAQ-2026', color: 'rgba(244, 63, 94, 0.4)', dash: [3, 3] },
  { from: 'DEPT_ENG', to: 'POL-EQUIP-CURR-2026', color: 'rgba(16, 185, 129, 0.5)', dash: [] },
  { from: 'DEPT_ENG', to: 'POL-ONBOARD-CURR-2026', color: 'rgba(5, 150, 105, 0.5)', dash: [] },
  { from: 'DEPT_GEN', to: 'POL-REMOTE-CURR-2026', color: 'rgba(59, 130, 246, 0.5)', dash: [] },
  { from: 'DEPT_SO', to: 'POL-REMOTE-SOPEX-2026', color: 'rgba(245, 158, 11, 0.5)', dash: [] },

  // Inter-Policy Dependencies & Hierarchies (Critical Knowledge Edges)
  { from: 'POL-ONBOARD-CURR-2026', to: 'POL-REMOTE-CURR-2026', color: 'rgba(16, 185, 129, 0.8)', label: 'Prerequisite Gate', dash: [6, 4] },
  { from: 'POL-REMOTE-CURR-2026', to: 'POL-REMOTE-SOPEX-2026', color: 'rgba(245, 158, 11, 0.85)', label: 'Department Exception', dash: [4, 3] },
  { from: 'POL-LEARN-ARCH-2025', to: 'POL-LEARN-CURR-2026', color: 'rgba(148, 163, 184, 0.7)', label: 'Temporal Scoping', dash: [5, 5] },
  { from: 'POL-TRAVEL-CURR-2026', to: 'POL-TRAVEL-FAQ-2026', color: 'rgba(236, 72, 153, 0.7)', label: 'Guidance', dash: [] }
];

export default function Canvas3DMap({ onAskPolicy, onSelectPolicy }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const [rotation, setRotation] = useState({ pitch: 0.35, yaw: 0.5 });
  const [zoom, setZoom] = useState(1.15);
  const [selectedNode, setSelectedNode] = useState(POLICY_NODES[6]); // default select Learning Leave
  const [hoveredNode, setHoveredNode] = useState(null);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(true);

  // Handle Drag to Rotate
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    autoRotateRef.current = false;
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      setRotation(prev => ({
        pitch: Math.max(-1.2, Math.min(1.2, prev.pitch + dy * 0.005)),
        yaw: prev.yaw + dx * 0.005
      }));
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }

    // Raycast hit testing for hover
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let hit = null;
    const nodes = canvas._projectedNodes || [];
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dist = Math.hypot(mouseX - n.screenX, mouseY - n.screenY);
      if (dist <= n.screenRadius + 4) {
        hit = n;
        break;
      }
    }
    setHoveredNode(hit);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = (e) => {
    if (hoveredNode) {
      setSelectedNode(hoveredNode);
      if (onSelectPolicy && hoveredNode.docId) {
        onSelectPolicy(hoveredNode);
      }
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setZoom(prev => Math.max(0.6, Math.min(2.4, prev + delta)));
  };

  const resetView = () => {
    setRotation({ pitch: 0.35, yaw: 0.5 });
    setZoom(1.15);
    autoRotateRef.current = true;
  };

  // Main 3D Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth * window.devicePixelRatio;
      canvas.height = parent.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    let currentYaw = rotation.yaw;
    let currentPitch = rotation.pitch;

    const render = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, width, height);

      if (autoRotateRef.current) {
        currentYaw += 0.002;
      } else {
        currentYaw = rotation.yaw;
      }
      currentPitch = rotation.pitch;

      const cx = width / 2;
      const cy = height / 2;
      const fov = 450 * zoom;

      // 3D Rotation Matrix Calculation
      const cosY = Math.cos(currentYaw);
      const sinY = Math.sin(currentYaw);
      const cosP = Math.cos(currentPitch);
      const sinP = Math.sin(currentPitch);

      // Project all nodes to 2D
      const projectedMap = {};
      const projectedNodesList = POLICY_NODES.map(node => {
        // Rotate around Y (yaw)
        const x1 = node.x * cosY - node.z * sinY;
        const z1 = node.x * sinY + node.z * cosY;

        // Rotate around X (pitch)
        const y2 = node.y * cosP - z1 * sinP;
        const z2 = node.y * sinP + z1 * cosP + 480; // camera distance

        const scale = fov / z2;
        const screenX = cx + x1 * scale;
        const screenY = cy + y2 * scale;
        const screenRadius = Math.max(5, node.radius * scale * 0.75);

        const res = {
          ...node,
          x1, y2, z2,
          screenX,
          screenY,
          screenRadius,
          scale
        };
        projectedMap[node.id] = res;
        return res;
      });

      canvas._projectedNodes = projectedNodesList;

      // Draw Ambient 3D Depth Rings around Core
      ctx.save();
      ctx.translate(cx, cy);
      [140, 260, 380].forEach((r, idx) => {
        ctx.beginPath();
        ctx.ellipse(0, 0, r * zoom * 0.9, r * zoom * 0.35, currentYaw * 0.2, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 0 ? 'rgba(99, 102, 241, 0.12)' : 'rgba(56, 189, 248, 0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
      });
      ctx.restore();

      // Draw Connecting Edges
      POLICY_EDGES.forEach(edge => {
        const p1 = projectedMap[edge.from];
        const p2 = projectedMap[edge.to];
        if (!p1 || !p2) return;

        const isHighlighted = (hoveredNode && (hoveredNode.id === edge.from || hoveredNode.id === edge.to)) ||
                              (selectedNode && (selectedNode.id === edge.from || selectedNode.id === edge.to));

        ctx.beginPath();
        ctx.moveTo(p1.screenX, p1.screenY);
        ctx.lineTo(p2.screenX, p2.screenY);
        ctx.strokeStyle = isHighlighted ? '#3b82f6' : edge.color;
        ctx.lineWidth = isHighlighted ? 2.5 : 1.2;
        ctx.setLineDash(edge.dash || []);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated Energy Packet along Edge
        if (isHighlighted || edge.label) {
          const t = (Date.now() * 0.0012) % 1;
          const energyX = p1.screenX + (p2.screenX - p1.screenX) * t;
          const energyY = p1.screenY + (p2.screenY - p1.screenY) * t;
          ctx.beginPath();
          ctx.arc(energyX, energyY, isHighlighted ? 3.5 : 2, 0, Math.PI * 2);
          ctx.fillStyle = '#60a5fa';
          ctx.shadowColor = '#3b82f6';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Sort nodes by depth (z2 descending) so farther objects render first
      projectedNodesList.sort((a, b) => b.z2 - a.z2);

      // Render 3D Nodes
      projectedNodesList.forEach(node => {
        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;

        // Node Glow Halo
        const glowRadius = node.screenRadius * (isSelected ? 2.4 : isHovered ? 2.0 : 1.5);
        const glowGrad = ctx.createRadialGradient(
          node.screenX, node.screenY, node.screenRadius * 0.2,
          node.screenX, node.screenY, glowRadius
        );
        glowGrad.addColorStop(0, isSelected ? 'rgba(99, 102, 241, 0.45)' : isHovered ? 'rgba(56, 189, 248, 0.35)' : 'rgba(255, 255, 255, 0.15)');
        glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // 3D Sphere Body with Shading
        const bodyGrad = ctx.createRadialGradient(
          node.screenX - node.screenRadius * 0.3,
          node.screenY - node.screenRadius * 0.3,
          node.screenRadius * 0.1,
          node.screenX,
          node.screenY,
          node.screenRadius
        );
        bodyGrad.addColorStop(0, '#ffffff');
        bodyGrad.addColorStop(0.3, node.color);
        bodyGrad.addColorStop(1, '#0f172a');

        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, node.screenRadius, 0, Math.PI * 2);
        ctx.fillStyle = bodyGrad;
        ctx.shadowColor = isSelected ? '#4f46e5' : node.color;
        ctx.shadowBlur = isSelected ? 16 : isHovered ? 12 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Selection / Hover Ring
        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(node.screenX, node.screenY, node.screenRadius + 4, 0, Math.PI * 2);
          ctx.strokeStyle = isSelected ? '#4f46e5' : '#38bdf8';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Node Text Label
        ctx.font = `${node.type === 'core' ? 'bold 12px' : node.type === 'dept' ? '600 11px' : '500 10px'} Inter, sans-serif`;
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.screenX, node.screenY + node.screenRadius + 14);

        if (node.status === 'archived') {
          ctx.font = '9px Inter, sans-serif';
          ctx.fillStyle = '#64748b';
          ctx.fillText('(Archived 2025)', node.screenX, node.screenY + node.screenRadius + 26);
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [rotation, zoom, hoveredNode, selectedNode]);

  return (
    <div className="canvas-3d-map-viewport" ref={containerRef}>
      <canvas 
        ref={canvasRef} 
        className="map-3d-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
      />

      {/* Floating 3D Map Header Info */}
      <div className="map-3d-header-overlay glass-panel-3d">
        <div className="map-overlay-title">
          <Layers size={18} className="text-indigo" />
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
              Northstar Policy Universe 3D Map
            </h3>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
              Drag to orbit • Scroll to zoom • Click nodes to inspect & test authority rules
            </p>
          </div>
        </div>

        <div className="map-view-controls">
          <button className="map-tool-btn" onClick={() => setZoom(z => Math.min(2.4, z + 0.2))} title="Zoom In">
            <ZoomIn size={14} />
          </button>
          <button className="map-tool-btn" onClick={() => setZoom(z => Math.max(0.6, z - 0.2))} title="Zoom Out">
            <ZoomOut size={14} />
          </button>
          <button className="map-tool-btn" onClick={resetView} title="Reset View">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Selected Policy Node Inspector Drawer */}
      {selectedNode && (
        <div className="map-selected-node-panel glass-panel-3d card-pop-3d">
          <div className="panel-top-row">
            <span className={`status-badge ${selectedNode.status === 'archived' ? 'badge-conflict' : selectedNode.type === 'core' ? 'badge-clarify' : 'badge-answer'}`}>
              {(selectedNode.status || selectedNode.type).toUpperCase()}
            </span>
            {selectedNode.docId && <span className="doc-code-pill">{selectedNode.docId}</span>}
          </div>

          <h4 className="panel-node-title">{selectedNode.label}</h4>
          <p className="panel-node-sub">{selectedNode.sub || selectedNode.summary}</p>

          {selectedNode.type === 'policy' && (
            <div className="panel-node-meta-grid">
              <div className="p-meta-item">
                <Building2 size={12} className="text-muted" />
                <span>Scope: <strong>{selectedNode.dept}</strong></span>
              </div>
              <div className="p-meta-item">
                <Calendar size={12} className="text-muted" />
                <span>Effective: <strong>{selectedNode.effective}</strong></span>
              </div>
              <div className="p-meta-item">
                <ShieldCheck size={12} className="text-muted" />
                <span>Passages: <strong>{selectedNode.passages?.length || 0} Segmented</strong></span>
              </div>
            </div>
          )}

          {selectedNode.type === 'policy' && (
            <div className="panel-action-row">
              <button 
                className="panel-ask-btn glow-gradient"
                onClick={() => {
                  let prompt = `What are the full conditions of ${selectedNode.label}?`;
                  if (selectedNode.id === 'POL-LEARN-CURR-2026') {
                    prompt = 'I am a full-time employee with eight months of service. How many days of learning leave can I take in 2026?';
                  } else if (selectedNode.id === 'POL-REMOTE-SOPEX-2026') {
                    prompt = 'I work in Support Operations. How many remote days can I take in April 2026?';
                  } else if (selectedNode.id === 'POL-TRAVEL-CURR-2026') {
                    prompt = 'What is the meal reimbursement limit on approved business travel?';
                  } else if (selectedNode.id === 'POL-EQUIP-CURR-2026') {
                    prompt = 'When am I eligible for a laptop replacement?';
                  }
                  if (onAskPolicy) onAskPolicy(prompt, selectedNode.dept, selectedNode.effective?.split(' ')[0]);
                }}
              >
                <span>Ask Assistant About This</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
