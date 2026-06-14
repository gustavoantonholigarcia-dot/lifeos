import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { requireSupabase } from '@/shared/supabase';

export type EstagioIdeia = 'semente' | 'validando' | 'tocando' | 'arquivada';

export type TipoIdeia = 'construir' | 'oportunidade';

export const TIPO_LABELS: Record<TipoIdeia, string> = {
  construir: 'Negócio a construir',
  oportunidade: 'Oportunidade',
};

export interface Ideia {
  id: string;
  user_id: string;
  nome: string;
  tipo: TipoIdeia;
  problema: string | null;
  solucao: string | null;
  publico_alvo: string | null;
  quanto_pagam: string | null;
  vantagem_injusta: string | null;
  canais: string | null;
  concorrentes: string | null;
  metrica_chave: string | null;
  estagio: EstagioIdeia;
  proximo_passo: string | null;
  notas: string | null;
  link: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Rótulos e dicas dos campos do canvas, adaptados ao tipo da ideia.
 * Reaproveita as MESMAS colunas do banco — só muda a leitura na tela.
 * key = coluna em `ideias`.
 */
export type CampoCanvas = {
  key: 'problema' | 'solucao' | 'publico_alvo' | 'quanto_pagam' | 'concorrentes' | 'vantagem_injusta' | 'canais' | 'metrica_chave';
  label: string;
  hint?: string;
  placeholder: string;
  destaque?: boolean; // realça o campo de sinal mais forte
};

export function camposCanvas(tipo: TipoIdeia): { secao: string; campos: CampoCanvas[] }[] {
  if (tipo === 'oportunidade') {
    return [
      {
        secao: 'A tese',
        campos: [
          { key: 'problema', label: 'A tese / por que essa oportunidade', placeholder: 'Por que isso vale a pena agora?', },
          { key: 'solucao', label: 'Como você entra / executa', placeholder: 'O passo a passo pra capturar isso' },
          { key: 'publico_alvo', label: 'Contraparte', placeholder: 'De quem você compra / pra quem você vende depois' },
          { key: 'quanto_pagam', label: 'Custo de entrada e retorno esperado', hint: 'Quanto põe, quanto espera tirar e em quanto tempo. Número, não sensação.', placeholder: 'Ex: R$ X pra entrar, espero R$ Y em Z anos', destaque: true },
        ],
      },
      {
        secao: 'Risco e saída',
        campos: [
          { key: 'concorrentes', label: 'Quem já fez isso (e como terminou)', hint: 'Histórico real vale mais que projeção otimista.', placeholder: 'Casos parecidos, quem ganhou, quem se queimou' },
          { key: 'vantagem_injusta', label: 'Sua vantagem / acesso', placeholder: 'Por que VOCÊ consegue e o outro não (contato, capital, timing)' },
          { key: 'canais', label: 'Como e quando você sai (liquidez)', hint: 'Ativo que não dá pra vender é dinheiro preso.', placeholder: 'Quem te compra na saída? Em quanto tempo?' },
          { key: 'metrica_chave', label: 'Número que prova que vale', placeholder: 'Ex: retorno %, payback, valor por hectare' },
        ],
      },
    ];
  }
  // construir (default)
  return [
    {
      secao: 'O essencial',
      campos: [
        { key: 'problema', label: 'Problema que resolve', placeholder: 'Que dor ou necessidade isso ataca?' },
        { key: 'solucao', label: 'Solução / o que é', placeholder: 'Como resolve, em uma frase' },
        { key: 'publico_alvo', label: 'Pra quem / quem paga', placeholder: 'Público, cliente, quem tira do bolso' },
        { key: 'quanto_pagam', label: 'Quanto pagam hoje pra resolver?', hint: 'O sinal mais forte: gente mente em pesquisa, não com dinheiro.', placeholder: 'Ex: contratam fulano por R$ X, gastam Y horas...', destaque: true },
      ],
    },
    {
      secao: 'Mercado e diferencial',
      campos: [
        { key: 'concorrentes', label: 'Concorrentes / quem já resolve', hint: 'Se ninguém resolve, talvez não seja dor de verdade.', placeholder: 'Quem o cliente usa hoje (inclui planilha, "na mão", nada)' },
        { key: 'vantagem_injusta', label: 'Vantagem injusta', hint: 'O que é difícil de copiar mesmo se contarem como você faz.', placeholder: 'Acesso, dado, marca, time, timing...' },
        { key: 'canais', label: 'Canais', placeholder: 'Como você chega no cliente sem queimar caixa' },
        { key: 'metrica_chave', label: 'Métrica-chave', hint: 'O único número que prova que está funcionando.', placeholder: 'Ex: clientes pagantes/mês, recompra, CAC...' },
      ],
    },
  ];
}

export type StatusHipotese = 'nao_testada' | 'testando' | 'validada' | 'refutada';

export interface Hipotese {
  id: string;
  user_id: string;
  ideia_id: string;
  texto: string;
  como_testar: string | null;
  status: StatusHipotese;
  aprendizado: string | null;
  ordem: string;
  created_at: string;
  updated_at: string;
}

export const HIPOTESE_STATUS: StatusHipotese[] = [
  'nao_testada',
  'testando',
  'validada',
  'refutada',
];

export const HIPOTESE_LABELS: Record<StatusHipotese, string> = {
  nao_testada: 'Não testada',
  testando: 'Testando',
  validada: 'Validada',
  refutada: 'Refutada',
};

export const HIPOTESE_CORES: Record<StatusHipotese, string> = {
  nao_testada: 'rgba(245,241,237,0.40)',
  testando: '#E8A845',
  validada: '#8FA899',
  refutada: '#C25B4E',
};

export interface Provocacao {
  id: string;
  ideia_id: string;
  prompt_id: string;
  resposta: string;
  updated_at: string;
}

type Provoca = { id: string; pergunta: string };

/**
 * Provocações comuns a QUALQUER ideia de negócio (advogado do diabo).
 * prompt_id é estável: nunca renomear (é a chave da resposta no banco).
 */
const PROVOCACOES_BASE: Provoca[] = [
  { id: 'pressuposto', pergunta: 'Qual o pressuposto central que, se for falso, derruba a ideia inteira?' },
  { id: 'porque_nao_existe', pergunta: 'Por que isso ainda não foi feito por aqui? Quem tentou e por que falhou?' },
  { id: 'quem_perde', pergunta: 'Quem perde dinheiro ou poder se você der certo? Como essa pessoa reage?' },
  { id: 'compraria', pergunta: 'Você poria seu próprio dinheiro nisso hoje? Se não, por quê?' },
  { id: 'restricao', pergunta: 'Se tivesse só 30 dias e pouco capital, qual o primeiro passo concreto?' },
  { id: 'porque_voce', pergunta: 'Por que VOCÊ (e não outra pessoa) deve tocar isso? Qual sua vantagem injusta?' },
];

/** Provocações específicas de startup/negócio a construir. */
const PROVOCACOES_CONSTRUIR: Provoca[] = [
  { id: 'menor_versao', pergunta: 'Qual a menor versão possível que já entrega valor real pra alguém?' },
  { id: 'primeiro_cliente', pergunta: 'Quem é seu primeiro cliente — com nome e sobrenome, não um perfil?' },
  { id: 'canal_10', pergunta: 'Qual canal te traz os 10 primeiros clientes sem queimar caixa?' },
  { id: 'vantagem', pergunta: 'Por que você vence os concorrentes, em uma frase? Isso é defensável?' },
  { id: 'metrica', pergunta: 'Qual métrica única provaria, sem discussão, que está funcionando?' },
  { id: 'mercado', pergunta: 'O que precisa ser verdade pro mercado ser grande o suficiente pra valer a pena?' },
];

/** Provocações específicas de oportunidade/investimento. */
const PROVOCACOES_OPORTUNIDADE: Provoca[] = [
  { id: 'retorno', pergunta: 'Qual o retorno esperado e em quanto tempo? Compara com só deixar o dinheiro rendendo?' },
  { id: 'pior_cenario', pergunta: 'No pior cenário, quanto você perde? Esse prejuízo é absorvível sem te quebrar?' },
  { id: 'saida', pergunta: 'Como e quando você sai? Existe comprador real na hora de liquidar?' },
  { id: 'custos_ocultos', pergunta: 'Quais os custos e dores que não estão na conta (impostos, manutenção, burocracia, distância)?' },
  { id: 'quem_ja_fez', pergunta: 'Quem já fez exatamente isso por aqui? Como terminou — ganhou ou se queimou?' },
  { id: 'confianca', pergunta: 'De quem você depende pra isso dar certo? Dá pra confiar nessa pessoa a essa distância?' },
];

export function provocacoesPara(tipo: TipoIdeia): Provoca[] {
  return [
    ...PROVOCACOES_BASE,
    ...(tipo === 'oportunidade' ? PROVOCACOES_OPORTUNIDADE : PROVOCACOES_CONSTRUIR),
  ];
}

/** @deprecated use provocacoesPara(tipo). Mantido pra compatibilidade. */
export const PROVOCACOES = provocacoesPara('construir');

/**
 * Score de validação 0–100 (heurística, sem IA).
 * Recompensa sinais fortes: quem paga hoje > campos preenchidos > hipóteses
 * validadas > provocações respondidas > estágio avançado.
 */
export function calcularScore(args: {
  ideia: Ideia;
  hipoteses: Hipotese[];
  provocacoes: Provocacao[];
}): { score: number; faltando: string[] } {
  const { ideia, hipoteses, provocacoes } = args;
  const oportunidade = ideia.tipo === 'oportunidade';
  let s = 0;
  const faltando: string[] = [];

  const cheio = (v: string | null) => !!v && v.trim().length > 0;

  if (cheio(ideia.problema)) s += 12;
  else faltando.push(oportunidade ? 'Escrever a tese' : 'Definir o problema');
  if (cheio(ideia.publico_alvo)) s += 10;
  else faltando.push(oportunidade ? 'Definir a contraparte' : 'Definir pra quem');
  if (cheio(ideia.quanto_pagam)) s += 18;
  else faltando.push(oportunidade ? 'Custo de entrada x retorno' : 'Quanto pagam hoje (sinal forte)');
  if (cheio(ideia.solucao)) s += 8;
  else faltando.push(oportunidade ? 'Como você entra/executa' : 'Descrever a solução');
  if (cheio(ideia.concorrentes)) s += 8;
  else faltando.push(oportunidade ? 'Quem já fez (histórico)' : 'Mapear concorrentes');
  if (cheio(ideia.metrica_chave)) s += 6;
  else faltando.push(oportunidade ? 'Número que prova o retorno' : 'Escolher métrica-chave');
  if (oportunidade && cheio(ideia.canais)) s += 4; // saída/liquidez conta a mais

  const validadas = hipoteses.filter((h) => h.status === 'validada').length;
  s += Math.min(validadas * 8, 20);
  if (validadas === 0)
    faltando.push(oportunidade ? 'Validar 1 premissa (due diligence)' : 'Validar 1 hipótese com experimento');

  const provs = provocacoesPara(ideia.tipo);
  // Só conta respostas das provocações do tipo atual (trocou de tipo, não vaza)
  const idsDoBanco = new Set(provs.map((p) => p.id));
  const respondidas = provocacoes.filter(
    (p) => idsDoBanco.has(p.prompt_id) && p.resposta.trim().length > 0,
  ).length;
  s += Math.min(respondidas * 1.5, 10);
  if (respondidas < provs.length)
    faltando.push(`Responder provocações (${respondidas}/${provs.length})`);

  if (ideia.estagio === 'tocando') s += 8;

  return { score: Math.min(Math.round(s), 100), faltando: faltando.slice(0, 3) };
}

/** Próximo passo sugerido por estágio + tipo (heurística fixa). */
export function proximoExperimento(estagio: EstagioIdeia, tipo: TipoIdeia = 'construir'): string {
  if (tipo === 'oportunidade') {
    switch (estagio) {
      case 'semente':
        return 'Levante os números reais: custo de entrada, retorno esperado e o pior cenário. Sem isso é só palpite.';
      case 'validando':
        return 'Fale com 2 pessoas que JÁ fizeram isso. O que deu errado pra elas? Confirme 1 premissa no mundo real.';
      case 'tocando':
        return 'Trave a saída antes de entrar: quem te compra na hora de liquidar e por quanto?';
      case 'arquivada':
        return 'Arquivada. Se reabrir: o que mudou (preço, acesso, risco) que a torna viável agora?';
    }
  }
  switch (estagio) {
    case 'semente':
      return 'Fale com 5 pessoas do público-alvo esta semana. Só ouça a dor — não venda nada ainda.';
    case 'validando':
      return 'Peça um compromisso real de 1 cliente: pré-venda, sinal ou carta de intenção. Dinheiro não mente.';
    case 'tocando':
      return 'Ache o gargalo que impede dobrar. Concentre tudo em 1 canal de aquisição até ele funcionar.';
    case 'arquivada':
      return 'Arquivada. Se um dia reabrir: o que mudou no mundo que a torna viável agora?';
  }
}

export const ESTAGIOS: EstagioIdeia[] = ['semente', 'validando', 'tocando', 'arquivada'];

export const ESTAGIO_LABELS: Record<EstagioIdeia, string> = {
  semente: 'Semente',
  validando: 'Validando',
  tocando: 'Tocando',
  arquivada: 'Arquivada',
};

export const ESTAGIO_CORES: Record<EstagioIdeia, string> = {
  semente: '#E0917F',
  validando: '#E8A845',
  tocando: '#8FA899',
  arquivada: '#78716C',
};

export const ideiaKeys = {
  all: ['ideias'] as const,
  one: (id: string) => ['ideias', id] as const,
};

export function useIdeias() {
  return useQuery({
    queryKey: ideiaKeys.all,
    queryFn: async (): Promise<Ideia[]> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('ideias')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Ideia[];
    },
  });
}

export function useIdeia(id: string | null | undefined) {
  return useQuery({
    queryKey: ideiaKeys.one(id ?? 'none'),
    queryFn: async (): Promise<Ideia | null> => {
      if (!id) return null;
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('ideias')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as Ideia | null;
    },
    enabled: !!id,
  });
}

export function useCriarIdeia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nome: string; problema?: string; tipo?: TipoIdeia }): Promise<Ideia> => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('ideias')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Ideia;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ideiaKeys.all }),
  });
}

export function useAtualizarIdeia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Ideia> }): Promise<Ideia> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('ideias')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Ideia;
    },
    onSuccess: (i) => {
      qc.invalidateQueries({ queryKey: ideiaKeys.all });
      qc.invalidateQueries({ queryKey: ideiaKeys.one(i.id) });
    },
  });
}

export function useDeletarIdeia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = requireSupabase();
      const { error } = await supabase.from('ideias').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ideiaKeys.all }),
  });
}

// ============================================================================
// Hipóteses / experimentos
// ============================================================================
export const hipoteseKeys = {
  byIdeia: (ideiaId: string) => ['ideia-hipoteses', ideiaId] as const,
};

export function useHipoteses(ideiaId: string | null | undefined) {
  return useQuery({
    queryKey: hipoteseKeys.byIdeia(ideiaId ?? 'none'),
    enabled: !!ideiaId,
    queryFn: async (): Promise<Hipotese[]> => {
      if (!ideiaId) return [];
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('ideia_hipoteses')
        .select('*')
        .eq('ideia_id', ideiaId)
        .order('ordem', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Hipotese[];
    },
  });
}

export function useCriarHipotese(ideiaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { texto: string; como_testar?: string }) => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { error } = await supabase
        .from('ideia_hipoteses')
        .insert({ ...input, ideia_id: ideiaId, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: hipoteseKeys.byIdeia(ideiaId) }),
  });
}

export function useAtualizarHipotese(ideiaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Hipotese> }) => {
      const supabase = requireSupabase();
      const { error } = await supabase
        .from('ideia_hipoteses')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: hipoteseKeys.byIdeia(ideiaId) }),
  });
}

export function useDeletarHipotese(ideiaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = requireSupabase();
      const { error } = await supabase.from('ideia_hipoteses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: hipoteseKeys.byIdeia(ideiaId) }),
  });
}

// ============================================================================
// Provocações (advogado do diabo)
// ============================================================================
export const provocacaoKeys = {
  byIdeia: (ideiaId: string) => ['ideia-provocacoes', ideiaId] as const,
};

export function useProvocacoes(ideiaId: string | null | undefined) {
  return useQuery({
    queryKey: provocacaoKeys.byIdeia(ideiaId ?? 'none'),
    enabled: !!ideiaId,
    queryFn: async (): Promise<Provocacao[]> => {
      if (!ideiaId) return [];
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('ideia_provocacoes')
        .select('id, ideia_id, prompt_id, resposta, updated_at')
        .eq('ideia_id', ideiaId);
      if (error) throw error;
      return (data ?? []) as Provocacao[];
    },
  });
}

export function useResponderProvocacao(ideiaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ promptId, resposta }: { promptId: string; resposta: string }) => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const limpo = resposta.trim();
      if (!limpo) {
        // Resposta vazia = apagar (desfazer).
        const { error } = await supabase
          .from('ideia_provocacoes')
          .delete()
          .eq('ideia_id', ideiaId)
          .eq('prompt_id', promptId);
        if (error) throw error;
        return;
      }
      const { error } = await supabase
        .from('ideia_provocacoes')
        .upsert(
          {
            user_id: user.id,
            ideia_id: ideiaId,
            prompt_id: promptId,
            resposta: limpo,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'ideia_id,prompt_id' },
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: provocacaoKeys.byIdeia(ideiaId) }),
  });
}
