import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';

import { STATUS_LABELS, type StatusTarefa } from '../types';

type Props = {
  status: StatusTarefa;
  onChange: (s: StatusTarefa) => void;
  counts: Record<StatusTarefa, number>;
};

const ORDEM: StatusTarefa[] = ['a_fazer', 'em_andamento', 'concluido'];

export function StatusTabs({ status, onChange, counts }: Props) {
  return (
    <View style={styles.container}>
      {ORDEM.map((s) => {
        const ativo = s === status;
        return (
          <Pressable key={s} onPress={() => onChange(s)} style={[styles.tab, ativo && styles.tabAtivo]}>
            <ThemedText
              type="small"
              themeColor={ativo ? 'text' : 'textSecondary'}
              style={{ fontWeight: ativo ? '600' : '500' }}>
              {STATUS_LABELS[s]}
            </ThemedText>
            <View style={[styles.badge, ativo && styles.badgeAtivo]}>
              <ThemedText
                type="small"
                themeColor={ativo ? 'text' : 'textMuted'}
                style={{ fontSize: 11, fontWeight: '600' }}>
                {counts[s] ?? 0}
              </ThemedText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: Spacing.three,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: Radius.md,
    padding: 4,
    gap: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  tabAtivo: {
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeAtivo: { backgroundColor: 'rgba(255,255,255,0.16)' },
});
