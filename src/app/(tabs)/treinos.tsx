import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Check, Plus, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModuleHeader } from '@/components/module-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Modules, Radius, Spacing, Warm } from '@/constants/theme';
import {
  useAtualizarSessao,
  useCriarSessao,
  useDeletarSessao,
  useSessoesSemana,
  useSessoesTreino,
} from '@/modules/treinos/queries';
import {
  MODALIDADE_CONFIG,
  MODALIDADES,
  type Modalidade,
  type TreinoSessao,
} from '@/modules/treinos/types';

function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function TreinosScreen() {
  const [filtro, setFiltro] = useState<Modalidade | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const { data: sessoes, isLoading } = useSessoesTreino(filtro);
  const { data: semana } = useSessoesSemana();
  const atualizar = useAtualizarSessao();
  const deletar = useDeletarSessao();

  const semanaCount = semana?.filter((s) => s.status === 'concluido').length ?? 0;

  function toggleConcluido(sessao: TreinoSessao) {
    const novoStatus = sessao.status === 'concluido' ? 'planejado' : 'concluido';
    Haptics.notificationAsync(
      novoStatus === 'concluido'
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning,
    );
    atualizar.mutate({ id: sessao.id, patch: { status: novoStatus } });
  }

  function confirmarDeletar(id: string) {
    Alert.alert('Deletar sessão?', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: () => deletar.mutate(id),
      },
    ]);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          {/* Header */}
          <ModuleHeader
            module="treinos"
            eyebrow={`${semanaCount} treino${semanaCount !== 1 ? 's' : ''} esta semana`}
          />

          {/* Filtro por modalidade */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}>
            <Pressable
              onPress={() => setFiltro(null)}
              style={[styles.chip, !filtro && styles.chipAtivo]}>
              <ThemedText
                type="mono"
                style={[styles.chipText, !filtro && styles.chipTextoAtivo]}>
                Todas
              </ThemedText>
            </Pressable>
            {MODALIDADES.map((m) => {
              const cfg = MODALIDADE_CONFIG[m];
              const ativo = filtro === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => setFiltro(ativo ? null : m)}
                  style={[styles.chip, ativo && { backgroundColor: cfg.cor + '25' }]}>
                  <ThemedText type="mono" style={[styles.chipText, ativo && { color: cfg.cor }]}>
                    {cfg.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Lista de sessões */}
          {isLoading && (
            <ThemedText type="default" themeColor="textMuted">
              Carregando...
            </ThemedText>
          )}

          {!isLoading && (sessoes?.length ?? 0) === 0 && (
            <ThemedView type="backgroundElement" style={styles.empty}>
              <ThemedText type="default" themeColor="textMuted">
                Nenhuma sessão registrada. Toque + para começar.
              </ThemedText>
            </ThemedView>
          )}

          {sessoes?.map((sessao) => {
            const cfg = MODALIDADE_CONFIG[sessao.modalidade];
            const concluida = sessao.status === 'concluido';
            return (
              <Pressable
                key={sessao.id}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  confirmarDeletar(sessao.id);
                }}
                delayLongPress={200}
                style={styles.sessaoCard}>
                <Pressable
                  onPress={() => toggleConcluido(sessao)}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.check,
                    concluida && { backgroundColor: cfg.cor, borderColor: cfg.cor },
                    pressed && { transform: [{ scale: 0.92 }] },
                  ]}>
                  {concluida && <Check size={12} color={'#1C1917' as any} strokeWidth={3} />}
                </Pressable>

                <View style={styles.sessaoBody}>
                  <View style={styles.sessaoTitleRow}>
                    <ThemedText
                      type="default"
                      style={concluida ? styles.titleDone : undefined}>
                      {cfg.label}
                    </ThemedText>
                    <ThemedText type="mono" style={styles.sessaoData}>
                      {formatarData(sessao.data)}
                    </ThemedText>
                  </View>
                  {(sessao.duracao_min || sessao.observacoes) && (
                    <View style={styles.sessaoMeta}>
                      {sessao.duracao_min && (
                        <ThemedText type="mono" style={styles.metaText}>
                          {sessao.duracao_min}min
                        </ThemedText>
                      )}
                      {sessao.observacoes && (
                        <ThemedText
                          type="mono"
                          style={styles.metaText}
                          numberOfLines={1}>
                          {sessao.observacoes}
                        </ThemedText>
                      )}
                    </View>
                  )}
                </View>

                <View style={[styles.accentDot, { backgroundColor: cfg.cor }]} />
              </Pressable>
            );
          })}
        </ScrollView>

        {/* FAB */}
        <Pressable
          onPress={() => setFormOpen(true)}
          style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}>
          <Plus color={'#1C1917' as any} size={22} />
        </Pressable>

        <NovaSessaoSheet visible={formOpen} onClose={() => setFormOpen(false)} />
      </SafeAreaView>
    </ThemedView>
  );
}

function NovaSessaoSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [modalidade, setModalidade] = useState<Modalidade>('judo');
  const [duracao, setDuracao] = useState('');
  const [obs, setObs] = useState('');
  const criar = useCriarSessao();

  async function salvar() {
    await criar.mutateAsync({
      modalidade,
      data: hojeISO(),
      duracao_min: duracao ? parseInt(duracao, 10) : undefined,
      observacoes: obs || undefined,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDuracao('');
    setObs('');
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={sheetStyles.sheet}>
        <View style={sheetStyles.header}>
          <ThemedText type="titleMD" style={{ color: '#F5F1ED' }}>
            Registrar treino
          </ThemedText>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={22} color={'rgba(245,241,237,0.65)' as any} />
          </Pressable>
        </View>

        <View style={sheetStyles.body}>
          <ThemedText type="meta" style={sheetStyles.label}>
            Modalidade
          </ThemedText>
          <View style={sheetStyles.modalidades}>
            {MODALIDADES.map((m) => {
              const cfg = MODALIDADE_CONFIG[m];
              const ativo = modalidade === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => setModalidade(m)}
                  style={[
                    sheetStyles.modBtn,
                    ativo && { backgroundColor: cfg.cor + '25', borderColor: cfg.cor },
                  ]}>
                  <ThemedText type="default" style={ativo ? { color: cfg.cor } : undefined}>
                    {cfg.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <ThemedText type="meta" style={sheetStyles.label}>
            Duração (minutos)
          </ThemedText>
          <TextInput
            value={duracao}
            onChangeText={setDuracao}
            placeholder="60"
            placeholderTextColor="rgba(245,241,237,0.25)"
            keyboardType="number-pad"
            style={sheetStyles.input}
          />

          <ThemedText type="meta" style={sheetStyles.label}>
            Observações
          </ThemedText>
          <TextInput
            value={obs}
            onChangeText={setObs}
            placeholder="Opcional"
            placeholderTextColor="rgba(245,241,237,0.25)"
            multiline
            style={[sheetStyles.input, { minHeight: 80, textAlignVertical: 'top' }]}
          />

          <Pressable
            onPress={salvar}
            disabled={criar.isPending}
            style={({ pressed }) => [sheetStyles.salvarBtn, pressed && { opacity: 0.85 }]}>
            <ThemedText type="default" style={{ color: '#1C1917', fontWeight: '600' }}>
              {criar.isPending ? 'Salvando...' : 'Registrar'}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function formatarData(iso: string): string {
  const [_, m, d] = iso.split('-');
  return `${d}/${m}`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: Spacing.three, gap: Spacing.three, paddingBottom: 140 },
  header: { paddingTop: Spacing.two, gap: 2 },
  chips: { flexDirection: 'row', gap: Spacing.two, paddingVertical: Spacing.one },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(245,241,237,0.06)',
  },
  chipAtivo: { backgroundColor: 'rgba(245,241,237,0.14)' },
  chipText: { fontSize: 12, color: 'rgba(245,241,237,0.55)' },
  chipTextoAtivo: { color: '#F5F1ED' },
  empty: { padding: Spacing.three, borderRadius: Radius.lg },
  sessaoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    backgroundColor: 'rgba(245,241,237,0.04)',
    borderRadius: Radius.md,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(245,241,237,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessaoBody: { flex: 1, gap: 4 },
  sessaoTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessaoData: { fontSize: 11, color: 'rgba(245,241,237,0.40)' },
  sessaoMeta: { flexDirection: 'row', gap: 8 },
  metaText: { fontSize: 11, color: 'rgba(245,241,237,0.45)' },
  titleDone: { color: 'rgba(245,241,237,0.40)', textDecorationLine: 'line-through' },
  accentDot: { width: 6, height: 6, borderRadius: 3 },
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

const sheetStyles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: '#1C1917' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    paddingTop: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(245,241,237,0.08)',
  },
  body: { padding: Spacing.three, gap: Spacing.three },
  label: { color: 'rgba(245,241,237,0.55)', textTransform: 'uppercase', letterSpacing: 0.6 },
  modalidades: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  modBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(245,241,237,0.10)',
    backgroundColor: 'rgba(245,241,237,0.04)',
  },
  input: {
    backgroundColor: 'rgba(245,241,237,0.06)',
    borderRadius: Radius.md,
    padding: Spacing.three,
    color: '#F5F1ED',
    fontSize: 15,
  },
  salvarBtn: {
    backgroundColor: Modules.treinos.accent,
    borderRadius: Radius.md,
    padding: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
});
