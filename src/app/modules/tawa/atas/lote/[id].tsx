import * as Haptics from 'expo-haptics';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronRight, SlidersHorizontal, Trash2, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Modules, Radius, Spacing } from '@/constants/theme';
import {
  useAtualizarAta,
  useAtualizarLote,
  useContatos,
  useDeletarLote,
  useLotePainel,
  useSetEmpenhoStatus,
  useSetParticipante,
} from '@/modules/tawa/crm/queries';
import { parsearDataBR } from '@/shared/format/date';
import {
  EMPENHO_STATUS_CORES,
  EMPENHO_STATUS_LABELS,
  EMPENHO_STATUS_SEQUENCE,
  corReceptividade,
  type EmpenhoStatus,
  type LotePainel,
  type LoteParticipante,
} from '@/modules/tawa/crm/types';

const ACCENT = Modules.tawa.accent;

function vigenciaInfo(iso: string | null): { texto: string; vencida: boolean } | null {
  if (!iso) return null;
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  const data = new Date(y, m - 1, d);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return {
    texto: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`,
    vencida: data < hoje,
  };
}

export default function LotePainelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: painel, isLoading } = useLotePainel(id);
  const setStatus = useSetEmpenhoStatus();
  const [gerenciar, setGerenciar] = useState(false);

  const linhas = useMemo(() => {
    if (!painel) return [];
    return [...painel.participantes].sort((a, b) => {
      const ea = a.empenho?.status === 'empenhado' ? 1 : 0;
      const eb = b.empenho?.status === 'empenhado' ? 1 : 0;
      if (ea !== eb) return ea - eb;
      const ra = a.contato.receptividade ?? -1;
      const rb = b.contato.receptividade ?? -1;
      if (ra !== rb) return rb - ra;
      return a.contato.nome.localeCompare(b.contato.nome);
    });
  }, [painel]);

  if (isLoading || !painel) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: '' }} />
        <SafeAreaView style={styles.safe}>
          <ThemedText type="default" themeColor="textMuted" style={{ padding: Spacing.three }}>
            {isLoading ? 'Carregando...' : 'Lote não encontrado.'}
          </ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const { lote, ataNome, participantes } = painel;
  const empenhados = participantes.filter((p) => p.empenho?.status === 'empenhado').length;
  const pct = participantes.length > 0 ? empenhados / participantes.length : 0;

  function ciclar(contatoId: string, atual: EmpenhoStatus) {
    const idx = EMPENHO_STATUS_SEQUENCE.indexOf(atual);
    const proximo = EMPENHO_STATUS_SEQUENCE[(idx + 1) % EMPENHO_STATUS_SEQUENCE.length];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStatus.mutate({ contato_id: contatoId, lote_id: lote.id, status: proximo });
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: `${ataNome} · ${lote.numero ?? 'Lote'}`,
          headerRight: () => (
            <Pressable onPress={() => setGerenciar(true)} hitSlop={10}>
              <SlidersHorizontal size={20} color={'rgba(245,241,237,0.65)' as any} />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Cabeçalho do lote */}
          <ThemedView type="backgroundElement" style={[styles.resumoCard, { borderLeftColor: ACCENT }]}>
            <ThemedText type="meta" themeColor="textSecondary">
              {lote.numero ? `${lote.numero.toUpperCase()} · ` : ''}{ataNome.toUpperCase()}
            </ThemedText>
            <ThemedText type="titleMD">{lote.veiculo}</ThemedText>
            {(() => {
              const vig = vigenciaInfo(painel.ataVigencia);
              const partes: string[] = [];
              if (painel.ataEdital) partes.push(painel.ataEdital);
              if (vig) partes.push(vig.vencida ? `vencida ${vig.texto}` : `vence ${vig.texto}`);
              if (partes.length === 0) return null;
              return (
                <ThemedText type="mono" style={[styles.vig, vig?.vencida && { color: '#E04830' }]}>
                  {partes.join(' · ')}
                </ThemedText>
              );
            })()}
            <View style={styles.barra}>
              <View style={[styles.barraFill, { width: `${pct * 100}%`, backgroundColor: EMPENHO_STATUS_CORES.empenhado }]} />
            </View>
            <ThemedText type="mono" style={styles.contagem}>
              {empenhados}/{participantes.length} empenhado{empenhados === 1 ? '' : 's'}
            </ThemedText>
          </ThemedView>

          {participantes.length === 0 && (
            <ThemedText type="small" themeColor="textMuted">
              Nenhum município ainda. Toque na engrenagem pra marcar quem participa.
            </ThemedText>
          )}

          {participantes.length > 0 && (
            <ThemedText type="small" themeColor="textMuted" style={styles.dica}>
              Toque no status pra avançar · toque na cidade pra abrir o contato
            </ThemedText>
          )}

          {/* Cidades × status deste lote */}
          {linhas.length > 0 && (
            <ThemedView type="backgroundElement" style={styles.grade}>
              {linhas.map((p) => (
                <Linha key={p.contato.id} p={p} onCiclar={ciclar} />
              ))}
            </ThemedView>
          )}

          {/* Legenda */}
          {participantes.length > 0 && (
            <View style={styles.statusLegenda}>
              {EMPENHO_STATUS_SEQUENCE.map((s) => (
                <View key={s} style={styles.statusLegendaItem}>
                  <View style={[styles.statusDot, { backgroundColor: EMPENHO_STATUS_CORES[s] }]} />
                  <ThemedText type="small" themeColor="textMuted">{EMPENHO_STATUS_LABELS[s]}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {gerenciar && (
        <GerenciarLote painel={painel} onClose={() => setGerenciar(false)} />
      )}
    </ThemedView>
  );
}

function Linha({
  p,
  onCiclar,
}: {
  p: LoteParticipante;
  onCiclar: (contatoId: string, atual: EmpenhoStatus) => void;
}) {
  const status: EmpenhoStatus = p.empenho?.status ?? 'pendente';
  const cor = EMPENHO_STATUS_CORES[status];
  const rec = p.contato.receptividade;
  return (
    <View style={styles.linha}>
      <Pressable
        style={styles.cidade}
        onPress={() => router.push(`/modules/tawa/contatos/${p.contato.id}` as any)}>
        <View
          style={[
            styles.recDot,
            { backgroundColor: rec != null ? corReceptividade(rec) : 'rgba(245,241,237,0.15)' },
          ]}
        />
        <ThemedText type="default" numberOfLines={1} style={{ flex: 1 }}>
          {p.contato.nome}
        </ThemedText>
        <ChevronRight size={13} color={'rgba(245,241,237,0.25)' as any} />
      </Pressable>
      <Pressable
        hitSlop={4}
        onPress={() => onCiclar(p.contato.id, status)}
        style={({ pressed }) => [
          styles.chip,
          { backgroundColor: cor + '22', borderColor: cor + '55' },
          pressed && { opacity: 0.6 },
        ]}>
        <ThemedText type="mono" style={[styles.chipText, { color: cor }]}>
          {EMPENHO_STATUS_LABELS[status]}
        </ThemedText>
      </Pressable>
    </View>
  );
}

// ============================================================================
// Gerenciar lote: editar veículo/nº, municípios do consórcio, apagar lote
// ============================================================================
function GerenciarLote({ painel, onClose }: { painel: LotePainel; onClose: () => void }) {
  const ataId = painel.lote.ata_id;
  const { data: contatos } = useContatos();
  const atualizar = useAtualizarLote();
  const atualizarAta = useAtualizarAta();
  const deletar = useDeletarLote(ataId);
  const setParticipante = useSetParticipante(ataId);

  const [veiculo, setVeiculo] = useState(painel.lote.veiculo);
  const [numero, setNumero] = useState(painel.lote.numero ?? '');
  const [edital, setEdital] = useState(painel.ataEdital ?? '');
  const [vigencia, setVigencia] = useState(() => {
    const v = vigenciaInfo(painel.ataVigencia);
    return v ? v.texto : '';
  });

  const participantesIds = new Set(painel.participantes.map((p) => p.contato.id));
  const candidatos = (contatos ?? [])
    .filter((c) => c.tipo === 'prefeitura' || c.tipo === 'orgao')
    .sort((a, b) => {
      const da = participantesIds.has(a.id) ? 0 : 1;
      const db = participantesIds.has(b.id) ? 0 : 1;
      if (da !== db) return da - db;
      return a.nome.localeCompare(b.nome);
    });

  function salvarLote() {
    if (!veiculo.trim()) return;
    atualizar.mutate({
      id: painel.lote.id,
      patch: { veiculo: veiculo.trim(), numero: numero.trim() || null },
    });
    Haptics.selectionAsync();
  }

  function salvarConsorcio() {
    const d = parsearDataBR(vigencia);
    const vigISO = d
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      : null;
    atualizarAta.mutate({
      id: ataId,
      patch: { edital_ref: edital.trim() || null, vigencia_em: vigISO },
    });
    Haptics.selectionAsync();
  }

  function apagarLote() {
    Alert.alert('Apagar lote', `Apagar "${painel.lote.veiculo}"? Leva os empenhos junto.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          await deletar.mutateAsync(painel.lote.id);
          onClose();
          router.back();
        },
      },
    ]);
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <ThemedText type="titleMD" style={{ color: '#F5F1ED' }}>Gerenciar lote</ThemedText>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={22} color={'rgba(245,241,237,0.65)' as any} />
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={styles.sheetBody}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}>
          <ThemedText type="meta" themeColor="textSecondary">LOTE</ThemedText>
          <View style={styles.loteRow}>
            <TextInput
              value={numero}
              onChangeText={setNumero}
              onBlur={salvarLote}
              placeholder="Lote 3"
              placeholderTextColor="rgba(245,241,237,0.25)"
              style={[styles.input, { width: 100 }]}
            />
            <TextInput
              value={veiculo}
              onChangeText={setVeiculo}
              onBlur={salvarLote}
              placeholder="Veículo"
              placeholderTextColor="rgba(245,241,237,0.25)"
              style={[styles.input, { flex: 1 }]}
            />
          </View>

          <ThemedText type="meta" themeColor="textSecondary" style={{ marginTop: Spacing.three }}>
            CONSÓRCIO ({painel.ataNome})
          </ThemedText>
          <View style={styles.loteRow}>
            <TextInput
              value={edital}
              onChangeText={setEdital}
              onBlur={salvarConsorcio}
              placeholder="Edital (003/2026)"
              placeholderTextColor="rgba(245,241,237,0.25)"
              style={[styles.input, { flex: 1 }]}
            />
            <TextInput
              value={vigencia}
              onChangeText={setVigencia}
              onBlur={salvarConsorcio}
              placeholder="Vence (dd/mm/aaaa)"
              placeholderTextColor="rgba(245,241,237,0.25)"
              keyboardType="numbers-and-punctuation"
              style={[styles.input, { flex: 1 }]}
            />
          </View>
          <ThemedText type="small" themeColor="textMuted">
            Edital e vigência valem pra todos os lotes deste consórcio.
          </ThemedText>

          <ThemedText type="meta" themeColor="textSecondary" style={{ marginTop: Spacing.three }}>
            MUNICÍPIOS DO CONSÓRCIO
          </ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            Vale pra todos os lotes deste consórcio.
          </ThemedText>
          {candidatos.length === 0 && (
            <ThemedText type="small" themeColor="textMuted">
              Nenhuma prefeitura/órgão no CRM ainda.
            </ThemedText>
          )}
          {candidatos.map((c) => {
            const dentro = participantesIds.has(c.id);
            return (
              <Pressable
                key={c.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setParticipante.mutate({ contato_id: c.id, participa: !dentro });
                }}
                style={({ pressed }) => [styles.partItem, pressed && { opacity: 0.7 }]}>
                <View style={[styles.checkbox, dentro && { backgroundColor: ACCENT, borderColor: ACCENT }]}>
                  {dentro && <Check size={12} color={'#1C1917' as any} strokeWidth={3} />}
                </View>
                <ThemedText type="default" style={{ flex: 1 }} numberOfLines={1}>
                  {c.nome}
                </ThemedText>
                {c.uf ? <ThemedText type="mono" style={styles.gerSub}>{c.uf}</ThemedText> : null}
              </Pressable>
            );
          })}

          <Pressable onPress={apagarLote} style={({ pressed }) => [styles.apagar, pressed && { opacity: 0.7 }]}>
            <Trash2 size={15} color={'#C25B4E' as any} />
            <ThemedText type="default" style={{ color: '#C25B4E' }}>Apagar lote</ThemedText>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: Spacing.three, gap: Spacing.three, paddingBottom: 60 },

  resumoCard: { padding: Spacing.three, borderRadius: Radius.lg, gap: Spacing.two, borderLeftWidth: 2 },
  barra: { height: 6, backgroundColor: 'rgba(245,241,237,0.08)', borderRadius: 3, overflow: 'hidden' },
  barraFill: { height: '100%', borderRadius: 3 },
  contagem: { fontSize: 12, color: 'rgba(245,241,237,0.55)' },
  vig: { fontSize: 12, color: 'rgba(245,241,237,0.55)' },
  dica: { paddingHorizontal: 2, opacity: 0.7 },

  grade: { borderRadius: Radius.lg, paddingHorizontal: Spacing.three, paddingVertical: Spacing.one },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(245,241,237,0.07)',
  },
  cidade: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  recDot: { width: 7, height: 7, borderRadius: 3.5 },
  chip: { minWidth: 92, alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, borderRadius: Radius.sm, borderWidth: 1 },
  chipText: { fontSize: 10, letterSpacing: 0.3 },

  statusLegenda: { flexDirection: 'row', gap: Spacing.three, justifyContent: 'center' },
  statusLegendaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  sheet: { flex: 1, backgroundColor: '#1C1917' },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    paddingTop: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(245,241,237,0.08)',
  },
  sheetBody: { padding: Spacing.three, gap: Spacing.two, paddingBottom: 80 },
  loteRow: { flexDirection: 'row', gap: Spacing.two },
  input: {
    backgroundColor: 'rgba(245,241,237,0.06)',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    color: '#F5F1ED',
    fontSize: 15,
  },
  partItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 9 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(245,241,237,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gerSub: { fontSize: 11, color: 'rgba(245,241,237,0.45)' },
  apagar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#C25B4E' + '44',
  },
});
