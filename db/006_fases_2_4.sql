-- ============================================================================
-- 006 — Fases 2-4: Treinos, UTFPR, RUAH, Projetos, Intercâmbio
-- Rodar no SQL Editor do Supabase
-- ============================================================================

-- ============================================================================
-- TREINOS (Fase 2)
-- ============================================================================

create table if not exists public.treinos_sessoes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  modalidade text not null, -- 'judo' | 'jiu' | 'tenis' | 'academia'
  data date not null,
  duracao_min int,
  status text not null default 'planejado', -- 'planejado' | 'concluido' | 'cancelado'
  observacoes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_treinos_user_data on public.treinos_sessoes(user_id, data);

create table if not exists public.academia_templates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  ordem text not null default 'a0',
  created_at timestamptz not null default now()
);

create table if not exists public.academia_template_exercicios (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid not null references public.academia_templates(id) on delete cascade,
  nome_exercicio text not null,
  ordem text not null default 'a0'
);

create table if not exists public.academia_series (
  id uuid primary key default uuid_generate_v4(),
  sessao_id uuid not null references public.treinos_sessoes(id) on delete cascade,
  exercicio_id uuid not null references public.academia_template_exercicios(id) on delete cascade,
  ordem int not null default 1,
  peso numeric,
  reps int,
  completo boolean not null default false
);

-- ============================================================================
-- UTFPR (Fase 3)
-- ============================================================================

create table if not exists public.utfpr_disciplinas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  codigo text,
  cor text not null default '#3B82F6',
  semestre text not null default '2026.1',
  created_at timestamptz not null default now()
);

create table if not exists public.utfpr_avaliacoes (
  id uuid primary key default uuid_generate_v4(),
  disciplina_id uuid not null references public.utfpr_disciplinas(id) on delete cascade,
  tipo text not null, -- 'prova' | 'trabalho' | 'exercicio' | 'seminario'
  nome text,
  peso numeric not null default 1,
  nota numeric,
  data date,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- RUAH (Fase 3)
-- ============================================================================

create table if not exists public.ruah_reunioes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  data timestamptz,
  local text,
  ata text,
  participantes jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ruah_ideias (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  descricao text,
  tags text[],
  status text not null default 'ideia', -- 'ideia' | 'aprovada' | 'em_andamento' | 'feita'
  created_at timestamptz not null default now()
);

-- ============================================================================
-- PROJETOS (Fase 4)
-- ============================================================================

create table if not exists public.projetos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  descricao text,
  status text not null default 'ideia', -- 'ideia' | 'ativo' | 'pausado' | 'concluido' | 'cancelado'
  progresso_pct int not null default 0,
  tech_stack jsonb,
  link text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- INTERCÂMBIO (Fase 4)
-- ============================================================================

create table if not exists public.intercambio_checklist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  categoria text not null, -- 'documentos' | 'idiomas' | 'inscricao' | 'financeiro' | 'destino'
  item text not null,
  concluido boolean not null default false,
  prazo date,
  observacoes text,
  ordem text not null default 'a0',
  created_at timestamptz not null default now()
);

-- ============================================================================
-- TAREFA-PONTE (módulo secundário)
-- ============================================================================

alter table public.tarefas add column if not exists modulo_secundario text;

-- ============================================================================
-- RLS
-- ============================================================================

alter table public.treinos_sessoes enable row level security;
alter table public.academia_templates enable row level security;
alter table public.academia_template_exercicios enable row level security;
alter table public.academia_series enable row level security;
alter table public.utfpr_disciplinas enable row level security;
alter table public.utfpr_avaliacoes enable row level security;
alter table public.ruah_reunioes enable row level security;
alter table public.ruah_ideias enable row level security;
alter table public.projetos enable row level security;
alter table public.intercambio_checklist enable row level security;

-- Treinos
drop policy if exists treinos_all on public.treinos_sessoes;
create policy treinos_all on public.treinos_sessoes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists academia_templates_all on public.academia_templates;
create policy academia_templates_all on public.academia_templates for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists academia_exercicios_all on public.academia_template_exercicios;
create policy academia_exercicios_all on public.academia_template_exercicios for all
  using (exists (
    select 1 from public.academia_templates t
    where t.id = template_id and t.user_id = auth.uid()
  ));
drop policy if exists academia_series_all on public.academia_series;
create policy academia_series_all on public.academia_series for all
  using (exists (
    select 1 from public.treinos_sessoes s
    where s.id = sessao_id and s.user_id = auth.uid()
  ));

-- UTFPR
drop policy if exists utfpr_disciplinas_all on public.utfpr_disciplinas;
create policy utfpr_disciplinas_all on public.utfpr_disciplinas for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists utfpr_avaliacoes_all on public.utfpr_avaliacoes;
create policy utfpr_avaliacoes_all on public.utfpr_avaliacoes for all
  using (exists (
    select 1 from public.utfpr_disciplinas d
    where d.id = disciplina_id and d.user_id = auth.uid()
  ));

-- RUAH
drop policy if exists ruah_reunioes_all on public.ruah_reunioes;
create policy ruah_reunioes_all on public.ruah_reunioes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists ruah_ideias_all on public.ruah_ideias;
create policy ruah_ideias_all on public.ruah_ideias for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Projetos
drop policy if exists projetos_all on public.projetos;
create policy projetos_all on public.projetos for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Intercâmbio
drop policy if exists intercambio_all on public.intercambio_checklist;
create policy intercambio_all on public.intercambio_checklist for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
