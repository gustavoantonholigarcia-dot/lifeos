-- ============================================================================
-- 015 — Ideias PRO: transformar o modulo de startups num espaco de PENSAR
-- Alem de organizar: validacao, provocacoes (advogado do diabo), hipoteses.
-- Tudo com gancho pra IA depois (tabela ideia_insights, fonte 'manual'|'ia').
-- Rodar no SQL Editor do Supabase. Idempotente.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Novos campos de canvas na propria ideia
-- ----------------------------------------------------------------------------
alter table public.ideias add column if not exists vantagem_injusta text;   -- o que e dificil de copiar
alter table public.ideias add column if not exists canais text;             -- como chega no cliente
alter table public.ideias add column if not exists concorrentes text;       -- quem ja resolve isso (e como)
alter table public.ideias add column if not exists metrica_chave text;      -- o numero que prova que funciona

-- ----------------------------------------------------------------------------
-- 2. Hipoteses / experimentos (validacao lean)
-- ----------------------------------------------------------------------------
create table if not exists public.ideia_hipoteses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ideia_id uuid not null references public.ideias(id) on delete cascade,
  texto text not null,                 -- "Acredito que X..."
  como_testar text,                    -- experimento concreto, barato
  status text not null default 'nao_testada', -- nao_testada|testando|validada|refutada
  aprendizado text,                    -- o que descobriu
  ordem text not null default 'a0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_ideia_hipoteses on public.ideia_hipoteses(ideia_id, ordem);

-- ----------------------------------------------------------------------------
-- 3. Provocacoes (advogado do diabo) — respostas as perguntas duras
--    O banco de perguntas vive no app (prompt_id estavel). Aqui so a resposta.
-- ----------------------------------------------------------------------------
create table if not exists public.ideia_provocacoes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ideia_id uuid not null references public.ideias(id) on delete cascade,
  prompt_id text not null,             -- id estavel da pergunta (ex: 'pressuposto')
  resposta text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (ideia_id, prompt_id)
);
create index if not exists idx_ideia_provocacoes on public.ideia_provocacoes(ideia_id);

-- ----------------------------------------------------------------------------
-- 4. Insights — gancho pra IA (Claude) gerar analise depois.
--    Por ora pode receber insights 'manual'. Edge Function preenche 'ia'.
-- ----------------------------------------------------------------------------
create table if not exists public.ideia_insights (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ideia_id uuid not null references public.ideias(id) on delete cascade,
  tipo text not null default 'analise', -- analise|risco|proximo_passo|concorrencia
  titulo text,
  conteudo text not null,
  fonte text not null default 'manual', -- manual|ia
  created_at timestamptz not null default now()
);
create index if not exists idx_ideia_insights on public.ideia_insights(ideia_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 5. RLS
-- ----------------------------------------------------------------------------
alter table public.ideia_hipoteses enable row level security;
alter table public.ideia_provocacoes enable row level security;
alter table public.ideia_insights enable row level security;

drop policy if exists ideia_hipoteses_all on public.ideia_hipoteses;
create policy ideia_hipoteses_all on public.ideia_hipoteses for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists ideia_provocacoes_all on public.ideia_provocacoes;
create policy ideia_provocacoes_all on public.ideia_provocacoes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists ideia_insights_all on public.ideia_insights;
create policy ideia_insights_all on public.ideia_insights for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
