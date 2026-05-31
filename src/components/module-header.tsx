import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Modules, Radius, Spacing, type ModuleKey } from '@/constants/theme';

type Props = {
  /** Módulo — define a cor do acento ("uma cor por área"). */
  module: ModuleKey;
  /** Sobrancelha curta acima do título (ex: "Igreja · Ministério"). */
  eyebrow: string;
  /** Título grande em Spectral. Default: label do módulo. */
  title?: string;
  /** Slot à direita (botões de ação). */
  right?: ReactNode;
  /** Conteúdo logo abaixo do título (ex: barra de progresso). */
  children?: ReactNode;
};

/**
 * Header editorial compartilhado entre os módulos.
 *
 * Assinatura: uma "lombada" (spine) vertical na cor do módulo com leve halo —
 * a luz da lâmpada de mesa pegando a borda do diário. Sobrancelha em mono,
 * título em serifa itálica. Mantém todos os módulos com a mesma identidade,
 * variando só a cor.
 */
export function ModuleHeader({ module, eyebrow, title, right, children }: Props) {
  const accent = Modules[module].accent;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View
          style={[
            styles.spine,
            {
              backgroundColor: accent,
              shadowColor: accent,
            },
          ]}
        />
        <View style={styles.textCol}>
          <ThemedText type="meta" themeColor="textSecondary" style={styles.eyebrow}>
            {eyebrow.toUpperCase()}
          </ThemedText>
          <ThemedText type="displayLG">{title ?? Modules[module].label}</ThemedText>
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
      {children ? <View style={styles.below}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: Spacing.two, gap: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  spine: {
    width: 3,
    height: 40,
    borderRadius: Radius.full,
    // halo suave — a luz da lâmpada
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  textCol: { flex: 1, gap: 3 },
  eyebrow: { letterSpacing: 1.2 },
  right: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  below: {},
});
