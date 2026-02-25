'use client';

import React, { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!glowRef.current) return;
      glowRef.current.style.setProperty('--cx', `${e.clientX}px`);
      glowRef.current.style.setProperty('--cy', `${e.clientY}px`);
      glowRef.current.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      if (!glowRef.current) return;
      glowRef.current.style.opacity = '0';
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed inset-0 z-[1] transition-opacity duration-500"
      style={{
        opacity: 0,
        background: `radial-gradient(800px circle at var(--cx, 50%) var(--cy, 50%), rgba(124, 92, 252, 0.06), rgba(59, 130, 246, 0.03) 40%, transparent 70%)`,
      }}
    />
  );
}
