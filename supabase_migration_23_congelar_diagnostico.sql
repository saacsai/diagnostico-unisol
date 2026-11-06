-- Congela diagnóstico de Filiadas específicas, sem excluir nenhum dado: a
-- Filiada e o diagnóstico continuam existindo e visíveis, só fica bloqueado
-- iniciar um diagnóstico novo ou continuar editando um existente.

alter table empreendimentos
  add column if not exists diagnostico_liberado boolean not null default true;

comment on column empreendimentos.diagnostico_liberado is
  'false = diagnóstico desta Filiada está congelado: não aparece pra iniciar diagnóstico novo, e o wizard bloqueia edição do existente. Nenhum dado é excluído.';
