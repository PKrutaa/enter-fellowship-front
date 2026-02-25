/**
 * API service for backend communication
 */

import { ExtractionSchema, ExtractionResult, BatchExtractionResult } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class APIService {
  /**
   * Extract data from a single PDF
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
      throw new Error(error.detail || 'Extraction failed');
    }

    return response.json();
  }

  /**
   * Extract data from multiple PDFs in batch with SSE (Server-Sent Events)
   */
  static async extractBatchWithSSE(
    documents: Array<{ file: File; label: string; schema: ExtractionSchema }>,
    onResult: (result: BatchExtractionResult) => void,
    onComplete?: (summary: any) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    const formData = new FormData();
    
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
      throw new Error('Request error: ' + errorText.substring(0, 100));
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('Unable to read response stream');
    }

    let buffer = '';
    let currentEvent = '';
    let currentData = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('SSE stream ended');
          break;
        }
        
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          if (trimmedLine.startsWith('event:')) {
            currentEvent = trimmedLine.substring(6).trim();
            console.log('SSE Event:', currentEvent);
          } else if (trimmedLine.startsWith('data:')) {
            currentData += trimmedLine.substring(5).trim();
          } else if (trimmedLine === '' && currentEvent && currentData) {
            console.log('SSE Data:', currentEvent, currentData);
            
            try {
              const parsedData = JSON.parse(currentData);
              
              if (currentEvent === 'result') {
                console.log('Result received:', parsedData);
                onResult(parsedData as BatchExtractionResult);
              } else if (currentEvent === 'complete') {
                console.log('Processing complete:', parsedData);
                onComplete?.(parsedData);
              } else if (currentEvent === 'error') {
                console.error('SSE error:', parsedData);
                onError?.(parsedData.error || 'Unknown error');
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', currentData, e);
            }
            
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
   * Check API health status
   */
  static async healthCheck(): Promise<{
    status: string;
    version: string;
    uptime_seconds: number;
    components: Record<string, string>;
  }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error('API is not responding');
    }

    return response.json();
  }

  /**
   * Get API statistics
   */
  static async getStats() {
    const response = await fetch(`${API_BASE_URL}/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }

    return response.json();
  }
}
