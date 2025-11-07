'use client';

import React, { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export default function FileUpload({ onFilesSelected, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );

    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesSelected(Array.from(files));
    }
  }, [onFilesSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-16 text-center
          transition-all duration-300 ease-in-out
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isDragging ? 'bg-black/40' : 'border-gray-800 bg-black/20'}
        `}
        style={{
          borderColor: isDragging ? '#FFAE35' : undefined,
          backgroundColor: isDragging ? 'rgba(255, 174, 53, 0.1)' : undefined
        }}
        onMouseEnter={(e) => {
          if (!isDragging && !disabled) {
            e.currentTarget.style.borderColor = 'rgba(255, 174, 53, 0.5)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging && !disabled) {
            e.currentTarget.style.borderColor = '';
          }
        }}
      >
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          id="file-upload"
        />
        
        <motion.div
          animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center justify-center space-y-4"
        >
          <div>
            {isDragging ? (
              <FileText className="w-16 h-16 mb-4" style={{ color: '#FFAE35' }} />
            ) : (
              <Upload className="w-16 h-16 text-gray-600 mb-4" />
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xl font-semibold text-white">
              {isDragging ? 'Solte os arquivos aqui' : 'Arraste PDFs ou clique para selecionar'}
            </p>
            <p className="text-sm text-gray-400">
              Suporta múltiplos arquivos PDF
            </p>
          </div>

          <div className="flex items-center gap-2 px-8 py-3 border-2 border-white text-white rounded-full font-medium hover:bg-white hover:text-black transition-all uppercase text-sm tracking-wide">
            <Upload className="w-4 h-4" />
            <span>Selecionar Arquivos</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

