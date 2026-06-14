-- ============================================================================
-- 018 — Apostas: canalizar energia em poucas frentes.
-- Regra: no maximo 3 apostas ATIVAS por vez (limite aplicado no app).
-- Ideias novas vao pra FILA (capturadas, mas explicitamente "nao agora").
-- Cada aposta tem prazo proprio (ciclo variavel). Abandonar exige decisao
-- explicita — o custo da troca fica visivel.
-- Rodar no SQL Editor do Supabase. Idempotente.
-- ============================================================================

create table if not exists public.apostas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  resultado_esperado text,        -- o que define "andou" no review
  status text not null default 'fila'
    check (status in ('fila', 'ativa', 'concluida', 'abandonada')),
  prazo_em date,                  -- fim do ciclo desta aposta (variavel)
  ativada_em timestamptz,
  encerrada_em timestamptz,
  aprendizado text,               -- review / motivo do abandono
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_apostas_user_status
  on public.apostas(user_id, status);

alter table public.apostas enable row level security;

drop policy if exists apostas_all on public.apostas;
create policy apostas_all on public.apostas for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
