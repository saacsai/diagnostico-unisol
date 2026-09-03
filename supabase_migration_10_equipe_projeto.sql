-- Diagnóstico UNISOL Brasil — migration 10: Equipe — aloca técnico (banco de talentos) num
-- projeto, com cargo/função. Junction N:N entre tecnicos e projetos, independente do vínculo
-- institucional do técnico (Nacional/Estadual) e do vínculo dos Filiados com o projeto
-- (empreendimento_projeto) — três eixos distintos.

create table equipe_projeto (
  id           uuid primary key default gen_random_uuid(),
  projeto_id   uuid not null references projetos(id) on delete cascade,
  tecnico_id   uuid not null references tecnicos(id) on delete cascade,
  cargo        text, -- função dentro do projeto, ex: "Coordenador Regional", "Técnico ATER"
  data_entrada date not null default current_date,
  data_saida   date,
  ativo        boolean not null default true,
  created_at   timestamptz not null default now(),
  unique (projeto_id, tecnico_id)
);

create index idx_equipe_projeto_projeto on equipe_projeto (projeto_id);
create index idx_equipe_projeto_tecnico on equipe_projeto (tecnico_id);

alter table equipe_projeto enable row level security;

create policy equipe_projeto_select_all on equipe_projeto
  for select using (auth.role() = 'authenticated');

create policy equipe_projeto_insert_admin on equipe_projeto
  for insert with check (exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin'));

create policy equipe_projeto_update_admin on equipe_projeto
  for update using (exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin'));

create policy equipe_projeto_delete_admin on equipe_projeto
  for delete using (exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin'));
