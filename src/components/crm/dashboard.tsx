"use client";

import {
  ArrowUpRight,
  Download,
  Plus,
  Search,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { DocumentActions } from "@/components/crm/document-actions";
import { NuevaOperacionModal } from "@/components/crm/nueva-operacion-modal";
import { clientes, operaciones, productos } from "@/lib/sample-data";
import { exportWorkbook } from "@/lib/export-xlsx";
import { formatCurrency } from "@/lib/utils";

const steps = ["Cliente", "Productos", "Comercial", "Contrato", "Patentamiento", "Resumen"];
const estados = ["Cotizacion", "Reservada", "Vendida", "Entregada", "Cancelada"];

export function Dashboard() {
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const operacion = operaciones[0];

  const filteredOperations = useMemo(() => {
    const normalized = query.toLowerCase();
    return operaciones.filter((item) => {
      const haystack = [
        item.numero_operacion,
        item.cliente?.nombre_razon_social,
        item.cliente?.cuit,
        item.items.map((operationItem) => operationItem.producto?.modelo).join(" ")
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [query]);

  const counts = estados.map((estado) => ({
    estado,
    value: operaciones.filter((item) => item.estado === estado).length
  }));

  const totalVendido = operaciones
    .filter((item) => item.estado === "Vendida")
    .reduce((acc, item) => acc + item.total, 0);

  return (
    <>
    {showModal && (
      <NuevaOperacionModal
        onClose={() => setShowModal(false)}
        onCreated={() => { setShowModal(false); window.location.reload(); }}
      />
    )}
    <main className="min-h-screen flex-1 overflow-auto pb-24 lg:pb-0">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">Lothar Maquinaria</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
              CRM Comercial
            </h1>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                className="w-full pl-9 sm:w-80"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cliente, CUIT, operacion o modelo"
                value={query}
              />
            </div>
            <Button type="button" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4" />
              Nueva operacion
            </Button>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {counts.map((item) => (
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
            <Card className="p-0">
              <div className="border-b border-neutral-200 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-950">Nueva operacion</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Carga unica para alimentar proforma, boleto, patentamiento y entrega.
                    </p>
                  </div>
                  <span className="inline-flex h-8 items-center gap-2 rounded-md bg-neutral-100 px-3 text-xs font-semibold text-neutral-600">
                    <ShieldCheck className="h-4 w-4" />
                    Una fuente de datos
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-neutral-200 p-5 sm:grid-cols-3 xl:grid-cols-6">
                {steps.map((step, index) => (
                  <button
                    className={`h-10 rounded-md text-sm font-semibold ${
                      index === 0 ? "bg-lothar-yellow text-lothar-black" : "bg-neutral-100 text-neutral-600"
                    }`}
                    key={step}
                    type="button"
                  >
                    {step}
                  </button>
                ))}
              </div>

              <div className="grid gap-5 p-5 lg:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  Cliente
                  <Input defaultValue={operacion.cliente?.nombre_razon_social} />
                </label>
                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  CUIT
                  <Input defaultValue={operacion.cliente?.cuit} />
                </label>
                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  Provincia
                  <Input defaultValue={operacion.cliente?.provincia} />
                </label>
                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  Localidad
                  <Input defaultValue={operacion.cliente?.localidad} />
                </label>
              </div>

              <div className="overflow-x-auto border-y border-neutral-200">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                    <tr>
                      <th className="px-5 py-3">Cantidad</th>
                      <th className="px-5 py-3">Descripcion</th>
                      <th className="px-5 py-3">Precio</th>
                      <th className="px-5 py-3">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operacion.items.map((item) => (
                      <tr className="border-t border-neutral-200" key={item.id}>
                        <td className="px-5 py-4 font-semibold">{item.cantidad}</td>
                        <td className="px-5 py-4">{item.descripcion_manual}</td>
                        <td className="px-5 py-4">{formatCurrency(item.precio_unitario, operacion.moneda)}</td>
                        <td className="px-5 py-4 font-bold">{formatCurrency(item.subtotal, operacion.moneda)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-5 p-5 lg:grid-cols-[1fr_280px]">
                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  Forma de pago
                  <Textarea defaultValue={operacion.forma_pago} />
                </label>
                <div className="rounded-lg bg-neutral-50 p-4">
                  <p className="text-xs font-semibold uppercase text-neutral-500">Total operacion</p>
                  <p className="mt-2 text-3xl font-bold text-neutral-950">
                    {formatCurrency(operacion.total, operacion.moneda)}
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">
                    Descuento aplicado: {formatCurrency(operacion.descuento, operacion.moneda)}
                  </p>
                </div>
              </div>

              <div className="border-t border-neutral-200 p-5">
                <DocumentActions operacion={operacion} />
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-neutral-950">Ultimas operaciones</h2>
                  <p className="mt-1 text-sm text-neutral-500">Resultado del buscador global y actividad reciente.</p>
                </div>
                <Button
                  onClick={() =>
                    exportWorkbook({
                      clientes,
                      operaciones,
                      productos,
                      patentamientos: operaciones.flatMap((item) => (item.patentamiento ? [item.patentamiento] : []))
                    })
                  }
                  type="button"
                  variant="outline"
                >
                  <Download className="h-4 w-4" />
                  Exportar Excel
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-y border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
                    <tr>
                      <th className="px-4 py-3">Operacion</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Vendedor</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOperations.map((item) => (
                      <tr className="border-b border-neutral-100" key={item.id}>
                        <td className="px-4 py-4 font-semibold">{item.numero_operacion}</td>
                        <td className="px-4 py-4">{item.cliente?.nombre_razon_social}</td>
                        <td className="px-4 py-4">
                          <span className="rounded-md bg-lothar-yellow px-2 py-1 text-xs font-bold text-lothar-black">
                            {item.estado}
                          </span>
                        </td>
                        <td className="px-4 py-4">{item.vendedor_nombre}</td>
                        <td className="px-4 py-4 text-right font-bold">{formatCurrency(item.total, item.moneda)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

            <Card>
              <h2 className="text-lg font-bold text-neutral-950">Operaciones por vendedor</h2>
              <div className="mt-5 space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-semibold">Roman Lopez</span>
                    <span className="text-neutral-500">100%</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-100">
                    <div className="h-2 rounded-full bg-lothar-yellow" style={{ width: "100%" }} />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-bold text-neutral-950">Productos activos</h2>
              <div className="mt-4 space-y-3">
                {productos.map((producto) => (
                  <div className="rounded-md border border-neutral-200 p-3" key={producto.id}>
                    <p className="font-semibold text-neutral-950">
                      {producto.marca} {producto.modelo}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">{producto.descripcion}</p>
                    <p className="mt-2 text-sm font-bold">{formatCurrency(producto.precio_lista, producto.moneda)}</p>
                  </div>
                ))}
              </div>
            </Card>
          </aside>
        </section>
      </div>
    </main>
    </>
  );
}
