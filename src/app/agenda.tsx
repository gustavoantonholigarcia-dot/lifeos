import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fab } from '@/components/fab';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Modules, Radius, Spacing } from '@/constants/theme';
import { WeekStrip } from '@/shared/agenda/components/week-strip';
import {
  useAnotacoesDoDia,
  useCriarAnotacao,
  useDeletarAnotacao,
  useDiasComAnotacao,
} from '@/shared/agenda/queries';
import {
  AGENDA_MODULO_LABELS,
  AGENDA_MODULOS_ORDEM,
  type Anotacao,
  type AnotacaoModulo,
} from '@/shared/agenda/types';
import { useSetoresTawa, useTarefasTawa } from '@/modules/tawa/queries';
import type { Tarefa } from '@/modules/tawa/types';

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function fimSemana(d: Date): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + 6);
  return r;
}

const MESES_FULL = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];
const DIAS_FULL = [
  'domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado',
];

export default function AgendaScreen() {
  const params = useLocalSearchParams<{ modulo?: string }>();
  const hoje = new Date();
  const [semanaBase, setSemanaBase] = useState(hoje);
  const [selecionada, setSelecionada] = useState(toISODate(hoje));
  const [openForm, setOpenForm] = useState(false);

  // Filtro de módulo — vem por query param ou default 'tawa' (foco principal)
  const [moduloFiltro, setModuloFiltro] = useState<AnotacaoModulo | 'todos'>(
    (params.modulo as AnotacaoModulo) ?? 'tawa',
  );

  const semanaIni = toISODate(semanaBase);
  const semanaFim = toISODate(fimSemana(semanaBase));

  const anotacoesQ = useAnotacoesDoDia(selecionada, moduloFiltro);
  const diasComAnotQ = useDiasComAnotacao(semanaIni, semanaFim, moduloFiltro);
  const tarefasQ = useTarefasTawa();

  // Tarefas com prazo nesse dia (todas, filtra por modulo se TAWA)
  const tarefasDoDia = useMemo(() => {
    const todas = (tarefasQ.data ?? []).filter(
      (t) => t.prazo_em && t.prazo_em.startsWith(selecionada),
    );
    if (moduloFiltro === 'todos') return todas;
    return todas.filter((t) => t.modulo === moduloFiltro);
  }, [tarefasQ.data, selecionada, moduloFiltro]);

  const diasComTarefa = useMemo(() => {
    const s = new Set<string>();
    (tarefasQ.data ?? []).forEach((t) => {
      if (t.prazo_em) {
        if (moduloFiltro === 'todos' || t.modulo === moduloFiltro) {
          s.add(t.prazo_em.slice(0, 10));
        }
      }
    });
    return s;
  }, [tarefasQ.data, moduloFiltro]);

  const dataSel = new Date(selecionada + 'T12:00:00');
  const labelData = `${DIAS_FULL[dataSel.getDay()]}, ${dataSel.getDate()} de ${MESES_FULL[dataSel.getMonth()]}`;

  function avancarSemana() {
    const n = new Date(semanaBase);
    n.setDate(n.getDate() + 7);
    setSemanaBase(n);
  }
  function voltarSemana() {
    const n = new Date(semanaBase);
    n.setDate(n.getDate() - 7);
    setSemanaBase(n);
  }
  function irHoje() {
    setSemanaBase(new Date());
    setSelecionada(toISODate(new Date()));
  }

  // Cor do módulo do filtro ativo (pro FAB)
  const corFAB =
    moduloFiltro !== 'todos' && moduloFiltro !== 'geral'
      ? Modules[moduloFiltro].accent
      : '#E8B4A0';

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'Agenda',
          headerShown: true,
          headerRight: () => (
            <Pressable onPress={irHoje} hitSlop={10}>
              <ThemedText type="mono" themeColor="textSecondary" style={{ fontSize: 11 }}>
                HOJE
              </ThemedText>
            </Pressable>
          ),
        }}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        {/* Filtro por módulo — TAWA destacada como principal */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtros}>
          <Chip
            label="Todos"
            ativo={moduloFiltro === 'todos'}
            onPress={() => setModuloFiltro('todos')}
          />
          {AGENDA_MODULOS_ORDEM.map((m) => {
            const cor =
              m === 'geral' ? 'rgba(245,241,237,0.45)' : Modules[m]?.accent ?? '#888';
            return (
              <Chip
                key={m}
                label={AGENDA_MODULO_LABELS[m]}
                cor={cor}
                ativo={moduloFiltro === m}
                destaque={m === 'tawa'}
                onPress={() => setModuloFiltro(m)}
              />
            );
          })}
        </ScrollView>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Faixa semanal */}
          <WeekStrip
            semanaBase={semanaBase}
            selecionada={selecionada}
            diasComAnotacao={diasComAnotQ.data}
            diasComTarefa={diasComTarefa}
            onSelect={setSelecionada}
            onPrev={voltarSemana}
            onNext={avancarSemana}
          />

          {/* Dia */}
          <View style={styles.diaHeader}>
            <ThemedText type="meta" themeColor="textSecondary">
              {labelData}
            </ThemedText>
          </View>

          {/* Tarefas do dia */}
          {tarefasDoDia.length > 0 && (
            <View style={styles.bloco}>
              <ThemedText type="meta" themeColor="textSecondary" style={styles.blocoLabel}>
                01 · Tarefas com prazo
              </ThemedText>
              {tarefasDoDia.map((t) => (
                <TarefaRow key={t.id} tarefa={t} />
              ))}
            </View>
          )}

          {/* Anotações */}
          <View style={styles.bloco}>
            <ThemedText type="meta" themeColor="textSecondary" style={styles.blocoLabel}>
              {tarefasDoDia.length > 0 ? '02 · Anotações' : '01 · Anotações'}
            </ThemedText>
            {anotacoesQ.isLoading ? (
              <ThemedText type="small" themeColor="textMuted">
                Carregando…
              </ThemedText>
            ) : (anotacoesQ.data ?? []).length === 0 ? (
              <View style={styles.empty}>
                <ThemedText type="small" themeColor="textMuted" style={{ textAlign: 'center' }}>
                  Nenhuma anotação aqui ainda.{'\n'}Toca no + pra escrever.
                </ThemedText>
              </View>
            ) : (
              (anotacoesQ.data ?? []).map((a) => <AnotacaoCard key={a.id} anotacao={a} />)
            )}
          </View>
        </ScrollView>

        {/* FAB com cor do filtro */}
        <Fab onPress={() => setOpenForm(true)} color={corFAB}>
          <Plus color={'#1C1917' as any} size={26} />
        </Fab>

        <NovaAnotacaoModal
          visible={openForm}
          data={selecionada}
          moduloDefault={moduloFiltro === 'todos' ? 'tawa' : moduloFiltro}
          onClose={() => setOpenForm(false)}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

// ============================================================================
// Subcomponentes
// ============================================================================
function Chip({
  label,
  ativo,
  cor,
  destaque,
  onPress,
}: {
  label: string;
  ativo: boolean;
  cor?: string;
  destaque?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        ativo && cor && { backgroundColor: cor + '22', borderColor: cor },
        !ativo && destaque && { borderColor: 'rgba(245,241,237,0.20)' },
      ]}>
      {cor && <View style={[styles.chipDot, { backgroundColor: cor }]} />}
      <ThemedText
        type="small"
        themeColor={ativo ? 'text' : 'textSecondary'}
        style={{ fontWeight: ativo ? '600' : '500' }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function TarefaRow({ tarefa }: { tarefa: Tarefa }) {
  const cor = Modules[tarefa.modulo as keyof typeof Modules]?.accent ?? '#6B8FB8';
  const hora = tarefa.prazo_em ? new Date(tarefa.prazo_em) : null;
  const horaStr =
    hora && !(hora.getHours() === 0 && hora.getMinutes() === 0)
      ? `${String(hora.getHours()).padStart(2, '0')}:${String(hora.getMinutes()).padStart(2, '0')}`
      : null;

  return (
    <Pressable
      onPress={() => router.push(`/tarefa/${tarefa.id}`)}
      style={styles.tarefaRow}>
      <View style={[styles.tarefaDot, { backgroundColor: cor }]} />
      <ThemedText type="default" style={{ flex: 1 }} numberOfLines={2}>
        {tarefa.titulo}
      </ThemedText>
      {horaStr && (
        <ThemedText type="mono" themeColor="textMuted" style={{ fontSize: 11 }}>
          {horaStr}
        </ThemedText>
      )}
    </Pressable>
  );
}

function AnotacaoCard({ anotacao }: { anotacao: Anotacao }) {
  const deletar = useDeletarAnotacao();
  const hora = new Date(anotacao.created_at);
  const horaStr = `${String(hora.getHours()).padStart(2, '0')}:${String(hora.getMinutes()).padStart(2, '0')}`;
  const moduloLabel = AGENDA_MODULO_LABELS[anotacao.modulo];
  const cor =
    anotacao.modulo === 'geral'
      ? 'rgba(245,241,237,0.45)'
      : Modules[anotacao.modulo as keyof typeof Modules]?.accent ?? '#888';

  function confirmarDeletar() {
    Alert.alert('Deletar anotação?', '', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: () => deletar.mutate(anotacao.id),
      },
    ]);
  }

  return (
    <Pressable onLongPress={confirmarDeletar} delayLongPress={150} style={styles.anotCard}>
      <View style={styles.anotHeader}>
        <View style={styles.anotTagWrap}>
          <View style={[styles.anotTag, { backgroundColor: cor + '22' }]}>
            <View style={[styles.anotTagDot, { backgroundColor: cor }]} />
            <ThemedText type="mono" style={{ fontSize: 10, color: cor, letterSpacing: 0.5 }}>
              {moduloLabel.toLowerCase()}
            </ThemedText>
          </View>
          <ThemedText type="mono" themeColor="textMuted" style={{ fontSize: 10 }}>
            {horaStr}
          </ThemedText>
        </View>
        <Pressable onPress={confirmarDeletar} hitSlop={10}>
          <Trash2 size={13} color={'rgba(245,241,237,0.30)' as any} />
        </Pressable>
      </View>
      <ThemedText type="default" style={{ lineHeight: 22 }}>
        {anotacao.conteudo}
      </ThemedText>
    </Pressable>
  );
}

function NovaAnotacaoModal({
  visible,
  data,
  moduloDefault,
  onClose,
}: {
  visible: boolean;
  data: string;
  moduloDefault: AnotacaoModulo;
  onClose: () => void;
}) {
  const [texto, setTexto] = useState('');
  const [modulo, setModulo] = useState<AnotacaoModulo>(moduloDefault);
  const [setorId, setSetorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const criar = useCriarAnotacao();
  const setoresQ = useSetoresTawa();

  // Atualiza módulo default quando modal abre
  if (visible && modulo !== moduloDefault && !texto) {
    setModulo(moduloDefault);
  }

  async function salvar() {
    if (!texto.trim()) return;
    setLoading(true);
    try {
      await criar.mutateAsync({
        data,
        modulo,
        conteudo: texto.trim(),
        setor_id: modulo === 'tawa' ? setorId ?? undefined : undefined,
      });
      setTexto('');
      setSetorId(null);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  function fechar() {
    setTexto('');
    setSetorId(null);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={fechar}>
      <View style={{ flex: 1, backgroundColor: '#1C1917' }}>
        <View style={styles.modalHeader}>
          <Pressable onPress={fechar} hitSlop={10}>
            <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 15 }}>
              Cancelar
            </ThemedText>
          </Pressable>
          <ThemedText type="display" style={{ fontSize: 17, lineHeight: 22 }}>
            Nova anotação
          </ThemedText>
          <Pressable
            onPress={salvar}
            disabled={!texto.trim() || loading}
            hitSlop={10}
            style={(!texto.trim() || loading) && { opacity: 0.35 }}>
            <ThemedText
              type="small"
              style={{ color: '#E8B4A0', fontWeight: '700', fontSize: 15 }}>
              {loading ? '...' : 'Salvar'}
            </ThemedText>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ padding: Spacing.three, gap: Spacing.three }}
            keyboardShouldPersistTaps="handled">
            <TextInput
              value={texto}
              onChangeText={setTexto}
              placeholder="O que aconteceu, decisão, follow-up..."
              placeholderTextColor="rgba(245,241,237,0.30)"
              style={styles.modalInput}
              autoFocus
              multiline
              textAlignVertical="top"
            />

            <View style={{ gap: Spacing.two }}>
              <ThemedText type="meta" themeColor="textSecondary">
                Área
              </ThemedText>
              <View style={styles.pillRow}>
                {AGENDA_MODULOS_ORDEM.map((m) => {
                  const ativo = m === modulo;
                  const cor =
                    m === 'geral'
                      ? 'rgba(245,241,237,0.45)'
                      : Modules[m]?.accent ?? '#888';
                  return (
                    <Pressable
                      key={m}
                      onPress={() => setModulo(m)}
                      style={[
                        styles.pill,
                        ativo && { backgroundColor: cor + '22', borderColor: cor },
                      ]}>
                      <View style={[styles.pillDot, { backgroundColor: cor }]} />
                      <ThemedText
                        type="small"
                        themeColor={ativo ? 'text' : 'textSecondary'}>
                        {AGENDA_MODULO_LABELS[m]}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {modulo === 'tawa' && (
              <View style={{ gap: Spacing.two }}>
                <ThemedText type="meta" themeColor="textSecondary">
                  Setor TAWA (opcional)
                </ThemedText>
                <View style={styles.pillRow}>
                  <Pressable
                    onPress={() => setSetorId(null)}
                    style={[
                      styles.pill,
                      setorId === null && {
                        backgroundColor: 'rgba(245,241,237,0.12)',
                      },
                    ]}>
                    <ThemedText
                      type="small"
                      themeColor={setorId === null ? 'text' : 'textSecondary'}>
                      Nenhum
                    </ThemedText>
                  </Pressable>
                  {(setoresQ.data ?? []).map((s) => {
                    const ativo = s.id === setorId;
                    return (
                      <Pressable
                        key={s.id}
                        onPress={() => setSetorId(s.id)}
                        style={[
                          styles.pill,
                          ativo && {
                            backgroundColor: s.cor + '22',
                            borderColor: s.cor,
                          },
                        ]}>
                        <View style={[styles.pillDot, { backgroundColor: s.cor }]} />
                        <ThemedText
                          type="small"
                          themeColor={ativo ? 'text' : 'textSecondary'}>
                          {s.nome}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  filtros: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(245,241,237,0.10)',
    backgroundColor: 'rgba(245,241,237,0.04)',
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  scroll: { paddingBottom: 140, gap: Spacing.three, paddingTop: Spacing.two },
  diaHeader: { paddingHorizontal: Spacing.three, marginTop: Spacing.two },
  bloco: { paddingHorizontal: Spacing.three, gap: Spacing.two },
  blocoLabel: { marginBottom: Spacing.one },
  empty: {
    paddingVertical: Spacing.four,
    backgroundColor: 'rgba(245,241,237,0.03)',
    borderRadius: Radius.md,
  },
  tarefaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'rgba(245,241,237,0.04)',
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
  tarefaDot: { width: 8, height: 8, borderRadius: 4 },
  anotCard: {
    backgroundColor: 'rgba(245,241,237,0.04)',
    padding: Spacing.three,
    borderRadius: Radius.md,
    gap: Spacing.two,
  },
  anotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  anotTagWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  anotTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  anotTagDot: { width: 5, height: 5, borderRadius: 2.5 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    paddingTop: Spacing.three + 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245,241,237,0.06)',
  },
  modalInput: {
    fontSize: 18,
    lineHeight: 26,
    color: 'rgba(245,241,237,0.87)',
    minHeight: 200,
    paddingVertical: Spacing.two,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(245,241,237,0.10)',
    backgroundColor: 'rgba(245,241,237,0.04)',
  },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
});
