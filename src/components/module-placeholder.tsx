import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Modules, Spacing, type ModuleKey } from '@/constants/theme';

type Props = {
  module: ModuleKey;
  subtitle?: string;
};

export function ModulePlaceholder({ module, subtitle = 'Em breve.' }: Props) {
  const mod = Modules[module];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={[styles.dot, { backgroundColor: mod.accent }]} />
        <ThemedText type="display" style={styles.title}>
          {mod.label}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.sub}>
          {subtitle}
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  title: { textAlign: 'center' },
  sub: { textAlign: 'center', maxWidth: 280, lineHeight: 22 },
});
