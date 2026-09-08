-- Diagnóstico UNISOL Brasil — migration 11: vínculo usuarios↔tecnicos + atribuição
-- técnico×empreendimento×projeto
--
-- Achado: usuarios (login) e tecnicos (banco de talentos) nunca foram ligados — não dá pra
-- saber qual tecnicos.id corresponde à pessoa logada. E não existe nenhuma tabela que diga
-- "técnico X é responsável por visitar o empreendimento Y" — só temos equipe_projeto
-- (técnico↔projeto) e empreendimento_projeto (Filiado↔projeto). Essa migration fecha as duas
-- pontas, pré-requisito pro dashboard do técnico ("meus diagnósticos em aberto") fazer sentido.

alter table usuarios add column tecnico_id uuid references tecnicos(id);
-- sem policy nova: usuarios_update_admin (migration 09) já cobre update de qualquer coluna

-- Atribuição de responsabilidade — existe ANTES de qualquer diagnóstico começar (trabalho
-- planejado), diferente de diagnosticos.aplicador_id/tecnico_analista_id (quem JÁ mexeu).
-- Varia por projeto: o mesmo técnico pode ter Filiadas diferentes em projetos diferentes.
create table tecnico_empreendimento_projeto (
  id                 uuid primary key default gen_random_uuid(),
  tecnico_id         uuid not null references tecnicos(id) on delete cascade,
  empreendimento_id  uuid not null references empreendimentos(id) on delete cascade,
  projeto_id         uuid not null references projetos(id) on delete cascade,
  data_atribuicao    date not null default current_date,
  observacao         text,
  created_at         timestamptz not null default now(),
  unique (tecnico_id, empreendimento_id, projeto_id)
);

create index idx_tep_tecnico on tecnico_empreendimento_projeto (tecnico_id);
create index idx_tep_projeto on tecnico_empreendimento_projeto (projeto_id);
create index idx_tep_empreendimento on tecnico_empreendimento_projeto (empreendimento_id);

alter table tecnico_empreendimento_projeto enable row level security;

create policy tep_select_all on tecnico_empreendimento_projeto
  for select using (auth.role() = 'authenticated');

create policy tep_insert_admin on tecnico_empreendimento_projeto
  for insert with check (exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin'));

create policy tep_delete_admin on tecnico_empreendimento_projeto
  for delete using (exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin'));
