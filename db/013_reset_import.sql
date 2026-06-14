-- 013_reset_import.sql
-- Limpeza dos dados importados (010/011/012) pra rodar do zero sem duplicar.
-- Apaga a ata CIGEDAS e todos os contatos importados (por nome). Cascade leva
-- junto pessoas, participantes, empenhos e interações. NÃO mexe em contatos
-- que você criou manualmente com outros nomes.
-- Cole este arquivo INTEIRO (ele já reinsere tudo no fim).

do $$
declare uid uuid := (select id from auth.users order by created_at limit 1);
begin
  -- Apaga a ata CIGEDAS (cascade: lotes, participantes, empenhos)
  delete from public.tawa_atas where user_id = uid and nome = 'CIGEDAS';

  -- Apaga os contatos importados (cascade: pessoas, participantes, empenhos, interações)
  delete from public.tawa_contatos
  where user_id = uid
    and nome in (
      'Itaperuna','Doutor Camargo','Pinheiros','São Pedro do Paraná','Jandaia do Sul',
      'São Pedro do Ivaí','CIGEDAS','Alfredo Vasconcelos','Barroso','Carrancas',
      'Conceição da Barra de Minas','Coronel Xavier Chaves','Dores de Campos','Dores do Campo',
      'Ibituruna','Itutinga','Lagoa Dourada','Madre de Deus de Minas','Nazareno','Prados',
      'Resende Costa','Ritápolis','Santa Cruz de Minas','São João del Rei','São João Del Rey',
      'São Tiago','São Vicente de Minas','Tiradentes','Edital 32 20290008'
    );
end $$;
