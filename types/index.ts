/**
 * Tipos da aplicação de extração de PDFs
 */

export interface ExtractionSchema {
  [key: string]: string;
}

export interface PDFDocument {
  id: string;
  file: File;
  label: string;
  extraction_schema: ExtractionSchema;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: ExtractionResult;
  error?: string;
}

export interface ExtractionResult {
  success: boolean;
  data: Record<string, any>;
  metadata: {
    method: string;
    time_seconds?: number;
    time?: number;
    pipeline_info?: {
      method: string;
      similarity?: number;
      time: number;
      learned?: boolean;
    };
    cache_info?: {
      source?: string;
    };
  };
}

export interface BatchExtractionResult {
  index: number;
  filename: string;
  label: string;
  success: boolean;
  data: Record<string, any>;
  metadata: {
    method: string;
    time: number;
  };
}

export interface DatasetItem {
  label: string;
  extraction_schema: ExtractionSchema;
  pdf_path: string;
}

export type Dataset = DatasetItem[];

export interface Template {
  label: string;
  schema: ExtractionSchema;
}

