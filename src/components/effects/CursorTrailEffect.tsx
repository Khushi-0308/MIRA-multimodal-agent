import React, { useEffect, useRef } from 'react';
import { useMira } from '../../context/MiraContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  shape: 'star' | 'circle' | 'ring';
}

export const CursorTrailEffect: React.FC = () => {
  const { worldSettings, theme } = useMira();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);

  const { cursorEffect, reducedMotion } = worldSettings;

  useEffect(() => {
    if (cursorEffect === 'standard' || reducedMotion || typeof window === 'undefined') {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const getPaletteColors = () => {
      switch (theme) {
        case 'midnight':
          return ['#a78bfa', '#ff5470', '#38bdf8', '#7f5af0'];
        case 'glitter':
          return ['#c084fc', '#f472b6', '#38bdf8', '#fde047'];
        case 'bold':
          return ['#f97316', '#84cc16', '#facc15', '#ef4444'];
        case 'edge':
          return ['#bef264', '#22d3ee', '#e4e4e7', '#ffffff'];
        case 'liquid-rose':
        default:
          return ['#f43f5e', '#fb7185', '#818cf8', '#fda4af'];
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const colors = getPaletteColors();
      const color = colors[Math.floor(Math.random() * colors.length)];
      const count = cursorEffect === 'sparkle-trail' ? 2 : 1;

      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * 8;
        particlesRef.current.push({
          x: e.clientX + spread,
          y: e.clientY + spread,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.5,
          size: cursorEffect === 'aura-ring' ? Math.random() * 12 + 6 : Math.random() * 5 + 3,
          alpha: 0.85,
          color,
          shape: cursorEffect === 'sparkle-trail' ? 'star' : cursorEffect === 'aura-ring' ? 'ring' : 'circle',
        });
      }

      if (particlesRef.current.length > 50) {
        particlesRef.current.shift();
      }

      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const drawStar = (c: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      c.beginPath();
      c.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        c.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        c.lineTo(x, y);
        rot += step;
      }
      c.lineTo(cx, cy - outerRadius);
      c.closePath();
      c.fill();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.025;
        p.size *= 0.96;

        if (p.alpha <= 0 || p.size <= 0.5) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;

        if (p.shape === 'star') {
          drawStar(ctx, p.x, p.y, 4, p.size, p.size * 0.4);
        } else if (p.shape === 'ring') {
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [cursorEffect, reducedMotion, theme]);

  if (cursorEffect === 'standard' || reducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      aria-hidden="true"
    />
  );
};
