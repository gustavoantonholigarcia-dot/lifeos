-- ============================================================================
-- 021 — Quantidade de veiculos por lote
-- Cada lote (veiculo) tem um valor unitario (ja existia) e uma quantidade
-- registrada que a Tawa pode vender. Valor total potencial = valor x qtd.
-- Rodar no SQL Editor do Supabase. Idempotente.
-- ============================================================================

alter table public.tawa_ata_lotes add column if not exists quantidade integer;

comment on column public.tawa_ata_lotes.quantidade is 'Qtd de veiculos do lote que a Tawa pode vender (cota da ata).';
comment on column public.tawa_ata_lotes.valor_unitario is 'Valor de venda por veiculo (R$).';
