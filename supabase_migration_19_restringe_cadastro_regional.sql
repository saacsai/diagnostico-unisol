-- Diagnóstico UNISOL Brasil — migration 19: só nacional/regional cadastram empreendimento
-- no CooperaMais; extensionista só visualiza.
--
-- empreendimentos_insert_autenticado (migration 02) continua aberta — é a entrada rápida de
-- campo pra outros módulos, não é específica do CooperaMais e não sabemos ainda, no momento
-- do insert, a qual projeto esse empreendimento vai ser vinculado. A restrição certa é no
-- VÍNCULO com o projeto (empreendimento_projeto), que é onde sabemos o projeto_id. Mesmo
-- padrão de fallback das migrations 14/16/18: se o usuário não tem nenhum vínculo de nível
-- nesse projeto (outros módulos que não usam o conceito), nada muda — continua liberado.

create or replace function usuario_pode_vincular_projeto(p_projeto_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select
    exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin')
    or not exists (
      select 1 from equipe_projeto eq
      join usuarios u on u.tecnico_id = eq.tecnico_id
      where eq.projeto_id = p_projeto_id and u.id = auth.uid()
    )
    or exists (
      select 1 from equipe_projeto eq
      join usuarios u on u.tecnico_id = eq.tecnico_id
      where eq.projeto_id = p_projeto_id and u.id = auth.uid()
        and eq.nivel_acesso in ('nacional', 'regional')
    )
$$;

grant execute on function usuario_pode_vincular_projeto(uuid) to authenticated, anon;

drop policy if exists empreendimento_projeto_insert_autenticado on empreendimento_projeto;

create policy empreendimento_projeto_insert_por_nivel on empreendimento_projeto
  for insert with check (usuario_pode_vincular_projeto(projeto_id));
