-- ============================================================================
-- 019 — Norte + Compromissos (evolucao das "apostas")
-- "Aposta" era a palavra errada: nao e opcional, e o que PRECISA acontecer.
-- A cadeia completa:
--   NORTE (1 direcao maior, sempre visivel)
--   -> COMPROMISSOS (max 3 ativos, com prazo — o que precisa acontecer)
--   -> AVANCOS (check-in diario — constancia de execucao)
-- Rodar no SQL Editor do Supabase. Idempotente. Mantem dados ja criados.
-- ============================================================================

-- 1. Renomeia apostas -> compromissos (preserva o que ja foi criado na 018)
do $$
begin
  if exists (
    select from information_schema.tables
    where table_schema = 'public' and table_name = 'apostas'
  ) then
    alter table public.apostas rename to compromissos;
  end if;
end $$;

-- Garante a tabela mesmo se a 018 nunca rodou
create table if not exists public.compromissos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  resultado_esperado text,
  status text not null default 'fila'
    check (status in ('fila', 'ativa', 'concluida', 'abandonada')),
  prazo_em date,
  ativada_em timestamptz,
  encerrada_em timestamptz,
  aprendizado text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_compromissos_user_status
  on public.compromissos(user_id, status);

alter table public.compromissos enable row level security;
drop policy if exists apostas_all on public.compromissos;
drop policy if exists compromissos_all on public.compromissos;
create policy compromissos_all on public.compromissos for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 2. Norte — UMA direcao por usuario, que filtra todo o resto
create table if not exists public.norte (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  texto text not null,
  updated_at timestamptz not null default now()
);

alter table public.norte enable row level security;
drop policy if exists norte_all on public.norte;
create policy norte_all on public.norte for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. Avancos diarios — constancia visivel (1 check-in por compromisso por dia)
create table if not exists public.compromisso_avancos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  compromisso_id uuid not null references public.compromissos(id) on delete cascade,
  data date not null default current_date,
  created_at timestamptz not null default now(),
  unique (compromisso_id, data)
);

create index if not exists idx_avancos_compromisso
  on public.compromisso_avancos(compromisso_id, data desc);

alter table public.compromisso_avancos enable row level security;
drop policy if exists avancos_all on public.compromisso_avancos;
create policy avancos_all on public.compromisso_avancos for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
