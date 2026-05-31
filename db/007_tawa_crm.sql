-- ============================================================================
-- 007 — Mini-CRM da TAWA
-- Contatos (prefeituras / órgãos / clientes) + histórico de interações.
-- Vínculo com edital é texto livre (editais vivem em outro projeto Supabase).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Contatos
-- ----------------------------------------------------------------------------
create table if not exists public.tawa_contatos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,

  nome text not null,
  tipo text not null default 'prefeitura',        -- prefeitura | orgao | empresa | pessoa | outro
  cidade text,
  uf text,
  telefone text,
  email text,

  status text not null default 'prospecto',        -- prospecto | em_conversa | proposta | ganho | perdido
  edital_ref text,                                  -- ex: "Pregão 008/2026" (texto livre)
  observacoes text,

  proximo_passo text,                               -- follow-up descrição
  proximo_passo_em date,                            -- follow-up data

  setor_id uuid references public.setores_tawa(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists tawa_contatos_updated_at on public.tawa_contatos;
create trigger tawa_contatos_updated_at
  before update on public.tawa_contatos
  for each row execute function public.set_updated_at();

create index if not exists idx_tawa_contatos_user
  on public.tawa_contatos(user_id, updated_at desc);
create index if not exists idx_tawa_contatos_followup
  on public.tawa_contatos(user_id, proximo_passo_em)
  where proximo_passo_em is not null;

-- ----------------------------------------------------------------------------
-- Interações (histórico por contato)
-- ----------------------------------------------------------------------------
create table if not exists public.tawa_interacoes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contato_id uuid not null references public.tawa_contatos(id) on delete cascade,

  data timestamptz not null default now(),
  canal text not null default 'telefone',           -- telefone | email | whatsapp | presencial | outro
  conteudo text not null,

  created_at timestamptz not null default now()
);

create index if not exists idx_tawa_interacoes_contato
  on public.tawa_interacoes(contato_id, data desc);

-- ----------------------------------------------------------------------------
-- Vínculo tarefa -> contato
-- ----------------------------------------------------------------------------
alter table public.tarefas
  add column if not exists contato_id uuid references public.tawa_contatos(id) on delete set null;

create index if not exists idx_tarefas_contato
  on public.tarefas(contato_id) where contato_id is not null;

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
alter table public.tawa_contatos enable row level security;
drop policy if exists tawa_contatos_all on public.tawa_contatos;
create policy tawa_contatos_all on public.tawa_contatos for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.tawa_interacoes enable row level security;
drop policy if exists tawa_interacoes_all on public.tawa_interacoes;
create policy tawa_interacoes_all on public.tawa_interacoes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
