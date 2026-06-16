import { router } from 'expo-router';
import { Phone } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Modules, Radius, Spacing } from '@/constants/theme';
import { corReceptividade, type Contato } from '@/modules/tawa/crm/types';
import { useContatos } from '@/modules/tawa/crm/queries';
import { formatarDataCurta } from '@/shared/format/date';

const ACCENT = Modules.tawa.accent;

function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Radar de follow-up: contatos do CRM com próximo passo vencendo hoje ou
 * atrasado. Puxa o trabalho de prospecção pra tela inicial — o app cobra,
 * você não precisa lembrar de abrir contato por contato.
 */
export function FollowUpSection() {
  const { data: contatos } = useContatos();
  const hoje = hojeISO();

  const pendentes = useMemo(() => {
    return (contatos ?? [])
      .filter(
        (c) =>
          c.proximo_passo &&
          c.proximo_passo_em != null &&
          c.proximo_passo_em.slice(0, 10) <= hoje &&
          c.status !== 'ganho' &&
          c.status !== 'perdido',
      )
      .sort((a, b) => (a.proximo_passo_em ?? '').localeCompare(b.proximo_passo_em ?? ''));
  }, [contatos, hoje]);

  // Seção some quando não há nada a cobrar — não polui a Hoje.
  if (pendentes.length === 0) return null;

  const atrasados = pendentes.filter((c) => (c.proximo_passo_em ?? '').slice(0, 10) < hoje).length;

  return (
    <ThemedView type="backgroundElement" style={[styles.container, { borderLeftColor: ACCENT }]}>
      <View style={styles.header}>
        <ThemedText type="meta" style={{ color: ACCENT }}>
          CONTATAR HOJE
        </ThemedText>
        <ThemedText
          type="mono"
          style={[styles.counter, atrasados > 0 && { color: '#E04830' }]}>
          {atrasados > 0 ? `${atrasados} atrasado${atrasados > 1 ? 's' : ''}` : `${pendentes.length}`}
        </ThemedText>
      </View>

      {pendentes.map((c) => (
        <Linha key={c.id} contato={c} hoje={hoje} />
      ))}
    </ThemedView>
  );
}

function Linha({ contato, hoje }: { contato: Contato; hoje: string }) {
  const prazo = (contato.proximo_passo_em ?? '').slice(0, 10);
  const atrasado = prazo < hoje;
  const rec = contato.receptividade;

  return (
    <Pressable
      style={styles.linha}
      onPress={() => router.push(`/modules/tawa/contatos/${contato.id}` as any)}>
      <View
        style={[
          styles.recDot,
          { backgroundColor: rec != null ? corReceptividade(rec) : 'rgba(245,241,237,0.18)' },
        ]}
      />
      <View style={styles.corpo}>
        <ThemedText type="default" numberOfLines={1}>
          {contato.nome}
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted" numberOfLines={1}>
          {contato.proximo_passo}
        </ThemedText>
      </View>
      <View style={styles.direita}>
        <ThemedText
          type="mono"
          style={[styles.prazo, atrasado && { color: '#E04830' }]}>
          {atrasado ? `atrasado · ${formatarDataCurta(prazo)}` : 'hoje'}
        </ThemedText>
        <Phone size={13} color={ACCENT as any} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
    borderRadius: Radius.lg,
    gap: Spacing.two,
    borderLeftWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counter: { fontSize: 10, color: 'rgba(245,241,237,0.45)' },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(245,241,237,0.08)',
  },
  recDot: { width: 7, height: 7, borderRadius: 3.5 },
  corpo: { flex: 1, gap: 2 },
  direita: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  prazo: { fontSize: 10, color: '#E8A845' },
});
