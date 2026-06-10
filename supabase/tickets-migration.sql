-- Migración: Sistema de tickets internos
-- Ejecutar en Supabase SQL Editor

create type public.ticket_area as enum (
  'compras', 'postventa', 'marketing', 'fabrica', 'administracion'
);

create type public.ticket_estado as enum (
  'pendiente', 'en_proceso', 'resuelto', 'cancelado'
);

create type public.ticket_prioridad as enum (
  'critica', 'alta', 'media', 'baja'
);

create table public.tickets (
  id                  uuid primary key default gen_random_uuid(),
  numero_ticket       text not null unique,
  area                public.ticket_area not null,
  estado              public.ticket_estado not null default 'pendiente',
  prioridad           public.ticket_prioridad not null default 'media',

  -- Solicitante
  solicitante_id      uuid references public.profiles(id),
  solicitante_nombre  text not null,
  area_solicitante    text not null,

  -- Contenido
  tipo_solicitud      text not null,
  descripcion         text not null,

  -- Contexto cliente/operación
  asociado_cliente    boolean not null default false,
  cliente_nombre      text,
  numero_operacion    text,

  -- Urgencia
  fecha_maxima        date,

  -- Datos extra por área (campos específicos de cada formulario)
  datos_extra         jsonb not null default '{}'::jsonb,

  -- Respuesta del área
  respuesta           text,
  respondido_por      uuid references public.profiles(id),
  respondido_at       timestamptz,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);

-- RLS
alter table public.tickets enable row level security;

-- Todos los usuarios autenticados pueden ver y crear tickets
create policy "tickets_select" on public.tickets
  for select to authenticated using (deleted_at is null);

create policy "tickets_insert" on public.tickets
  for insert to authenticated with check (true);

create policy "tickets_update" on public.tickets
  for update to authenticated using (true);

-- Índices
create index tickets_area_idx      on public.tickets (area);
create index tickets_estado_idx    on public.tickets (estado);
create index tickets_created_idx   on public.tickets (created_at desc);
