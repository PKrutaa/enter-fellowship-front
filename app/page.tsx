'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Activity, Zap, FileText, Settings as SettingsIcon } from 'lucide-react';
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
      'Otimizando seu tempo',
      'Melhorando sua experiência',
      'Extraindo dados de PDFs',
      'Automatizando processos'
    ];
    
    const currentPhrase = phrases[currentPhraseIndex];
    let timeout: NodeJS.Timeout;
    
    if (!isDeleting) {
      // Escrevendo
      if (displayedText.length < currentPhrase.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentPhrase.slice(0, displayedText.length + 1));
        }, 60);
      } else {
        // Pausa antes de apagar
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 1000);
      }
    } else {
      // Apagando
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 30);
      } else {
        // Próxima frase
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }
    
    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentPhraseIndex]);

  const handleFilesSelected = useCallback((files: File[]) => {
    const newDocs: PDFDocument[] = files.map((file) => ({
      id: generateId(),
      file,
      label: '',
      extraction_schema: {},
      status: 'pending',
    }));
    
    // Auto-configure with dataset if available
    const configured = dataset.length > 0 
      ? autoConfigurePDFs(newDocs, dataset)
      : newDocs;
    
    setDocuments((prev) => [...prev, ...configured]);
    
    // Auto-open editor for first document if only one file and no dataset
    if (files.length === 1 && dataset.length === 0) {
      setTimeout(() => {
        setEditingDocId(configured[0].id);
        setIsEditorOpen(true);
      }, 300);
    }
  }, [dataset]);

  const handleRemoveDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  }, []);

  const handleConfigureDocument = useCallback((id: string) => {
    setEditingDocId(id);
    setIsEditorOpen(true);
  }, []);

  const handleSaveSchema = useCallback(
    (label: string, schema: ExtractionSchema) => {
      if (editingDocId) {
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === editingDocId
              ? { ...doc, label, extraction_schema: schema }
              : doc
          )
        );
      }
      setEditingDocId(null);
    },
    [editingDocId]
  );

  const handleDatasetLoaded = useCallback((newDataset: Dataset) => {
    setDataset(newDataset);
    
    // Auto-configure existing documents
    if (newDataset.length > 0) {
      setDocuments((prev) => autoConfigurePDFs(prev, newDataset));
    }
  }, []);

  const handleProcessAll = async () => {
    const pendingDocs = documents.filter(
      (doc) => doc.status === 'pending' && doc.label && Object.keys(doc.extraction_schema).length > 0
    );

    if (pendingDocs.length === 0) {
      alert('Nenhum documento configurado para processar');
      return;
    }

    setIsProcessing(true);

    // Mark all as processing
    const pendingIds = pendingDocs.map(d => d.id);
    setDocuments((prev) =>
      prev.map((d) => pendingIds.includes(d.id) ? { ...d, status: 'processing' as const } : d)
    );

    // Process all in parallel - update each one as it completes
    const processingPromises = pendingDocs.map(async (doc) => {
      try {
        const result = await APIService.extractPDF(
          doc.file,
          doc.label,
          doc.extraction_schema
        );

        // Update this specific document immediately when done
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id
              ? { ...d, status: 'completed' as const, result }
              : d
          )
        );
      } catch (error) {
        console.error('Error processing document:', error);
        
        // Update this specific document with error immediately
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id
              ? {
                  ...d,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'Erro desconhecido',
                }
              : d
          )
        );
      }
    });

    // Wait for all to complete
    await Promise.allSettled(processingPromises);

    setIsProcessing(false);
  };

  const editingDoc = documents.find((doc) => doc.id === editingDocId);
  const configuredCount = documents.filter(
    (doc) => doc.label && Object.keys(doc.extraction_schema).length > 0
  ).length;
  const completedCount = documents.filter((doc) => doc.status === 'completed').length;

  return (
    <div className="min-h-screen bg-black">
      {/* Animated background shapes - very subtle */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.02, 0.04, 0.02],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl" style={{ backgroundColor: '#FFAE35' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Logo ENTER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 flex items-center gap-2"
        >
          <span className="text-4xl text-white" style={{ fontFamily: 'Helvetica, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>
            ENTER
          </span>
          <svg width="32" height="36" viewBox="0 0 458 511" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M451.427 0H166.682C163.368 0 160.682 2.68629 160.682 6V279.082C160.682 282.396 157.996 285.082 154.682 285.082H6C2.68629 285.082 0 287.768 0 291.082V504.556C0 507.869 2.68629 510.556 6 510.556H451.427C454.741 510.556 457.427 507.869 457.427 504.556V6C457.427 2.68629 454.741 0 451.427 0Z" fill="#FFFFFF"/>
          </svg>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-left mb-20 max-w-5xl"
        >
          <h1 className="text-5xl md:text-6xl mb-8 leading-[1.2]" style={{ fontWeight: 300, fontFamily: 'Helvetica, sans-serif' }}>
            <span style={{ color: '#FFAE35' }}>
              {displayedText}
            </span>
            <br />
            <span className="text-white">
              com Agentes de IA
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl leading-relaxed">
            Análise exaustiva de documentos PDF com inteligência artificial. 
            Automatize a extração de dados estruturados com precisão e velocidade.
          </p>
        </motion.div>

        {/* Stats - Simplified */}
        {documents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-8 mb-12 text-sm"
          >
            <div>
              <div className="text-5xl font-bold mb-1" style={{ color: '#FFAE35' }}>{documents.length}</div>
              <div className="text-gray-600 uppercase tracking-wider text-xs">Documentos</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-1" style={{ color: '#FFAE35' }}>{configuredCount}</div>
              <div className="text-gray-600 uppercase tracking-wider text-xs">Configurados</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-1" style={{ color: '#86efac' }}>{completedCount}</div>
              <div className="text-gray-600 uppercase tracking-wider text-xs">Processados</div>
            </div>
          </motion.div>
        )}

        {/* Dataset Upload Section */}
        <div className="mb-8">
          <DatasetUpload onDatasetLoaded={handleDatasetLoaded} />
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <FileUpload onFilesSelected={handleFilesSelected} disabled={isProcessing} />
        </div>

        {/* Documents List */}
        {documents.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold text-white">Documentos</h2>
              {configuredCount > 0 && (
                <button
                  onClick={handleProcessAll}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-8 py-3 border-2 border-white text-white rounded-full hover:bg-white hover:text-black transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm tracking-wide"
                >
                  <Zap className="w-4 h-4" />
                  {isProcessing ? 'Processando...' : 'Processar Todos'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => {
                const isAutoConfigured = dataset.length > 0 && 
                  matchPDFWithDataset(doc.file.name, dataset) !== null;
                
                return (
                  <PDFCard
                    key={doc.id}
                    document={doc}
                    onRemove={handleRemoveDocument}
                    onConfigure={handleConfigureDocument}
                    isAutoConfigured={isAutoConfigured}
                  />
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Results */}
        <ResultsDisplay documents={documents} />

        {/* Empty State */}
        {documents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-left py-12"
          >
            <p className="text-gray-500 text-lg">
              Faça upload de arquivos PDF para começar
            </p>
          </motion.div>
        )}
      </div>

      {/* Schema Editor Modal */}
      {editingDoc && (
        <SchemaEditor
          isOpen={isEditorOpen}
          fileName={editingDoc.file.name}
          initialLabel={editingDoc.label}
          initialSchema={editingDoc.extraction_schema}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingDocId(null);
          }}
          onSave={handleSaveSchema}
        />
      )}
    </div>
  );
}

