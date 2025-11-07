'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Sparkles, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExtractionSchema } from '@/types';
import { DEFAULT_TEMPLATES } from '@/lib/templates';

interface SchemaEditorProps {
  isOpen: boolean;
  fileName: string;
  initialLabel?: string;
  initialSchema?: ExtractionSchema;
  onClose: () => void;
  onSave: (label: string, schema: ExtractionSchema) => void;
}

export default function SchemaEditor({
  isOpen,
  fileName,
  initialLabel = '',
  initialSchema = {},
  onClose,
  onSave,
}: SchemaEditorProps) {
  const [label, setLabel] = useState(initialLabel);
  const [schema, setSchema] = useState<ExtractionSchema>(initialSchema);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  useEffect(() => {
    setLabel(initialLabel);
    setSchema(initialSchema);
  }, [initialLabel, initialSchema, isOpen]);

  const handleAddField = () => {
    if (newFieldKey.trim() && newFieldValue.trim()) {
      setSchema({ ...schema, [newFieldKey.trim()]: newFieldValue.trim() });
      setNewFieldKey('');
      setNewFieldValue('');
    }
  };

  const handleRemoveField = (key: string) => {
    const newSchema = { ...schema };
    delete newSchema[key];
    setSchema(newSchema);
  };

  const handleUpdateField = (key: string, value: string) => {
    setSchema({ ...schema, [key]: value });
  };

  const handleLoadTemplate = (templateLabel: string) => {
    const template = DEFAULT_TEMPLATES.find(t => t.label === templateLabel);
    if (template) {
      setLabel(template.label);
      setSchema(template.schema);
    }
  };

  const handleSave = () => {
    if (label.trim() && Object.keys(schema).length > 0) {
      onSave(label.trim(), schema);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-dark-50 border rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col" style={{ borderColor: 'rgba(255, 174, 53, 0.3)' }}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b bg-gradient-to-r" style={{ borderBottomColor: 'rgba(255, 174, 53, 0.3)', backgroundImage: 'linear-gradient(to right, rgba(255, 174, 53, 0.1), rgba(255, 174, 53, 0.1))' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 174, 53, 0.2)', border: '1px solid rgba(255, 174, 53, 0.4)' }}>
                  <FileText className="w-5 h-5" style={{ color: '#FFAE35' }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Configurar Extração</h2>
                  <p className="text-sm text-gray-400 truncate max-w-md">{fileName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 rounded-lg transition-colors"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 174, 53, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '';
                  e.currentTarget.style.backgroundColor = '';
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Templates */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                <Sparkles className="w-4 h-4 inline mr-1" style={{ color: '#FFAE35' }} />
                Templates Pré-definidos
              </label>
              <div className="grid grid-cols-2 gap-3">
                {DEFAULT_TEMPLATES.map((template) => (
                  <button
                    key={template.label}
                    onClick={() => handleLoadTemplate(template.label)}
                    className="px-4 py-3 text-left border rounded-xl transition-all group"
                    style={{ borderColor: 'rgba(255, 174, 53, 0.3)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#FFAE35';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 174, 53, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 174, 53, 0.3)';
                      e.currentTarget.style.backgroundColor = '';
                    }}
                  >
                    <div className="font-medium text-white">
                      {template.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {Object.keys(template.schema).length} campos
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Label */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Label do Documento *
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: carteira_oab, tela_sistema"
                className="w-full px-4 py-3 bg-dark-50/50 border rounded-xl outline-none transition-all text-white placeholder:text-gray-500"
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
            </div>

            {/* Schema Fields */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Campos do Schema *
              </label>
              
              <div className="space-y-3 mb-4">
                {Object.entries(schema).map(([key, value]) => (
                  <div key={key} className="flex gap-2 items-start group">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={key}
                        disabled
                        className="px-3 py-2 border rounded-lg bg-dark-50/50 text-gray-300 text-sm font-medium" style={{ borderColor: 'rgba(255, 174, 53, 0.3)' }}
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleUpdateField(key, e.target.value)}
                        className="px-3 py-2 bg-dark-50/50 border rounded-lg outline-none transition-all text-sm text-white placeholder:text-gray-500"
                        style={{ borderColor: 'rgba(255, 174, 53, 0.3)' }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#FFAE35';
                          e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255, 174, 53, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255, 174, 53, 0.3)';
                          e.currentTarget.style.boxShadow = '';
                        }}
                        placeholder="Descrição do campo"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveField(key)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add new field */}
              <div className="p-4 bg-dark-50/50 rounded-xl border-2 border-dashed" style={{ borderColor: 'rgba(255, 174, 53, 0.3)' }}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFieldKey}
                    onChange={(e) => setNewFieldKey(e.target.value)}
                    placeholder="Nome do campo"
                    className="flex-1 px-3 py-2 bg-dark-50/50 border rounded-lg outline-none transition-all text-sm text-white placeholder:text-gray-500"
                    style={{ borderColor: 'rgba(255, 174, 53, 0.3)' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#FFAE35';
                      e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255, 174, 53, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 174, 53, 0.3)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddField()}
                  />
                  <input
                    type="text"
                    value={newFieldValue}
                    onChange={(e) => setNewFieldValue(e.target.value)}
                    placeholder="Descrição"
                    className="flex-1 px-3 py-2 bg-dark-50/50 border rounded-lg outline-none transition-all text-sm text-white placeholder:text-gray-500"
                    style={{ borderColor: 'rgba(255, 174, 53, 0.3)' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#FFAE35';
                      e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255, 174, 53, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 174, 53, 0.3)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddField()}
                  />
                  <button
                    onClick={handleAddField}
                    className="px-4 py-2 border rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
                    style={{ backgroundColor: 'rgba(255, 174, 53, 0.2)', borderColor: '#FFAE35', color: '#FFAE35' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFAE35';
                      e.currentTarget.style.color = 'black';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 174, 53, 0.2)';
                      e.currentTarget.style.color = '#FFAE35';
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-dark-50/50 flex justify-end gap-3" style={{ borderTopColor: 'rgba(255, 174, 53, 0.3)' }}>
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-300 bg-dark-50/50 border border-gray-600 rounded-xl hover:bg-dark-100 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!label.trim() || Object.keys(schema).length === 0}
              className="px-6 py-2.5 border-2 rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: '#FFAE35', backgroundColor: 'rgba(255, 174, 53, 0.2)', color: '#FFAE35' }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = '#FFAE35';
                  e.currentTarget.style.color = 'black';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 174, 53, 0.2)';
                  e.currentTarget.style.color = '#FFAE35';
                }
              }}
            >
              Salvar Configuração
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

