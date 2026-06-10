"use client";

import type { Cliente, Operacion, Patentamiento, Producto } from "@/types/domain";

export async function exportWorkbook(data: {
  clientes: Cliente[];
  operaciones: Operacion[];
  productos: Producto[];
  patentamientos: Patentamiento[];
}) {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.clientes), "Clientes");
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      data.operaciones.map((operacion) => ({
        numero_operacion: operacion.numero_operacion,
        cliente: operacion.cliente?.nombre_razon_social,
        fecha: operacion.fecha,
        vendedor: operacion.vendedor_nombre,
        estado: operacion.estado,
        moneda: operacion.moneda,
        subtotal: operacion.subtotal,
        descuento: operacion.descuento,
        total: operacion.total
      }))
    ),
    "Operaciones"
  );
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.productos), "Productos");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.patentamientos), "Patentamientos");

  XLSX.writeFile(workbook, "lothar-crm-export.xlsx");
}
