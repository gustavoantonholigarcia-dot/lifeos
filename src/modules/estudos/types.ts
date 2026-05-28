/**
 * Types do módulo Estudos — espelham db/002_estudos.sql
 */

export type Nivel = 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2' | 'nativo';

export type TipoSessao =
  | 'gramatica'
  | 'leitura'
  | 'audicao'
  | 'fala'
  | 'escrita'
  | 'vocabulario'
  | 'misto';

export type StatusCertificacao = 'planejado' | 'inscrito' | 'realizado' | 'cancelado';

export interface Idioma {
  id: string;
  user_id: string;
  nome: string;
  codigo: string | null;
  bandeira_emoji: string | null;
  nivel_atual: Nivel;
  nivel_meta: Nivel | null;
  ativo: boolean;
  cor: string;
  ordem: number;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IdiomaResumo extends Idioma {
  minutos_total: number;
  dias_estudados: number;
  ultima_sessao: string | null;
  certs_planejadas: number;
}

export interface Sessao {
  id: string;
  user_id: string;
  idioma_id: string;
  data: string;             // 'YYYY-MM-DD'
  duracao_min: number;
  tipo: TipoSessao;
  fonte: string | null;
  observacoes: string | null;
  created_at: string;
}

export interface Certificacao {
  id: string;
  user_id: string;
  idioma_id: string;
  nome: string;             // 'TOEFL iBT', 'IELTS', etc.
  nivel_alvo: Nivel | null;
  status: StatusCertificacao;
  data_alvo: string | null;
  data_realizada: string | null;
  nota: string | null;
  local: string | null;
  custo: number | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

// Inputs

export interface CriarIdiomaInput {
  nome: string;
  codigo?: string;
  bandeira_emoji?: string;
  nivel_atual: Nivel;
  nivel_meta?: Nivel;
  cor?: string;
  ordem?: number;
  observacoes?: string;
}

export interface CriarSessaoInput {
  idioma_id: string;
  data?: string;             // default = hoje
  duracao_min: number;
  tipo: TipoSessao;
  fonte?: string;
  observacoes?: string;
}

export interface CriarCertificacaoInput {
  idioma_id: string;
  nome: string;
  nivel_alvo?: Nivel;
  status?: StatusCertificacao;
  data_alvo?: string;
  local?: string;
  custo?: number;
  observacoes?: string;
}

// UI helpers

export const NIVEL_LABELS: Record<Nivel, string> = {
  a1: 'A1 · Básico',
  a2: 'A2 · Pré-intermediário',
  b1: 'B1 · Intermediário',
  b2: 'B2 · Intermediário superior',
  c1: 'C1 · Avançado',
  c2: 'C2 · Proficiência',
  nativo: 'Nativo',
} as const;

export const NIVEIS: Nivel[] = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

export const TIPO_LABELS: Record<TipoSessao, string> = {
  gramatica: 'Gramática',
  leitura: 'Leitura',
  audicao: 'Áudio',
  fala: 'Fala',
  escrita: 'Escrita',
  vocabulario: 'Vocabulário',
  misto: 'Misto',
} as const;

export const STATUS_CERT_LABELS: Record<StatusCertificacao, string> = {
  planejado: 'Planejado',
  inscrito: 'Inscrito',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
} as const;

/**
 * Sugestões de idiomas com bandeira pré-definida
 */
export const IDIOMAS_SUGESTOES: Array<{ nome: string; codigo: string; bandeira: string }> = [
  { nome: 'Inglês', codigo: 'en', bandeira: '🇬🇧' },
  { nome: 'Espanhol', codigo: 'es', bandeira: '🇪🇸' },
  { nome: 'Francês', codigo: 'fr', bandeira: '🇫🇷' },
  { nome: 'Alemão', codigo: 'de', bandeira: '🇩🇪' },
  { nome: 'Italiano', codigo: 'it', bandeira: '🇮🇹' },
  { nome: 'Japonês', codigo: 'ja', bandeira: '🇯🇵' },
  { nome: 'Mandarim', codigo: 'zh', bandeira: '🇨🇳' },
];

/**
 * Sugestões de certificações populares por idioma
 */
export const CERTIFICACOES_SUGESTOES: Record<string, string[]> = {
  en: ['TOEFL iBT', 'IELTS Academic', 'Cambridge FCE (B2)', 'Cambridge CAE (C1)', 'Cambridge CPE (C2)'],
  es: ['DELE A2', 'DELE B1', 'DELE B2', 'DELE C1', 'SIELE'],
  fr: ['DELF A2', 'DELF B1', 'DELF B2', 'DALF C1', 'TCF'],
  de: ['Goethe A2', 'Goethe B1', 'Goethe B2', 'TestDaF', 'TELC'],
  it: ['CILS B1', 'CILS B2', 'CELI'],
};
