import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { requireSupabase } from '@/shared/supabase';
import type { Tarefa } from '@/modules/tawa/types';

export interface Disciplina {
  id: string;
  user_id: string;
  nome: string;
  codigo: string | null;
  cor: string;
  semestre: string;
  created_at: string;
}

export interface Avaliacao {
  id: string;
  disciplina_id: string;
  tipo: string;
  nome: string | null;
  peso: number;
  nota: number | null;
  data: string | null;
  created_at: string;
}

export const utfprKeys = {
  all: ['utfpr'] as const,
  disciplinas: () => [...utfprKeys.all, 'disciplinas'] as const,
  avaliacoes: (disciplinaId: string) => [...utfprKeys.all, 'avaliacoes', disciplinaId] as const,
  tarefas: () => [...utfprKeys.all, 'tarefas'] as const,
};

export function useDisciplinas() {
  return useQuery({
    queryKey: utfprKeys.disciplinas(),
    queryFn: async (): Promise<Disciplina[]> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('utfpr_disciplinas')
        .select('*')
        .order('nome');
      if (error) throw error;
      return (data ?? []) as Disciplina[];
    },
  });
}

export function useAvaliacoes(disciplinaId: string) {
  return useQuery({
    queryKey: utfprKeys.avaliacoes(disciplinaId),
    queryFn: async (): Promise<Avaliacao[]> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('utfpr_avaliacoes')
        .select('*')
        .eq('disciplina_id', disciplinaId)
        .order('data', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Avaliacao[];
    },
    enabled: !!disciplinaId,
  });
}

export function useTarefasUtfpr() {
  return useQuery({
    queryKey: utfprKeys.tarefas(),
    queryFn: async (): Promise<Tarefa[]> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .eq('modulo', 'utfpr')
        .in('status', ['a_fazer', 'em_andamento'])
        .order('prazo_em', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as Tarefa[];
    },
  });
}

export function useCriarDisciplina() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nome: string; codigo?: string; cor?: string; semestre?: string }) => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('utfpr_disciplinas')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Disciplina;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: utfprKeys.disciplinas() }),
  });
}

export function useCriarAvaliacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      disciplina_id: string;
      tipo: string;
      nome?: string;
      peso?: number;
      nota?: number;
      data?: string;
    }) => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('utfpr_avaliacoes')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Avaliacao;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: utfprKeys.avaliacoes(vars.disciplina_id) }),
  });
}
