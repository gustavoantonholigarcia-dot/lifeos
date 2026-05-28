/**
 * LifeOS — Design System v2
 * Source-of-truth: docs/design-system/colors_and_type.css + README.md
 * Anchor: "diário manuscrito iluminado por lâmpada de mesa à noite"
 */

import '@/global.css';

import { Platform } from 'react-native';

// ============================================================
// Surfaces — warm stone (todo com pingo de marrom)
// ============================================================
const dark = {
  text: '#F5F1ED',                          // off-white pergaminho (nunca #FFF)
  textSecondary: 'rgba(245,241,237,0.62)',  // text-mute
  textMuted: 'rgba(245,241,237,0.40)',      // text-dim
  background: '#1C1917',                    // bg
  backgroundElement: '#292524',             // elev-1
  backgroundElevated: '#3A332E',            // elev-2
  backgroundSelected: '#44403C',
  border: 'rgba(245,241,237,0.08)',         // line
  borderStrong: 'rgba(245,241,237,0.14)',   // line-strong
} as const;

export const Colors = {
  light: dark,
  dark,
} as const;

// ============================================================
// Acentos warm — só pra detalhes (FAB, halos, microhighlights)
// ============================================================
export const Warm = {
  peach: '#E8B4A0',
  sage: '#A8B5A0',
  honey: '#D4A574',
  cream: '#F5E6D3',
  terracotta: '#C97064',
  lavender: '#B89FD9',
} as const;

// ============================================================
// Cores semânticas (prioridade)
// ============================================================
export const Semantic = {
  priorityHigh: '#E04830',     // vermilion · vermelho vivo (não fluo)
  priorityMedium: '#E8A845',   // amber
  priorityLow: '#8FA899',      // sage · verde-warm calmo
  priorityNone: '#78716C',     // stone-500

  success: '#8FA899',
  warning: '#E8A845',
  danger: '#E04830',
  info: '#6B8FB8',
} as const;

// ============================================================
// Cores por módulo (warm-shifted, "uma cor por área")
// ============================================================
export const Modules = {
  tawa: {
    primary: '#1B3654',
    accent: '#6B8FB8',          // navy suave
    label: 'TAWA',
  },
  utfpr: {
    primary: '#000000',
    accent: '#E8B96B',          // amarelo warm
    label: 'UTFPR',
  },
  ruah: {
    primary: '#4F46E5',
    accent: '#F2E7D2',          // warm ivory (era lavender)
    label: 'RUAH',
  },
  treinos: {
    primary: '#22C55E',
    accent: '#87A878',          // sage
    label: 'Treinos',
  },
  projetos: {
    primary: '#06B6D4',
    accent: '#7BB5C2',          // dusty teal
    label: 'Projetos',
  },
  intercambio: {
    primary: '#F59E0B',
    accent: '#D4A574',          // honey
    label: 'Intercâmbio',
  },
  estudos: {
    primary: '#8B5CF6',
    accent: '#B89FD9',          // dusty lavender
    label: 'Estudos',
  },
} as const;

export type ModuleKey = keyof typeof Modules;
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// ============================================================
// Tipografia — Spectral (display italic) + Inter (body) + JBM (meta)
// ============================================================
export const Fonts = Platform.select({
  ios: {
    display: 'Spectral-Italic',              // carregado via expo-font no _layout
    displayFallback: 'ui-serif',
    sans: 'Inter',
    sansFallback: 'system-ui',
    rounded: 'ui-rounded',
    mono: 'JetBrainsMono-Regular',
    monoFallback: 'ui-monospace',
  },
  default: {
    display: 'serif',
    displayFallback: 'serif',
    sans: 'normal',
    sansFallback: 'normal',
    rounded: 'normal',
    mono: 'monospace',
    monoFallback: 'monospace',
  },
});

// ============================================================
// Type scale (mobile, do design system)
// ============================================================
export const TypeScale = {
  displayXL: { fontSize: 36, lineHeight: 40 },
  displayLG: { fontSize: 28, lineHeight: 32 },
  titleLG: { fontSize: 20, lineHeight: 24 },
  titleMD: { fontSize: 17, lineHeight: 22 },
  body: { fontSize: 15, lineHeight: 22 },
  caption: { fontSize: 13, lineHeight: 18 },
  meta: { fontSize: 11, lineHeight: 14 },
  mono: { fontSize: 13, lineHeight: 18 },
} as const;

// ============================================================
// Spacing — 4-base scale
// ============================================================
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// ============================================================
// Radius — squircles generosos (nunca 4-8px)
// ============================================================
export const Radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  full: 999,
} as const;

// ============================================================
// Motion
// ============================================================
export const Motion = {
  durMicro: 120,
  durFast: 180,
  durMed: 240,
  durSlow: 320,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
