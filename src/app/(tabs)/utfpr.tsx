import { Image } from 'expo-image';
import { ExternalLink } from 'lucide-react-native';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Modules, Radius, Spacing } from '@/constants/theme';

export default function UtfprScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          {/* Header com logo */}
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Image
                source={require('@/assets/logos/utfpr.png')}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <ThemedText type="meta" themeColor="textSecondary">
                Universidade · Eng. Produção
              </ThemedText>
              <ThemedText type="displayLG">{Modules.utfpr.label}</ThemedText>
              <ThemedText type="small" themeColor="textMuted">
                Londrina · 2026.1
              </ThemedText>
            </View>
          </View>

          {/* Cards de seções */}
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="meta" themeColor="textSecondary">
              01 · Disciplinas · 2026.1
            </ThemedText>
            <View style={{ gap: Spacing.two, marginTop: Spacing.two }}>
              <DisciplinaRow
                codigo="IF61A"
                nome="Computação I"
                cor="#3B82F6"
              />
              <DisciplinaRow
                codigo="ENP002"
                nome="Introdução à Administração"
                cor="#A855F7"
              />
            </View>
            <ThemedText
              type="small"
              themeColor="textMuted"
              style={{ marginTop: Spacing.two, fontStyle: 'italic' }}>
              Próxima fase: integração com Moodle pra puxar trabalhos automaticamente.
            </ThemedText>
          </ThemedView>

          {/* Card trabalhos */}
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="meta" themeColor="textSecondary">
              02 · Trabalhos e prazos
            </ThemedText>
            <ThemedText type="default" style={{ marginTop: Spacing.two }}>
              Em construção (Fase 3).
            </ThemedText>
            <ThemedText
              type="small"
              themeColor="textMuted"
              style={{ marginTop: Spacing.one }}>
              Vai listar exercícios do Moodle + você pode criar tarefas avulsas (mesmo formato TAWA).
            </ThemedText>
          </ThemedView>

          {/* Atalhos */}
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="meta" themeColor="textSecondary">
              03 · Atalhos
            </ThemedText>
            <View style={{ gap: Spacing.one, marginTop: Spacing.two }}>
              <AtalhoRow
                titulo="Moodle UTFPR"
                subtitulo="moodle.utfpr.edu.br"
                onPress={() => Linking.openURL('https://moodle.utfpr.edu.br/')}
              />
              <AtalhoRow
                titulo="Dashboard local (Flask)"
                subtitulo="localhost:5055 · só funciona no Mac"
                onPress={() => Linking.openURL('http://localhost:5055')}
              />
            </View>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function DisciplinaRow({ codigo, nome, cor }: { codigo: string; nome: string; cor: string }) {
  return (
    <View style={styles.disciplinaRow}>
      <View style={[styles.disciplinaDot, { backgroundColor: cor }]} />
      <View style={{ flex: 1 }}>
        <ThemedText type="default" style={{ fontWeight: '500' }}>
          {nome}
        </ThemedText>
        <ThemedText
          type="small"
          themeColor="textMuted"
          style={{ fontFamily: undefined, fontSize: 11, letterSpacing: 0.5 }}>
          {codigo}
        </ThemedText>
      </View>
    </View>
  );
}

function AtalhoRow({
  titulo,
  subtitulo,
  onPress,
}: {
  titulo: string;
  subtitulo: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.atalhoRow, pressed && { opacity: 0.7 }]}>
      <View style={{ flex: 1 }}>
        <ThemedText type="default">{titulo}</ThemedText>
        <ThemedText type="small" themeColor="textMuted">
          {subtitulo}
        </ThemedText>
      </View>
      <ExternalLink size={16} color={'rgba(245,241,237,0.45)' as any} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: Spacing.three, gap: Spacing.three, paddingBottom: 140 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: 'white',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: '100%', height: '100%' },
  smallCap: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Radius.lg,
  },
  cardLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  disciplinaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    paddingHorizontal: Spacing.three,
    backgroundColor: 'rgba(245,241,237,0.04)',
    borderRadius: Radius.md,
  },
  disciplinaDot: { width: 8, height: 8, borderRadius: 4 },
  atalhoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    paddingHorizontal: Spacing.three,
    backgroundColor: 'rgba(245,241,237,0.04)',
    borderRadius: Radius.md,
  },
});
