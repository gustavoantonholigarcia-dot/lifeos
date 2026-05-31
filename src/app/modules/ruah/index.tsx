import * as Haptics from 'expo-haptics';
import { Lightbulb, Plus, Users, X } from 'lucide-react-native';
import { useState } from 'react';
import {
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
import { Modules, Radius, Spacing } from '@/constants/theme';
import {
  useAtualizarIdeia,
  useCriarIdeia,
  useCriarReuniao,
  useIdeias,
  useReunioes,
  type Ideia,
} from '@/modules/ruah/queries';

type FormType = 'reuniao' | 'ideia' | null;

const STATUS_LABELS: Record<string, string> = {
  ideia: 'Ideia',
  aprovada: 'Aprovada',
  em_andamento: 'Em andamento',
  feita: 'Feita',
};

const STATUS_CORES: Record<string, string> = {
  ideia: 'rgba(245,241,237,0.40)',
  aprovada: '#6B8FB8',
  em_andamento: '#E8A845',
  feita: '#8FA899',
};

export default function RuahScreen() {
  const { data: reunioes } = useReunioes();
  const { data: ideias } = useIdeias();
  const atualizarIdeia = useAtualizarIdeia();
  const [formType, setFormType] = useState<FormType>(null);

  function ciclarStatus(ideia: Ideia) {
    const seq = ['ideia', 'aprovada', 'em_andamento', 'feita'];
    const idx = seq.indexOf(ideia.status);
    const proximo = seq[(idx + 1) % seq.length];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    atualizarIdeia.mutate({ id: ideia.id, patch: { status: proximo } });
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          <ModuleHeader module="ruah" eyebrow="Igreja · Ministério" />

          {/* Reuniões */}
          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Users size={14} color={'rgba(245,241,237,0.55)' as any} />
                <ThemedText type="meta" themeColor="textSecondary">
                  Reuniões
                </ThemedText>
              </View>
              <Pressable onPress={() => setFormType('reuniao')} hitSlop={10}>
                <Plus size={16} color={'rgba(245,241,237,0.50)' as any} />
              </Pressable>
            </View>
            {(!reunioes || reunioes.length === 0) && (
              <ThemedText type="default" themeColor="textMuted" style={{ marginTop: Spacing.two }}>
                Nenhuma reunião registrada.
              </ThemedText>
            )}
            {reunioes?.map((r) => (
              <View key={r.id} style={styles.itemRow}>
                <View style={{ flex: 1, gap: 2 }}>
                  <ThemedText type="default">{r.titulo}</ThemedText>
                  <View style={styles.itemMeta}>
                    {r.data && (
                      <ThemedText type="mono" style={styles.metaText}>
                        {new Date(r.data).toLocaleDateString('pt-BR')}
                      </ThemedText>
                    )}
                    {r.local && (
                      <ThemedText type="mono" style={styles.metaText}>
                        {r.local}
                      </ThemedText>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </ThemedView>

          {/* Ideias */}
          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Lightbulb size={14} color={'rgba(245,241,237,0.55)' as any} />
                <ThemedText type="meta" themeColor="textSecondary">
                  Ideias
                </ThemedText>
              </View>
              <Pressable onPress={() => setFormType('ideia')} hitSlop={10}>
                <Plus size={16} color={'rgba(245,241,237,0.50)' as any} />
              </Pressable>
            </View>
            {(!ideias || ideias.length === 0) && (
              <ThemedText type="default" themeColor="textMuted" style={{ marginTop: Spacing.two }}>
                Nenhuma ideia registrada.
              </ThemedText>
            )}
            {ideias?.map((ideia) => (
              <Pressable
                key={ideia.id}
                onPress={() => ciclarStatus(ideia)}
                style={styles.itemRow}>
                <View style={{ flex: 1, gap: 2 }}>
                  <ThemedText type="default">{ideia.titulo}</ThemedText>
                  {ideia.descricao && (
                    <ThemedText type="small" themeColor="textMuted" numberOfLines={2}>
                      {ideia.descricao}
                    </ThemedText>
                  )}
                </View>
                <View style={[styles.statusPill, { backgroundColor: STATUS_CORES[ideia.status] + '22' }]}>
                  <ThemedText type="mono" style={[styles.statusText, { color: STATUS_CORES[ideia.status] }]}>
                    {STATUS_LABELS[ideia.status] ?? ideia.status}
                  </ThemedText>
                </View>
              </Pressable>
            ))}
          </ThemedView>
        </ScrollView>

        {formType === 'reuniao' && (
          <NovaReuniaoSheet onClose={() => setFormType(null)} />
        )}
        {formType === 'ideia' && (
          <NovaIdeiaSheet onClose={() => setFormType(null)} />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function NovaReuniaoSheet({ onClose }: { onClose: () => void }) {
  const [titulo, setTitulo] = useState('');
  const [local, setLocal] = useState('');
  const criar = useCriarReuniao();

  async function salvar() {
    if (!titulo.trim()) return;
    await criar.mutateAsync({ titulo: titulo.trim(), local: local.trim() || undefined });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={sheetStyles.sheet}>
        <View style={sheetStyles.header}>
          <ThemedText type="titleMD" style={{ color: '#F5F1ED' }}>Nova reunião</ThemedText>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={22} color={'rgba(245,241,237,0.65)' as any} />
          </Pressable>
        </View>
        <View style={sheetStyles.body}>
          <TextInput value={titulo} onChangeText={setTitulo} placeholder="Título" placeholderTextColor="rgba(245,241,237,0.25)" style={sheetStyles.input} />
          <TextInput value={local} onChangeText={setLocal} placeholder="Local (opcional)" placeholderTextColor="rgba(245,241,237,0.25)" style={sheetStyles.input} />
          <Pressable onPress={salvar} disabled={!titulo.trim()} style={({ pressed }) => [sheetStyles.salvarBtn, pressed && { opacity: 0.85 }, !titulo.trim() && { opacity: 0.4 }]}>
            <ThemedText type="default" style={{ color: '#1C1917', fontWeight: '600' }}>Adicionar</ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function NovaIdeiaSheet({ onClose }: { onClose: () => void }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const criar = useCriarIdeia();

  async function salvar() {
    if (!titulo.trim()) return;
    await criar.mutateAsync({ titulo: titulo.trim(), descricao: descricao.trim() || undefined });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={sheetStyles.sheet}>
        <View style={sheetStyles.header}>
          <ThemedText type="titleMD" style={{ color: '#F5F1ED' }}>Nova ideia</ThemedText>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={22} color={'rgba(245,241,237,0.65)' as any} />
          </Pressable>
        </View>
        <View style={sheetStyles.body}>
          <TextInput value={titulo} onChangeText={setTitulo} placeholder="Título" placeholderTextColor="rgba(245,241,237,0.25)" style={sheetStyles.input} />
          <TextInput value={descricao} onChangeText={setDescricao} placeholder="Descrição (opcional)" placeholderTextColor="rgba(245,241,237,0.25)" multiline style={[sheetStyles.input, { minHeight: 80 }]} />
          <Pressable onPress={salvar} disabled={!titulo.trim()} style={({ pressed }) => [sheetStyles.salvarBtn, pressed && { opacity: 0.85 }, !titulo.trim() && { opacity: 0.4 }]}>
            <ThemedText type="default" style={{ color: '#1C1917', fontWeight: '600' }}>Adicionar</ThemedText>
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
  card: { padding: Spacing.three, borderRadius: Radius.lg, gap: Spacing.one },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(245,241,237,0.08)',
  },
  itemMeta: { flexDirection: 'row', gap: 8 },
  metaText: { fontSize: 11, color: 'rgba(245,241,237,0.45)' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.sm },
  statusText: { fontSize: 10, letterSpacing: 0.4 },
});

const sheetStyles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: '#1C1917' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.three, paddingTop: Spacing.four, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(245,241,237,0.08)' },
  body: { padding: Spacing.three, gap: Spacing.three },
  input: { backgroundColor: 'rgba(245,241,237,0.06)', borderRadius: Radius.md, padding: Spacing.three, color: '#F5F1ED', fontSize: 15 },
  salvarBtn: { backgroundColor: Modules.ruah.accent, borderRadius: Radius.md, padding: Spacing.three, alignItems: 'center', marginTop: Spacing.two },
});
