export type ClienteTipo = "persona_fisica" | "persona_juridica";
export type OperacionEstado =
  | "Cotizacion"
  | "Reservada"
  | "Vendida"
  | "Entregada"
  | "Cancelada";
export type Moneda = "USD" | "ARS";
export type PatentamientoTipo = "fisica" | "juridica";

export type Cliente = {
  id: string;
  tipo_cliente: ClienteTipo;
  nombre_razon_social: string;
  cuit: string;
  telefono: string;
  email: string;
  direccion: string;
  localidad: string;
  provincia: string;
  condicion_iva: string;
  created_at: string;
  updated_at: string;
};

export type Producto = {
  id: string;
  marca: string;
  modelo: string;
  descripcion: string;
  precio_lista: number;
  moneda: Moneda;
  garantia: string;
  imagen: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type OperacionItem = {
  id: string;
  operacion_id: string;
  producto_id: string | null;
  producto?: Producto;
  cantidad: number;
  descripcion_manual: string;
  precio_unitario: number;
  subtotal: number;
};

export type Patentamiento = {
  id: string;
  operacion_id: string;
  tipo_persona: PatentamientoTipo;
  datos_json: Record<string, unknown>;
  created_at: string;
};

export type Operacion = {
  id: string;
  numero_operacion: string;
  cliente_id: string;
  cliente?: Cliente;
  fecha: string;
  vendedor_id: string;
  vendedor_nombre?: string;
  estado: OperacionEstado;
  moneda: Moneda;
  cotizacion_dolar: number;
  subtotal: number;
  descuento: number;
  total: number;
  forma_pago: string;
  observaciones: string;
  items: OperacionItem[];
  patentamiento?: Patentamiento;
  created_at: string;
  updated_at: string;
};

export type DocumentoTipo =
  | "proforma"
  | "boleto_compraventa"
  | "patentamiento_fisica"
  | "patentamiento_juridica"
  | "orden_entrega";
