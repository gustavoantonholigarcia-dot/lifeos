# Shortcut iOS — Quick Capture LifeOS

## Setup no iPhone

1. Abrir app **Atalhos** (Shortcuts)
2. Criar novo atalho: "Captura LifeOS"
3. Adicionar ação: **Abrir URLs**
4. URL: `lifeos://quick-capture`
5. Opcional: adicionar à Tela Inicial como ícone

## Como funciona
- O scheme `lifeos://` está registrado no `app.json`
- A rota `/quick-capture` abre o modal de captura direto
- Ao fechar, volta pra tela Hoje

## Variante com voz (futura)
- Ação 1: Ditar texto
- Ação 2: POST pra Edge Function `/api/quick-capture` com o texto
- Edge Function aplica heurística e insere em `tarefas`
