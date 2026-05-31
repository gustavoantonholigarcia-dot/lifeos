import { router } from 'expo-router';
import { Ambulance, CalendarDays } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Modules, Radius, Spacing, type ModuleKey } from '@/constants/theme';
import { FocoDiaSection } from '@/shared/foco-dia/FocoDiaSection';
import { QuickCaptureSheet } from '@/shared/quick-capture/QuickCaptureSheet';
import { ResumoCards, ResumoLocalCard } from '@/shared/resumo/ResumoCard';
import { GateTracker } from '@/shared/tracking/GateTracker';

function saudacao(hora: number = new Date().getHours()): string {
  if (hora < 5) return 'Boa madrugada';
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

const MODULOS_CARD: { key: ModuleKey; subtitle: string; href: string }[] = [
  { key: 'tawa', subtitle: 'trabalho · veículos especiais', href: '/tawa' },
  { key: 'treinos', subtitle: 'judô · jiu · tênis · academia', href: '/treinos' },
  { key: 'utfpr', subtitle: 'universidade · eng. produção', href: '/utfpr' },
  { key: 'ruah', subtitle: 'igreja · encontros', href: '/modules/ruah' },
  { key: 'estudos', subtitle: 'idiomas', href: '/modules/estudos' },
  { key: 'projetos', subtitle: 'side projects', href: '/modules/projetos' },
  { key: 'intercambio', subtitle: 'planejamento', href: '/modules/intercambio' },
];

export default function HojeScreen() {
  const [quickOpen, setQuickOpen] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          {/* Header editorial — Spectral italic */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <ThemedText type="meta" themeColor="textSecondary">
                {dataPorExtenso()}
              </ThemedText>
              <Pressable
                onPress={() => router.push('/agenda')}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.agendaBtn,
                  pressed && { opacity: 0.6 },
                ]}>
                <CalendarDays size={18} color={'rgba(245,241,237,0.65)' as any} />
              </Pressable>
            </View>
            <ThemedText type="display" style={styles.greeting}>
              {saudacao()},{'\n'}
              <ThemedText type="display" style={{ color: '#E8B4A0' }}>
                Gustavo.
              </ThemedText>
            </ThemedText>
            <GateTracker />
          </View>

          {/* Resumos (manhã / semanal) */}
          <ResumoLocalCard />
          <ResumoCards />

          {/* Foco do dia */}
          <FocoDiaSection />

          {/* Cards por módulo */}
          <View style={styles.section}>
            <ThemedText type="meta" themeColor="textSecondary" style={styles.sectionLabel}>
              02 · Por área
            </ThemedText>
            <View style={styles.grid}>
              {MODULOS_CARD.map((item, i) => {
                const mod = Modules[item.key];
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => router.push(item.href as any)}
                    style={({ pressed }) => [
                      styles.miniCard,
                      { borderLeftColor: mod.accent },
                      pressed && { opacity: 0.6 },
                    ]}>
                    <ThemedText type="mono" themeColor="textMuted" style={styles.cardNum}>
                      {String(i + 1).padStart(2, '0')}
                    </ThemedText>
                    <ThemedText type="titleMD">{mod.label}</ThemedText>
                    <ThemedText type="small" themeColor="textMuted" numberOfLines={2}>
                      {item.subtitle}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* FAB Quick Capture */}
        <Pressable
          onPress={() => setQuickOpen(true)}
          style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}>
          <Ambulance color={'#1C1917' as any} size={22} />
        </Pressable>

        <QuickCaptureSheet visible={quickOpen} onClose={() => setQuickOpen(false)} />
      </SafeAreaView>
    </ThemedView>
  );
}

function dataPorExtenso(): string {
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  const d = new Date();
  return `${dias[d.getDay()]} · ${d.getDate()} de ${meses[d.getMonth()]}`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: Spacing.three, gap: Spacing.four, paddingBottom: 140 },
  header: {
    paddingHorizontal: Spacing.one,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  agendaBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245,241,237,0.06)',
  },
  greeting: {
    marginTop: Spacing.one,
  },
  section: { gap: Spacing.three },
  sectionLabel: { paddingHorizontal: Spacing.one },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  miniCard: {
    width: '48.5%',
    padding: Spacing.three,
    borderLeftWidth: 3,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(245,241,237,0.04)',
    gap: 4,
    minHeight: 88,
    position: 'relative',
  },
  cardNum: {
    position: 'absolute',
    top: 10,
    right: 12,
    fontSize: 10,
    opacity: 0.4,
  },
  fab: {
    position: 'absolute',
    right: Spacing.three,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8B4A0', // peach (gradient não dá nativo, single color)
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E8B4A0',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
