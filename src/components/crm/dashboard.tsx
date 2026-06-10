"use client";

import { ArrowUpRight, Download, Plus, Search, TrendingUp, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NuevaOperacionModal } from "@/components/crm/nueva-operacion-modal";
import { createClient } from "@/lib/supabase";
import { exportWorkbook } from "@/lib/export-xlsx";
import { formatCurrency } from "@/lib/utils";
import type { Operacion, Cliente, Producto } from "@/types/domain";

const estados = ["Cotizacion", "Reservada", "Vendida", "Entregada", "Cancelada"];
const estadoColors: Record<string, string> = {
  Cotizacion: "bg-blue-100 text-blue-700",
  Reservada: "bg-orange-100 text-orange-700",
  Vendida: "bg-lothar-yellow text-lothar-black",
  Entregada: "bg-green-100 text-green-700",
  Cancelada: "bg-neutral-100 text-neutral-500",
};

export function Dashboard() {
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
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

  const filteredOps = useMemo(() => {
    const q = query.toLowerCase();
    return operaciones.filter(op =>
      [op.numero_operacion, op.cliente?.nombre_razon_social, op.cliente?.cuit,
        op.items?.map(i => i.producto?.modelo).join(" ")].join(" ").toLowerCase().includes(q)
    );
  }, [query, operaciones]);

  const counts = estados.map(estado => ({
    estado,
    value: operaciones.filter(op => op.estado === estado).length,
  }));

  const totalVendido = operaciones
    .filter(op => op.estado === "Vendida")
    .reduce((acc, op) => acc + op.total, 0);

  // Operaciones por vendedor
  const porVendedor = useMemo(() => {
    const map: Record<string, number> = {};
    operaciones.forEach(op => {
      if (op.vendedor_nombre) map[op.vendedor_nombre] = (map[op.vendedor_nombre] ?? 0) + 1;
    });
    const total = operaciones.length || 1;
    return Object.entries(map).map(([nombre, cant]) => ({ nombre, cant, pct: Math.round((cant / total) * 100) }));
  }, [operaciones]);

  return (
    <>
      {showModal && (
        <NuevaOperacionModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); fetchAll(); }}
        />
      )}
      <main className="min-h-screen flex-1 overflow-auto pb-24 lg:pb-0">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">Lothar Maquinaria</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">CRM Comercial</h1>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input className="w-full pl-9 sm:w-80" placeholder="Cliente, CUIT, operación o modelo"
                  value={query} onChange={e => setQuery(e.target.value)} />
              </div>
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
            <>
              {/* Contadores por estado */}
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {counts.map(item => (
                  <Card className="p-4" key={item.estado}>
                    <p className="text-xs font-semibold uppercase text-neutral-500">{item.estado}</p>
                    <div className="mt-3 flex items-end justify-between">
                      <strong className="text-3xl font-bold text-neutral-950">{item.value}</strong>
                      <ArrowUpRight className="h-5 w-5 text-neutral-400" />
                    </div>
                  </Card>
                ))}
              </section>

              <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                  {/* Últimas operaciones */}
                  <Card>
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-neutral-950">Últimas operaciones</h2>
                        <p className="mt-1 text-sm text-neutral-500">Actividad reciente del equipo comercial.</p>
                      </div>
                      <Button onClick={() => exportWorkbook({
                        clientes, operaciones, productos,
                        patentamientos: operaciones.flatMap(op => op.patentamiento ? [op.patentamiento] : []),
                      })} type="button" variant="outline">
                        <Download className="h-4 w-4" /> Exportar Excel
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[680px] text-left text-sm">
                        <thead className="border-y border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
                          <tr>
                            <th className="px-4 py-3">Operación</th>
                            <th className="px-4 py-3">Cliente</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3">Vendedor</th>
                            <th className="px-4 py-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOps.slice(0, 20).map(op => (
                            <tr className="border-b border-neutral-100 hover:bg-neutral-50" key={op.id}>
                              <td className="px-4 py-4 font-mono font-semibold">{op.numero_operacion}</td>
                              <td className="px-4 py-4">{op.cliente?.nombre_razon_social}</td>
                              <td className="px-4 py-4">
                                <span className={`rounded-md px-2 py-1 text-xs font-bold ${estadoColors[op.estado] ?? "bg-neutral-100"}`}>
                                  {op.estado}
                                </span>
                              </td>
                              <td className="px-4 py-4">{op.vendedor_nombre}</td>
                              <td className="px-4 py-4 text-right font-bold">{formatCurrency(op.total, op.moneda)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredOps.length === 0 && (
                        <p className="py-10 text-center text-sm text-neutral-400">Aún no hay operaciones cargadas</p>
                      )}
                    </div>
                  </Card>
                </div>

                <aside className="space-y-6">
                  <Card>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase text-neutral-500">Monto vendido</p>
                        <p className="mt-2 text-3xl font-bold text-neutral-950">{formatCurrency(totalVendido, "USD")}</p>
                      </div>
                      <div className="grid h-11 w-11 place-items-center rounded-md bg-lothar-yellow">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                    </div>
                  </Card>

                  {porVendedor.length > 0 && (
                    <Card>
                      <h2 className="text-base font-bold text-neutral-950">Operaciones por vendedor</h2>
                      <div className="mt-4 space-y-4">
                        {porVendedor.map(v => (
                          <div key={v.nombre}>
                            <div className="mb-1.5 flex justify-between text-sm">
                              <span className="font-semibold">{v.nombre}</span>
                              <span className="text-neutral-500">{v.cant} ({v.pct}%)</span>
                            </div>
                            <div className="h-2 rounded-full bg-neutral-100">
                              <div className="h-2 rounded-full bg-lothar-yellow transition-all" style={{ width: `${v.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {productos.length > 0 && (
                    <Card>
                      <h2 className="text-base font-bold text-neutral-950">Productos activos</h2>
                      <div className="mt-4 space-y-3">
                        {productos.slice(0, 5).map(producto => (
                          <div className="rounded-md border border-neutral-200 p-3" key={producto.id}>
                            <p className="font-semibold text-neutral-950">{producto.marca} {producto.modelo}</p>
                            {producto.descripcion && (
                              <p className="mt-0.5 text-xs text-neutral-500 line-clamp-1">{producto.descripcion}</p>
                            )}
                            <p className="mt-1.5 text-sm font-bold">{formatCurrency(producto.precio_lista, producto.moneda)}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </aside>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
