import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Modules, Radius, Spacing, type ModuleKey } from '@/constants/theme';

type Item = {
  key: ModuleKey;
  subtitle: string;
  logo?: ReturnType<typeof require>;
  href?: string;
};

const items: Item[] = [
  {
    key: 'ruah',
    logo: require('@/assets/logos/ruah.png'),
    subtitle: 'Encontros, ideias, ações sociais',
    href: '/modules/ruah',
  },
  {
    key: 'estudos',
    subtitle: 'Idiomas, sessões, certificações',
    href: '/modules/estudos',
  },
  {
    key: 'projetos',
    subtitle: 'Side projects',
    href: '/modules/projetos',
  },
  {
    key: 'intercambio',
    subtitle: 'Planejamento',
    href: '/modules/intercambio',
  },
];

export default function MaisScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ paddingHorizontal: Spacing.one, paddingTop: Spacing.three, gap: 2, marginBottom: Spacing.three }}>
          <ThemedText type="meta" themeColor="textSecondary">
            Outras áreas
          </ThemedText>
          <ThemedText type="displayLG">Mais</ThemedText>
        </View>

        {items.map((item) => {
          const mod = Modules[item.key];
          const onPress = () => {
            if (item.href) router.push(item.href as any);
          };
          return (
            <Pressable key={item.key} onPress={onPress} disabled={!item.href}>
              <ThemedView type="backgroundElement" style={styles.row}>
                {item.logo ? (
                  <View style={styles.logoBox}>
                    <Image source={item.logo} style={styles.logo} contentFit="contain" />
                  </View>
                ) : (
                  <View style={[styles.dotBox, { backgroundColor: mod.accent + '22' }]}>
                    <View style={[styles.dot, { backgroundColor: mod.accent }]} />
                  </View>
                )}
                <View style={styles.rowContent}>
                  <ThemedText type="default">{mod.label}</ThemedText>
                  <ThemedText type="small" themeColor="textMuted">
                    {item.subtitle}
                  </ThemedText>
                </View>
                <ThemedText type="default" themeColor={item.href ? 'textSecondary' : 'textMuted'}>
                  {item.href ? '›' : '·'}
                </ThemedText>
              </ThemedView>
            </Pressable>
          );
        })}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, padding: Spacing.three, gap: Spacing.two },
  title: { paddingHorizontal: Spacing.one, paddingTop: Spacing.two, marginBottom: Spacing.two },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  logo: { width: '100%', height: '100%' },
  dotBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 14, height: 14, borderRadius: 7 },
  rowContent: { flex: 1, gap: 2 },
});
