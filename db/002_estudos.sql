-- ============================================================================
-- LifeOS — Schema do módulo Estudos (idiomas + sessões + certificações)
-- Rodar no SQL Editor do Supabase 'lifeos' DEPOIS do 001_schema_inicial.sql
-- Data: 2026-05-27
-- ============================================================================

-- ============================================================================
-- 1. Idiomas em estudo
-- ============================================================================
create table if not exists public.estudos_idiomas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,

  nome text not null,                -- 'Inglês', 'Espanhol', 'Francês', etc.
  codigo text,                       -- 'en', 'es', 'fr', 'de', 'it'
  bandeira_emoji text,               -- '🇬🇧', '🇪🇸', etc.

  nivel_atual text not null default 'a1'
    check (nivel_atual in ('a1','a2','b1','b2','c1','c2','nativo')),
  nivel_meta text
    check (nivel_meta in ('a1','a2','b1','b2','c1','c2','nativo')),

  ativo boolean not null default true,    -- desabilitar idiomas pausados
  cor text not null default '#8B5CF6',
  ordem int not null default 0,

  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, nome)
);

drop trigger if exists estudos_idiomas_updated_at on public.estudos_idiomas;
create trigger estudos_idiomas_updated_at
  before update on public.estudos_idiomas
  for each row execute function public.set_updated_at();

create index if not exists idx_estudos_idiomas_user
  on public.estudos_idiomas(user_id, ativo, ordem);

-- ============================================================================
-- 2. Sessões de estudo (cada vez que você estudou)
-- ============================================================================
create table if not exists public.estudos_sessoes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idioma_id uuid not null references public.estudos_idiomas(id) on delete cascade,

  data date not null default current_date,
  duracao_min int not null default 0,    -- minutos estudados

  tipo text not null default 'misto'
    check (tipo in ('gramatica','leitura','audicao','fala','escrita','vocabulario','misto')),

  fonte text,                            -- 'Anki', 'Duolingo', 'Aula particular', 'Cambly', etc.
  observacoes text,

  created_at timestamptz not null default now()
);

create index if not exists idx_estudos_sessoes_user_data
  on public.estudos_sessoes(user_id, data desc);
create index if not exists idx_estudos_sessoes_idioma
  on public.estudos_sessoes(idioma_id, data desc);

-- ============================================================================
-- 3. Certificações planejadas/realizadas
-- ============================================================================
create table if not exists public.estudos_certificacoes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idioma_id uuid not null references public.estudos_idiomas(id) on delete cascade,

  nome text not null,                    -- 'TOEFL iBT', 'IELTS Academic', 'Cambridge FCE', 'CELPE-Bras', 'DELE B2'
  nivel_alvo text                        -- 'b2', 'c1', etc.
    check (nivel_alvo in ('a1','a2','b1','b2','c1','c2')),

  status text not null default 'planejado'
    check (status in ('planejado','inscrito','realizado','cancelado')),

  data_alvo date,                        -- prazo / data da prova
  data_realizada date,
  nota text,                             -- '85/100', 'B2', '7.5 (IELTS)'

  local text,                            -- onde fazer
  custo numeric(10,2),                   -- valor em R$
  observacoes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists estudos_certificacoes_updated_at on public.estudos_certificacoes;
create trigger estudos_certificacoes_updated_at
  before update on public.estudos_certificacoes
  for each row execute function public.set_updated_at();

create index if not exists idx_estudos_cert_user_status
  on public.estudos_certificacoes(user_id, status, data_alvo);

-- ============================================================================
-- 4. RLS
-- ============================================================================
alter table public.estudos_idiomas       enable row level security;
alter table public.estudos_sessoes       enable row level security;
alter table public.estudos_certificacoes enable row level security;

drop policy if exists estudos_idiomas_all on public.estudos_idiomas;
create policy estudos_idiomas_all on public.estudos_idiomas for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists estudos_sessoes_all on public.estudos_sessoes;
create policy estudos_sessoes_all on public.estudos_sessoes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists estudos_certificacoes_all on public.estudos_certificacoes;
create policy estudos_certificacoes_all on public.estudos_certificacoes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- 5. View agregada: progresso por idioma
-- ============================================================================
create or replace view public.estudos_idiomas_resumo as
select
  i.id,
  i.user_id,
  i.nome,
  i.codigo,
  i.bandeira_emoji,
  i.nivel_atual,
  i.nivel_meta,
  i.ativo,
  i.cor,
  i.ordem,
  coalesce(sum(s.duracao_min), 0)::int as minutos_total,
  count(distinct s.data)::int as dias_estudados,
  max(s.data) as ultima_sessao,
  (select count(*) from public.estudos_certificacoes c
     where c.idioma_id = i.id and c.status in ('planejado','inscrito'))::int as certs_planejadas
from public.estudos_idiomas i
left join public.estudos_sessoes s on s.idioma_id = i.id
group by i.id;

-- ============================================================================
-- 6. Seed: Inglês como primeiro idioma do Gustavo (rode com seu user_id se quiser)
--    Pular se quiser cadastrar pela UI
-- ============================================================================
-- insert into public.estudos_idiomas (user_id, nome, codigo, bandeira_emoji, nivel_atual, nivel_meta, cor, ordem)
-- values (auth.uid(), 'Inglês', 'en', '🇬🇧', 'b1', 'c1', '#8B5CF6', 1);

-- ============================================================================
-- Fim
-- ============================================================================
