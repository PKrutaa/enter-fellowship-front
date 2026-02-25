'use client';

import React, { useEffect, useRef } from 'react';

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; hue: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const count = 80;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        hue: Math.random() * 60 + 230,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(124, 92, 252, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.6 }}
    />
  );
}

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Deep base */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #050510 0%, #07070f 30%, #0a0a1a 100%)' }} />

      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      {/* Particle network */}
      <ParticleCanvas />

      {/* Aurora wave 1 */}
      <div className="absolute inset-0 aurora-wave opacity-[0.035]" />

      {/* Floating gradient orbs - larger, more vivid */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full animate-float opacity-[0.08] blur-[140px]"
        style={{
          background: 'radial-gradient(circle, #7c5cfc 0%, #4f39c9 30%, transparent 70%)',
          top: '-15%',
          right: '5%',
        }}
      />
      <div
        className="absolute w-[700px] h-[700px] rounded-full animate-float-delay opacity-[0.06] blur-[120px]"
        style={{
          background: 'radial-gradient(circle, #3b82f6 0%, #1d4ed8 30%, transparent 70%)',
          bottom: '5%',
          left: '-10%',
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full animate-float-slow opacity-[0.05] blur-[100px]"
        style={{
          background: 'radial-gradient(circle, #06b6d4 0%, #0891b2 30%, transparent 70%)',
          top: '50%',
          right: '-15%',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-[0.04] blur-[80px]"
        style={{
          background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)',
          top: '20%',
          left: '20%',
          animation: 'float 35s ease-in-out 8s infinite',
        }}
      />

      {/* Top spotlight */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px]"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(124, 92, 252, 0.08) 0%, transparent 60%)',
        }}
      />

      {/* Horizontal beam */}
      <div className="absolute top-[45%] left-0 right-0 h-px beam-line" />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 noise-overlay opacity-[0.03]" />

      {/* Scan line (periodic) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="scan-line" />
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(5, 5, 16, 0.5) 100%)',
        }}
      />
    </div>
  );
}
