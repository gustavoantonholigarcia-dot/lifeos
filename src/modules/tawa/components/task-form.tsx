import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';

import { formatarData, parsearDataBR } from '@/shared/format/date';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';

import {
  PRIORIDADE_CORES,
  PRIORIDADE_LABELS,
  type CriarTarefaInput,
  type Prioridade,
  type SetorTawa,
  type Tarefa,
} from '../types';

type Props = {
  setores: SetorTawa[];
  inicial?: Partial<Tarefa>;
  onSubmit: (input: CriarTarefaInput) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
};

const PRIORIDADES: Prioridade[] = ['alta', 'media', 'baixa', 'sem'];

function formatarPrazoParaInput(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const dia = formatarData(d); // dd/MM/yyyy
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  // Inclui hora só se não for 00:00
  return hh === '00' && mm === '00' ? dia : `${dia} ${hh}:${mm}`;
}

export function TaskForm({ setores, inicial, onSubmit, onCancel, submitLabel = 'Salvar' }: Props) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '');
  const [setorId, setSetorId] = useState<string | null>(inicial?.setor_id ?? null);
  const [prioridade, setPrioridade] = useState<Prioridade>(
    (inicial?.prioridade as Prioridade) ?? 'sem',
  );
  // Mostra prazo em formato BR. Quando salva, converte pra ISO.
  const [prazo, setPrazo] = useState(
    inicial?.prazo_em ? formatarPrazoParaInput(inicial.prazo_em) : '',
  );
  const [observacoes, setObservacoes] = useState(inicial?.observacoes ?? '');
  const [delegadoPor, setDelegadoPor] = useState(inicial?.delegado_por ?? '');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [showSetorList, setShowSetorList] = useState(false);

  async function submeter() {
    if (!titulo.trim()) {
      setErro('Título obrigatório');
      return;
    }

    // Converte prazo BR → ISO
    let prazoIso: string | undefined;
    if (prazo.trim()) {
      const parsed = parsearDataBR(prazo);
      if (!parsed) {
        setErro('Prazo inválido. Use o formato dd/mm/aaaa ou dd/mm/aaaa HH:mm');
        return;
      }
      prazoIso = parsed.toISOString();
    }

    setErro(null);
    setLoading(true);
    try {
      await onSubmit({
        modulo: 'tawa',
        titulo: titulo.trim(),
        setor_id: setorId ?? undefined,
        prioridade,
        prazo_tipo: prazoIso ? 'fixo' : 'sem',
        prazo_em: prazoIso,
        observacoes: observacoes.trim() || undefined,
        origem: delegadoPor.trim() ? 'delegada' : 'minha',
        delegado_por: delegadoPor.trim() || undefined,
      });
    } catch (e: any) {
      setErro(e?.message ?? 'Falha ao salvar');
      setLoading(false);
    }
  }

  const setorSelecionado = setores.find((s) => s.id === setorId);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Título */}
        <Field label="Título">
          <TextInput
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Ex: Revisar proposta XYZ"
            placeholderTextColor="rgba(255,255,255,0.30)"
            style={styles.input}
            autoFocus
          />
        </Field>

        {/* Setor */}
        <Field label="Setor">
          <Pressable
            onPress={() => setShowSetorList((v) => !v)}
            style={[styles.input, styles.pickerRow]}>
            {setorSelecionado ? (
              <View style={styles.pickerSelected}>
                <View style={[styles.dot, { backgroundColor: setorSelecionado.cor }]} />
                <ThemedText type="default">{setorSelecionado.nome}</ThemedText>
              </View>
            ) : (
              <ThemedText type="default" themeColor="textMuted">
                Nenhum setor
              </ThemedText>
            )}
            <ChevronDown size={16} color="rgba(255,255,255,0.45)" />
          </Pressable>
          {showSetorList && (
            <View style={styles.setorList}>
              <Pressable
                onPress={() => {
                  setSetorId(null);
                  setShowSetorList(false);
                }}
                style={styles.setorOpt}>
                <View style={[styles.dot, { backgroundColor: '#6B7280' }]} />
                <ThemedText type="default" themeColor="textSecondary">
                  Nenhum
                </ThemedText>
              </Pressable>
              {setores.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => {
                    setSetorId(s.id);
                    setShowSetorList(false);
                  }}
                  style={styles.setorOpt}>
                  <View style={[styles.dot, { backgroundColor: s.cor }]} />
                  <ThemedText type="default">{s.nome}</ThemedText>
                </Pressable>
              ))}
            </View>
          )}
        </Field>

        {/* Prioridade */}
        <Field label="Prioridade">
          <View style={styles.prioridadeRow}>
            {PRIORIDADES.map((p) => {
              const ativo = p === prioridade;
              return (
                <Pressable
                  key={p}
                  onPress={() => setPrioridade(p)}
                  style={[
                    styles.prioridadeChip,
                    {
                      borderColor: ativo ? PRIORIDADE_CORES[p] : 'transparent',
                      backgroundColor: ativo
                        ? PRIORIDADE_CORES[p] + '22'
                        : 'rgba(255,255,255,0.05)',
                    },
                  ]}>
                  <View style={[styles.dot, { backgroundColor: PRIORIDADE_CORES[p] }]} />
                  <ThemedText
                    type="small"
                    themeColor={ativo ? 'text' : 'textSecondary'}
                    style={{ fontWeight: ativo ? '600' : '500' }}>
                    {PRIORIDADE_LABELS[p]}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </Field>

        {/* Prazo (texto simples por ora — date picker depois) */}
        <Field label="Prazo (opcional)" hint="Ex: 30/05/2026 ou 30/05/2026 14:00">
          <TextInput
            value={prazo}
            onChangeText={setPrazo}
            placeholder="dd/mm/aaaa  [HH:mm]"
            placeholderTextColor="rgba(245,241,237,0.30)"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
          />
        </Field>

        {/* Delegado por */}
        <Field label="Delegado por (opcional)" hint="Quem te passou essa tarefa">
          <TextInput
            value={delegadoPor}
            onChangeText={setDelegadoPor}
            placeholder="Ex: Pai, Michele"
            placeholderTextColor="rgba(255,255,255,0.30)"
            style={styles.input}
          />
        </Field>

        {/* Observações */}
        <Field label="Observações">
          <TextInput
            value={observacoes}
            onChangeText={setObservacoes}
            placeholder="Notas livres, contexto, detalhes..."
            placeholderTextColor="rgba(255,255,255,0.30)"
            style={[styles.input, styles.textarea]}
            multiline
            textAlignVertical="top"
          />
        </Field>

        {erro && (
          <ThemedText type="small" style={{ color: '#EF4444' }}>
            {erro}
          </ThemedText>
        )}

        {/* Botões */}
        <View style={styles.actions}>
          <Pressable
            onPress={onCancel}
            disabled={loading}
            style={[styles.btn, styles.btnSecundario]}>
            <ThemedText type="default" themeColor="textSecondary">
              Cancelar
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={submeter}
            disabled={loading || !titulo.trim()}
            style={[
              styles.btn,
              styles.btnPrimario,
              (loading || !titulo.trim()) && { opacity: 0.5 },
            ]}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText type="default" style={{ color: 'white', fontWeight: '600' }}>
                {submitLabel}
              </ThemedText>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldLabel}>
        <ThemedText type="small" themeColor="textSecondary">
          {label}
        </ThemedText>
        {hint && (
          <ThemedText type="small" themeColor="textMuted" style={{ fontSize: 11 }}>
            {hint}
          </ThemedText>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  field: { gap: Spacing.two },
  fieldLabel: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.md,
    padding: Spacing.three,
    color: 'rgba(255,255,255,0.87)',
    fontSize: 16,
  },
  textarea: { minHeight: 100 },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  setorList: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.md,
    padding: Spacing.one,
    gap: 2,
  },
  setorOpt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.sm,
  },
  prioridadeRow: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
  prioridadeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  actions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three },
  btn: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecundario: { backgroundColor: 'rgba(255,255,255,0.08)' },
  btnPrimario: { backgroundColor: '#3B82F6' },
});
