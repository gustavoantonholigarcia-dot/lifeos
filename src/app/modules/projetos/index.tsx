import * as Haptics from 'expo-haptics';
import { ExternalLink, Plus, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  Linking,
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
  useAtualizarProjeto,
  useCriarProjeto,
  useProjetos,
  type Projeto,
} from '@/modules/projetos/queries';

const STATUS_SEQ = ['ideia', 'ativo', 'pausado', 'concluido', 'cancelado'];

const STATUS_LABELS: Record<string, string> = {
  ideia: 'Ideia',
  ativo: 'Ativo',
  pausado: 'Pausado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

const STATUS_CORES: Record<string, string> = {
  ideia: 'rgba(245,241,237,0.40)',
  ativo: '#8FA899',
  pausado: '#E8A845',
  concluido: '#6B8FB8',
  cancelado: '#78716C',
};

export default function ProjetosScreen() {
  const { data: projetos } = useProjetos();
  const atualizar = useAtualizarProjeto();
  const [formOpen, setFormOpen] = useState(false);

  function ciclarStatus(p: Projeto) {
    const idx = STATUS_SEQ.indexOf(p.status);
    const proximo = STATUS_SEQ[(idx + 1) % STATUS_SEQ.length];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    atualizar.mutate({ id: p.id, patch: { status: proximo } });
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ModuleHeader
            module="projetos"
            eyebrow={`${projetos?.length ?? 0} projeto${(projetos?.length ?? 0) !== 1 ? 's' : ''}`}
          />

          {(!projetos || projetos.length === 0) && (
            <ThemedView type="backgroundElement" style={styles.emptyCard}>
              <ThemedText type="default" themeColor="textMuted">
                Nenhum projeto. Toque + para criar.
              </ThemedText>
            </ThemedView>
          )}

          {projetos?.map((p) => {
            const cor = STATUS_CORES[p.status] ?? STATUS_CORES.ideia;
            return (
              <ThemedView key={p.id} type="backgroundElement" style={styles.projetoCard}>
                <View style={styles.projetoHeader}>
                  <ThemedText type="titleMD" style={{ flex: 1 }}>
                    {p.nome}
                  </ThemedText>
                  <Pressable
                    onPress={() => ciclarStatus(p)}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.statusPill,
                      { backgroundColor: cor + '22' },
                      pressed && { opacity: 0.6 },
                    ]}>
                    <ThemedText type="mono" style={[styles.statusText, { color: cor }]}>
                      {STATUS_LABELS[p.status] ?? p.status}
                    </ThemedText>
                  </Pressable>
                </View>

                {p.descricao && (
                  <ThemedText type="small" themeColor="textMuted" numberOfLines={3}>
                    {p.descricao}
                  </ThemedText>
                )}

                {p.progresso_pct > 0 && (
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${p.progresso_pct}%`, backgroundColor: cor }]} />
                  </View>
                )}

                <View style={styles.projetoMeta}>
                  {p.tech_stack && p.tech_stack.length > 0 && (
                    <ThemedText type="mono" style={styles.metaText}>
                      {(p.tech_stack as string[]).join(' · ')}
                    </ThemedText>
                  )}
                  {p.link && (
                    <Pressable onPress={() => Linking.openURL(p.link!)} hitSlop={8}>
                      <ExternalLink size={14} color={'rgba(245,241,237,0.45)' as any} />
                    </Pressable>
                  )}
                </View>
              </ThemedView>
            );
          })}
        </ScrollView>

        <Pressable
          onPress={() => setFormOpen(true)}
          style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}>
          <Plus color={'#1C1917' as any} size={22} />
        </Pressable>

        {formOpen && <NovoProjetoSheet onClose={() => setFormOpen(false)} />}
      </SafeAreaView>
    </ThemedView>
  );
}

function NovoProjetoSheet({ onClose }: { onClose: () => void }) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [stack, setStack] = useState('');
  const [link, setLink] = useState('');
  const criar = useCriarProjeto();

  async function salvar() {
    if (!nome.trim()) return;
    await criar.mutateAsync({
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
      tech_stack: stack.trim() ? stack.split(',').map((s) => s.trim()) : undefined,
      link: link.trim() || undefined,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={sheetStyles.sheet}>
        <View style={sheetStyles.header}>
          <ThemedText type="titleMD" style={{ color: '#F5F1ED' }}>Novo projeto</ThemedText>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={22} color={'rgba(245,241,237,0.65)' as any} />
          </Pressable>
        </View>
        <View style={sheetStyles.body}>
          <TextInput value={nome} onChangeText={setNome} placeholder="Nome do projeto" placeholderTextColor="rgba(245,241,237,0.25)" style={sheetStyles.input} />
          <TextInput value={descricao} onChangeText={setDescricao} placeholder="Descrição" placeholderTextColor="rgba(245,241,237,0.25)" multiline style={[sheetStyles.input, { minHeight: 80 }]} />
          <TextInput value={stack} onChangeText={setStack} placeholder="Tech stack (separado por vírgula)" placeholderTextColor="rgba(245,241,237,0.25)" style={sheetStyles.input} />
          <TextInput value={link} onChangeText={setLink} placeholder="Link (opcional)" placeholderTextColor="rgba(245,241,237,0.25)" autoCapitalize="none" keyboardType="url" style={sheetStyles.input} />
          <Pressable onPress={salvar} disabled={!nome.trim()} style={({ pressed }) => [sheetStyles.salvarBtn, pressed && { opacity: 0.85 }, !nome.trim() && { opacity: 0.4 }]}>
            <ThemedText type="default" style={{ color: '#1C1917', fontWeight: '600' }}>Criar</ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: Spacing.three, gap: Spacing.three, paddingBottom: 140 },
  header: { paddingTop: Spacing.two, gap: 2 },
  emptyCard: { padding: Spacing.three, borderRadius: Radius.lg },
  projetoCard: { padding: Spacing.three, borderRadius: Radius.lg, gap: Spacing.two },
  projetoHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.sm },
  statusText: { fontSize: 10, letterSpacing: 0.4 },
  progressBar: { height: 4, backgroundColor: 'rgba(245,241,237,0.08)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  projetoMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaText: { fontSize: 11, color: 'rgba(245,241,237,0.45)' },
  fab: {
    position: 'absolute', right: Spacing.three, bottom: 100, width: 56, height: 56, borderRadius: 28,
    backgroundColor: Warm.peach, alignItems: 'center', justifyContent: 'center',
    shadowColor: Warm.peach, shadowOpacity: 0.45, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
});

const sheetStyles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: '#1C1917' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.three, paddingTop: Spacing.four, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(245,241,237,0.08)' },
  body: { padding: Spacing.three, gap: Spacing.three },
  input: { backgroundColor: 'rgba(245,241,237,0.06)', borderRadius: Radius.md, padding: Spacing.three, color: '#F5F1ED', fontSize: 15 },
  salvarBtn: { backgroundColor: Modules.projetos.accent, borderRadius: Radius.md, padding: Spacing.three, alignItems: 'center', marginTop: Spacing.two },
});
