-- Links curtos no próprio domínio sistema.unisolbrasil.org.br — usados nos emails
-- de convite/redefinição de senha pra não expor o link cru e longo do Supabase
-- (aloumokqafywqntdisen.supabase.co/auth/v1/verify?token=...), que deixa gente
-- desconfiada de phishing.

create table links_curtos (
  codigo     text primary key,
  destino    text not null,
  created_at timestamptz not null default now(),
  usado_em   timestamptz
);

alter table links_curtos enable row level security;

-- Só a service role (admin API) cria/lê — a rota pública /ir/[codigo] usa
-- getSupabaseAdmin(), nunca o client anon.
create policy links_curtos_service_only on links_curtos
  for all using (false);
