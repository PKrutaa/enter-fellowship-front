/**
 * Utilities for matching PDFs with dataset entries
 */

import { Dataset, DatasetItem, PDFDocument } from '@/types';

/**
 * Match a PDF with a dataset item based on file name
 */
export function matchPDFWithDataset(
  pdfFileName: string,
  dataset: Dataset
): DatasetItem | null {
  const normalizedFileName = pdfFileName.toLowerCase();
  
  let match = dataset.find(item => {
    const datasetPath = item.pdf_path.toLowerCase();
    return datasetPath === normalizedFileName || 
           datasetPath.endsWith(`/${normalizedFileName}`) ||
           datasetPath.endsWith(`\\${normalizedFileName}`);
  });

  if (match) return match;

  const baseFileName = normalizedFileName.replace(/\.pdf$/, '');
  match = dataset.find(item => {
    const datasetPath = item.pdf_path.toLowerCase().replace(/\.pdf$/, '');
    const basePath = datasetPath.split(/[/\\]/).pop() || '';
    return basePath === baseFileName;
  });

  return match || null;
}

/**
 * Auto-configure PDFs based on dataset
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
 * Count how many PDFs were auto-configured
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
 * Return list of PDFs not found in dataset
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
