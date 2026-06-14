-- 008_crm_moskit.sql
-- Melhorias do CRM inspiradas no Moskit:
--   1. valor_estimado  → valor do negócio (R$) por contato; alimenta o funil em R$
--   2. motivo_perda     → por que um contato foi marcado como "perdido"
-- Rodar no SQL Editor do Supabase (projeto tava-editais).

alter table public.tawa_contatos
  add column if not exists valor_estimado numeric(12,2),
  add column if not exists motivo_perda text;

comment on column public.tawa_contatos.valor_estimado is
  'Valor estimado do negócio em reais (Moskit-style). Alimenta o total do funil.';
comment on column public.tawa_contatos.motivo_perda is
  'Motivo registrado ao marcar o contato como perdido (preço, prazo, concorrente...).';
