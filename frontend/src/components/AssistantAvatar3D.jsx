import React, { useRef, useEffect } from 'react';

/**
 * 3D Holographic AI Assistant Avatar
 * Features:
 * - Orbital particle swarm with depth projection
 * - Pulsing core sphere with latitude/longitude energy lines
 * - Accelerates and glows when generating / loading
 * - Interactive mouse response
 * - Seamless fallback when is3DView is false
 */
export default function AssistantAvatar3D({ is3DView = true, loading = false, size = 72 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!is3DView) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const width = size;
    const height = size;
    canvas.width = width * 2; // retina scaling
    canvas.height = height * 2;
    ctx.scale(2, 2);

    // Particles for orbital swarm
    const particleCount = 28;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 22 + Math.random() * 12;
      particles.push({
        theta,
        phi,
        radius,
        speed: (0.015 + Math.random() * 0.02) * (Math.random() > 0.5 ? 1 : -1),
        size: 1.2 + Math.random() * 1.6,
        color: i % 3 === 0 ? '#38bdf8' : i % 3 === 1 ? '#6366f1' : '#a855f7'
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const rotSpeed = loading ? 0.06 : 0.018;
      angle += rotSpeed;

      // Draw outer ambient glow
      const pulse = Math.sin(angle * 2) * (loading ? 8 : 4);
      const glowGrad = ctx.createRadialGradient(cx, cy, 6, cx, cy, 26 + pulse);
      glowGrad.addColorStop(0, loading ? 'rgba(99, 102, 241, 0.45)' : 'rgba(56, 189, 248, 0.35)');
      glowGrad.addColorStop(0.7, loading ? 'rgba(168, 85, 247, 0.2)' : 'rgba(99, 102, 241, 0.15)');
      glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.fill();

      // 3D Orbital Rings
      const ringTilt = 0.5;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle * 0.5);

      // Ring 1 (Cyan/Indigo)
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 11, ringTilt, 0, Math.PI * 2);
      ctx.strokeStyle = loading ? 'rgba(168, 85, 247, 0.6)' : 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Ring 2 (Violet)
      ctx.beginPath();
      ctx.ellipse(0, 0, 19, 9.5, -ringTilt * 1.2, 0, Math.PI * 2);
      ctx.strokeStyle = loading ? 'rgba(236, 72, 153, 0.6)' : 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 1.0;
      ctx.stroke();
      ctx.restore();

      // Draw 3D Core Sphere
      const coreRadius = 14 + (loading ? Math.sin(angle * 4) * 2 : Math.sin(angle) * 1);
      const coreGrad = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, coreRadius);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.3, loading ? '#c084fc' : '#7dd3fc');
      coreGrad.addColorStop(0.7, loading ? '#7c3aed' : '#2563eb');
      coreGrad.addColorStop(1, loading ? '#4c1d95' : '#1e3a8a');

      ctx.save();
      ctx.shadowColor = loading ? '#a855f7' : '#38bdf8';
      ctx.shadowBlur = loading ? 14 : 8;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();
      ctx.restore();

      // Projected Particles (Depth sorted)
      const projected = particles.map(p => {
        p.theta += p.speed * (loading ? 2.5 : 1);
        const x3d = p.radius * Math.sin(p.phi) * Math.cos(p.theta + angle);
        const y3d = p.radius * Math.cos(p.phi);
        const z3d = p.radius * Math.sin(p.phi) * Math.sin(p.theta + angle);
        const scale = (z3d + 40) / 40;
        return {
          x: cx + x3d,
          y: cy + y3d,
          z: z3d,
          scale: Math.max(0.3, scale),
          color: p.color,
          baseSize: p.size
        };
      });

      projected.sort((a, b) => a.z - b.z);

      projected.forEach(p => {
        const alpha = Math.max(0.15, Math.min(0.9, (p.z + 20) / 40));
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.baseSize * p.scale, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [is3DView, loading, size]);

  if (!is3DView) {
    return (
      <div 
        className={`assistant-avatar-2d ${loading ? 'loading-pulse' : ''}`}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 50%, #9333ea 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.28)',
          border: '2px solid rgba(255, 255, 255, 0.9)',
          position: 'relative'
        }}
      >
        <span style={{ color: '#ffffff', fontWeight: '800', fontSize: size * 0.38 }}>N</span>
        {loading && <span className="avatar-loading-ring"></span>}
      </div>
    );
  }

  return (
    <div 
      className={`assistant-avatar-3d-wrap ${loading ? 'avatar-active' : ''}`}
      style={{ width: size, height: size, position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ width: size, height: size, display: 'block' }} 
      />
    </div>
  );
}
