-- Diagnóstico UNISOL Brasil — migration 01: Cadastro Nacional UNISOL
-- Formaliza a decisão de 2026-08-15 (kickoff CooperaMais): UNISOL Brasil tem ~1000
-- empreendimentos afiliados no total, um mesmo empreendimento pode estar em mais de um
-- projeto (CooperaMais, Terra Mesa etc.) — relação N:N. Como o projeto Supabase de
-- diagnosticos ainda não tinha dado real em produção, consolidamos aqui em vez de criar
-- um app/banco separado (decisão revisitada em 2026-08-31 com o Luciano).
-- Rodar DEPOIS da supabase_migration_00_inicial.sql, no mesmo projeto.

-- ─── unisol_estaduais ────────────────────────────────────────────────────────
-- UNISOL SP, UNISOL BA, UNISOL RS, UNISOL CE etc. Um empreendimento se filia a UMA
-- estadual (a base institucional dele); pode ainda assim participar de vários
-- projetos nacionais (empreendimento_projeto) — são eixos independentes: a estadual é
-- "de onde ele é", o projeto é "no que ele está engajado agora". O cadastro em si
-- (razão social, CNPJ, endereço...) é único e compartilhado nos dois eixos — não há
-- cadastro duplicado por estadual vs. nacional, é o mesmo registro visto por dois
-- ângulos. Tabela nasce vazia — popular pela tela de admin quando existir.

create table unisol_estaduais (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null unique,   -- ex: "UNISOL SP"
  uf          char(2) not null,
  ativo       boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table unisol_estaduais enable row level security;

create policy unisol_estaduais_select_all on unisol_estaduais
  for select using (auth.role() = 'authenticated');

create policy unisol_estaduais_insert_admin on unisol_estaduais
  for insert with check (
    exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin')
  );

-- usuarios (técnicos/coordenadores) também podem ter uma estadual de origem —
-- complementa `instituicao` (texto livre) com uma referência de verdade, quando aplicável.
alter table usuarios add column unisol_estadual_id uuid references unisol_estaduais(id);

-- ─── projetos ──────────────────────────────────────────────────────────────
-- CooperaMais, Terra Mesa e demais projetos/programas da UNISOL Brasil.

create table projetos (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null unique,
  descricao   text,
  ativo       boolean not null default true,
  created_at  timestamptz not null default now()
);

insert into projetos (nome, descricao) values
  ('CooperaMais', 'Chamamento Público 02/2024 MDA — EcoUni Redes Solidárias, 152 empreendimentos');

alter table projetos enable row level security;

create policy projetos_select_all on projetos
  for select using (auth.role() = 'authenticated');

-- ─── empreendimentos ───────────────────────────────────────────────────────
-- Os ~1000 empreendimentos afiliados à UNISOL Brasil, únicos (independem de projeto).
-- Campos espelham a Seção 2 do Formulário de Diagnóstico Participativo — quando o
-- dirigente preenche a Seção 2 pelo link com token, é este cadastro que ele preenche.

create table empreendimentos (
  id                       uuid primary key default gen_random_uuid(),
  codigo                   text unique,          -- código único do empreendimento (§1.1 do formulário)
  razao_social             text,
  nome_fantasia            text,
  forma_organizativa       text check (forma_organizativa in
                             ('cooperativa','associacao','grupo_informal','rede_central','empreendimento_comunitario','outra')),
  cnpj                     text,
  ano_criacao              integer,
  ano_formalizacao         integer,
  endereco                 text,
  regiao                   text,
  uf                       char(2),
  municipio                text,
  zona                     text check (zona in ('urbana','rural','transicao')),
  territorio_tipo          text,                  -- assentamento, quilombo, território indígena, etc.
  area_abrangencia         text,
  telefones                text,
  email                    text,
  redes_sociais            text,
  site                     text,
  pessoa_referencia_nome   text,
  pessoa_referencia_funcao text,
  pessoa_referencia_tel    text,
  pessoa_referencia_email  text,
  vinculacao_unisol        text check (vinculacao_unisol in ('filiado','em_processo','nao_filiado','nao_sabe')),
  unisol_estadual_id       uuid references unisol_estaduais(id),  -- qual estadual (se filiado/em processo)
  bsr_referencia           text,                  -- Base de Serviços Regional
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index idx_empreendimentos_regiao on empreendimentos (regiao);
create index idx_empreendimentos_uf     on empreendimentos (uf);

alter table empreendimentos enable row level security;

create policy empreendimentos_select_all on empreendimentos
  for select using (auth.role() = 'authenticated');

-- v1: só admin cadastra empreendimento novo (registro institucional, não ação de campo).
create policy empreendimentos_insert_admin on empreendimentos
  for insert with check (
    exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin')
  );

create policy empreendimentos_update_admin on empreendimentos
  for update using (
    exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin')
  );

create trigger trg_empreendimentos_updated_at
  before update on empreendimentos
  for each row execute function update_updated_at();

-- ─── empreendimento_projeto ──────────────────────────────────────────────────
-- Vínculo N:N — resolve "quantos dos 1000 estão no CooperaMais", "quantos no Terra
-- Mesa", etc. Um empreendimento pode estar em vários projetos simultaneamente.

create table empreendimento_projeto (
  id                 uuid primary key default gen_random_uuid(),
  empreendimento_id  uuid not null references empreendimentos(id) on delete cascade,
  projeto_id         uuid not null references projetos(id) on delete cascade,
  status             text not null default 'ativo' check (status in ('ativo','inativo','encerrado')),
  data_entrada       date not null default current_date,
  created_at         timestamptz not null default now(),
  unique (empreendimento_id, projeto_id)
);

alter table empreendimento_projeto enable row level security;

create policy empreendimento_projeto_select_all on empreendimento_projeto
  for select using (auth.role() = 'authenticated');

create policy empreendimento_projeto_insert_admin on empreendimento_projeto
  for insert with check (
    exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin')
  );

-- ─── diagnosticos: troca código-texto por referência de verdade ────────────
-- Tabela ainda sem dado real em produção — ALTER direto, sem migração de linhas.

alter table diagnosticos
  add column empreendimento_id uuid references empreendimentos(id),
  add column projeto_id        uuid references projetos(id);

-- nome_empreendimento/regiao/uf/municipio viram SNAPSHOT no momento da criação do
-- diagnóstico (não fonte de verdade — essa é `empreendimentos`). Mantidos porque o
-- técnico em campo, offline, precisa do diretório de empreendimentos já cacheado
-- localmente (Dexie) para escolher sem sinal — o snapshot evita depender de join
-- toda vez que o app offline precisa mostrar a lista/dashboard.
comment on column diagnosticos.nome_empreendimento is 'Snapshot do nome no momento da criação — fonte de verdade é empreendimentos.nome_fantasia';
comment on column diagnosticos.regiao  is 'Snapshot — fonte de verdade é empreendimentos.regiao';
comment on column diagnosticos.uf      is 'Snapshot — fonte de verdade é empreendimentos.uf';
comment on column diagnosticos.municipio is 'Snapshot — fonte de verdade é empreendimentos.municipio';

alter table diagnosticos drop column codigo_empreendimento;
alter table diagnosticos drop constraint diagnosticos_codigo_empreendimento_versao_key;
alter table diagnosticos add constraint diagnosticos_empreendimento_versao_key unique (empreendimento_id, versao);
alter table diagnosticos alter column empreendimento_id set not null;
alter table diagnosticos alter column projeto_id set not null;

create index idx_diagnosticos_empreendimento on diagnosticos (empreendimento_id);
create index idx_diagnosticos_projeto        on diagnosticos (projeto_id);

-- ─── seed dos 152 empreendimentos do CooperaMais (placeholder) ──────────────
-- Substituir por importação real (planilha/UNISOL) quando disponível. Por ora garante
-- que o vínculo N:N e o fluxo de "escolher empreendimento" tenham dado real pra testar.
-- (Nenhuma linha inserida aqui de propósito — importar via CSV quando a lista chegar.)
