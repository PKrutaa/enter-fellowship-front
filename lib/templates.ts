/**
 * Pre-defined templates for common document types
 */

import { Template } from '@/types';

export const DEFAULT_TEMPLATES: Template[] = [
  {
    label: 'carteira_oab',
    schema: {
      nome: 'Professional name, usually in the top-left corner of the image',
      inscricao: 'Professional registration number',
      seccional: 'Professional section',
      subsecao: 'Sub-section the professional belongs to',
      categoria: 'Category, can be ADVOGADO, ADVOGADA, SUPLEMENTAR, ESTAGIARIO, ESTAGIARIA',
      endereco_profissional: 'Professional address',
      telefone_profissional: 'Professional phone number',
      situacao: 'Professional status, usually in the bottom-right corner',
    },
  },
  {
    label: 'tela_sistema',
    schema: {
      data_base: 'Base date of the selected operation',
      data_vencimento: 'Due date of the selected operation',
      quantidade_parcelas: 'Number of installments of the selected operation',
      produto: 'Product of the selected operation',
      sistema: 'System of the selected operation',
      tipo_de_operacao: 'Operation type',
      tipo_de_sistema: 'System type',
    },
  },
];

export function getTemplateByLabel(label: string): Template | undefined {
  return DEFAULT_TEMPLATES.find(t => t.label === label);
}
