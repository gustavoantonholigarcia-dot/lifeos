import { Image } from 'expo-image';
import { router } from 'expo-router';
import { CalendarDays, Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Modules, Spacing } from '@/constants/theme';
import { SetorChips } from '@/modules/tawa/components/setor-chips';
import { StatusTabs } from '@/modules/tawa/components/status-tabs';
import { SwipeableTaskCard } from '@/modules/tawa/components/swipeable-task-card';
import {
  useAtualizarTarefa,
  useDeletarTarefa,
  useSetoresTawa,
  useTarefasTawa,
} from '@/modules/tawa/queries';
import type { StatusTarefa } from '@/modules/tawa/types';

export default function TawaScreen() {
  const [setorId, setSetorId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusTarefa>('a_fazer');

  const setoresQ = useSetoresTawa();
  const tarefasQ = useTarefasTawa({ setor_id: setorId ?? undefined, status });
  const atualizar = useAtualizarTarefa();
  const deletar = useDeletarTarefa();

  // Contagens por status (mantendo filtro de setor)
  const todasQ = useTarefasTawa({ setor_id: setorId ?? undefined });
  const counts = useMemo(() => {
    const c: Record<StatusTarefa, number> = { a_fazer: 0, em_andamento: 0, concluido: 0 };
    (todasQ.data ?? []).forEach((t) => {
      c[t.status] = (c[t.status] ?? 0) + 1;
    });
    return c;
  }, [todasQ.data]);

  const tarefas = tarefasQ.data ?? [];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header com logo — editorial */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/logos/tawa.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <View style={{ flex: 1, gap: 2 }}>
            <ThemedText type="meta" themeColor="textSecondary">
              Trabalho · Tarefas
            </ThemedText>
            <ThemedText type="displayLG">{Modules.tawa.label}</ThemedText>
            <ThemedText type="small" themeColor="textMuted">
              {tarefas.length} {tarefas.length === 1 ? 'tarefa' : 'tarefas'}
              {counts.em_andamento > 0 ? ` · ${counts.em_andamento} em andamento` : ''}
            </ThemedText>
          </View>
          <Pressable
            onPress={() => router.push('/agenda?modulo=tawa')}
            hitSlop={10}
            style={({ pressed }) => [styles.agendaBtn, pressed && { opacity: 0.6 }]}>
            <CalendarDays size={20} color={'rgba(245,241,237,0.65)' as any} />
          </Pressable>
        </View>

        {/* Setores + Status tabs juntos */}
        <View style={styles.controls}>
          <SetorChips
            setores={setoresQ.data ?? []}
            selecionado={setorId}
            onSelect={setSetorId}
          />
          <StatusTabs status={status} onChange={setStatus} counts={counts} />
        </View>

        {/* Lista de tarefas */}
        <FlatList
          style={{ flex: 1 }}
          data={tarefas}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
          refreshControl={
            <RefreshControl
              refreshing={tarefasQ.isRefetching}
              onRefresh={() => tarefasQ.refetch()}
              tintColor="rgba(255,255,255,0.5)"
            />
          }
          renderItem={({ item }) => (
            <SwipeableTaskCard
              tarefa={item}
              onPress={() => router.push(`/tarefa/${item.id}`)}
              onAvancar={(novoStatus) =>
                atualizar.mutate({
                  id: item.id,
                  patch: {
                    status: novoStatus,
                    concluida_em: novoStatus === 'concluido' ? new Date().toISOString() : null,
                  },
                })
              }
              onDeletar={() => deletar.mutate(item.id)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              status={status}
              loading={tarefasQ.isLoading}
              erro={tarefasQ.error?.message}
            />
          }
        />

        {/* FAB criar tarefa */}
        <Pressable
          onPress={() => router.push('/tarefa/nova')}
          style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}>
          <Plus color="white" size={28} />
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

function EmptyState({
  status,
  loading,
  erro,
}: {
  status: StatusTarefa;
  loading: boolean;
  erro?: string;
}) {
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
        <ThemedText type="small" style={{ color: '#EF4444' }}>
          Erro: {erro}
        </ThemedText>
      </View>
    );
  }
  const msg =
    status === 'a_fazer'
      ? 'Nenhuma tarefa pendente.\nToca no + pra criar a primeira.'
      : status === 'em_andamento'
      ? 'Nada em andamento agora.'
      : 'Nada concluído por aqui.';
  return (
    <View style={styles.empty}>
      <ThemedText type="default" themeColor="textMuted" style={{ textAlign: 'center' }}>
        {msg}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  logo: { width: 48, height: 48 },
  agendaBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245,241,237,0.06)',
  },
  controls: { gap: Spacing.two, paddingBottom: Spacing.two },
  list: { padding: Spacing.three, paddingBottom: 140 },
  empty: { paddingTop: Spacing.four, alignItems: 'center' },
  fab: {
    position: 'absolute',
    right: Spacing.three,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Modules.tawa.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
