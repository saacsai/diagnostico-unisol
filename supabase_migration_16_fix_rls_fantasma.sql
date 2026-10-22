-- Diagnóstico UNISOL Brasil — migration 16: corrige RLS "fantasma" em empreendimentos
--
-- Achado em teste real (2026-10-22): mesmo depois da migration 14, um técnico Regional-Sul
-- conseguia ver um empreendimento marcado como Regional-Sudeste. A migration 14 fez
-- `drop policy empreendimentos_select_all` e criou `empreendimentos_select_por_nivel`, mas
-- Postgres combina MÚLTIPLAS policies permissivas pro mesmo comando com OR — então se existisse
-- qualquer outra policy de SELECT nessas tabelas (ex: criada direto no Studio em algum momento,
-- fora do controle destes arquivos .sql), ela continuaria liberando acesso geral por trás da
-- nossa, mesmo com nome/origem diferentes. Em vez de adivinhar o nome, remove TODAS as policies
-- de SELECT existentes nas duas tabelas antes de recriar só a correta — garante que não sobra
-- nenhuma brecha desconhecida.

do $$
declare
  pol record;
begin
  for pol in
    select polname from pg_policy
    where polrelid = 'empreendimentos'::regclass and polcmd = 'r'
  loop
    execute format('drop policy %I on empreendimentos', pol.polname);
  end loop;

  for pol in
    select polname from pg_policy
    where polrelid = 'empreendimento_projeto'::regclass and polcmd = 'r'
  loop
    execute format('drop policy %I on empreendimento_projeto', pol.polname);
  end loop;
end $$;

create policy empreendimentos_select_por_nivel on empreendimentos
  for select using (
    exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin')
    or
    not exists (
      select 1
      from empreendimento_projeto ep
      join equipe_projeto eq on eq.projeto_id = ep.projeto_id
      join usuarios u on u.tecnico_id = eq.tecnico_id
      where ep.empreendimento_id = empreendimentos.id and u.id = auth.uid()
    )
    or
    exists (
      select 1
      from empreendimento_projeto ep
      join equipe_projeto eq on eq.projeto_id = ep.projeto_id and eq.nivel_acesso = 'nacional'
      join usuarios u on u.tecnico_id = eq.tecnico_id
      where ep.empreendimento_id = empreendimentos.id and u.id = auth.uid()
    )
    or
    exists (
      select 1
      from empreendimento_projeto ep
      join equipe_projeto eq on eq.projeto_id = ep.projeto_id
        and eq.nivel_acesso in ('regional', 'extensionista')
        and eq.regional = ep.regional
      join usuarios u on u.tecnico_id = eq.tecnico_id
      where ep.empreendimento_id = empreendimentos.id and u.id = auth.uid()
    )
  );

create policy empreendimento_projeto_select_por_nivel on empreendimento_projeto
  for select using (
    exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin')
    or
    not exists (
      select 1 from equipe_projeto eq
      join usuarios u on u.tecnico_id = eq.tecnico_id
      where eq.projeto_id = empreendimento_projeto.projeto_id and u.id = auth.uid()
    )
    or
    exists (
      select 1 from equipe_projeto eq
      join usuarios u on u.tecnico_id = eq.tecnico_id
      where eq.projeto_id = empreendimento_projeto.projeto_id and u.id = auth.uid()
        and eq.nivel_acesso = 'nacional'
    )
    or
    exists (
      select 1 from equipe_projeto eq
      join usuarios u on u.tecnico_id = eq.tecnico_id
      where eq.projeto_id = empreendimento_projeto.projeto_id and u.id = auth.uid()
        and eq.nivel_acesso in ('regional', 'extensionista')
        and eq.regional = empreendimento_projeto.regional
    )
  );
