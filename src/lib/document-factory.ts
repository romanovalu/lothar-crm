import type { DocumentoTipo, Operacion } from "@/types/domain";

export function getDocumentTitle(tipo: DocumentoTipo) {
  const titles: Record<DocumentoTipo, string> = {
    proforma: "Proforma",
    boleto_compraventa: "Boleto de Compraventa",
    patentamiento_fisica: "Ficha de Patentamiento Persona Fisica",
    patentamiento_juridica: "Ficha de Patentamiento Persona Juridica",
    orden_entrega: "Orden de Entrega"
  };

  return titles[tipo];
}

export function buildDocumentPayload(tipo: DocumentoTipo, operacion: Operacion) {
  return {
    tipo,
    titulo: getDocumentTitle(tipo),
    numero_operacion: operacion.numero_operacion,
    fecha: operacion.fecha,
    cliente: operacion.cliente,
    vendedor: operacion.vendedor_nombre,
    items: operacion.items,
    comercial: {
      moneda: operacion.moneda,
      cotizacion_dolar: operacion.cotizacion_dolar,
      subtotal: operacion.subtotal,
      descuento: operacion.descuento,
      total: operacion.total,
      forma_pago: operacion.forma_pago,
      observaciones: operacion.observaciones
    },
    patentamiento: operacion.patentamiento?.datos_json ?? {}
  };
}
