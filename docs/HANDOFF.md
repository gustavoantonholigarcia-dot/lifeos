# LifeOS — Handoff de Sessão

> **Use:** Cola este doc inteiro no início da nova sessão do Claude Code.

## Quem sou
Gustavo Antonholi Garcia, 19, estudante de Engenharia de Produção UTFPR Londrina, sucessor da TAWA Veículos Especiais (~R$100M/ano). Programo COM IA, não do zero. Mãe português brasileiro.

## O projeto
**LifeOS** — app pessoal iOS pra organizar todas as áreas da vida: TAWA (trabalho, principal), UTFPR, Treinos, RUAH (igreja), Estudos (idiomas), Projetos, Intercâmbio.

## Stack
- **Expo SDK 54** (React Native) + TypeScript
- **Expo Router** (file-based, com `(tabs)`, `(auth)`, `modules/`)
- **Supabase** (Postgres + Auth) — projeto `lifeos` (URL: `https://ycsyuatwxjuflxmgqajn.supabase.co`)
- **TanStack Query** (cache server state)
- **react-native-gesture-handler** (swipe)
- **expo-notifications** (notificações locais)
- **expo-haptics**
- **lucide-react-native** (ícones)
- **react-native-svg**
- Fontes: **Spectral** (display italic), **Inter** (body), **JetBrains Mono** (meta)
- Distribuição: **Expo Go** + LAN (sem build, sem loja)

## Localização
- Projeto: `/Users/gustavogarcia/lifeOS/`
- Spec: `/Users/gustavogarcia/docs/superpowers/specs/2026-05-26-lifeOS-design.md`
- Design system v2: `/Users/gustavogarcia/lifeOS/docs/design-system/`
- DB migrations: `/Users/gustavogarcia/lifeOS/db/` (4 arquivos já rodados no Supabase)
- Comando dev: `cd /Users/gustavogarcia/lifeOS && npx expo start --lan`

## Estado atual — features prontas ✅

### Fase 0 (setup) — 100%
- Node + Expo + Supabase config + auth (email/senha)
- 5 tabs nativas iOS (Hoje, TAWA, UTFPR, Treinos, Mais)
- Tema dark warm (anchor "diário sob lâmpada de mesa")

### Fase 1 (TAWA + Hoje + Quick Capture) — ~90%
- **TAWA tab:** lista, filtro por setor, status tabs, prioridade, prazo, observações
- **CRUD tarefas** com data BR (dd/mm/aaaa)
- **Interações TAWA:**
  - Tap no círculo = toggle concluído (haptic success)
  - Swipe → = toggle "em andamento" (amber)
  - Swipe ← = deletar (vermilion)
  - Tap card = editar
  - Long-press (100ms) = ActionSheet iOS nativo
- **Notificações locais:** 24h/1h/0h antes do prazo, salvas em `notificacoes_agendadas`, canceladas em delete/concluir
- **Quick Capture FAB** na Hoje: heurística regex local classifica módulo + prazo + prioridade
- **Agenda global** (`/agenda` route) com filtro por módulo, TAWA default. Acessível da Hoje + TAWA
- **Foco do Dia: ❌ placeholder ainda** ← falta isso pra fechar Fase 1

### Módulo Estudos (bônus, fora do spec original) — ~80%
- CRUD idiomas (com bandeira emoji, nível A1-C2, meta, cor)
- Sessões de estudo (duração, tipo: gramática/leitura/etc, fonte)
- Detalhe do idioma com estatísticas (tempo, dias, sessões)
- Form de certificações ainda não feito (schema existe)

### Telas com tipografia editorial aplicada
Hoje, TAWA, UTFPR, Mais, Treinos placeholder, Estudos (lista e detalhe), Login, Quick Capture, Agenda. Usam:
- `display` (Spectral italic 36/40)
- `displayLG` (Spectral italic 28/32)
- `meta` (JetBrains Mono uppercase tracking)
- `mono` (JBM regular)
- `default/title/titleMD` (Inter)

### Schema Supabase (rodado)
- `profiles`, `setores_tawa` (seed: 5 setores), `tarefas`, `prioridades_diarias`, `notificacoes_agendadas`
- `estudos_idiomas`, `estudos_sessoes`, `estudos_certificacoes` + view `estudos_idiomas_resumo`
- `anotacoes` (renomeada de `tawa_anotacoes`, com coluna `modulo`)
- Todas com RLS por `user_id = auth.uid()`

## Pendente

### Fase 1 (pequeno)
- **Foco do Dia funcional** — selecionar 3-5 tarefas TAWA/UTFPR pra fixar como prioridade do dia. Schema `prioridades_diarias` já existe.

### GATE 21 dias (crítico no spec)
- Não iniciado. Spec define: ≥4 dias/semana abrindo. Se passar → continua. Se não → mata sem culpa.

### Fases 2-5 (não tocadas)
- **Treinos** (Judô/Jiu/Tênis/Academia) — placeholder
- **UTFPR funcional** (disciplinas + Moodle Edge Function) — placeholder com hardcoded cards
- **RUAH** funcional — placeholder
- **Projetos** funcional — placeholder
- **Intercâmbio** checklist — placeholder
- **Certificações Estudos** UI — schema pronto, form não feito
- **Widget iOS** — cortado do spec (incompatível Expo Go)
- **IA Quick Capture** — heurística local resolve, IA cortada
- **Review semanal automático** — pendente
- **Edge Function "resumo da manhã 8h"** — pendente

## Recomendação no fim da última sessão
**A) Foco do Dia → iniciar GATE 21 dias.** Razão: spec foi explícito que o gate é crítico antes de mais features. Sem validação de uso real, qualquer feature adicional é risco de sunk cost.

## Como iniciar nova sessão

1. **Subir Expo:**
```bash
cd /Users/gustavogarcia/lifeOS && npx expo start --lan
```
2. **Gerar QR:**
```bash
IP=$(ipconfig getifaddr en0) && qrencode -o /tmp/lifeos-qr.png -s 14 "exp://${IP}:8081" && open /tmp/lifeos-qr.png
```
3. **Escanear no iPhone** (Expo Go, mesmo Wi-Fi do Mac)
4. Login com Supabase já configurado

## Voz e estilo de código
- Português brasileiro em UI e nomes (`tarefas`, `setores_tawa`, `observacoes`)
- Sem emojis em UI (design system v2 proibe)
- Microcopy editorial calma: "Salvo." não "Sucesso!"
- Sentence case nos botões/títulos
- Cantos squircle 10/16/22/28, nunca 4-8px
- Cores no design system: surfaces stone warm, prioridade alta = vermilion `#E04830`, sage `#8FA899`, peach `#E8B4A0`, etc.

## Tom comigo
- Direto, sem enrolação
- Português BR
- Sempre terminar análises com ação concreta
- Usar skills relevantes (desafiar, simplify, ideias quando faz sentido)
- Não fazer commits sem eu pedir
