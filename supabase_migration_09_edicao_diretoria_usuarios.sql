-- Diagnóstico UNISOL Brasil — migration 09: libera edição (Diretoria, Usuários, Estaduais) e
-- exclusão de anexos, que hoje não tinham policy de UPDATE/DELETE nenhuma.
--
-- Achado no caminho: unisol_estaduais nunca teve policy de UPDATE — a tela de edição do
-- perfil de uma Estadual (autosave) roda há um tempo mas nunca gravou nada de verdade (RLS
-- barra silenciosamente, sem erro). Corrigido junto.
--
-- Achado 2: empreendimentos_update_admin restringe UPDATE a admin, mas a Seção 2 do
-- diagnóstico (cadastro do Filiado) é preenchida em campo por aplicador/técnico, não só
-- admin — mesma régua que já foi usada pra liberar o INSERT (migration 02). Sem isso, técnico
-- em campo edita a Seção 2 e a gravação falha silenciosamente. Corrigido junto.

drop policy if exists empreendimentos_update_admin on empreendimentos;
create policy empreendimentos_update_autenticado on empreendimentos
  for update using (auth.role() = 'authenticated');

create policy unisol_estaduais_update_admin on unisol_estaduais
  for update using (exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin'));

create policy diretoria_update_privilegiado on diretoria_membros
  for update using (exists (select 1 from usuarios where id = auth.uid() and perfil in ('tecnico', 'admin')));

create policy diretoria_delete_privilegiado on diretoria_membros
  for delete using (exists (select 1 from usuarios where id = auth.uid() and perfil in ('tecnico', 'admin')));

create policy usuarios_update_admin on usuarios
  for update using (exists (select 1 from usuarios u where u.id = auth.uid() and u.perfil = 'admin'));

create policy documentos_storage_delete on storage.objects
  for delete using (
    bucket_id = 'documentos-institucionais'
    and exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin')
  );
