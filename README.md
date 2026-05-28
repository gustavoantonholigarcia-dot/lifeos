# LifeOS

App pessoal do Gustavo pra organizar TAWA, UTFPR, RUAH, treinos, projetos e intercâmbio.

> Status: **Fase 0 — Setup** (50% concluído, aguardando config Supabase)
> Spec completo: `/Users/gustavogarcia/docs/superpowers/specs/2026-05-26-lifeOS-design.md`
> Ideias da Fase 1: `docs/ideias-fase1.md`

## Setup local

### Pré-requisitos
- Node.js 22+ (instalado via `brew install node`)
- Watchman (instalado via `brew install watchman`)
- Expo Go no iPhone (App Store)
- Conta Supabase (free tier)

### Configuração inicial

1. **Criar projeto Supabase**
   - https://supabase.com/dashboard → New project
   - Name: `lifeos`, Region: São Paulo, Free
   - Settings → API → copiar **URL** + **anon key**

2. **Configurar credenciais**
   Editar `app.json`:
   ```json
   "extra": {
     "supabaseUrl": "https://SEUPROJETO.supabase.co",
     "supabaseAnonKey": "eyJ..."
   }
   ```

3. **Rodar schema**
   No SQL Editor do Supabase, colar e rodar:
   - `db/001_schema_inicial.sql`

4. **Habilitar Email Auth**
   - Authentication → Providers → Email (já vem ligado)
   - Authentication → Settings → desligar "Confirm email" (pra dev)

### Rodar o app

```bash
cd /Users/gustavogarcia/lifeOS
npx expo start
```

- Aparece QR code no terminal
- Abre Expo Go no iPhone → escaneia QR
- App carrega

## Estrutura

```
src/
├── app/                # Telas (Expo Router file-based)
├── components/         # Reuso compartilhado
├── constants/theme.ts  # Cores + módulos + spacing
├── modules/            # Lógica isolada por módulo
│   ├── tawa/
│   ├── treinos/
│   ├── utfpr/
│   ├── ruah/
│   ├── projetos/
│   └── intercambio/
├── shared/
│   ├── supabase/       # Client + queries
│   ├── notifications/
│   └── query-client.ts # TanStack Query
└── hooks/

assets/
├── images/             # Ícones do template Expo
└── logos/              # TAWA, UTFPR, RUAH (PNG)

db/                     # SQL migrations pro Supabase
docs/                   # Notas de design e ideias
```

## Roadmap

- [x] **Fase 0** Setup ambiente
- [ ] **Fase 1** TAWA completa + Tela Hoje + Quick Capture
- [ ] **GATE 21 dias** medir KPI (≥4 dias/semana abrindo)
- [ ] **Fase 2** Treinos
- [ ] **Fase 3** UTFPR (Edge Function Moodle) + RUAH
- [ ] **Fase 4** Projetos + Intercâmbio + Timeline
- [ ] **Fase 5** Polish

## Convenções

- **Idioma:** pt-BR em UI e schema
- **Tema:** dark-only (sem toggle)
- **Estilos:** StyleSheet nativo (sem Tamagui/NativeWind)
- **Estado:** useState + Context (Zustand se sentir falta)
- **Server state:** TanStack Query
- **Drag-and-drop:** fractional-indexing (string, não int)
- **Integrações externas:** Edge Functions Supabase (NUNCA localhost)

## Comandos úteis

```bash
npx expo start              # dev server (QR code)
npx tsc --noEmit            # typecheck
npx expo lint               # lint
npm run reset-project       # cuidado: zera projeto
```
