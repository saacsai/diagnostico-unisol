-- Hoje só admin pode apagar documento (`documentos_delete_admin`, migration 04) — técnico só
-- consegue inserir/substituir, nunca remover um anexo enviado por engano (achado real: Antonia
-- Barroso subiu documento de outra associação no Anexo A e não teve como tirar, 2026-11-26).
-- Mesma simetria da policy de insert (migration 04): qualquer técnico/admin pode remover
-- documento de diagnóstico, não só quem subiu.
create policy documentos_delete_tecnico on documentos_institucionais
  for delete using (
    entidade_tipo = 'diagnostico' and exists (
      select 1 from diagnosticos d
      where d.id = documentos_institucionais.entidade_id
        and (d.aplicador_id = auth.uid()
             or exists (select 1 from usuarios where id = auth.uid() and perfil in ('tecnico','admin')))
    )
  );

-- Storage nunca teve policy de delete nenhuma (nem admin) — sem ela, apagar a linha na tabela
-- deixa o arquivo órfão no bucket.
create policy documentos_storage_delete on storage.objects
  for delete using (bucket_id = 'documentos-institucionais' and auth.role() = 'authenticated');
