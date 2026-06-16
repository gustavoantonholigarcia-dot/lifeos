/**
 * Types do mini-CRM da TAWA — espelham db/007_tawa_crm.sql
 */

export type ContatoTipo = 'prefeitura' | 'orgao' | 'empresa' | 'pessoa' | 'outro';

export type ContatoStatus =
  | 'prospecto'
  | 'em_conversa'
  | 'proposta'
  | 'ganho'
  | 'perdido';

export type CanalInteracao =
  | 'telefone'
  | 'email'
  | 'whatsapp'
  | 'presencial'
  | 'outro';

export interface Contato {
  id: string;
  user_id: string;
  nome: string;
  tipo: ContatoTipo;
  cidade: string | null;
  uf: string | null;
  telefone: string | null;
  email: string | null;
  status: ContatoStatus;
  edital_ref: string | null;
  observacoes: string | null;
  proximo_passo: string | null;
  proximo_passo_em: string | null;
  valor_estimado: number | null;
  motivo_perda: string | null;
  setor_id: string | null;
  /** Quão solícito/agradável é lidar com o contato: 0 (rude) a 10 (gente boa). */
  receptividade: number | null;
  created_at: string;
  updated_at: string;
}

/** Cor da nota de receptividade: vermelho (baixa) → âmbar → sage (alta). */
export function corReceptividade(nota: number): string {
  if (nota <= 3) return '#C25B4E'; // difícil
  if (nota <= 6) return '#E8A845'; // neutro
  return '#8FA899'; // gente boa
}

export function rotuloReceptividade(nota: number): string {
  if (nota <= 3) return 'Difícil';
  if (nota <= 6) return 'Neutro';
  return 'Gente boa';
}

export interface Interacao {
  id: string;
  user_id: string;
  contato_id: string;
  data: string;
  canal: CanalInteracao;
  conteudo: string;
  created_at: string;
}

/** Pessoa de contato dentro de um cliente (ex: secretário de saúde). */
export interface ContatoPessoa {
  id: string;
  user_id: string;
  contato_id: string;
  nome: string;
  cargo: string | null;
  telefone: string | null;
  email: string | null;
  observacao: string | null;
  ordem: number;
  created_at: string;
}

export interface CriarPessoaInput {
  contato_id: string;
  nome: string;
  cargo?: string;
  telefone?: string;
  email?: string;
  observacao?: string;
}

// ----------------------------------------------------------------------------
// Atas de registro de preços / empenhos
// ----------------------------------------------------------------------------
export type EmpenhoStatus = 'pendente' | 'em_conversa' | 'empenhado';

export interface Ata {
  id: string;
  user_id: string;
  nome: string;
  descricao: string | null;
  vigencia_em: string | null; // date — limite pra empenhar
  edital_ref: string | null;
  created_at: string;
}

export interface AtaLote {
  id: string;
  user_id: string;
  ata_id: string;
  numero: string | null;
  veiculo: string;
  edital_ref: string | null;
  valor_unitario: number | null;
  quantidade: number | null;
  ordem: number;
  created_at: string;
}

export interface Empenho {
  id: string;
  user_id: string;
  contato_id: string;
  lote_id: string;
  status: EmpenhoStatus;
  data_empenho: string | null;
  valor: number | null;
  observacao: string | null;
  created_at: string;
  updated_at: string;
}

/** Lote + o empenho da cidade atual (null = pendente, sem linha ainda). */
export interface LoteComEmpenho {
  lote: AtaLote;
  empenho: Empenho | null;
}

/** Ata participada por um contato, com seus lotes e status de empenho. */
export interface AtaDoContato {
  ata: Ata;
  lotes: LoteComEmpenho[];
}

/** Linha do painel da ata: uma cidade participante + empenho por lote. */
export interface ParticipanteDaAta {
  contato: Pick<Contato, 'id' | 'nome' | 'receptividade' | 'status' | 'telefone'>;
  /** lote_id -> empenho (ausente = pendente, sem linha ainda) */
  empenhos: Record<string, Empenho>;
}

/** Visão completa da ata: municípios × lotes, pro painel de farming. */
export interface AtaPainel {
  ata: Ata;
  lotes: AtaLote[];
  participantes: ParticipanteDaAta[];
}

/** Card de lote na lista (cada veículo de um consórcio, independente). */
export interface LoteCard {
  lote: AtaLote;
  ataNome: string;
  totalCidades: number;
  empenhados: number;
}

/** Painel de um único lote: as cidades do consórcio × o status deste lote. */
export interface LoteParticipante {
  contato: Pick<Contato, 'id' | 'nome' | 'receptividade' | 'status' | 'telefone'>;
  empenho: Empenho | null;
}

export interface LotePainel {
  lote: AtaLote;
  ataNome: string;
  ataVigencia: string | null;
  ataEdital: string | null;
  participantes: LoteParticipante[];
}

export const EMPENHO_STATUS_LABELS: Record<EmpenhoStatus, string> = {
  pendente: 'Pendente',
  em_conversa: 'Em conversa',
  empenhado: 'Empenhado',
};

export const EMPENHO_STATUS_CORES: Record<EmpenhoStatus, string> = {
  pendente: 'rgba(245,241,237,0.40)',
  em_conversa: '#6B8FB8',
  empenhado: '#8FA899',
};

export const EMPENHO_STATUS_SEQUENCE: EmpenhoStatus[] = [
  'pendente',
  'em_conversa',
  'empenhado',
];

export const TIPO_LABELS: Record<ContatoTipo, string> = {
  prefeitura: 'Prefeitura',
  orgao: 'Órgão público',
  empresa: 'Empresa',
  pessoa: 'Pessoa',
  outro: 'Outro',
};

export const TIPOS: ContatoTipo[] = ['prefeitura', 'orgao', 'empresa', 'pessoa', 'outro'];

export const STATUS_LABELS: Record<ContatoStatus, string> = {
  prospecto: 'Prospecto',
  em_conversa: 'Em conversa',
  proposta: 'Proposta',
  ganho: 'Ganho',
  perdido: 'Perdido',
};

// Funil: vermilion frio -> quente -> verde (ganho) / stone (perdido)
export const STATUS_CORES: Record<ContatoStatus, string> = {
  prospecto: 'rgba(245,241,237,0.45)',
  em_conversa: '#6B8FB8',
  proposta: '#E8A845',
  ganho: '#8FA899',
  perdido: '#78716C',
};

export const STATUS_SEQUENCE: ContatoStatus[] = [
  'prospecto',
  'em_conversa',
  'proposta',
  'ganho',
  'perdido',
];

export const CANAL_LABELS: Record<CanalInteracao, string> = {
  telefone: 'Telefone',
  email: 'E-mail',
  whatsapp: 'WhatsApp',
  presencial: 'Presencial',
  outro: 'Outro',
};

export const CANAIS: CanalInteracao[] = [
  'telefone',
  'whatsapp',
  'email',
  'presencial',
  'outro',
];

export interface CriarContatoInput {
  nome: string;
  tipo?: ContatoTipo;
  cidade?: string;
  uf?: string;
  telefone?: string;
  email?: string;
  status?: ContatoStatus;
  edital_ref?: string;
  observacoes?: string;
  proximo_passo?: string;
  proximo_passo_em?: string;
  valor_estimado?: number;
  setor_id?: string;
}
