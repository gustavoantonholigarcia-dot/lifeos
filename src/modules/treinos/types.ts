export type Modalidade = 'judo' | 'jiu' | 'tenis' | 'academia';

export type StatusSessao = 'planejado' | 'concluido' | 'cancelado';

export interface TreinoSessao {
  id: string;
  user_id: string;
  modalidade: Modalidade;
  data: string;
  duracao_min: number | null;
  status: StatusSessao;
  observacoes: string | null;
  created_at: string;
}

export interface AcademiaTemplate {
  id: string;
  user_id: string;
  nome: string;
  ordem: string;
  created_at: string;
  exercicios?: AcademiaExercicio[];
}

export interface AcademiaExercicio {
  id: string;
  template_id: string;
  nome_exercicio: string;
  ordem: string;
}

export interface AcademiaSerie {
  id: string;
  sessao_id: string;
  exercicio_id: string;
  ordem: number;
  peso: number | null;
  reps: number | null;
  completo: boolean;
}

export const MODALIDADE_CONFIG: Record<Modalidade, { label: string; emoji: string; cor: string }> = {
  judo: { label: 'Judô', emoji: '🥋', cor: '#E04830' },
  jiu: { label: 'Jiu-jitsu', emoji: '🤼', cor: '#6B8FB8' },
  tenis: { label: 'Tênis', emoji: '🎾', cor: '#8FA899' },
  academia: { label: 'Academia', emoji: '🏋️', cor: '#E8A845' },
};

export const MODALIDADES: Modalidade[] = ['judo', 'jiu', 'tenis', 'academia'];
