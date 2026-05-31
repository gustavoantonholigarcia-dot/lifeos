import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { requireSupabase } from '@/shared/supabase';
import type { Modalidade, TreinoSessao } from './types';

export const treinoKeys = {
  all: ['treinos'] as const,
  sessoes: () => [...treinoKeys.all, 'sessoes'] as const,
  sessoesFiltradas: (modalidade?: Modalidade | null) =>
    [...treinoKeys.sessoes(), modalidade ?? 'todas'] as const,
  semana: (inicio: string) => [...treinoKeys.all, 'semana', inicio] as const,
};

function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useSessoesTreino(modalidade?: Modalidade | null) {
  return useQuery({
    queryKey: treinoKeys.sessoesFiltradas(modalidade),
    queryFn: async (): Promise<TreinoSessao[]> => {
      const supabase = requireSupabase();
      let query = supabase
        .from('treinos_sessoes')
        .select('*')
        .order('data', { ascending: false })
        .limit(50);

      if (modalidade) query = query.eq('modalidade', modalidade);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as TreinoSessao[];
    },
  });
}

export function useSessoesSemana() {
  const inicio = (() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  return useQuery({
    queryKey: treinoKeys.semana(inicio),
    queryFn: async (): Promise<TreinoSessao[]> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('treinos_sessoes')
        .select('*')
        .gte('data', inicio)
        .lte('data', hojeISO())
        .order('data', { ascending: true });

      if (error) throw error;
      return (data ?? []) as TreinoSessao[];
    },
  });
}

export function useCriarSessao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      modalidade: Modalidade;
      data: string;
      duracao_min?: number;
      observacoes?: string;
    }) => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { data, error } = await supabase
        .from('treinos_sessoes')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as TreinoSessao;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: treinoKeys.all });
    },
  });
}

export function useAtualizarSessao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<TreinoSessao> }) => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('treinos_sessoes')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as TreinoSessao;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: treinoKeys.all });
    },
  });
}

export function useDeletarSessao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = requireSupabase();
      const { error } = await supabase.from('treinos_sessoes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: treinoKeys.all });
    },
  });
}
