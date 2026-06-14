import * as Haptics from 'expo-haptics';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  ChevronRight,
  ExternalLink,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Modules, Radius, Spacing } from '@/constants/theme';
import { formatarData } from '@/shared/format/date';
import {
  ESTAGIOS,
  ESTAGIO_CORES,
  ESTAGIO_LABELS,
  HIPOTESE_CORES,
  HIPOTESE_LABELS,
  HIPOTESE_STATUS,
  INSIGHT_CORES,
  INSIGHT_LABELS,
  TIPO_LABELS,
  calcularScore,
  camposCanvas,
  useAnalisarIdeia,
  useInsights,
  provocacoesPara,
  proximoExperimento,
  useAtualizarHipotese,
  useAtualizarIdeia,
  useCriarHipotese,
  useDeletarHipotese,
  useDeletarIdeia,
  useHipoteses,
  useIdeia,
  useProvocacoes,
  useResponderProvocacao,
  type Hipotese,
  type Ideia,
  type Provocacao,
  type StatusHipotese,
  type TipoIdeia,
} from '@/modules/ideias/queries';

const ACCENT = Modules.ideias.accent; // terracota

export default function IdeiaDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: ideia, isLoading } = useIdeia(id);
  const { data: hipoteses } = useHipoteses(id);
  const { data: provocacoes } = useProvocacoes(id);
  const atualizar = useAtualizarIdeia();
  const deletar = useDeletarIdeia();

  const score = useMemo(
    () =>
      ideia
        ? calcularScore({
            ideia,
            hipoteses: hipoteses ?? [],
            provocacoes: provocacoes ?? [],
          })
        : null,
    [ideia, hipoteses, provocacoes],
  );

  if (isLoading || !ideia) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: '' }} />
        <SafeAreaView style={styles.safe}>
          <ThemedText type="default" themeColor="textMuted">
            {isLoading ? 'Carregando...' : 'Ideia não encontrada.'}
          </ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  function ciclarEstagio() {
    if (!ideia) return;
    const idx = ESTAGIOS.indexOf(ideia.estagio);
    const proximo = ESTAGIOS[(idx + 1) % ESTAGIOS.length];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    atualizar.mutate({ id: ideia.id, patch: { estagio: proximo } });
  }

  function confirmarDeletar() {
    if (!ideia) return;
    Alert.alert('Apagar ideia', `Apagar "${ideia.nome}"? Isso não volta.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          await deletar.mutateAsync(ideia.id);
          router.back();
        },
      },
    ]);
  }

  const cor = ESTAGIO_CORES[ideia.estagio];
  const salvar = (patch: Record<string, string | null>) =>
    atualizar.mutateAsync({ id: ideia.id, patch });

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: ideia.nome,
          headerRight: () => (
            <Pressable onPress={confirmarDeletar} hitSlop={10}>
              <Trash2 size={20} color={'rgba(245,241,237,0.55)' as any} />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets>
          {/* Cabeçalho */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <ThemedText type="displayLG">{ideia.nome}</ThemedText>
              <ThemedText type="mono" style={styles.sub}>
                Atualizada {formatarData(ideia.updated_at)}
              </ThemedText>
            </View>
            <Pressable
              onPress={ciclarEstagio}
              hitSlop={8}
              style={({ pressed }) => [styles.pill, { backgroundColor: cor + '22' }, pressed && { opacity: 0.6 }]}>
              <ThemedText type="mono" style={[styles.pillText, { color: cor }]}>
                {ESTAGIO_LABELS[ideia.estagio]}
              </ThemedText>
            </Pressable>
          </View>

          {/* Tipo da ideia — adapta as perguntas/score */}
          <TipoToggle
            tipo={ideia.tipo}
            onMudar={(t) => atualizar.mutate({ id: ideia.id, patch: { tipo: t } })}
          />

          {/* Score de validação */}
          {score && <ScoreCard score={score.score} faltando={score.faltando} />}

          {/* Análise da IA (sócio crítico) */}
          <InsightsSection ideiaId={ideia.id} />

          {/* Próximo passo sugerido (adapta ao tipo) */}
          <ProximoExperimento estagio={ideia.estagio} tipo={ideia.tipo} />

          {/* Provocações — advogado do diabo (adapta ao tipo) */}
          <ProvocacoesSection ideiaId={ideia.id} tipo={ideia.tipo} provocacoes={provocacoes ?? []} />

          {/* Hipóteses / experimentos */}
          <HipotesesSection ideiaId={ideia.id} hipoteses={hipoteses ?? []} />

          {/* ---- Canvas (rótulos adaptam ao tipo) ---- */}
          {camposCanvas(ideia.tipo).map((grupo) => (
            <View key={grupo.secao} style={{ gap: Spacing.three }}>
              <SectionLabel texto={grupo.secao} />
              {grupo.campos.map((campo) => (
                <CampoEditavel
                  key={campo.key}
                  label={campo.label}
                  hint={campo.hint}
                  valor={ideia[campo.key]}
                  placeholder={campo.placeholder}
                  destaque={campo.destaque ? ACCENT : undefined}
                  multiline={campo.key !== 'metrica_chave'}
                  onSalvar={(t) => salvar({ [campo.key]: t.trim() || null })}
                />
              ))}
            </View>
          ))}

          <SectionLabel texto="Execução" />
          <CampoEditavel
            label="Próximo passo"
            valor={ideia.proximo_passo}
            placeholder="A menor ação concreta pra avançar"
            onSalvar={(t) => salvar({ proximo_passo: t.trim() || null })}
          />
          <CampoEditavel
            label="Notas"
            valor={ideia.notas}
            placeholder="Qualquer coisa solta"
            multiline
            onSalvar={(t) => salvar({ notas: t.trim() || null })}
          />
          <CampoEditavel
            label="Referência / link"
            valor={ideia.link}
            placeholder="Concorrente, inspiração, artigo..."
            keyboardType="url"
            right={
              ideia.link ? (
                <Pressable onPress={() => Linking.openURL(ideia.link!)} hitSlop={8}>
                  <ExternalLink size={14} color={'rgba(245,241,237,0.45)' as any} />
                </Pressable>
              ) : undefined
            }
            onSalvar={(t) => salvar({ link: t.trim() || null })}
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

// ============================================================================
// Score de validação
// ============================================================================
function ScoreCard({ score, faltando }: { score: number; faltando: string[] }) {
  const cor = score >= 70 ? '#8FA899' : score >= 40 ? '#E8A845' : ACCENT;
  const rotulo = score >= 70 ? 'Forte' : score >= 40 ? 'Em construção' : 'Cru';
  return (
    <ThemedView type="backgroundElement" style={styles.scoreCard}>
      <View style={styles.scoreTop}>
        <View>
          <ThemedText type="meta" themeColor="textSecondary">
            VALIDAÇÃO
          </ThemedText>
          <View style={styles.scoreRow}>
            <ThemedText type="displayLG" style={{ color: cor }}>
              {score}
            </ThemedText>
            <ThemedText type="mono" style={styles.scoreMax}>
              /100 · {rotulo}
            </ThemedText>
          </View>
        </View>
      </View>
      <View style={styles.scoreBar}>
        <View style={[styles.scoreFill, { width: `${score}%`, backgroundColor: cor }]} />
      </View>
      {faltando.length > 0 && (
        <View style={styles.faltandoBox}>
          <ThemedText type="small" themeColor="textMuted" style={{ marginBottom: 2 }}>
            Pra subir o score:
          </ThemedText>
          {faltando.map((f) => (
            <View key={f} style={styles.faltandoRow}>
              <ChevronRight size={12} color={ACCENT as any} />
              <ThemedText type="small" themeColor="textSecondary">
                {f}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </ThemedView>
  );
}

/** Alterna o tipo da ideia: negócio a construir vs oportunidade/investimento. */
function TipoToggle({
  tipo,
  onMudar,
}: {
  tipo: TipoIdeia;
  onMudar: (t: TipoIdeia) => void;
}) {
  const opcoes: TipoIdeia[] = ['construir', 'oportunidade'];
  return (
    <View style={styles.tipoRow}>
      {opcoes.map((t) => {
        const ativo = tipo === t;
        return (
          <Pressable
            key={t}
            onPress={() => {
              if (!ativo) {
                Haptics.selectionAsync();
                onMudar(t);
              }
            }}
            style={({ pressed }) => [
              styles.tipoChip,
              ativo && { backgroundColor: ACCENT + '22', borderColor: ACCENT },
              pressed && { opacity: 0.7 },
            ]}>
            <ThemedText
              type="mono"
              style={[styles.tipoChipText, ativo && { color: ACCENT }]}>
              {TIPO_LABELS[t]}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

// ============================================================================
// Insights da IA — sócio crítico (Claude via Edge Function)
// ============================================================================
function InsightsSection({ ideiaId }: { ideiaId: string }) {
  const { data: insights } = useInsights(ideiaId);
  const analisar = useAnalisarIdeia(ideiaId);
  const lista = insights ?? [];
  const erro = analisar.error ? String((analisar.error as Error).message) : null;

  return (
    <ThemedView type="backgroundElement" style={[styles.expCard, { borderLeftColor: '#6B8FB8' }]}>
      <View style={styles.insightHead}>
        <View style={styles.expHead}>
          <Wand2 size={14} color={'#6B8FB8' as any} />
          <ThemedText type="meta" themeColor="textSecondary">
            ANÁLISE DA IA
          </ThemedText>
        </View>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            analisar.mutate();
          }}
          disabled={analisar.isPending}
          hitSlop={6}
          style={({ pressed }) => [
            styles.analisarBtn,
            pressed && { opacity: 0.7 },
            analisar.isPending && { opacity: 0.5 },
          ]}>
          <ThemedText type="mono" style={styles.analisarBtnTexto}>
            {analisar.isPending ? 'Pensando...' : lista.length > 0 ? 'Refazer' : 'Analisar'}
          </ThemedText>
        </Pressable>
      </View>

      {erro && (
        <ThemedText type="small" style={{ color: '#C25B4E' }}>
          {erro}
        </ThemedText>
      )}

      {lista.length === 0 && !analisar.isPending && !erro && (
        <ThemedText type="small" themeColor="textMuted">
          Um sócio crítico analisa sua ideia: riscos, pontos cegos e o próximo passo.
          Preencha o que puder e toque em Analisar.
        </ThemedText>
      )}

      {lista.map((ins) => {
        const cor = INSIGHT_CORES[ins.tipo] ?? '#6B8FB8';
        return (
          <View key={ins.id} style={styles.insightItem}>
            <View style={styles.insightTopo}>
              <View style={[styles.insightTag, { backgroundColor: cor + '22' }]}>
                <ThemedText type="mono" style={[styles.insightTagTexto, { color: cor }]}>
                  {INSIGHT_LABELS[ins.tipo] ?? ins.tipo}
                </ThemedText>
              </View>
              {ins.titulo ? (
                <ThemedText type="default" style={{ flex: 1, fontWeight: '600' }} numberOfLines={2}>
                  {ins.titulo}
                </ThemedText>
              ) : null}
            </View>
            <ThemedText type="small" themeColor="textSecondary" style={{ lineHeight: 19 }}>
              {ins.conteudo}
            </ThemedText>
          </View>
        );
      })}
    </ThemedView>
  );
}

function ProximoExperimento({ estagio, tipo }: { estagio: any; tipo: TipoIdeia }) {
  return (
    <ThemedView type="backgroundElement" style={[styles.expCard, { borderLeftColor: ACCENT }]}>
      <View style={styles.expHead}>
        <Sparkles size={14} color={ACCENT as any} />
        <ThemedText type="meta" themeColor="textSecondary">
          PRÓXIMO PASSO
        </ThemedText>
      </View>
      <ThemedText type="default">{proximoExperimento(estagio, tipo)}</ThemedText>
    </ThemedView>
  );
}

// ============================================================================
// Provocações — advogado do diabo
// ============================================================================
function ProvocacoesSection({
  ideiaId,
  tipo,
  provocacoes,
}: {
  ideiaId: string;
  tipo: TipoIdeia;
  provocacoes: Provocacao[];
}) {
  const responder = useResponderProvocacao(ideiaId);
  const [aberta, setAberta] = useState<string | null>(null);
  const banco = provocacoesPara(tipo);

  const respostas = useMemo(() => {
    const m: Record<string, string> = {};
    provocacoes.forEach((p) => (m[p.prompt_id] = p.resposta));
    return m;
  }, [provocacoes]);

  const respondidas = banco.filter((p) => (respostas[p.id] ?? '').trim()).length;
  const proxima = banco.find((p) => !(respostas[p.id] ?? '').trim());

  return (
    <ThemedView type="backgroundElement" style={styles.provBox}>
      <View style={styles.provHeader}>
        <ThemedText type="meta" themeColor="textSecondary">
          ADVOGADO DO DIABO
        </ThemedText>
        <ThemedText type="mono" style={styles.provCount}>
          {respondidas}/{banco.length}
        </ThemedText>
      </View>

      {proxima && aberta == null && (
        <Pressable
          onPress={() => setAberta(proxima.id)}
          style={({ pressed }) => [styles.proximaProv, pressed && { opacity: 0.7 }]}>
          <ThemedText type="default" style={styles.proximaPergunta}>
            {proxima.pergunta}
          </ThemedText>
          <ThemedText type="small" style={{ color: ACCENT, marginTop: 4 }}>
            Tocar pra responder →
          </ThemedText>
        </Pressable>
      )}

      {!proxima && aberta == null && (
        <ThemedText type="small" themeColor="textMuted" style={{ marginTop: 4 }}>
          Todas respondidas. Revise abaixo quando a ideia evoluir.
        </ThemedText>
      )}

      {banco.map((p) => {
        const resposta = respostas[p.id] ?? '';
        const temResposta = resposta.trim().length > 0;
        const estaAberta = aberta === p.id;
        if (!temResposta && !estaAberta) return null;
        return (
          <ProvocacaoItem
            key={p.id}
            pergunta={p.pergunta}
            resposta={resposta}
            aberta={estaAberta}
            onAbrir={() => setAberta(p.id)}
            onFechar={() => setAberta(null)}
            onSalvar={async (texto) => {
              await responder.mutateAsync({ promptId: p.id, resposta: texto });
              setAberta(null);
            }}
          />
        );
      })}
    </ThemedView>
  );
}

function ProvocacaoItem({
  pergunta,
  resposta,
  aberta,
  onAbrir,
  onFechar,
  onSalvar,
}: {
  pergunta: string;
  resposta: string;
  aberta: boolean;
  onAbrir: () => void;
  onFechar: () => void;
  onSalvar: (texto: string) => Promise<void>;
}) {
  const [texto, setTexto] = useState(resposta);
  useEffect(() => {
    if (!aberta) setTexto(resposta);
  }, [resposta, aberta]);

  return (
    <View style={styles.provItem}>
      <ThemedText type="small" style={styles.provPergunta}>
        {pergunta}
      </ThemedText>
      {aberta ? (
        <View style={{ gap: Spacing.two, marginTop: 4 }}>
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Sua resposta honesta..."
            placeholderTextColor="rgba(245,241,237,0.25)"
            multiline
            autoFocus
            style={[styles.input, { minHeight: 72, textAlignVertical: 'top' }]}
          />
          <View style={styles.btns}>
            <Pressable onPress={onFechar} style={({ pressed }) => [styles.cancel, pressed && { opacity: 0.7 }]}>
              <ThemedText type="small" themeColor="textMuted">
                Fechar
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => onSalvar(texto)}
              style={({ pressed }) => [styles.save, pressed && { opacity: 0.85 }]}>
              <ThemedText type="small" style={{ color: '#1C1917', fontWeight: '600' }}>
                Salvar
              </ThemedText>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable onPress={onAbrir} style={({ pressed }) => pressed && { opacity: 0.7 }}>
          <ThemedText type="default" style={styles.provResposta}>
            {resposta}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

// ============================================================================
// Hipóteses / experimentos
// ============================================================================
function HipotesesSection({
  ideiaId,
  hipoteses,
}: {
  ideiaId: string;
  hipoteses: Hipotese[];
}) {
  const criar = useCriarHipotese(ideiaId);
  const atualizar = useAtualizarHipotese(ideiaId);
  const deletar = useDeletarHipotese(ideiaId);
  const [adicionando, setAdicionando] = useState(false);
  const [texto, setTexto] = useState('');
  const [comoTestar, setComoTestar] = useState('');

  async function salvarNova() {
    if (!texto.trim()) return;
    await criar.mutateAsync({ texto: texto.trim(), como_testar: comoTestar.trim() || undefined });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTexto('');
    setComoTestar('');
    setAdicionando(false);
  }

  function ciclarStatus(h: Hipotese) {
    const idx = HIPOTESE_STATUS.indexOf(h.status);
    const proximo = HIPOTESE_STATUS[(idx + 1) % HIPOTESE_STATUS.length] as StatusHipotese;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    atualizar.mutate({ id: h.id, patch: { status: proximo } });
  }

  function confirmarApagar(h: Hipotese) {
    Alert.alert('Apagar hipótese', 'Remover esta hipótese?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => deletar.mutate(h.id) },
    ]);
  }

  return (
    <ThemedView type="backgroundElement" style={styles.hipBox}>
      <View style={styles.provHeader}>
        <ThemedText type="meta" themeColor="textSecondary">
          HIPÓTESES A TESTAR
        </ThemedText>
        <ThemedText type="mono" style={styles.provCount}>
          {hipoteses.filter((h) => h.status === 'validada').length}/{hipoteses.length} ✓
        </ThemedText>
      </View>

      {hipoteses.length === 0 && !adicionando && (
        <ThemedText type="small" themeColor="textMuted" style={{ marginTop: 2 }}>
          O que precisa ser verdade pra ideia funcionar? Liste e teste barato.
        </ThemedText>
      )}

      {hipoteses.map((h) => {
        const cor = HIPOTESE_CORES[h.status];
        return (
          <View key={h.id} style={styles.hipItem}>
            <View style={styles.hipTop}>
              <ThemedText type="default" style={{ flex: 1 }}>
                {h.texto}
              </ThemedText>
              <Pressable onPress={() => confirmarApagar(h)} hitSlop={8}>
                <Trash2 size={14} color={'rgba(245,241,237,0.35)' as any} />
              </Pressable>
            </View>
            {h.como_testar ? (
              <ThemedText type="small" themeColor="textMuted">
                Teste: {h.como_testar}
              </ThemedText>
            ) : null}
            <Pressable
              onPress={() => ciclarStatus(h)}
              hitSlop={6}
              style={({ pressed }) => [
                styles.hipStatus,
                { backgroundColor: cor + '22' },
                pressed && { opacity: 0.6 },
              ]}>
              <ThemedText type="mono" style={[styles.hipStatusText, { color: cor }]}>
                {HIPOTESE_LABELS[h.status]}
              </ThemedText>
            </Pressable>
          </View>
        );
      })}

      {adicionando ? (
        <View style={styles.hipForm}>
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Acredito que... (a hipótese)"
            placeholderTextColor="rgba(245,241,237,0.25)"
            multiline
            autoFocus
            style={[styles.input, { minHeight: 56, textAlignVertical: 'top' }]}
          />
          <TextInput
            value={comoTestar}
            onChangeText={setComoTestar}
            placeholder="Como testar barato? (opcional)"
            placeholderTextColor="rgba(245,241,237,0.25)"
            style={styles.input}
          />
          <View style={styles.btns}>
            <Pressable onPress={() => setAdicionando(false)} style={({ pressed }) => [styles.cancel, pressed && { opacity: 0.7 }]}>
              <ThemedText type="small" themeColor="textMuted">
                Cancelar
              </ThemedText>
            </Pressable>
            <Pressable onPress={salvarNova} style={({ pressed }) => [styles.save, pressed && { opacity: 0.85 }]}>
              <ThemedText type="small" style={{ color: '#1C1917', fontWeight: '600' }}>
                Adicionar
              </ThemedText>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={() => setAdicionando(true)}
          style={({ pressed }) => [styles.addHip, pressed && { opacity: 0.6 }]}>
          <Plus size={15} color={ACCENT as any} />
          <ThemedText type="small" style={{ color: ACCENT }}>
            Nova hipótese
          </ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

// ============================================================================
// Auxiliares
// ============================================================================
function SectionLabel({ texto }: { texto: string }) {
  return (
    <ThemedText type="meta" themeColor="textMuted" style={styles.sectionLabel}>
      {texto.toUpperCase()}
    </ThemedText>
  );
}

function CampoEditavel({
  label,
  hint,
  valor,
  placeholder,
  onSalvar,
  multiline,
  keyboardType,
  right,
  destaque,
}: {
  label: string;
  hint?: string;
  valor: string | null;
  placeholder: string;
  onSalvar: (texto: string) => Promise<unknown> | void;
  multiline?: boolean;
  keyboardType?: 'default' | 'url';
  right?: React.ReactNode;
  destaque?: string;
}) {
  const valorBruto = valor ?? '';
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(valorBruto);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!editando) setTexto(valorBruto);
  }, [valorBruto, editando]);

  function abrir() {
    setTexto(valorBruto);
    setEditando(true);
  }
  async function salvar() {
    setSalvando(true);
    try {
      await onSalvar(texto);
    } finally {
      setSalvando(false);
      setEditando(false);
    }
  }

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.block, destaque ? { borderLeftWidth: 2, borderLeftColor: destaque } : null]}>
      <View style={styles.blockHead}>
        <ThemedText type="meta" themeColor="textSecondary" style={destaque ? { color: destaque } : undefined}>
          {label}
        </ThemedText>
        <View style={styles.blockHeadRight}>
          {right}
          {!editando && (
            <Pressable onPress={abrir} hitSlop={8}>
              <Pencil size={14} color={'rgba(245,241,237,0.55)' as any} />
            </Pressable>
          )}
        </View>
      </View>
      {hint ? (
        <ThemedText type="small" themeColor="textMuted" style={styles.hint}>
          {hint}
        </ThemedText>
      ) : null}
      {editando ? (
        <View style={{ gap: Spacing.two, marginTop: 4 }}>
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder={placeholder}
            placeholderTextColor="rgba(245,241,237,0.25)"
            keyboardType={keyboardType}
            autoCapitalize={keyboardType === 'url' ? 'none' : 'sentences'}
            multiline={multiline}
            autoFocus
            style={[styles.input, multiline ? { minHeight: 72, textAlignVertical: 'top' } : { minHeight: 0 }]}
          />
          <View style={styles.btns}>
            <Pressable onPress={() => setEditando(false)} style={({ pressed }) => [styles.cancel, pressed && { opacity: 0.7 }]}>
              <ThemedText type="small" themeColor="textMuted">Cancelar</ThemedText>
            </Pressable>
            <Pressable onPress={salvar} disabled={salvando} style={({ pressed }) => [styles.save, pressed && { opacity: 0.85 }, salvando && { opacity: 0.4 }]}>
              <ThemedText type="small" style={{ color: '#1C1917', fontWeight: '600' }}>Salvar</ThemedText>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable onPress={abrir}>
          {valorBruto ? (
            <ThemedText type="default">{valorBruto}</ThemedText>
          ) : (
            <ThemedText type="small" themeColor="textMuted">Toque pra adicionar</ThemedText>
          )}
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: Spacing.three, gap: Spacing.three, paddingBottom: 80 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  sub: { color: 'rgba(245,241,237,0.45)' },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.sm, marginTop: 6 },
  pillText: { fontSize: 11, letterSpacing: 0.4 },
  sectionLabel: { marginTop: Spacing.two, letterSpacing: 1 },

  // Tipo toggle
  tipoRow: { flexDirection: 'row', gap: Spacing.two },
  tipoChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(245,241,237,0.10)',
    backgroundColor: 'rgba(245,241,237,0.04)',
  },
  tipoChipText: { fontSize: 11, letterSpacing: 0.4, color: 'rgba(245,241,237,0.55)' },

  // Score
  scoreCard: { padding: Spacing.three, borderRadius: Radius.lg, gap: Spacing.two },
  scoreTop: { flexDirection: 'row', justifyContent: 'space-between' },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  scoreMax: { fontSize: 12, color: 'rgba(245,241,237,0.45)' },
  scoreBar: { height: 6, backgroundColor: 'rgba(245,241,237,0.08)', borderRadius: 3, overflow: 'hidden' },
  scoreFill: { height: '100%', borderRadius: 3 },
  faltandoBox: { marginTop: 2, gap: 3 },
  faltandoRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },

  // Próximo experimento
  expCard: { padding: Spacing.three, borderRadius: Radius.lg, gap: 6, borderLeftWidth: 2 },
  expHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  // Insights da IA
  insightHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  analisarBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#6B8FB8' + '66',
    backgroundColor: '#6B8FB8' + '14',
  },
  analisarBtnTexto: { fontSize: 11, color: '#6B8FB8', letterSpacing: 0.3 },
  insightItem: {
    gap: 4,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(245,241,237,0.08)',
  },
  insightTopo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  insightTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.sm },
  insightTagTexto: { fontSize: 9, letterSpacing: 0.4 },

  // Provocações
  provBox: { padding: Spacing.three, borderRadius: Radius.lg, gap: Spacing.two },
  provHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  provCount: { fontSize: 11, color: 'rgba(245,241,237,0.45)' },
  proximaProv: {
    backgroundColor: 'rgba(224,145,127,0.10)',
    borderRadius: Radius.md,
    padding: Spacing.three,
    borderLeftWidth: 2,
    borderLeftColor: ACCENT,
  },
  proximaPergunta: { lineHeight: 21 },
  provItem: {
    gap: 2,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(245,241,237,0.08)',
  },
  provPergunta: { color: 'rgba(245,241,237,0.55)', lineHeight: 18 },
  provResposta: { marginTop: 2 },

  // Hipóteses
  hipBox: { padding: Spacing.three, borderRadius: Radius.lg, gap: Spacing.two },
  hipItem: {
    gap: 4,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(245,241,237,0.08)',
  },
  hipTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  hipStatus: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.sm, marginTop: 2 },
  hipStatusText: { fontSize: 10, letterSpacing: 0.4 },
  hipForm: { gap: Spacing.two, marginTop: Spacing.two },
  addHip: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.two },

  // Genéricos
  block: { padding: Spacing.three, borderRadius: Radius.lg, gap: Spacing.one },
  hint: { marginTop: -2, fontStyle: 'italic', opacity: 0.85 },
  blockHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  blockHeadRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  input: { backgroundColor: 'rgba(245,241,237,0.06)', borderRadius: Radius.md, padding: Spacing.three, color: '#F5F1ED', fontSize: 15 },
  btns: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: Spacing.three },
  cancel: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  save: { backgroundColor: ACCENT, borderRadius: Radius.md, paddingHorizontal: Spacing.four, paddingVertical: Spacing.two },
});
