import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { FabGradient, Shadow, Spacing } from '@/constants/theme';

type FabProps = {
  onPress: () => void;
  children: ReactNode;
  /** Sobrescreve o gradiente peach→honey por uma cor sólida (ex: cor do módulo). */
  color?: string;
  style?: ViewStyle;
};

/**
 * FAB do LifeOS — único elemento com gradiente (peach→honey, 135deg) e sombra colorida.
 * Source-of-truth: design system (FabGradient + Shadow.fab).
 */
export function Fab({ onPress, children, color, style }: FabProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrapper,
        Shadow.fab,
        color ? { shadowColor: color } : null,
        pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
        style,
      ]}>
      <LinearGradient
        colors={color ? [color, color] : FabGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        {children}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: Spacing.three,
    bottom: Spacing.three,
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  gradient: {
    flex: 1,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
