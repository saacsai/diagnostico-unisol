-- Diagnóstico UNISOL Brasil — migration 06: relato de evolução por versão
-- Ao "Atualizar diagnóstico" (nova versão pro mesmo Filiado, ex: T0 → T1-2027), o aplicador/
-- técnico pode registrar um breve relato do que mudou. O relatório em si (arquivo) continua
-- indo pra documentos_institucionais (entidade_tipo='diagnostico', tipo_documento=
-- 'relatorio_evolucao'), esse campo é só o texto curto.

alter table diagnosticos add column relato_versao text;
