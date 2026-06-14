import * as Haptics from 'expo-haptics';
import { Archive, Compass, Plus, X } from 'lucide-react-native';
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

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing, Warm } from '@/constants/theme';

import {
  CICLOS,
  MAX_ATIVOS,
  dataLocalISO,
  diasRestantes,
  prazoAPartirDeHoje,
  ultimosDias,
  useAtualizarCompromisso,
  useAvancos,
  useCompromissos,
  useCriarCompromisso,
  useDeletarCompromisso,
  useNorte,
  useSalvarNorte,
  useToggleAvanco,
  type Compromisso,
} from './queries';

const HONEY = Warm.honey;

export function CompromissosSection() {
  const { data } = useCompromissos();
  const { data: norte } = useNorte();
  const { data: avancos } = useAvancos();
  const salvarNorte = useSalvarNorte();
  const atualizar = useAtualizarCompromisso();
  const toggleAvanco = useToggleAvanco();
  const [sheetOpen, setSheetOpen] = useState(false);

  const todos = data ?? [];
  const ativos = todos.filter((c) => c.status === 'ativa');
  const fila = todos.filter((c) => c.status === 'fila');
  const hoje = dataLocalISO();

  function editarNorte() {
    Alert.prompt(
      'Norte',
      'A direção maior que filtra todo o resto. Uma frase.',
      (texto) => {
        if (texto != null) salvarNorte.mutate(texto);
      },
      'plain-text',
      norte?.texto ?? '',
    );
  }

  // Toque na linha = gerenciar (concluir / abandonar). Abandono tem custo visível.
  function gerenciar(c: Compromisso) {
    const dias = c.prazo_em ? diasRestantes(c.prazo_em) : null;
    const custo =
      dias != null && dias > 0 ? `Faltam ${dias} dia${dias === 1 ? '' : 's'}. ` : '';
    Alert.alert(c.titulo, 'Esse compromisso precisa acontecer. O que houve?', [
      {
        text: 'Cumprido — concluir',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          atualizar.mutate({
            id: c.id,
            patch: { status: 'concluida', encerrada_em: new Date().toISOString() },
          });
        },
      },
      {
        text: 'Abandonar',
        style: 'destructive',
        onPress: () =>
          Alert.alert(
            'Abandonar compromisso',
            `${custo}Abandonar conscientemente é melhor que deixar morrer em silêncio — mas é uma decisão, não um alívio.`,
            [
              { text: 'Manter', style: 'cancel' },
              {
                text: 'Abandonar',
                style: 'destructive',
                onPress: () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  atualizar.mutate({
                    id: c.id,
                    patch: { status: 'abandonada', encerrada_em: new Date().toISOString() },
                  });
                },
              },
            ],
          ),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function marcarHoje(c: Compromisso) {
    const marcado = (avancos?.[c.id] ?? []).includes(hoje);
    Haptics.impactAsync(
      marcado ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium,
    );
    toggleAvanco.mutate({ compromisso_id: c.id, marcado });
  }

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="meta" themeColor="textSecondary">
          01 · O que precisa acontecer
        </ThemedText>
        <Pressable onPress={() => setSheetOpen(true)} hitSlop={8} style={styles.filaBtn}>
          <Archive size={12} color={'rgba(245,241,237,0.50)' as any} />
          <ThemedText type="mono" style={styles.filaBtnTexto}>
            fila {fila.length}
          </ThemedText>
        </Pressable>
      </View>

      {/* Norte — a direção que filtra o resto */}
      <Pressable
        onPress={editarNorte}
        style={({ pressed }) => [styles.norteRow, pressed && { opacity: 0.7 }]}>
        <Compass size={14} color={HONEY as any} />
        {norte?.texto ? (
          <ThemedText type="default" style={styles.norteTexto} numberOfLines={2}>
            {norte.texto}
          </ThemedText>
        ) : (
          <ThemedText type="small" themeColor="textMuted" style={{ flex: 1 }}>
            Definir seu norte — a direção que filtra todo o resto
          </ThemedText>
        )}
      </Pressable>

      {ativos.length === 0 && (
        <ThemedText type="default" themeColor="textMuted" style={styles.empty}>
          Nada ativo. O que precisa acontecer?
        </ThemedText>
      )}

      {ativos.map((c) => {
        const dias = c.prazo_em ? diasRestantes(c.prazo_em) : null;
        const vencido = dias != null && dias < 0;
        const diasAvanco = avancos?.[c.id] ?? [];
        const marcadoHoje = diasAvanco.includes(hoje);
        return (
          <View key={c.id} style={styles.linha}>
            {/* Avancei hoje — o toque diário de constância */}
            <Pressable
              onPress={() => marcarHoje(c)}
              hitSlop={8}
              style={({ pressed }) => [
                styles.checkHoje,
                marcadoHoje && { backgroundColor: HONEY, borderColor: HONEY },
                pressed && { transform: [{ scale: 0.92 }] },
              ]}>
              {marcadoHoje && (
                <ThemedText type="mono" style={styles.checkHojeTexto}>
                  ✓
                </ThemedText>
              )}
            </Pressable>

            <Pressable style={styles.corpo} onPress={() => gerenciar(c)}>
              <ThemedText type="default" numberOfLines={2}>
                {c.titulo}
              </ThemedText>
              <View style={styles.metaRow}>
                {/* Constância: últimos 7 dias */}
                <View style={styles.dotsRow}>
                  {ultimosDias(7).map((d) => (
                    <View
                      key={d}
                      style={[
                        styles.dot,
                        diasAvanco.includes(d)
                          ? { backgroundColor: HONEY }
                          : { backgroundColor: 'rgba(245,241,237,0.12)' },
                      ]}
                    />
                  ))}
                </View>
                {dias != null && (
                  <ThemedText
                    type="mono"
                    style={[styles.prazoTexto, vencido && { color: '#E04830' }]}>
                    {vencido ? `venceu há ${Math.abs(dias)}d` : `${dias}d`}
                  </ThemedText>
                )}
              </View>
            </Pressable>
          </View>
        );
      })}

      <Pressable
        onPress={() => setSheetOpen(true)}
        style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.6 }]}>
        <Plus size={15} color={HONEY as any} />
        <ThemedText type="small" style={{ color: HONEY }}>
          Novo compromisso
        </ThemedText>
      </Pressable>

      <CompromissosSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        fila={fila}
        vagas={MAX_ATIVOS - ativos.length}
      />
    </ThemedView>
  );
}

// ============================================================================
// Sheet: criar compromisso + gerenciar a fila
// ============================================================================
function CompromissosSheet({
  visible,
  onClose,
  fila,
  vagas,
}: {
  visible: boolean;
  onClose: () => void;
  fila: Compromisso[];
  vagas: number;
}) {
  const criar = useCriarCompromisso();
  const atualizar = useAtualizarCompromisso();
  const deletar = useDeletarCompromisso();
  const [titulo, setTitulo] = useState('');
  const [cicloDias, setCicloDias] = useState(14);

  const temVaga = vagas > 0;

  async function criarNaFila() {
    if (!titulo.trim() || criar.isPending) return;
    await criar.mutateAsync({ titulo: titulo.trim(), status: 'fila' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTitulo('');
  }

  async function criarAtivo() {
    // isPending bloqueia toque duplo — senão furaria o limite de 3 ativos
    if (!titulo.trim() || !temVaga || criar.isPending) return;
    await criar.mutateAsync({
      titulo: titulo.trim(),
      status: 'ativa',
      prazo_em: prazoAPartirDeHoje(cicloDias),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTitulo('');
    onClose();
  }

  function ativarDaFila(c: Compromisso) {
    if (!temVaga) {
      Alert.alert(
        'Sem vaga',
        `Você já tem ${MAX_ATIVOS} compromissos ativos. Conclua ou abandone um antes — é essa regra que protege sua energia.`,
      );
      return;
    }
    Alert.alert('Qual o prazo?', c.titulo, [
      ...CICLOS.map((ciclo) => ({
        text: ciclo.label,
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          atualizar.mutate({
            id: c.id,
            patch: {
              status: 'ativa',
              prazo_em: prazoAPartirDeHoje(ciclo.dias),
              ativada_em: new Date().toISOString(),
            },
          });
        },
      })),
      { text: 'Cancelar', style: 'cancel' as const },
    ]);
  }

  function apagarDaFila(c: Compromisso) {
    Alert.alert('Apagar da fila', `Apagar "${c.titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => deletar.mutate(c.id) },
    ]);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <ThemedText type="titleMD" style={{ color: '#F5F1ED' }}>
            Compromissos
          </ThemedText>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={22} color={'rgba(245,241,237,0.65)' as any} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.sheetBody}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}>
          <ThemedText type="small" themeColor="textMuted">
            O que precisa acontecer — no máximo {MAX_ATIVOS} ao mesmo tempo. Ideias
            e o resto esperam na fila, fora da sua cabeça.
          </ThemedText>

          <TextInput
            value={titulo}
            onChangeText={setTitulo}
            placeholder="O que precisa acontecer? (ex: fechar 10 empenhos CIGEDAS)"
            placeholderTextColor="rgba(245,241,237,0.25)"
            multiline
            style={styles.input}
          />

          <View style={styles.ciclosRow}>
            {CICLOS.map((c) => {
              const ativo = cicloDias === c.dias;
              return (
                <Pressable
                  key={c.dias}
                  onPress={() => setCicloDias(c.dias)}
                  style={({ pressed }) => [
                    styles.cicloChip,
                    ativo && { backgroundColor: HONEY + '22', borderColor: HONEY },
                    pressed && { opacity: 0.7 },
                  ]}>
                  <ThemedText
                    type="mono"
                    style={[styles.cicloChipTexto, ativo && { color: HONEY }]}>
                    {c.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.btnsRow}>
            <Pressable
              onPress={criarNaFila}
              disabled={!titulo.trim()}
              style={({ pressed }) => [
                styles.btnFila,
                pressed && { opacity: 0.7 },
                !titulo.trim() && { opacity: 0.35 },
              ]}>
              <ThemedText type="small" themeColor="textSecondary">
                Pra fila
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={criarAtivo}
              disabled={!titulo.trim() || !temVaga}
              style={({ pressed }) => [
                styles.btnAtivar,
                pressed && { opacity: 0.85 },
                (!titulo.trim() || !temVaga) && { opacity: 0.35 },
              ]}>
              <ThemedText type="small" style={{ color: '#1C1917', fontWeight: '600' }}>
                {temVaga ? 'Assumir agora' : 'Sem vaga'}
              </ThemedText>
            </Pressable>
          </View>

          {fila.length > 0 && (
            <View style={{ gap: Spacing.two, marginTop: Spacing.two }}>
              <ThemedText type="meta" themeColor="textSecondary">
                FILA · {fila.length}
              </ThemedText>
              {fila.map((c) => (
                <View key={c.id} style={styles.filaItem}>
                  <ThemedText type="default" style={{ flex: 1 }} numberOfLines={2}>
                    {c.titulo}
                  </ThemedText>
                  <Pressable
                    onPress={() => ativarDaFila(c)}
                    hitSlop={6}
                    style={({ pressed }) => [
                      styles.filaAtivar,
                      pressed && { opacity: 0.7 },
                      !temVaga && { opacity: 0.4 },
                    ]}>
                    <ThemedText type="mono" style={{ fontSize: 11, color: HONEY }}>
                      Assumir
                    </ThemedText>
                  </Pressable>
                  <Pressable onPress={() => apagarDaFila(c)} hitSlop={6}>
                    <X size={14} color={'rgba(245,241,237,0.35)' as any} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
    borderRadius: Radius.lg,
    gap: Spacing.two,
    borderLeftWidth: 2,
    borderLeftColor: HONEY,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(245,241,237,0.06)',
  },
  filaBtnTexto: { fontSize: 10, color: 'rgba(245,241,237,0.50)' },

  norteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  norteTexto: {
    flex: 1,
    fontFamily: 'Spectral-Italic',
    fontSize: 15,
    color: 'rgba(245,241,237,0.85)',
  },

  empty: { fontSize: 14, marginTop: Spacing.one },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(245,241,237,0.08)',
  },
  checkHoje: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: 'rgba(245,241,237,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkHojeTexto: { fontSize: 12, color: '#1C1917', fontWeight: '700' },
  corpo: { flex: 1, gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  dotsRow: { flexDirection: 'row', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  prazoTexto: { fontSize: 10, color: HONEY },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(245,241,237,0.08)',
  },

  // Sheet
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
  sheetBody: { padding: Spacing.three, gap: Spacing.three, paddingBottom: 80 },
  input: {
    backgroundColor: 'rgba(245,241,237,0.06)',
    borderRadius: Radius.md,
    padding: Spacing.three,
    color: '#F5F1ED',
    fontSize: 15,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  ciclosRow: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
  cicloChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(245,241,237,0.12)',
  },
  cicloChipTexto: { fontSize: 11, color: 'rgba(245,241,237,0.55)' },
  btnsRow: { flexDirection: 'row', gap: Spacing.two },
  btnFila: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(245,241,237,0.15)',
  },
  btnAtivar: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: Radius.md,
    backgroundColor: HONEY,
  },
  filaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'rgba(245,241,237,0.04)',
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  filaAtivar: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: HONEY + '55',
  },
});
