"use client";

import { Mail, MapPin, Phone, Plus, Search, User, X, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase";
import type { Cliente } from "@/types/domain";

const CONDICION_IVA = ["Responsable Inscripto", "Monotributista", "Exento", "Consumidor Final"];
const PROVINCIAS = ["Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"];

function NuevoClienteModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [tipo, setTipo] = useState<"persona_fisica" | "persona_juridica">("persona_fisica");
  const [nombre, setNombre] = useState("");
  const [cuit, setCuit] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [provincia, setProvincia] = useState("Buenos Aires");
  const [condicionIva, setCondicionIva] = useState("Responsable Inscripto");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!nombre.trim() || !cuit.trim()) { setError("Nombre y CUIT son requeridos"); return; }
    setSaving(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.from("clientes").insert({
      tipo_cliente: tipo,
      nombre_razon_social: nombre.trim(),
      cuit: cuit.trim(),
      telefono: telefono.trim(),
      email: email.trim(),
      direccion: direccion.trim(),
      localidad: localidad.trim(),
      provincia,
      condicion_iva: condicionIva,
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
          <h2 className="text-lg font-bold text-neutral-950">Nuevo cliente</h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
          {/* Tipo */}
          <div className="flex gap-3">
            {(["persona_fisica", "persona_juridica"] as const).map(t => (
              <button key={t} onClick={() => setTipo(t)}
                className={`flex-1 rounded-lg border-2 py-2.5 text-sm font-bold transition ${tipo === t ? "border-lothar-yellow bg-lothar-yellow text-lothar-black" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"}`}>
                {t === "persona_fisica" ? "Persona Física" : "Persona Jurídica"}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                {tipo === "persona_juridica" ? "Razón social" : "Nombre completo"} *
              </label>
              <input className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-lothar-yellow"
                value={nombre} onChange={e => setNombre(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">CUIT *</label>
              <input className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-lothar-yellow"
                value={cuit} onChange={e => setCuit(e.target.value)} placeholder="20-12345678-9" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Condición IVA</label>
              <select className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-lothar-yellow"
                value={condicionIva} onChange={e => setCondicionIva(e.target.value)}>
                {CONDICION_IVA.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Teléfono</label>
              <input className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-lothar-yellow"
                value={telefono} onChange={e => setTelefono(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Email</label>
              <input type="email" className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-lothar-yellow"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Dirección</label>
              <input className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-lothar-yellow"
                value={direccion} onChange={e => setDireccion(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Localidad</label>
              <input className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-lothar-yellow"
                value={localidad} onChange={e => setLocalidad(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Provincia</label>
              <select className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-lothar-yellow"
                value={provincia} onChange={e => setProvincia(e.target.value)}>
                {PROVINCIAS.map(p => <option key={p}>{p}</option>)}
              </select>
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
            {saving ? "Guardando..." : "Guardar cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ClientesModule() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("clientes")
      .select("*")
      .is("deleted_at", null)
      .order("nombre_razon_social");
    setClientes((data as Cliente[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return clientes.filter(c =>
      c.nombre_razon_social.toLowerCase().includes(q) ||
      c.cuit.toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.localidad ?? "").toLowerCase().includes(q)
    );
  }, [query, clientes]);

  return (
    <main className="min-h-screen flex-1 overflow-auto pb-24 lg:pb-0">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">Lothar Maquinaria</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">Clientes</h1>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input className="w-full pl-9 sm:w-72" placeholder="Nombre, CUIT o localidad"
                value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <Button type="button" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4" /> Nuevo cliente
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map(cliente => (
              <Card key={cliente.id} className="p-5 hover:border-neutral-300 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lothar-yellow font-bold text-lothar-black">
                      {cliente.nombre_razon_social[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-950 leading-tight">{cliente.nombre_razon_social}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">CUIT: {cliente.cuit}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${
                    cliente.tipo_cliente === "persona_juridica" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700"
                  }`}>
                    {cliente.tipo_cliente === "persona_juridica" ? "Jurídica" : "Física"}
                  </span>
                </div>
                <div className="mt-4 space-y-1.5 text-sm text-neutral-600">
                  {cliente.localidad && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                      <span>{cliente.localidad}{cliente.provincia ? `, ${cliente.provincia}` : ""}</span>
                    </div>
                  )}
                  {cliente.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                      <span>{cliente.telefono}</span>
                    </div>
                  )}
                  {cliente.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                      <span className="truncate">{cliente.email}</span>
                    </div>
                  )}
                </div>
                {cliente.condicion_iva && (
                  <div className="mt-3 border-t border-neutral-100 pt-3">
                    <p className="text-xs text-neutral-400">{cliente.condicion_iva}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-neutral-400">
            <User className="h-10 w-10" />
            <p className="text-sm font-medium">{clientes.length === 0 ? "Aún no hay clientes cargados" : "No se encontraron clientes"}</p>
          </div>
        )}
      </div>

      {showModal && (
        <NuevoClienteModal onClose={() => setShowModal(false)} onSaved={fetchClientes} />
      )}
    </main>
  );
}
