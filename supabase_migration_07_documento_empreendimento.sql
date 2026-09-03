-- Diagnóstico UNISOL Brasil — migration 07: documentos_institucionais aceita 'empreendimento'
-- Drawer de cadastro de nova Filiada sobe uma ficha de filiação — precisa poder anexar
-- documento a um empreendimento, não só Brasil/Estadual/Projeto/Diagnóstico.

do $$
declare
  con_name text;
begin
  select con.conname into con_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  where rel.relname = 'documentos_institucionais' and con.contype = 'c'
    and pg_get_constraintdef(con.oid) like '%entidade_tipo%';
  if con_name is not null then
    execute format('alter table documentos_institucionais drop constraint %I', con_name);
  end if;
end $$;

alter table documentos_institucionais
  add constraint documentos_institucionais_entidade_tipo_check
    check (entidade_tipo in ('unisol_brasil', 'unisol_estadual', 'projeto', 'diagnostico', 'empreendimento'));

drop policy if exists documentos_insert on documentos_institucionais;
create policy documentos_insert on documentos_institucionais
  for insert with check (
    (entidade_tipo in ('unisol_brasil', 'unisol_estadual', 'projeto', 'empreendimento')
      and exists (select 1 from usuarios where id = auth.uid() and perfil = 'admin'))
    or
    (entidade_tipo = 'diagnostico' and exists (
      select 1 from diagnosticos d
      where d.id = documentos_institucionais.entidade_id
        and (d.aplicador_id = auth.uid()
             or exists (select 1 from usuarios where id = auth.uid() and perfil in ('tecnico', 'admin')))
    ))
  );
