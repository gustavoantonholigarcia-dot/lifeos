/**
 * Types da agenda global — anotações livres datadas, por módulo.
 */

import type { ModuleKey } from '@/constants/theme';

export type AnotacaoModulo = ModuleKey | 'geral';

export interface Anotacao {
  id: string;
  user_id: string;
  data: string;             // 'YYYY-MM-DD'
  modulo: AnotacaoModulo;
  conteudo: string;
  setor_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CriarAnotacaoInput {
  data?: string;            // default: hoje
  modulo: AnotacaoModulo;
  conteudo: string;
  setor_id?: string;
}

export interface AtualizarAnotacaoInput {
  conteudo?: string;
  modulo?: AnotacaoModulo;
  setor_id?: string | null;
  data?: string;
}

/** Ordem TAWA primeiro (foco principal), depois alfabético */
export const AGENDA_MODULOS_ORDEM: AnotacaoModulo[] = [
  'tawa',
  'utfpr',
  'treinos',
  'ruah',
  'estudos',
  'projetos',
  'intercambio',
  'ideias',
  'geral',
];

export const AGENDA_MODULO_LABELS: Record<AnotacaoModulo, string> = {
  tawa: 'TAWA',
  utfpr: 'UTFPR',
  treinos: 'Treinos',
  ruah: 'RUAH',
  estudos: 'Estudos',
  projetos: 'Projetos',
  intercambio: 'Intercâmbio',
  ideias: 'Ideias',
  geral: 'Geral',
};
