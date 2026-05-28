/**
 * Queries TanStack Query do módulo TAWA.
 * Bate direto no Supabase via supabase-js.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  agendarSeNecessario,
  cancelarNotificacoesTarefa,
} from '@/shared/notifications/scheduler';
import { requireSupabase } from '@/shared/supabase';
import type {
  AtualizarTarefaInput,
  CriarTarefaInput,
  SetorTawa,
  StatusTarefa,
  Tarefa,
} from './types';

// ============================================================================
// Query keys (centralizadas pra invalidação consistente)
// ============================================================================
export const tawaKeys = {
  all: ['tawa'] as const,
  setores: () => [...tawaKeys.all, 'setores'] as const,
  tarefas: () => [...tawaKeys.all, 'tarefas'] as const,
  // Lista filtrada — inclui TODOS os filtros na chave pra evitar cache cruzado.
  tarefasFiltradas: (filtro?: { setor_id?: string | null; status?: StatusTarefa }) =>
    [
      ...tawaKeys.tarefas(),
      'lista',
      filtro?.setor_id ?? null,
      filtro?.status ?? null,
    ] as const,
  tarefa: (id: string) => [...tawaKeys.tarefas(), 'item', id] as const,
};

// ============================================================================
// Setores
// ============================================================================
export function useSetoresTawa() {
  return useQuery({
    queryKey: tawaKeys.setores(),
    queryFn: async (): Promise<SetorTawa[]> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('setores_tawa')
        .select('*')
        .order('ordem', { ascending: true });
      if (error) throw error;
      return (data ?? []) as SetorTawa[];
    },
    staleTime: 1000 * 60 * 60, // 1h — setores quase nunca mudam
  });
}

// ============================================================================
// Tarefas TAWA
// ============================================================================
export function useTarefasTawa(filtro?: {
  setor_id?: string | null;
  status?: StatusTarefa;
}) {
  return useQuery({
    queryKey: tawaKeys.tarefasFiltradas(filtro),
    queryFn: async (): Promise<Tarefa[]> => {
      const supabase = requireSupabase();
      let query = supabase
        .from('tarefas')
        .select('*')
        .eq('modulo', 'tawa')
        .order('ordem', { ascending: true });

      if (filtro?.setor_id) query = query.eq('setor_id', filtro.setor_id);
      if (filtro?.status) query = query.eq('status', filtro.status);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Tarefa[];
    },
  });
}

export function useTarefa(id: string | null | undefined) {
  return useQuery({
    queryKey: tawaKeys.tarefa(id ?? 'none'),
    queryFn: async (): Promise<Tarefa | null> => {
      if (!id) return null;
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as Tarefa | null;
    },
    enabled: !!id,
  });
}

// ============================================================================
// Mutations
// ============================================================================
export function useCriarTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CriarTarefaInput): Promise<Tarefa> => {
      const supabase = requireSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('tarefas')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Tarefa;
    },
    onSuccess: async (tarefa) => {
      qc.invalidateQueries({ queryKey: tawaKeys.tarefas() });
      // Agenda notificações se tem prazo
      await agendarSeNecessario(tarefa).catch(() => {});
    },
  });
}

export function useAtualizarTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: AtualizarTarefaInput;
    }): Promise<Tarefa> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('tarefas')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Tarefa;
    },
    onSuccess: async (tarefa) => {
      qc.invalidateQueries({ queryKey: tawaKeys.tarefa(tarefa.id) });
      qc.invalidateQueries({ queryKey: tawaKeys.tarefas() });
      // Re-agenda notificações (cancela antigas e cria novas)
      // Se tarefa foi concluída ou perdeu prazo, só cancela
      if (tarefa.status === 'concluido' || !tarefa.prazo_em) {
        await cancelarNotificacoesTarefa(tarefa.id).catch(() => {});
      } else {
        await agendarSeNecessario(tarefa).catch(() => {});
      }
    },
  });
}

export function useConcluirTarefa() {
  const atualizar = useAtualizarTarefa();
  return (id: string) =>
    atualizar.mutateAsync({
      id,
      patch: { status: 'concluido', concluida_em: new Date().toISOString() },
    });
}

export function useDeletarTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = requireSupabase();
      const { error } = await supabase.from('tarefas').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: async (id) => {
      qc.invalidateQueries({ queryKey: tawaKeys.tarefas() });
      await cancelarNotificacoesTarefa(id).catch(() => {});
    },
  });
}
