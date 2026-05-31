import * as Haptics from 'expo-haptics';
import { Check, Mail, MessageSquare } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { formatarPrazoRelativo } from '@/shared/format/date';

import {
  PRIORIDADE_CORES,
  PRIORIDADE_LABELS,
  type Tarefa,
} from '../types';

type Props = {
  tarefa: Tarefa;
  onPress?: () => void;
  onLongPress?: () => void;
  /** Tap no check → toggle concluído (a_fazer ↔ concluído) */
  onToggleConcluido?: () => void;
};

const URGENCIA_CORES: Record<string, string> = {
  vencido: '#E04830',
  hoje: '#E04830',
  amanha: '#E8A845',
  futuro: 'rgba(245,241,237,0.55)',
  nenhum: 'rgba(245,241,237,0.35)',
};

const SAGE = '#8FA899';
const AMBER = '#E8A845';

export function TaskCard({ tarefa, onPress, onLongPress, onToggleConcluido }: Props) {
  const corPrioridade = PRIORIDADE_CORES[tarefa.prioridade];
  const concluida = tarefa.status === 'concluido';
  const emAndamento = tarefa.status === 'em_andamento';
  const ehDelegada = tarefa.origem === 'delegada';

  const prazo = tarefa.prazo_em ? formatarPrazoRelativo(tarefa.prazo_em) : null;
  const corPrazo = prazo ? URGENCIA_CORES[prazo.urgencia] : URGENCIA_CORES.nenhum;

  // Tarja esquerda: vencido/hoje grita em vermelho, amanhã em âmbar, resto recua.
  const corBarra =
    concluida
      ? 'transparent'
      : prazo?.urgencia === 'vencido' || prazo?.urgencia === 'hoje'
      ? '#E04830'
      : prazo?.urgencia === 'amanha'
      ? '#E8A845'
      : 'transparent';

  function toggleCheck() {
    if (!onToggleConcluido) return;
    Haptics.notificationAsync(
      concluida
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success,
    );
    onToggleConcluido();
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={() => {
        if (onLongPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onLongPress();
        }
      }}
      delayLongPress={100}
      style={({ pressed }) => [
        styles.card,
        { borderLeftColor: corBarra },
        pressed && styles.pressed,
      ]}>
      {/* Check button — tap toggle concluído */}
      <Pressable
        onPress={toggleCheck}
        disabled={!onToggleConcluido}
        hitSlop={10}
        style={({ pressed }) => [
          styles.check,
          concluida && { backgroundColor: SAGE, borderColor: SAGE },
          emAndamento && { borderColor: AMBER, borderWidth: 2 },
          pressed && { transform: [{ scale: 0.92 }] },
        ]}>
        {concluida && <Check size={12} color={'#1C1917' as any} strokeWidth={3} />}
        {emAndamento && <View style={[styles.dot, { backgroundColor: AMBER }]} />}
      </Pressable>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          {ehDelegada && <Mail size={12} color={'rgba(245,241,237,0.45)' as any} />}
          <ThemedText
            type="default"
            style={[
              styles.title,
              concluida && {
                color: 'rgba(245,241,237,0.40)',
                textDecorationLine: 'line-through',
              },
            ]}
            numberOfLines={2}>
            {tarefa.titulo}
          </ThemedText>
        </View>

        {(prazo || tarefa.delegado_por || tarefa.observacoes) && (
          <View style={styles.meta}>
            {prazo && (
              <>
                <ThemedText type="mono" style={[styles.metaText, { color: corPrazo }]}>
                  {prazo.texto}
                </ThemedText>
                {(tarefa.delegado_por || tarefa.observacoes) && (
                  <ThemedText type="mono" style={styles.metaSep}>·</ThemedText>
                )}
              </>
            )}
            {tarefa.delegado_por && (
              <>
                <ThemedText type="mono" style={styles.metaText}>
                  {tarefa.delegado_por}
                </ThemedText>
                {tarefa.observacoes && (
                  <ThemedText type="mono" style={styles.metaSep}>·</ThemedText>
                )}
              </>
            )}
            {tarefa.observacoes ? (
              <MessageSquare size={11} color={'rgba(245,241,237,0.45)' as any} />
            ) : null}
          </View>
        )}
      </View>

      {tarefa.prioridade !== 'sem' && !concluida && (
        <View style={styles.prioTag}>
          <View style={[styles.prioDot, { backgroundColor: corPrioridade }]} />
          <ThemedText type="mono" style={[styles.prioText, { color: corPrioridade }]}>
            {PRIORIDADE_LABELS[tarefa.prioridade].toLowerCase()}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    backgroundColor: 'rgba(245,241,237,0.04)',
    borderRadius: Radius.md,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  pressed: { backgroundColor: 'rgba(245,241,237,0.07)' },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(245,241,237,0.30)',
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  body: { flex: 1, gap: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { flex: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  metaText: { fontSize: 11, letterSpacing: 0.2 },
  metaSep: { fontSize: 11, color: 'rgba(245,241,237,0.25)' },
  prioTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginTop: 3,
  },
  prioDot: { width: 6, height: 6, borderRadius: 3 },
  prioText: { fontSize: 10, letterSpacing: 0.6, textTransform: 'lowercase' },
});
