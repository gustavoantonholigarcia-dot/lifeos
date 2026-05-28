@AGENTS.md

# LifeOS — Contexto do Projeto

App pessoal do Gustavo (19 anos, estudante UTFPR, sucessor TAWA) pra organizar:
TAWA (trabalho — principal), Treinos (Judo/Jiu/Tênis/Academia), UTFPR, RUAH (igreja), Projetos, Intercâmbio.

## Stack
- Expo 56 + React Native + TypeScript
- Expo Router (file-based)
- Supabase (Postgres + Auth + Edge Functions)
- TanStack Query (server state)
- expo-notifications + expo-haptics
- Dark-only (sem light mode toggle)
- StyleSheet nativo (sem Tamagui/NativeWind)
- fractional-indexing pra drag-and-drop

## Estrutura de pastas
```
src/
├── app/                 # Telas (Expo Router)
│   ├── _layout.tsx      # QueryClientProvider + DarkTheme + AppTabs
│   ├── index.tsx        # Tab "Hoje"
│   ├── tawa.tsx
│   ├── treinos.tsx
│   └── mais.tsx
├── components/          # Compartilhados (themed-text, themed-view, app-tabs, etc.)
├── constants/theme.ts   # Cores, módulos, spacing
├── modules/             # Lógica isolada por módulo (tawa, treinos, utfpr, ruah, projetos, intercambio)
├── shared/              # supabase/, query-client.ts, notifications/
└── hooks/
assets/logos/            # tawa.png, utfpr.png, ruah.png
db/                      # SQLs pra rodar no Supabase
```

## Fases
- Fase 0 (atual): Setup. Login + 4 tabs vazias + tema dark
- Fase 1: TAWA completa + Tela Hoje funcional + Quick Capture + notificações
- GATE 21 dias: medir KPI primário (≥4 dias/semana abrindo o app)
- Fase 2+: só se passar no GATE

## Spec completo
`/Users/gustavogarcia/docs/superpowers/specs/2026-05-26-lifeOS-design.md`

## Convenções
- Português brasileiro em UI e nomes de tabelas/colunas
- Cores por módulo em `constants/theme.ts` (Modules.tawa.accent, etc.)
- Componentes themed usam `useTheme()` (sempre retorna dark)
- Nunca usar `localhost` em integrações (app mobile não fala com localhost fora do Wi-Fi)
- Moodle: via Edge Function no Supabase (Fase 3), não Flask local
