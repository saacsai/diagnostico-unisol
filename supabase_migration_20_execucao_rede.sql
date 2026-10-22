-- Diagnóstico UNISOL Brasil — migration 20: Execução em Rede (Celebrante/Executante/Território)
--
-- Substitui o enum "Regional" solto (migrations 14/16/18) pelo modelo cadastral real do MROSC:
-- um projeto pode ser "execução em rede" — 1 Celebrante (normalmente UNISOL Brasil) + N
-- Executantes (Estaduais ou a própria Brasil, quando não há Estadual constituída), cada
-- Executante responsável por um território de UFs. A visibilidade de uma Filiada passa a ser
-- derivada do UF que ela já tem cadastrado (Seção 2 do Diagnóstico), batido contra o território
-- do Executante do usuário — não mais um campo manual sem tela pra preencher.
--
-- Caso real do CooperaMais (confirmado com o Luciano em 2026-10-22): Celebrante = UNISOL Brasil;
-- Executantes = UNISOL SP (território: SP, RJ, ES, MG), UNISOL Bahia (território: todo o
-- Nordeste), UNISOL RS (território: Sul) e a própria UNISOL Brasil, que acumula o papel de
-- Celebrante COM o de Executante direto nos territórios sem Estadual constituída
-- (Centro-Oeste + Norte).

alter table projetos add column if not exists execucao_em_rede boolean not null default false;

create table projeto_executantes (
  id                 uuid primary key default gen_random_uuid(),
  projeto_id         uuid not null references projetos(id) on delete cascade,
  -- null = UNISOL Brasil (nacional) — mesma convenção já usada em tecnicos.unisol_estadual_id
  unisol_estadual_id uuid references unisol_estaduais(id),
  eh_celebrante      boolean not null default false,
  eh_executante      boolean not null default false,
  created_at         timestamptz not null default now()
);

create unique index projeto_executantes_unico
  on projeto_executantes (projeto_id, coalesce(unisol_estadual_id, '00000000-0000-0000-0000-000000000000'));

alter table projeto_executantes enable row level security;

create policy projeto_executantes_select_all on projeto_executantes
  for select using (auth.role() = 'authenticated');

create policy projeto_executantes_insert_admin on projeto_executantes
  for insert with check (exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin'));

create policy projeto_executantes_update_admin on projeto_executantes
  for update using (exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin'));

create policy projeto_executantes_delete_admin on projeto_executantes
  for delete using (exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin'));

create table projeto_executante_territorio (
  id                     uuid primary key default gen_random_uuid(),
  projeto_executante_id  uuid not null references projeto_executantes(id) on delete cascade,
  uf                     text not null check (uf in (
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
    'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
  )),
  unique (projeto_executante_id, uf)
);

alter table projeto_executante_territorio enable row level security;

create policy projeto_executante_territorio_select_all on projeto_executante_territorio
  for select using (auth.role() = 'authenticated');

create policy projeto_executante_territorio_insert_admin on projeto_executante_territorio
  for insert with check (exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin'));

create policy projeto_executante_territorio_delete_admin on projeto_executante_territorio
  for delete using (exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin'));

-- equipe_projeto: null = sem território específico (nacional/celebrante, vê tudo do projeto).
-- Não-null = o usuário só vê o território desse Executante, dentro desse projeto.
alter table equipe_projeto add column if not exists projeto_executante_id uuid references projeto_executantes(id);

-- ─── Seed real do CooperaMais ────────────────────────────────────────────────────────────────

do $$
declare
  v_projeto_id uuid := '624a00f3-96b7-4d4f-bf5a-2aef6c77d59e';
  v_sp uuid := 'a4279500-c24b-485a-91a2-e482d8f640e0'; -- UNISOL São Paulo
  v_ba uuid := 'b807a8fa-c6f1-496e-aeea-4b304aecc58e'; -- UNISOL Bahia
  v_rs uuid := 'efbe3bd4-49d0-42f1-8cbd-b80d806af7a7'; -- UNISOL Rio Grande do Sul
  v_exec_sp uuid;
  v_exec_ba uuid;
  v_exec_rs uuid;
  v_exec_brasil uuid;
begin
  update projetos set execucao_em_rede = true where id = v_projeto_id;

  insert into projeto_executantes (projeto_id, unisol_estadual_id, eh_executante)
    values (v_projeto_id, v_sp, true) returning id into v_exec_sp;
  insert into projeto_executantes (projeto_id, unisol_estadual_id, eh_executante)
    values (v_projeto_id, v_ba, true) returning id into v_exec_ba;
  insert into projeto_executantes (projeto_id, unisol_estadual_id, eh_executante)
    values (v_projeto_id, v_rs, true) returning id into v_exec_rs;
  -- Brasil: celebrante do projeto todo E executante direto nos territórios sem Estadual.
  insert into projeto_executantes (projeto_id, unisol_estadual_id, eh_celebrante, eh_executante)
    values (v_projeto_id, null, true, true) returning id into v_exec_brasil;

  insert into projeto_executante_territorio (projeto_executante_id, uf)
    select v_exec_sp, uf from unnest(array['SP','RJ','ES','MG']) uf;

  insert into projeto_executante_territorio (projeto_executante_id, uf)
    select v_exec_ba, uf from unnest(array['BA','CE','PB','PI','SE','PE','RN','MA','AL']) uf;

  insert into projeto_executante_territorio (projeto_executante_id, uf)
    select v_exec_rs, uf from unnest(array['RS','SC','PR']) uf;

  insert into projeto_executante_territorio (projeto_executante_id, uf)
    select v_exec_brasil, uf from unnest(array['MT','MS','GO','DF','AC','AM','AP','PA','RO','RR','TO']) uf;

  -- Backfill: equipe_projeto.regional (texto solto) -> projeto_executante_id real.
  update equipe_projeto
    set projeto_executante_id = case regional
      when 'Sudeste' then v_exec_sp
      when 'Nordeste' then v_exec_ba
      when 'Sul' then v_exec_rs
      when 'Norte' then v_exec_brasil
      when 'Centro-Oeste' then v_exec_brasil
      else null
    end
    where projeto_id = v_projeto_id and nivel_acesso in ('regional', 'extensionista');
end $$;

-- Campo manual não existe mais — a visibilidade agora vem do UF real da Filiada batido contra
-- o território do Executante (não precisa de tela pra preencher, nem fica desatualizado).
alter table equipe_projeto drop column regional;
alter table empreendimento_projeto drop column regional;

-- ─── Função de visibilidade — reescrita pra usar território por UF ──────────────────────────

create or replace function usuario_pode_ver_empreendimento(p_empreendimento_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select
    exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin')
    or not exists (
      -- fallback: usuário sem vínculo nenhum nos projetos desse empreendimento (outros
      -- módulos que não usam o conceito de território)
      select 1
      from empreendimento_projeto ep
      join equipe_projeto eq on eq.projeto_id = ep.projeto_id
      join usuarios u on u.tecnico_id = eq.tecnico_id
      where ep.empreendimento_id = p_empreendimento_id and u.id = auth.uid()
    )
    or exists (
      -- sem território específico nesse projeto (celebrante/nacional) = vê tudo
      select 1
      from empreendimento_projeto ep
      join equipe_projeto eq on eq.projeto_id = ep.projeto_id and eq.projeto_executante_id is null
      join usuarios u on u.tecnico_id = eq.tecnico_id
      where ep.empreendimento_id = p_empreendimento_id and u.id = auth.uid()
    )
    or exists (
      -- território do Executante do usuário cobre o UF da Filiada, no mesmo projeto
      select 1
      from empreendimento_projeto ep
      join empreendimentos e on e.id = ep.empreendimento_id
      join equipe_projeto eq on eq.projeto_id = ep.projeto_id and eq.projeto_executante_id is not null
      join usuarios u on u.tecnico_id = eq.tecnico_id
      join projeto_executante_territorio pet
        on pet.projeto_executante_id = eq.projeto_executante_id and pet.uf = e.uf
      where ep.empreendimento_id = p_empreendimento_id and u.id = auth.uid()
    )
$$;
