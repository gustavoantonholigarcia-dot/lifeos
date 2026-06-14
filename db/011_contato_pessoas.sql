-- 011_contato_pessoas.sql
-- Pessoas de contato dentro de um mesmo cliente (ex: secretário de saúde,
-- secretaria geral, prefeito). Cada cliente (tawa_contatos) pode ter várias.
-- Rodar DEPOIS do 010 (precisa dos contatos já criados pro seed do Alfredo).

create table if not exists public.tawa_contato_pessoas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contato_id uuid not null references public.tawa_contatos(id) on delete cascade,

  nome text not null,            -- "Rafael", "Secretaria Geral"
  cargo text,                    -- "Secretário de Saúde"
  telefone text,
  email text,
  observacao text,

  ordem int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_tawa_contato_pessoas_contato
  on public.tawa_contato_pessoas(contato_id, ordem);

alter table public.tawa_contato_pessoas enable row level security;
drop policy if exists tawa_contato_pessoas_all on public.tawa_contato_pessoas;
create policy tawa_contato_pessoas_all on public.tawa_contato_pessoas for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- Seed: pessoas de Alfredo Vasconcelos ----
insert into public.tawa_contato_pessoas
  (user_id, contato_id, nome, cargo, telefone, ordem)
select c.user_id, c.id, p.nome, p.cargo, p.telefone, p.ordem
from public.tawa_contatos c
cross join (values
  ('Secretaria Geral',      'Secretaria geral', '(32) 2029-0008',  0),
  ('Secretário de Saúde',   'Secretário de saúde', '(32) 99983-2462', 1)
) as p(nome, cargo, telefone, ordem)
where c.nome = 'Alfredo Vasconcelos'
  and c.user_id = (select id from auth.users order by created_at limit 1);
