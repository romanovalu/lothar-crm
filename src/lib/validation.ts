import { z } from "zod";

export const clienteSchema = z.object({
  tipo_cliente: z.enum(["persona_fisica", "persona_juridica"]),
  nombre_razon_social: z.string().min(2, "Ingresar nombre o razon social"),
  cuit: z.string().min(8, "Ingresar CUIT"),
  telefono: z.string().optional(),
  email: z.string().email("Email invalido").optional().or(z.literal("")),
  direccion: z.string().optional(),
  localidad: z.string().optional(),
  provincia: z.string().optional(),
  condicion_iva: z.string().optional()
});

export const operacionItemSchema = z.object({
  producto_id: z.string().uuid().nullable().optional(),
  cantidad: z.coerce.number().positive(),
  descripcion_manual: z.string().min(2),
  precio_unitario: z.coerce.number().nonnegative(),
  subtotal: z.coerce.number().nonnegative()
});

export const operacionSchema = z.object({
  cliente_id: z.string().uuid(),
  fecha: z.string(),
  estado: z.enum(["Cotizacion", "Reservada", "Vendida", "Entregada", "Cancelada"]),
  moneda: z.enum(["USD", "ARS"]),
  cotizacion_dolar: z.coerce.number().positive(),
  subtotal: z.coerce.number().nonnegative(),
  descuento: z.coerce.number().nonnegative(),
  total: z.coerce.number().nonnegative(),
  forma_pago: z.string().min(2),
  observaciones: z.string().optional(),
  items: z.array(operacionItemSchema).min(1)
});
