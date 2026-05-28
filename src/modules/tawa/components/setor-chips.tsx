import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';

import type { SetorTawa } from '../types';

type Props = {
  setores: SetorTawa[];
  selecionado: string | null; // setor_id | null = "Todos"
  onSelect: (id: string | null) => void;
};

export function SetorChips({ setores, selecionado, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      <Chip
        label="Todos"
        ativo={selecionado === null}
        cor="#6B7280"
        onPress={() => onSelect(null)}
      />
      {setores.map((s) => (
        <Chip
          key={s.id}
          label={s.nome}
          ativo={selecionado === s.id}
          cor={s.cor}
          onPress={() => onSelect(s.id)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({
  label,
  ativo,
  cor,
  onPress,
}: {
  label: string;
  ativo: boolean;
  cor: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View
        style={[
          styles.chip,
          { borderColor: ativo ? cor : 'transparent' },
          ativo && { backgroundColor: cor + '22' },
        ]}>
        <View style={[styles.dot, { backgroundColor: cor }]} />
        <ThemedText
          type="small"
          themeColor={ativo ? 'text' : 'textSecondary'}
          style={{ fontWeight: ativo ? '600' : '500' }}>
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.lg,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
