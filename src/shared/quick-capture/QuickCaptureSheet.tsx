import { Sparkles, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Modules, Radius, Spacing } from '@/constants/theme';
import { useCriarTarefa } from '@/modules/tawa/queries';
import { formatarPrazoRelativo } from '@/shared/format/date';

import { classificarModulo, detectarPrioridade } from './classify';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function QuickCaptureSheet({ visible, onClose }: Props) {
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const criar = useCriarTarefa();

  const classificacao = texto.trim().length > 3 ? classificarModulo(texto) : null;
  const prioridade = texto.trim().length > 3 ? detectarPrioridade(texto) : 'sem';
  const moduloLabel = classificacao
    ? Modules[classificacao.modulo as keyof typeof Modules]?.label
    : null;
  const moduloCor = classificacao
    ? Modules[classificacao.modulo as keyof typeof Modules]?.accent
    : undefined;

  async function submeter() {
    if (!texto.trim() || !classificacao || loading) return;
    Keyboard.dismiss();
    setErro(null);
    setLoading(true);
    try {
      const modulo = classificacao.modulo === 'projeto' ? 'projeto' : classificacao.modulo;
      await criar.mutateAsync({
        modulo,
        titulo: texto.trim(),
        prioridade,
        prazo_tipo: classificacao.prazo_em ? 'fixo' : 'sem',
        prazo_em: classificacao.prazo_em,
        origem: 'minha',
      });
      setTexto('');
      onClose();
    } catch (e: any) {
      setErro(e?.message ?? 'Falha ao salvar');
    } finally {
      setLoading(false);
    }
  }

  function fechar() {
    Keyboard.dismiss();
    setTexto('');
    setErro(null);
    onClose();
  }

  const podeEnviar = texto.trim().length > 3 && !loading;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={fechar}>
      <View style={styles.container}>
        {/* Header — botão Capturar SEMPRE visível, acima do teclado */}
        <View style={styles.header}>
          <Pressable onPress={fechar} hitSlop={12} style={styles.headerBtn}>
            <X size={22} color={'rgba(245,241,237,0.65)' as any} />
          </Pressable>

          <View style={styles.headerCenter}>
            <View style={styles.headerIcon}>
              <Sparkles size={14} color={'#E8B4A0' as any} />
            </View>
            <ThemedText type="display" style={{ fontSize: 17, lineHeight: 22 }}>
              Captura rápida
            </ThemedText>
          </View>

          <Pressable
            onPress={submeter}
            disabled={!podeEnviar}
            hitSlop={12}
            style={[styles.headerBtn, !podeEnviar && { opacity: 0.35 }]}>
            {loading ? (
              <ActivityIndicator color="#E8B4A0" size="small" />
            ) : (
              <ThemedText
                type="small"
                style={{ color: '#E8B4A0', fontWeight: '700', fontSize: 15 }}>
                Capturar
              </ThemedText>
            )}
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive">
            {/* Toque fora do input fecha teclado */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <View>
                <TextInput
                  value={texto}
                  onChangeText={setTexto}
                  placeholder="O que você precisa fazer?"
                  placeholderTextColor="rgba(245,241,237,0.30)"
                  style={styles.input}
                  autoFocus
                  multiline
                  textAlignVertical="top"
                  returnKeyType="done"
                  blurOnSubmit
                  onSubmitEditing={Keyboard.dismiss}
                />

                {/* Preview */}
                {classificacao && (
                  <View style={styles.preview}>
                    <View style={styles.previewRow}>
                      <ThemedText
                        type="small"
                        themeColor="textSecondary"
                        style={styles.previewLabel}>
                        MÓDULO
                      </ThemedText>
                      <View
                        style={[
                          styles.tag,
                          { backgroundColor: (moduloCor ?? '#888') + '22' },
                        ]}>
                        <View style={[styles.dot, { backgroundColor: moduloCor }]} />
                        <ThemedText
                          type="small"
                          style={{ color: moduloCor, fontWeight: '600' }}>
                          {moduloLabel}
                        </ThemedText>
                      </View>
                      {classificacao.confianca === 'baixa' && (
                        <ThemedText
                          type="small"
                          themeColor="textMuted"
                          style={{ fontStyle: 'italic' }}>
                          (chute)
                        </ThemedText>
                      )}
                    </View>

                    {prioridade !== 'sem' && (
                      <View style={styles.previewRow}>
                        <ThemedText
                          type="small"
                          themeColor="textSecondary"
                          style={styles.previewLabel}>
                          PRIORIDADE
                        </ThemedText>
                        <ThemedText
                          type="small"
                          style={{
                            color:
                              prioridade === 'alta'
                                ? '#C97064'
                                : prioridade === 'baixa'
                                ? '#8FA8B8'
                                : '#D4A574',
                            fontWeight: '600',
                          }}>
                          {prioridade === 'alta'
                            ? 'Alta'
                            : prioridade === 'baixa'
                            ? 'Baixa'
                            : 'Média'}
                        </ThemedText>
                      </View>
                    )}

                    {classificacao.prazo_em && (
                      <View style={styles.previewRow}>
                        <ThemedText
                          type="small"
                          themeColor="textSecondary"
                          style={styles.previewLabel}>
                          PRAZO
                        </ThemedText>
                        <ThemedText type="small" style={{ color: '#D4A574' }}>
                          {formatarPrazoRelativo(classificacao.prazo_em).texto}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                )}

                {erro && (
                  <ThemedText
                    type="small"
                    style={{ color: '#C97064', paddingTop: Spacing.two }}>
                    {erro}
                  </ThemedText>
                )}

                {/* Hint quando vazio */}
                {!texto.trim() && (
                  <View style={styles.hint}>
                    <ThemedText type="meta" themeColor="textSecondary" style={{ marginBottom: 8 }}>
                      Como escrever
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" style={{ lineHeight: 22 }}>
                      "Email pro cliente XYZ amanhã 14h"{'\n'}
                      "Urgente: revisar contrato jurídico"{'\n'}
                      "Estudar pra prova de Computação sexta"
                    </ThemedText>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1917' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245,241,237,0.06)',
  },
  headerBtn: {
    minWidth: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(232,180,160,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  input: {
    fontSize: 22,
    lineHeight: 30,
    color: 'rgba(245,241,237,0.87)',
    minHeight: 120,
    paddingVertical: Spacing.two,
  },
  preview: {
    backgroundColor: 'rgba(245,241,237,0.05)',
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  previewLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    width: 78,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  hint: {
    padding: Spacing.three,
    backgroundColor: 'rgba(245,241,237,0.03)',
    borderRadius: Radius.md,
    marginTop: Spacing.two,
  },
});
