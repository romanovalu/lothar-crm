"use client";

import { Package, Plus, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { productos } from "@/lib/sample-data";
import { formatCurrency } from "@/lib/utils";

export function ProductosModule() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return productos.filter(
      (p) =>
        p.marca.toLowerCase().includes(q) ||
        p.modelo.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <main className="min-h-screen flex-1 overflow-auto pb-24 lg:pb-0">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">Lothar Maquinaria</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">Máquinas / Productos</h1>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                className="w-full pl-9 sm:w-72"
                placeholder="Marca, modelo o descripción"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button type="button">
              <Plus className="h-4 w-4" />
              Nuevo producto
            </Button>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((producto) => (
            <Card key={producto.id} className="p-0 overflow-hidden hover:border-neutral-300 transition-colors cursor-pointer">
              {/* Imagen placeholder */}
              <div className="flex h-40 items-center justify-center bg-neutral-50 border-b border-neutral-200">
                {producto.imagen ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={producto.imagen} alt={producto.modelo} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-14 w-14 text-neutral-300" />
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">{producto.marca}</p>
                    <p className="mt-0.5 text-lg font-bold text-neutral-950">{producto.modelo}</p>
                  </div>
                  <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${
                    producto.activo ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"
                  }`}>
                    {producto.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>

                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{producto.descripcion}</p>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xl font-bold text-neutral-950">
                    {formatCurrency(producto.precio_lista, producto.moneda)}
                  </p>
                  <p className="text-xs text-neutral-400">{producto.moneda}</p>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-neutral-400" />
                  Garantía: {producto.garantia}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-neutral-400">
            <Package className="h-10 w-10" />
            <p className="text-sm font-medium">No se encontraron productos</p>
          </div>
        )}
      </div>
    </main>
  );
}
