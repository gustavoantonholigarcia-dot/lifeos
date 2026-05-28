-- ============================================================================
-- LifeOS — Agenda TAWA (anotações livres por dia)
-- Rodar DEPOIS do 001_schema_inicial.sql
-- Data: 2026-05-27
-- ============================================================================

create table if not exists public.tawa_anotacoes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,

  data date not null default current_date,
  conteudo text not null,
  setor_id uuid references public.setores_tawa(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists tawa_anotacoes_updated_at on public.tawa_anotacoes;
create trigger tawa_anotacoes_updated_at
  before update on public.tawa_anotacoes
  for each row execute function public.set_updated_at();

create index if not exists idx_tawa_anotacoes_user_data
  on public.tawa_anotacoes(user_id, data desc, created_at desc);

create index if not exists idx_tawa_anotacoes_setor
  on public.tawa_anotacoes(setor_id) where setor_id is not null;

-- RLS
alter table public.tawa_anotacoes enable row level security;

drop policy if exists tawa_anotacoes_all on public.tawa_anotacoes;
create policy tawa_anotacoes_all on public.tawa_anotacoes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
