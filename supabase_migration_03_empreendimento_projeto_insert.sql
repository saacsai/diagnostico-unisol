-- Diagnóstico UNISOL Brasil — migration 03: técnico pode vincular empreendimento a projeto
-- Mesma lógica da migration 02: ao criar um diagnóstico novo, o técnico também precisa
-- poder gravar o vínculo N:N empreendimento_projeto (não só o empreendimento em si).

drop policy empreendimento_projeto_insert_admin on empreendimento_projeto;

create policy empreendimento_projeto_insert_autenticado on empreendimento_projeto
  for insert with check (auth.role() = 'authenticated');
