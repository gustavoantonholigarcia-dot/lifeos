import { router, Stack } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { TaskForm } from '@/modules/tawa/components/task-form';
import { useCriarTarefa, useSetoresTawa } from '@/modules/tawa/queries';

export default function NovaTarefaScreen() {
  const setoresQ = useSetoresTawa();
  const criar = useCriarTarefa();

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Nova tarefa', headerShown: true }} />
      <TaskForm
        setores={setoresQ.data ?? []}
        submitLabel="Criar tarefa"
        onCancel={() => router.back()}
        onSubmit={async (input) => {
          await criar.mutateAsync(input);
          router.back();
        }}
      />
    </ThemedView>
  );
}
