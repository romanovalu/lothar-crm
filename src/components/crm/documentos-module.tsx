"use client";

import { Building2, FileText, Loader2, Printer, Search, Truck, User } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DocumentoTipo, Operacion } from "@/types/domain";

const estadoColors: Record<string, string> = {
  Cotizacion: "bg-blue-100 text-blue-700",
  Reservada: "bg-orange-100 text-orange-700",
  Vendida: "bg-lothar-yellow text-lothar-black",
  Entregada: "bg-green-100 text-green-700",
  Cancelada: "bg-neutral-100 text-neutral-500",
};

const documentos: { tipo: DocumentoTipo; icon: typeof FileText; title: string }[] = [
  { tipo: "proforma",               icon: FileText,  title: "Proforma" },
  { tipo: "boleto_compraventa",     icon: Printer,   title: "Boleto C/V" },
  { tipo: "patentamiento_fisica",   icon: User,      title: "Patent. Física" },
  { tipo: "patentamiento_juridica", icon: Building2, title: "Patent. Jurídica" },
  { tipo: "orden_entrega",          icon: Truck,     title: "Orden de Entrega" },
];

function openDoc(tipo: DocumentoTipo, operacionId: string) {
  window.open(`/api/forms/${tipo}?operacion_id=${operacionId}`, "_blank", "noopener,noreferrer");
}

function OperacionRow({ op }: { op: Operacion }) {
  return (
    <div className="flex flex-col gap-3 border-b border-neutral-100 px-4 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-neutral-900">{op.numero_operacion}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${estadoColors[op.estado] ?? "bg-neutral-100 text-neutral-500"}`}>
            {op.estado}
          </span>
        </div>
        <span className="truncate text-sm text-neutral-600">{op.cliente?.nombre_razon_social ?? "—"}</span>
        <span className="text-xs text-neutral-400">{formatDate(op.fecha)} · {formatCurrency(op.total, op.moneda)}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 shrink-0">
        {documentos.map(({ tipo, icon: Icon, title }) => (
          <button key={tipo} type="button" title={title} onClick={() => openDoc(tipo, op.id)}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-900">
            <Icon className="h-3.5 w-3.5" />
            {title}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DocumentosModule() {
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchOperaciones = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("operaciones")
      .select(`*, cliente:clientes(*), items:operacion_items(*, producto:productos(*)), patentamiento:patentamientos(*)`)
      .order("created_at", { ascending: false });
    setOperaciones((data as Operacion[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOperaciones(); }, [fetchOperaciones]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return operaciones;
    return operaciones.filter(op =>
      [op.numero_operacion, op.cliente?.nombre_razon_social, op.cliente?.cuit, op.estado]
        .join(" ").toLowerCase().includes(q)
    );
  }, [query, operaciones]);

  return (
    <main className="min-h-screen flex-1 overflow-auto pb-24 lg:pb-0">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">Lothar Maquinaria</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">Documentos</h1>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input className="w-full pl-9 sm:w-80" placeholder="Operación, cliente, CUIT o estado"
              value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
          </div>
        ) : (
          <Card className="p-0 overflow-hidden">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-neutral-400">
                <FileText className="h-10 w-10" />
                <p className="text-sm">{operaciones.length === 0 ? "Aún no hay operaciones cargadas" : "No se encontraron operaciones"}</p>
              </div>
            ) : (
              filtered.map(op => <OperacionRow key={op.id} op={op} />)
            )}
          </Card>
        )}

        <p className="text-xs text-neutral-400">
          Los documentos se abren en una pestaña nueva. Imprimí con{" "}
          <kbd className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-xs">Ctrl+P</kbd>{" "}
          o guardá como PDF desde el navegador.
        </p>
      </div>
    </main>
  );
}
