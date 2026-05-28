import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
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
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useCriarSessao, useIdioma } from '@/modules/estudos/queries';
import { TIPO_LABELS, type TipoSessao } from '@/modules/estudos/types';
import { parsearDataBR } from '@/shared/format/date';

const TIPOS: TipoSessao[] = ['gramatica', 'leitura', 'audicao', 'fala', 'escrita', 'vocabulario', 'misto'];
const DURACOES_PRESET = [15, 30, 45, 60, 90, 120];

export default function NovaSessaoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const idiomaQ = useIdioma(id);
  const criar = useCriarSessao();

  const [duracao, setDuracao] = useState<number>(30);
  const [duracaoCustom, setDuracaoCustom] = useState('');
  const [tipo, setTipo] = useState<TipoSessao>('misto');
  const [fonte, setFonte] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [dataTexto, setDataTexto] = useState(''); // vazio = hoje
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const cor = idiomaQ.data?.cor ?? '#8B5CF6';

  async function submeter() {
    const minutos = duracaoCustom ? parseInt(duracaoCustom, 10) : duracao;
    if (!minutos || minutos <= 0) {
      setErro('Duração inválida');
      return;
    }

    let dataISO: string | undefined;
    if (dataTexto.trim()) {
      const parsed = parsearDataBR(dataTexto);
      if (!parsed) {
        setErro('Data inválida (dd/mm/aaaa)');
        return;
      }
      dataISO = parsed.toISOString().slice(0, 10); // YYYY-MM-DD pro Postgres DATE
    }

    setErro(null);
    setLoading(true);
    try {
      await criar.mutateAsync({
        idioma_id: id,
        duracao_min: minutos,
        tipo,
        fonte: fonte.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
        data: dataISO,
      });
      router.back();
    } catch (e: any) {
      setErro(e?.message ?? 'Falha ao salvar');
      setLoading(false);
    }
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: `Sessão · ${idiomaQ.data?.nome ?? ''}`,
          headerShown: true,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled">

          {/* Duração */}
          <View style={styles.field}>
            <Label>Duração (min)</Label>
            <View style={styles.pillRow}>
              {DURACOES_PRESET.map((m) => {
                const ativo = m === duracao && !duracaoCustom;
                return (
                  <Pressable
                    key={m}
                    onPress={() => {
                      setDuracao(m);
                      setDuracaoCustom('');
                    }}
                    style={[
                      styles.pill,
                      ativo && { backgroundColor: cor + '33', borderColor: cor },
                    ]}>
                    <ThemedText
                      type="default"
                      themeColor={ativo ? 'text' : 'textSecondary'}
                      style={{ fontWeight: ativo ? '700' : '500' }}>
                      {m}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              value={duracaoCustom}
              onChangeText={setDuracaoCustom}
              placeholder="Outro valor (minutos)"
              placeholderTextColor="rgba(245,241,237,0.30)"
              style={styles.input}
              keyboardType="number-pad"
            />
          </View>

          {/* Tipo */}
          <View style={styles.field}>
            <Label>Foco da sessão</Label>
            <View style={styles.pillRow}>
              {TIPOS.map((t) => {
                const ativo = t === tipo;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setTipo(t)}
                    style={[
                      styles.pill,
                      ativo && { backgroundColor: cor + '33', borderColor: cor },
                    ]}>
                    <ThemedText
                      type="small"
                      themeColor={ativo ? 'text' : 'textSecondary'}
                      style={{ fontWeight: ativo ? '600' : '500' }}>
                      {TIPO_LABELS[t]}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Data */}
          <View style={styles.field}>
            <Label>Data</Label>
            <TextInput
              value={dataTexto}
              onChangeText={setDataTexto}
              placeholder="Hoje (ou dd/mm/aaaa)"
              placeholderTextColor="rgba(245,241,237,0.30)"
              style={styles.input}
              keyboardType="numbers-and-punctuation"
            />
          </View>

          {/* Fonte */}
          <View style={styles.field}>
            <Label>Fonte (opcional)</Label>
            <TextInput
              value={fonte}
              onChangeText={setFonte}
              placeholder="Anki, Duolingo, Cambly, Aula particular..."
              placeholderTextColor="rgba(245,241,237,0.30)"
              style={styles.input}
            />
          </View>

          {/* Observações */}
          <View style={styles.field}>
            <Label>Observações</Label>
            <TextInput
              value={observacoes}
              onChangeText={setObservacoes}
              placeholder="O que estudou, dúvidas, palavras novas..."
              placeholderTextColor="rgba(245,241,237,0.30)"
              style={[styles.input, styles.textarea]}
              multiline
              textAlignVertical="top"
            />
          </View>

          {erro && (
            <ThemedText type="small" style={{ color: '#C97064' }}>
              {erro}
            </ThemedText>
          )}

          <View style={styles.actions}>
            <Pressable
              onPress={() => router.back()}
              disabled={loading}
              style={[styles.btn, styles.btnSecundario]}>
              <ThemedText type="default" themeColor="textSecondary">
                Cancelar
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={submeter}
              disabled={loading}
              style={[styles.btn, { backgroundColor: cor }, loading && { opacity: 0.5 }]}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <ThemedText type="default" style={{ color: 'white', fontWeight: '600' }}>
                  Registrar sessão
                </ThemedText>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <ThemedText
      type="small"
      themeColor="textSecondary"
      style={{ textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 11 }}>
      {children}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.four },
  field: { gap: Spacing.two },
  input: {
    backgroundColor: 'rgba(245,241,237,0.06)',
    borderRadius: Radius.md,
    padding: Spacing.three,
    color: 'rgba(245,241,237,0.87)',
    fontSize: 16,
  },
  textarea: { minHeight: 100 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  pill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(245,241,237,0.10)',
    backgroundColor: 'rgba(245,241,237,0.04)',
    minWidth: 50,
    alignItems: 'center',
  },
  actions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three },
  btn: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecundario: { backgroundColor: 'rgba(245,241,237,0.08)' },
});
