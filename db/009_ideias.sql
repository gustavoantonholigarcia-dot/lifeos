-- ============================================================================
-- 009 — Ideias (startups / empresas futuras)
-- Lugar pra capturar e evoluir ideias de negócio.
-- Rodar no SQL Editor do Supabase.
-- ============================================================================

create table if not exists public.ideias (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  problema text,        -- que dor/necessidade resolve
  solucao text,         -- o que é, como resolve
  publico_alvo text,    -- pra quem / quem paga
  quanto_pagam text,    -- quanto gastam HOJE pra resolver isso (sinal de validação)
  estagio text not null default 'semente', -- 'semente' | 'validando' | 'tocando' | 'arquivada'
  proximo_passo text,   -- ação concreta seguinte
  notas text,           -- texto livre
  link text,            -- referência / concorrente / inspiração
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ideias_user_updated on public.ideias(user_id, updated_at desc);

alter table public.ideias enable row level security;

drop policy if exists ideias_all on public.ideias;
create policy ideias_all on public.ideias for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
