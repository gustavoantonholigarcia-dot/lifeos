import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { requireSupabase } from '@/shared/supabase';
import type { Tarefa } from '@/modules/tawa/types';
import type {
  CanalInteracao,
  Contato,
  CriarContatoInput,
  Interacao,
} from './types';

export const crmKeys = {
  all: ['tawa-crm'] as const,
  contatos: () => [...crmKeys.all, 'contatos'] as const,
  contato: (id: string) => [...crmKeys.all, 'contato', id] as const,
  interacoes: (contatoId: string) =>
    [...crmKeys.all, 'interacoes', contatoId] as const,
  tarefas: (contatoId: string) =>
    [...crmKeys.all, 'tarefas', contatoId] as const,
};

// ============================================================================
// Tarefas vinculadas a um contato
// ============================================================================
export function useTarefasDoContato(contatoId: string | null | undefined) {
  return useQuery({
    queryKey: crmKeys.tarefas(contatoId ?? 'none'),
    queryFn: async (): Promise<Tarefa[]> => {
      if (!contatoId) return [];
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .eq('contato_id', contatoId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Tarefa[];
    },
    enabled: !!contatoId,
  });
}

// ============================================================================
// Contatos
// ============================================================================
export function useContatos() {
  return useQuery({
    queryKey: crmKeys.contatos(),
    queryFn: async (): Promise<Contato[]> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('tawa_contatos')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Contato[];
    },
  });
}

export function useContato(id: string | null | undefined) {
  return useQuery({
    queryKey: crmKeys.contato(id ?? 'none'),
    queryFn: async (): Promise<Contato | null> => {
      if (!id) return null;
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('tawa_contatos')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as Contato | null;
    },
    enabled: !!id,
  });
}

export function useCriarContato() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CriarContatoInput): Promise<Contato> => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('tawa_contatos')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Contato;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: crmKeys.contatos() }),
  });
}

export function useAtualizarContato() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Contato>;
    }): Promise<Contato> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('tawa_contatos')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Contato;
    },
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: crmKeys.contatos() });
      qc.invalidateQueries({ queryKey: crmKeys.contato(c.id) });
    },
  });
}

export function useDeletarContato() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = requireSupabase();
      const { error } = await supabase.from('tawa_contatos').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: crmKeys.contatos() }),
  });
}

// ============================================================================
// Interações
// ============================================================================
export function useInteracoes(contatoId: string | null | undefined) {
  return useQuery({
    queryKey: crmKeys.interacoes(contatoId ?? 'none'),
    queryFn: async (): Promise<Interacao[]> => {
      if (!contatoId) return [];
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('tawa_interacoes')
        .select('*')
        .eq('contato_id', contatoId)
        .order('data', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Interacao[];
    },
    enabled: !!contatoId,
  });
}

export function useCriarInteracao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      contato_id: string;
      conteudo: string;
      canal: CanalInteracao;
    }): Promise<Interacao> => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('tawa_interacoes')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Interacao;
    },
    onSuccess: (i) => {
      qc.invalidateQueries({ queryKey: crmKeys.interacoes(i.contato_id) });
      // toca updated_at do contato pra subir na lista
      qc.invalidateQueries({ queryKey: crmKeys.contatos() });
    },
  });
}
