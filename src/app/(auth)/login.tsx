import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { signInWithEmail, signUpWithEmail } from '@/shared/auth/use-auth';

export default function LoginScreen() {
  const [modo, setModo] = useState<'login' | 'cadastro'>('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function submeter() {
    setErro(null);
    setLoading(true);
    try {
      if (modo === 'login') {
        await signInWithEmail(email, senha);
        // Não chamamos router.replace: o (tabs)/_layout detecta a nova sessão
        // via onAuthStateChange e o usuário sai do (auth) automaticamente.
      } else {
        const data = await signUpWithEmail(email, senha, nome);
        if (!data.session) {
          // Email confirmation está ligado no Supabase — usuário precisa confirmar
          setErro(
            'Conta criada! Confira seu email pra confirmar e depois entre. ' +
              '(Pra dev: desligue "Confirm email" em Authentication → Settings)',
          );
          setModo('login');
        }
        // Se data.session existe, o auth gate redireciona automaticamente.
      }
    } catch (e: any) {
      setErro(e?.message ?? 'Falha ao autenticar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.form}>
          <View style={styles.header}>
            <ThemedText type="display" style={{ fontSize: 44, lineHeight: 48, textAlign: 'center' }}>
              LifeOS
            </ThemedText>
            <ThemedText type="meta" themeColor="textSecondary" style={{ textAlign: 'center', marginTop: 12 }}>
              {modo === 'login' ? 'Entrar' : 'Criar conta'}
            </ThemedText>
          </View>

          {modo === 'cadastro' && (
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome"
              placeholderTextColor="rgba(255,255,255,0.30)"
              style={styles.input}
              autoCapitalize="words"
            />
          )}

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="rgba(255,255,255,0.30)"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <TextInput
            value={senha}
            onChangeText={setSenha}
            placeholder="Senha"
            placeholderTextColor="rgba(255,255,255,0.30)"
            style={styles.input}
            secureTextEntry
          />

          {erro && (
            <ThemedText type="small" style={{ color: '#EF4444' }}>
              {erro}
            </ThemedText>
          )}

          <Pressable
            onPress={submeter}
            disabled={loading || !email || !senha}
            style={({ pressed }) => [
              styles.button,
              (loading || !email || !senha) && styles.buttonDisabled,
              pressed && !loading && styles.buttonPressed,
            ]}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText type="default" style={styles.buttonText}>
                {modo === 'login' ? 'Entrar' : 'Criar conta'}
              </ThemedText>
            )}
          </Pressable>

          <Pressable onPress={() => setModo(modo === 'login' ? 'cadastro' : 'login')}>
            <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
              {modo === 'login'
                ? 'Não tenho conta — criar agora'
                : 'Já tenho conta — entrar'}
            </ThemedText>
          </Pressable>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, padding: Spacing.four },
  form: { flex: 1, justifyContent: 'center', gap: Spacing.three },
  header: { alignItems: 'center', gap: Spacing.one, marginBottom: Spacing.four },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.md,
    padding: Spacing.three,
    color: 'rgba(255,255,255,0.87)',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: Spacing.three,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: 'white', fontWeight: '600' },
});
