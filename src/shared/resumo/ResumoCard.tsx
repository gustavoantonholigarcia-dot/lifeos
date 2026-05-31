import AsyncStorage from '@react-native-async-storage/async-storage';
import { X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing, Warm } from '@/constants/theme';

import { useMarcarLido, useResumoLocal, useResumosHoje } from './queries';

const TIPO_LABEL: Record<string, string> = {
  manha: 'Resumo da manhã',
  semanal: 'Review semanal',
};

function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DISMISS_KEY = 'resumo-local-dismissed';

/**
 * Card de resumo da manhã calculado no cliente. Aparece uma vez por dia
 * (até ser dispensado no X). Não depende de push/Edge Function.
 */
export function ResumoLocalCard() {
  const { data: conteudo } = useResumoLocal();
  const [dispensado, setDispensado] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(DISMISS_KEY).then((v) => setDispensado(v === hojeISO()));
  }, []);

  async function dispensar() {
    setDispensado(true);
    await AsyncStorage.setItem(DISMISS_KEY, hojeISO()).catch(() => {});
  }

  if (dispensado !== false || !conteudo) return null;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.tag}>
          <ThemedText type="mono" style={styles.tagText}>
            Resumo da manhã
          </ThemedText>
        </View>
        <Pressable
          onPress={dispensar}
          hitSlop={10}
          style={({ pressed }) => pressed && { opacity: 0.5 }}>
          <X size={16} color={'rgba(245,241,237,0.40)' as any} />
        </Pressable>
      </View>

      {/* Manchete: total de pendências */}
      <View style={styles.headline}>
        <ThemedText type="display" style={styles.headlineNum}>
          {conteudo.total}
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.headlineLabel}>
          {conteudo.total === 1 ? 'tarefa pendente' : 'tarefas pendentes'}
        </ThemedText>
      </View>

      {/* Tópico: quebra por módulo */}
      {conteudo.porModulo.length > 0 && (
        <View style={styles.chips}>
          {conteudo.porModulo.map((m) => (
            <View key={m.modulo} style={styles.chip}>
              <ThemedText type="mono" style={styles.chipNum}>{m.n}</ThemedText>
              <ThemedText type="small" style={styles.chipLabel}>{m.label}</ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Tópico: prazos até amanhã */}
      {conteudo.urgentes.length > 0 && (
        <View style={styles.urgentes}>
          <ThemedText type="meta" style={styles.urgentesTitulo}>
            Prazo até amanhã
          </ThemedText>
          {conteudo.urgentes.slice(0, 4).map((t, i) => (
            <View key={i} style={styles.urgenteRow}>
              <View style={styles.urgenteDot} />
              <ThemedText type="small" style={styles.urgenteText} numberOfLines={1}>
                {t.titulo}
              </ThemedText>
            </View>
          ))}
          {conteudo.urgentes.length > 4 && (
            <ThemedText type="small" themeColor="textMuted" style={{ marginLeft: 14 }}>
              + {conteudo.urgentes.length - 4} outras
            </ThemedText>
          )}
        </View>
      )}
    </ThemedView>
  );
}

export function ResumoCards() {
  const { data: resumos } = useResumosHoje();
  const marcar = useMarcarLido();

  if (!resumos || resumos.length === 0) return null;

  return (
    <>
      {resumos.map((r) => (
        <ThemedView key={r.id} type="backgroundElement" style={styles.card}>
          <View style={styles.header}>
            <View style={styles.tag}>
              <ThemedText type="mono" style={styles.tagText}>
                {TIPO_LABEL[r.tipo] ?? r.tipo}
              </ThemedText>
            </View>
            <Pressable
              onPress={() => marcar.mutate(r.id)}
              hitSlop={10}
              style={({ pressed }) => pressed && { opacity: 0.5 }}>
              <X size={16} color={'rgba(245,241,237,0.40)' as any} />
            </Pressable>
          </View>
          <ThemedText type="default" style={styles.body}>
            {r.conteudo}
          </ThemedText>
        </ThemedView>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    borderRadius: Radius.lg,
    gap: Spacing.two,
    borderLeftWidth: 3,
    borderLeftColor: Warm.honey,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: 'rgba(212,165,116,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  tagText: {
    fontSize: 10,
    color: Warm.honey,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  body: { fontSize: 14, lineHeight: 20 },
  headline: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two },
  headlineNum: { fontSize: 34, lineHeight: 38, color: Warm.honey },
  headlineLabel: { fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245,241,237,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  chipNum: { fontSize: 12, color: '#F5F1ED', fontWeight: '600' },
  chipLabel: { fontSize: 12, color: 'rgba(245,241,237,0.60)' },
  urgentes: {
    gap: 6,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(245,241,237,0.10)',
  },
  urgentesTitulo: {
    color: '#E04830',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  urgenteRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  urgenteDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#E04830' },
  urgenteText: { flex: 1, color: 'rgba(245,241,237,0.85)' },
});
