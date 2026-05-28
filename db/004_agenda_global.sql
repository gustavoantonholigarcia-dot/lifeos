-- ============================================================================
-- LifeOS — Generalizar agenda (não só TAWA)
-- Rodar DEPOIS do 003_tawa_agenda.sql
-- ============================================================================

-- 1. Renomeia tabela
alter table if exists public.tawa_anotacoes rename to anotacoes;

-- 2. Adiciona coluna modulo (default 'tawa' pras existentes)
alter table public.anotacoes
  add column if not exists modulo text not null default 'tawa'
  check (modulo in ('tawa','utfpr','ruah','treinos','estudos','projetos','intercambio','geral'));

-- 3. Recria índices com nome novo
drop index if exists idx_tawa_anotacoes_user_data;
drop index if exists idx_tawa_anotacoes_setor;

create index if not exists idx_anotacoes_user_data
  on public.anotacoes(user_id, data desc, created_at desc);
create index if not exists idx_anotacoes_user_modulo
  on public.anotacoes(user_id, modulo, data desc);
create index if not exists idx_anotacoes_setor
  on public.anotacoes(setor_id) where setor_id is not null;

-- 4. Renomeia trigger
drop trigger if exists tawa_anotacoes_updated_at on public.anotacoes;
create trigger anotacoes_updated_at
  before update on public.anotacoes
  for each row execute function public.set_updated_at();

-- 5. Renomeia policy
drop policy if exists tawa_anotacoes_all on public.anotacoes;
create policy anotacoes_all on public.anotacoes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
