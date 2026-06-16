-- ============================================================================
-- 020 — Vigência da ata de registro de preço
-- Ata de registro tem prazo de validade. Apos a vigencia nao da pra empenhar.
-- O mesmo consorcio (ex: CIGEDAS) pode ter varias atas no ano — a vigencia
-- (e o edital) distingue uma da outra.
-- Rodar no SQL Editor do Supabase. Idempotente.
-- ============================================================================

alter table public.tawa_atas add column if not exists vigencia_em date;
alter table public.tawa_atas add column if not exists edital_ref text;

comment on column public.tawa_atas.vigencia_em is 'Data limite de validade da ata (empenhos so ate essa data).';
comment on column public.tawa_atas.edital_ref is 'Edital/numero que identifica a ata (ex: 003/2026).';
