-- Permitir a administradores actualizar y eliminar mensajes (además de crearlos).

drop policy if exists "messages_update_admin" on public.messages;
create policy "messages_update_admin"
  on public.messages for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "messages_delete_admin" on public.messages;
create policy "messages_delete_admin"
  on public.messages for delete
  to authenticated
  using (public.is_admin());
