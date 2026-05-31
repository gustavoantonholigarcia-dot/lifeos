import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { requireSupabase } from '@/shared/supabase';

export interface Projeto {
  id: string;
  user_id: string;
  nome: string;
  descricao: string | null;
  status: string;
  progresso_pct: number;
  tech_stack: string[] | null;
  link: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export const projetoKeys = {
  all: ['projetos'] as const,
};

export function useProjetos() {
  return useQuery({
    queryKey: projetoKeys.all,
    queryFn: async (): Promise<Projeto[]> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Projeto[];
    },
  });
}

export function useCriarProjeto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nome: string; descricao?: string; tech_stack?: string[]; link?: string }) => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('projetos')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Projeto;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: projetoKeys.all }),
  });
}

export function useAtualizarProjeto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Projeto> }) => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('projetos')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Projeto;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: projetoKeys.all }),
  });
}
