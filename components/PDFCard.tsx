'use client';

import React, { useRef } from 'react';
import { FileText, Trash2, CheckCircle, Loader2, AlertCircle, Settings, Sparkles } from 'lucide-react';
import { PDFDocument } from '@/types';
import { formatBytes } from '@/lib/utils';

interface PDFCardProps {
  document: PDFDocument;
  onRemove: (id: string) => void;
  onConfigure: (id: string) => void;
  isAutoConfigured?: boolean;
}

export default function PDFCard({ document, onRemove, onConfigure, isAutoConfigured }: PDFCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
  };

  const statusMap = {
    completed: {
      icon: <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />,
      label: 'Completed',
      glow: '0 0 12px -2px rgba(16, 185, 129, 0.2)',
      borderColor: 'rgba(16, 185, 129, 0.12)',
      barColor: 'var(--success)',
    },
    processing: {
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--warning)' }} />,
      label: 'Processing',
      glow: '0 0 12px -2px rgba(245, 158, 11, 0.2)',
      borderColor: 'rgba(245, 158, 11, 0.12)',
      barColor: 'var(--warning)',
    },
    error: {
      icon: <AlertCircle className="w-3.5 h-3.5" style={{ color: 'var(--error)' }} />,
      label: 'Error',
      glow: '0 0 12px -2px rgba(239, 68, 68, 0.15)',
      borderColor: 'rgba(239, 68, 68, 0.15)',
      barColor: 'var(--error)',
    },
    pending: {
      icon: null,
      label: 'Pending',
      glow: 'none',
      borderColor: 'var(--border)',
      barColor: 'transparent',
    },
  };

  const status = statusMap[document.status];

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="glass rounded-xl p-4 transition-all duration-300 gradient-border card-spotlight group hover:glow-sm relative overflow-hidden"
      style={{ borderColor: status.borderColor }}
    >
      {/* Top accent bar for non-pending status */}
      {document.status !== 'pending' && (
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: document.status === 'processing'
              ? `linear-gradient(90deg, transparent, ${status.barColor}, transparent)`
              : status.barColor,
            boxShadow: `0 0 10px 1px ${status.barColor}`,
            opacity: 0.6,
            animation: document.status === 'processing' ? 'holographic-shimmer 2s linear infinite' : undefined,
          }}
        />
      )}

      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0 mt-0.5">
          <div className="absolute inset-0 rounded-lg" style={{ background: 'var(--accent-1)', opacity: 0.15, filter: 'blur(8px)' }} />
          <div className="relative w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124, 92, 252, 0.1)', border: '1px solid rgba(124, 92, 252, 0.15)' }}>
            <FileText className="w-4 h-4" style={{ color: 'var(--accent-1)' }} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-white truncate">{document.file.name}</h3>
              <p className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{formatBytes(document.file.size)}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
              {document.status === 'pending' && (
                <button
                  onClick={() => onConfigure(document.id)}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ color: 'var(--text-tertiary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-1)'; e.currentTarget.style.background = 'rgba(124,92,252,0.12)'; e.currentTarget.style.boxShadow = '0 0 12px -2px rgba(124,92,252,0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = ''; e.currentTarget.style.boxShadow = ''; }}
                  title="Configure"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onRemove(document.id)}
                className="p-1.5 rounded-lg transition-all"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.boxShadow = '0 0 12px -2px rgba(239,68,68,0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = ''; e.currentTarget.style.boxShadow = ''; }}
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {document.label && (
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-md badge-glow" style={{ color: 'var(--accent-1)', background: 'rgba(124, 92, 252, 0.1)', border: '1px solid rgba(124, 92, 252, 0.15)' }}>
                {document.label}
              </span>
            )}
            {isAutoConfigured && document.label && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md badge-glow" style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.12)' }}>
                <Sparkles className="w-2.5 h-2.5" />
                auto
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
              {status.icon || <span className="w-1.5 h-1.5 rounded-full bg-white/20" />}
              {status.label}
            </span>
          </div>

          {document.error && (
            <div className="mt-2.5 p-2.5 rounded-lg text-xs" style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
              {document.error}
            </div>
          )}

          {document.result?.metadata && (
            <div className="mt-2 flex items-center gap-3 text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
              <span style={{ color: 'var(--accent-3)' }}>{document.result.metadata.method}</span>
              <span style={{ color: 'var(--border-hover)' }}>|</span>
              <span>{document.result.metadata.time_seconds}s</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
