'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileText, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export default function FileUpload({ onFilesSelected, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type === 'application/pdf');
    if (files.length > 0) onFilesSelected(files);
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) onFilesSelected(Array.from(files));
  }, [onFilesSelected]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!zoneRef.current) return;
    const rect = zoneRef.current.getBoundingClientRect();
    zoneRef.current.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    zoneRef.current.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div className="relative group">
      {/* Outer gradient glow */}
      <div
        className="absolute -inset-[2px] rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"
        style={{
          background: 'var(--gradient-vivid)',
          backgroundSize: '300% 300%',
          animation: 'gradient-shift 4s ease infinite',
          filter: 'blur(6px)',
        }}
      />

      <div
        ref={zoneRef}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onMouseMove={handleMouseMove}
        className={`
          relative rounded-2xl p-16 text-center transition-all duration-300 card-spotlight
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isDragging ? 'glow-accent' : ''}
        `}
        style={{
          background: isDragging ? 'rgba(124, 92, 252, 0.04)' : 'var(--glass)',
          backdropFilter: 'blur(24px) saturate(1.3)',
          border: `1px solid ${isDragging ? 'rgba(124, 92, 252, 0.3)' : 'var(--glass-border)'}`,
        }}
      >
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <motion.div
          animate={isDragging ? { scale: 1.03, y: -4 } : { scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Icon with glow */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-2xl transition-all duration-500"
              style={{
                background: isDragging ? 'var(--accent-1)' : 'transparent',
                opacity: isDragging ? 0.2 : 0,
                filter: 'blur(16px)',
                transform: 'scale(1.5)',
              }}
            />
            <div
              className="relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300"
              style={{
                background: isDragging ? 'rgba(124, 92, 252, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${isDragging ? 'rgba(124, 92, 252, 0.3)' : 'var(--border)'}`,
                boxShadow: isDragging ? '0 0 30px -5px rgba(124, 92, 252, 0.3)' : 'none',
              }}
            >
              {isDragging ? (
                <Sparkles className="w-7 h-7" style={{ color: 'var(--accent-1)' }} />
              ) : (
                <Upload className="w-7 h-7" style={{ color: 'var(--text-tertiary)' }} />
              )}
            </div>
          </div>

          <div>
            <p className="text-base font-medium text-white mb-1.5">
              {isDragging ? 'Drop your files here' : 'Drag PDFs or click to select'}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Supports multiple PDF files simultaneously
            </p>
          </div>

          <span className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm">
            <FileText className="w-3.5 h-3.5" />
            Select Files
          </span>
        </motion.div>
      </div>
    </div>
  );
}
