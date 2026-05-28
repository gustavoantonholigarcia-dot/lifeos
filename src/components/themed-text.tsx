import { StyleSheet, Text, type TextProps } from 'react-native';

import { ThemeColor, TypeScale } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'titleMD'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'link'
    | 'linkPrimary'
    | 'code'
    | 'display'        // Spectral italic — saudações editoriais
    | 'displayLG'      // Spectral italic medium
    | 'meta'           // JetBrains Mono uppercase tracking
    | 'mono';          // JetBrains Mono regular
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'titleMD' && styles.titleMD,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        type === 'display' && styles.display,
        type === 'displayLG' && styles.displayLG,
        type === 'meta' && styles.meta,
        type === 'mono' && styles.mono,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // ---- Body & captions (Inter) ----
  default: {
    fontFamily: 'Inter_500Medium',
    ...TypeScale.body,
  },
  small: {
    fontFamily: 'Inter_500Medium',
    ...TypeScale.caption,
  },
  smallBold: {
    fontFamily: 'Inter_600SemiBold',
    ...TypeScale.caption,
  },
  // ---- Titles (Inter SemiBold) ----
  title: {
    fontFamily: 'Inter_600SemiBold',
    ...TypeScale.titleLG,
    letterSpacing: -0.2,
  },
  titleMD: {
    fontFamily: 'Inter_600SemiBold',
    ...TypeScale.titleMD,
  },
  // ---- Subtitle ainda usado: substituto leve por display ----
  subtitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  // ---- Display editorial (Spectral italic) ----
  display: {
    fontFamily: 'Spectral-Medium-Italic',
    ...TypeScale.displayXL,
    letterSpacing: -0.5,
  },
  displayLG: {
    fontFamily: 'Spectral-Medium-Italic',
    ...TypeScale.displayLG,
    letterSpacing: -0.3,
  },
  // ---- Meta (mono uppercase tracking) ----
  meta: {
    fontFamily: 'JetBrainsMono-Regular',
    ...TypeScale.meta,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  mono: {
    fontFamily: 'JetBrainsMono-Regular',
    ...TypeScale.mono,
  },
  // ---- Links ----
  link: { lineHeight: 22, fontSize: 14 },
  linkPrimary: { lineHeight: 22, fontSize: 14, color: '#E8B4A0' },
  // ---- Code ----
  code: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    fontWeight: '500',
  },
});
