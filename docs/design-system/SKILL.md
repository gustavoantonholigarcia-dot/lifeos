---
name: lifeos-design
description: Use this skill to generate well-branded interfaces and assets for LifeOS, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

# LifeOS Design Skill

LifeOS é um diário-aplicativo pessoal para iOS — **dark-only**, **warm**, **editorial**. Anchor: "diário manuscrito iluminado por uma lâmpada de mesa à noite". **Não** Linear cold/SaaS.

## Como usar este skill

1. **Leia `README.md`** primeiro — contém as fundações (cores, tipografia, conteúdo, motifs).
2. **Importe `colors_and_type.css`** em qualquer artefato HTML novo. Ele traz os CSS vars, as três famílias tipográficas via Google Fonts, e as classes semânticas (`.display-xl`, `.body`, `.meta`, etc).
3. **Para mocks / prototypes / slides** → crie HTML estático e copie os assets que precisar (`assets/logos/*.png`). Use os átomos do UI kit (`ui_kits/lifeos_ios/Atoms.jsx`, `TaskRow.jsx`, `ModuleCard.jsx`, `TabBar.jsx`, `Screens.jsx`) como referência — copie e adapte.
4. **Para production code (Expo / RN)** → adote os tokens (`colors_and_type.css`) como source-of-truth e mapeie pra StyleSheet / Tamagui / NativeWind. Ícones via `lucide-react-native` stroke 1.5.

Se o usuário invocar este skill sem outro contexto, pergunte o que quer construir, faça 3–5 perguntas focadas (tela, módulo, fidelidade, com/sem tweaks), e atue como um designer expert que entrega HTML estático **ou** code, conforme a necessidade.

## Os 7 não-negociáveis

1. **Dark only.** bg `#1C1917`, text `#F5F1ED`. Nunca preto puro, nunca branco puro.
2. **Warm stone.** Tudo tem um pingo de marrom. Não use grays neutros (#1a1a1a, #2a2a2a) — use `#1C1917 / #292524 / #3A332E`.
3. **Squircles generosos.** Radius 10 / 16 / 22 / 28. **Nunca 4–8px.**
4. **Spectral italic** em headers editoriais (saudações, títulos de entry, empty states grandes).
5. **Sem emoji. Sem glassmorphism. Sem purple gradients. Sem vermelho fluo.**
6. **Cor por módulo** consistente (TAWA navy, UTFPR amarelo, Treinos sage, RUAH warm ivory, Estudos lavender, Projetos teal, Intercâmbio honey).
7. **Microcopy em português, segunda pessoa informal, calmo.** Ex: "Boa noite, Gustavo." · "Nenhuma tarefa pendente. Toca no + pra criar a primeira."

## Arquivos disponíveis

- `README.md` — fundações completas (content, visual, iconography)
- `colors_and_type.css` — tokens + classes semânticas
- `assets/logos/` — TAWA · UTFPR · RUAH (PNG)
- `preview/*.html` — design system cards (24 specimens individuais)
- `ui_kits/lifeos_ios/` — recreation hi-fi do app: index.html, Atoms.jsx, TaskRow.jsx, ModuleCard.jsx, TabBar.jsx, Screens.jsx, tokens.js, ios-frame.jsx

## Como aparece num artefato

```html
<link rel="stylesheet" href="colors_and_type.css">
<style>
  body { background: var(--bg); color: var(--text); font-family: var(--font-body); }
</style>
<div class="display-xl">Boa noite, Gustavo.</div>
<div class="meta">01 · ESTA SEMANA</div>
```

Pra componentes React/Expo: copie o pattern em `ui_kits/lifeos_ios/Atoms.jsx` — os átomos lá são minimamente cosméticos, fáceis de portar pra StyleSheet.
