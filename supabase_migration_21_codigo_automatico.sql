-- Diagnóstico UNISOL Brasil — migration 21: código único do empreendimento gerado pelo sistema
--
-- Luciano (2026-10-22): o código deve ser único, gerado pelo sistema, no CADASTRO da Filiada
-- (não digitado pelo técnico durante o diagnóstico). Formato: UF-0001, UF-0002... sequencial
-- dentro de cada UF.

create table codigo_sequencias (
  uf       text primary key,
  proximo  int not null default 1
);

alter table codigo_sequencias enable row level security;
create policy codigo_sequencias_nenhum_acesso_direto on codigo_sequencias for all using (false);

create or replace function gerar_codigo_empreendimento(p_uf text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_num int;
begin
  insert into codigo_sequencias (uf, proximo) values (p_uf, 2)
  on conflict (uf) do update set proximo = codigo_sequencias.proximo + 1
  returning proximo - 1 into v_num;
  return p_uf || '-' || lpad(v_num::text, 4, '0');
end;
$$;

grant execute on function gerar_codigo_empreendimento(text) to authenticated;

create or replace function trg_gerar_codigo_empreendimento()
returns trigger
language plpgsql
as $$
begin
  if new.codigo is null and new.uf is not null then
    new.codigo := gerar_codigo_empreendimento(new.uf);
  end if;
  return new;
end;
$$;

drop trigger if exists before_insert_gerar_codigo on empreendimentos;
create trigger before_insert_gerar_codigo
  before insert on empreendimentos
  for each row execute function trg_gerar_codigo_empreendimento();

-- Backfill: empreendimentos que já existem sem código (ex: ABAM, cadastrada antes dessa regra).
do $$
declare
  r record;
begin
  for r in select id, uf from empreendimentos where codigo is null and uf is not null
  loop
    update empreendimentos set codigo = gerar_codigo_empreendimento(r.uf) where id = r.id;
  end loop;
end $$;
