-- Bucket para adjuntos de tickets
-- Ejecutar en Supabase SQL Editor

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ticket-attachments',
  'ticket-attachments',
  true,
  10485760, -- 10 MB por archivo
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ]
)
on conflict (id) do nothing;

-- Política: cualquier usuario autenticado puede subir
create policy "ticket_attachments_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'ticket-attachments');

-- Política: cualquier usuario autenticado puede leer
create policy "ticket_attachments_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'ticket-attachments');
