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
  setor_id: string | null;
  created_at: string;
  updated_at: string;
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
  setor_id?: string;
}
