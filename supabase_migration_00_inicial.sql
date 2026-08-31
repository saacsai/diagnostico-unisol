-- Diagnóstico UNISOL Brasil — migration inicial
-- Rodar no SQL Editor do projeto Supabase novo e dedicado deste app.

-- ─── usuarios ──────────────────────────────────────────────────────────────
-- Espelha auth.users 1:1. perfil='tecnico'/'admin' também pode fazer tudo que
-- 'aplicador' faz, mais preencher a análise técnica (seção 17-18).

create table usuarios (
  id          uuid primary key references auth.users(id) on delete cascade,
  nome        text not null,
  email       text not null,
  perfil      text not null check (perfil in ('aplicador','tecnico','admin')),
  instituicao text,
  ativo       boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table usuarios enable row level security;

create policy usuarios_select_all on usuarios
  for select using (auth.role() = 'authenticated');

-- ─── diagnosticos ──────────────────────────────────────────────────────────
-- Um documento por diagnóstico (não normalizado por seção) — mapeia 1:1 com o
-- registro local no IndexedDB do app, o que torna o sync offline um upsert
-- simples. Ver plano em .claude/plans (seção "1. Schema Supabase") para a
-- justificativa completa dessa escolha.

create table diagnosticos (
  id                     uuid primary key,          -- gerado no CLIENTE (crypto.randomUUID())
  codigo_empreendimento  text not null,
  versao                 integer not null default 1, -- permite re-diagnóstico futuro sem perder histórico
  nome_empreendimento    text,
  regiao                 text,
  uf                     char(2),
  municipio              text,
  modalidade             text check (modalidade in ('presencial','online','hibrida')),
  aplicador_id           uuid not null references usuarios(id) default auth.uid(),
  status                 text not null default 'rascunho'
                           check (status in ('rascunho','entrevista_concluida','em_analise_tecnica','concluido')),
  respostas              jsonb not null default '{}'::jsonb,  -- seções 1-16 (aplicador, durante a entrevista)
  analise_tecnica        jsonb not null default '{}'::jsonb,  -- seções 17-18 (técnico, pós-entrevista)
  pontuacao_total        numeric(4,1),                         -- soma das 13 dimensões da seção 17 (máx. 52)
  classificacao          text check (classificacao in
                           ('emergencial','inicial','em_desenvolvimento','estruturado','consolidado')),
  tecnico_analista_id    uuid references usuarios(id),
  device_id              text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  deleted_at             timestamptz,                          -- soft delete apenas, sem policy de delete
  unique (codigo_empreendimento, versao)
);

create index idx_diagnosticos_codigo         on diagnosticos (codigo_empreendimento);
create index idx_diagnosticos_status         on diagnosticos (status) where deleted_at is null;
create index idx_diagnosticos_uf             on diagnosticos (uf);
create index idx_diagnosticos_respostas_gin  on diagnosticos using gin (respostas jsonb_path_ops);

alter table diagnosticos enable row level security;

-- Equipe pequena e confiável: qualquer autenticado lê todos os 152 registros
-- (precisa pra assumir rascunho de colega e revisar qualquer entrevista).
-- Revisitar se a visibilidade ampla entre técnicos deixar de ser aceitável.
create policy diag_select_all on diagnosticos
  for select using (auth.role() = 'authenticated');

create policy diag_insert_own on diagnosticos
  for insert with check (aplicador_id = auth.uid());

create policy diag_update_own_or_privilegiado on diagnosticos
  for update using (
    aplicador_id = auth.uid()
    or exists (select 1 from usuarios where id = auth.uid() and perfil in ('tecnico','admin'))
  );

-- ─── triggers ──────────────────────────────────────────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

create trigger trg_diagnosticos_updated_at
  before update on diagnosticos
  for each row execute function update_updated_at();

-- Aplica no banco (não só na UI) a separação de papéis: só técnico/admin
-- pode alterar a análise técnica (seções 17-18), mesmo que o aplicador
-- consiga fazer UPDATE na linha (para editar respostas 1-16).
create or replace function diagnosticos_guard_analise()
returns trigger as $$
begin
  if (new.analise_tecnica is distinct from old.analise_tecnica
      or new.pontuacao_total is distinct from old.pontuacao_total
      or new.classificacao is distinct from old.classificacao)
     and not exists (select 1 from usuarios where id = auth.uid() and perfil in ('tecnico','admin')) then
    raise exception 'Apenas técnico/admin pode preencher a análise técnica (Seção 17-18)';
  end if;
  return new;
end; $$ language plpgsql security definer;

create trigger trg_diagnosticos_guard_analise
  before update on diagnosticos
  for each row execute function diagnosticos_guard_analise();

-- ─── onboarding de técnicos (v1: manual) ────────────────────────────────────
-- 1. Supabase Studio → Authentication → Add user (email + senha temporária)
-- 2. Copiar o UUID gerado e rodar:
--    insert into usuarios (id, nome, email, perfil, instituicao)
--    values ('<uuid>', 'Nome Completo', 'email@exemplo.org', 'aplicador', 'UNISOL SP');
