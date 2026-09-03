-- Diagnóstico UNISOL Brasil — migration 04: camada institucional
-- (unisol_brasil, enriquecimento de unisol_estaduais, diretoria, documentos com validade,
-- projetos ricos, correção do vínculo diagnóstico->filiado)

-- ─── diagnosticos: projeto_id vira contexto opcional, ganha rótulo de versão ────────────────
-- Diagnóstico pertence ao Filiado (empreendimento_id), não ao Projeto — é reaproveitável entre
-- projetos ao longo do tempo. projeto_id continua existindo só como "coletado no âmbito de X".
alter table diagnosticos alter column projeto_id drop not null;
alter table diagnosticos add column rotulo_versao text; -- ex: 'T0', 'T1-2027'

-- ─── unisol_brasil (singleton nacional) ──────────────────────────────────────────────────────
create table unisol_brasil (
  id                   uuid primary key default gen_random_uuid(),
  nome                 text not null,
  cnpj                 text,
  endereco             text,
  municipio            text,
  uf                   char(2),
  cep                  text,
  site                 text,
  representante_nome   text,
  representante_cargo  text,
  representante_rg     text,
  representante_cpf    text,
  representante_tel    text,
  representante_email  text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table unisol_brasil enable row level security;

create policy unisol_brasil_select_all on unisol_brasil
  for select using (auth.role() = 'authenticated');

create policy unisol_brasil_update_admin on unisol_brasil
  for update using (exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin'));

create trigger trg_unisol_brasil_updated_at
  before update on unisol_brasil
  for each row execute function update_updated_at();

-- Seed com dado real (CNPJ, endereço, CPF/RG de representante) fica em arquivo separado
-- NÃO versionado (supabase_seed_04_dados_reais_privado.sql) — repo é público, esse dado é
-- pessoal sensível. Rodar os dois arquivos em sequência.

-- ─── unisol_estaduais: enriquece (hoje só tinha nome+uf) ────────────────────────────────────
alter table unisol_estaduais
  add column cnpj text,
  add column endereco text,
  add column municipio text,
  add column cep text,
  add column site text,
  add column status text not null default 'formalizada' check (status in ('formalizada','em_constituicao')),
  add column representante_nome text,
  add column representante_cargo text,
  add column representante_rg text,
  add column representante_cpf text,
  add column representante_tel text,
  add column representante_email text;

-- Estaduais sem CNPJ/CPF conhecido ainda (não é PII, seguro no repo público) — as 3 com dado
-- completo (SP/Bahia/RS) e o CNPJ/endereço/representante delas ficam no seed privado.
insert into unisol_estaduais (nome, uf, status) values
  ('UNISOL São Paulo', 'SP', 'formalizada'),
  ('UNISOL Bahia', 'BA', 'formalizada'),
  ('UNISOL Rio Grande do Sul', 'RS', 'formalizada'),
  ('UNISOL Piauí', 'PI', 'formalizada'),
  ('UNISOL Ceará', 'CE', 'formalizada'),
  ('UNISOL Paraíba', 'PB', 'formalizada'),
  ('UNISOL Mato Grosso', 'MT', 'em_constituicao'),
  ('UNISOL Acre', 'AC', 'em_constituicao'),
  ('UNISOL Sergipe', 'SE', 'em_constituicao'),
  ('UNISOL Minas', 'MG', 'em_constituicao'),
  ('UNISOL Santa Catarina', 'SC', 'em_constituicao');

-- ─── diretoria_membros ────────────────────────────────────────────────────────────────────────
create table diretoria_membros (
  id             uuid primary key default gen_random_uuid(),
  entidade_tipo  text not null check (entidade_tipo in ('unisol_brasil','unisol_estadual')),
  entidade_id    uuid not null,
  nome_completo  text not null,
  cargo          text,
  endereco       text,
  email          text,
  telefone       text,
  cpf            text,
  rg             text,
  created_at     timestamptz not null default now()
);

alter table diretoria_membros enable row level security;

-- Dado pessoal sensível (CPF/RG) — só admin/tecnico enxerga.
create policy diretoria_select_privilegiado on diretoria_membros
  for select using (exists (select 1 from usuarios where id = auth.uid() and perfil in ('tecnico','admin')));

create policy diretoria_insert_privilegiado on diretoria_membros
  for insert with check (exists (select 1 from usuarios where id = auth.uid() and perfil in ('tecnico','admin')));

-- Seed de diretoria (nomes/CPF/RG reais) também fica no arquivo privado, junto do resto do
-- dado pessoal — roda depois de popular unisol_brasil/unisol_estaduais com os dados reais.

-- ─── documentos_institucionais (polimórfica: Brasil/Estadual/Projeto/Diagnóstico=Anexo A) ────
create table documentos_institucionais (
  id              uuid primary key default gen_random_uuid(),
  entidade_tipo   text not null check (entidade_tipo in ('unisol_brasil','unisol_estadual','projeto','diagnostico')),
  entidade_id     uuid not null,
  tipo_documento  text not null,
  nome_arquivo    text,
  storage_path    text not null,
  data_emissao    date,
  data_validade   date,
  observacao      text,
  uploaded_by     uuid references usuarios(id),
  created_at      timestamptz not null default now()
);

create index idx_documentos_entidade on documentos_institucionais (entidade_tipo, entidade_id);

alter table documentos_institucionais enable row level security;

create policy documentos_select_all on documentos_institucionais
  for select using (auth.role() = 'authenticated');

create policy documentos_insert on documentos_institucionais
  for insert with check (
    (entidade_tipo in ('unisol_brasil','unisol_estadual','projeto')
      and exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin'))
    or
    (entidade_tipo = 'diagnostico' and exists (
      select 1 from diagnosticos d
      where d.id = documentos_institucionais.entidade_id
        and (d.aplicador_id = auth.uid()
             or exists (select 1 from usuarios where id = auth.uid() and perfil in ('tecnico','admin')))
    ))
  );

create policy documentos_delete_admin on documentos_institucionais
  for delete using (exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin'));

-- Bucket de Storage privado. Situação (vigente/vencendo/vencida) é CALCULADA no app a partir de
-- data_validade — não fica armazenada, pra nunca dessincronizar.
insert into storage.buckets (id, name, public)
  values ('documentos-institucionais', 'documentos-institucionais', false)
  on conflict (id) do nothing;

create policy documentos_storage_select on storage.objects
  for select using (bucket_id = 'documentos-institucionais' and auth.role() = 'authenticated');

create policy documentos_storage_insert on storage.objects
  for insert with check (bucket_id = 'documentos-institucionais' and auth.role() = 'authenticated');

-- ─── projetos: de "nome+descrição" pra entidade rica ────────────────────────────────────────
alter table projetos
  add column resumo text,
  add column financiador text,
  add column orgao_responsavel text,
  add column tipo_instrumento text,
  add column numero_termo_fomento text,
  add column numero_transferegov text,
  add column status text not null default 'em_execucao'
    check (status in ('em_concorrencia','em_fase_aprovacao','em_execucao','encerrado')),
  add column data_inicio_execucao date,
  add column data_fim_execucao date;

update projetos set
  resumo = 'Chamamento Público nº 02/2024 — apoio a 152 empreendimentos de agricultura familiar/economia solidária em 5 regiões do Brasil, coordenado nacionalmente pela UNISOL Brasil com articulação regional de UNISOL Bahia (Nordeste), UNISOL São Paulo (Sudeste) e UNISOL Rio Grande do Sul (Sul).',
  financiador = 'MDA',
  orgao_responsavel = 'Ministério do Desenvolvimento Agrário e Agricultura Familiar',
  tipo_instrumento = 'Termo de Fomento',
  numero_termo_fomento = '058321/2025',
  numero_transferegov = '993381/2025',
  status = 'em_execucao'
where nome = 'CooperaMais';
