-- Migración: Permisos por área en tickets
-- Ejecutar DESPUÉS de tickets-migration.sql en Supabase SQL Editor

-- 1. Agregar campo area_responsable a profiles
--    Un usuario puede ser responsable de una (o ninguna) área.
--    Los administradores ven todo independientemente de este campo.
alter table public.profiles
  add column if not exists area_responsable text default null;

-- Valores válidos: 'compras' | 'postventa' | 'marketing' | 'fabrica' | 'administracion' | null

-- 2. Actualizar políticas RLS de tickets

-- Borrar política anterior (permisiva para todos)
drop policy if exists "tickets_select" on public.tickets;

-- Nueva política de SELECT:
--   - Administradores ven todos los tickets
--   - Responsables de área ven los tickets de su área
--   - Cualquier usuario ve los tickets que él mismo creó
create policy "tickets_select" on public.tickets
  for select to authenticated
  using (
    deleted_at is null
    and (
      -- Es administrador → ve todo
      exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'administrador'
      )
      -- Es responsable del área del ticket
      or exists (
        select 1 from public.profiles
        where id = auth.uid() and area_responsable = tickets.area::text
      )
      -- Fue quien creó el ticket
      or solicitante_id = auth.uid()
    )
  );

-- La política de INSERT y UPDATE ya permite todo para autenticados, no cambia.
