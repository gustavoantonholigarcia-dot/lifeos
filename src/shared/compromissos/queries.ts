import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { requireSupabase } from '@/shared/supabase';

export type CompromissoStatus = 'fila' | 'ativa' | 'concluida' | 'abandonada';

export interface Compromisso {
  id: string;
  user_id: string;
  titulo: string;
  resultado_esperado: string | null;
  status: CompromissoStatus;
  prazo_em: string | null; // date (fim do ciclo)
  ativada_em: string | null;
  encerrada_em: string | null;
  aprendizado: string | null;
  created_at: string;
  updated_at: string;
}

export interface Norte {
  id: string;
  user_id: string;
  texto: string;
  updated_at: string;
}

/** Limite de frentes simultâneas — o que protege o foco. */
export const MAX_ATIVOS = 3;

/** Opções de ciclo ao ativar (prazo variável por compromisso). */
export const CICLOS: { label: string; dias: number }[] = [
  { label: '1 semana', dias: 7 },
  { label: '2 semanas', dias: 14 },
  { label: '1 mês', dias: 30 },
  { label: '3 meses', dias: 90 },
];

export function dataLocalISO(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function prazoAPartirDeHoje(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return dataLocalISO(d);
}

/** Dias restantes até o prazo (negativo = vencido). */
export function diasRestantes(prazoEm: string): number {
  const [y, m, d] = prazoEm.split('-').map(Number);
  const prazo = new Date(y, m - 1, d);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((prazo.getTime() - hoje.getTime()) / 86400000);
}

/** Últimos N dias (ISO local), do mais antigo até hoje. */
export function ultimosDias(n: number): string[] {
  const dias: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dias.push(dataLocalISO(d));
  }
  return dias;
}

export const compromissoKeys = {
  all: ['compromissos'] as const,
  norte: ['norte'] as const,
  avancos: ['compromisso-avancos'] as const,
};

// ============================================================================
// Norte
// ============================================================================
export function useNorte() {
  return useQuery({
    queryKey: compromissoKeys.norte,
    queryFn: async (): Promise<Norte | null> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase.from('norte').select('*').maybeSingle();
      if (error) throw error;
      return data as Norte | null;
    },
  });
}

export function useSalvarNorte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (texto: string) => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const limpo = texto.trim();
      if (!limpo) {
        const { error } = await supabase.from('norte').delete().eq('user_id', user.id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase
        .from('norte')
        .upsert(
          { user_id: user.id, texto: limpo, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: compromissoKeys.norte }),
  });
}

// ============================================================================
// Compromissos
// ============================================================================
/** Compromissos abertos (ativos + fila). Encerrados ficam fora da tela. */
export function useCompromissos() {
  return useQuery({
    queryKey: compromissoKeys.all,
    queryFn: async (): Promise<Compromisso[]> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('compromissos')
        .select('*')
        .in('status', ['fila', 'ativa'])
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Compromisso[];
    },
  });
}

export function useCriarCompromisso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      titulo: string;
      status: 'fila' | 'ativa';
      prazo_em?: string;
    }) => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { error } = await supabase.from('compromissos').insert({
        titulo: input.titulo,
        status: input.status,
        prazo_em: input.prazo_em ?? null,
        ativada_em: input.status === 'ativa' ? new Date().toISOString() : null,
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: compromissoKeys.all }),
  });
}

export function useAtualizarCompromisso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Compromisso> }) => {
      const supabase = requireSupabase();
      const { error } = await supabase
        .from('compromissos')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: compromissoKeys.all }),
  });
}

export function useDeletarCompromisso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = requireSupabase();
      const { error } = await supabase.from('compromissos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: compromissoKeys.all }),
  });
}

// ============================================================================
// Avanços diários (constância)
// ============================================================================
/** Avanços dos últimos 7 dias: Map compromisso_id -> Set de datas ISO. */
export function useAvancos() {
  return useQuery({
    queryKey: compromissoKeys.avancos,
    queryFn: async (): Promise<Record<string, string[]>> => {
      const supabase = requireSupabase();
      const desde = ultimosDias(7)[0];
      const { data, error } = await supabase
        .from('compromisso_avancos')
        .select('compromisso_id, data')
        .gte('data', desde);
      if (error) throw error;
      const m: Record<string, string[]> = {};
      (data ?? []).forEach((r: any) => {
        (m[r.compromisso_id] ??= []).push(r.data);
      });
      return m;
    },
  });
}

/** Marca/desmarca o avanço de HOJE num compromisso. */
export function useToggleAvanco() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { compromisso_id: string; marcado: boolean }) => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const hoje = dataLocalISO();
      if (input.marcado) {
        const { error } = await supabase
          .from('compromisso_avancos')
          .delete()
          .eq('compromisso_id', input.compromisso_id)
          .eq('data', hoje);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('compromisso_avancos').insert({
          user_id: user.id,
          compromisso_id: input.compromisso_id,
          data: hoje,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: compromissoKeys.avancos }),
  });
}
