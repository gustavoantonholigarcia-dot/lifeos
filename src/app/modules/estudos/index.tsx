import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModuleHeader } from '@/components/module-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing, Warm } from '@/constants/theme';
import { useIdiomas } from '@/modules/estudos/queries';
import { NIVEL_LABELS, type IdiomaResumo } from '@/modules/estudos/types';
import { formatarDataCurta } from '@/shared/format/date';

export default function EstudosScreen() {
  const idiomasQ = useIdiomas();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerWrap}>
          <ModuleHeader module="estudos" eyebrow="Idiomas · Sessões · Certs" />
        </View>

        <FlatList
          style={{ flex: 1 }}
          data={idiomasQ.data ?? []}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
          refreshControl={
            <RefreshControl
              refreshing={idiomasQ.isRefetching}
              onRefresh={() => idiomasQ.refetch()}
              tintColor="rgba(245,241,237,0.5)"
            />
          }
          renderItem={({ item }) => (
            <IdiomaCard
              idioma={item}
              onPress={() => router.push(`/modules/estudos/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <EmptyState loading={idiomasQ.isLoading} erro={idiomasQ.error?.message} />
          }
        />

        <Pressable
          onPress={() => router.push('/modules/estudos/novo')}
          style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}>
          <Plus color={'#1C1917' as any} size={26} />
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

function IdiomaCard({ idioma, onPress }: { idioma: IdiomaResumo; onPress: () => void }) {
  const horas = Math.floor(idioma.minutos_total / 60);
  const minutos = idioma.minutos_total % 60;
  const tempoTotal = horas > 0 ? `${horas}h${minutos > 0 ? minutos + 'm' : ''}` : `${minutos}min`;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.cardBar, { backgroundColor: idioma.cor }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <ThemedText type="default" style={{ fontSize: 20 }}>
            {idioma.bandeira_emoji ?? '🏳️'}
          </ThemedText>
          <View style={{ flex: 1 }}>
            <ThemedText type="default" style={{ fontWeight: '600' }}>
              {idioma.nome}
            </ThemedText>
            <ThemedText type="small" themeColor="textMuted">
              {NIVEL_LABELS[idioma.nivel_atual]}
              {idioma.nivel_meta && ` → ${idioma.nivel_meta.toUpperCase()}`}
            </ThemedText>
          </View>
        </View>

        <View style={styles.cardStats}>
          <Stat label="Tempo total" valor={tempoTotal} />
          <Stat label="Dias estudados" valor={String(idioma.dias_estudados)} />
          {idioma.certs_planejadas > 0 && (
            <Stat label="Certificações" valor={String(idioma.certs_planejadas)} />
          )}
          {idioma.ultima_sessao && (
            <Stat label="Última" valor={formatarDataCurta(idioma.ultima_sessao)} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

function Stat({ label, valor }: { label: string; valor: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText type="small" themeColor="textMuted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </ThemedText>
      <ThemedText type="default" style={{ fontWeight: '600' }}>
        {valor}
      </ThemedText>
    </View>
  );
}

function EmptyState({ loading, erro }: { loading: boolean; erro?: string }) {
  if (loading) {
    return (
      <View style={styles.empty}>
        <ThemedText type="small" themeColor="textMuted">
          Carregando…
        </ThemedText>
      </View>
    );
  }
  if (erro) {
    return (
      <View style={styles.empty}>
        <ThemedText type="small" style={{ color: '#C97064' }}>
          Erro: {erro}
        </ThemedText>
      </View>
    );
  }
  return (
    <View style={styles.empty}>
      <ThemedText type="display" style={{ textAlign: 'center', fontSize: 22, marginBottom: 12 }}>
        Comece por um idioma.
      </ThemedText>
      <ThemedText type="small" themeColor="textMuted" style={{ textAlign: 'center' }}>
        Toca no + abaixo. Inglês é uma boa primeira escolha.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  headerWrap: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  list: { padding: Spacing.three, paddingBottom: 140 },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245,241,237,0.05)',
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  pressed: { backgroundColor: 'rgba(245,241,237,0.08)' },
  cardBar: { width: 4 },
  cardBody: { flex: 1, padding: Spacing.three, gap: Spacing.three },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  cardStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245,241,237,0.06)',
  },
  stat: { gap: 2 },
  empty: { paddingTop: Spacing.six, alignItems: 'center' },
  fab: {
    position: 'absolute',
    right: Spacing.three,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Warm.peach,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Warm.peach,
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
