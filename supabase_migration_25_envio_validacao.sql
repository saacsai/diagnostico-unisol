-- Diagnóstico UNISOL Brasil — migration 25: técnico envia pra validação, diretoria valida
--
-- Refinamento do modelo de validação (migration 24), decidido com o Luciano em 2026-11-23: como
-- o diagnóstico tem autosave contínuo, o técnico precisa de um checkpoint PRÓPRIO antes de a
-- diretoria poder validar — sem isso, o admin poderia validar qualquer estado momentâneo que o
-- autosave tivesse gravado, mesmo sem o técnico considerar aquilo pronto. Agora existem dois
-- carimbos distintos: `enviado_em`/`enviado_por` (técnico decide "está pronto, manda pra
-- diretoria") e `validado_em`/`validado_por` (diretoria/admin aprova de fato, já existia).
--
-- Fluxo: técnico edita à vontade via autosave (sem gerar versão nenhuma) → quando decide (ex:
-- combinado com a diretoria a cada 3 meses), clica "Atualizar diagnóstico" → `enviar_para_
-- validacao()` carimba enviado_em/enviado_por e TRAVA edição (mesmo texto de erro de antes,
-- função de guarda ampliada) → diretoria (admin) clica "Validar" → `validar_diagnostico()`
-- (já existente) continua igual: congela como Tx, nasce o próximo rascunho sozinho. Se precisar
-- corrigir algo antes da diretoria decidir, `cancelar_envio_validacao()` destrava sem criar
-- versão nenhuma.

alter table diagnosticos
  add column if not exists enviado_em timestamptz,
  add column if not exists enviado_por uuid references usuarios(id);

-- Amplia a trava: bloqueia edição de respostas/analise_tecnica tanto depois de ENVIADO (aguardando
-- decisão da diretoria) quanto depois de VALIDADO (decisão já tomada, sempre definitiva).
create or replace function diag_guard_pos_validacao()
returns trigger
language plpgsql
as $$
begin
  if (old.validado_em is not null or old.enviado_em is not null)
     and (new.respostas is distinct from old.respostas or new.analise_tecnica is distinct from old.analise_tecnica) then
    raise exception 'Este diagnóstico está enviado para validação ou já foi validado — cancele o envio (ou crie uma nova versão) antes de editar.';
  end if;
  return new;
end;
$$;
-- (trigger trg_diag_guard_pos_validacao já existe, aponta pra esta função — sem precisar recriar)

-- ─── enviar_para_validacao: técnico (ou admin) formaliza o checkpoint ───────────────────────────
-- Só quem já tem acesso à análise técnica (tecnico/admin) pode enviar — mesma régua já usada em
-- diagnosticos_guard_analise (migration 00) e na policy de insert de documentos_institucionais
-- (migration 07) pra esse tipo de ação de "fechamento" do diagnóstico.

create or replace function enviar_para_validacao(p_diagnostico_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_atual diagnosticos%rowtype;
begin
  if not exists (select 1 from usuarios where id = auth.uid() and perfil in ('tecnico', 'admin')) then
    raise exception 'Apenas técnico ou administrador podem enviar o diagnóstico para validação.';
  end if;

  select * into v_atual from diagnosticos where id = p_diagnostico_id for update;
  if not found then
    raise exception 'Diagnóstico não encontrado.';
  end if;
  if v_atual.validado_em is not null then
    raise exception 'Este diagnóstico já foi validado.';
  end if;
  if v_atual.enviado_em is not null then
    raise exception 'Este diagnóstico já foi enviado para validação.';
  end if;
  if v_atual.completo_em is null then
    raise exception 'Diagnóstico ainda não está com o preenchimento completo.';
  end if;

  update diagnosticos set enviado_em = now(), enviado_por = auth.uid() where id = p_diagnostico_id;
end;
$$;

grant execute on function enviar_para_validacao(uuid) to authenticated;

-- ─── cancelar_envio_validacao: destrava sem criar versão nenhuma ────────────────────────────────

create or replace function cancelar_envio_validacao(p_diagnostico_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_atual diagnosticos%rowtype;
begin
  if not exists (select 1 from usuarios where id = auth.uid() and perfil in ('tecnico', 'admin')) then
    raise exception 'Apenas técnico ou administrador podem cancelar o envio.';
  end if;

  select * into v_atual from diagnosticos where id = p_diagnostico_id for update;
  if not found then
    raise exception 'Diagnóstico não encontrado.';
  end if;
  if v_atual.validado_em is not null then
    raise exception 'Este diagnóstico já foi validado — não dá mais pra cancelar o envio.';
  end if;
  if v_atual.enviado_em is null then
    raise exception 'Este diagnóstico não está enviado para validação.';
  end if;

  update diagnosticos set enviado_em = null, enviado_por = null where id = p_diagnostico_id;
end;
$$;

grant execute on function cancelar_envio_validacao(uuid) to authenticated;

-- ─── validar_diagnostico passa a exigir envio formal, não só completude mecânica ────────────────

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
  if v_atual.enviado_em is null then
    raise exception 'O técnico ainda não enviou este diagnóstico para validação.';
  end if;

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
