import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Plus, X } from 'lucide-react-native';
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

import { Fab } from '@/components/fab';
import { ModuleHeader } from '@/components/module-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Modules, Radius, Spacing } from '@/constants/theme';
import { formatarDataCurta } from '@/shared/format/date';
import {
  ESTAGIO_CORES,
  ESTAGIO_LABELS,
  TIPO_LABELS,
  useCriarIdeia,
  useDeletarIdeia,
  useIdeias,
  type EstagioIdeia,
  type TipoIdeia,
} from '@/modules/ideias/queries';

/** Marcador de maturidade: 3 segmentos que enchem (semente→validando→tocando). */
function MaturidadeMarca({ estagio, cor }: { estagio: EstagioIdeia; cor: string }) {
  const nivel = estagio === 'semente' ? 1 : estagio === 'validando' ? 2 : estagio === 'tocando' ? 3 : 0;
  return (
    <View style={styles.maturidade}>
      {[0, 1, 2].map((seg) => (
        <View
          key={seg}
          style={[
            styles.matSeg,
            { backgroundColor: seg < nivel ? cor : 'rgba(245,241,237,0.12)' },
          ]}
        />
      ))}
    </View>
  );
}

export default function IdeiasScreen() {
  const { data: ideias } = useIdeias();
  const deletar = useDeletarIdeia();
  const [formOpen, setFormOpen] = useState(false);

  const total = ideias?.length ?? 0;

  function confirmarApagar(id: string, nome: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Apagar ideia', `Apagar "${nome}"? Isso não volta.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => deletar.mutate(id) },
    ]);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ModuleHeader
            module="ideias"
            eyebrow="Startups · empresas futuras"
            title="Ideias"
          />

          {total > 0 && (
            <ThemedText type="small" themeColor="textMuted" style={styles.dica}>
              Toque pra abrir · segure pra apagar
            </ThemedText>
          )}

          {total === 0 && (
            <ThemedView type="backgroundElement" style={styles.emptyCard}>
              <ThemedText type="default">Nenhuma ideia ainda.</ThemedText>
              <ThemedText type="small" themeColor="textMuted">
                Viu uma empresa ou problema que te empolgou? Toque + e guarde
                antes de esquecer.
              </ThemedText>
            </ThemedView>
          )}

          {ideias?.map((ideia, i) => {
            const cor = ESTAGIO_CORES[ideia.estagio];
            return (
              <Pressable
                key={ideia.id}
                onPress={() => router.push(`/modules/ideias/${ideia.id}` as any)}
                onLongPress={() => confirmarApagar(ideia.id, ideia.nome)}
                delayLongPress={400}
                style={({ pressed }) => pressed && { opacity: 0.7 }}>
                <ThemedView type="backgroundElement" style={styles.card}>
                  <View style={[styles.spine, { backgroundColor: cor, shadowColor: cor }]} />
                  <View style={styles.cardBody}>
                    <View style={styles.cardTop}>
                      <ThemedText type="mono" style={styles.numeral}>
                        {String(i + 1).padStart(2, '0')}
                      </ThemedText>
                      <MaturidadeMarca estagio={ideia.estagio} cor={cor} />
                    </View>

                    <ThemedText style={styles.ideaTitulo} numberOfLines={2}>
                      {ideia.nome}
                    </ThemedText>

                    {ideia.problema ? (
                      <ThemedText type="small" themeColor="textMuted" numberOfLines={2}>
                        {ideia.problema}
                      </ThemedText>
                    ) : null}

                    <View style={styles.cardFooter}>
                      <ThemedText type="meta" themeColor="textMuted">
                        {ESTAGIO_LABELS[ideia.estagio]}
                      </ThemedText>
                      <View style={styles.footerDot} />
                      <ThemedText type="mono" style={styles.metaText}>
                        {formatarDataCurta(ideia.updated_at)}
                      </ThemedText>
                      {ideia.quanto_pagam ? (
                        <>
                          <View style={styles.footerDot} />
                          <ThemedText type="meta" style={{ color: cor }}>
                            $ hoje
                          </ThemedText>
                        </>
                      ) : null}
                    </View>
                  </View>
                </ThemedView>
              </Pressable>
            );
          })}
        </ScrollView>

        <Fab onPress={() => setFormOpen(true)} style={{ bottom: 100 }}>
          <Plus color={'#1C1917' as any} size={22} />
        </Fab>

        {formOpen && <NovaIdeiaSheet onClose={() => setFormOpen(false)} />}
      </SafeAreaView>
    </ThemedView>
  );
}

function NovaIdeiaSheet({ onClose }: { onClose: () => void }) {
  const [nome, setNome] = useState('');
  const [problema, setProblema] = useState('');
  const [tipo, setTipo] = useState<TipoIdeia>('construir');
  const criar = useCriarIdeia();

  async function salvar() {
    if (!nome.trim()) return;
    await criar.mutateAsync({
      nome: nome.trim(),
      problema: problema.trim() || undefined,
      tipo,
    });
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
        <ScrollView
          contentContainerStyle={sheetStyles.body}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}>
          <View style={sheetStyles.tipoRow}>
            {(['construir', 'oportunidade'] as TipoIdeia[]).map((t) => {
              const ativo = tipo === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setTipo(t)}
                  style={({ pressed }) => [
                    sheetStyles.tipoChip,
                    ativo && {
                      backgroundColor: Modules.ideias.accent + '22',
                      borderColor: Modules.ideias.accent,
                    },
                    pressed && { opacity: 0.7 },
                  ]}>
                  <ThemedText
                    type="mono"
                    style={[
                      sheetStyles.tipoChipText,
                      ativo && { color: Modules.ideias.accent },
                    ]}>
                    {TIPO_LABELS[t]}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            value={nome}
            onChangeText={setNome}
            placeholder="Nome da ideia"
            placeholderTextColor="rgba(245,241,237,0.25)"
            autoFocus
            style={sheetStyles.input}
          />
          <TextInput
            value={problema}
            onChangeText={setProblema}
            placeholder="Que problema resolve? (opcional)"
            placeholderTextColor="rgba(245,241,237,0.25)"
            multiline
            style={[sheetStyles.input, { minHeight: 80, textAlignVertical: 'top' }]}
          />
          <ThemedText type="small" themeColor="textMuted">
            O resto (solução, pra quem, próximo passo) você preenche depois, no
            detalhe.
          </ThemedText>
          <Pressable
            onPress={salvar}
            disabled={!nome.trim()}
            style={({ pressed }) => [sheetStyles.salvarBtn, pressed && { opacity: 0.85 }, !nome.trim() && { opacity: 0.4 }]}>
            <ThemedText type="default" style={{ color: '#1C1917', fontWeight: '600' }}>Guardar</ThemedText>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: Spacing.three, gap: Spacing.three, paddingBottom: 140 },
  dica: { marginTop: -Spacing.one, opacity: 0.7 },
  emptyCard: { padding: Spacing.three, borderRadius: Radius.lg, gap: Spacing.one },
  card: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  spine: {
    width: 3,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  cardBody: { flex: 1, padding: Spacing.three, gap: Spacing.one },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  numeral: { fontSize: 12, color: 'rgba(245,241,237,0.40)', letterSpacing: 1 },
  ideaTitulo: {
    fontFamily: 'Spectral-Medium-Italic',
    fontSize: 21,
    lineHeight: 26,
    letterSpacing: -0.3,
    color: '#F5F1ED',
  },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: 4 },
  footerDot: { width: 2, height: 2, borderRadius: 1, backgroundColor: 'rgba(245,241,237,0.30)' },
  metaText: { fontSize: 11, color: 'rgba(245,241,237,0.45)' },
  maturidade: { flexDirection: 'row', gap: 3 },
  matSeg: { width: 14, height: 3, borderRadius: 2 },
});

const sheetStyles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: '#1C1917' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.three, paddingTop: Spacing.four, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(245,241,237,0.08)' },
  body: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },
  input: { backgroundColor: 'rgba(245,241,237,0.06)', borderRadius: Radius.md, padding: Spacing.three, color: '#F5F1ED', fontSize: 15 },
  salvarBtn: { backgroundColor: Modules.ideias.accent, borderRadius: Radius.md, padding: Spacing.three, alignItems: 'center', marginTop: Spacing.two },
  tipoRow: { flexDirection: 'row', gap: Spacing.two },
  tipoChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(245,241,237,0.10)', backgroundColor: 'rgba(245,241,237,0.04)' },
  tipoChipText: { fontSize: 11, letterSpacing: 0.4, color: 'rgba(245,241,237,0.55)' },
});
