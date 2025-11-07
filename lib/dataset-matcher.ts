/**
 * Utilitários para fazer match entre PDFs e dataset
 */

import { Dataset, DatasetItem, PDFDocument } from '@/types';

/**
 * Faz match de um PDF com um item do dataset baseado no nome do arquivo
 */
export function matchPDFWithDataset(
  pdfFileName: string,
  dataset: Dataset
): DatasetItem | null {
  // Normaliza o nome do arquivo (remove path, lowercase)
  const normalizedFileName = pdfFileName.toLowerCase();
  
  // Tenta match direto
  let match = dataset.find(item => {
    const datasetPath = item.pdf_path.toLowerCase();
    return datasetPath === normalizedFileName || 
           datasetPath.endsWith(`/${normalizedFileName}`) ||
           datasetPath.endsWith(`\\${normalizedFileName}`);
  });

  if (match) return match;

  // Tenta match pelo nome base (sem extensão)
  const baseFileName = normalizedFileName.replace(/\.pdf$/, '');
  match = dataset.find(item => {
    const datasetPath = item.pdf_path.toLowerCase().replace(/\.pdf$/, '');
    const basePath = datasetPath.split(/[/\\]/).pop() || '';
    return basePath === baseFileName;
  });

  return match || null;
}

/**
 * Auto-configura PDFs baseado no dataset
 */
export function autoConfigurePDFs(
  documents: PDFDocument[],
  dataset: Dataset
): PDFDocument[] {
  return documents.map(doc => {
    const match = matchPDFWithDataset(doc.file.name, dataset);
    
    if (match && (!doc.label || Object.keys(doc.extraction_schema).length === 0)) {
      return {
        ...doc,
        label: match.label,
        extraction_schema: match.extraction_schema,
      };
    }
    
    return doc;
  });
}

/**
 * Verifica quantos PDFs foram auto-configurados
 */
export function getAutoConfiguredCount(
  documents: PDFDocument[],
  dataset: Dataset
): number {
  return documents.filter(doc => {
    const match = matchPDFWithDataset(doc.file.name, dataset);
    return match !== null;
  }).length;
}

/**
 * Retorna lista de PDFs que não foram encontrados no dataset
 */
export function getUnmatchedPDFs(
  documents: PDFDocument[],
  dataset: Dataset
): PDFDocument[] {
  return documents.filter(doc => {
    const match = matchPDFWithDataset(doc.file.name, dataset);
    return match === null;
  });
}


