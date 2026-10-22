-- Diagnóstico UNISOL Brasil — migration 17: RLS estava DESABILITADA em empreendimentos
--
-- Achado em teste real (2026-10-22): mesmo depois da migration 16 (que limpou policies
-- "fantasma"), uma consulta 100% anônima (sem login nenhum) ainda retornava a ABAM. Isso só
-- acontece quando a tabela está com Row Level Security desligada — nesse estado o Postgres
-- ignora toda policy e usa a permissão padrão (aberta) dos roles anon/authenticated. A migration
-- 01 original já tinha `enable row level security`, então em algum momento (provavelmente
-- debug anterior neste projeto) alguém desligou de novo via Studio e nunca foi religada.
--
-- Religa nas duas tabelas do caso em questão. Idempotente — seguro rodar mesmo se já estiver
-- ligada.

alter table empreendimentos enable row level security;
alter table empreendimento_projeto enable row level security;

-- Auditoria rápida: lista todas as tabelas públicas com RLS desligada, pra pegar outros casos
-- iguais a esse antes que apareçam como bug em produção. Só leitura, não altera nada — revisar
-- o resultado manualmente.
select relname as tabela
from pg_class
join pg_namespace on pg_namespace.oid = pg_class.relnamespace
where pg_namespace.nspname = 'public'
  and pg_class.relkind = 'r'
  and not pg_class.relrowsecurity;
