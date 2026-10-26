-- Diagnóstico UNISOL Brasil — migration 22: corrige gap da migration 06
--
-- `diagnosticos.relato_versao` (migration 06, escrita em 2026-09-03) nunca tinha sido rodada de
-- verdade em produção — mesmo padrão do gap achado na migration 11 em 2026-09-29 (SQL escrito e
-- registrado como concluído na memória/STATUS.md, mas a etapa de colar no SQL Editor ficou pra
-- trás). Confirmado via erro real em produção (42703 undefined_column) ao salvar um diagnóstico
-- em 2026-10-24 — sync engine manda o campo porque o TypeScript sempre teve ele, só o banco
-- nunca recebeu a coluna. Auditado o resto de `diagnosticos`/`empreendimentos` contra os tipos
-- TypeScript: esse era o único gap.

alter table diagnosticos add column if not exists relato_versao text;
