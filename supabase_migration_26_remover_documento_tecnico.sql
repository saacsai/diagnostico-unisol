-- Hoje só admin pode apagar documento (`documentos_delete_admin`, migration 04) — técnico só
-- consegue inserir/substituir, nunca remover um anexo enviado por engano (achado real: Antonia
-- Barroso subiu documento de outra associação no Anexo A e não teve como tirar, 2026-11-26).
-- Mesma simetria da policy de insert (migration 04): qualquer técnico/admin pode remover
-- documento de diagnóstico, não só quem subiu.
-- `drop ... if exists` antes de cada `create` pra ser seguro rodar de novo (1ª tentativa falhou
-- no meio, no statement de storage, por uma policy "documentos_storage_delete" que já existia
-- de algum outro momento — como os dois statements rodam na mesma transação implícita, é
-- possível que o 1º também tenha sido desfeito; isso garante o resultado final certo de qualquer
-- jeito que tenha ficado).
drop policy if exists documentos_delete_tecnico on documentos_institucionais;
create policy documentos_delete_tecnico on documentos_institucionais
  for delete using (
    entidade_tipo = 'diagnostico' and exists (
      select 1 from diagnosticos d
      where d.id = documentos_institucionais.entidade_id
        and (d.aplicador_id = auth.uid()
             or exists (select 1 from usuarios where id = auth.uid() and perfil in ('tecnico','admin')))
    )
  );

-- Storage nunca teve policy de delete rastreada em migration nenhuma — sem ela, apagar a linha
-- na tabela deixa o arquivo órfão no bucket. Recriada do zero (drop+create) pra garantir que vale
-- exatamente esta definição, independente do que já existisse com esse nome.
drop policy if exists documentos_storage_delete on storage.objects;
create policy documentos_storage_delete on storage.objects
  for delete using (bucket_id = 'documentos-institucionais' and auth.role() = 'authenticated');
