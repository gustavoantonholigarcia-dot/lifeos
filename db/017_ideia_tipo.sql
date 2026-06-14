-- ============================================================================
-- 017 — Tipo da ideia de negocio
-- O modulo cobre mais que startup de produto. Cada ideia tem um tipo que
-- adapta as perguntas (provocacoes), o proximo passo e os rotulos do canvas.
--   'construir'   -> negocio/startup a construir (produto, servico)
--   'oportunidade'-> oportunidade/investimento (comprar terra, revenda, ativo)
-- Rodar no SQL Editor do Supabase. Idempotente.
-- ============================================================================

alter table public.ideias
  add column if not exists tipo text not null default 'construir'
  check (tipo in ('construir', 'oportunidade'));

comment on column public.ideias.tipo is
  'construir = negocio/startup a montar; oportunidade = investimento/ativo a explorar';
