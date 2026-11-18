import React, { useRef, useEffect } from 'react';

export default function Background3D({ is3DView = true }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!is3DView) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      mouseRef.current = {
        x: ((e.clientY / innerHeight) - 0.5) * -6,
        y: ((e.clientX / innerWidth) - 0.5) * 6
      };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Ambient floating 3D particle constellation
    const count = 45;
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 800 + 200,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 3 + 1.5,
        color: i % 4 === 0 ? 'rgba(56, 189, 248, ' : i % 4 === 1 ? 'rgba(99, 102, 241, ' : i % 4 === 2 ? 'rgba(168, 85, 247, ' : 'rgba(236, 72, 153, '
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const offsetX = mouseRef.current.y * 14;
      const offsetY = mouseRef.current.x * 14;

      // Soft ambient light gradients in background
      const grad1 = ctx.createRadialGradient(cx + offsetX * 1.5, cy * 0.3 + offsetY, 50, cx, cy * 0.3, 500);
      grad1.addColorStop(0, 'rgba(219, 234, 254, 0.45)');
      grad1.addColorStop(0.5, 'rgba(238, 242, 255, 0.2)');
      grad1.addColorStop(1, 'rgba(248, 250, 252, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const grad2 = ctx.createRadialGradient(cx * 1.5 - offsetX, cy * 1.2 - offsetY, 80, cx * 1.5, cy * 1.2, 450);
      grad2.addColorStop(0, 'rgba(237, 233, 254, 0.35)');
      grad2.addColorStop(0.6, 'rgba(245, 243, 255, 0.15)');
      grad2.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render 3D particles with parallax
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const fov = 400;
        const scale = fov / (p.z);
        const px = cx + (p.x - cx + offsetX * (p.z / 600)) * scale;
        const py = cy + (p.y - cy + offsetY * (p.z / 600)) * scale;
        const radius = p.size * scale;
        const alpha = Math.min(0.6, Math.max(0.08, (1000 - p.z) / 1000 * 0.6));

        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${alpha})`;
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [is3DView]);

  if (!is3DView) {
    return <div className="static-bg-canvas" style={{ pointerEvents: 'none' }} />;
  }

  return (
    <div className="dynamic-3d-bg-container" style={{ pointerEvents: 'none' }}>
      <canvas ref={canvasRef} className="interactive-3d-background-canvas" style={{ pointerEvents: 'none' }} />
      <div className="subtle-grid-overlay" style={{ pointerEvents: 'none' }} />
    </div>
  );
}
