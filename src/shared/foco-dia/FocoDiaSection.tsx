import * as Haptics from 'expo-haptics';
import { Check, Minus, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Modules, Radius, Semantic, Spacing } from '@/constants/theme';
import { useConcluirTarefa } from '@/modules/tawa/queries';
import { PRIORIDADE_CORES, type Tarefa } from '@/modules/tawa/types';
import { formatarPrazoRelativo } from '@/shared/format/date';

import { SelecionarFocoSheet } from './SelecionarFocoSheet';
import { useFocoDia, useRemoverFoco, type FocoItem } from './queries';

const MAX_FOCO = 5;
const SAGE = '#8FA899';

export function FocoDiaSection() {
  const { data: itens, isLoading } = useFocoDia();
  const remover = useRemoverFoco();
  const concluir = useConcluirTarefa();
  const [sheetOpen, setSheetOpen] = useState(false);

  const lista = itens ?? [];
  const podeAdicionar = lista.length < MAX_FOCO;

  function handleConcluir(item: FocoItem) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    concluir(item.tarefa_id);
  }

  function handleRemover(item: FocoItem) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    remover.mutate(item.id);
  }

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="meta" themeColor="textSecondary">
          01 · Foco do dia
        </ThemedText>
        <ThemedText type="mono" themeColor="textMuted" style={styles.counter}>
          {lista.length}/{MAX_FOCO}
        </ThemedText>
      </View>

      {isLoading && (
        <ThemedText type="default" themeColor="textMuted" style={styles.empty}>
          Carregando...
        </ThemedText>
      )}

      {!isLoading && lista.length === 0 && (
        <ThemedText type="default" themeColor="textMuted" style={styles.empty}>
          Toque + para fixar suas prioridades de hoje.
        </ThemedText>
      )}

      {lista.map((item) => (
        <FocoCard
          key={item.id}
          item={item}
          onConcluir={() => handleConcluir(item)}
          onRemover={() => handleRemover(item)}
        />
      ))}

      {podeAdicionar && (
        <Pressable
          onPress={() => setSheetOpen(true)}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.6 }]}>
          <Plus size={16} color={'rgba(245,241,237,0.50)' as any} />
          <ThemedText type="default" themeColor="textSecondary">
            Adicionar foco
          </ThemedText>
        </Pressable>
      )}

      <SelecionarFocoSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        jaNoFoco={lista.map((i) => i.tarefa_id)}
      />
    </ThemedView>
  );
}

function FocoCard({
  item,
  onConcluir,
  onRemover,
}: {
  item: FocoItem;
  onConcluir: () => void;
  onRemover: () => void;
}) {
  const { tarefa } = item;
  const concluida = tarefa.status === 'concluido';
  const cor = PRIORIDADE_CORES[tarefa.prioridade];
  const prazo = tarefa.prazo_em ? formatarPrazoRelativo(tarefa.prazo_em) : null;
  const moduloLabel = tarefa.modulo ? (Modules as any)[tarefa.modulo]?.label : null;

  return (
    <View style={styles.focoCard}>
      <Pressable
        onPress={onConcluir}
        hitSlop={8}
        style={({ pressed }) => [
          styles.check,
          concluida && { backgroundColor: SAGE, borderColor: SAGE },
          pressed && { transform: [{ scale: 0.92 }] },
        ]}>
        {concluida && <Check size={12} color={'#1C1917' as any} strokeWidth={3} />}
      </Pressable>

      <View style={styles.focoBody}>
        <ThemedText
          type="default"
          numberOfLines={1}
          style={concluida ? styles.titleDone : undefined}>
          {tarefa.titulo}
        </ThemedText>
        <View style={styles.focoMeta}>
          {moduloLabel && (
            <ThemedText type="mono" style={styles.focoMetaText}>
              {moduloLabel}
            </ThemedText>
          )}
          {prazo && (
            <ThemedText type="mono" style={[styles.focoMetaText, { color: cor }]}>
              {prazo.texto}
            </ThemedText>
          )}
        </View>
      </View>

      <Pressable
        onPress={onRemover}
        hitSlop={8}
        style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.5 }]}>
        <Minus size={14} color={'rgba(245,241,237,0.35)' as any} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
    borderRadius: Radius.lg,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counter: { fontSize: 10 },
  empty: { marginTop: Spacing.one, fontSize: 14 },
  focoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(245,241,237,0.08)',
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(245,241,237,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focoBody: { flex: 1, gap: 2 },
  focoMeta: { flexDirection: 'row', gap: 8 },
  focoMetaText: { fontSize: 10, color: 'rgba(245,241,237,0.45)' },
  titleDone: {
    color: 'rgba(245,241,237,0.40)',
    textDecorationLine: 'line-through',
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245,241,237,0.06)',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(245,241,237,0.08)',
  },
});
