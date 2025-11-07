/**
 * Templates pré-definidos para tipos de documentos comuns
 */

import { Template } from '@/types';

export const DEFAULT_TEMPLATES: Template[] = [
  {
    label: 'carteira_oab',
    schema: {
      nome: 'Nome do profissional, normalmente no canto superior esquerdo da imagem',
      inscricao: 'Número de inscrição do profissional',
      seccional: 'Seccional do profissional',
      subsecao: 'Subseção à qual o profissional faz parte',
      categoria: 'Categoria, pode ser ADVOGADO, ADVOGADA, SUPLEMENTAR, ESTAGIARIO, ESTAGIARIA',
      endereco_profissional: 'Endereço do profissional',
      telefone_profissional: 'Telefone do profissional',
      situacao: 'Situação do profissional, normalmente no canto inferior direito',
    },
  },
  {
    label: 'tela_sistema',
    schema: {
      data_base: 'Data base da operação selecionada',
      data_vencimento: 'Data de vencimento da operação selecionada',
      quantidade_parcelas: 'Quantidade de parcelas da operação selecionada',
      produto: 'Produto da operação selecionada',
      sistema: 'Sistema da operação selecionada',
      tipo_de_operacao: 'Tipo de operação',
      tipo_de_sistema: 'Tipo de sistema',
    },
  },
];

export function getTemplateByLabel(label: string): Template | undefined {
  return DEFAULT_TEMPLATES.find(t => t.label === label);
}


