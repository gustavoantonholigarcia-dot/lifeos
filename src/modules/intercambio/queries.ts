import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { requireSupabase } from '@/shared/supabase';

export type CategoriaIntercambio = 'documentos' | 'idiomas' | 'inscricao' | 'financeiro' | 'destino';

export interface ChecklistItem {
  id: string;
  user_id: string;
  categoria: CategoriaIntercambio;
  item: string;
  concluido: boolean;
  prazo: string | null;
  observacoes: string | null;
  ordem: string;
  created_at: string;
}

export const CATEGORIA_CONFIG: Record<CategoriaIntercambio, { label: string; cor: string }> = {
  documentos: { label: 'Documentos', cor: '#E04830' },
  idiomas: { label: 'Idiomas', cor: '#B89FD9' },
  inscricao: { label: 'Inscrição', cor: '#6B8FB8' },
  financeiro: { label: 'Financeiro', cor: '#E8A845' },
  destino: { label: 'Destino', cor: '#8FA899' },
};

export const CATEGORIAS: CategoriaIntercambio[] = ['documentos', 'idiomas', 'inscricao', 'financeiro', 'destino'];

export const intercambioKeys = {
  all: ['intercambio'] as const,
};

export function useChecklist() {
  return useQuery({
    queryKey: intercambioKeys.all,
    queryFn: async (): Promise<ChecklistItem[]> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('intercambio_checklist')
        .select('*')
        .order('categoria')
        .order('ordem', { ascending: true });
      if (error) throw error;
      return (data ?? []) as ChecklistItem[];
    },
  });
}

export function useCriarItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { categoria: CategoriaIntercambio; item: string; prazo?: string }) => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('intercambio_checklist')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as ChecklistItem;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: intercambioKeys.all }),
  });
}

export function useToggleItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, concluido }: { id: string; concluido: boolean }) => {
      const supabase = requireSupabase();
      const { error } = await supabase
        .from('intercambio_checklist')
        .update({ concluido })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: intercambioKeys.all }),
  });
}
