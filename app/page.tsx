'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Cpu, FileText, ArrowRight, Layers, Sparkles, Activity } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import CursorGlow from '@/components/CursorGlow';
import FileUpload from '@/components/FileUpload';
import PDFCard from '@/components/PDFCard';
import SchemaEditor from '@/components/SchemaEditor';
import ResultsDisplay from '@/components/ResultsDisplay';
import DatasetUpload from '@/components/DatasetUpload';
import { PDFDocument, ExtractionSchema, Dataset } from '@/types';
import { generateId } from '@/lib/utils';
import { APIService } from '@/lib/api';
import { autoConfigurePDFs, matchPDFWithDataset } from '@/lib/dataset-matcher';

export default function Home() {
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [dataset, setDataset] = useState<Dataset>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    const phrases = [
      'Extracting data with AI',
      'Automating workflows',
      'Structuring information',
      'Optimizing processes',
    ];
    const currentPhrase = phrases[currentPhraseIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayedText.length < currentPhrase.length) {
        timeout = setTimeout(() => setDisplayedText(currentPhrase.slice(0, displayedText.length + 1)), 55);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => setDisplayedText(displayedText.slice(0, -1)), 25);
      } else {
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentPhraseIndex]);

  const handleFilesSelected = useCallback((files: File[]) => {
    const newDocs: PDFDocument[] = files.map((file) => ({
      id: generateId(), file, label: '', extraction_schema: {}, status: 'pending',
    }));
    const configured = dataset.length > 0 ? autoConfigurePDFs(newDocs, dataset) : newDocs;
    setDocuments((prev) => [...prev, ...configured]);
    if (files.length === 1 && dataset.length === 0) {
      setTimeout(() => { setEditingDocId(configured[0].id); setIsEditorOpen(true); }, 300);
    }
  }, [dataset]);

  const handleRemoveDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  }, []);

  const handleConfigureDocument = useCallback((id: string) => {
    setEditingDocId(id); setIsEditorOpen(true);
  }, []);

  const handleSaveSchema = useCallback((label: string, schema: ExtractionSchema) => {
    if (editingDocId) {
      setDocuments((prev) => prev.map((doc) => doc.id === editingDocId ? { ...doc, label, extraction_schema: schema } : doc));
    }
    setEditingDocId(null);
  }, [editingDocId]);

  const handleDatasetLoaded = useCallback((newDataset: Dataset) => {
    setDataset(newDataset);
    if (newDataset.length > 0) setDocuments((prev) => autoConfigurePDFs(prev, newDataset));
  }, []);

  const handleProcessAll = async () => {
    const pendingDocs = documents.filter((doc) => doc.status === 'pending' && doc.label && Object.keys(doc.extraction_schema).length > 0);
    if (pendingDocs.length === 0) return;
    setIsProcessing(true);
    const pendingIds = pendingDocs.map((d) => d.id);
    setDocuments((prev) => prev.map((d) => (pendingIds.includes(d.id) ? { ...d, status: 'processing' as const } : d)));
    const receivedResults = new Set<number>();
    const timeoutId = setTimeout(() => {
      setDocuments((prev) => prev.map((d) => {
        const i = pendingDocs.findIndex((pd) => pd.id === d.id);
        if (i !== -1 && !receivedResults.has(i) && d.status === 'processing') return { ...d, status: 'error' as const, error: 'Timeout: no response from server' };
        return d;
      }));
      setIsProcessing(false);
    }, 60000);

    try {
      await APIService.extractBatchWithSSE(
        pendingDocs.map((doc) => ({ file: doc.file, label: doc.label, schema: doc.extraction_schema })),
        (br) => {
          receivedResults.add(br.index);
          if (br.index >= 0 && br.index < pendingDocs.length) {
            const doc = pendingDocs[br.index];
            setDocuments((prev) => prev.map((d) => d.id === doc.id ? {
              ...d,
              status: br.success ? 'completed' as const : 'error' as const,
              result: br.success ? { success: true, data: br.data, metadata: { method: br.metadata.method, time_seconds: br.metadata.time } } : undefined,
              error: br.success ? undefined : 'Extraction failed',
            } : d));
          }
        },
        () => clearTimeout(timeoutId),
        (err) => { setDocuments((prev) => prev.map((d) => pendingIds.includes(d.id) ? { ...d, status: 'error' as const, error: err } : d)); }
      );
    } catch (error) {
      clearTimeout(timeoutId);
      setDocuments((prev) => prev.map((d) => pendingIds.includes(d.id) ? { ...d, status: 'error' as const, error: error instanceof Error ? error.message : 'Processing error' } : d));
    }
    clearTimeout(timeoutId);
    setIsProcessing(false);
  };

  const editingDoc = documents.find((doc) => doc.id === editingDocId);
  const configuredCount = documents.filter((doc) => doc.label && Object.keys(doc.extraction_schema).length > 0).length;
  const completedCount = documents.filter((doc) => doc.status === 'completed').length;
  const processingCount = documents.filter((doc) => doc.status === 'processing').length;

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <CursorGlow />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b" style={{ borderColor: 'var(--border)', background: 'rgba(5, 5, 16, 0.7)', backdropFilter: 'blur(24px) saturate(1.3)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo with pulse ring */}
            <div className="relative">
              <div className="absolute inset-0 rounded-xl animate-pulse" style={{ background: 'var(--gradient-primary)', opacity: 0.2, filter: 'blur(8px)' }} />
              <div className="relative w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-vivid)', backgroundSize: '300% 300%', animation: 'gradient-shift 4s ease infinite' }}>
                <Cpu className="w-4.5 h-4.5 text-white" />
              </div>
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-white">
              PDF Extractor
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full badge-glow" style={{ color: 'var(--accent-3)', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
              AI v2.0
            </span>
          </div>

          <div className="flex items-center gap-6">
            {documents.length > 0 && (
              <div className="flex items-center gap-5 text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  {documents.length} docs
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-1)' }} />
                  {configuredCount} ready
                </span>
                {processingCount > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--warning)', boxShadow: '0 0 8px rgba(245,158,11,0.4)' }} />
                    {processingCount} processing
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)', boxShadow: '0 0 6px rgba(16,185,129,0.3)' }} />
                  {completedCount} done
                </span>
              </div>
            )}
            <div className="h-5 w-px" style={{ background: 'var(--border)' }} />
            <div className="flex items-center gap-1.5 text-[11px] font-mono" style={{ color: 'var(--success)' }}>
              <Activity className="w-3 h-3" />
              <span>online</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-[2] max-w-6xl mx-auto px-6">
        {/* Hero Section */}
        <section className="pt-28 pb-24 relative">
          {/* Orbital rings decoration */}
          <div className="absolute top-20 right-0 w-[400px] h-[400px] opacity-[0.06] pointer-events-none hidden lg:block">
            <div className="absolute inset-0 rounded-full border" style={{ borderColor: 'var(--accent-1)', animation: 'pulse-ring 4s ease-in-out infinite' }} />
            <div className="absolute inset-8 rounded-full border" style={{ borderColor: 'var(--accent-2)', animation: 'pulse-ring 4s ease-in-out 0.5s infinite' }} />
            <div className="absolute inset-16 rounded-full border" style={{ borderColor: 'var(--accent-3)', animation: 'pulse-ring 4s ease-in-out 1s infinite' }} />
            {/* Orbiting dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div style={{ '--orbit-radius': '160px', animation: 'orbit 12s linear infinite' } as React.CSSProperties}>
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-1)', boxShadow: '0 0 10px 2px rgba(124,92,252,0.4)' }} />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div style={{ '--orbit-radius': '120px', animation: 'orbit 8s linear reverse infinite' } as React.CSSProperties}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-3)', boxShadow: '0 0 8px 2px rgba(6,182,212,0.3)' }} />
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.25, 0.1, 0, 1] }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-8 holographic badge-glow" style={{ color: 'var(--accent-1)', border: '1px solid rgba(124, 92, 252, 0.2)' }}>
              <Sparkles className="w-3.5 h-3.5" />
              Powered by AI Agents
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
              <span className="gradient-text">{displayedText}</span>
              <span className="inline-block w-[3px] h-[1em] ml-1 align-middle rounded-full" style={{ background: 'var(--accent-1)', animation: 'pulse-ring 1.2s ease-in-out infinite', verticalAlign: 'baseline' }} />
              <br />
              <span className="text-white/90">from PDF documents.</span>
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-lg sm:text-xl max-w-2xl leading-relaxed mb-12"
              style={{ color: 'var(--text-secondary)' }}
            >
              Upload, configure extraction schemas, and process hundreds
              of documents simultaneously with artificial intelligence.
            </motion.p>

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-wrap items-center gap-5"
            >
              <a href="#upload" className="btn-primary inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </a>
              <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                <span className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(124, 92, 252, 0.08)', border: '1px solid rgba(124, 92, 252, 0.15)' }}>
                    <Layers className="w-3 h-3" style={{ color: 'var(--accent-1)' }} />
                  </div>
                  Batch processing
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
                    <FileText className="w-3 h-3" style={{ color: 'var(--accent-2)' }} />
                  </div>
                  Custom schemas
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Decorative beam below hero */}
          <div className="mt-20 h-px w-full beam-line" />
        </section>

        {/* Dataset Section */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-8">
          <DatasetUpload onDatasetLoaded={handleDatasetLoaded} />
        </motion.section>

        {/* Upload Section */}
        <motion.section id="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-16">
          <FileUpload onFilesSelected={handleFilesSelected} disabled={isProcessing} />
        </motion.section>

        {/* Documents Grid */}
        <AnimatePresence>
          {documents.length > 0 && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-white">Documents</h2>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full" style={{ color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                    {documents.length}
                  </span>
                </div>
                {configuredCount > 0 && (
                  <button
                    onClick={handleProcessAll}
                    disabled={isProcessing}
                    className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isProcessing ? (
                      <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                    ) : (
                      <><Zap className="w-3.5 h-3.5" /> Process All</>
                    )}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documents.map((doc, i) => (
                  <motion.div key={doc.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
                    <PDFCard
                      document={doc}
                      onRemove={handleRemoveDocument}
                      onConfigure={handleConfigureDocument}
                      isAutoConfigured={dataset.length > 0 && matchPDFWithDataset(doc.file.name, dataset) !== null}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <ResultsDisplay documents={documents} />

        {/* Empty State */}
        {documents.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center py-28">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-2xl" style={{ background: 'var(--gradient-primary)', opacity: 0.08, filter: 'blur(12px)' }} />
              <div className="relative w-20 h-20 rounded-2xl glass-strong flex items-center justify-center">
                <FileText className="w-8 h-8" style={{ color: 'var(--text-tertiary)' }} />
              </div>
            </div>
            <p className="text-base mb-2" style={{ color: 'var(--text-secondary)' }}>No documents loaded</p>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Drag PDFs to the area above or click to select</p>
          </motion.div>
        )}

        <div className="h-20" />
      </main>

      {editingDoc && (
        <SchemaEditor
          isOpen={isEditorOpen}
          fileName={editingDoc.file.name}
          initialLabel={editingDoc.label}
          initialSchema={editingDoc.extraction_schema}
          onClose={() => { setIsEditorOpen(false); setEditingDocId(null); }}
          onSave={handleSaveSchema}
        />
      )}
    </div>
  );
}
