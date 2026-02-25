'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, Check, Terminal, Clock, Cpu, ChevronRight } from 'lucide-react';
import { PDFDocument } from '@/types';

interface ResultsDisplayProps {
  documents: PDFDocument[];
}

export default function ResultsDisplay({ documents }: ResultsDisplayProps) {
  const completedDocs = documents.filter((doc) => doc.status === 'completed');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (docId: string, result: any) => {
    navigator.clipboard.writeText(JSON.stringify(result.data, null, 2));
    setCopiedId(docId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadAll = () => {
    const allResults = completedDocs.map((doc) => ({
      filename: doc.file.name, label: doc.label, data: doc.result?.data, metadata: doc.result?.metadata,
    }));
    const blob = new Blob([JSON.stringify(allResults, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extraction-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (completedDocs.length === 0) return null;

  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Results</h2>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full badge-glow" style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
            {completedDocs.length} extracted
          </span>
        </div>
        <button onClick={handleDownloadAll} className="btn-ghost inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium">
          <Download className="w-3.5 h-3.5" />
          Download JSON
        </button>
      </div>

      <div className="space-y-4">
        {completedDocs.map((doc, i) => (
          <ResultCard key={doc.id} doc={doc} index={i} copiedId={copiedId} onCopy={handleCopy} />
        ))}
      </div>
    </motion.section>
  );
}

function ResultCard({ doc, index, copiedId, onCopy }: { doc: PDFDocument; index: number; copiedId: string | null; onCopy: (id: string, result: any) => void }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="glass rounded-xl overflow-hidden gradient-border card-spotlight hover:glow-sm transition-all duration-300"
    >
      {/* Success accent line at top */}
      <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, var(--success), rgba(6,182,212,0.5), transparent)', boxShadow: '0 0 10px 1px rgba(16,185,129,0.15)' }} />

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h3 className="text-sm font-medium text-white">{doc.file.name}</h3>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-md badge-glow" style={{ color: 'var(--accent-1)', background: 'rgba(124, 92, 252, 0.1)', border: '1px solid rgba(124, 92, 252, 0.15)' }}>
              {doc.label}
            </span>
            {doc.result?.metadata && (
              <div className="flex items-center gap-3 text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3" style={{ color: 'var(--accent-3)' }} />
                  {doc.result.metadata.method}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {doc.result.metadata.time_seconds}s
                </span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => onCopy(doc.id, doc.result)}
          className="p-2 rounded-lg transition-all"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,92,252,0.08)'; e.currentTarget.style.color = 'var(--accent-1)'; e.currentTarget.style.boxShadow = '0 0 12px -2px rgba(124,92,252,0.15)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.boxShadow = ''; }}
          title="Copy JSON"
        >
          {copiedId === doc.id ? <Check className="w-4 h-4" style={{ color: 'var(--success)' }} /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Terminal-style data */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-3.5 h-3.5" style={{ color: 'var(--accent-2)' }} />
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
            output
          </span>
          {/* Fake terminal dots */}
          <div className="flex-1" />
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(239, 68, 68, 0.4)' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(245, 158, 11, 0.4)' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(16, 185, 129, 0.4)' }} />
          </div>
        </div>
        <div
          className="rounded-lg p-4 font-mono text-[13px] leading-relaxed relative overflow-hidden"
          style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid var(--border)' }}
        >
          {/* Scan line inside terminal */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute left-0 right-0 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(124,92,252,0.15), transparent)',
                animation: 'scan-sweep 6s ease-in-out infinite',
              }}
            />
          </div>

          <div className="relative space-y-0.5">
            {doc.result?.data &&
              Object.entries(doc.result.data).map(([key, value]) => (
                <div key={key} className="flex items-start gap-1.5">
                  <ChevronRight className="w-3 h-3 mt-[3px] flex-shrink-0" style={{ color: 'rgba(124,92,252,0.4)' }} />
                  <span style={{ color: 'var(--accent-1)' }}>{key}</span>
                  <span style={{ color: 'var(--text-tertiary)' }}>:</span>
                  <span className="text-white/85 flex-1 break-words">
                    {value !== null && value !== undefined ? String(value) : (
                      <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>null</span>
                    )}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
