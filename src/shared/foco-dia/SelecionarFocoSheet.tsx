import { X } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Modules, Radius, Spacing } from '@/constants/theme';
import { PRIORIDADE_CORES, type Tarefa } from '@/modules/tawa/types';
import { formatarPrazoRelativo } from '@/shared/format/date';

import { useAdicionarFoco, useTarefasPendentes } from './queries';

type Props = {
  visible: boolean;
  onClose: () => void;
  jaNoFoco: string[];
};

export function SelecionarFocoSheet({ visible, onClose, jaNoFoco }: Props) {
  const { data: tarefas, isLoading } = useTarefasPendentes();
  const adicionar = useAdicionarFoco();

  const disponiveis = (tarefas ?? []).filter((t) => !jaNoFoco.includes(t.id));

  async function selecionar(tarefa: Tarefa) {
    await adicionar.mutateAsync(tarefa.id);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <ThemedText type="titleMD" style={styles.headerTitle}>
            Selecionar foco
          </ThemedText>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={22} color={'rgba(245,241,237,0.65)' as any} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {isLoading && (
            <ThemedText type="default" themeColor="textMuted">
              Carregando...
            </ThemedText>
          )}

          {!isLoading && disponiveis.length === 0 && (
            <ThemedText type="default" themeColor="textMuted">
              Nenhuma tarefa pendente.
            </ThemedText>
          )}

          {disponiveis.map((tarefa) => (
            <TarefaOption key={tarefa.id} tarefa={tarefa} onPress={() => selecionar(tarefa)} />
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

function TarefaOption({ tarefa, onPress }: { tarefa: Tarefa; onPress: () => void }) {
  const cor = PRIORIDADE_CORES[tarefa.prioridade];
  const prazo = tarefa.prazo_em ? formatarPrazoRelativo(tarefa.prazo_em) : null;
  const moduloLabel = (Modules as any)[tarefa.modulo]?.label ?? tarefa.modulo;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}>
      <View style={[styles.accentBar, { backgroundColor: cor }]} />
      <View style={styles.optionBody}>
        <ThemedText type="default" numberOfLines={2}>
          {tarefa.titulo}
        </ThemedText>
        <View style={styles.optionMeta}>
          <ThemedText type="mono" style={styles.metaText}>
            {moduloLabel}
          </ThemedText>
          {prazo && (
            <ThemedText type="mono" style={styles.metaText}>
              {prazo.texto}
            </ThemedText>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: '#1C1917',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    paddingTop: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(245,241,237,0.08)',
  },
  headerTitle: { color: '#F5F1ED' },
  list: {
    padding: Spacing.three,
    gap: Spacing.two,
    paddingBottom: 100,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'rgba(245,241,237,0.04)',
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  optionPressed: { backgroundColor: 'rgba(245,241,237,0.08)' },
  accentBar: { width: 3 },
  optionBody: {
    flex: 1,
    padding: Spacing.three,
    gap: 4,
  },
  optionMeta: { flexDirection: 'row', gap: 8 },
  metaText: { fontSize: 10, color: 'rgba(245,241,237,0.45)' },
});
