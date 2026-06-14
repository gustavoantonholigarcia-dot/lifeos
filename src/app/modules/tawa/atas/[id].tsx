import * as Haptics from 'expo-haptics';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Modules, Radius, Spacing } from '@/constants/theme';
import { useAtaPainel, useSetEmpenhoStatus } from '@/modules/tawa/crm/queries';
import {
  EMPENHO_STATUS_CORES,
  EMPENHO_STATUS_LABELS,
  EMPENHO_STATUS_SEQUENCE,
  corReceptividade,
  type AtaLote,
  type EmpenhoStatus,
  type ParticipanteDaAta,
} from '@/modules/tawa/crm/types';

const ACCENT = Modules.tawa.accent;

/** "Lote 3" -> "L3"; sem numero usa posição. */
function rotuloCurto(lote: AtaLote, idx: number): string {
  const digitos = lote.numero?.replace(/\D/g, '');
  return digitos ? `L${digitos}` : `L${idx + 1}`;
}

export default function AtaPainelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: painel, isLoading } = useAtaPainel(id);
  const setStatus = useSetEmpenhoStatus();

  // Pendentes no topo (ordenados por receptividade), completos no fim.
  const linhas = useMemo(() => {
    if (!painel) return [];
    const { lotes, participantes } = painel;
    const completo = (p: ParticipanteDaAta) =>
      lotes.every((l) => p.empenhos[l.id]?.status === 'empenhado');
    return [...participantes].sort((a, b) => {
      const ca = completo(a) ? 1 : 0;
      const cb = completo(b) ? 1 : 0;
      if (ca !== cb) return ca - cb;
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
            {isLoading ? 'Carregando...' : 'Ata não encontrada.'}
          </ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const { ata, lotes, participantes } = painel;
  const totalCelulas = participantes.length * lotes.length;
  const totalEmpenhados = participantes.reduce(
    (acc, p) => acc + lotes.filter((l) => p.empenhos[l.id]?.status === 'empenhado').length,
    0,
  );

  function ciclar(contatoId: string, loteId: string, atual: EmpenhoStatus) {
    const idx = EMPENHO_STATUS_SEQUENCE.indexOf(atual);
    const proximo = EMPENHO_STATUS_SEQUENCE[(idx + 1) % EMPENHO_STATUS_SEQUENCE.length];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStatus.mutate({ contato_id: contatoId, lote_id: loteId, status: proximo });
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: `Ata ${ata.nome}` }} />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Resumo geral */}
          <ThemedView type="backgroundElement" style={styles.resumoCard}>
            <View style={styles.resumoTop}>
              <ThemedText type="meta" themeColor="textSecondary">
                EMPENHOS
              </ThemedText>
              <ThemedText type="mono" style={styles.resumoContagem}>
                {totalEmpenhados}/{totalCelulas}
              </ThemedText>
            </View>
            <View style={styles.barra}>
              <View
                style={[
                  styles.barraFill,
                  {
                    width: totalCelulas > 0 ? `${(totalEmpenhados / totalCelulas) * 100}%` : 0,
                    backgroundColor: EMPENHO_STATUS_CORES.empenhado,
                  },
                ]}
              />
            </View>

            {/* Legenda + contagem por lote */}
            {lotes.map((lote, i) => {
              const n = participantes.filter(
                (p) => p.empenhos[lote.id]?.status === 'empenhado',
              ).length;
              return (
                <View key={lote.id} style={styles.legendaRow}>
                  <ThemedText type="mono" style={styles.legendaLote}>
                    {rotuloCurto(lote, i)}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={{ flex: 1 }} numberOfLines={1}>
                    {lote.veiculo}
                  </ThemedText>
                  <ThemedText type="mono" style={styles.legendaContagem}>
                    {n}/{participantes.length}
                  </ThemedText>
                </View>
              );
            })}
          </ThemedView>

          <ThemedText type="small" themeColor="textMuted" style={styles.dica}>
            Toque no chip pra avançar o status · toque no município pra abrir o contato
          </ThemedText>

          {/* Grade municípios × lotes */}
          <ThemedView type="backgroundElement" style={styles.grade}>
            {linhas.map((p) => {
              const rec = p.contato.receptividade;
              return (
                <View key={p.contato.id} style={styles.linha}>
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
                  <View style={styles.chips}>
                    {lotes.map((lote, i) => {
                      const status: EmpenhoStatus = p.empenhos[lote.id]?.status ?? 'pendente';
                      const cor = EMPENHO_STATUS_CORES[status];
                      return (
                        <Pressable
                          key={lote.id}
                          hitSlop={4}
                          onPress={() => ciclar(p.contato.id, lote.id, status)}
                          style={({ pressed }) => [
                            styles.chip,
                            { backgroundColor: cor + '22', borderColor: cor + '55' },
                            pressed && { opacity: 0.6 },
                          ]}>
                          <ThemedText type="mono" style={[styles.chipText, { color: cor }]}>
                            {rotuloCurto(lote, i)}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </ThemedView>

          {/* Legenda de status */}
          <View style={styles.statusLegenda}>
            {EMPENHO_STATUS_SEQUENCE.map((s) => (
              <View key={s} style={styles.statusLegendaItem}>
                <View style={[styles.statusDot, { backgroundColor: EMPENHO_STATUS_CORES[s] }]} />
                <ThemedText type="small" themeColor="textMuted">
                  {EMPENHO_STATUS_LABELS[s]}
                </ThemedText>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: Spacing.three, gap: Spacing.three, paddingBottom: 60 },

  resumoCard: { padding: Spacing.three, borderRadius: Radius.lg, gap: Spacing.two },
  resumoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resumoContagem: { fontSize: 14, color: '#F5F1ED' },
  barra: { height: 6, backgroundColor: 'rgba(245,241,237,0.08)', borderRadius: 3, overflow: 'hidden' },
  barraFill: { height: '100%', borderRadius: 3 },
  legendaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  legendaLote: { fontSize: 11, color: ACCENT, width: 32 },
  legendaContagem: { fontSize: 11, color: 'rgba(245,241,237,0.45)' },

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
  chips: { flexDirection: 'row', gap: 5 },
  chip: {
    minWidth: 38,
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  chipText: { fontSize: 10, letterSpacing: 0.3 },

  statusLegenda: { flexDirection: 'row', gap: Spacing.three, justifyContent: 'center' },
  statusLegendaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});
