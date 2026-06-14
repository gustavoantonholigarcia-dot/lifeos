-- 012_atas_empenhos.sql
-- Atas de registro de preços que a TAWA ganhou. Cada ata tem lotes (veículos);
-- vários órgãos (contatos) podem "caronar" e empenhar cada lote.
-- Modelo genérico: serve pra CIGEDAS e futuras atas/consórcios.
-- Rodar DEPOIS do 010 (precisa das 19 cidades já criadas pro seed).

-- ----------------------------------------------------------------------------
-- Ata
-- ----------------------------------------------------------------------------
create table if not exists public.tawa_atas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,                 -- "CIGEDAS"
  descricao text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Lotes da ata (cada lote = um veículo ganho)
-- ----------------------------------------------------------------------------
create table if not exists public.tawa_ata_lotes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ata_id uuid not null references public.tawa_atas(id) on delete cascade,
  numero text,                        -- "Lote 3"
  veiculo text not null,              -- "Ambulância Tipo A"
  edital_ref text,                    -- "Cigedas 003/2026"
  valor_unitario numeric(12,2),
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_tawa_ata_lotes_ata
  on public.tawa_ata_lotes(ata_id, ordem);

-- ----------------------------------------------------------------------------
-- Participantes (quais contatos/cidades podem caronar a ata)
-- ----------------------------------------------------------------------------
create table if not exists public.tawa_ata_participantes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ata_id uuid not null references public.tawa_atas(id) on delete cascade,
  contato_id uuid not null references public.tawa_contatos(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (ata_id, contato_id)
);

create index if not exists idx_tawa_ata_part_contato
  on public.tawa_ata_participantes(contato_id);

-- ----------------------------------------------------------------------------
-- Empenhos (status de cada cidade × lote). Linha só existe quando sai de pendente.
-- ----------------------------------------------------------------------------
create table if not exists public.tawa_empenhos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contato_id uuid not null references public.tawa_contatos(id) on delete cascade,
  lote_id uuid not null references public.tawa_ata_lotes(id) on delete cascade,
  status text not null default 'pendente',   -- pendente | em_conversa | empenhado
  data_empenho date,
  valor numeric(12,2),
  observacao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (contato_id, lote_id)
);

drop trigger if exists tawa_empenhos_updated_at on public.tawa_empenhos;
create trigger tawa_empenhos_updated_at
  before update on public.tawa_empenhos
  for each row execute function public.set_updated_at();

create index if not exists idx_tawa_empenhos_contato
  on public.tawa_empenhos(contato_id);

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
alter table public.tawa_atas enable row level security;
drop policy if exists tawa_atas_all on public.tawa_atas;
create policy tawa_atas_all on public.tawa_atas for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.tawa_ata_lotes enable row level security;
drop policy if exists tawa_ata_lotes_all on public.tawa_ata_lotes;
create policy tawa_ata_lotes_all on public.tawa_ata_lotes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.tawa_ata_participantes enable row level security;
drop policy if exists tawa_ata_part_all on public.tawa_ata_participantes;
create policy tawa_ata_part_all on public.tawa_ata_participantes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.tawa_empenhos enable row level security;
drop policy if exists tawa_empenhos_all on public.tawa_empenhos;
create policy tawa_empenhos_all on public.tawa_empenhos for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- Seed: ata CIGEDAS, 3 lotes e os 19 municípios participantes
-- ============================================================================
insert into public.tawa_atas (user_id, nome, descricao)
select id, 'CIGEDAS',
  'Ata de registro de preços — 3 lotes ganhos. Os 19 municípios membros podem caronar e empenhar cada veículo.'
from auth.users order by created_at limit 1;

-- Lotes
insert into public.tawa_ata_lotes (user_id, ata_id, numero, veiculo, edital_ref, ordem)
select a.user_id, a.id, v.numero, v.veiculo, v.edital, v.ordem
from public.tawa_atas a
cross join (values
  ('Lote 3',  'Ambulância Tipo A',                'Cigedas 003/2026', 0),
  ('Lote 12', 'Van 16 lugares',                   'Cigedas 009/2026', 1),
  ('Lote 13', 'Van 16 lugares + acessibilidade',  'Cigedas 009/2026', 2)
) as v(numero, veiculo, edital, ordem)
where a.nome = 'CIGEDAS'
  and a.user_id = (select id from auth.users order by created_at limit 1);

-- Participantes (19 municípios)
insert into public.tawa_ata_participantes (user_id, ata_id, contato_id)
select c.user_id, a.id, c.id
from public.tawa_atas a
join public.tawa_contatos c
  on c.user_id = a.user_id
 and c.nome in (
   'Alfredo Vasconcelos','Barroso','Carrancas','Conceição da Barra de Minas',
   'Coronel Xavier Chaves','Dores de Campos','Ibituruna','Itutinga','Lagoa Dourada',
   'Madre de Deus de Minas','Nazareno','Prados','Resende Costa','Ritápolis',
   'Santa Cruz de Minas','São João del Rei','São Tiago','São Vicente de Minas','Tiradentes'
 )
where a.nome = 'CIGEDAS'
  and a.user_id = (select id from auth.users order by created_at limit 1)
on conflict (ata_id, contato_id) do nothing;
