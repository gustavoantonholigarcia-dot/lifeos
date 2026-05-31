import { useQuery } from '@tanstack/react-query';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Semantic, Spacing, Warm } from '@/constants/theme';
import { requireSupabase } from '@/shared/supabase';

function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function inicioSemana(): string {
  const d = new Date();
  const dia = d.getDay();
  d.setDate(d.getDate() - dia);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function diaMenos(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Streak honesto: dias consecutivos abrindo o app, terminando hoje ou ontem.
 * Não quebra só porque você ainda não abriu hoje — conta a partir de ontem.
 */
function useStreak() {
  return useQuery({
    queryKey: ['gate-streak', hojeISO()],
    queryFn: async (): Promise<number> => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { data, error } = await supabase
        .from('app_opens')
        .select('data')
        .eq('user_id', user.id)
        .gte('data', diaMenos(90));
      if (error) throw error;

      const dias = new Set<string>((data ?? []).map((r: any) => r.data));
      let streak = 0;
      // Se ainda não abriu hoje, começa a contar de ontem (sem penalizar).
      let offset = dias.has(diaMenos(0)) ? 0 : 1;
      while (dias.has(diaMenos(offset))) {
        streak++;
        offset++;
      }
      return streak;
    },
    staleTime: 1000 * 60 * 5,
  });
}

function useOpensSemana() {
  return useQuery({
    queryKey: ['gate-tracker', inicioSemana()],
    queryFn: async (): Promise<Set<number>> => {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return new Set();

      const { data, error } = await supabase
        .from('app_opens')
        .select('data')
        .eq('user_id', user.id)
        .gte('data', inicioSemana())
        .lte('data', hojeISO());

      if (error) throw error;

      const dias = new Set<number>();
      for (const row of data ?? []) {
        const d = new Date(row.data + 'T12:00:00');
        dias.add(d.getDay());
      }
      return dias;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function GateTracker() {
  const { data: diasAbertos } = useOpensSemana();
  const { data: streak } = useStreak();
  const hoje = new Date().getDay();
  const count = diasAbertos?.size ?? 0;
  const meta = 4;
  const atingiu = count >= meta;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {DIAS_SEMANA.map((label, i) => {
          const abriu = diasAbertos?.has(i) ?? false;
          const ehHoje = i === hoje;
          return (
            <View key={i} style={styles.diaCol}>
              <ThemedText type="mono" style={[styles.label, ehHoje && styles.labelHoje]}>
                {label}
              </ThemedText>
              <View
                style={[
                  styles.dot,
                  abriu && styles.dotAtivo,
                  ehHoje && !abriu && styles.dotHoje,
                ]}
              />
            </View>
          );
        })}
      </View>
      <ThemedText type="mono" style={[styles.status, atingiu && styles.statusOk]}>
        {count}/{meta} · GATE {atingiu ? 'OK' : `falta${meta - count > 1 ? 'm' : ''} ${meta - count}`}
        {streak && streak > 1 ? `  ·  ${streak} dias seguidos` : ''}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.two, alignItems: 'center' },
  row: { flexDirection: 'row', gap: Spacing.three },
  diaCol: { alignItems: 'center', gap: 4 },
  label: { fontSize: 10, color: 'rgba(245,241,237,0.35)' },
  labelHoje: { color: 'rgba(245,241,237,0.70)' },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(245,241,237,0.10)',
  },
  dotAtivo: { backgroundColor: Semantic.success },
  dotHoje: { backgroundColor: 'rgba(245,241,237,0.25)' },
  status: { fontSize: 10, color: 'rgba(245,241,237,0.40)' },
  statusOk: { color: Semantic.success },
});
