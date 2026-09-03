-- Diagnóstico UNISOL Brasil — migration 05: categoria de instrumento (Emendas/MROSC/Outros)
-- Campo controlado pra filtrar a sidebar de Projetos — separado de tipo_instrumento (texto
-- livre descritivo, ex: "Termo de Fomento") que continua existindo.

alter table projetos
  add column categoria_instrumento text not null default 'outro'
    check (categoria_instrumento in ('emenda', 'mrosc', 'outro'));

update projetos set categoria_instrumento = 'mrosc' where nome = 'CooperaMais';
