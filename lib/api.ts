/**
 * Serviço de API para comunicação com o backend
 */

import { ExtractionSchema, ExtractionResult, BatchExtractionResult } from '@/types';

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
   * Extrai dados de múltiplos PDFs em batch com SSE (Server-Sent Events)
   */
  static async extractBatchWithSSE(
    documents: Array<{ file: File; label: string; schema: ExtractionSchema }>,
    onResult: (result: BatchExtractionResult) => void,
    onComplete?: (summary: any) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    const formData = new FormData();
    
    // Adiciona arquivos, labels e schemas intercalados
    documents.forEach(({ file, label, schema }) => {
      formData.append('files', file);
      formData.append('labels', label);
      formData.append('schemas', JSON.stringify(schema));
    });

    const response = await fetch(`${API_BASE_URL}/extract-batch`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Erro na requisição: ' + errorText.substring(0, 100));
    }

    // Lê SSE stream
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('Não foi possível ler o stream de resposta');
    }

    let buffer = '';
    let currentEvent = '';
    let currentData = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('SSE stream finalizado');
          break;
        }
        
        buffer += decoder.decode(value, { stream: true });
        
        // Processa linhas completas
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Guarda linha incompleta
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          if (trimmedLine.startsWith('event:')) {
            currentEvent = trimmedLine.substring(6).trim();
            console.log('SSE Event:', currentEvent);
          } else if (trimmedLine.startsWith('data:')) {
            currentData += trimmedLine.substring(5).trim();
          } else if (trimmedLine === '' && currentEvent && currentData) {
            // Evento completo
            console.log('SSE Data:', currentEvent, currentData);
            
            try {
              const parsedData = JSON.parse(currentData);
              
              if (currentEvent === 'result') {
                console.log('Resultado recebido:', parsedData);
                onResult(parsedData as BatchExtractionResult);
              } else if (currentEvent === 'complete') {
                console.log('Processamento completo:', parsedData);
                onComplete?.(parsedData);
              } else if (currentEvent === 'error') {
                console.error('Erro SSE:', parsedData);
                onError?.(parsedData.error || 'Erro desconhecido');
              }
            } catch (e) {
              console.error('Erro ao parsear SSE data:', currentData, e);
            }
            
            // Reset para próximo evento
            currentEvent = '';
            currentData = '';
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
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


