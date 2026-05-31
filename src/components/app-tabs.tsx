import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors, Warm } from '@/constants/theme';
import { GATE_PASSOU } from '@/constants/gate';

export default function AppTabs() {
  const colors = Colors.dark;

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      tintColor={Warm.honey}
      iconColor={{ default: colors.textMuted, selected: Warm.honey }}
      labelStyle={{ selected: { color: Warm.honey } }}>
      <NativeTabs.Trigger name="index">
        <Label>Hoje</Label>
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="tawa">
        <Label>TAWA</Label>
        <Icon sf={{ default: 'briefcase', selected: 'briefcase.fill' }} />
      </NativeTabs.Trigger>

      {/* UTFPR fica visível: uso acadêmico diário, fora do congelamento do GATE */}
      <NativeTabs.Trigger name="utfpr">
        <Label>UTFPR</Label>
        <Icon sf={{ default: 'graduationcap', selected: 'graduationcap.fill' }} />
      </NativeTabs.Trigger>

      {/* Treinos: oculto até passar no GATE (ver constants/gate.ts) */}
      {GATE_PASSOU && (
        <NativeTabs.Trigger name="treinos">
          <Label>Treinos</Label>
          <Icon sf={{ default: 'figure.run', selected: 'figure.run' }} />
        </NativeTabs.Trigger>
      )}

      <NativeTabs.Trigger name="mais">
        <Label>Mais</Label>
        <Icon sf={{ default: 'ellipsis', selected: 'ellipsis' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
