/**
 * Queries da agenda global.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { requireSupabase } from '@/shared/supabase';

import type {
  Anotacao,
  AnotacaoModulo,
  AtualizarAnotacaoInput,
  CriarAnotacaoInput,
} from './types';

export const agendaKeys = {
  all: ['agenda'] as const,
  porData: (data: string, modulo?: AnotacaoModulo | 'todos') =>
    [...agendaKeys.all, 'data', data, modulo ?? 'todos'] as const,
  porPeriodo: (de: string, ate: string, modulo?: AnotacaoModulo | 'todos') =>
    [...agendaKeys.all, 'periodo', de, ate, modulo ?? 'todos'] as const,
  item: (id: string) => [...agendaKeys.all, 'item', id] as const,
};

/** Anotações de um dia, opcionalmente filtradas por módulo */
export function useAnotacoesDoDia(data: string, modulo?: AnotacaoModulo | 'todos') {
  return useQuery({
    queryKey: agendaKeys.porData(data, modulo),
    queryFn: async (): Promise<Anotacao[]> => {
      const supabase = requireSupabase();
      let query = supabase
        .from('anotacoes')
        .select('*')
        .eq('data', data)
        .order('created_at', { ascending: false });
      if (modulo && modulo !== 'todos') {
        query = query.eq('modulo', modulo);
      }
      const { data: rows, error } = await query;
      if (error) throw error;
      return (rows ?? []) as Anotacao[];
    },
  });
}

/** Dias com anotação num período (pra dots no calendário) */
export function useDiasComAnotacao(
  de: string,
  ate: string,
  modulo?: AnotacaoModulo | 'todos',
) {
  return useQuery({
    queryKey: agendaKeys.porPeriodo(de, ate, modulo),
    queryFn: async (): Promise<Set<string>> => {
      const supabase = requireSupabase();
      let query = supabase
        .from('anotacoes')
        .select('data')
        .gte('data', de)
        .lte('data', ate);
      if (modulo && modulo !== 'todos') {
        query = query.eq('modulo', modulo);
      }
      const { data: rows, error } = await query;
      if (error) throw error;
      return new Set((rows ?? []).map((r: any) => r.data));
    },
  });
}

export function useCriarAnotacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CriarAnotacaoInput): Promise<Anotacao> => {
      const supabase = requireSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('anotacoes')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Anotacao;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: agendaKeys.all });
    },
  });
}

export function useAtualizarAnotacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: AtualizarAnotacaoInput;
    }): Promise<Anotacao> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('anotacoes')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Anotacao;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: agendaKeys.all });
    },
  });
}

export function useDeletarAnotacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = requireSupabase();
      const { error } = await supabase.from('anotacoes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: agendaKeys.all });
    },
  });
}
