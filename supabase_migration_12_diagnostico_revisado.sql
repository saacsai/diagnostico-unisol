-- Migration 12 — campos novos do Diagnóstico revisado (Diagnostico_revisado.docx)
-- Reestruturação: 18 seções lineares viram Parte A/B + Blocos 0-12 + Anexo A/B.
-- Sem dado real em produção ainda (confirmado com o Luciano em 2026-09-25) — sem
-- preocupação de migrar resposta existente, só adiciona coluna nova.
--
-- Rodar no SQL Editor do Supabase (projeto aloumokqafywqntdisen), colando deste
-- arquivo local (não do chat — copiar do chat já corrompeu caractere antes).

-- ── Bloco 0 — Identificação e Territorialidade ────────────────────────────────
alter table empreendimentos add column if not exists coordenadas text;
alter table empreendimentos add column if not exists cadeia_produtiva_territorial text;
alter table empreendimentos add column if not exists cadeia_produtiva_justificativa text;
alter table empreendimentos add column if not exists origem_necessidades text;
alter table empreendimentos add column if not exists missao text;
alter table empreendimentos add column if not exists reconhece_economia_solidaria text;
alter table empreendimentos add column if not exists bloco0_regua_classificacao smallint;
alter table empreendimentos add column if not exists bloco0_regua_evidencia text;

-- territorio_tipo já existia como texto livre — passa a ser usado como enum
-- controlado pelo front (assentamento/quilombo/territorio_indigena/
-- comunidade_ribeirinha/comunidade_extrativista/periferia_urbana/outro), sem
-- constraint no banco (mesma convenção já usada em forma_organizativa/zona).
