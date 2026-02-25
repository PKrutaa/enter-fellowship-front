'use client';

import React, { useState, useCallback } from 'react';
import { Upload, CheckCircle, AlertCircle, FileJson, ChevronDown, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dataset } from '@/types';

interface DatasetUploadProps {
  onDatasetLoaded: (dataset: Dataset) => void;
}

export default function DatasetUpload({ onDatasetLoaded }: DatasetUploadProps) {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const parseAndValidate = useCallback((content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed)) throw new Error('Dataset must be an array');
      for (const item of parsed) {
        if (!item.label || !item.extraction_schema || !item.pdf_path) {
          throw new Error('Each item must have label, extraction_schema, and pdf_path');
        }
      }
      setDataset(parsed);
      setError(null);
      onDatasetLoaded(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse JSON');
      setDataset(null);
    }
  }, [onDatasetLoaded]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => parseAndValidate(event.target?.result as string);
    reader.readAsText(file);
  }, [parseAndValidate]);

  const handleClear = useCallback(() => {
    setDataset(null);
    setError(null);
    onDatasetLoaded([]);
  }, [onDatasetLoaded]);

  return (
    <div className="glass rounded-xl overflow-hidden gradient-border">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
              <Database className="w-4 h-4" style={{ color: 'var(--accent-2)' }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Configuration Dataset</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                JSON to auto-configure PDFs
              </p>
            </div>
          </div>
          {dataset && (
            <button
              onClick={handleClear}
              className="text-xs font-mono px-2.5 py-1 rounded-md transition-all"
              style={{ color: 'var(--text-tertiary)', border: '1px solid var(--border)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              clear
            </button>
          )}
        </div>

        {/* Status */}
        {dataset && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.12)' }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--success)' }}>
                {dataset.length} {dataset.length === 1 ? 'configuration loaded' : 'configurations loaded'}
              </span>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.12)' }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" style={{ color: 'var(--error)' }} />
              <span className="text-xs" style={{ color: 'var(--error)' }}>{error}</span>
            </div>
          </motion.div>
        )}

        {/* Upload buttons */}
        <div className="space-y-2">
          <label className="relative flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all hover:glow-sm" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-4 h-4" style={{ color: 'var(--accent-2)' }} />
            <div className="flex-1">
              <div className="text-sm font-medium text-white">Upload JSON</div>
              <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Select a .json file</div>
            </div>
          </label>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <FileJson className="w-4 h-4" style={{ color: 'var(--accent-2)' }} />
              <div className="text-left">
                <div className="text-sm font-medium text-white">Paste JSON</div>
                <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Paste the dataset content</div>
              </div>
            </div>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            </motion.div>
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <textarea
                  placeholder='[{"label": "...", "extraction_schema": {...}, "pdf_path": "..."}]'
                  onChange={(e) => e.target.value.trim() && parseAndValidate(e.target.value)}
                  className="w-full h-32 px-4 py-3 rounded-lg text-sm font-mono text-white resize-none transition-all mt-1"
                  style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border)' }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Preview */}
        {dataset && dataset.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}
          >
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {dataset.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2 rounded-md text-[11px] font-mono"
                  style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--border)' }}
                >
                  <span className="text-white/80 truncate">{item.pdf_path}</span>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span style={{ color: 'var(--accent-1)' }}>{item.label}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>{Object.keys(item.extraction_schema).length}f</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
