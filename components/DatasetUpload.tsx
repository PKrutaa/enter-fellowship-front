'use client';

import React, { useState, useCallback } from 'react';
import { Database, Upload, CheckCircle, AlertCircle, FileJson } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dataset } from '@/types';

interface DatasetUploadProps {
  onDatasetLoaded: (dataset: Dataset) => void;
}

export default function DatasetUpload({ onDatasetLoaded }: DatasetUploadProps) {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Validate dataset structure
        if (!Array.isArray(parsed)) {
          throw new Error('Dataset deve ser um array');
        }

        for (const item of parsed) {
          if (!item.label || !item.extraction_schema || !item.pdf_path) {
            throw new Error('Dataset inválido: cada item deve ter label, extraction_schema e pdf_path');
          }
        }

        setDataset(parsed);
        setError(null);
        onDatasetLoaded(parsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao parsear JSON');
        setDataset(null);
      }
    };
    reader.readAsText(file);
  }, [onDatasetLoaded]);

  const handleTextInput = useCallback((text: string) => {
    try {
      const parsed = JSON.parse(text);
      
      if (!Array.isArray(parsed)) {
        throw new Error('Dataset deve ser um array');
      }

      for (const item of parsed) {
        if (!item.label || !item.extraction_schema || !item.pdf_path) {
          throw new Error('Dataset inválido: cada item deve ter label, extraction_schema e pdf_path');
        }
      }

      setDataset(parsed);
      setError(null);
      onDatasetLoaded(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao parsear JSON');
      setDataset(null);
    }
  }, [onDatasetLoaded]);

  const handleClear = useCallback(() => {
    setDataset(null);
    setError(null);
    onDatasetLoaded([]);
  }, [onDatasetLoaded]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="border rounded-lg p-6 bg-black/20" style={{ borderColor: 'rgba(255, 174, 53, 0.1)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              Dataset de Configuração
            </h3>
            <p className="text-sm text-gray-500">
              Carregue um JSON para auto-configurar os PDFs
            </p>
          </div>
          {dataset && (
            <button
              onClick={handleClear}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Status */}
        {dataset && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" style={{ color: '#86efac' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#86efac' }}>
                  Dataset carregado com sucesso!
                </p>
                <p className="text-xs" style={{ color: 'rgba(134, 239, 172, 0.8)' }}>
                  {dataset.length} {dataset.length === 1 ? 'configuração encontrada' : 'configurações encontradas'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Upload Options */}
        <div className="space-y-3">
          {/* File Upload */}
          <div>
            <label className="relative flex items-center gap-3 px-4 py-3 border rounded-xl transition-all cursor-pointer group"
              style={{ borderColor: 'rgba(255, 174, 53, 0.3)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FFAE35';
                e.currentTarget.style.backgroundColor = 'rgba(255, 174, 53, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 174, 53, 0.3)';
                e.currentTarget.style.backgroundColor = '';
              }}>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="p-2 rounded-lg transition-colors" style={{ backgroundColor: 'rgba(255, 174, 53, 0.2)' }}>
                <Upload className="w-5 h-5" style={{ color: '#FFAE35' }} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">
                  Upload arquivo JSON
                </div>
                <div className="text-xs text-gray-400">
                  Selecione um arquivo .json do seu computador
                </div>
              </div>
            </label>
          </div>

          {/* Text Input Toggle */}
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 border rounded-xl transition-all group"
              style={{ borderColor: 'rgba(255, 174, 53, 0.3)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FFAE35';
                e.currentTarget.style.backgroundColor = 'rgba(255, 174, 53, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 174, 53, 0.3)';
                e.currentTarget.style.backgroundColor = '';
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg transition-colors" style={{ backgroundColor: 'rgba(255, 174, 53, 0.2)' }}>
                  <FileJson className="w-5 h-5" style={{ color: '#FFAE35' }} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">
                    Colar JSON manualmente
                  </div>
                  <div className="text-xs text-gray-400">
                    Digite ou cole o JSON do dataset
                  </div>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-2">
                    <textarea
                      placeholder='[{"label": "carteira_oab", "extraction_schema": {...}, "pdf_path": "oab_1.pdf"}]'
                      onChange={(e) => handleTextInput(e.target.value)}
                      className="w-full h-40 px-4 py-3 bg-dark-50/50 border rounded-xl outline-none transition-all text-sm font-mono resize-none text-white placeholder:text-gray-500"
                      style={{ borderColor: 'rgba(255, 174, 53, 0.3)' }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#FFAE35';
                        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255, 174, 53, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 174, 53, 0.3)';
                        e.currentTarget.style.boxShadow = '';
                      }}
                    />
                    <p className="text-xs text-gray-400">
                      Cole o JSON do dataset acima. A configuração será aplicada automaticamente aos PDFs carregados.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Dataset Preview */}
        {dataset && dataset.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <h4 className="text-sm font-semibold text-white mb-3">Configurações do Dataset:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {dataset.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2 bg-dark-50/50 border rounded-lg text-xs"
                  style={{ borderColor: 'rgba(255, 174, 53, 0.2)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-500">#{index + 1}</span>
                    <span className="font-semibold text-white">{item.pdf_path}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded font-medium" style={{ backgroundColor: 'rgba(255, 174, 53, 0.2)', color: '#FFAE35' }}>
                      {item.label}
                    </span>
                    <span className="text-gray-400">
                      {Object.keys(item.extraction_schema).length} campos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Help */}
        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 174, 53, 0.1)', border: '1px solid rgba(255, 174, 53, 0.3)' }}>
          <p className="text-xs text-gray-400">
            Estrutura do dataset: 
            <code className="px-1 py-0.5 bg-dark-50/50 border rounded ml-1" style={{ borderColor: 'rgba(255, 174, 53, 0.2)', color: '#FFD280' }}>
              {`[{label, extraction_schema, pdf_path}]`}
            </code>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

