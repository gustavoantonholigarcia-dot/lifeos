import * as Haptics from 'expo-haptics';
import { Check, Plus, X } from 'lucide-react-native';
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
import { Modules, Radius, Spacing, Warm } from '@/constants/theme';
import {
  CATEGORIAS,
  CATEGORIA_CONFIG,
  useChecklist,
  useCriarItem,
  useToggleItem,
  type CategoriaIntercambio,
} from '@/modules/intercambio/queries';

export default function IntercambioScreen() {
  const { data: itens } = useChecklist();
  const toggle = useToggleItem();
  const [formOpen, setFormOpen] = useState(false);

  const porCategoria = CATEGORIAS.map((cat) => ({
    ...CATEGORIA_CONFIG[cat],
    categoria: cat,
    itens: (itens ?? []).filter((i) => i.categoria === cat),
  }));

  const total = itens?.length ?? 0;
  const concluidos = itens?.filter((i) => i.concluido).length ?? 0;

  function handleToggle(id: string, atual: boolean) {
    Haptics.impactAsync(
      atual ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium,
    );
    toggle.mutate({ id, concluido: !atual });
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ModuleHeader
            module="intercambio"
            eyebrow={total > 0 ? `${concluidos}/${total} concluídos` : 'Planejamento'}>
            {total > 0 && (
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${total > 0 ? (concluidos / total) * 100 : 0}%` },
                  ]}
                />
              </View>
            )}
          </ModuleHeader>

          {porCategoria.map((grupo) => (
            <ThemedView key={grupo.categoria} type="backgroundElement" style={styles.card}>
              <View style={styles.catHeader}>
                <View style={[styles.catDot, { backgroundColor: grupo.cor }]} />
                <ThemedText type="meta" themeColor="textSecondary">
                  {grupo.label}
                </ThemedText>
                <ThemedText type="mono" style={styles.catCount}>
                  {grupo.itens.filter((i) => i.concluido).length}/{grupo.itens.length}
                </ThemedText>
              </View>

              {grupo.itens.length === 0 && (
                <ThemedText type="small" themeColor="textMuted" style={{ marginTop: Spacing.one }}>
                  Nenhum item.
                </ThemedText>
              )}

              {grupo.itens.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleToggle(item.id, item.concluido)}
                  style={styles.itemRow}>
                  <View style={[styles.check, item.concluido && { backgroundColor: grupo.cor, borderColor: grupo.cor }]}>
                    {item.concluido && <Check size={12} color={'#1C1917' as any} strokeWidth={3} />}
                  </View>
                  <ThemedText
                    type="default"
                    style={[{ flex: 1 }, item.concluido && styles.textDone]}
                    numberOfLines={2}>
                    {item.item}
                  </ThemedText>
                </Pressable>
              ))}
            </ThemedView>
          ))}
        </ScrollView>

        <Pressable
          onPress={() => setFormOpen(true)}
          style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}>
          <Plus color={'#1C1917' as any} size={22} />
        </Pressable>

        {formOpen && <NovoItemSheet onClose={() => setFormOpen(false)} />}
      </SafeAreaView>
    </ThemedView>
  );
}

function NovoItemSheet({ onClose }: { onClose: () => void }) {
  const [categoria, setCategoria] = useState<CategoriaIntercambio>('documentos');
  const [item, setItem] = useState('');
  const criar = useCriarItem();

  async function salvar() {
    if (!item.trim()) return;
    await criar.mutateAsync({ categoria, item: item.trim() });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setItem('');
    onClose();
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={sheetStyles.sheet}>
        <View style={sheetStyles.header}>
          <ThemedText type="titleMD" style={{ color: '#F5F1ED' }}>Novo item</ThemedText>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={22} color={'rgba(245,241,237,0.65)' as any} />
          </Pressable>
        </View>
        <View style={sheetStyles.body}>
          <ThemedText type="meta" style={sheetStyles.label}>Categoria</ThemedText>
          <View style={sheetStyles.cats}>
            {CATEGORIAS.map((c) => {
              const cfg = CATEGORIA_CONFIG[c];
              const ativo = categoria === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => setCategoria(c)}
                  style={[sheetStyles.catBtn, ativo && { backgroundColor: cfg.cor + '25', borderColor: cfg.cor }]}>
                  <ThemedText type="default" style={[{ fontSize: 13 }, ativo && { color: cfg.cor }]}>
                    {cfg.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <ThemedText type="meta" style={sheetStyles.label}>Item</ThemedText>
          <TextInput value={item} onChangeText={setItem} placeholder="Ex: Tirar passaporte" placeholderTextColor="rgba(245,241,237,0.25)" style={sheetStyles.input} />

          <Pressable onPress={salvar} disabled={!item.trim()} style={({ pressed }) => [sheetStyles.salvarBtn, pressed && { opacity: 0.85 }, !item.trim() && { opacity: 0.4 }]}>
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
  progressBar: { height: 6, backgroundColor: 'rgba(245,241,237,0.08)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: Modules.intercambio.accent },
  card: { padding: Spacing.three, borderRadius: Radius.lg, gap: Spacing.one },
  catHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catCount: { fontSize: 10, color: 'rgba(245,241,237,0.35)', marginLeft: 'auto' },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(245,241,237,0.08)',
  },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: 'rgba(245,241,237,0.30)', alignItems: 'center', justifyContent: 'center' },
  textDone: { color: 'rgba(245,241,237,0.40)', textDecorationLine: 'line-through' },
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
  label: { color: 'rgba(245,241,237,0.55)', textTransform: 'uppercase', letterSpacing: 0.6 },
  cats: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  catBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(245,241,237,0.10)', backgroundColor: 'rgba(245,241,237,0.04)' },
  input: { backgroundColor: 'rgba(245,241,237,0.06)', borderRadius: Radius.md, padding: Spacing.three, color: '#F5F1ED', fontSize: 15 },
  salvarBtn: { backgroundColor: Modules.intercambio.accent, borderRadius: Radius.md, padding: Spacing.three, alignItems: 'center', marginTop: Spacing.two },
});
