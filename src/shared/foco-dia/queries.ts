import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { requireSupabase } from '@/shared/supabase';
import type { Tarefa } from '@/modules/tawa/types';
import { tawaKeys } from '@/modules/tawa/queries';

export const focoKeys = {
  all: ['foco-dia'] as const,
  dia: (data: string) => [...focoKeys.all, data] as const,
};

function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export interface FocoItem {
  id: string;
  tarefa_id: string;
  ordem: string;
  tarefa: Tarefa;
}

export function useFocoDia() {
  const hoje = hojeISO();
  return useQuery({
    queryKey: focoKeys.dia(hoje),
    queryFn: async (): Promise<FocoItem[]> => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('prioridades_diarias')
        .select('id, tarefa_id, ordem, tarefas(*)')
        .eq('data', hoje)
        .eq('user_id', user.id)
        .order('ordem', { ascending: true });

      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        tarefa_id: row.tarefa_id,
        ordem: row.ordem,
        tarefa: row.tarefas as Tarefa,
      }));
    },
  });
}

export function useTarefasPendentes() {
  return useQuery({
    queryKey: ['tarefas-pendentes-foco'],
    queryFn: async (): Promise<Tarefa[]> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .in('status', ['a_fazer', 'em_andamento'])
        .order('prioridade', { ascending: true })
        .order('prazo_em', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as Tarefa[];
    },
  });
}

export function useAdicionarFoco() {
  const qc = useQueryClient();
  const hoje = hojeISO();
  return useMutation({
    mutationFn: async (tarefa_id: string) => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { data: existing } = await supabase
        .from('prioridades_diarias')
        .select('ordem')
        .eq('user_id', user.id)
        .eq('data', hoje)
        .order('ordem', { ascending: false })
        .limit(1);

      const lastOrdem = existing?.[0]?.ordem ?? 'a0';
      const nextChar = String.fromCharCode(lastOrdem.charCodeAt(0) + 1);
      const novaOrdem = nextChar + '0';

      const { error } = await supabase
        .from('prioridades_diarias')
        .insert({ user_id: user.id, data: hoje, tarefa_id, ordem: novaOrdem });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: focoKeys.dia(hoje) });
    },
  });
}

export function useRemoverFoco() {
  const qc = useQueryClient();
  const hoje = hojeISO();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = requireSupabase();
      const { error } = await supabase
        .from('prioridades_diarias')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: focoKeys.dia(hoje) });
      qc.invalidateQueries({ queryKey: tawaKeys.tarefas() });
    },
  });
}
