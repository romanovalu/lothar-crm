"use client";

import { Download, FileText, Plus, Search, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DocumentActions } from "@/components/crm/document-actions";
import { NuevaOperacionModal } from "@/components/crm/nueva-operacion-modal";
import { createClient } from "@/lib/supabase";
import { exportWorkbook } from "@/lib/export-xlsx";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Operacion, Cliente, Producto } from "@/types/domain";

const estadoColors: Record<string, string> = {
  Cotizacion: "bg-blue-100 text-blue-700",
  Reservada: "bg-orange-100 text-orange-700",
  Vendida: "bg-lothar-yellow text-lothar-black",
  Entregada: "bg-green-100 text-green-700",
  Cancelada: "bg-neutral-100 text-neutral-500",
};

export function OperacionesModule() {
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Operacion | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const [{ data: ops }, { data: cls }, { data: prods }] = await Promise.all([
      supabase
        .from("operaciones")
        .select(`*, cliente:clientes(*), items:operacion_items(*, producto:productos(*)), patentamiento:patentamientos(*)`)
        .order("created_at", { ascending: false }),
      supabase.from("clientes").select("*").is("deleted_at", null).order("nombre_razon_social"),
      supabase.from("productos").select("*").eq("activo", true).is("deleted_at", null).order("marca"),
    ]);
    setOperaciones((ops as Operacion[]) ?? []);
    setClientes((cls as Cliente[]) ?? []);
    setProductos((prods as Producto[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return operaciones.filter(op =>
      [
        op.numero_operacion,
        op.cliente?.nombre_razon_social,
        op.cliente?.cuit,
        op.items?.map(i => i.producto?.modelo).join(" "),
      ].join(" ").toLowerCase().includes(q)
    );
  }, [query, operaciones]);

  function handleExport() {
    exportWorkbook({
      clientes,
      operaciones,
      productos,
      patentamientos: operaciones.flatMap(op => op.patentamiento ? [op.patentamiento] : []),
    });
  }

  return (
    <main className="min-h-screen flex-1 overflow-auto pb-24 lg:pb-0">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">Lothar Maquinaria</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">Operaciones</h1>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input className="w-full pl-9 sm:w-80" placeholder="Cliente, CUIT, operación o modelo"
                value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <Button variant="outline" type="button" onClick={handleExport}>
              <Download className="h-4 w-4" /> Exportar Excel
            </Button>
            <Button type="button" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4" /> Nueva operación
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
            {/* TABLA */}
            <Card className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
                    <tr>
                      <th className="px-5 py-3">Operación</th>
                      <th className="px-5 py-3">Cliente</th>
                      <th className="px-5 py-3">Fecha</th>
                      <th className="px-5 py-3">Estado</th>
                      <th className="px-5 py-3">Vendedor</th>
                      <th className="px-5 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(op => (
                      <tr key={op.id}
                        className={`cursor-pointer border-b border-neutral-100 transition-colors hover:bg-neutral-50 ${selected?.id === op.id ? "bg-neutral-50" : ""}`}
                        onClick={() => setSelected(selected?.id === op.id ? null : op)}>
                        <td className="px-5 py-4 font-mono text-sm font-semibold">{op.numero_operacion}</td>
                        <td className="px-5 py-4">{op.cliente?.nombre_razon_social}</td>
                        <td className="px-5 py-4 text-neutral-500">{formatDate(op.fecha)}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-md px-2 py-1 text-xs font-bold ${estadoColors[op.estado] ?? "bg-neutral-100"}`}>
                            {op.estado}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-neutral-600">{op.vendedor_nombre}</td>
                        <td className="px-5 py-4 text-right font-bold">{formatCurrency(op.total, op.moneda)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-16 text-neutral-400">
                  <FileText className="h-8 w-8" />
                  <p className="text-sm">{operaciones.length === 0 ? "Aún no hay operaciones cargadas" : "No hay operaciones que coincidan"}</p>
                </div>
              )}
            </Card>

            {/* DETALLE */}
            {selected && (
              <div className="space-y-4">
                <Card className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-bold text-neutral-950">{selected.numero_operacion}</h2>
                    <span className={`rounded-md px-2 py-1 text-xs font-bold ${estadoColors[selected.estado] ?? "bg-neutral-100"}`}>
                      {selected.estado}
                    </span>
                  </div>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Cliente</dt>
                      <dd className="font-medium">{selected.cliente?.nombre_razon_social}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">CUIT</dt>
                      <dd>{selected.cliente?.cuit}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Fecha</dt>
                      <dd>{formatDate(selected.fecha)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Vendedor</dt>
                      <dd>{selected.vendedor_nombre}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Moneda</dt>
                      <dd>{selected.moneda}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Subtotal</dt>
                      <dd>{formatCurrency(selected.subtotal, selected.moneda)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Descuento</dt>
                      <dd className="text-red-600">-{formatCurrency(selected.descuento, selected.moneda)}</dd>
                    </div>
                    <div className="flex justify-between border-t border-neutral-200 pt-2">
                      <dt className="font-bold text-neutral-950">Total</dt>
                      <dd className="text-xl font-bold text-neutral-950">{formatCurrency(selected.total, selected.moneda)}</dd>
                    </div>
                  </dl>
                </Card>

                <Card className="p-5">
                  <h3 className="mb-3 text-sm font-bold text-neutral-950">Forma de pago</h3>
                  <p className="text-sm text-neutral-600">{selected.forma_pago}</p>
                  {selected.observaciones && (
                    <>
                      <h3 className="mb-1 mt-4 text-sm font-bold text-neutral-950">Observaciones</h3>
                      <p className="text-sm text-neutral-600">{selected.observaciones}</p>
                    </>
                  )}
                </Card>

                <Card className="p-5">
                  <DocumentActions operacion={selected} />
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <NuevaOperacionModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); fetchAll(); }}
        />
      )}
    </main>
  );
}
