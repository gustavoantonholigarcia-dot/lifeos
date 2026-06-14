import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fab } from '@/components/fab';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import {
  useCertificacoes,
  useDeletarIdioma,
  useDeletarSessao,
  useIdioma,
  useSessoes,
} from '@/modules/estudos/queries';
import {
  NIVEL_LABELS,
  STATUS_CERT_LABELS,
  TIPO_LABELS,
  type Sessao,
} from '@/modules/estudos/types';
import { formatarData, formatarDataCurta } from '@/shared/format/date';

export default function DetalheIdiomaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const idiomaQ = useIdioma(id);
  const sessoesQ = useSessoes(id);
  const certsQ = useCertificacoes(id);
  const deletarIdioma = useDeletarIdioma();
  const deletarSessao = useDeletarSessao();

  if (idiomaQ.isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <Stack.Screen options={{ title: 'Carregando…' }} />
        <ThemedText themeColor="textMuted">Carregando…</ThemedText>
      </ThemedView>
    );
  }

  const idioma = idiomaQ.data;
  if (!idioma) {
    return (
      <ThemedView style={styles.centered}>
        <Stack.Screen options={{ title: 'Idioma não encontrado' }} />
        <ThemedText themeColor="textMuted">Idioma não encontrado.</ThemedText>
      </ThemedView>
    );
  }

  const sessoes = sessoesQ.data ?? [];
  const certs = certsQ.data ?? [];

  // Estatísticas calculadas client-side
  const minutosTotal = sessoes.reduce((acc, s) => acc + s.duracao_min, 0);
  const horas = Math.floor(minutosTotal / 60);
  const minutos = minutosTotal % 60;
  const diasUnicos = new Set(sessoes.map((s) => s.data)).size;

  function confirmarDeletarIdioma() {
    Alert.alert(
      `Deletar ${idioma!.nome}?`,
      'Todas as sessões e certificações vão junto. Não dá pra desfazer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            await deletarIdioma.mutateAsync(id);
            router.back();
          },
        },
      ],
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: idioma.nome,
          headerShown: true,
          headerRight: () => (
            <Pressable onPress={confirmarDeletarIdioma} hitSlop={8}>
              <Trash2 size={20} color={'#C97064' as any} />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <FlatList
          data={sessoes}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
          refreshControl={
            <RefreshControl
              refreshing={sessoesQ.isRefetching}
              onRefresh={() => sessoesQ.refetch()}
              tintColor="rgba(245,241,237,0.5)"
            />
          }
          ListHeaderComponent={
            <View style={{ gap: Spacing.three, marginBottom: Spacing.three }}>
              {/* Hero do idioma */}
              <View style={[styles.hero, { borderColor: idioma.cor + '55' }]}>
                <View style={styles.heroTopo}>
                  <ThemedText type="display" style={{ fontSize: 44, lineHeight: 48 }}>
                    {idioma.bandeira_emoji ?? '🏳️'}
                  </ThemedText>
                  <View style={{ flex: 1, gap: 2 }}>
                    <ThemedText type="displayLG">{idioma.nome}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {NIVEL_LABELS[idioma.nivel_atual]}
                      {idioma.nivel_meta && ` → ${idioma.nivel_meta.toUpperCase()}`}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.statsRow}>
                  <Stat
                    label="Tempo total"
                    valor={horas > 0 ? `${horas}h${minutos > 0 ? minutos + 'm' : ''}` : `${minutos}min`}
                  />
                  <Stat label="Dias estudados" valor={String(diasUnicos)} />
                  <Stat label="Sessões" valor={String(sessoes.length)} />
                </View>
              </View>

              {/* Certificações */}
              <View style={{ gap: Spacing.two }}>
                <View style={styles.sectionHead}>
                  <ThemedText type="meta" themeColor="textSecondary">
                    01 · Certificações
                  </ThemedText>
                  <Pressable
                    onPress={() =>
                      router.push(`/modules/estudos/${id}/certificacao-nova`)
                    }>
                    <ThemedText type="small" style={{ color: idioma.cor }}>
                      + adicionar
                    </ThemedText>
                  </Pressable>
                </View>
                {certs.length === 0 ? (
                  <ThemedText type="small" themeColor="textMuted">
                    Nenhuma certificação planejada.
                  </ThemedText>
                ) : (
                  certs.map((c) => (
                    <View key={c.id} style={styles.certRow}>
                      <View style={{ flex: 1 }}>
                        <ThemedText type="default" style={{ fontWeight: '500' }}>
                          {c.nome}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textMuted">
                          {STATUS_CERT_LABELS[c.status]}
                          {c.data_alvo && ` · ${formatarData(c.data_alvo)}`}
                          {c.nota && ` · ${c.nota}`}
                        </ThemedText>
                      </View>
                    </View>
                  ))
                )}
              </View>

              {/* Header sessões */}
              <View style={styles.sectionHead}>
                <ThemedText type="meta" themeColor="textSecondary">
                  02 · Sessões de estudo
                </ThemedText>
                <ThemedText type="mono" themeColor="textMuted">
                  {String(sessoes.length).padStart(2, '0')}
                </ThemedText>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <SessaoCard
              sessao={item}
              onDelete={() => {
                Alert.alert('Deletar sessão?', '', [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Deletar',
                    style: 'destructive',
                    onPress: () => deletarSessao.mutate(item.id),
                  },
                ]);
              }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <ThemedText themeColor="textMuted" style={{ textAlign: 'center' }}>
                Nenhuma sessão registrada.{'\n'}Toca no + pra registrar a primeira.
              </ThemedText>
            </View>
          }
        />

        <Fab
          onPress={() => router.push(`/modules/estudos/${id}/sessao-nova`)}
          color={idioma.cor}>
          <Plus color={'white' as any} size={26} />
        </Fab>
      </SafeAreaView>
    </ThemedView>
  );
}

function SessaoCard({ sessao, onDelete }: { sessao: Sessao; onDelete: () => void }) {
  return (
    <Pressable onLongPress={onDelete} style={styles.sessaoCard}>
      <View style={styles.sessaoData}>
        <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 11 }}>
          {formatarDataCurta(sessao.data)}
        </ThemedText>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <ThemedText type="default" style={{ fontWeight: '500' }}>
          {sessao.duracao_min} min · {TIPO_LABELS[sessao.tipo]}
        </ThemedText>
        {(sessao.fonte || sessao.observacoes) && (
          <ThemedText type="small" themeColor="textMuted" numberOfLines={2}>
            {sessao.fonte && `📚 ${sessao.fonte}`}
            {sessao.fonte && sessao.observacoes && ' · '}
            {sessao.observacoes}
          </ThemedText>
        )}
      </View>
    </Pressable>
  );
}

function Stat({ label, valor }: { label: string; valor: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText
        type="small"
        themeColor="textMuted"
        style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </ThemedText>
      <ThemedText type="default" style={{ fontWeight: '600', fontSize: 18 }}>
        {valor}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.three, paddingBottom: 140 },
  hero: {
    padding: Spacing.three,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(245,241,237,0.04)',
    borderWidth: 1,
    gap: Spacing.three,
  },
  heroTopo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.four,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245,241,237,0.06)',
  },
  stat: { gap: 2 },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionLabel: { textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 11 },
  certRow: {
    flexDirection: 'row',
    padding: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(245,241,237,0.04)',
  },
  sessaoCard: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(245,241,237,0.04)',
    alignItems: 'center',
  },
  sessaoData: {
    width: 44,
    paddingRight: Spacing.two,
    borderRightWidth: 1,
    borderRightColor: 'rgba(245,241,237,0.08)',
    alignItems: 'center',
  },
  empty: { paddingTop: Spacing.four, alignItems: 'center' },
});
