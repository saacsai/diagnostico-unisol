-- Diagnóstico UNISOL Brasil — migration 08: banco de talentos técnicos (tecnicos)
-- Separado de `usuarios` de propósito: aqui é o cadastro de pessoas disponíveis pra atuar
-- (área de atuação, competências), independente de ter login no sistema. Alocação num projeto
-- específico (cargo/função, aba "Equipe" em Projeto) vem numa próxima migration.

create table tecnicos (
  id                 uuid primary key default gen_random_uuid(),
  nome               text not null,
  telefone           text,
  email              text,
  area_atuacao       text check (area_atuacao in
    ('ater', 'administrativo', 'comunicacao', 'coordenacao', 'juridico', 'contabil', 'ti')),
  competencias       text,
  unisol_estadual_id uuid references unisol_estaduais(id), -- null = direto na Nacional
  ativo              boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table tecnicos enable row level security;

create policy tecnicos_select_all on tecnicos
  for select using (auth.role() = 'authenticated');

create policy tecnicos_insert_admin on tecnicos
  for insert with check (exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin'));

create policy tecnicos_update_admin on tecnicos
  for update using (exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin'));

create trigger trg_tecnicos_updated_at
  before update on tecnicos
  for each row execute function update_updated_at();
