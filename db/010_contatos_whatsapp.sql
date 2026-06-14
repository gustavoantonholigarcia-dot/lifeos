-- 010_contatos_whatsapp.sql
-- Importação de prospecções da TAWA a partir das notas de WhatsApp (02/06/2026).
-- Prefeituras/órgãos contatados para empenho de editais.
-- Rodar no SQL Editor do Supabase (projeto tava-editais).
-- Ajuste manual depois onde precisar.
--
-- Correções aplicadas:
--   - As 19 cidades fazem parte do Consórcio CIGEDAS (marcado nas observações).
--   - Jandaia do Sul, Doutor Camargo e São Pedro do Paraná já EMPENHARAM (status ganho).
--   - Os telefones (32) 2029-0008 e (32) 99983-2462 são pessoas de Alfredo Vasconcelos
--     (secretaria geral / secretário de saúde) — entram via 011 na tabela de pessoas.

insert into public.tawa_contatos
  (user_id, nome, tipo, cidade, uf, telefone, status, edital_ref, observacoes, motivo_perda)
select u.id, v.nome, v.tipo, v.cidade, v.uf, v.telefone, v.status, v.edital_ref, v.observacoes, v.motivo_perda
from (select id from auth.users order by created_at limit 1) u,
(values
  -- ---- Prospecções com andamento (print 1) ----
  ('Itaperuna',            'prefeitura', 'Itaperuna',                'RJ', null,               'em_conversa', null, 'Vitor entrará em contato comigo.', null),
  ('Doutor Camargo',       'prefeitura', 'Doutor Camargo',           'PR', null,               'ganho',       null, 'Empenhado. Falei com Rafael (secretário de saúde).', null),
  ('Pinheiros',            'prefeitura', 'Pinheiros',                'ES', null,               'perdido',     null, 'Em contato com o Udisom (contatado 2x).', 'Não vai empenhar'),
  ('São Pedro do Paraná',  'prefeitura', 'São Pedro do Paraná',      'PR', null,               'ganho',       null, 'Empenhado. Jeferson analisou o contrato.', null),
  ('Jandaia do Sul',       'prefeitura', 'Jandaia do Sul',           'PR', null,               'ganho',       null, 'Empenhado. Prefeito autorizou o Jonas a fazer o empenho do carro.', null),
  ('São Pedro do Ivaí',    'prefeitura', 'São Pedro do Ivaí',        'PR', null,               'proposta',    null, 'Eder falou que irá enviar os 3 empenhos até amanhã.', null),

  -- ---- Consórcio CIGEDAS ----
  ('CIGEDAS',              'orgao',      null,                       'MG', null,               'em_conversa', 'Cigedas 003/2026; 009/2026', 'Consórcio CIGEDAS. 003/2026 — Amb A, Lote 3. 009/2026 — Van 16 lugares (lote 12) e Van 16 lugares + ace (lote 13). 19 municípios membros cadastrados.', null),

  -- ---- Municípios do Consórcio CIGEDAS (MG) ----
  ('Alfredo Vasconcelos',      'prefeitura', 'Alfredo Vasconcelos',      'MG', null,              'em_conversa', null, 'Município do Consórcio CIGEDAS. Contatos da secretaria geral e do secretário de saúde cadastrados.', null),
  ('Barroso',                  'prefeitura', 'Barroso',                  'MG', null,              'em_conversa', null, 'Município do Consórcio CIGEDAS. Liguei para 3 secretárias diferentes e não tive retorno.', null),
  ('Carrancas',                'prefeitura', 'Carrancas',                'MG', '(35) 99827-0564', 'prospecto',   null, 'Município do Consórcio CIGEDAS. Whats de Carrancas.', null),
  ('Conceição da Barra de Minas','prefeitura','Conceição da Barra de Minas','MG','(32) 99831-7856','em_conversa', null, 'Município do Consórcio CIGEDAS. Whats secretário de saúde. Mario Lucio / Cecília.', null),
  ('Coronel Xavier Chaves',    'prefeitura', 'Coronel Xavier Chaves',    'MG', null,              'prospecto',   null, 'Município do Consórcio CIGEDAS.', null),
  ('Dores de Campos',          'prefeitura', 'Dores de Campos',          'MG', null,              'prospecto',   null, 'Município do Consórcio CIGEDAS. Sem contato.', null),
  ('Ibituruna',                'prefeitura', 'Ibituruna',                'MG', '(35) 99737-3722', 'prospecto',   null, 'Município do Consórcio CIGEDAS. Whats.', null),
  ('Itutinga',                 'prefeitura', 'Itutinga',                 'MG', null,              'prospecto',   null, 'Município do Consórcio CIGEDAS.', null),
  ('Lagoa Dourada',            'prefeitura', 'Lagoa Dourada',            'MG', null,              'prospecto',   null, 'Município do Consórcio CIGEDAS.', null),
  ('Madre de Deus de Minas',   'prefeitura', 'Madre de Deus de Minas',   'MG', null,              'prospecto',   null, 'Município do Consórcio CIGEDAS.', null),
  ('Nazareno',                 'prefeitura', 'Nazareno',                 'MG', null,              'prospecto',   null, 'Município do Consórcio CIGEDAS.', null),
  ('Prados',                   'prefeitura', 'Prados',                   'MG', null,              'prospecto',   null, 'Município do Consórcio CIGEDAS.', null),
  ('Resende Costa',            'prefeitura', 'Resende Costa',            'MG', null,              'em_conversa', null, 'Município do Consórcio CIGEDAS. Em contato com Fagner — me transferiu para o Diego.', null),
  ('Ritápolis',                'prefeitura', 'Ritápolis',                'MG', null,              'prospecto',   null, 'Município do Consórcio CIGEDAS.', null),
  ('Santa Cruz de Minas',      'prefeitura', 'Santa Cruz de Minas',      'MG', null,              'prospecto',   null, 'Município do Consórcio CIGEDAS.', null),
  ('São João del Rei',         'prefeitura', 'São João del Rei',         'MG', null,              'prospecto',   null, 'Município do Consórcio CIGEDAS.', null),
  ('São Tiago',                'prefeitura', 'São Tiago',                'MG', null,              'prospecto',   null, 'Município do Consórcio CIGEDAS.', null),
  ('São Vicente de Minas',     'prefeitura', 'São Vicente de Minas',     'MG', null,              'prospecto',   null, 'Município do Consórcio CIGEDAS.', null),
  ('Tiradentes',               'prefeitura', 'Tiradentes',               'MG', null,              'prospecto',   null, 'Município do Consórcio CIGEDAS.', null)
) as v(nome, tipo, cidade, uf, telefone, status, edital_ref, observacoes, motivo_perda);
