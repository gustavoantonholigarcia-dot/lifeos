import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { requireSupabase } from '@/shared/supabase';
import type { Tarefa } from '@/modules/tawa/types';
import type {
  Ata,
  AtaDoContato,
  AtaLote,
  AtaPainel,
  CanalInteracao,
  Contato,
  ContatoPessoa,
  CriarContatoInput,
  CriarPessoaInput,
  Empenho,
  EmpenhoStatus,
  Interacao,
  ParticipanteDaAta,
} from './types';

export const crmKeys = {
  all: ['tawa-crm'] as const,
  contatos: () => [...crmKeys.all, 'contatos'] as const,
  contato: (id: string) => [...crmKeys.all, 'contato', id] as const,
  interacoes: (contatoId: string) =>
    [...crmKeys.all, 'interacoes', contatoId] as const,
  pessoas: (contatoId: string) =>
    [...crmKeys.all, 'pessoas', contatoId] as const,
  atas: (contatoId: string) =>
    [...crmKeys.all, 'atas', contatoId] as const,
  ataPaineis: () => [...crmKeys.all, 'ata-painel'] as const,
  ataPainel: (ataId: string) => [...crmKeys.ataPaineis(), ataId] as const,
  atasLista: () => [...crmKeys.all, 'atas-lista'] as const,
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
      // Painel da ata mostra receptividade/status do contato — refletir na hora
      qc.invalidateQueries({ queryKey: crmKeys.ataPaineis() });
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
// Pessoas de contato (vários contatos dentro de um mesmo cliente)
// ============================================================================
export function usePessoas(contatoId: string | null | undefined) {
  return useQuery({
    queryKey: crmKeys.pessoas(contatoId ?? 'none'),
    queryFn: async (): Promise<ContatoPessoa[]> => {
      if (!contatoId) return [];
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('tawa_contato_pessoas')
        .select('*')
        .eq('contato_id', contatoId)
        .order('ordem', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as ContatoPessoa[];
    },
    enabled: !!contatoId,
  });
}

export function useCriarPessoa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CriarPessoaInput): Promise<ContatoPessoa> => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('tawa_contato_pessoas')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as ContatoPessoa;
    },
    onSuccess: (p) => qc.invalidateQueries({ queryKey: crmKeys.pessoas(p.contato_id) }),
  });
}

export function useAtualizarPessoa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<ContatoPessoa>;
    }): Promise<ContatoPessoa> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('tawa_contato_pessoas')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as ContatoPessoa;
    },
    onSuccess: (p) => qc.invalidateQueries({ queryKey: crmKeys.pessoas(p.contato_id) }),
  });
}

export function useDeletarPessoa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; contato_id: string }) => {
      const supabase = requireSupabase();
      const { error } = await supabase
        .from('tawa_contato_pessoas')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: (_id, vars) =>
      qc.invalidateQueries({ queryKey: crmKeys.pessoas(vars.contato_id) }),
  });
}

// ============================================================================
// Atas de registro de preços / empenhos (por contato)
// ============================================================================
export function useAtasDoContato(contatoId: string | null | undefined) {
  return useQuery({
    queryKey: crmKeys.atas(contatoId ?? 'none'),
    queryFn: async (): Promise<AtaDoContato[]> => {
      if (!contatoId) return [];
      const supabase = requireSupabase();

      // 1. Atas que esse contato participa
      const { data: parts, error: ePart } = await supabase
        .from('tawa_ata_participantes')
        .select('ata_id, tawa_atas(*)')
        .eq('contato_id', contatoId);
      if (ePart) throw ePart;
      if (!parts || parts.length === 0) return [];

      const ataIds = parts.map((p: any) => p.ata_id);

      // 2. Lotes dessas atas
      const { data: lotes, error: eLote } = await supabase
        .from('tawa_ata_lotes')
        .select('*')
        .in('ata_id', ataIds)
        .order('ordem', { ascending: true });
      if (eLote) throw eLote;

      // 3. Empenhos desse contato
      const { data: empenhos, error: eEmp } = await supabase
        .from('tawa_empenhos')
        .select('*')
        .eq('contato_id', contatoId);
      if (eEmp) throw eEmp;

      const empPorLote = new Map<string, Empenho>();
      (empenhos ?? []).forEach((e: any) => empPorLote.set(e.lote_id, e as Empenho));

      return parts.map((p: any) => ({
        ata: p.tawa_atas,
        lotes: ((lotes ?? []) as AtaLote[])
          .filter((l) => l.ata_id === p.ata_id)
          .map((lote) => ({ lote, empenho: empPorLote.get(lote.id) ?? null })),
      }));
    },
    enabled: !!contatoId,
  });
}

export function useSetEmpenhoStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      contato_id: string;
      lote_id: string;
      status: EmpenhoStatus;
    }): Promise<Empenho> => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('tawa_empenhos')
        .upsert(
          {
            contato_id: input.contato_id,
            lote_id: input.lote_id,
            status: input.status,
            data_empenho:
              input.status === 'empenhado'
                ? new Date().toISOString().slice(0, 10)
                : null,
            user_id: user.id,
          },
          { onConflict: 'contato_id,lote_id' },
        )
        .select()
        .single();
      if (error) throw error;
      return data as Empenho;
    },
    onSuccess: (e) => {
      qc.invalidateQueries({ queryKey: crmKeys.atas(e.contato_id) });
      qc.invalidateQueries({ queryKey: crmKeys.ataPaineis() });
    },
  });
}

// ============================================================================
// Gestão de atas: criar/editar/apagar ata, lotes e participantes
// ============================================================================
export function useCriarAta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nome: string; descricao?: string }): Promise<Ata> => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('tawa_atas')
        .insert({ nome: input.nome, descricao: input.descricao ?? null, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Ata;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: crmKeys.atasLista() }),
  });
}

export function useAtualizarAta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Ata> }) => {
      const supabase = requireSupabase();
      const { error } = await supabase.from('tawa_atas').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: crmKeys.atasLista() });
      qc.invalidateQueries({ queryKey: crmKeys.ataPainel(v.id) });
    },
  });
}

export function useDeletarAta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = requireSupabase();
      // cascade leva lotes, participantes e empenhos junto
      const { error } = await supabase.from('tawa_atas').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crmKeys.atasLista() });
      qc.invalidateQueries({ queryKey: crmKeys.ataPaineis() });
    },
  });
}

export function useCriarLote(ataId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { veiculo: string; numero?: string; edital_ref?: string; ordem?: number }) => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { error } = await supabase.from('tawa_ata_lotes').insert({
        ata_id: ataId,
        user_id: user.id,
        veiculo: input.veiculo,
        numero: input.numero ?? null,
        edital_ref: input.edital_ref ?? null,
        ordem: input.ordem ?? 0,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: crmKeys.ataPainel(ataId) }),
  });
}

export function useDeletarLote(ataId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (loteId: string) => {
      const supabase = requireSupabase();
      const { error } = await supabase.from('tawa_ata_lotes').delete().eq('id', loteId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: crmKeys.ataPainel(ataId) }),
  });
}

/** Vincula ou desvincula um contato (cidade) como participante da ata. */
export function useSetParticipante(ataId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { contato_id: string; participa: boolean }) => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      if (input.participa) {
        const { error } = await supabase
          .from('tawa_ata_participantes')
          .upsert(
            { ata_id: ataId, contato_id: input.contato_id, user_id: user.id },
            { onConflict: 'ata_id,contato_id' },
          );
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tawa_ata_participantes')
          .delete()
          .eq('ata_id', ataId)
          .eq('contato_id', input.contato_id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: crmKeys.ataPainel(ataId) }),
  });
}

/** Todas as atas do usuário (pra navegação aos painéis). */
export function useAtas() {
  return useQuery({
    queryKey: crmKeys.atasLista(),
    queryFn: async (): Promise<Ata[]> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('tawa_atas')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Ata[];
    },
  });
}

/**
 * Painel completo da ata: todos os municípios participantes × lotes,
 * com o status de empenho em cada célula. A visão de "farming" da ata.
 */
export function useAtaPainel(ataId: string | null | undefined) {
  return useQuery({
    queryKey: crmKeys.ataPainel(ataId ?? 'none'),
    enabled: !!ataId,
    queryFn: async (): Promise<AtaPainel | null> => {
      if (!ataId) return null;
      const supabase = requireSupabase();

      const { data: ata, error: eAta } = await supabase
        .from('tawa_atas')
        .select('*')
        .eq('id', ataId)
        .maybeSingle();
      if (eAta) throw eAta;
      if (!ata) return null;

      const { data: lotes, error: eLotes } = await supabase
        .from('tawa_ata_lotes')
        .select('*')
        .eq('ata_id', ataId)
        .order('ordem', { ascending: true });
      if (eLotes) throw eLotes;

      const { data: parts, error: eParts } = await supabase
        .from('tawa_ata_participantes')
        .select('contato_id, tawa_contatos(id, nome, receptividade, status, telefone)')
        .eq('ata_id', ataId);
      if (eParts) throw eParts;

      const loteIds = ((lotes ?? []) as AtaLote[]).map((l) => l.id);
      let empenhos: Empenho[] = [];
      if (loteIds.length > 0) {
        const { data: emps, error: eEmp } = await supabase
          .from('tawa_empenhos')
          .select('*')
          .in('lote_id', loteIds);
        if (eEmp) throw eEmp;
        empenhos = (emps ?? []) as Empenho[];
      }

      const porContato = new Map<string, Record<string, Empenho>>();
      empenhos.forEach((e) => {
        const m = porContato.get(e.contato_id) ?? {};
        m[e.lote_id] = e;
        porContato.set(e.contato_id, m);
      });

      const participantes: ParticipanteDaAta[] = ((parts ?? []) as any[])
        .filter((p) => p.tawa_contatos)
        .map((p) => ({
          contato: p.tawa_contatos,
          empenhos: porContato.get(p.contato_id) ?? {},
        }));

      return {
        ata: ata as Ata,
        lotes: (lotes ?? []) as AtaLote[],
        participantes,
      };
    },
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
