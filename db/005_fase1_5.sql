-- ============================================================================
-- 005 — Fase 1.5: tracking de uso + push tokens
-- Rodar no SQL Editor do Supabase
-- ============================================================================

-- 1. Tracking de aberturas do app (GATE 21 dias)
create table if not exists public.app_opens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data date not null,
  created_at timestamptz not null default now(),
  unique (user_id, data)
);

create index if not exists idx_app_opens_user_data on public.app_opens(user_id, data);

alter table public.app_opens enable row level security;
drop policy if exists app_opens_all on public.app_opens;
create policy app_opens_all on public.app_opens for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 2. Push tokens (pra Edge Functions mandarem push)
create table if not exists public.push_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  platform text not null default 'ios',
  updated_at timestamptz not null default now(),
  unique (user_id, token)
);

alter table public.push_tokens enable row level security;
drop policy if exists push_tokens_all on public.push_tokens;
create policy push_tokens_all on public.push_tokens for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. Resumos (card efêmero na tela Hoje)
create table if not exists public.resumos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null, -- 'manha' | 'semanal'
  conteudo text not null,
  data date not null,
  lido boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, tipo, data)
);

create index if not exists idx_resumos_user_data on public.resumos(user_id, data);

alter table public.resumos enable row level security;
drop policy if exists resumos_all on public.resumos;
create policy resumos_all on public.resumos for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
