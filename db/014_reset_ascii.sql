-- 014_reset_ascii.sql
-- Conserto do encoding: os acentos quebraram ao colar no Supabase (mojibake).
-- Apaga TUDO do CRM (contatos + atas) e reimporta SEM acento (ASCII puro),
-- evitando o problema de encoding. Cole este arquivo INTEIRO e rode uma vez.
--
-- ATENCAO: apaga TODOS os contatos do CRM desse usuario.

-- ============================================================================
-- 1. Limpeza total
-- ============================================================================
do $$
declare uid uuid := (select id from auth.users order by created_at limit 1);
begin
  delete from public.tawa_atas where user_id = uid;        -- cascade: lotes, participantes, empenhos
  delete from public.tawa_contatos where user_id = uid;    -- cascade: pessoas, participantes, empenhos, interacoes
end $$;

-- ============================================================================
-- 2. Contatos (ASCII)
-- ============================================================================
insert into public.tawa_contatos
  (user_id, nome, tipo, cidade, uf, telefone, status, edital_ref, observacoes, motivo_perda)
select u.id, v.nome, v.tipo, v.cidade, v.uf, v.telefone, v.status, v.edital_ref, v.observacoes, v.motivo_perda
from (select id from auth.users order by created_at limit 1) u,
(values
  ('Itaperuna',            'prefeitura', 'Itaperuna',                'RJ', null,               'em_conversa', null, 'Vitor entrara em contato comigo.', null),
  ('Doutor Camargo',       'prefeitura', 'Doutor Camargo',           'PR', null,               'ganho',       null, 'Empenhado. Falei com Rafael (secretario de saude).', null),
  ('Pinheiros',            'prefeitura', 'Pinheiros',                'ES', null,               'perdido',     null, 'Em contato com o Udisom (2x).', 'Nao vai empenhar'),
  ('Sao Pedro do Parana',  'prefeitura', 'Sao Pedro do Parana',      'PR', null,               'ganho',       null, 'Empenhado. Jeferson analisou o contrato.', null),
  ('Jandaia do Sul',       'prefeitura', 'Jandaia do Sul',           'PR', null,               'ganho',       null, 'Empenhado. Prefeito autorizou o Jonas a fazer o empenho.', null),
  ('Sao Pedro do Ivai',    'prefeitura', 'Sao Pedro do Ivai',        'PR', null,               'proposta',    null, 'Eder falou que ira enviar os 3 empenhos ate amanha.', null),

  ('CIGEDAS',              'orgao',      null,                       'MG', null,               'em_conversa', 'Cigedas 003/2026; 009/2026', 'Consorcio CIGEDAS. 003/2026 - Amb A, Lote 3. 009/2026 - Van 16 lugares (lote 12) e Van 16 + ace (lote 13). 19 municipios membros.', null),

  ('Alfredo Vasconcelos',        'prefeitura', 'Alfredo Vasconcelos',        'MG', null,              'em_conversa', null, 'Municipio do Consorcio CIGEDAS. Contatos da secretaria geral e do secretario de saude cadastrados.', null),
  ('Barroso',                    'prefeitura', 'Barroso',                    'MG', null,              'em_conversa', null, 'Municipio do Consorcio CIGEDAS. Liguei para 3 secretarias diferentes e nao tive retorno.', null),
  ('Carrancas',                  'prefeitura', 'Carrancas',                  'MG', '(35) 99827-0564', 'prospecto',   null, 'Municipio do Consorcio CIGEDAS. Whats de Carrancas.', null),
  ('Conceicao da Barra de Minas','prefeitura', 'Conceicao da Barra de Minas','MG', '(32) 99831-7856', 'em_conversa', null, 'Municipio do Consorcio CIGEDAS. Whats secretario de saude. Mario Lucio / Cecilia.', null),
  ('Coronel Xavier Chaves',      'prefeitura', 'Coronel Xavier Chaves',      'MG', null,              'prospecto',   null, 'Municipio do Consorcio CIGEDAS.', null),
  ('Dores de Campos',            'prefeitura', 'Dores de Campos',            'MG', null,              'prospecto',   null, 'Municipio do Consorcio CIGEDAS. Sem contato.', null),
  ('Ibituruna',                  'prefeitura', 'Ibituruna',                  'MG', '(35) 99737-3722', 'prospecto',   null, 'Municipio do Consorcio CIGEDAS. Whats.', null),
  ('Itutinga',                   'prefeitura', 'Itutinga',                   'MG', null,              'prospecto',   null, 'Municipio do Consorcio CIGEDAS.', null),
  ('Lagoa Dourada',              'prefeitura', 'Lagoa Dourada',              'MG', null,              'prospecto',   null, 'Municipio do Consorcio CIGEDAS.', null),
  ('Madre de Deus de Minas',     'prefeitura', 'Madre de Deus de Minas',     'MG', null,              'prospecto',   null, 'Municipio do Consorcio CIGEDAS.', null),
  ('Nazareno',                   'prefeitura', 'Nazareno',                   'MG', null,              'prospecto',   null, 'Municipio do Consorcio CIGEDAS.', null),
  ('Prados',                     'prefeitura', 'Prados',                     'MG', null,              'prospecto',   null, 'Municipio do Consorcio CIGEDAS.', null),
  ('Resende Costa',              'prefeitura', 'Resende Costa',              'MG', null,              'em_conversa', null, 'Municipio do Consorcio CIGEDAS. Em contato com Fagner - me transferiu para o Diego.', null),
  ('Ritapolis',                  'prefeitura', 'Ritapolis',                  'MG', null,              'prospecto',   null, 'Municipio do Consorcio CIGEDAS.', null),
  ('Santa Cruz de Minas',        'prefeitura', 'Santa Cruz de Minas',        'MG', null,              'prospecto',   null, 'Municipio do Consorcio CIGEDAS.', null),
  ('Sao Joao del Rei',           'prefeitura', 'Sao Joao del Rei',           'MG', null,              'prospecto',   null, 'Municipio do Consorcio CIGEDAS.', null),
  ('Sao Tiago',                  'prefeitura', 'Sao Tiago',                  'MG', null,              'prospecto',   null, 'Municipio do Consorcio CIGEDAS.', null),
  ('Sao Vicente de Minas',       'prefeitura', 'Sao Vicente de Minas',       'MG', null,              'prospecto',   null, 'Municipio do Consorcio CIGEDAS.', null),
  ('Tiradentes',                 'prefeitura', 'Tiradentes',                 'MG', null,              'prospecto',   null, 'Municipio do Consorcio CIGEDAS.', null)
) as v(nome, tipo, cidade, uf, telefone, status, edital_ref, observacoes, motivo_perda);

-- ============================================================================
-- 3. Pessoas de contato (Alfredo Vasconcelos)
-- ============================================================================
insert into public.tawa_contato_pessoas
  (user_id, contato_id, nome, cargo, telefone, ordem)
select c.user_id, c.id, p.nome, p.cargo, p.telefone, p.ordem
from public.tawa_contatos c
cross join (values
  ('Secretaria Geral',    'Secretaria geral',    '(32) 2029-0008',  0),
  ('Secretario de Saude', 'Secretario de saude', '(32) 99983-2462', 1)
) as p(nome, cargo, telefone, ordem)
where c.nome = 'Alfredo Vasconcelos'
  and c.user_id = (select id from auth.users order by created_at limit 1);

-- ============================================================================
-- 4. Ata CIGEDAS + 3 lotes + 19 participantes
-- ============================================================================
insert into public.tawa_atas (user_id, nome, descricao)
select id, 'CIGEDAS',
  'Ata de registro de precos - 3 lotes ganhos. Os 19 municipios membros podem caronar e empenhar cada veiculo.'
from auth.users order by created_at limit 1;

insert into public.tawa_ata_lotes (user_id, ata_id, numero, veiculo, edital_ref, ordem)
select a.user_id, a.id, v.numero, v.veiculo, v.edital, v.ordem
from public.tawa_atas a
cross join (values
  ('Lote 3',  'Ambulancia Tipo A',                'Cigedas 003/2026', 0),
  ('Lote 12', 'Van 16 lugares',                   'Cigedas 009/2026', 1),
  ('Lote 13', 'Van 16 lugares + acessibilidade',  'Cigedas 009/2026', 2)
) as v(numero, veiculo, edital, ordem)
where a.nome = 'CIGEDAS'
  and a.user_id = (select id from auth.users order by created_at limit 1);

insert into public.tawa_ata_participantes (user_id, ata_id, contato_id)
select c.user_id, a.id, c.id
from public.tawa_atas a
join public.tawa_contatos c
  on c.user_id = a.user_id
 and c.nome in (
   'Alfredo Vasconcelos','Barroso','Carrancas','Conceicao da Barra de Minas',
   'Coronel Xavier Chaves','Dores de Campos','Ibituruna','Itutinga','Lagoa Dourada',
   'Madre de Deus de Minas','Nazareno','Prados','Resende Costa','Ritapolis',
   'Santa Cruz de Minas','Sao Joao del Rei','Sao Tiago','Sao Vicente de Minas','Tiradentes'
 )
where a.nome = 'CIGEDAS'
  and a.user_id = (select id from auth.users order by created_at limit 1)
on conflict (ata_id, contato_id) do nothing;
