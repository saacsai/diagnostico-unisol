-- Diagnóstico UNISOL Brasil — migration 14: níveis de acesso por Regional pro CooperaMais/EcoUni
--
-- Nem todos os empreendimentos do CooperaMais estão cadastrados ainda, então o acesso por
-- enquanto é por Regional inteira (não por empreendimento individual — isso muda depois, quando
-- tiver todos cadastrados, usando tecnico_empreendimento_projeto que já existe desde a
-- migration 11). Confirmado com o Luciano: é restrição REAL no banco (RLS), não só filtro de
-- tela — mais restritiva que a decisão de agosto/2026 ("técnico tem visibilidade nacional"), mas
-- só vale pra empreendimentos/empreendimento_projeto, não mexe na regra geral de perfil que
-- outros módulos do sistema ainda usam.

alter table equipe_projeto
  add column if not exists nivel_acesso text check (nivel_acesso in ('nacional', 'regional', 'extensionista')),
  add column if not exists regional text check (regional in ('Norte', 'Nordeste', 'Sudeste', 'Sul', 'Centro-Oeste'));

-- regional só é relevante quando nivel_acesso é 'regional'/'extensionista' (NULL = 'nacional',
-- vê tudo do projeto). Escopado por projeto de propósito — evita hardcoded UF→Regional
-- institucional fixo, cada projeto pode agrupar UFs diferente (princípio já estabelecido no
-- sistema desde a elucubração conceitual de 2026-09-29).

alter table empreendimento_projeto
  add column if not exists regional text check (regional in ('Norte', 'Nordeste', 'Sudeste', 'Sul', 'Centro-Oeste'));

-- Tag de qual Regional (do CooperaMais especificamente, não institucional) cada empreendimento
-- pertence DENTRO desse projeto — fica pronta pra quando os empreendimentos forem cadastrados.

-- RLS real: troca a policy de SELECT aberta por uma que respeita o nível de acesso do usuário
-- logado no projeto em questão. Resolve via subquery em equipe_projeto ligando
-- usuarios.tecnico_id -> equipe_projeto.tecnico_id (mesmo projeto do empreendimento).

drop policy if exists empreendimentos_select_all on empreendimentos;

create policy empreendimentos_select_por_nivel on empreendimentos
  for select using (
    -- admin sempre vê tudo
    exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin')
    or
    -- usuário sem vínculo de projeto nenhum ainda vê tudo (fallback — não quebra módulos que
    -- não usam nível de acesso, ex: Diagnóstico institucional fora do CooperaMais)
    not exists (
      select 1
      from empreendimento_projeto ep
      join equipe_projeto eq on eq.projeto_id = ep.projeto_id
      join usuarios u on u.tecnico_id = eq.tecnico_id
      where ep.empreendimento_id = empreendimentos.id and u.id = auth.uid()
    )
    or
    -- usuário com nível 'nacional' no projeto do empreendimento
    exists (
      select 1
      from empreendimento_projeto ep
      join equipe_projeto eq on eq.projeto_id = ep.projeto_id and eq.nivel_acesso = 'nacional'
      join usuarios u on u.tecnico_id = eq.tecnico_id
      where ep.empreendimento_id = empreendimentos.id and u.id = auth.uid()
    )
    or
    -- usuário regional/extensionista: regional bate
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

drop policy if exists empreendimento_projeto_select_all on empreendimento_projeto;

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
