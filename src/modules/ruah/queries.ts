import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { requireSupabase } from '@/shared/supabase';

export interface Reuniao {
  id: string;
  user_id: string;
  titulo: string;
  data: string | null;
  local: string | null;
  ata: string | null;
  participantes: string[] | null;
  created_at: string;
}

export interface Ideia {
  id: string;
  user_id: string;
  titulo: string;
  descricao: string | null;
  tags: string[] | null;
  status: string;
  created_at: string;
}

export const ruahKeys = {
  all: ['ruah'] as const,
  reunioes: () => [...ruahKeys.all, 'reunioes'] as const,
  ideias: () => [...ruahKeys.all, 'ideias'] as const,
};

export function useReunioes() {
  return useQuery({
    queryKey: ruahKeys.reunioes(),
    queryFn: async (): Promise<Reuniao[]> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('ruah_reunioes')
        .select('*')
        .order('data', { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as Reuniao[];
    },
  });
}

export function useIdeias() {
  return useQuery({
    queryKey: ruahKeys.ideias(),
    queryFn: async (): Promise<Ideia[]> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('ruah_ideias')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Ideia[];
    },
  });
}

export function useCriarReuniao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { titulo: string; data?: string; local?: string }) => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('ruah_reunioes')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Reuniao;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ruahKeys.reunioes() }),
  });
}

export function useCriarIdeia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { titulo: string; descricao?: string; tags?: string[] }) => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('ruah_ideias')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Ideia;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ruahKeys.ideias() }),
  });
}

export function useAtualizarIdeia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Ideia> }) => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('ruah_ideias')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Ideia;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ruahKeys.ideias() }),
  });
}
