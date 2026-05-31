import * as Haptics from 'expo-haptics';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { CalendarClock, ListChecks, Mail, MessageCircle, Pencil, Phone, Trash2, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Modules, Radius, Spacing } from '@/constants/theme';
import { formatarData, formatarDataHora, parsearDataBR } from '@/shared/format/date';
import {
  useAtualizarContato,
  useContato,
  useCriarInteracao,
  useDeletarContato,
  useInteracoes,
  useTarefasDoContato,
} from '@/modules/tawa/crm/queries';
import { STATUS_LABELS as TAREFA_STATUS_LABELS } from '@/modules/tawa/types';
import { corAvatar, iniciais, linkWhatsApp } from '@/modules/tawa/crm/helpers';
import {
  CANAIS,
  CANAL_LABELS,
  STATUS_CORES,
  STATUS_LABELS,
  STATUS_SEQUENCE,
  TIPO_LABELS,
  type CanalInteracao,
  type Contato,
} from '@/modules/tawa/crm/types';

function dateParaInputBR(iso: string | null): string {
  if (!iso) return '';
  return formatarData(iso);
}

function inputBRParaDateISO(texto: string): string | undefined {
  const d = parsearDataBR(texto);
  if (!d) return undefined;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ContatoDetailScreen() {
  const { id, foco } = useLocalSearchParams<{ id: string; foco?: string }>();
  const focoInteracao = foco === 'interacao';
  const scrollRef = useRef<ScrollView>(null);
  const interacoesY = useRef(0);
  const { data: contato, isLoading } = useContato(id);
  const { data: interacoes } = useInteracoes(id);
  const { data: tarefasVinc } = useTarefasDoContato(id);
  const atualizar = useAtualizarContato();
  const deletar = useDeletarContato();
  const criarInteracao = useCriarInteracao();

  const [editOpen, setEditOpen] = useState(false);
  const [canal, setCanal] = useState<CanalInteracao>('telefone');
  const [conteudo, setConteudo] = useState('');

  const [followEdit, setFollowEdit] = useState(false);
  const [fPasso, setFPasso] = useState('');
  const [fData, setFData] = useState('');

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Contato', headerShown: true }} />
        <ThemedText type="default" themeColor="textMuted" style={{ padding: Spacing.three }}>
          Carregando…
        </ThemedText>
      </ThemedView>
    );
  }

  if (!contato) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Contato', headerShown: true }} />
        <ThemedText type="default" themeColor="textMuted" style={{ padding: Spacing.three }}>
          Contato não encontrado.
        </ThemedText>
      </ThemedView>
    );
  }

  const local = [contato.cidade, contato.uf].filter(Boolean).join(' · ');

  function mudarStatus(novo: Contato['status']) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    atualizar.mutate({ id: contato!.id, patch: { status: novo } });
  }

  async function registrarInteracao() {
    if (!conteudo.trim()) return;
    await criarInteracao.mutateAsync({ contato_id: contato!.id, canal, conteudo: conteudo.trim() });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setConteudo('');
  }

  function abrirFollow() {
    setFPasso(contato!.proximo_passo ?? '');
    setFData(dateParaInputBR(contato!.proximo_passo_em));
    setFollowEdit(true);
  }

  async function salvarFollow() {
    await atualizar.mutateAsync({
      id: contato!.id,
      patch: {
        proximo_passo: fPasso.trim() || null,
        proximo_passo_em: fPasso.trim() ? inputBRParaDateISO(fData) ?? null : null,
      },
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setFollowEdit(false);
  }

  function virarTarefa() {
    router.push(
      `/tarefa/nova?contato_id=${contato!.id}&titulo=${encodeURIComponent(contato!.nome + ' — ')}`,
    );
  }

  function confirmarDeletar() {
    Alert.alert('Deletar contato?', 'O histórico de interações também será removido.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          await deletar.mutateAsync(contato!.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: contato.nome,
          headerShown: true,
          headerRight: () => (
            <Pressable onPress={() => setEditOpen(true)} hitSlop={10}>
              <Pencil size={18} color={'rgba(245,241,237,0.75)' as any} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <View style={styles.headerRow}>
          <View style={[styles.avatar, { backgroundColor: corAvatar(contato.nome) + '30', borderColor: corAvatar(contato.nome) }]}>
            <ThemedText type="mono" style={[styles.avatarText, { color: corAvatar(contato.nome) }]}>
              {iniciais(contato.nome)}
            </ThemedText>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <ThemedText type="titleMD">{contato.nome}</ThemedText>
            <ThemedText type="mono" style={styles.sub}>
              {TIPO_LABELS[contato.tipo]}
              {local ? ` · ${local}` : ''}
            </ThemedText>
          </View>
        </View>

        {/* Ações rápidas */}
        {(contato.telefone || contato.email) && (
          <View style={styles.acoesRow}>
            {linkWhatsApp(contato.telefone) && (
              <Pressable
                onPress={() => Linking.openURL(linkWhatsApp(contato.telefone)!)}
                style={({ pressed }) => [styles.acaoBtn, { borderColor: '#25D36655', backgroundColor: '#25D36615' }, pressed && { opacity: 0.7 }]}>
                <MessageCircle size={16} color={'#25D366' as any} />
                <ThemedText type="small" style={{ color: '#25D366' }}>WhatsApp</ThemedText>
              </Pressable>
            )}
            {contato.telefone && (
              <Pressable
                onPress={() => Linking.openURL(`tel:${contato.telefone}`)}
                style={({ pressed }) => [styles.acaoBtn, pressed && { opacity: 0.7 }]}>
                <Phone size={16} color={'rgba(245,241,237,0.75)' as any} />
                <ThemedText type="small" themeColor="textSecondary">Ligar</ThemedText>
              </Pressable>
            )}
            {contato.email && (
              <Pressable
                onPress={() => Linking.openURL(`mailto:${contato.email}`)}
                style={({ pressed }) => [styles.acaoBtn, pressed && { opacity: 0.7 }]}>
                <Mail size={16} color={'rgba(245,241,237,0.75)' as any} />
                <ThemedText type="small" themeColor="textSecondary">E-mail</ThemedText>
              </Pressable>
            )}
          </View>
        )}

        {/* Status (funil) */}
        <View style={styles.statusRow}>
          {STATUS_SEQUENCE.map((s) => {
            const ativo = contato.status === s;
            const cor = STATUS_CORES[s];
            return (
              <Pressable
                key={s}
                onPress={() => mudarStatus(s)}
                style={[styles.statusChip, ativo && { backgroundColor: cor + '25', borderColor: cor }]}>
                <ThemedText type="mono" style={[styles.statusChipText, ativo && { color: cor }]}>
                  {STATUS_LABELS[s]}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        {/* Próximo passo (editável inline) */}
        <ThemedView type="backgroundElement" style={styles.block}>
          <View style={styles.blockHead}>
            <ThemedText type="meta" themeColor="textSecondary">Próximo passo</ThemedText>
            {!followEdit && (
              <Pressable onPress={abrirFollow} hitSlop={8}>
                <Pencil size={14} color={'rgba(245,241,237,0.55)' as any} />
              </Pressable>
            )}
          </View>

          {followEdit ? (
            <View style={{ gap: Spacing.two, marginTop: 4 }}>
              <TextInput
                value={fPasso}
                onChangeText={setFPasso}
                placeholder="Ex: enviar proposta"
                placeholderTextColor="rgba(245,241,237,0.25)"
                style={[styles.input, { minHeight: 0 }]}
              />
              <TextInput
                value={fData}
                onChangeText={setFData}
                placeholder="Data (dd/mm/aaaa)"
                placeholderTextColor="rgba(245,241,237,0.25)"
                keyboardType="numbers-and-punctuation"
                style={[styles.input, { minHeight: 0 }]}
              />
              <View style={styles.followBtns}>
                <Pressable onPress={() => setFollowEdit(false)} style={({ pressed }) => [styles.followCancel, pressed && { opacity: 0.7 }]}>
                  <ThemedText type="small" themeColor="textMuted">Cancelar</ThemedText>
                </Pressable>
                <Pressable onPress={salvarFollow} disabled={atualizar.isPending} style={({ pressed }) => [styles.followSave, pressed && { opacity: 0.85 }, atualizar.isPending && { opacity: 0.4 }]}>
                  <ThemedText type="small" style={{ color: 'white', fontWeight: '600' }}>Salvar</ThemedText>
                </Pressable>
              </View>
            </View>
          ) : contato.proximo_passo ? (
            <>
              <ThemedText type="default">{contato.proximo_passo}</ThemedText>
              {contato.proximo_passo_em && (
                <ThemedText type="mono" style={styles.sub}>{formatarData(contato.proximo_passo_em)}</ThemedText>
              )}
            </>
          ) : (
            <ThemedText type="small" themeColor="textMuted">Nenhum passo definido. Toque no lápis pra adicionar.</ThemedText>
          )}
        </ThemedView>

        {/* Edital */}
        {contato.edital_ref && (
          <ThemedView type="backgroundElement" style={styles.block}>
            <ThemedText type="meta" themeColor="textSecondary">Edital / licitação</ThemedText>
            <ThemedText type="default">{contato.edital_ref}</ThemedText>
          </ThemedView>
        )}

        {/* Observações */}
        {contato.observacoes && (
          <ThemedView type="backgroundElement" style={styles.block}>
            <ThemedText type="meta" themeColor="textSecondary">Observações</ThemedText>
            <ThemedText type="default">{contato.observacoes}</ThemedText>
          </ThemedView>
        )}

        {/* Virar tarefa */}
        <Pressable onPress={virarTarefa} style={({ pressed }) => [styles.tarefaBtn, pressed && { opacity: 0.85 }]}>
          <ListChecks size={16} color={Modules.tawa.accent as any} />
          <ThemedText type="default" style={{ color: Modules.tawa.accent }}>Criar tarefa pra esse contato</ThemedText>
        </Pressable>

        {/* Tarefas vinculadas */}
        {(tarefasVinc?.length ?? 0) > 0 && (
          <View style={{ gap: Spacing.two }}>
            <ThemedText type="meta" themeColor="textSecondary">Tarefas vinculadas</ThemedText>
            {(tarefasVinc ?? []).map((t) => (
              <Pressable
                key={t.id}
                onPress={() => router.push(`/tarefa/${t.id}`)}
                style={({ pressed }) => [styles.tarefaItem, pressed && { opacity: 0.7 }]}>
                <View style={{ flex: 1 }}>
                  <ThemedText type="default" numberOfLines={2}>{t.titulo}</ThemedText>
                  <ThemedText type="mono" style={styles.sub}>
                    {TAREFA_STATUS_LABELS[t.status]}
                    {t.prazo_em ? ` · ${formatarData(t.prazo_em)}` : ''}
                  </ThemedText>
                </View>
                <CalendarClock size={15} color={'rgba(245,241,237,0.35)' as any} />
              </Pressable>
            ))}
          </View>
        )}

        {/* Interações */}
        <View
          style={{ gap: Spacing.two, marginTop: Spacing.two }}
          onLayout={(e) => {
            interacoesY.current = e.nativeEvent.layout.y;
            if (focoInteracao) {
              requestAnimationFrame(() =>
                scrollRef.current?.scrollTo({ y: interacoesY.current - Spacing.three, animated: true }),
              );
            }
          }}>
          <ThemedText type="meta" themeColor="textSecondary">Histórico de interações</ThemedText>

          {/* Nova interação */}
          <ThemedView type="backgroundElement" style={styles.block}>
            <View style={styles.canalRow}>
              {CANAIS.map((c) => {
                const ativo = canal === c;
                return (
                  <Pressable key={c} onPress={() => setCanal(c)} style={[styles.canalChip, ativo && styles.canalChipAtivo]}>
                    <ThemedText type="mono" style={[styles.canalChipText, ativo && { color: Modules.tawa.accent }]}>
                      {CANAL_LABELS[c]}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              value={conteudo}
              onChangeText={setConteudo}
              placeholder="O que foi conversado?"
              placeholderTextColor="rgba(245,241,237,0.25)"
              multiline
              autoFocus={focoInteracao}
              style={styles.input}
            />
            <Pressable
              onPress={registrarInteracao}
              disabled={!conteudo.trim() || criarInteracao.isPending}
              style={({ pressed }) => [styles.registrarBtn, pressed && { opacity: 0.85 }, (!conteudo.trim() || criarInteracao.isPending) && { opacity: 0.4 }]}>
              <ThemedText type="default" style={{ color: 'white', fontWeight: '600' }}>
                {criarInteracao.isPending ? 'Salvando…' : 'Registrar'}
              </ThemedText>
            </Pressable>
          </ThemedView>

          {(interacoes ?? []).map((i) => (
            <ThemedView key={i.id} type="backgroundElement" style={styles.interacao}>
              <View style={styles.interacaoTop}>
                <ThemedText type="mono" style={styles.canalTag}>{CANAL_LABELS[i.canal]}</ThemedText>
                <ThemedText type="mono" style={styles.sub}>{formatarDataHora(i.data)}</ThemedText>
              </View>
              <ThemedText type="default">{i.conteudo}</ThemedText>
            </ThemedView>
          ))}

          {(interacoes?.length ?? 0) === 0 && (
            <ThemedText type="small" themeColor="textMuted">Nenhuma interação registrada ainda.</ThemedText>
          )}
        </View>

        {/* Deletar */}
        <Pressable onPress={confirmarDeletar} style={({ pressed }) => [styles.deletar, pressed && { opacity: 0.7 }]}>
          <Trash2 size={15} color={'#E04830' as any} />
          <ThemedText type="small" style={{ color: '#E04830' }}>Deletar contato</ThemedText>
        </Pressable>
      </ScrollView>

      {editOpen && <EditarContatoSheet contato={contato} onClose={() => setEditOpen(false)} />}
    </ThemedView>
  );
}

function EditarContatoSheet({ contato, onClose }: { contato: Contato; onClose: () => void }) {
  const [telefone, setTelefone] = useState(contato.telefone ?? '');
  const [email, setEmail] = useState(contato.email ?? '');
  const [editalRef, setEditalRef] = useState(contato.edital_ref ?? '');
  const [observacoes, setObservacoes] = useState(contato.observacoes ?? '');
  const [proxPasso, setProxPasso] = useState(contato.proximo_passo ?? '');
  const [proxData, setProxData] = useState(dateParaInputBR(contato.proximo_passo_em));
  const atualizar = useAtualizarContato();

  async function salvar() {
    await atualizar.mutateAsync({
      id: contato.id,
      patch: {
        telefone: telefone.trim() || null,
        email: email.trim() || null,
        edital_ref: editalRef.trim() || null,
        observacoes: observacoes.trim() || null,
        proximo_passo: proxPasso.trim() || null,
        proximo_passo_em: proxPasso.trim() ? inputBRParaDateISO(proxData) ?? null : null,
      },
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={sheet.sheet}>
        <View style={sheet.header}>
          <ThemedText type="titleMD" style={{ color: '#F5F1ED' }}>Editar contato</ThemedText>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={22} color={'rgba(245,241,237,0.65)' as any} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={sheet.body}>
          <ThemedText type="meta" style={sheet.label}>Telefone</ThemedText>
          <TextInput value={telefone} onChangeText={setTelefone} placeholder="(43) 9..." placeholderTextColor="rgba(245,241,237,0.25)" keyboardType="phone-pad" style={sheet.input} />

          <ThemedText type="meta" style={sheet.label}>E-mail</ThemedText>
          <TextInput value={email} onChangeText={setEmail} placeholder="contato@..." placeholderTextColor="rgba(245,241,237,0.25)" autoCapitalize="none" keyboardType="email-address" style={sheet.input} />

          <ThemedText type="meta" style={sheet.label}>Edital / licitação</ThemedText>
          <TextInput value={editalRef} onChangeText={setEditalRef} placeholder="Ex: Pregão 008/2026" placeholderTextColor="rgba(245,241,237,0.25)" style={sheet.input} />

          <ThemedText type="meta" style={sheet.label}>Próximo passo</ThemedText>
          <TextInput value={proxPasso} onChangeText={setProxPasso} placeholder="Ex: enviar proposta" placeholderTextColor="rgba(245,241,237,0.25)" style={sheet.input} />
          <TextInput value={proxData} onChangeText={setProxData} placeholder="Data (dd/mm/aaaa)" placeholderTextColor="rgba(245,241,237,0.25)" keyboardType="numbers-and-punctuation" style={sheet.input} />

          <ThemedText type="meta" style={sheet.label}>Observações</ThemedText>
          <TextInput value={observacoes} onChangeText={setObservacoes} placeholder="Notas gerais" placeholderTextColor="rgba(245,241,237,0.25)" multiline style={[sheet.input, { minHeight: 90, textAlignVertical: 'top' }]} />

          <Pressable onPress={salvar} disabled={atualizar.isPending} style={({ pressed }) => [sheet.salvar, pressed && { opacity: 0.85 }, atualizar.isPending && { opacity: 0.4 }]}>
            <ThemedText type="default" style={{ color: 'white', fontWeight: '600' }}>
              {atualizar.isPending ? 'Salvando…' : 'Salvar'}
            </ThemedText>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.three, gap: Spacing.three, paddingBottom: 80 },
  sub: { fontSize: 11, color: 'rgba(245,241,237,0.45)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  avatarText: { fontSize: 16, fontWeight: '600' },
  acoesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  acaoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(245,241,237,0.12)', backgroundColor: 'rgba(245,241,237,0.05)',
  },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(245,241,237,0.10)' },
  statusChipText: { fontSize: 11, color: 'rgba(245,241,237,0.50)' },
  block: { padding: Spacing.three, borderRadius: Radius.lg, gap: 4 },
  blockHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  followBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.two },
  followCancel: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.md },
  followSave: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.md, backgroundColor: Modules.tawa.accent },
  tarefaItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.three, borderRadius: Radius.md, backgroundColor: 'rgba(245,241,237,0.05)' },
  tarefaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: Spacing.three, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Modules.tawa.accent + '55', backgroundColor: Modules.tawa.accent + '15',
  },
  canalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  canalChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: 'rgba(245,241,237,0.06)' },
  canalChipAtivo: { backgroundColor: Modules.tawa.accent + '25' },
  canalChipText: { fontSize: 11, color: 'rgba(245,241,237,0.55)' },
  input: { backgroundColor: 'rgba(245,241,237,0.06)', borderRadius: Radius.md, padding: Spacing.three, color: '#F5F1ED', fontSize: 15, minHeight: 60, textAlignVertical: 'top' },
  registrarBtn: { backgroundColor: Modules.tawa.accent, borderRadius: Radius.md, padding: Spacing.two, alignItems: 'center', marginTop: 4 },
  interacao: { padding: Spacing.three, borderRadius: Radius.md, gap: 4 },
  interacaoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  canalTag: { fontSize: 10, color: Modules.tawa.accent, textTransform: 'uppercase', letterSpacing: 0.6 },
  deletar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: Spacing.three, marginTop: Spacing.two },
});

const sheet = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: '#1C1917' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.three, paddingTop: Spacing.four, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(245,241,237,0.08)' },
  body: { padding: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.six },
  label: { color: 'rgba(245,241,237,0.55)', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: Spacing.one },
  input: { backgroundColor: 'rgba(245,241,237,0.06)', borderRadius: Radius.md, padding: Spacing.three, color: '#F5F1ED', fontSize: 15 },
  salvar: { backgroundColor: Modules.tawa.accent, borderRadius: Radius.md, padding: Spacing.three, alignItems: 'center', marginTop: Spacing.three },
});
