import { Image } from 'expo-image';
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

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Modules, Radius, Spacing } from '@/constants/theme';
import { useConcluirTarefa } from '@/modules/tawa/queries';
import { PRIORIDADE_CORES, type Tarefa } from '@/modules/tawa/types';
import { formatarPrazoRelativo } from '@/shared/format/date';
import {
  useCriarDisciplina,
  useDisciplinas,
  useTarefasUtfpr,
  type Disciplina,
} from '@/modules/utfpr/queries';
import { Check } from 'lucide-react-native';

export default function UtfprScreen() {
  const { data: disciplinas } = useDisciplinas();
  const { data: tarefas } = useTarefasUtfpr();
  const concluir = useConcluirTarefa();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          {/* Header com logo */}
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Image
                source={require('@/assets/logos/utfpr.png')}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <ThemedText type="meta" themeColor="textSecondary">
                Universidade · Eng. Produção
              </ThemedText>
              <ThemedText type="displayLG">{Modules.utfpr.label}</ThemedText>
              <ThemedText type="small" themeColor="textMuted">
                Londrina · 2026.1
              </ThemedText>
            </View>
          </View>

          {/* Disciplinas */}
          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText type="meta" themeColor="textSecondary">
                01 · Disciplinas · 2026.1
              </ThemedText>
              <Pressable onPress={() => setFormOpen(true)} hitSlop={10}>
                <Plus size={16} color={'rgba(245,241,237,0.50)' as any} />
              </Pressable>
            </View>
            <View style={{ gap: Spacing.two, marginTop: Spacing.two }}>
              {(!disciplinas || disciplinas.length === 0) && (
                <ThemedText type="default" themeColor="textMuted">
                  Nenhuma disciplina. Toque + para adicionar.
                </ThemedText>
              )}
              {disciplinas?.map((d) => (
                <DisciplinaRow key={d.id} disciplina={d} />
              ))}
            </View>
          </ThemedView>

          {/* Tarefas UTFPR pendentes */}
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="meta" themeColor="textSecondary">
              02 · Tarefas pendentes
            </ThemedText>
            <View style={{ gap: Spacing.two, marginTop: Spacing.two }}>
              {(!tarefas || tarefas.length === 0) && (
                <ThemedText type="default" themeColor="textMuted">
                  Nenhuma tarefa UTFPR pendente.
                </ThemedText>
              )}
              {tarefas?.map((t) => (
                <TarefaUtfprRow
                  key={t.id}
                  tarefa={t}
                  onConcluir={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    concluir(t.id);
                  }}
                />
              ))}
            </View>
          </ThemedView>

          {/* Atalhos */}
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="meta" themeColor="textSecondary">
              03 · Atalhos
            </ThemedText>
            <View style={{ gap: Spacing.one, marginTop: Spacing.two }}>
              <AtalhoRow
                titulo="Moodle UTFPR"
                subtitulo="moodle.utfpr.edu.br"
                onPress={() => Linking.openURL('https://moodle.utfpr.edu.br/')}
              />
            </View>
          </ThemedView>
        </ScrollView>

        <NovaDisciplinaSheet visible={formOpen} onClose={() => setFormOpen(false)} />
      </SafeAreaView>
    </ThemedView>
  );
}

function DisciplinaRow({ disciplina }: { disciplina: Disciplina }) {
  return (
    <View style={styles.disciplinaRow}>
      <View style={[styles.disciplinaDot, { backgroundColor: disciplina.cor }]} />
      <View style={{ flex: 1 }}>
        <ThemedText type="default" style={{ fontWeight: '500' }}>
          {disciplina.nome}
        </ThemedText>
        {disciplina.codigo && (
          <ThemedText type="mono" style={styles.codigoText}>
            {disciplina.codigo}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

function TarefaUtfprRow({ tarefa, onConcluir }: { tarefa: Tarefa; onConcluir: () => void }) {
  const prazo = tarefa.prazo_em ? formatarPrazoRelativo(tarefa.prazo_em) : null;
  const cor = PRIORIDADE_CORES[tarefa.prioridade];

  return (
    <View style={styles.tarefaRow}>
      <Pressable
        onPress={onConcluir}
        hitSlop={8}
        style={({ pressed }) => [styles.check, pressed && { transform: [{ scale: 0.92 }] }]}>
        {null}
      </Pressable>
      <View style={{ flex: 1, gap: 2 }}>
        <ThemedText type="default" numberOfLines={2}>
          {tarefa.titulo}
        </ThemedText>
        {prazo && (
          <ThemedText type="mono" style={[styles.metaText, { color: cor }]}>
            {prazo.texto}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

function AtalhoRow({
  titulo,
  subtitulo,
  onPress,
}: {
  titulo: string;
  subtitulo: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.atalhoRow, pressed && { opacity: 0.7 }]}>
      <View style={{ flex: 1 }}>
        <ThemedText type="default">{titulo}</ThemedText>
        <ThemedText type="small" themeColor="textMuted">
          {subtitulo}
        </ThemedText>
      </View>
      <ExternalLink size={16} color={'rgba(245,241,237,0.45)' as any} />
    </Pressable>
  );
}

function NovaDisciplinaSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [cor, setCor] = useState('#3B82F6');
  const criar = useCriarDisciplina();

  const CORES = ['#3B82F6', '#A855F7', '#22C55E', '#E8A845', '#E04830', '#6B8FB8'];

  async function salvar() {
    if (!nome.trim()) return;
    await criar.mutateAsync({ nome: nome.trim(), codigo: codigo.trim() || undefined, cor });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNome('');
    setCodigo('');
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
            Nova disciplina
          </ThemedText>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={22} color={'rgba(245,241,237,0.65)' as any} />
          </Pressable>
        </View>
        <View style={sheetStyles.body}>
          <ThemedText type="meta" style={sheetStyles.label}>Nome</ThemedText>
          <TextInput
            value={nome}
            onChangeText={setNome}
            placeholder="Computação I"
            placeholderTextColor="rgba(245,241,237,0.25)"
            style={sheetStyles.input}
          />

          <ThemedText type="meta" style={sheetStyles.label}>Código</ThemedText>
          <TextInput
            value={codigo}
            onChangeText={setCodigo}
            placeholder="IF61A"
            placeholderTextColor="rgba(245,241,237,0.25)"
            autoCapitalize="characters"
            style={sheetStyles.input}
          />

          <ThemedText type="meta" style={sheetStyles.label}>Cor</ThemedText>
          <View style={sheetStyles.cores}>
            {CORES.map((c) => (
              <Pressable
                key={c}
                onPress={() => setCor(c)}
                style={[
                  sheetStyles.corBtn,
                  { backgroundColor: c },
                  cor === c && sheetStyles.corAtiva,
                ]}
              />
            ))}
          </View>

          <Pressable
            onPress={salvar}
            disabled={criar.isPending || !nome.trim()}
            style={({ pressed }) => [
              sheetStyles.salvarBtn,
              pressed && { opacity: 0.85 },
              (!nome.trim()) && { opacity: 0.4 },
            ]}>
            <ThemedText type="default" style={{ color: '#1C1917', fontWeight: '600' }}>
              {criar.isPending ? 'Salvando...' : 'Adicionar'}
            </ThemedText>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: 'white',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: '100%', height: '100%' },
  card: { padding: Spacing.three, borderRadius: Radius.lg },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disciplinaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    paddingHorizontal: Spacing.three,
    backgroundColor: 'rgba(245,241,237,0.04)',
    borderRadius: Radius.md,
  },
  disciplinaDot: { width: 8, height: 8, borderRadius: 4 },
  codigoText: { fontSize: 11, color: 'rgba(245,241,237,0.45)', letterSpacing: 0.5 },
  tarefaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    paddingHorizontal: Spacing.three,
    backgroundColor: 'rgba(245,241,237,0.04)',
    borderRadius: Radius.md,
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
  metaText: { fontSize: 11 },
  atalhoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    paddingHorizontal: Spacing.three,
    backgroundColor: 'rgba(245,241,237,0.04)',
    borderRadius: Radius.md,
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
  input: {
    backgroundColor: 'rgba(245,241,237,0.06)',
    borderRadius: Radius.md,
    padding: Spacing.three,
    color: '#F5F1ED',
    fontSize: 15,
  },
  cores: { flexDirection: 'row', gap: Spacing.two },
  corBtn: { width: 32, height: 32, borderRadius: 16 },
  corAtiva: { borderWidth: 3, borderColor: '#F5F1ED' },
  salvarBtn: {
    backgroundColor: Modules.utfpr.accent,
    borderRadius: Radius.md,
    padding: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
});
