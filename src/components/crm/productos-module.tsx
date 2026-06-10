"use client";

import { Package, Plus, Search, ShieldCheck, X, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import type { Producto } from "@/types/domain";

function NuevoProductoModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [moneda, setMoneda] = useState<"USD" | "ARS">("USD");
  const [garantia, setGarantia] = useState("12 meses");
  const [activo, setActivo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!marca.trim() || !modelo.trim()) { setError("Marca y modelo son requeridos"); return; }
    setSaving(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.from("productos").insert({
      marca: marca.trim(),
      modelo: modelo.trim(),
      descripcion: descripcion.trim(),
      precio_lista: parseFloat(precio) || 0,
      moneda,
      garantia: garantia.trim(),
      activo,
    });
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 className="text-lg font-bold text-neutral-950">Nuevo producto / máquina</h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Marca *</label>
              <input className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-lothar-yellow"
                value={marca} onChange={e => setMarca(e.target.value)} placeholder="Ej: John Deere" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Modelo *</label>
              <input className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-lothar-yellow"
                value={modelo} onChange={e => setModelo(e.target.value)} placeholder="Ej: 5075E" />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Descripción</label>
              <textarea rows={3} className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-lothar-yellow resize-none"
                value={descripcion} onChange={e => setDescripcion(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Precio lista</label>
              <input type="number" className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-lothar-yellow"
                value={precio} onChange={e => setPrecio(e.target.value)} placeholder="0" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Moneda</label>
              <select className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-lothar-yellow"
                value={moneda} onChange={e => setMoneda(e.target.value as "USD" | "ARS")}>
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Garantía</label>
              <input className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-lothar-yellow"
                value={garantia} onChange={e => setGarantia(e.target.value)} placeholder="Ej: 12 meses" />
            </div>
            <div className="flex items-center gap-3 pt-4">
              <input type="checkbox" id="activo" checked={activo} onChange={e => setActivo(e.target.checked)}
                className="h-4 w-4 accent-lothar-yellow" />
              <label htmlFor="activo" className="text-sm font-medium text-neutral-700">Producto activo</label>
            </div>
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 border-t border-neutral-100 px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-lothar-yellow px-5 py-2 text-sm font-bold text-lothar-black transition hover:bg-yellow-400 disabled:opacity-60">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Guardando..." : "Guardar producto"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductosModule() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("productos")
      .select("*")
      .is("deleted_at", null)
      .order("marca");
    setProductos((data as Producto[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProductos(); }, [fetchProductos]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return productos.filter(p =>
      p.marca.toLowerCase().includes(q) ||
      p.modelo.toLowerCase().includes(q) ||
      (p.descripcion ?? "").toLowerCase().includes(q)
    );
  }, [query, productos]);

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
              <Input className="w-full pl-9 sm:w-72" placeholder="Marca, modelo o descripción"
                value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <Button type="button" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4" /> Nuevo producto
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map(producto => (
              <Card key={producto.id} className="p-0 overflow-hidden hover:border-neutral-300 transition-colors">
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
                  {producto.descripcion && (
                    <p className="mt-2 text-sm text-neutral-600 leading-relaxed line-clamp-2">{producto.descripcion}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xl font-bold text-neutral-950">
                      {formatCurrency(producto.precio_lista, producto.moneda)}
                    </p>
                    <p className="text-xs text-neutral-400">{producto.moneda}</p>
                  </div>
                  {producto.garantia && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
                      <ShieldCheck className="h-3.5 w-3.5 text-neutral-400" />
                      Garantía: {producto.garantia}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-neutral-400">
            <Package className="h-10 w-10" />
            <p className="text-sm font-medium">{productos.length === 0 ? "Aún no hay productos cargados" : "No se encontraron productos"}</p>
          </div>
        )}
      </div>

      {showModal && (
        <NuevoProductoModal onClose={() => setShowModal(false)} onSaved={fetchProductos} />
      )}
    </main>
  );
}
