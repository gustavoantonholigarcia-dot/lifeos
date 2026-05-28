import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const colors = Colors.dark;

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <Label>Hoje</Label>
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="tawa">
        <Label>TAWA</Label>
        <Icon sf={{ default: 'briefcase', selected: 'briefcase.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="utfpr">
        <Label>UTFPR</Label>
        <Icon sf={{ default: 'graduationcap', selected: 'graduationcap.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="treinos">
        <Label>Treinos</Label>
        <Icon sf={{ default: 'figure.run', selected: 'figure.run' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="mais">
        <Label>Mais</Label>
        <Icon sf={{ default: 'ellipsis', selected: 'ellipsis' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
