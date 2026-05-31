# LifeOS — Roadmap

Atualizado: 2026-05-28

## Fase 1.5 — Fechar antes do GATE
1. **Tracking de uso** — tabela `app_opens`, registro automático no _layout.tsx
2. **Resumo da manhã 8h** — Edge Function (Deno/Supabase cron) + push + card efêmero na Hoje
3. **Weekly Review domingo 20h** — Edge Function + push + card expandível
4. **Deep link Quick Capture** — registrar scheme no app.json, Shortcut iOS 1-tap

## GATE 21 dias
- Iniciar contagem após Fase 1.5. KPI: ≥4 dias/semana abrindo.
- Se falhar: retro 1h → pivotar ou matar sem culpa.

## Fase 2 — Treinos (só se passar GATE)
5. **Treinos funcional** — check-in por modalidade (judô/jiu/tênis/academia)
6. **Academia normalizada** — templates, exercícios, séries (schema no spec)

## Fase 3 — UTFPR + RUAH
7. **UTFPR funcional** — disciplinas, notas, Edge Function Moodle (cron 2h)
8. **RUAH funcional** — reuniões, ata, ideias, eventos

## Fase 4 — Expansões
9. **Projetos** — CRUD com progresso, tech stack, links
10. **Intercâmbio** — checklist categorizado
11. **Certificações Estudos** — form UI (schema existe)
12. **Conflito de agenda cross-módulo** — detectar sobreposições entre módulos
13. **Tarefa-ponte** — `modulo_secundario` nullable, tag visual com duas cores
14. **Spaced repetition Estudos** — revisão espaçada (1d/3d/7d/14d) automática
15. **Comandos de voz via Siri Shortcut** — Edge Function `/api/quick-capture` + Shortcut iOS
