import { router, Stack, useLocalSearchParams } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { TaskForm } from '@/modules/tawa/components/task-form';
import { useCriarTarefa, useSetoresTawa } from '@/modules/tawa/queries';

export default function NovaTarefaScreen() {
  const setoresQ = useSetoresTawa();
  const criar = useCriarTarefa();
  const params = useLocalSearchParams<{ contato_id?: string; titulo?: string }>();
  const contatoId = typeof params.contato_id === 'string' ? params.contato_id : undefined;
  const tituloInicial = typeof params.titulo === 'string' ? params.titulo : undefined;

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Nova tarefa', headerShown: true }} />
      <TaskForm
        setores={setoresQ.data ?? []}
        submitLabel="Criar tarefa"
        inicial={tituloInicial ? { titulo: tituloInicial } : undefined}
        onCancel={() => router.back()}
        onSubmit={async (input) => {
          await criar.mutateAsync({ ...input, contato_id: contatoId });
          router.back();
        }}
      />
    </ThemedView>
  );
}
