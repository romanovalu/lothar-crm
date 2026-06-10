# Lothar CRM Comercial

## Principio central

La operacion comercial es la entidad principal. Clientes, productos, items, condiciones comerciales y patentamiento se cargan una sola vez; los documentos se generan bajo demanda desde esos datos actuales.

## Modulos iniciales

- Dashboard: indicadores de cotizaciones, ventas, monto vendido, operaciones por vendedor y ultimas operaciones.
- Operaciones: carga unica de cliente, productos, forma de pago, observaciones y patentamiento.
- Clientes: maestro de personas fisicas y juridicas.
- Maquinas: catalogo de productos con precio, moneda, garantia e imagen en Supabase Storage.
- Documentos: proforma, boleto, patentamiento fisica, patentamiento juridica y orden de entrega.
- Configuracion: usuarios, roles y parametros futuros.

## Backend

Supabase cubre Auth, PostgreSQL y Storage. El esquema esta en `supabase/schema.sql` e incluye:

- `profiles`
- `clientes`
- `productos`
- `operaciones`
- `operacion_items`
- `patentamientos`

Todas las tablas principales tienen `created_at`, `updated_at` y `deleted_at` para soft delete.

## Documentos

Los PDFs no se guardan permanentemente. La funcion `buildDocumentPayload` arma un payload unico desde `Operacion`, y cada plantilla PDF debe renderizarse bajo demanda con React PDF o PDF-lib.

La proforma oficial esta tomada del archivo `docs/templates/Proforma_Lothar_Oficial_v2.html` y se parametriza con:

- datos de empresa desde `src/lib/company.ts`
- cliente desde `operacion.cliente`
- productos desde `operacion.items`
- totales, forma de pago y observaciones desde `operacion`

## Futuro

La arquitectura deja espacio para agregar leads, facturacion, postventa, repuestos, garantias y servicio tecnico sin duplicar datos comerciales.
