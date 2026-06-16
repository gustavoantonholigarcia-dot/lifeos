import * as Haptics from 'expo-haptics';
import { Stack, router } from 'expo-router';
import { ChevronRight, Plus, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Modules, Radius, Spacing } from '@/constants/theme';
import {
  useAtas,
  useCriarAta,
  useCriarLoteFlex,
  useDeletarLote,
  useLotesCards,
} from '@/modules/tawa/crm/queries';
import { parsearDataBR } from '@/shared/format/date';
import { formatarReaisCompacto, parsearReais } from '@/modules/tawa/crm/helpers';
import { EMPENHO_STATUS_CORES, type Ata, type LoteCard } from '@/modules/tawa/crm/types';

const ACCENT = Modules.tawa.accent;

/** "12/12/2026" + flag se já venceu. Recebe ISO date (YYYY-MM-DD). */
function vigenciaInfo(iso: string | null): { texto: string; vencida: boolean } | null {
  if (!iso) return null;
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  const data = new Date(y, m - 1, d);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const vencida = data < hoje;
  return { texto: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`, vencida };
}

export default function AtasScreen() {
  const { data: cards, isLoading } = useLotesCards();
  const { data: atas } = useAtas();
  const deletar = useDeletarLote('');
  const [formOpen, setFormOpen] = useState(false);

  const atasMap = useMemo(() => {
    const m = new Map<string, Ata>();
    (atas ?? []).forEach((a) => m.set(a.id, a));
    return m;
  }, [atas]);

  // Agrupa os lotes por consórcio (ata), mantendo ordem de criação.
  const grupos = useMemo(() => {
    const map = new Map<string, { ataId: string; nome: string; cards: LoteCard[] }>();
    (cards ?? []).forEach((c) => {
      const g = map.get(c.lote.ata_id) ?? { ataId: c.lote.ata_id, nome: c.ataNome, cards: [] };
      g.cards.push(c);
      map.set(c.lote.ata_id, g);
    });
    return Array.from(map.values());
  }, [cards]);

  function confirmarApagar(card: LoteCard) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Apagar lote',
      `Apagar "${card.ataNome} · ${card.lote.veiculo}"? Leva os empenhos dele junto.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: () => deletar.mutate(card.lote.id) },
      ],
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Atas de registro' }} />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ThemedText type="small" themeColor="textMuted">
            Cada lote ganho é um card. Mesmo consórcio compartilha os municípios.
          </ThemedText>

          {!isLoading && grupos.length === 0 && (
            <ThemedView type="backgroundElement" style={styles.emptyCard}>
              <ThemedText type="default">Nenhum lote ainda.</ThemedText>
              <ThemedText type="small" themeColor="textMuted">
                Toque + pra lançar um lote (ex: CIGEDAS · Lote 3 · Ambulância).
              </ThemedText>
            </ThemedView>
          )}

          {grupos.map((g) => (
            <View key={g.ataId} style={styles.grupo}>
              <View style={styles.grupoHeader}>
                <View style={[styles.grupoSpine, { backgroundColor: ACCENT }]} />
                <View style={{ flex: 1 }}>
                  <ThemedText type="displayLG" style={styles.grupoNome}>
                    {g.nome}
                  </ThemedText>
                  {(() => {
                    const ata = atasMap.get(g.ataId);
                    const vig = vigenciaInfo(ata?.vigencia_em ?? null);
                    const partes: string[] = [];
                    if (ata?.edital_ref) partes.push(ata.edital_ref);
                    if (vig) partes.push(vig.vencida ? `vencida ${vig.texto}` : `vence ${vig.texto}`);
                    if (partes.length === 0) return null;
                    return (
                      <ThemedText
                        type="mono"
                        style={[styles.grupoVig, vig?.vencida && { color: '#E04830' }]}>
                        {partes.join(' · ')}
                      </ThemedText>
                    );
                  })()}
                </View>
                <View style={styles.grupoBadge}>
                  <ThemedText type="mono" style={styles.grupoBadgeTxt}>
                    {g.cards.length} {g.cards.length === 1 ? 'lote' : 'lotes'}
                  </ThemedText>
                </View>
              </View>
              {g.cards.map((card) => {
                const pct = card.totalCidades > 0 ? card.empenhados / card.totalCidades : 0;
                return (
                  <Pressable
                    key={card.lote.id}
                    onPress={() => router.push(`/modules/tawa/atas/lote/${card.lote.id}` as any)}
                    onLongPress={() => confirmarApagar(card)}
                    delayLongPress={400}
                    style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
                    <ThemedView type="backgroundElement" style={styles.card}>
                      <View style={[styles.spine, { backgroundColor: ACCENT }]} />
                      <View style={{ flex: 1, gap: 4 }}>
                        <View style={styles.cardTop}>
                          {card.lote.numero ? (
                            <ThemedText type="mono" style={styles.loteNum}>
                              {card.lote.numero}
                            </ThemedText>
                          ) : null}
                          <ThemedText type="default" style={{ flex: 1 }} numberOfLines={1}>
                            {card.lote.veiculo}
                          </ThemedText>
                        </View>
                        <View style={styles.barra}>
                          <View
                            style={[
                              styles.barraFill,
                              { width: `${pct * 100}%`, backgroundColor: EMPENHO_STATUS_CORES.empenhado },
                            ]}
                          />
                        </View>
                        <View style={styles.cardMeta}>
                          <ThemedText type="mono" style={styles.cardCont}>
                            {card.empenhados}/{card.totalCidades} empenhado{card.empenhados === 1 ? '' : 's'}
                          </ThemedText>
                          {card.lote.valor_unitario || card.lote.quantidade ? (
                            <ThemedText type="mono" style={styles.cardValor}>
                              {[
                                card.lote.quantidade ? `${card.lote.quantidade} un` : null,
                                card.lote.valor_unitario ? `${formatarReaisCompacto(card.lote.valor_unitario)}/un` : null,
                              ].filter(Boolean).join(' · ')}
                            </ThemedText>
                          ) : null}
                        </View>
                      </View>
                      <ChevronRight size={16} color={'rgba(245,241,237,0.30)' as any} />
                    </ThemedView>
                  </Pressable>
                );
              })}
            </View>
          ))}

          {grupos.length > 0 && (
            <ThemedText type="small" themeColor="textMuted" style={styles.dica}>
              Toque pra abrir · segure pra apagar o lote
            </ThemedText>
          )}
        </ScrollView>

        <Pressable
          onPress={() => setFormOpen(true)}
          style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}>
          <Plus color={'#1C1917' as any} size={26} />
        </Pressable>

        {formOpen && (
          <NovoLoteSheet atas={atas ?? []} onClose={() => setFormOpen(false)} />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function NovoLoteSheet({ atas, onClose }: { atas: Ata[]; onClose: () => void }) {
  const criarAta = useCriarAta();
  const criarLote = useCriarLoteFlex();
  const [ataId, setAtaId] = useState<string | null>(atas[0]?.id ?? null);
  const [novoConsorcio, setNovoConsorcio] = useState('');
  const [edital, setEdital] = useState('');
  const [vigencia, setVigencia] = useState('');
  const [numero, setNumero] = useState('');
  const [veiculo, setVeiculo] = useState('');
  const [valor, setValor] = useState('');
  const [qtd, setQtd] = useState('');
  const [salvando, setSalvando] = useState(false);

  const usandoNovo = ataId === null;

  async function salvar() {
    if (!veiculo.trim() || salvando) return;
    if (usandoNovo && !novoConsorcio.trim()) return;
    setSalvando(true);
    try {
      let alvo = ataId;
      if (usandoNovo) {
        const d = parsearDataBR(vigencia);
        const vigISO = d
          ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          : null;
        const ata = await criarAta.mutateAsync({
          nome: novoConsorcio.trim(),
          edital_ref: edital.trim() || null,
          vigencia_em: vigISO,
        });
        alvo = ata.id;
      }
      const lote = await criarLote.mutateAsync({
        ataId: alvo!,
        veiculo: veiculo.trim(),
        numero: numero.trim() || undefined,
        valor_unitario: parsearReais(valor),
        quantidade: qtd.trim() ? parseInt(qtd.replace(/\D/g, ''), 10) || null : null,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
      router.push(`/modules/tawa/atas/lote/${lote.id}` as any);
    } finally {
      setSalvando(false);
    }
  }

  const podeSalvar = veiculo.trim() && (!usandoNovo || novoConsorcio.trim()) && !salvando;

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <ThemedText type="titleMD" style={{ color: '#F5F1ED' }}>Novo lote</ThemedText>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={22} color={'rgba(245,241,237,0.65)' as any} />
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={styles.sheetBody}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}>
          <ThemedText type="meta" themeColor="textSecondary">CONSÓRCIO</ThemedText>
          <View style={styles.consChips}>
            {atas.map((a) => {
              const ativo = ataId === a.id;
              return (
                <Pressable
                  key={a.id}
                  onPress={() => setAtaId(a.id)}
                  style={({ pressed }) => [
                    styles.consChip,
                    ativo && { backgroundColor: ACCENT + '22', borderColor: ACCENT },
                    pressed && { opacity: 0.7 },
                  ]}>
                  <ThemedText type="mono" style={[styles.consChipTxt, ativo && { color: ACCENT }]}>
                    {a.nome}
                  </ThemedText>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => setAtaId(null)}
              style={({ pressed }) => [
                styles.consChip,
                usandoNovo && { backgroundColor: ACCENT + '22', borderColor: ACCENT },
                pressed && { opacity: 0.7 },
              ]}>
              <ThemedText type="mono" style={[styles.consChipTxt, usandoNovo && { color: ACCENT }]}>
                + novo
              </ThemedText>
            </Pressable>
          </View>

          {usandoNovo && (
            <>
              <TextInput
                value={novoConsorcio}
                onChangeText={setNovoConsorcio}
                placeholder="Nome do consórcio (ex: CIGEDAS)"
                placeholderTextColor="rgba(245,241,237,0.25)"
                autoFocus
                style={styles.input}
              />
              <View style={styles.loteRow}>
                <TextInput
                  value={edital}
                  onChangeText={setEdital}
                  placeholder="Edital (ex: 003/2026)"
                  placeholderTextColor="rgba(245,241,237,0.25)"
                  style={[styles.input, { flex: 1 }]}
                />
                <TextInput
                  value={vigencia}
                  onChangeText={setVigencia}
                  placeholder="Vence (dd/mm/aaaa)"
                  placeholderTextColor="rgba(245,241,237,0.25)"
                  keyboardType="numbers-and-punctuation"
                  style={[styles.input, { flex: 1 }]}
                />
              </View>
            </>
          )}

          <ThemedText type="meta" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
            LOTE
          </ThemedText>
          <View style={styles.loteRow}>
            <TextInput
              value={numero}
              onChangeText={setNumero}
              placeholder="Lote 3"
              placeholderTextColor="rgba(245,241,237,0.25)"
              style={[styles.input, { width: 100 }]}
            />
            <TextInput
              value={veiculo}
              onChangeText={setVeiculo}
              placeholder="Veículo (ex: Ambulância Tipo A)"
              placeholderTextColor="rgba(245,241,237,0.25)"
              style={[styles.input, { flex: 1 }]}
            />
          </View>
          <View style={styles.loteRow}>
            <TextInput
              value={valor}
              onChangeText={setValor}
              placeholder="Valor/veículo (R$)"
              placeholderTextColor="rgba(245,241,237,0.25)"
              keyboardType="numbers-and-punctuation"
              style={[styles.input, { flex: 1 }]}
            />
            <TextInput
              value={qtd}
              onChangeText={setQtd}
              placeholder="Qtd veículos"
              placeholderTextColor="rgba(245,241,237,0.25)"
              keyboardType="number-pad"
              style={[styles.input, { flex: 1 }]}
            />
          </View>
          {parsearReais(valor) && qtd.trim() ? (
            <ThemedText type="mono" style={styles.totalPreview}>
              Total potencial: {formatarReaisCompacto((parsearReais(valor) ?? 0) * (parseInt(qtd.replace(/\D/g, ''), 10) || 0))}
            </ThemedText>
          ) : null}

          <ThemedText type="small" themeColor="textMuted">
            Os municípios são do consórcio (compartilhados entre os lotes). Você marca
            quais participam dentro do lote, na engrenagem.
          </ThemedText>

          <Pressable
            onPress={salvar}
            disabled={!podeSalvar}
            style={({ pressed }) => [styles.salvar, pressed && { opacity: 0.85 }, !podeSalvar && { opacity: 0.4 }]}>
            <ThemedText type="default" style={{ color: '#1C1917', fontWeight: '600' }}>
              {salvando ? 'Criando...' : 'Lançar lote'}
            </ThemedText>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: Spacing.three, gap: Spacing.three, paddingBottom: 120 },
  emptyCard: { padding: Spacing.three, borderRadius: Radius.lg, gap: Spacing.one },
  grupo: { gap: Spacing.two },
  grupoHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginBottom: 2 },
  grupoSpine: { width: 4, height: 24, borderRadius: 2 },
  grupoNome: { color: ACCENT },
  grupoVig: { fontSize: 11, color: 'rgba(245,241,237,0.50)', marginTop: 1 },
  grupoBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: ACCENT + '1A',
  },
  grupoBadgeTxt: { fontSize: 11, color: ACCENT },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  spine: { width: 3, alignSelf: 'stretch', borderRadius: 2, marginVertical: -Spacing.three },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loteNum: { fontSize: 11, color: ACCENT },
  barra: { height: 5, backgroundColor: 'rgba(245,241,237,0.08)', borderRadius: 3, overflow: 'hidden' },
  barraFill: { height: '100%', borderRadius: 3 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardCont: { fontSize: 11, color: 'rgba(245,241,237,0.45)' },
  cardValor: { fontSize: 11, color: ACCENT },
  totalPreview: { fontSize: 12, color: ACCENT },
  dica: { opacity: 0.7, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: Spacing.three,
    bottom: Spacing.four,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  consChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  consChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(245,241,237,0.12)',
  },
  consChipTxt: { fontSize: 11, color: 'rgba(245,241,237,0.55)' },
  loteRow: { flexDirection: 'row', gap: Spacing.two },
  input: {
    backgroundColor: 'rgba(245,241,237,0.06)',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    color: '#F5F1ED',
    fontSize: 15,
  },
  salvar: { backgroundColor: ACCENT, borderRadius: Radius.md, padding: Spacing.three, alignItems: 'center', marginTop: Spacing.two },
});
