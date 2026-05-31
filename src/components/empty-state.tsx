import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type Props = {
  /** Frase principal, em Spectral display — tom calmo, sem ponto de exclamação. */
  title: string;
  /** Linha de apoio, opcional. */
  subtitle?: string;
  /** Ícone/traço sutil acima do título (ex: lucide com cor textMuted). */
  icon?: ReactNode;
  /** Reduz o espaçamento superior quando usado dentro de um card pequeno. */
  compact?: boolean;
};

/**
 * Estado vazio editorial compartilhado. Dá personalidade ao "nada aqui ainda"
 * em vez de cinza sobre cinza — tipografia Spectral + microcopy calmo.
 */
export function EmptyState({ title, subtitle, icon, compact }: Props) {
  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <ThemedText type="display" style={styles.title}>
        {title}
      </ThemedText>
      {subtitle ? (
        <ThemedText type="small" themeColor="textMuted" style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: Spacing.five,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  compact: { paddingTop: Spacing.three, gap: Spacing.one },
  icon: { opacity: 0.5, marginBottom: Spacing.one },
  title: {
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
    color: 'rgba(245,241,237,0.78)',
  },
  subtitle: { textAlign: 'center', maxWidth: 260 },
});
