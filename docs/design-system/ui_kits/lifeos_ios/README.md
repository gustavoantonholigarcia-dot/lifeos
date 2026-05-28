# LifeOS · iOS UI Kit

Hi-fi click-thru recreation do app pessoal LifeOS. Mostra o vocabulário visual em movimento — não é production code.

## Como usar

Abre `index.html`. À esquerda do iPhone existe um menu lateral pra pular entre as cinco telas principais. Dentro do iPhone, você pode:

- **Tap nos cards de módulo** na Home → abre o detail view do módulo (TAWA, UTFPR, etc).
- **Tap no `+`** (FAB) → abre a sheet `Nova tarefa` (módulo + prioridade).
- **Tap nos checks** → marca tarefas como concluídas; elas escurecem e movem.
- **Pills horizontais** → filtram a Home por módulo.
- **Tab bar de baixo** → navega entre Hoje · Semana · Módulos · Diário · Eu.

## Arquivos

```
index.html       Showcase + state wiring
tokens.js        MODULES / PRIORITY lookup
ios-frame.jsx    Starter component (iPhone bezel, status bar, home indicator)
Atoms.jsx        Pill, Tag, Numeral, SectionHead, Greeting, SubMeta, Check, FAB, Icon, ModDot
TaskRow.jsx      TaskRow + TaskList
ModuleCard.jsx   ModuleCard + ModuleGrid (com halação radial)
TabBar.jsx       Bottom tab bar (5 tabs · Lucide stroke 1.5)
Screens.jsx      HomeScreen, ModuleScreen, TreinosScreen, DiarioScreen, NovaTarefaSheet, EmptyBlock
```

## Padrões importantes neste kit

- **Saudação** em Fraunces italic 32px no topo de cada tela principal ("Boa noite, Gustavo.").
- **Numeração 01/02/03** em monospace pra hierarquia de seções, no lugar de ícones.
- **Halação radial** nos cards de identidade de módulo (cor do módulo a 14–22% num radial-gradient no canto superior direito).
- **Pills** com pastel fill 22% quando ativas; cor de texto = cor do módulo cheia.
- **FAB** é o único elemento com gradiente warm (peach → honey) e sombra colorida.
- **Press states** em todos os botões: scale 0.96–0.97 + opacity 0.85.
- **Sem glassmorphism**, **sem emoji**, **sem cantos 4–8px**.

## Caveat

Codebase Expo/RN real **não foi anexado** nesta sessão. Quando ele estiver disponível, este kit deve ser cross-checked contra:
- Os componentes reais em `src/components/` ou similar
- Os literais de cor e radius — se diferirem, atualizar `colors_and_type.css` na raiz
- Microcopy real (português) que talvez já esteja definido

A intenção é que este kit **espelhe** o app, não que ele seja inventado. Substituir tudo que diferir.
