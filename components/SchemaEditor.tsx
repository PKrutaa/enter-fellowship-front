'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Sparkles, FileText, ArrowRight } from 'lucide-react';
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
    const template = DEFAULT_TEMPLATES.find((t) => t.label === templateLabel);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="glass rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col glow-md"
          style={{ background: 'rgba(12, 12, 30, 0.95)' }}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124, 92, 252, 0.1)', border: '1px solid rgba(124, 92, 252, 0.2)' }}>
                  <FileText className="w-5 h-5" style={{ color: 'var(--accent-1)' }} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Configure Extraction</h2>
                  <p className="text-xs font-mono truncate max-w-md mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{fileName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-all"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Templates */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-1)' }} />
                Templates
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_TEMPLATES.map((template) => (
                  <button
                    key={template.label}
                    onClick={() => handleLoadTemplate(template.label)}
                    className="glass px-4 py-3 text-left rounded-xl transition-all gradient-border hover:glow-sm"
                  >
                    <div className="text-sm font-medium text-white">{template.label}</div>
                    <div className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      {Object.keys(template.schema).length} fields
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Label */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
                Label *
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: carteira_oab, tela_sistema"
                className="w-full px-4 py-3 rounded-xl text-sm font-mono text-white transition-all"
                style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)' }}
              />
            </div>

            {/* Schema Fields */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
                Schema Fields *
              </label>

              <div className="space-y-2 mb-4">
                {Object.entries(schema).map(([key, value]) => (
                  <div key={key} className="flex gap-2 items-center group">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={key}
                        disabled
                        className="px-3 py-2.5 rounded-lg text-sm font-mono"
                        style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)', color: 'var(--text-tertiary)' }}
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleUpdateField(key, e.target.value)}
                        className="px-3 py-2.5 rounded-lg text-sm text-white transition-all"
                        style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)' }}
                        placeholder="Description"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveField(key)}
                      className="p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = ''; }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add new field */}
              <div className="p-4 rounded-xl border-2 border-dashed" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFieldKey}
                    onChange={(e) => setNewFieldKey(e.target.value)}
                    placeholder="Field name"
                    className="flex-1 px-3 py-2.5 rounded-lg text-sm font-mono text-white transition-all"
                    style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)' }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddField()}
                  />
                  <input
                    type="text"
                    value={newFieldValue}
                    onChange={(e) => setNewFieldValue(e.target.value)}
                    placeholder="Description"
                    className="flex-1 px-3 py-2.5 rounded-lg text-sm text-white transition-all"
                    style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)' }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddField()}
                  />
                  <button
                    onClick={handleAddField}
                    className="btn-primary inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--border)' }}>
            <button onClick={onClose} className="btn-ghost px-5 py-2.5 rounded-xl text-sm font-medium">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!label.trim() || Object.keys(schema).length === 0}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
            >
              Save
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
