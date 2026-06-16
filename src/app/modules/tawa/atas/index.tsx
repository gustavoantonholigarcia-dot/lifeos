import * as Haptics from 'expo-haptics';
import { Stack, router } from 'expo-router';
import { ChevronRight, Plus, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Modules, Radius, Spacing } from '@/constants/theme';
import { useAtas, useCriarAta, useDeletarAta } from '@/modules/tawa/crm/queries';

const ACCENT = Modules.tawa.accent;

export default function AtasScreen() {
  const { data: atas, isLoading } = useAtas();
  const criar = useCriarAta();
  const deletar = useDeletarAta();
  const [formOpen, setFormOpen] = useState(false);

  function confirmarApagar(id: string, nome: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Apagar ata',
      `Apagar "${nome}"? Leva junto os lotes, participantes e empenhos. Não volta.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: () => deletar.mutate(id) },
      ],
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Atas de registro' }} />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ThemedText type="small" themeColor="textMuted">
            Atas de registro de preço ganhas. Cada uma tem seus lotes (veículos) e os
            municípios que podem caronar.
          </ThemedText>

          {!isLoading && (atas?.length ?? 0) === 0 && (
            <ThemedView type="backgroundElement" style={styles.emptyCard}>
              <ThemedText type="default">Nenhuma ata ainda.</ThemedText>
              <ThemedText type="small" themeColor="textMuted">
                Toque + pra cadastrar a primeira (ex: CIGEDAS, com os lotes que vocês ganharam).
              </ThemedText>
            </ThemedView>
          )}

          {atas?.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => router.push(`/modules/tawa/atas/${a.id}` as any)}
              onLongPress={() => confirmarApagar(a.id, a.nome)}
              delayLongPress={400}
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
              <ThemedView type="backgroundElement" style={styles.card}>
                <View style={[styles.spine, { backgroundColor: ACCENT }]} />
                <View style={{ flex: 1, gap: 2 }}>
                  <ThemedText type="titleMD">{a.nome}</ThemedText>
                  {a.descricao ? (
                    <ThemedText type="small" themeColor="textMuted" numberOfLines={2}>
                      {a.descricao}
                    </ThemedText>
                  ) : null}
                </View>
                <ChevronRight size={16} color={'rgba(245,241,237,0.30)' as any} />
              </ThemedView>
            </Pressable>
          ))}

          {(atas?.length ?? 0) > 0 && (
            <ThemedText type="small" themeColor="textMuted" style={styles.dica}>
              Toque pra abrir o painel · segure pra apagar
            </ThemedText>
          )}
        </ScrollView>

        <Pressable
          onPress={() => setFormOpen(true)}
          style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}>
          <Plus color={'#1C1917' as any} size={26} />
        </Pressable>

        {formOpen && (
          <NovaAtaSheet
            onClose={() => setFormOpen(false)}
            onCriar={async (nome, descricao) => {
              const ata = await criar.mutateAsync({ nome, descricao });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setFormOpen(false);
              router.push(`/modules/tawa/atas/${ata.id}` as any);
            }}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function NovaAtaSheet({
  onClose,
  onCriar,
}: {
  onClose: () => void;
  onCriar: (nome: string, descricao?: string) => Promise<void>;
}) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!nome.trim() || salvando) return;
    setSalvando(true);
    try {
      await onCriar(nome.trim(), descricao.trim() || undefined);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <ThemedText type="titleMD" style={{ color: '#F5F1ED' }}>Nova ata</ThemedText>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={22} color={'rgba(245,241,237,0.65)' as any} />
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={styles.sheetBody}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}>
          <TextInput
            value={nome}
            onChangeText={setNome}
            placeholder="Nome (ex: CIGEDAS, Consórcio X)"
            placeholderTextColor="rgba(245,241,237,0.25)"
            autoFocus
            style={styles.input}
          />
          <TextInput
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Descrição (opcional)"
            placeholderTextColor="rgba(245,241,237,0.25)"
            multiline
            style={[styles.input, { minHeight: 72, textAlignVertical: 'top' }]}
          />
          <ThemedText type="small" themeColor="textMuted">
            Depois de criar, você adiciona os lotes (veículos) e marca os municípios
            participantes dentro do painel.
          </ThemedText>
          <Pressable
            onPress={salvar}
            disabled={!nome.trim() || salvando}
            style={({ pressed }) => [styles.salvar, pressed && { opacity: 0.85 }, (!nome.trim() || salvando) && { opacity: 0.4 }]}>
            <ThemedText type="default" style={{ color: '#1C1917', fontWeight: '600' }}>
              {salvando ? 'Criando...' : 'Criar e abrir'}
            </ThemedText>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: Spacing.three, gap: Spacing.three, paddingBottom: 120 },
  emptyCard: { padding: Spacing.three, borderRadius: Radius.lg, gap: Spacing.one },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  spine: { width: 3, alignSelf: 'stretch', borderRadius: 2, marginVertical: -Spacing.three },
  dica: { opacity: 0.7, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: Spacing.three,
    bottom: Spacing.four,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: { flex: 1, backgroundColor: '#1C1917' },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    paddingTop: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(245,241,237,0.08)',
  },
  sheetBody: { padding: Spacing.three, gap: Spacing.three },
  input: {
    backgroundColor: 'rgba(245,241,237,0.06)',
    borderRadius: Radius.md,
    padding: Spacing.three,
    color: '#F5F1ED',
    fontSize: 15,
  },
  salvar: { backgroundColor: ACCENT, borderRadius: Radius.md, padding: Spacing.three, alignItems: 'center', marginTop: Spacing.two },
});
