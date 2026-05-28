# Ideias geradas — Fase 1 LifeOS

> Geradas via skill `ideias` em 2026-05-26 durante setup da Fase 0.
> Marca aqui as que você quer implementar na Fase 1 (ou Fase 2+).

## Bloco A — Sólidas e pragmáticas

### [ ] 1. Captura via Share Sheet do iOS
**O que é:** registrar LifeOS como destino do "Compartilhar" do iPhone. Lê mensagem no WhatsApp do pai → "Compartilhar" → "LifeOS" → vira tarefa TAWA em 2 toques.
**Por quê:** WhatsApp é onde 80% das demandas TAWA chegam. Trocar de app pra criar tarefa é o atrito que mata o uso. Share Sheet elimina o switch.
**Como:** Share Extension no `app.json -> extensions`, abrir formulário pré-preenchido com texto compartilhado, salvar com `origem='delegada'`.
**Custo:** médio (Share Extension requer EAS Build — conflito com "só Expo Go"). Pode ficar pra fase pós-validação.

### [ ] 2. Categorização por palavra-chave do delegador
**O que é:** cada delegador (Pai, Michele, X) tem palavras-chave salvas. "ata", "edital", "empenho" → Comercial. "contrato" → Jurídico. Lookup, sem IA.
**Por quê:** você delega/recebe dos mesmos 4-5 atores. Padrões reais em 1 semana. Regex local resolve >85%.
**Como:** tabela `regras_classificacao (palavra_chave, setor_id, prioridade_sugerida)`. Após criar tarefa, mostra setor sugerido com chip "✓ aceitar". Aprende com correções.
**Custo:** baixo. Implementar na Fase 1.

### [ ] 3. "Próximo prazo" como rich notification persistente
**O que é:** alternativa zero-build ao widget iOS — notification matinal persistente no Lock Screen com próximo prazo TAWA.
**Por quê:** você vê o prazo crítico sem abrir o app. Reduz atrito.
**Como:** agendar 1 notification 8h com `categoryIdentifier` persistente. Conteúdo: "Próximo prazo: X — 14h".
**Custo:** muito baixo. Implementar na Fase 1.

### [ ] 4. Snooze por contexto, não por tempo
**O que é:** em vez de "adiar 1h", opções são "chegar no escritório", "almoço", "à noite", "amanhã cedo".
**Por quê:** você pensa "quando chegar", não "+1h". UX alinhada ao modelo mental aumenta uso.
**Como:** tabela `user_contextos (nome, hora_default)` editável. Swipe esquerdo: 4 chips de contexto. Default: "Manhã 9h", "Almoço 13h", "Fim do dia 18h", "Amanhã 8h".
**Custo:** baixo. Implementar na Fase 1.

### [ ] 5. Auto-arquivar concluídas após 7 dias
**O que é:** tarefas concluídas há +7 dias somem da view padrão (ficam em "Arquivo").
**Por quê:** 50 concluídas em 2 semanas vira ruído. App cuida de si.
**Como:** query default `where status='concluido' and concluida_em > now() - interval '7 days'`. Toggle "Mostrar todas".
**Custo:** muito baixo. Implementar na Fase 1.

---

## Bloco B — Inesperadas

### [ ] 6. Diário "tarefas que não fiz hoje"
**O que é:** 22h, notification: "Você criou 8 tarefas hoje, completou 3. Top 5 pendentes:". Mirror, não cobrança.
**Por quê:** auto-consciência diária do gap intenção × execução muda comportamento. Inspirado em Marco Aurélio + Bullet Journal.
**Como:** notification agendada. Bottom-sheet de 30s: top 5 não-feitas, "rolar pra amanhã" ou "mudar prioridade".
**Custo:** médio. Considerar Fase 5.

### [ ] 7. Detector de "tarefas que entram juntas" → template
**O que é:** detecta que toda terça você cria X+Y+Z → sugere criar como template "Rotina de terça".
**Por quê:** TAWA tem ciclos semanais previsíveis. App aprende e oferece — reduz captura recorrente.
**Como:** SQL view materializada que detecta grupos com `created_at` em janela <30min, mesmo dia da semana 3+ vezes. Modal: "Criar template?".
**Custo:** alto. Fase 5 ou descartar.

### [ ] 8. Modo "Reunião" — silencia + grava áudio
**O que é:** botão "Iniciar reunião". Notifications off, gravador rodando, transcrição local depois (expo-speech-recognition).
**Por quê:** reuniões TAWA toda semana. Tarefas perdidas é onde acumulam.
**Como:** começa com gravação simples (sem transcrição) + bloco de texto livre depois. expo-av faz isso em 10 linhas.
**Custo:** médio (gravação) / alto (transcrição). Considerar pós-validação.

### [ ] 9. Cor de fundo muda com urgência da semana
**O que é:** 0 prazos urgentes → preto neutro. 1+ → leve tom azul. Prazo hoje → leve tom quente.
**Por quê:** sente a pressão sem ler. Manipula sistema límbico antes do córtex.
**Como:** hook `useUrgenciaSemana()` retorna 0-3. ThemedView root aplica overlay 2-5% de hue.
**Custo:** baixo. Considerar Fase 5 polish.

### [ ] 10. "Botão pânico" — Modo Foco fullscreen
**O que é:** long-press em tarefa → fullscreen, notifications silenciadas, timer crescente, swipe pra cima pra concluir.
**Por quê:** às vezes só precisa fechar 1. Não é Pomodoro — é "vou fazer ISSO agora".
**Como:** tela `app/foco/[tarefa-id].tsx`. Modal fullscreen, timer crescente, botão "concluir" gigante.
**Custo:** baixo. Implementar na Fase 1 ou 2.

### [ ] 11. INVERSÃO: app sem botão "criar tarefa", só log
**O que é:** provocação. Não cria tarefa — responde notification "O que você está fazendo agora?". Vira log de execução.
**Por quê:** manter fila de pendências é o problema. Log de realidade > lista de futuro.
**Como:** segunda aba "Log" na "Hoje" com timeline de execuções.
**Custo:** médio. Provocação — testar como segunda visão, não substituir o principal.

### [ ] 12. "Avisar quem delegou" em 1 toque (WhatsApp deep-link)
**O que é:** tarefa concluída → botão "📤 Avisar". Abre WhatsApp do delegador com mensagem pronta: "Pai, terminei [X]. Detalhes: [observações]".
**Por quê:** 50% do tempo de tarefa é avisar que terminou. Fecha o loop + ganha capital político ("o moleque é organizado").
**Como:** campo `whatsapp_delegador` no profile. Link `whatsapp://send?phone=X&text=Y` via Linking do RN.
**Custo:** baixo. **IMPLEMENTAR NA FASE 1** — alto ROI político.
