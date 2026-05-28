/**
 * Queries TanStack do módulo Estudos.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { requireSupabase } from '@/shared/supabase';
import type {
  Certificacao,
  CriarCertificacaoInput,
  CriarIdiomaInput,
  CriarSessaoInput,
  Idioma,
  IdiomaResumo,
  Sessao,
} from './types';

export const estudosKeys = {
  all: ['estudos'] as const,
  idiomas: () => [...estudosKeys.all, 'idiomas'] as const,
  idiomasResumo: () => [...estudosKeys.all, 'idiomas-resumo'] as const,
  idioma: (id: string) => [...estudosKeys.idiomas(), 'item', id] as const,
  sessoes: (idioma_id?: string | null) =>
    [...estudosKeys.all, 'sessoes', idioma_id ?? 'all'] as const,
  certificacoes: (idioma_id?: string | null) =>
    [...estudosKeys.all, 'certificacoes', idioma_id ?? 'all'] as const,
};

// ============================================================================
// Idiomas
// ============================================================================
export function useIdiomas(opts?: { incluirInativos?: boolean }) {
  return useQuery({
    queryKey: [...estudosKeys.idiomasResumo(), opts?.incluirInativos ?? false],
    queryFn: async (): Promise<IdiomaResumo[]> => {
      const supabase = requireSupabase();
      let query = supabase
        .from('estudos_idiomas_resumo')
        .select('*')
        .order('ordem', { ascending: true });
      if (!opts?.incluirInativos) {
        query = query.eq('ativo', true);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as IdiomaResumo[];
    },
  });
}

export function useIdioma(id: string | null | undefined) {
  return useQuery({
    queryKey: estudosKeys.idioma(id ?? 'none'),
    queryFn: async (): Promise<Idioma | null> => {
      if (!id) return null;
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('estudos_idiomas')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as Idioma | null;
    },
    enabled: !!id,
  });
}

export function useCriarIdioma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CriarIdiomaInput): Promise<Idioma> => {
      const supabase = requireSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('estudos_idiomas')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Idioma;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: estudosKeys.all });
    },
  });
}

export function useAtualizarIdioma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<CriarIdiomaInput> & { ativo?: boolean };
    }): Promise<Idioma> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('estudos_idiomas')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Idioma;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: estudosKeys.all });
    },
  });
}

export function useDeletarIdioma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = requireSupabase();
      const { error } = await supabase.from('estudos_idiomas').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: estudosKeys.all });
    },
  });
}

// ============================================================================
// Sessões
// ============================================================================
export function useSessoes(idioma_id?: string | null, limit = 50) {
  return useQuery({
    queryKey: estudosKeys.sessoes(idioma_id),
    queryFn: async (): Promise<Sessao[]> => {
      const supabase = requireSupabase();
      let query = supabase
        .from('estudos_sessoes')
        .select('*')
        .order('data', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);
      if (idioma_id) query = query.eq('idioma_id', idioma_id);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Sessao[];
    },
  });
}

export function useCriarSessao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CriarSessaoInput): Promise<Sessao> => {
      const supabase = requireSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('estudos_sessoes')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Sessao;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: estudosKeys.all });
    },
  });
}

export function useDeletarSessao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = requireSupabase();
      const { error } = await supabase.from('estudos_sessoes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: estudosKeys.all });
    },
  });
}

// ============================================================================
// Certificações
// ============================================================================
export function useCertificacoes(idioma_id?: string | null) {
  return useQuery({
    queryKey: estudosKeys.certificacoes(idioma_id),
    queryFn: async (): Promise<Certificacao[]> => {
      const supabase = requireSupabase();
      let query = supabase
        .from('estudos_certificacoes')
        .select('*')
        .order('data_alvo', { ascending: true, nullsFirst: false });
      if (idioma_id) query = query.eq('idioma_id', idioma_id);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Certificacao[];
    },
  });
}

export function useCriarCertificacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CriarCertificacaoInput): Promise<Certificacao> => {
      const supabase = requireSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('estudos_certificacoes')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Certificacao;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: estudosKeys.all });
    },
  });
}
