/**
 * Types do módulo TAWA — espelham o schema em db/001_schema_inicial.sql
 */

export type Modulo = 'tawa' | 'utfpr' | 'ruah' | 'projeto' | 'intercambio';

export type StatusTarefa = 'a_fazer' | 'em_andamento' | 'concluido';

export type Prioridade = 'alta' | 'media' | 'baixa' | 'sem';

export type PrazoTipo = 'fixo' | 'variavel' | 'sem';

export type OrigemTarefa = 'minha' | 'delegada';

export type SetorTawaNome =
  | 'Comercial'
  | 'Jurídico'
  | 'Logística'
  | 'Administrativo'
  | 'Financeiro';

export interface SetorTawa {
  id: string;
  nome: SetorTawaNome;
  cor: string;
  ordem: number;
  created_at: string;
}

export interface Tarefa {
  id: string;
  user_id: string;
  modulo: Modulo;
  setor_id: string | null;

  titulo: string;
  descricao: string | null;
  observacoes: string | null;

  status: StatusTarefa;
  prioridade: Prioridade;

  ordem: string; // fractional-indexing

  prazo_tipo: PrazoTipo;
  prazo_em: string | null;

  origem: OrigemTarefa;
  delegado_por: string | null;

  recorrente: Record<string, unknown> | null;

  concluida_em: string | null;
  created_at: string;
  updated_at: string;
}

export interface TarefaComSetor extends Tarefa {
  setor?: SetorTawa | null;
}

/**
 * Input pra criar uma tarefa nova (campos opcionais com defaults no DB)
 */
export interface CriarTarefaInput {
  modulo: Modulo;
  titulo: string;
  setor_id?: string;
  descricao?: string;
  observacoes?: string;
  prioridade?: Prioridade;
  prazo_tipo?: PrazoTipo;
  prazo_em?: string; // ISO
  origem?: OrigemTarefa;
  delegado_por?: string;
}

/**
 * Input pra atualizar (todos opcionais).
 */
export type AtualizarTarefaInput = Partial<
  Omit<Tarefa, 'id' | 'user_id' | 'created_at' | 'updated_at'>
>;

/**
 * Mapeamento UI: prioridade -> cor da barra esquerda do card.
 */
// Cores do design system v2 — vermilion / amber / sage
export const PRIORIDADE_CORES: Record<Prioridade, string> = {
  alta: '#E04830',      // vermilion
  media: '#E8A845',     // amber
  baixa: '#8FA899',     // sage warm
  sem: '#78716C',       // stone-500
} as const;

/**
 * Mapeamento UI: prioridade -> label visível.
 */
export const PRIORIDADE_LABELS: Record<Prioridade, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
  sem: 'Sem',
} as const;

/**
 * Mapeamento UI: status -> label visível.
 */
export const STATUS_LABELS: Record<StatusTarefa, string> = {
  a_fazer: 'A fazer',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
} as const;

/**
 * Sequência canônica de status (pra swipe → avançar).
 */
export const STATUS_SEQUENCE: StatusTarefa[] = ['a_fazer', 'em_andamento', 'concluido'];

export function proximoStatus(atual: StatusTarefa): StatusTarefa {
  const idx = STATUS_SEQUENCE.indexOf(atual);
  return STATUS_SEQUENCE[Math.min(idx + 1, STATUS_SEQUENCE.length - 1)];
}

export function statusAnterior(atual: StatusTarefa): StatusTarefa {
  const idx = STATUS_SEQUENCE.indexOf(atual);
  return STATUS_SEQUENCE[Math.max(idx - 1, 0)];
}
