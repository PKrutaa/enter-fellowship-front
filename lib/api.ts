/**
 * Serviço de API para comunicação com o backend
 */

import { ExtractionSchema, ExtractionResult } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class APIService {
  /**
   * Extrai dados de um PDF usando o backend
   */
  static async extractPDF(
    file: File,
    label: string,
    schema: ExtractionSchema
  ): Promise<ExtractionResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('label', label);
    formData.append('extraction_schema', JSON.stringify(schema));

    const response = await fetch(`${API_BASE_URL}/extract`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || 'Erro na extração');
    }

    return response.json();
  }

  /**
   * Extrai dados de múltiplos PDFs em paralelo
   */
  static async extractBatch(
    files: Array<{ file: File; label: string; schema: ExtractionSchema }>
  ): Promise<ExtractionResult[]> {
    // Processa todos em paralelo
    const promises = files.map(({ file, label, schema }) =>
      this.extractPDF(file, label, schema)
    );

    return Promise.all(promises);
  }

  /**
   * Verifica o status da API
   */
  static async healthCheck(): Promise<{
    status: string;
    version: string;
    uptime_seconds: number;
    components: Record<string, string>;
  }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error('API não está respondendo');
    }

    return response.json();
  }

  /**
   * Obtém estatísticas da API
   */
  static async getStats() {
    const response = await fetch(`${API_BASE_URL}/stats`);
    
    if (!response.ok) {
      throw new Error('Erro ao obter estatísticas');
    }

    return response.json();
  }
}


