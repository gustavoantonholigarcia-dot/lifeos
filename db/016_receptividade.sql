-- ============================================================================
-- 016 — Receptividade do contato (0–10)
-- Quao solicito / agradavel e lidar com a pessoa, INDEPENDENTE de fechar venda.
-- Um cliente pode estar 'perdido' comercialmente mas ser ouro de relacao.
-- Rodar no SQL Editor do Supabase. Idempotente.
-- ============================================================================

alter table public.tawa_contatos
  add column if not exists receptividade smallint
  check (receptividade is null or (receptividade between 0 and 10));

comment on column public.tawa_contatos.receptividade is
  'Quao solicito/agradavel e o contato, 0 (rude) a 10 (gente boa). Nao reflete chance de venda.';
