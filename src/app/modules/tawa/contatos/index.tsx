import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Plus, Search, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
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
import { Modules, Radius, Spacing, Warm } from '@/constants/theme';
import { formatarDataCurta } from '@/shared/format/date';
import { useContatos, useCriarContato } from '@/modules/tawa/crm/queries';
import { corAvatar, iniciais, rotuloFrieza } from '@/modules/tawa/crm/helpers';
import {
  STATUS_CORES,
  STATUS_LABELS,
  STATUS_SEQUENCE,
  TIPOS,
  TIPO_LABELS,
  type ContatoStatus,
  type ContatoTipo,
} from '@/modules/tawa/crm/types';

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ContatosScreen() {
  const { data: contatos, isLoading } = useContatos();
  const [formOpen, setFormOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<ContatoStatus | null>(null);
  const hoje = hojeISO();

  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    return (contatos ?? []).filter((c) => {
      if (statusFiltro && c.status !== statusFiltro) return false;
      if (termo) {
        const alvo = normalizar(
          `${c.nome} ${c.cidade ?? ''} ${c.uf ?? ''} ${TIPO_LABELS[c.tipo]}`,
        );
        if (!alvo.includes(termo)) return false;
      }
      return true;
    });
  }, [contatos, busca, statusFiltro]);

  const followups = useMemo(() => {
    return (contatos ?? [])
      .filter((c) => c.proximo_passo && c.proximo_passo_em != null && c.proximo_passo_em <= hoje)
      .sort((a, b) => (a.proximo_passo_em ?? '').localeCompare(b.proximo_passo_em ?? ''));
  }, [contatos, hoje]);

  const funil = useMemo(() => {
    const c: Record<ContatoStatus, number> = {
      prospecto: 0, em_conversa: 0, proposta: 0, ganho: 0, perdido: 0,
    };
    for (const ct of contatos ?? []) c[ct.status]++;
    return c;
  }, [contatos]);

  const temContatos = (contatos?.length ?? 0) > 0;
  const temFiltro = busca.trim().length > 0 || statusFiltro != null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="meta" themeColor="textSecondary">
            TAWA · Contatos
          </ThemedText>
          <ThemedText type="displayLG">Contatos</ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            {temFiltro
              ? `${filtrados.length} de ${contatos?.length ?? 0}`
              : `${contatos?.length ?? 0} ${(contatos?.length ?? 0) === 1 ? 'contato' : 'contatos'}`}
          </ThemedText>
        </View>

        {temContatos && (
          <View style={styles.controls}>
            <View style={styles.searchBox}>
              <Search size={15} color={'rgba(245,241,237,0.40)' as any} />
              <TextInput
                value={busca}
                onChangeText={setBusca}
                placeholder="Buscar por nome, cidade…"
                placeholderTextColor="rgba(245,241,237,0.30)"
                style={styles.searchInput}
                autoCapitalize="none"
                returnKeyType="search"
              />
              {busca.length > 0 && (
                <Pressable onPress={() => setBusca('')} hitSlop={8}>
                  <X size={15} color={'rgba(245,241,237,0.45)' as any} />
                </Pressable>
              )}
            </View>

            {/* Funil visual — distribuição por estágio */}
            <View style={styles.funilBar}>
              {STATUS_SEQUENCE.map((s) => {
                const n = funil[s];
                if (n === 0) return null;
                const total = contatos?.length ?? 1;
                return (
                  <View
                    key={s}
                    style={{
                      flex: n / total,
                      height: '100%',
                      backgroundColor: STATUS_CORES[s],
                      opacity: statusFiltro && statusFiltro !== s ? 0.3 : 1,
                    }}
                  />
                );
              })}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChips}>
              <Pressable
                onPress={() => setStatusFiltro(null)}
                style={[styles.fChip, !statusFiltro && styles.fChipAtivo]}>
                <ThemedText
                  type="mono"
                  style={[styles.fChipText, !statusFiltro && styles.fChipTextAtivo]}>
                  Todos {contatos?.length ?? 0}
                </ThemedText>
              </Pressable>
              {STATUS_SEQUENCE.map((s) => {
                const ativo = statusFiltro === s;
                const cor = STATUS_CORES[s];
                const n = funil[s];
                return (
                  <Pressable
                    key={s}
                    onPress={() => setStatusFiltro(ativo ? null : s)}
                    style={[styles.fChip, ativo && { backgroundColor: cor + '25' }]}>
                    <View style={[styles.fDot, { backgroundColor: cor }]} />
                    <ThemedText
                      type="mono"
                      style={[styles.fChipText, ativo && { color: cor }]}>
                      {STATUS_LABELS[s]} {n}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          {isLoading && (
            <ThemedText type="default" themeColor="textMuted">
              Carregando…
            </ThemedText>
          )}

          {!isLoading && !temFiltro && followups.length > 0 && (
            <ThemedView type="backgroundElement" style={styles.painel}>
              <View style={styles.painelHead}>
                <View style={styles.painelDot} />
                <ThemedText type="meta" style={styles.painelTitulo}>
                  Retomar hoje · {followups.length}
                </ThemedText>
              </View>
              {followups.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => router.push(`/modules/tawa/contatos/${c.id}`)}
                  style={({ pressed }) => [styles.painelItem, pressed && { opacity: 0.6 }]}>
                  <ThemedText type="default" numberOfLines={1} style={{ flex: 1 }}>
                    {c.nome}
                  </ThemedText>
                  <ThemedText type="mono" style={styles.painelData}>
                    {c.proximo_passo_em ? formatarDataCurta(c.proximo_passo_em) : ''}
                  </ThemedText>
                </Pressable>
              ))}
            </ThemedView>
          )}

          {!isLoading && !temContatos && (
            <ThemedView type="backgroundElement" style={styles.empty}>
              <ThemedText type="default" themeColor="textMuted">
                Nenhum contato ainda. Toque + para registrar a primeira prefeitura, órgão ou cliente.
              </ThemedText>
            </ThemedView>
          )}

          {!isLoading && temContatos && filtrados.length === 0 && (
            <ThemedView type="backgroundElement" style={styles.empty}>
              <ThemedText type="default" themeColor="textMuted">
                Nenhum contato corresponde ao filtro.
              </ThemedText>
            </ThemedView>
          )}

          {filtrados.map((c) => {
            const cor = STATUS_CORES[c.status];
            const followupVencido =
              c.proximo_passo_em != null && c.proximo_passo_em <= hoje;
            const local = [c.cidade, c.uf].filter(Boolean).join(' · ');
            return (
              <Pressable
                key={c.id}
                onPress={() => router.push(`/modules/tawa/contatos/${c.id}`)}
                style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
                <ThemedView type="backgroundElement" style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={[styles.avatar, { backgroundColor: corAvatar(c.nome) + '30', borderColor: corAvatar(c.nome) }]}>
                      <ThemedText type="mono" style={[styles.avatarText, { color: corAvatar(c.nome) }]}>
                        {iniciais(c.nome)}
                      </ThemedText>
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <ThemedText type="default">{c.nome}</ThemedText>
                      <ThemedText type="mono" style={styles.sub}>
                        {TIPO_LABELS[c.tipo]}
                        {local ? ` · ${local}` : ''}
                      </ThemedText>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <View style={[styles.pill, { backgroundColor: cor + '22' }]}>
                        <ThemedText type="mono" style={[styles.pillText, { color: cor }]}>
                          {STATUS_LABELS[c.status]}
                        </ThemedText>
                      </View>
                      {(() => {
                        const f = rotuloFrieza(c.updated_at);
                        if (!f || f.texto === 'hoje') return null;
                        return (
                          <ThemedText type="mono" style={[styles.frieza, f.frio && { color: '#E04830' }]}>
                            {f.texto}
                          </ThemedText>
                        );
                      })()}
                    </View>
                  </View>

                  {c.proximo_passo && (
                    <View style={styles.followRow}>
                      <View
                        style={[
                          styles.followDot,
                          { backgroundColor: followupVencido ? '#E04830' : 'rgba(245,241,237,0.30)' },
                        ]}
                      />
                      <ThemedText
                        type="small"
                        style={[
                          styles.followText,
                          followupVencido && { color: '#E04830' },
                        ]}
                        numberOfLines={1}>
                        {c.proximo_passo}
                        {c.proximo_passo_em ? ` · ${formatarDataCurta(c.proximo_passo_em)}` : ''}
                      </ThemedText>
                    </View>
                  )}
                </ThemedView>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          onPress={() => setFormOpen(true)}
          style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}>
          <Plus color={'#1C1917' as any} size={26} />
        </Pressable>

        {formOpen && <NovoContatoSheet onClose={() => setFormOpen(false)} />}
      </SafeAreaView>
    </ThemedView>
  );
}

function NovoContatoSheet({ onClose }: { onClose: () => void }) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<ContatoTipo>('prefeitura');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [telefone, setTelefone] = useState('');
  const criar = useCriarContato();

  async function salvar() {
    if (!nome.trim()) return;
    const novo = await criar.mutateAsync({
      nome: nome.trim(),
      tipo,
      cidade: cidade.trim() || undefined,
      uf: uf.trim().toUpperCase() || undefined,
      telefone: telefone.trim() || undefined,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
    router.push(`/modules/tawa/contatos/${novo.id}?foco=interacao`);
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={sheet.sheet}>
        <View style={sheet.header}>
          <ThemedText type="titleMD" style={{ color: '#F5F1ED' }}>Novo contato</ThemedText>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={22} color={'rgba(245,241,237,0.65)' as any} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={sheet.body}>
          <TextInput value={nome} onChangeText={setNome} placeholder="Nome (ex: Prefeitura de Londrina)" placeholderTextColor="rgba(245,241,237,0.25)" style={sheet.input} />

          <ThemedText type="meta" style={sheet.label}>Tipo</ThemedText>
          <View style={sheet.chips}>
            {TIPOS.map((t) => {
              const ativo = tipo === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setTipo(t)}
                  style={[sheet.chip, ativo && sheet.chipAtivo]}>
                  <ThemedText type="default" style={[{ fontSize: 13 }, ativo && { color: Modules.tawa.accent }]}>
                    {TIPO_LABELS[t]}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <View style={sheet.row}>
            <TextInput value={cidade} onChangeText={setCidade} placeholder="Cidade" placeholderTextColor="rgba(245,241,237,0.25)" style={[sheet.input, { flex: 1 }]} />
            <TextInput value={uf} onChangeText={setUf} placeholder="UF" placeholderTextColor="rgba(245,241,237,0.25)" maxLength={2} autoCapitalize="characters" style={[sheet.input, { width: 70 }]} />
          </View>

          <TextInput value={telefone} onChangeText={setTelefone} placeholder="Telefone (opcional)" placeholderTextColor="rgba(245,241,237,0.25)" keyboardType="phone-pad" style={sheet.input} />

          <Pressable onPress={salvar} disabled={!nome.trim() || criar.isPending} style={({ pressed }) => [sheet.salvar, pressed && { opacity: 0.85 }, (!nome.trim() || criar.isPending) && { opacity: 0.4 }]}>
            <ThemedText type="default" style={{ color: 'white', fontWeight: '600' }}>
              {criar.isPending ? 'Salvando…' : 'Criar contato'}
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
  header: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two, gap: 2 },
  controls: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two, gap: Spacing.two },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'rgba(245,241,237,0.06)',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, color: '#F5F1ED', fontSize: 15, padding: 0 },
  filterChips: { flexDirection: 'row', gap: Spacing.two, paddingVertical: 2 },
  fChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(245,241,237,0.06)',
  },
  fChipAtivo: { backgroundColor: 'rgba(245,241,237,0.14)' },
  fChipText: { fontSize: 11, color: 'rgba(245,241,237,0.55)' },
  fChipTextAtivo: { color: '#F5F1ED' },
  fDot: { width: 6, height: 6, borderRadius: 3 },
  funilBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(245,241,237,0.06)',
    gap: 1,
  },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  avatarText: { fontSize: 13, fontWeight: '600' },
  frieza: { fontSize: 10, color: 'rgba(245,241,237,0.40)' },
  scroll: { padding: Spacing.three, gap: Spacing.two, paddingBottom: 140 },
  empty: { padding: Spacing.three, borderRadius: Radius.lg },
  painel: { padding: Spacing.three, borderRadius: Radius.lg, gap: Spacing.two, borderLeftWidth: 3, borderLeftColor: '#E04830' },
  painelHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  painelDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E04830' },
  painelTitulo: { color: '#E04830', textTransform: 'uppercase', letterSpacing: 0.6 },
  painelItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(245,241,237,0.08)' },
  painelData: { fontSize: 11, color: 'rgba(245,241,237,0.45)' },
  card: { padding: Spacing.three, borderRadius: Radius.lg, gap: Spacing.two },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  sub: { fontSize: 11, color: 'rgba(245,241,237,0.45)' },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.sm },
  pillText: { fontSize: 10, letterSpacing: 0.4 },
  followRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  followDot: { width: 6, height: 6, borderRadius: 3 },
  followText: { flex: 1, color: 'rgba(245,241,237,0.55)' },
  fab: {
    position: 'absolute', right: Spacing.three, bottom: 100, width: 56, height: 56, borderRadius: 28,
    backgroundColor: Warm.peach, alignItems: 'center', justifyContent: 'center',
    shadowColor: Warm.peach, shadowOpacity: 0.45, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
});

const sheet = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: '#1C1917' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.three, paddingTop: Spacing.four, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(245,241,237,0.08)' },
  body: { padding: Spacing.three, gap: Spacing.three },
  label: { color: 'rgba(245,241,237,0.55)', textTransform: 'uppercase', letterSpacing: 0.6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(245,241,237,0.10)', backgroundColor: 'rgba(245,241,237,0.04)' },
  chipAtivo: { backgroundColor: Modules.tawa.accent + '25', borderColor: Modules.tawa.accent },
  row: { flexDirection: 'row', gap: Spacing.two },
  input: { backgroundColor: 'rgba(245,241,237,0.06)', borderRadius: Radius.md, padding: Spacing.three, color: '#F5F1ED', fontSize: 15 },
  salvar: { backgroundColor: Modules.tawa.accent, borderRadius: Radius.md, padding: Spacing.three, alignItems: 'center', marginTop: Spacing.two },
});
