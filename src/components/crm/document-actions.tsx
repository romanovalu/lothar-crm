"use client";

import { Building2, FileText, Printer, Truck, User } from "lucide-react";
import type { DocumentoTipo, Operacion } from "@/types/domain";

const documentos: { tipo: DocumentoTipo; label: string; icon: typeof FileText; color: string }[] = [
  {
    tipo: "proforma",
    label: "Proforma",
    icon: FileText,
    color: "bg-lothar-yellow text-lothar-black hover:bg-yellow-300"
  },
  {
    tipo: "boleto_compraventa",
    label: "Boleto C/V",
    icon: Printer,
    color: "bg-neutral-900 text-white hover:bg-neutral-700"
  },
  {
    tipo: "patentamiento_fisica",
    label: "Patent. Física",
    icon: User,
    color: "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
  },
  {
    tipo: "patentamiento_juridica",
    label: "Patent. Jurídica",
    icon: Building2,
    color: "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
  },
  {
    tipo: "orden_entrega",
    label: "Orden Entrega",
    icon: Truck,
    color: "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
  }
];

export function DocumentActions({ operacion }: { operacion: Operacion }) {
  function openDoc(tipo: DocumentoTipo) {
    window.open(`/api/forms/${tipo}?operacion_id=${operacion.id}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-500">
        Generar documentos
      </p>
      <div className="flex flex-wrap gap-2">
        {documentos.map(({ tipo, label, icon: Icon, color }) => (
          <button
            key={tipo}
            onClick={() => openDoc(tipo)}
            type="button"
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${color}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>
      <p className="text-xs text-neutral-400">
        Se abren en una pestaña nueva. Imprimir con <kbd className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-xs">Ctrl+P</kbd> o guardar como PDF desde el navegador.
      </p>
    </div>
  );
}
