import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';

type Props = {
  semanaBase: Date;           // qualquer dia da semana mostrada
  selecionada: string;        // YYYY-MM-DD
  diasComAnotacao?: Set<string>;
  diasComTarefa?: Set<string>;
  onSelect: (data: string) => void;
  onPrev: () => void;
  onNext: () => void;
};

const DIAS_LABEL = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MESES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

function inicioSemana(d: Date): Date {
  const dia = new Date(d);
  const offset = dia.getDay(); // 0 = domingo
  dia.setDate(dia.getDate() - offset);
  dia.setHours(0, 0, 0, 0);
  return dia;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function WeekStrip({
  semanaBase,
  selecionada,
  diasComAnotacao,
  diasComTarefa,
  onSelect,
  onPrev,
  onNext,
}: Props) {
  const dias = useMemo(() => {
    const start = inicioSemana(semanaBase);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [semanaBase]);

  const hojeIso = toISODate(new Date());
  const inicio = dias[0];
  const fim = dias[6];
  const mesmoMes = inicio.getMonth() === fim.getMonth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onPrev} hitSlop={10} style={styles.navBtn}>
          <ChevronLeft size={18} color={'rgba(245,241,237,0.62)' as any} />
        </Pressable>
        <ThemedText type="meta" themeColor="textSecondary">
          {mesmoMes
            ? `${MESES[inicio.getMonth()]} ${inicio.getFullYear()}`
            : `${MESES[inicio.getMonth()]} — ${MESES[fim.getMonth()]} ${fim.getFullYear()}`}
        </ThemedText>
        <Pressable onPress={onNext} hitSlop={10} style={styles.navBtn}>
          <ChevronRight size={18} color={'rgba(245,241,237,0.62)' as any} />
        </Pressable>
      </View>

      <View style={styles.row}>
        {dias.map((d, i) => {
          const iso = toISODate(d);
          const ativo = iso === selecionada;
          const ehHoje = iso === hojeIso;
          const temAnotacao = diasComAnotacao?.has(iso);
          const temTarefa = diasComTarefa?.has(iso);

          return (
            <Pressable
              key={iso}
              onPress={() => onSelect(iso)}
              style={[styles.dia, ativo && styles.diaAtivo]}>
              <ThemedText
                type="mono"
                themeColor={ativo ? 'text' : 'textMuted'}
                style={[styles.diaLabel, ehHoje && styles.diaLabelHoje]}>
                {DIAS_LABEL[i]}
              </ThemedText>
              <ThemedText
                type="default"
                style={[
                  styles.diaNum,
                  ativo && styles.diaNumAtivo,
                  ehHoje && !ativo && styles.diaNumHoje,
                ]}>
                {d.getDate()}
              </ThemedText>
              <View style={styles.dots}>
                {temTarefa && (
                  <View style={[styles.dot, { backgroundColor: '#6B8FB8' }]} />
                )}
                {temAnotacao && (
                  <View style={[styles.dot, { backgroundColor: '#E8B4A0' }]} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.two, paddingHorizontal: Spacing.three },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: { padding: 6 },
  row: { flexDirection: 'row', gap: 6 },
  dia: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: 4,
    borderRadius: Radius.md,
    gap: 4,
    minHeight: 64,
  },
  diaAtivo: {
    backgroundColor: 'rgba(232,180,160,0.12)',
    borderWidth: 1,
    borderColor: '#E8B4A0',
  },
  diaLabel: { fontSize: 9, letterSpacing: 1.2 },
  diaLabelHoje: { color: '#E8B4A0' },
  diaNum: { fontSize: 17, fontWeight: '500' as const },
  diaNumAtivo: { color: '#F5F1ED' },
  diaNumHoje: { color: '#E8B4A0' },
  dots: { flexDirection: 'row', gap: 3, marginTop: 2, minHeight: 4 },
  dot: { width: 4, height: 4, borderRadius: 2 },
});
