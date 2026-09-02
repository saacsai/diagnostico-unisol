-- Diagnóstico UNISOL Brasil — migration 02: técnico pode cadastrar empreendimento em campo
-- Decisão 2026-09-02: entrega rápida, lista real da UNISOL ainda não chegou. Técnico em
-- visita a uma cooperativa ainda não cadastrada preenche a Seção 2 (=empreendimentos) na
-- hora, sem esperar aprovação de admin. Update continua restrito (só admin corrige depois).

drop policy empreendimentos_insert_admin on empreendimentos;

create policy empreendimentos_insert_autenticado on empreendimentos
  for insert with check (auth.role() = 'authenticated');
