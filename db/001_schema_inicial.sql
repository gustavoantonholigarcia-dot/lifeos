-- ============================================================================
-- LifeOS — Schema inicial (Fase 0/1)
-- Rodar no SQL Editor do projeto Supabase 'lifeos'
-- Data: 2026-05-26
-- ============================================================================

-- Extensões necessárias
create extension if not exists "uuid-ossp";

-- ============================================================================
-- 1. Profiles (espelha auth.users)
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  foto_url text,
  created_at timestamptz not null default now()
);

-- Trigger pra criar profile automaticamente quando user se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 2. Setores TAWA
-- ============================================================================
create table if not exists public.setores_tawa (
  id uuid primary key default uuid_generate_v4(),
  nome text not null unique,
  cor text not null,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

-- Seed dos setores (idempotente — só insere se 'nome' ainda não existe)
insert into public.setores_tawa (nome, cor, ordem) values
  ('Comercial',      '#3B82F6', 1),
  ('Jurídico',       '#A855F7', 2),
  ('Logística',      '#22C55E', 3),
  ('Administrativo', '#F59E0B', 4),
  ('Financeiro',     '#EF4444', 5)
on conflict (nome) do nothing;

-- ============================================================================
-- 3. Tarefas (compartilhado entre TAWA, UTFPR, RUAH, Projetos, Intercâmbio)
-- ============================================================================
create table if not exists public.tarefas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,

  modulo text not null check (modulo in ('tawa','utfpr','ruah','projeto','intercambio')),
  setor_id uuid references public.setores_tawa(id) on delete set null,

  titulo text not null,
  descricao text,
  observacoes text,

  status text not null default 'a_fazer'
    check (status in ('a_fazer','em_andamento','concluido')),
  prioridade text not null default 'sem'
    check (prioridade in ('alta','media','baixa','sem')),

  -- Fractional indexing pra drag-and-drop sem N updates
  ordem text not null default 'a0',

  prazo_tipo text not null default 'sem'
    check (prazo_tipo in ('fixo','variavel','sem')),
  prazo_em timestamptz,

  origem text not null default 'minha' check (origem in ('minha','delegada')),
  delegado_por text,

  recorrente jsonb,

  concluida_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger pra atualizar updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tarefas_updated_at on public.tarefas;
create trigger tarefas_updated_at
  before update on public.tarefas
  for each row execute function public.set_updated_at();

-- Índices úteis
create index if not exists idx_tarefas_user_modulo on public.tarefas(user_id, modulo);
create index if not exists idx_tarefas_user_status on public.tarefas(user_id, status);
create index if not exists idx_tarefas_user_prazo  on public.tarefas(user_id, prazo_em) where prazo_em is not null;

-- ============================================================================
-- 4. Prioridades diárias (Foco do Dia)
-- ============================================================================
create table if not exists public.prioridades_diarias (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data date not null,
  tarefa_id uuid not null references public.tarefas(id) on delete cascade,
  ordem text not null default 'a0',
  created_at timestamptz not null default now(),
  unique (user_id, data, tarefa_id)
);

create index if not exists idx_prioridades_user_data on public.prioridades_diarias(user_id, data);

-- ============================================================================
-- 5. Notificações agendadas (referência pra cancelar/recalcular)
-- ============================================================================
create table if not exists public.notificacoes_agendadas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  referencia_id uuid not null,
  referencia_tipo text not null,  -- 'tarefa' | 'treino' | 'reuniao' etc.
  disparar_em timestamptz not null,
  mensagem text not null,
  identificador_local text,       -- ID retornado por expo-notifications
  enviada boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notif_user_disparo on public.notificacoes_agendadas(user_id, disparar_em);

-- ============================================================================
-- 6. RLS (Row-Level Security)
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.tarefas enable row level security;
alter table public.prioridades_diarias enable row level security;
alter table public.notificacoes_agendadas enable row level security;
alter table public.setores_tawa enable row level security;

-- Profiles: só o dono
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (auth.uid() = id);
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update using (auth.uid() = id);

-- Tarefas: só o dono
drop policy if exists tarefas_all on public.tarefas;
create policy tarefas_all on public.tarefas for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Prioridades diárias: só o dono
drop policy if exists prioridades_all on public.prioridades_diarias;
create policy prioridades_all on public.prioridades_diarias for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Notificações: só o dono
drop policy if exists notif_all on public.notificacoes_agendadas;
create policy notif_all on public.notificacoes_agendadas for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Setores TAWA: leitura pública (são dados de domínio, comuns a todos os users)
drop policy if exists setores_select on public.setores_tawa;
create policy setores_select on public.setores_tawa for select using (true);

-- ============================================================================
-- Fim
-- ============================================================================
