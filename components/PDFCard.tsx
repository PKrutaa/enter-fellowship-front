'use client';

import React from 'react';
import { FileText, Trash2, CheckCircle, Loader2, AlertCircle, Settings, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { PDFDocument } from '@/types';
import { formatBytes } from '@/lib/utils';

interface PDFCardProps {
  document: PDFDocument;
  onRemove: (id: string) => void;
  onConfigure: (id: string) => void;
  isAutoConfigured?: boolean;
}

export default function PDFCard({ document, onRemove, onConfigure, isAutoConfigured }: PDFCardProps) {
  const getStatusIcon = () => {
    switch (document.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" style={{ color: '#86efac' }} />;
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#FFAE35' }} />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (document.status) {
      case 'completed':
        return '';
      case 'processing':
        return 'bg-black/20';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      default:
        return 'bg-black/20';
    }
  };

  const getBorderStyle = () => {
    switch (document.status) {
      case 'processing':
        return { borderColor: 'rgba(255, 174, 53, 0.3)', borderWidth: '1px' };
      case 'completed':
        return { borderColor: 'rgba(134, 239, 172, 0.2)', borderWidth: '1px' };
      case 'error':
        return {};
      default:
        return { borderColor: 'rgba(255, 174, 53, 0.1)', borderWidth: '1px' };
    }
  };

  const getStatusText = () => {
    switch (document.status) {
      case 'completed':
        return 'Concluído';
      case 'processing':
        return 'Processando...';
      case 'error':
        return 'Erro';
      default:
        return 'Aguardando';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`
        relative border rounded-lg p-5 backdrop-blur-sm
        transition-all duration-300
        ${getStatusColor()}
      `}
      style={getBorderStyle()}
      onMouseEnter={(e) => {
        if (document.status === 'pending') {
          e.currentTarget.style.borderColor = 'rgba(255, 174, 53, 0.3)';
        } else if (document.status === 'completed') {
          e.currentTarget.style.borderColor = 'rgba(134, 239, 172, 0.3)';
        }
      }}
      onMouseLeave={(e) => {
        if (document.status === 'pending') {
          e.currentTarget.style.borderColor = 'rgba(255, 174, 53, 0.1)';
        } else if (document.status === 'completed') {
          e.currentTarget.style.borderColor = 'rgba(134, 239, 172, 0.2)';
        }
      }}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <FileText className="w-6 h-6" style={{ color: '#FFAE35' }} />
        </div>

        {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">
                  {document.file.name}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatBytes(document.file.size)}
                </p>
              </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {document.status === 'pending' && (
                <button
                  onClick={() => onConfigure(document.id)}
                  className="p-2 text-gray-400 rounded-lg transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFAE35';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 174, 53, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '';
                    e.currentTarget.style.backgroundColor = '';
                  }}
                  title="Configurar"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onRemove(document.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Remover"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Label & Status */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {document.label && (
              <span className="px-2 py-1 text-xs font-medium rounded-md" style={{ color: '#FFAE35', backgroundColor: 'rgba(255, 174, 53, 0.1)', border: '1px solid rgba(255, 174, 53, 0.2)' }}>
                {document.label}
              </span>
            )}
            {isAutoConfigured && document.label && (
              <span className="px-2 py-1 text-xs font-medium rounded-md flex items-center gap-1" style={{ color: '#86efac', backgroundColor: 'rgba(134, 239, 172, 0.1)', border: '1px solid rgba(134, 239, 172, 0.2)' }}>
                <Sparkles className="w-3 h-3" />
                Auto-configurado
              </span>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              {getStatusIcon()}
              <span>{getStatusText()}</span>
            </div>
          </div>

          {/* Error message */}
          {document.error && (
            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-xs text-red-400">{document.error}</p>
            </div>
          )}

          {/* Extraction time */}
          {document.result?.metadata && (
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
              <span>
                Método: <span className="font-medium" style={{ color: '#FFAE35' }}>{document.result.metadata.method}</span>
              </span>
              <span>
                Tempo: <span className="font-medium" style={{ color: '#FFAE35' }}>{document.result.metadata.time_seconds}s</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

