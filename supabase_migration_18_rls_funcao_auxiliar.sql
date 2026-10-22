-- Diagnóstico UNISOL Brasil — migration 18: RLS via função auxiliar (security definer)
--
-- As migrations 14/16 escreveram a regra de acesso regional como subqueries correlacionadas
-- direto no USING da policy. Em teste real (2026-10-22), confirmado passo a passo que
-- auth.uid() resolve certo e os dados batem exatamente com o esperado — mas a policy ainda
-- assim deixava um técnico Regional-Sul ver um empreendimento marcado Regional-Sudeste.
-- Reescrevendo como função auxiliar: mais fácil de testar isoladamente via RPC (dá pra chamar
-- direto e ver o boolean, sem depender da policy) e é o padrão mais usado no Supabase pra RLS
-- com lógica complexa, em vez de subqueries correlacionadas inline.

create or replace function usuario_pode_ver_empreendimento(p_empreendimento_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select
    exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin')
    or not exists (
      select 1
      from empreendimento_projeto ep
      join equipe_projeto eq on eq.projeto_id = ep.projeto_id
      join usuarios u on u.tecnico_id = eq.tecnico_id
      where ep.empreendimento_id = p_empreendimento_id and u.id = auth.uid()
    )
    or exists (
      select 1
      from empreendimento_projeto ep
      join equipe_projeto eq on eq.projeto_id = ep.projeto_id and eq.nivel_acesso = 'nacional'
      join usuarios u on u.tecnico_id = eq.tecnico_id
      where ep.empreendimento_id = p_empreendimento_id and u.id = auth.uid()
    )
    or exists (
      select 1
      from empreendimento_projeto ep
      join equipe_projeto eq on eq.projeto_id = ep.projeto_id
        and eq.nivel_acesso in ('regional', 'extensionista')
        and eq.regional = ep.regional
      join usuarios u on u.tecnico_id = eq.tecnico_id
      where ep.empreendimento_id = p_empreendimento_id and u.id = auth.uid()
    )
$$;

grant execute on function usuario_pode_ver_empreendimento(uuid) to authenticated, anon;

do $$
declare
  pol record;
begin
  for pol in select polname from pg_policy where polrelid = 'empreendimentos'::regclass and polcmd = 'r'
  loop
    execute format('drop policy %I on empreendimentos', pol.polname);
  end loop;
  for pol in select polname from pg_policy where polrelid = 'empreendimento_projeto'::regclass and polcmd = 'r'
  loop
    execute format('drop policy %I on empreendimento_projeto', pol.polname);
  end loop;
end $$;

create policy empreendimentos_select_por_nivel on empreendimentos
  for select using (usuario_pode_ver_empreendimento(id));

create policy empreendimento_projeto_select_por_nivel on empreendimento_projeto
  for select using (usuario_pode_ver_empreendimento(empreendimento_id));
