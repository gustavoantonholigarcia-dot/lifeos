import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { Alert, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TaskForm } from '@/modules/tawa/components/task-form';
import {
  useAtualizarTarefa,
  useDeletarTarefa,
  useSetoresTawa,
  useTarefa,
} from '@/modules/tawa/queries';

export default function DetalheTarefaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const setoresQ = useSetoresTawa();
  const tarefaQ = useTarefa(id);
  const atualizar = useAtualizarTarefa();
  const deletar = useDeletarTarefa();

  if (tarefaQ.isLoading) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Stack.Screen options={{ title: 'Carregando…' }} />
        <ThemedText type="small" themeColor="textMuted">
          Carregando…
        </ThemedText>
      </ThemedView>
    );
  }

  if (!tarefaQ.data) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Stack.Screen options={{ title: 'Tarefa não encontrada' }} />
        <ThemedText type="default" themeColor="textMuted">
          Tarefa não encontrada ou deletada.
        </ThemedText>
      </ThemedView>
    );
  }

  async function confirmarDeletar() {
    Alert.alert('Deletar tarefa?', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          await deletar.mutateAsync(id);
          router.back();
        },
      },
    ]);
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'Editar tarefa',
          headerShown: true,
          headerRight: () => (
            <Pressable onPress={confirmarDeletar} hitSlop={8}>
              <Trash2 size={20} color="#EF4444" />
            </Pressable>
          ),
        }}
      />
      <TaskForm
        setores={setoresQ.data ?? []}
        inicial={tarefaQ.data}
        submitLabel="Salvar alterações"
        onCancel={() => router.back()}
        onSubmit={async (input) => {
          await atualizar.mutateAsync({ id, patch: input });
          router.back();
        }}
      />
    </ThemedView>
  );
}
