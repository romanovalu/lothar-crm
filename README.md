# Lothar CRM Comercial

SaaS para cargar una operación comercial una sola vez y reutilizar esos datos en todos los documentos: Proforma, Boleto de Compraventa, Patentamiento Física/Jurídica y Orden de Entrega.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| UI | Componentes estilo Shadcn — estética Framer/Linear/Vercel |
| Backend | Supabase (Auth + PostgreSQL + Storage) |
| Documentos | HTML imprimible (todos los tipos) + React PDF |
| Exportación | SheetJS (XLSX) |
| Validación | Zod + React Hook Form |

---

## Ejecutar

Las dependencias **ya están instaladas** (`node_modules` presente).

```powershell
npm run dev
```

Abrir **http://localhost:3000**

---

## Rutas de la aplicación

| Ruta | Módulo |
|------|--------|
| `/` | Dashboard: métricas, buscador global, últimas operaciones |
| `/operaciones` | Listado de operaciones + detalle lateral + botones de documentos |
| `/clientes` | Cards de clientes con info de contacto |
| `/productos` | Catálogo de máquinas/productos |
| `/documentos` | Acceso directo a documentos |
| `/configuracion` | Configuración del sistema |

---

## Generación de documentos

Todos los documentos se generan **bajo demanda** desde los datos de la operación — sin guardar PDFs permanentemente.

| Documento | Endpoint HTML imprimible |
|-----------|--------------------------|
| Proforma Oficial | `/api/documents/proforma?operacionId=...` |
| Boleto de Compraventa | `/api/documents/boleto_compraventa?operacionId=...` |
| Patentamiento Persona Física | `/api/documents/patentamiento_fisica?operacionId=...` |
| Patentamiento Persona Jurídica | `/api/documents/patentamiento_juridica?operacionId=...` |
| Orden de Entrega | `/api/documents/orden_entrega?operacionId=...` |

Para forzar salida PDF en lugar de HTML imprimible:
```
/api/documents/proforma?operacionId=...&format=pdf
```

Imprimir / guardar como PDF: **Ctrl+P** en el navegador.

---

## Estructura de archivos clave

```
src/
  app/
    page.tsx                        ← Dashboard
    layout.tsx                      ← Layout global con Sidebar + MobileNav
    operaciones/page.tsx
    clientes/page.tsx
    productos/page.tsx
    documentos/page.tsx
    configuracion/page.tsx
    api/documents/[tipo]/route.ts   ← Endpoint unificado de documentos
  components/crm/
    dashboard.tsx
    operaciones-module.tsx
    clientes-module.tsx
    productos-module.tsx
    sidebar.tsx                     ← Navegación lateral (desktop)
    mobile-nav.tsx                  ← Barra inferior (mobile)
    document-actions.tsx            ← Botones de generación de documentos
    proforma-oficial-pdf.tsx        ← Proforma como React PDF
    document-pdf.tsx                ← PDF genérico para otros tipos
  lib/
    proforma-html.ts                ← Proforma HTML oficial
    boleto-html.ts                  ← Boleto de Compraventa HTML
    patentamiento-fisica-html.ts    ← Patentamiento Persona Física HTML
    patentamiento-juridica-html.ts  ← Patentamiento Persona Jurídica HTML
    orden-entrega-html.ts           ← Orden de Entrega HTML
    export-xlsx.ts                  ← Exportación Excel (SheetJS)
    supabase.ts                     ← Cliente Supabase
    company.ts                      ← Datos de IMPERIO MAC S.A.
    sample-data.ts                  ← Datos de prueba
    utils.ts
    validation.ts                   ← Esquemas Zod
  types/
    domain.ts                       ← Tipos TypeScript del dominio
supabase/
  schema.sql                        ← DDL completo con RLS, índices, triggers
docs/
  templates/
    Proforma_Lothar_Oficial_v2.html ← Plantilla oficial de referencia
  architecture.md
  install.md
demo/
  index.html                        ← Demo estática sin dependencias
```

---

## Base de datos (Supabase)

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ejecutar `supabase/schema.sql` en el SQL Editor
3. Copiar `.env.example` a `.env.local` y completar:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Usuarios (administrador / vendedor) |
| `clientes` | Personas físicas y jurídicas |
| `productos` | Catálogo de maquinaria |
| `operaciones` | Entidad central del sistema |
| `operacion_items` | Líneas de cada operación |
| `patentamientos` | Datos de patentamiento por operación |

Todas las tablas tienen `created_at`, `updated_at` y `deleted_at` (soft delete).

---

## Próximos pasos

- [ ] Conectar Supabase (completar `.env.local`)
- [ ] Activar autenticación con Supabase Auth
- [ ] Formulario wizard de nueva operación (6 pasos: Cliente → Productos → Comercial → Contrato → Patentamiento → Resumen)
- [ ] CRUD real de Clientes, Productos y Operaciones contra Supabase
- [ ] Formulario dinámico de patentamiento según tipo de persona
- [ ] Panel de administración de usuarios

---

## Colores de marca

| Color | Hex |
|-------|-----|
| Amarillo Lothar | `#F5D21F` |
| Negro | `#111111` |
| Gris claro | `#F5F5F5` |
| Blanco | `#FFFFFF` |
