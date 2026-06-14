import { Image } from 'expo-image';
import { router } from 'expo-router';
import { CalendarDays, Plus, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Fab } from '@/components/fab';
import { ThemedText } from '@/components/themed-text';
import { EmptyState as EditorialEmpty } from '@/components/empty-state';
import { ThemedView } from '@/components/themed-view';
import { Modules, Radius, Spacing, Warm } from '@/constants/theme';
import { SetorChips } from '@/modules/tawa/components/setor-chips';
import { StatusTabs } from '@/modules/tawa/components/status-tabs';
import { SwipeableTaskCard } from '@/modules/tawa/components/swipeable-task-card';
import {
  useAtualizarTarefa,
  useDeletarTarefa,
  useSetoresTawa,
  useTarefasTawa,
} from '@/modules/tawa/queries';
import { useContatos } from '@/modules/tawa/crm/queries';
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
  const contatosQ = useContatos();
  const totalContatos = contatosQ.data?.length ?? 0;
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

        {/* Sub-navegação: Tarefas | Contatos (CRM) */}
        <View style={styles.subnav}>
          <View style={[styles.subnavItem, styles.subnavAtivo]}>
            <ThemedText type="default" style={styles.subnavTextoAtivo}>Tarefas</ThemedText>
          </View>
          <Pressable
            onPress={() => router.push('/modules/tawa/contatos')}
            style={({ pressed }) => [styles.subnavItem, pressed && { opacity: 0.6 }]}>
            <Users size={16} color={'rgba(245,241,237,0.65)' as any} />
            <ThemedText type="default" style={styles.subnavTexto}>Contatos</ThemedText>
            {totalContatos > 0 && (
              <View style={styles.subnavBadge}>
                <ThemedText type="mono" style={styles.subnavBadgeTexto}>{totalContatos}</ThemedText>
              </View>
            )}
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
        <Fab onPress={() => router.push('/tarefa/nova')} style={{ bottom: 100 }}>
          <Plus color={'#1C1917' as any} size={28} />
        </Fab>
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
  const conteudo =
    status === 'a_fazer'
      ? { title: 'Tudo limpo por aqui.', subtitle: 'Toca no + pra criar a primeira tarefa.' }
      : status === 'em_andamento'
      ? { title: 'Nada em andamento.', subtitle: 'Puxe uma tarefa pra cá quando começar.' }
      : { title: 'Nada concluído ainda.', subtitle: 'O que você terminar aparece aqui.' };
  return <EditorialEmpty title={conteudo.title} subtitle={conteudo.subtitle} />;
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
  logo: { width: 56, height: 56, borderRadius: Radius.md, overflow: 'hidden' },
  agendaBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245,241,237,0.06)',
  },
  subnav: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  subnavItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 11,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(245,241,237,0.10)',
    backgroundColor: 'rgba(245,241,237,0.04)',
  },
  subnavAtivo: {
    borderColor: Modules.tawa.accent + '66',
    backgroundColor: Modules.tawa.accent + '1A',
  },
  subnavTexto: { fontSize: 14, color: 'rgba(245,241,237,0.70)' },
  subnavTextoAtivo: { fontSize: 14, color: Modules.tawa.accent, fontWeight: '600' },
  subnavBadge: {
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    backgroundColor: 'rgba(245,241,237,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subnavBadgeTexto: { fontSize: 11, color: 'rgba(245,241,237,0.65)' },
  controls: { gap: Spacing.one, paddingBottom: Spacing.one },
  list: { padding: Spacing.three, paddingBottom: 140 },
  empty: { paddingTop: Spacing.four, alignItems: 'center' },
});
