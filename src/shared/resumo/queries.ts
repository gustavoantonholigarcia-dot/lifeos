import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { requireSupabase } from '@/shared/supabase';

export interface Resumo {
  id: string;
  tipo: 'manha' | 'semanal';
  conteudo: string;
  data: string;
  lido: boolean;
  created_at: string;
}

function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const resumoKeys = {
  all: ['resumos'] as const,
  hoje: () => [...resumoKeys.all, hojeISO()] as const,
};

export function useResumosHoje() {
  return useQuery({
    queryKey: resumoKeys.hoje(),
    queryFn: async (): Promise<Resumo[]> => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('resumos')
        .select('*')
        .eq('user_id', user.id)
        .eq('data', hojeISO())
        .eq('lido', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as Resumo[];
    },
  });
}

export interface ResumoLocal {
  total: number;
  porModulo: { modulo: string; label: string; n: number }[];
  urgentes: { titulo: string; modulo: string }[];
}

const MODULO_LABEL: Record<string, string> = {
  tawa: 'TAWA',
  utfpr: 'UTFPR',
  treinos: 'Treinos',
  ruah: 'RUAH',
  projetos: 'Projetos',
  intercambio: 'Intercâmbio',
  estudos: 'Estudos',
};

/**
 * Resumo da manhã calculado NO CLIENTE — não depende da Edge Function/push.
 * Conta pendências e prazos próximos a partir das tarefas. Dá um motivo
 * concreto pra abrir o app de manhã (alinhado ao GATE).
 */
export function useResumoLocal() {
  return useQuery({
    queryKey: [...resumoKeys.all, 'local', hojeISO()],
    queryFn: async (): Promise<ResumoLocal | null> => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('tarefas')
        .select('titulo, modulo, prazo_em, status')
        .eq('user_id', user.id)
        .in('status', ['a_fazer', 'em_andamento']);
      if (error) throw error;

      const tarefas = data ?? [];
      const total = tarefas.length;
      if (total === 0) return null;

      const contagem: Record<string, number> = {};
      for (const t of tarefas as any[]) {
        const m = t.modulo ?? 'outros';
        contagem[m] = (contagem[m] ?? 0) + 1;
      }
      const porModulo = Object.entries(contagem)
        .map(([modulo, n]) => ({ modulo, label: MODULO_LABEL[modulo] ?? modulo, n }))
        .sort((a, b) => b.n - a.n);

      const amanha = new Date();
      amanha.setDate(amanha.getDate() + 1);
      const amanhaISO = `${amanha.getFullYear()}-${String(amanha.getMonth() + 1).padStart(2, '0')}-${String(amanha.getDate()).padStart(2, '0')}`;
      const urgentes = (tarefas as any[])
        .filter((t) => t.prazo_em && t.prazo_em.slice(0, 10) <= amanhaISO)
        .map((t) => ({ titulo: t.titulo as string, modulo: t.modulo as string }));

      return { total, porModulo, urgentes };
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useMarcarLido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = requireSupabase();
      const { error } = await supabase
        .from('resumos')
        .update({ lido: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resumoKeys.all });
    },
  });
}
