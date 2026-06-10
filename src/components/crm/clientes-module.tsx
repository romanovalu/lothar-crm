"use client";

import { Mail, MapPin, Phone, Plus, Search, User } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { clientes } from "@/lib/sample-data";

export function ClientesModule() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return clientes.filter(
      (c) =>
        c.nombre_razon_social.toLowerCase().includes(q) ||
        c.cuit.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.localidad.toLowerCase().includes(q)
    );
  }, [query]);

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
              <Input
                className="w-full pl-9 sm:w-72"
                placeholder="Nombre, CUIT o localidad"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button type="button">
              <Plus className="h-4 w-4" />
              Nuevo cliente
            </Button>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((cliente) => (
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
                  cliente.tipo_cliente === "persona_juridica"
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-700"
                }`}>
                  {cliente.tipo_cliente === "persona_juridica" ? "Jurídica" : "Física"}
                </span>
              </div>

              <div className="mt-4 space-y-1.5 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                  <span>{cliente.localidad}, {cliente.provincia}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                  <span>{cliente.telefono}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                  <span className="truncate">{cliente.email}</span>
                </div>
              </div>

              <div className="mt-3 border-t border-neutral-100 pt-3">
                <p className="text-xs text-neutral-400">{cliente.condicion_iva}</p>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-neutral-400">
            <User className="h-10 w-10" />
            <p className="text-sm font-medium">No se encontraron clientes</p>
          </div>
        )}
      </div>
    </main>
  );
}
