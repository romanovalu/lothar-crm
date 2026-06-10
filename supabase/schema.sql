create extension if not exists "pgcrypto";

create type public.user_role as enum ('administrador', 'vendedor');
create type public.cliente_tipo as enum ('persona_fisica', 'persona_juridica');
create type public.operacion_estado as enum ('Cotizacion', 'Reservada', 'Vendida', 'Entregada', 'Cancelada');
create type public.moneda as enum ('USD', 'ARS');
create type public.patentamiento_tipo as enum ('fisica', 'juridica');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  role public.user_role not null default 'vendedor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  tipo_cliente public.cliente_tipo not null,
  nombre_razon_social text not null,
  cuit text not null,
  telefono text,
  email text,
  direccion text,
  localidad text,
  provincia text,
  condicion_iva text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (cuit)
);

create table public.productos (
  id uuid primary key default gen_random_uuid(),
  marca text not null,
  modelo text not null,
  descripcion text,
  precio_lista numeric(14, 2) not null default 0,
  moneda public.moneda not null default 'USD',
  garantia text,
  imagen text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.operaciones (
  id uuid primary key default gen_random_uuid(),
  numero_operacion text not null unique,
  cliente_id uuid not null references public.clientes(id),
  fecha date not null default current_date,
  vendedor_id uuid not null references public.profiles(id),
  estado public.operacion_estado not null default 'Cotizacion',
  moneda public.moneda not null default 'USD',
  cotizacion_dolar numeric(14, 2) not null default 1,
  subtotal numeric(14, 2) not null default 0,
  descuento numeric(14, 2) not null default 0,
  total numeric(14, 2) not null default 0,
  forma_pago text,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.operacion_items (
  id uuid primary key default gen_random_uuid(),
  operacion_id uuid not null references public.operaciones(id) on delete cascade,
  producto_id uuid references public.productos(id),
  cantidad numeric(12, 2) not null default 1,
  descripcion_manual text,
  precio_unitario numeric(14, 2) not null default 0,
  subtotal numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.patentamientos (
  id uuid primary key default gen_random_uuid(),
  operacion_id uuid not null references public.operaciones(id) on delete cascade,
  tipo_persona public.patentamiento_tipo not null,
  datos_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (operacion_id, tipo_persona)
);

create index clientes_search_idx on public.clientes using gin (
  to_tsvector('spanish', coalesce(nombre_razon_social, '') || ' ' || coalesce(cuit, ''))
);

create index productos_search_idx on public.productos using gin (
  to_tsvector('spanish', coalesce(marca, '') || ' ' || coalesce(modelo, '') || ' ' || coalesce(descripcion, ''))
);

create index operaciones_numero_idx on public.operaciones (numero_operacion);
create index operaciones_estado_idx on public.operaciones (estado) where deleted_at is null;
create index operaciones_vendedor_idx on public.operaciones (vendedor_id) where deleted_at is null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger clientes_set_updated_at
before update on public.clientes
for each row execute function public.set_updated_at();

create trigger productos_set_updated_at
before update on public.productos
for each row execute function public.set_updated_at();

create trigger operaciones_set_updated_at
before update on public.operaciones
for each row execute function public.set_updated_at();

create trigger operacion_items_set_updated_at
before update on public.operacion_items
for each row execute function public.set_updated_at();

create trigger patentamientos_set_updated_at
before update on public.patentamientos
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.clientes enable row level security;
alter table public.productos enable row level security;
alter table public.operaciones enable row level security;
alter table public.operacion_items enable row level security;
alter table public.patentamientos enable row level security;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and deleted_at is null;
$$;

create policy "profiles own or admin read"
on public.profiles for select
using (id = auth.uid() or public.current_user_role() = 'administrador');

create policy "profiles admin write"
on public.profiles for all
using (public.current_user_role() = 'administrador')
with check (public.current_user_role() = 'administrador');

create policy "clientes authenticated read"
on public.clientes for select
using (auth.role() = 'authenticated' and deleted_at is null);

create policy "clientes seller write"
on public.clientes for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "productos authenticated read"
on public.productos for select
using (auth.role() = 'authenticated' and deleted_at is null);

create policy "productos admin write"
on public.productos for all
using (public.current_user_role() = 'administrador')
with check (public.current_user_role() = 'administrador');

create policy "operaciones authenticated read"
on public.operaciones for select
using (auth.role() = 'authenticated' and deleted_at is null);

create policy "operaciones seller write"
on public.operaciones for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "items authenticated read"
on public.operacion_items for select
using (auth.role() = 'authenticated' and deleted_at is null);

create policy "items seller write"
on public.operacion_items for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "patentamientos authenticated read"
on public.patentamientos for select
using (auth.role() = 'authenticated' and deleted_at is null);

create policy "patentamientos seller write"
on public.patentamientos for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create or replace view public.global_search as
select
  'cliente' as tipo,
  id,
  nombre_razon_social as titulo,
  cuit as detalle
from public.clientes
where deleted_at is null
union all
select
  'operacion' as tipo,
  operaciones.id,
  operaciones.numero_operacion as titulo,
  clientes.nombre_razon_social as detalle
from public.operaciones
join public.clientes on clientes.id = operaciones.cliente_id
where operaciones.deleted_at is null
union all
select
  'producto' as tipo,
  id,
  marca || ' ' || modelo as titulo,
  descripcion as detalle
from public.productos
where deleted_at is null;
