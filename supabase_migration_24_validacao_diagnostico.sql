-- Diagnóstico UNISOL Brasil — migration 24: linha do tempo T0/T1/T2... com validação da diretoria
--
-- Contexto (decisão com o Luciano, 2026-11-23): hoje o % de preenchimento é calculado na hora,
-- sem nenhum registro de "quando bateu 100%" nem de "quem aprovou". Luciano quer que, quando a
-- diretoria validar um diagnóstico completo, essa versão congele (vira T0, só leitura/impressão)
-- e nasça automaticamente um rascunho novo pro técnico continuar — quando esse bater 100% e for
-- validado, vira T1, e segue o ciclo (T2, T3...). Não precisa de tabela de log separada: como
-- cada T é um snapshot completo, "o que mudou entre T0 e T1" é só comparar os dois JSONBs sob
-- demanda (feito em código, não aqui).

alter table diagnosticos
  add column if not exists completo_em timestamptz,   -- quando o técnico bateu 100% pela 1a vez
  add column if not exists validado_em timestamptz,    -- quando a diretoria (via admin) validou
  add column if not exists validado_por uuid references usuarios(id);

-- ─── completude 100% → completo_em (espelha lib/diagnostico/completude.ts em SQL) ──────────────
--
-- As 17 seções de SECOES: parteA/parteB/bloco1-9 vêm de `respostas`; bloco10-12/anexoB vêm de
-- `analise_tecnica`; bloco0 vem de `empreendimentos.nome_fantasia`; anexoA vem da existência de
-- pelo menos 1 documento em `documentos_institucionais` (entidade_tipo='diagnostico'). Isso é
-- feito em SQL (não só no cliente) porque o Anexo A pode completar o diagnóstico sem nenhum
-- UPDATE na própria linha de `diagnosticos` — só assim pega os dois gatilhos possíveis.

create or replace function diag_esta_100pct(p_diagnostico_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select
    (select nome_fantasia is not null from empreendimentos e
       join diagnosticos d on d.empreendimento_id = e.id where d.id = p_diagnostico_id)
    and (select respostas ? 'parteA' and respostas ? 'parteB'
           and respostas ? 'bloco1' and respostas ? 'bloco2' and respostas ? 'bloco3'
           and respostas ? 'bloco4' and respostas ? 'bloco5' and respostas ? 'bloco6'
           and respostas ? 'bloco7' and respostas ? 'bloco8' and respostas ? 'bloco9'
         from diagnosticos where id = p_diagnostico_id)
    and (select analise_tecnica ? 'bloco10' and analise_tecnica ? 'bloco11'
           and analise_tecnica ? 'bloco12' and analise_tecnica ? 'anexoB'
         from diagnosticos where id = p_diagnostico_id)
    and exists (
      select 1 from documentos_institucionais
      where entidade_tipo = 'diagnostico' and entidade_id = p_diagnostico_id
    )
$$;

create or replace function diag_marcar_completo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.completo_em is null and diag_esta_100pct(new.id) then
    new.completo_em := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_diag_marcar_completo on diagnosticos;
create trigger trg_diag_marcar_completo
  before update on diagnosticos
  for each row
  when (new.respostas is distinct from old.respostas or new.analise_tecnica is distinct from old.analise_tecnica)
  execute function diag_marcar_completo();

-- Gatilho pelo lado do Anexo A: subir o documento não mexe na linha de `diagnosticos`, então
-- precisa de um segundo trigger, disparado pela tabela de documentos.
create or replace function diag_marcar_completo_via_anexo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.entidade_tipo = 'diagnostico' then
    update diagnosticos
      set completo_em = now()
      where id = new.entidade_id and completo_em is null and diag_esta_100pct(new.entidade_id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_diag_marcar_completo_via_anexo on documentos_institucionais;
create trigger trg_diag_marcar_completo_via_anexo
  after insert on documentos_institucionais
  for each row execute function diag_marcar_completo_via_anexo();

-- ─── trava: depois de validado, a linha congela de verdade ─────────────────────────────────────
-- Mesmo princípio de diagnosticos_guard_analise (migration 00) — não é só UI, é física no banco.
-- A única forma de mudar algo depois de validado é pela próxima versão (criada por
-- validar_diagnostico abaixo), nunca editando a linha antiga de novo.

create or replace function diag_guard_pos_validacao()
returns trigger
language plpgsql
as $$
begin
  if old.validado_em is not null
     and (new.respostas is distinct from old.respostas or new.analise_tecnica is distinct from old.analise_tecnica) then
    raise exception 'Este diagnóstico já foi validado — qualquer alteração precisa criar uma nova versão.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_diag_guard_pos_validacao on diagnosticos;
create trigger trg_diag_guard_pos_validacao
  before update on diagnosticos
  for each row execute function diag_guard_pos_validacao();

-- ─── validar_diagnostico: congela a versão atual (T{n}) + já nasce o próximo rascunho ───────────
-- Só admin pode chamar (decisão 2026-11-23 — "quem mais pode validar" fica pra depois, fácil de
-- trocar essa única checagem quando a regra mudar). Atômico: ou as duas coisas acontecem (congela
-- + nasce o próximo rascunho) ou nenhuma.

create or replace function validar_diagnostico(p_diagnostico_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_atual diagnosticos%rowtype;
  v_novo_id uuid;
  v_proxima_versao int;
  v_rotulo_atual text;
begin
  if not exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin') then
    raise exception 'Apenas administradores podem validar diagnósticos.';
  end if;

  select * into v_atual from diagnosticos where id = p_diagnostico_id for update;
  if not found then
    raise exception 'Diagnóstico não encontrado.';
  end if;
  if v_atual.validado_em is not null then
    raise exception 'Este diagnóstico já foi validado.';
  end if;
  if v_atual.completo_em is null then
    raise exception 'Diagnóstico ainda não está com o preenchimento completo.';
  end if;

  -- Rótulo da versão que está sendo validada agora: T{versao-1} (T0 = versao 1, T1 = versao 2...)
  -- — só preenche se ainda não tinha rótulo manual de uma sessão anterior.
  v_rotulo_atual := coalesce(v_atual.rotulo_versao, 'T' || (v_atual.versao - 1));

  update diagnosticos
    set validado_em = now(), validado_por = auth.uid(), rotulo_versao = v_rotulo_atual
    where id = p_diagnostico_id;

  v_novo_id := gen_random_uuid();
  v_proxima_versao := v_atual.versao + 1;

  insert into diagnosticos (
    id, empreendimento_id, projeto_id, aplicador_id, status, versao, rotulo_versao,
    nome_empreendimento, regiao, uf, municipio, modalidade,
    respostas, analise_tecnica
  ) values (
    v_novo_id, v_atual.empreendimento_id, v_atual.projeto_id, auth.uid(), 'rascunho', v_proxima_versao,
    'T' || (v_proxima_versao - 1),
    v_atual.nome_empreendimento, v_atual.regiao, v_atual.uf, v_atual.municipio, v_atual.modalidade,
    v_atual.respostas, v_atual.analise_tecnica
  );

  return v_novo_id;
end;
$$;

grant execute on function validar_diagnostico(uuid) to authenticated;
