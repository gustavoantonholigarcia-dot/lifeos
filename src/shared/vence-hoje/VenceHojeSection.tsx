import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Modules, Radius, Spacing } from '@/constants/theme';
import { useConcluirTarefa } from '@/modules/tawa/queries';
import { type Tarefa } from '@/modules/tawa/types';
import { formatarPrazoRelativo } from '@/shared/format/date';
import { requireSupabase } from '@/shared/supabase';

/** Fim do dia de hoje em ISO — limite pra "vence hoje". */
function fimDeHojeISO(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export const venceHojeKeys = {
  all: ['vence-hoje'] as const,
};

function useVenceHoje() {
  // Data na chave: virou o dia, a query refaz sozinha (sem mostrar ontem).
  const hoje = new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: [...venceHojeKeys.all, hoje],
    queryFn: async (): Promise<Tarefa[]> => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .in('status', ['a_fazer', 'em_andamento'])
        .not('prazo_em', 'is', null)
        .lte('prazo_em', fimDeHojeISO())
        .order('prazo_em', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Tarefa[];
    },
  });
}

export function VenceHojeSection() {
  const qc = useQueryClient();
  const { data, isLoading } = useVenceHoje();
  const concluir = useConcluirTarefa();

  const lista = data ?? [];
  const vencidas = useMemo(
    () =>
      lista.filter((t) => formatarPrazoRelativo(t.prazo_em!).urgencia === 'vencido')
        .length,
    [lista],
  );

  async function handleConcluir(t: Tarefa) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await concluir(t.id).catch(() => {});
    qc.invalidateQueries({ queryKey: venceHojeKeys.all });
  }

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="meta" themeColor="textSecondary">
          02 · Vence hoje
        </ThemedText>
        {lista.length > 0 && (
          <ThemedText
            type="mono"
            style={[styles.counter, vencidas > 0 && { color: '#E04830' }]}>
            {vencidas > 0 ? `${vencidas} vencida${vencidas > 1 ? 's' : ''}` : `${lista.length}`}
          </ThemedText>
        )}
      </View>

      {isLoading && (
        <ThemedText type="default" themeColor="textMuted" style={styles.empty}>
          Carregando...
        </ThemedText>
      )}

      {!isLoading && lista.length === 0 && (
        <ThemedText type="default" themeColor="textMuted" style={styles.empty}>
          Nada com prazo pra hoje. Dia livre pra puxar o que importa.
        </ThemedText>
      )}

      {lista.map((t) => (
        <Linha key={t.id} tarefa={t} onConcluir={() => handleConcluir(t)} />
      ))}
    </ThemedView>
  );
}

function Linha({ tarefa, onConcluir }: { tarefa: Tarefa; onConcluir: () => void }) {
  const prazo = formatarPrazoRelativo(tarefa.prazo_em!);
  const vencido = prazo.urgencia === 'vencido';
  const moduloLabel = tarefa.modulo ? (Modules as any)[tarefa.modulo]?.label : null;
  const moduloAccent = tarefa.modulo
    ? (Modules as any)[tarefa.modulo]?.accent
    : 'rgba(245,241,237,0.30)';

  return (
    <View style={styles.linha}>
      <Pressable
        onPress={onConcluir}
        hitSlop={8}
        style={({ pressed }) => [
          styles.check,
          pressed && { transform: [{ scale: 0.92 }] },
        ]}>
        <Check size={12} color={'rgba(245,241,237,0.0)' as any} strokeWidth={3} />
      </Pressable>

      <Pressable
        style={styles.corpo}
        onPress={() => router.push(`/tarefa/${tarefa.id}`)}>
        <ThemedText type="default" numberOfLines={1}>
          {tarefa.titulo}
        </ThemedText>
        <View style={styles.meta}>
          {moduloLabel && (
            <View style={styles.moduloTag}>
              <View style={[styles.dot, { backgroundColor: moduloAccent }]} />
              <ThemedText type="mono" style={styles.metaText}>
                {moduloLabel}
              </ThemedText>
            </View>
          )}
          <ThemedText
            type="mono"
            style={[styles.metaText, { color: vencido ? '#E04830' : '#E8A845' }]}>
            {prazo.texto}
          </ThemedText>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
    borderRadius: Radius.lg,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counter: { fontSize: 10, color: 'rgba(245,241,237,0.45)' },
  empty: { marginTop: Spacing.one, fontSize: 14 },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(245,241,237,0.08)',
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(245,241,237,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corpo: { flex: 1, gap: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  moduloTag: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  metaText: { fontSize: 10, color: 'rgba(245,241,237,0.45)' },
});
