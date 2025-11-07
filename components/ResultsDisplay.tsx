'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Copy, Download, Database } from 'lucide-react';
import { PDFDocument } from '@/types';

interface ResultsDisplayProps {
  documents: PDFDocument[];
}

export default function ResultsDisplay({ documents }: ResultsDisplayProps) {
  const completedDocs = documents.filter(doc => doc.status === 'completed');

  const handleCopyResult = (result: any) => {
    navigator.clipboard.writeText(JSON.stringify(result.data, null, 2));
  };

  const handleDownloadAll = () => {
    const allResults = completedDocs.map(doc => ({
      filename: doc.file.name,
      label: doc.label,
      data: doc.result?.data,
      metadata: doc.result?.metadata,
    }));

    const blob = new Blob([JSON.stringify(allResults, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extraction-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (completedDocs.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-white mb-1">Resultados</h2>
          <p className="text-sm text-gray-500 uppercase tracking-wider">
            {completedDocs.length} {completedDocs.length === 1 ? 'documento processado' : 'documentos processados'}
          </p>
        </div>
        {completedDocs.length > 0 && (
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-2 px-8 py-3 border-2 border-white text-white rounded-full hover:bg-white hover:text-black transition-all font-medium uppercase text-sm tracking-wide"
          >
            <Download className="w-4 h-4" />
            Baixar Todos
          </button>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {completedDocs.map((doc) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border bg-black/20 rounded-lg p-6 transition-all"
            style={{ borderColor: 'rgba(134, 239, 172, 0.15)' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(134, 239, 172, 0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(134, 239, 172, 0.15)'}
          >
            {/* Document info */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white">{doc.file.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-1 text-xs font-medium rounded-md" style={{ color: '#FFAE35', backgroundColor: 'rgba(255, 174, 53, 0.2)', border: '1px solid rgba(255, 174, 53, 0.4)' }}>
                    {doc.label}
                  </span>
                  {doc.result?.metadata.method && (
                    <span className="px-2 py-1 text-xs font-medium text-gray-400 bg-dark-50/50 border border-gray-600 rounded-md">
                      {doc.result.metadata.method}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleCopyResult(doc.result)}
                className="p-2 text-gray-400 rounded-lg transition-colors"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FFAE35';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 174, 53, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '';
                  e.currentTarget.style.backgroundColor = '';
                }}
                title="Copiar JSON"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {/* Extracted data */}
            <div className="bg-dark-50/50 rounded-lg p-4 border" style={{ borderColor: 'rgba(255, 174, 53, 0.2)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-4 h-4" style={{ color: '#FFAE35' }} />
                <span className="text-sm font-semibold text-white">Dados Extraídos</span>
              </div>
              <div className="space-y-2">
                {doc.result?.data && Object.entries(doc.result.data).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-3 text-sm">
                    <span className="font-medium text-gray-400 min-w-[150px]">{key}:</span>
                    <span className="text-white flex-1">
                      {value !== null && value !== undefined ? String(value) : (
                        <span className="text-gray-500 italic">não encontrado</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata */}
            {doc.result?.metadata && (
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                <span>
                  Tempo: <span className="font-medium" style={{ color: '#FFAE35' }}>{doc.result.metadata.time_seconds}s</span>
                </span>
                {doc.result.metadata.pipeline_info?.similarity !== undefined && (
                  <span>
                    Similaridade: <span className="font-medium" style={{ color: '#FFAE35' }}>{doc.result.metadata.pipeline_info.similarity}%</span>
                  </span>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

