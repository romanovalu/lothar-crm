export type TicketArea = "comercial" | "compras" | "postventa" | "marketing" | "fabrica" | "administracion";
export type TicketEstado = "pendiente" | "en_proceso" | "resuelto" | "cancelado";
export type TicketPrioridad = "critica" | "alta" | "media" | "baja";

export interface Ticket {
  id: string;
  numero_ticket: string;
  area: TicketArea;
  estado: TicketEstado;
  prioridad: TicketPrioridad;
  solicitante_id: string | null;
  solicitante_nombre: string;
  area_solicitante: string;
  tipo_solicitud: string;
  descripcion: string;
  asociado_cliente: boolean;
  cliente_nombre: string | null;
  numero_operacion: string | null;
  fecha_maxima: string | null;
  datos_extra: Record<string, unknown>;
  respuesta: string | null;
  respondido_por: string | null;
  respondido_at: string | null;
  created_at: string;
  updated_at: string;
}

export const AREA_LABELS: Record<TicketArea, string> = {
  comercial:      "Comercial",
  compras:        "Compras",
  postventa:      "Postventa",
  marketing:      "Marketing",
  fabrica:        "Fábrica",
  administracion: "Administración",
};

export const AREA_EMOJI: Record<TicketArea, string> = {
  comercial:      "💼",
  compras:        "🛒",
  postventa:      "🔧",
  marketing:      "📣",
  fabrica:        "🏭",
  administracion: "🧾",
};

export const ESTADO_LABELS: Record<TicketEstado, string> = {
  pendiente:  "Pendiente",
  en_proceso: "En proceso",
  resuelto:   "Resuelto",
  cancelado:  "Cancelado",
};

export const ESTADO_COLORS: Record<TicketEstado, string> = {
  pendiente:  "bg-yellow-100 text-yellow-700",
  en_proceso: "bg-blue-100 text-blue-700",
  resuelto:   "bg-green-100 text-green-700",
  cancelado:  "bg-neutral-100 text-neutral-500",
};

export const PRIORIDAD_LABELS: Record<TicketPrioridad, string> = {
  critica: "🔴 Crítica",
  alta:    "🟠 Alta",
  media:   "🟡 Media",
  baja:    "🟢 Baja",
};

export const PRIORIDAD_COLORS: Record<TicketPrioridad, string> = {
  critica: "bg-red-100 text-red-700",
  alta:    "bg-orange-100 text-orange-700",
  media:   "bg-yellow-100 text-yellow-700",
  baja:    "bg-green-100 text-green-700",
};

/* Tipos de solicitud por área */
export const TIPOS_POR_AREA: Record<TicketArea, string[]> = {
  comercial: [
    "Consulta de producto",
    "Cotización",
    "Seguimiento de operación",
    "Pedido de documentación",
    "Coordinación de entrega",
    "Consulta de financiación",
    "Posventa comercial",
    "Otro",
  ],
  compras: [
    "Compra de producto o insumo",
    "Compra de repuestos",
    "Compra de herramientas",
    "Contratación de servicio",
    "Material de marketing",
    "Uniformes e indumentaria",
    "Logística y transporte",
    "Envío de maquinaria",
    "Envío de repuestos",
    "Mantenimiento edilicio",
    "Tecnología y sistemas",
    "Otro",
  ],
  postventa: [
    "Reparación de unidad",
    "Consulta técnica",
    "Pedido de repuesto",
    "Derivación de cliente",
    "Consulta de garantía",
    "Servicio a domicilio",
    "Otro",
  ],
  marketing: [
    "Pieza gráfica / diseño",
    "Contenido para redes sociales",
    "Merchandising",
    "Evento / activación",
    "Publicidad digital",
    "Fotografía / video",
    "Actualización de web o catálogo",
    "Otro",
  ],
  fabrica: [
    "Pedido de unidad",
    "Consulta de stock disponible",
    "Consulta de tiempo de entrega",
    "Especificaciones técnicas",
    "Modificación / personalización",
    "Devolución o cambio",
    "Otro",
  ],
  administracion: [
    "Facturación a cliente",
    "Pago a proveedor",
    "Nota de crédito / débito",
    "Consulta contable o impositiva",
    "Documentación legal",
    "Rendición de gastos",
    "Otro",
  ],
};

export const AREAS_SOLICITANTES = [
  "Comercial",
  "Marketing",
  "Postventa",
  "Administración",
  "Taller",
  "Servicio Técnico",
  "Maestranza y Mantenimiento",
  "Dirección",
  "Recursos Humanos",
  "Otro",
];
