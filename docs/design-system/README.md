# LifeOS Design System

> **LifeOS** — diário-aplicativo pessoal para iOS. Dark-only, warm, editorial. Pensado como um caderno manuscrito iluminado por uma lâmpada de mesa à noite — não um SaaS frio.

---

## 1. Contexto

**Usuário** Gustavo, 19 anos, estudante de Engenharia de Produção na **UTFPR** (Universidade Tecnológica Federal do Paraná), sucessor da **TAWA Veículos Especiais**. Pratica Judô, Jiu-Jitsu, Tênis e academia; é parte da igreja **RUAH**; estuda idiomas; planeja intercâmbio.

**Produto** App pessoal iOS construído em **Expo / React Native + Supabase**, dark-only, modular. Cada módulo é uma "área da vida" com cor própria.

### Módulos
| Módulo | Cor | Propósito |
|---|---|---|
| **TAWA** (principal) | `#6B8FB8` navy suave | Trabalho na empresa familiar — veículos especiais |
| **UTFPR** | `#E8B96B` amarelo warm | Universidade — matérias, provas, trabalhos |
| **Treinos** | `#87A878` sage | Judô, Jiu-Jitsu, Tênis, Academia |
| **RUAH** | `#F2E7D2` warm ivory | Igreja — encontros, leitura, oração |
| **Estudos** | `#B89FD9` dusty lavender | Idiomas (inglês, espanhol…) |
| **Projetos** | `#7BB5C2` dusty teal | Projetos pessoais |
| **Intercâmbio** | `#D4A574` honey | Planejamento de intercâmbio |

### Referências visuais
**Things 3** (calmness, list-making), **Day One** (editorial, journal), **Stoic** (warm dark, intentional), **Hevy** (warm dark fitness), **Linear** (precisão tipográfica) — só nas partes onde precisão importa.

### Anti-referências
Linear cold/SaaS, purple gradients, Inter como display, vermelho fluo, cantos 4–8px, glassmorphism, neon, AI-slop.

---

## 2. Fontes deste design system

| Fonte | Localização | Acesso |
|---|---|---|
| Brief original | mensagem inicial do usuário | já incorporado |
| Logos das organizações | `assets/logos/` (TAWA, UTFPR, RUAH) | copiados para o projeto |
| Codebase Expo/RN | _não fornecido nesta sessão_ | — |

> **Caveat:** Não há codebase ou Figma anexado nesta sessão. As recreations da UI foram derivadas do brief detalhado + referências citadas (Things 3 / Day One / Stoic). Quando o app real existir, este design system deve ser cross-checked contra ele.

---

## 3. CONTENT FUNDAMENTALS

LifeOS é escrito **em português brasileiro**, em **voz baixa**, **na segunda pessoa informal** (você/tu — usar **você**). Como um diário — íntimo, sem corporativês.

### Tom
- **Calmo, presente, editorial.** Frases curtas. Pausas. Espaço pra respirar.
- **Você-você, nunca "o usuário".** O app fala com Gustavo, pelo nome quando faz sentido ("Boa noite, Gustavo").
- **Não motiva, não anima.** Nada de "🎉 Você arrasou!". Nada de "💪 Bora!". Sem hype.
- **Concreto, não abstrato.** "3 tarefas pra amanhã" > "Maximize sua produtividade".

### Casing
- **Sentence case** em quase tudo: títulos, botões, labels. "Nova tarefa", não "Nova Tarefa".
- **TÍTULOS DE SEÇÃO em monospace caps + tracking** quando queremos hierarquia editorial discreta: `01 · ESTA SEMANA`, `02 · BACKLOG`.
- Nunca all-caps em parágrafos.

### Emoji
**Não.** Emojis quebram o tom editorial. Hierarquia se faz com cor, peso, e numeração 01/02/03 em monospace.

### Saudações editoriais
Headers grandes em **Spectral italic**:
- "Boa noite, Gustavo."
- "Segunda. 3 treinos esta semana."
- "Hoje você lê João 3."

### Microcopy
| Contexto | ❌ Evitar | ✅ Preferir |
|---|---|---|
| Empty state | "Nada por aqui!" | "Nenhuma tarefa pendente. Toca no + pra criar a primeira." |
| Confirmação | "Sucesso!" | "Salvo." |
| Loading | "Carregando..." | "Um segundo." |
| Erro | "Algo deu errado 😕" | "Não consegui salvar. Tenta de novo." |
| CTA primário | "CLIQUE AQUI" | "Criar tarefa" |
| Streak / progresso | "🔥 5 dias seguidos!" | "5 dias. Continua." |
| Boas-vindas | "Bem-vindo ao LifeOS! 🚀" | "Boa noite." |

### Numeração editorial
Use `01 ·`, `02 ·`, `03 ·` (em JetBrains Mono, light) pra ordenar listas/seções com personalidade. Não é só decoração — substitui ícones em vários contextos.

### Datas e horários
- Datas em mono: `qui · 28 mai`, `14:30`
- Relativo só quando soa natural: "hoje", "amanhã", "sexta". Nunca "in 2 days".

---

## 4. VISUAL FOUNDATIONS

### 4.1 Anchor
Diário manuscrito iluminado por **lâmpada de mesa à noite**. Tudo é warm-shifted. O preto puro não existe — o fundo tem um pingo de marrom (stone-900). O branco puro não existe — texto é off-white quase pergaminho.

### 4.2 Surfaces (warm stone)
```
bg       #1C1917   stone-900 com leve marrom (NUNCA #000)
elev-1   #292524   cards no nível 1
elev-2   #3A332E   cards modais / sheets
text     #F5F1ED   off-white pergaminho (NUNCA #FFF)
line     rgba(245,241,237,0.08)   divisores quase invisíveis
```

### 4.3 Acentos warm
Peach `#E8B4A0`, Sage `#A8B5A0`, Honey `#D4A574`, Terracotta `#C97064`, Dusty Lavender `#B89FD9`.

### 4.4 Cores por módulo (warm-shifted)
Veja tabela na seção 1. Cada módulo tem **uma cor única** que aparece como:
- Halação radial 12% no canto do card de identidade do módulo
- Pastel fill em tags (cor + 22% alpha)
- Cor de borda focal / accent em CTAs daquele módulo
- Cor do ponto/dot no índice

### 4.5 Prioridades (warm — nunca vermelho puro)
- **Alta** terracotta `#C97064`
- **Média** honey `#D4A574`
- **Baixa** dusty blue `#8FA8B8`

### 4.6 Tipografia
- **Spectral** (serif, italic em headers grandes) — display, saudações, momentos editoriais.
- **Inter** — body, UI, labels, parágrafos.
- **JetBrains Mono** — metadados, horários, tags, numeração 01/02, kbd.

Todas via Google Fonts; sem font files locais nesta versão. **Substituições flagadas:** nenhuma — estes três estão todos no Google Fonts no peso e itálico que precisamos.

### 4.7 Escala tipográfica (mobile)
```
display-xl   Spectral italic 36/40 -0.02em
display-lg   Spectral italic 28/32 -0.02em
title-lg     Inter 600    20/24
title-md     Inter 600    17/22
body         Inter 400    15/22
caption      Inter 400    13/18
meta         JetBrains Mono 400 11/14 +0.04em uppercase
mono         JetBrains Mono 400 13/18
```

### 4.8 Border radius (squircles generosos)
```
sm  10    pills pequenas, tags
md  16    cards menores, botões secundários
lg  22    cards principais
xl  28    sheets modais, cards de identidade do módulo
full      pills horizontais, FAB
```
**Nunca** 4 ou 8 px. Cantos pequenos = corporativo, e LifeOS não é corporativo.

### 4.9 Spacing
Escala em múltiplos de 4: `4, 8, 12, 16, 20, 24, 32, 40, 56, 72`. Padding interno de card padrão = 20. Gutter entre cards = 12.

### 4.10 Backgrounds & padrões
- **Sem gradientes de fundo full-bleed.** O fundo é stone-900 sólido.
- **Halação radial sutil** (radial-gradient 12% da cor do módulo) **só** no canto de cards-identidade de módulo. Nunca em cards genéricos.
- **Sem texturas, sem grão, sem patterns.** A calma vem da cor, não do ruído.

### 4.11 Sombras / elevação
Sombras são **quase ausentes**. Elevação se comunica por mudança de surface (bg → elev-1 → elev-2), não por drop-shadow.

Exceção: **FAB** carrega gradiente warm + sombra colorida (peach 18%) — é o único elemento que projeta presença.

```
shadow-fab   0 8px 28px -8px rgba(232,180,160,0.45)
```

### 4.12 Borders
- Divisores: `rgba(245,241,237,0.08)` — quase invisíveis, só pra organizar.
- Border em inputs: `rgba(245,241,237,0.10)`, sobe pra cor-do-módulo no focus.

### 4.13 Hover / press (touch states)
- **Press** (mobile, principal): reduzir escala para `0.97` + opacidade para `0.85`, transição 120ms ease-out.
- **Hover** (raro em iOS, só pra prototipagem web): bg sobe um nível (`bg` → `elev-1`).
- Nunca usar bordas que aparecem do nada no hover. Nunca outline azul de browser.

### 4.14 Animação
- **Easing padrão:** `cubic-bezier(0.2, 0.8, 0.2, 1)` — leve overshoot.
- **Duração:** 180ms (micro), 240ms (medium), 320ms (sheet aberto).
- **Sem bounces exagerados.** Sem spring molengo. Movimento curto e decisivo.
- Fades de 120ms em entrada/saída de conteúdo.

### 4.15 Transparência / blur
- **Sem glassmorphism.** Sem `backdrop-filter: blur(20px)` em cards. Aborta o tom warm e introduz frieza.
- Overlays de sheet modal: `rgba(28,25,23,0.72)` sólido — sem blur.

### 4.16 Cards
Surface `elev-1` (#292524), radius `lg` (22), padding 20, **sem border, sem shadow**. A separação vem do contraste com o bg. Cards de identidade-de-módulo ganham halação radial 12% no canto superior direito.

### 4.17 Imagens
Quando houver fotos (raras — só em entries tipo Day One): warm filter sutil, sem saturação excessiva. Cantos `lg`. Nunca full-bleed sangrando até a edge.

### 4.18 Imagery vibe
Quente, baixa em saturação, lâmpada de mesa. B&W aceitável; cool / blueish recusado.

### 4.19 FAB (botão flutuante)
Único elemento com gradiente: `linear-gradient(135deg, #E8B4A0, #D4A574)` (peach → honey), ícone `+` em stone-900, radius full, 56×56, shadow-fab.

### 4.20 Pills horizontais
Scrolláveis horizontalmente pra filtros. Estado off: `elev-1` bg, text muted. Estado on: bg cor-do-módulo 22% alpha, text cor-do-módulo cheia.

---

## 5. ICONOGRAPHY

Veja [SKILL.md](./SKILL.md) e seção 6 (Index) para arquivos.

- **Sistema:** **Lucide** via CDN — `https://unpkg.com/lucide-static/icons/<name>.svg`. Stroke-based, weight 1.5px, geometricamente calmo. Combina com o tom editorial.
- **Tamanhos:** 16 (inline meta), 20 (UI padrão), 24 (tab bar), 28 (header CTA).
- **Cor:** herdar de `currentColor`. Em estado neutro: `text-muted` (off-white 60%). Em estado ativo: cor do módulo ou off-white cheio.
- **Stroke-width:** 1.5 sempre. Não usar 2 (corporativo) nem 1 (frágil).
- **Emoji:** não usado, nunca, em nenhuma superfície.
- **Logos das organizações** (TAWA, UTFPR, RUAH) ficam em `assets/logos/`. Aparecem _apenas_ dentro dos cards-identidade dos respectivos módulos, em formato pequeno (~28px), reduzidos em opacidade pra 70% pra harmonizar com a paleta warm.
- **Numeração 01/02/03** em JetBrains Mono substitui ícones em vários contextos — economia visual.

---

## 6. Index

```
README.md               Este arquivo
SKILL.md                Cross-compatible skill descriptor
colors_and_type.css     CSS vars (cores, type, espaçamento, radius)

assets/
  logos/
    tawa.png            Logo TAWA Veículos Especiais
    utfpr.png           Logo UTFPR
    ruah.png            Logo igreja RUAH

preview/                Cards do Design System tab (oklab swatches, type specimens, etc)
  *.html

ui_kits/
  lifeos_ios/
    index.html          Click-thru prototype: Home, Módulo TAWA, Nova tarefa, Treinos, RUAH
    *.jsx               Componentes (StatusBar, TabBar, Card, Pill, FAB, …)
    README.md
```

Para usar: leia este README, importe `colors_and_type.css`, abra `ui_kits/lifeos_ios/index.html` pra ver o vocabulário visual em movimento.
