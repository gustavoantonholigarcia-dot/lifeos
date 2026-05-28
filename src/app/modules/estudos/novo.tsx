import { router, Stack } from 'expo-router';
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
import { useCriarIdioma } from '@/modules/estudos/queries';
import {
  IDIOMAS_SUGESTOES,
  NIVEIS,
  NIVEL_LABELS,
  type Nivel,
} from '@/modules/estudos/types';

const CORES = ['#8B5CF6', '#6B8FB8', '#E8B96B', '#87A878', '#C97064', '#7BB5C2'];

export default function NovoIdiomaScreen() {
  const criar = useCriarIdioma();

  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [bandeira, setBandeira] = useState('');
  const [nivelAtual, setNivelAtual] = useState<Nivel>('a1');
  const [nivelMeta, setNivelMeta] = useState<Nivel | null>(null);
  const [cor, setCor] = useState(CORES[0]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function aplicarSugestao(s: (typeof IDIOMAS_SUGESTOES)[number]) {
    setNome(s.nome);
    setCodigo(s.codigo);
    setBandeira(s.bandeira);
  }

  async function submeter() {
    if (!nome.trim()) {
      setErro('Nome obrigatório');
      return;
    }
    setErro(null);
    setLoading(true);
    try {
      await criar.mutateAsync({
        nome: nome.trim(),
        codigo: codigo.trim() || undefined,
        bandeira_emoji: bandeira.trim() || undefined,
        nivel_atual: nivelAtual,
        nivel_meta: nivelMeta ?? undefined,
        cor,
      });
      router.back();
    } catch (e: any) {
      setErro(e?.message ?? 'Falha ao criar');
      setLoading(false);
    }
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Novo idioma', headerShown: true }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled">

          {/* Sugestões rápidas */}
          <View style={styles.field}>
            <Label>Sugestões</Label>
            <View style={styles.sugestoes}>
              {IDIOMAS_SUGESTOES.map((s) => {
                const ativo = nome === s.nome;
                return (
                  <Pressable
                    key={s.nome}
                    onPress={() => aplicarSugestao(s)}
                    style={[
                      styles.sugestao,
                      ativo && { borderColor: cor, backgroundColor: cor + '22' },
                    ]}>
                    <ThemedText type="default">{s.bandeira}</ThemedText>
                    <ThemedText type="small" themeColor={ativo ? 'text' : 'textSecondary'}>
                      {s.nome}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Nome */}
          <View style={styles.field}>
            <Label>Nome do idioma</Label>
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Ex: Inglês"
              placeholderTextColor="rgba(245,241,237,0.30)"
              style={styles.input}
            />
          </View>

          {/* Bandeira */}
          <View style={styles.field}>
            <Label>Bandeira</Label>
            <TextInput
              value={bandeira}
              onChangeText={setBandeira}
              placeholder="🇬🇧"
              placeholderTextColor="rgba(245,241,237,0.30)"
              style={[styles.input, { fontSize: 22 }]}
              maxLength={4}
            />
          </View>

          {/* Nível atual */}
          <View style={styles.field}>
            <Label>Nível atual</Label>
            <View style={styles.pillRow}>
              {NIVEIS.map((n) => {
                const ativo = n === nivelAtual;
                return (
                  <Pressable
                    key={n}
                    onPress={() => setNivelAtual(n)}
                    style={[
                      styles.pill,
                      ativo && { backgroundColor: cor + '33', borderColor: cor },
                    ]}>
                    <ThemedText
                      type="small"
                      themeColor={ativo ? 'text' : 'textSecondary'}
                      style={{ fontWeight: ativo ? '600' : '500' }}>
                      {n.toUpperCase()}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
            <ThemedText type="small" themeColor="textMuted" style={{ marginTop: Spacing.one }}>
              {NIVEL_LABELS[nivelAtual]}
            </ThemedText>
          </View>

          {/* Nível meta */}
          <View style={styles.field}>
            <Label>Nível meta (opcional)</Label>
            <View style={styles.pillRow}>
              <Pressable
                onPress={() => setNivelMeta(null)}
                style={[
                  styles.pill,
                  nivelMeta === null && {
                    backgroundColor: 'rgba(245,241,237,0.10)',
                    borderColor: 'rgba(245,241,237,0.30)',
                  },
                ]}>
                <ThemedText
                  type="small"
                  themeColor={nivelMeta === null ? 'text' : 'textSecondary'}>
                  Sem meta
                </ThemedText>
              </Pressable>
              {NIVEIS.map((n) => {
                const ativo = n === nivelMeta;
                return (
                  <Pressable
                    key={n}
                    onPress={() => setNivelMeta(n)}
                    style={[
                      styles.pill,
                      ativo && { backgroundColor: cor + '33', borderColor: cor },
                    ]}>
                    <ThemedText
                      type="small"
                      themeColor={ativo ? 'text' : 'textSecondary'}
                      style={{ fontWeight: ativo ? '600' : '500' }}>
                      {n.toUpperCase()}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Cor */}
          <View style={styles.field}>
            <Label>Cor</Label>
            <View style={styles.pillRow}>
              {CORES.map((c) => {
                const ativo = c === cor;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setCor(c)}
                    style={[
                      styles.corSwatch,
                      { backgroundColor: c },
                      ativo && styles.corSwatchAtiva,
                    ]}
                  />
                );
              })}
            </View>
          </View>

          {erro && (
            <ThemedText type="small" style={{ color: '#C97064' }}>
              {erro}
            </ThemedText>
          )}

          {/* Botões */}
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
              disabled={loading || !nome.trim()}
              style={[
                styles.btn,
                { backgroundColor: cor },
                (loading || !nome.trim()) && { opacity: 0.5 },
              ]}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <ThemedText type="default" style={{ color: 'white', fontWeight: '600' }}>
                  Criar idioma
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
  sugestoes: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  sugestao: {
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
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  pill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(245,241,237,0.10)',
    backgroundColor: 'rgba(245,241,237,0.04)',
  },
  corSwatch: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  corSwatchAtiva: { borderColor: '#F5F1ED' },
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
