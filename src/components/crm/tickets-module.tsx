"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus, Search, RefreshCw, ChevronRight, X,
  ShoppingCart, Wrench, Megaphone, Factory, Receipt, Loader2, Check
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { NuevoTicketModal } from "@/components/crm/nuevo-ticket-modal";
import { AdjuntosViewer } from "@/components/crm/file-upload";
import { formatDate } from "@/lib/utils";
import type { Ticket, TicketArea, TicketEstado } from "@/types/tickets";
import {
  AREA_LABELS, ESTADO_LABELS, ESTADO_COLORS,
  PRIORIDAD_LABELS, PRIORIDAD_COLORS,
} from "@/types/tickets";

/* ── Íconos por área ── */
const AREA_ICONS: Record<TicketArea, typeof ShoppingCart> = {
  compras:        ShoppingCart,
  postventa:      Wrench,
  marketing:      Megaphone,
  fabrica:        Factory,
  administracion: Receipt,
};

const AREA_BG: Record<TicketArea, string> = {
  compras:        "bg-blue-100 text-blue-700",
  postventa:      "bg-orange-100 text-orange-700",
  marketing:      "bg-purple-100 text-purple-700",
  fabrica:        "bg-green-100 text-green-700",
  administracion: "bg-neutral-100 text-neutral-700",
};

type Tab = "todos" | TicketArea;

const TABS: { value: Tab; label: string }[] = [
  { value: "todos",          label: "Todos" },
  { value: "compras",        label: "Compras" },
  { value: "postventa",      label: "Postventa" },
  { value: "marketing",      label: "Marketing" },
  { value: "fabrica",        label: "Fábrica" },
  { value: "administracion", label: "Administración" },
];

/* ── Panel de detalle ── */
function TicketDetail({
  ticket,
  onClose,
  onUpdated,
  canRespond,
}: {
  ticket: Ticket;
  onClose: () => void;
  onUpdated: () => void;
  canRespond: boolean;
}) {
  const [estado, setEstado] = useState<TicketEstado>(ticket.estado);
  const [respuesta, setRespuesta] = useState(ticket.respuesta ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("tickets").update({
      estado,
      respuesta: respuesta || null,
      respondido_por: user?.id ?? null,
      respondido_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", ticket.id);
    setSaving(false);
    onUpdated();
    onClose();
  }

  const ext = ticket.datos_extra as Record<string, string>;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-5 py-4">
        <div>
          <p className="font-mono text-sm font-bold text-neutral-900">{ticket.numero_ticket}</p>
          <p className="mt-0.5 text-xs text-neutral-500">{ticket.tipo_solicitud}</p>
        </div>
        <button onClick={onClose} className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${AREA_BG[ticket.area]}`}>
            {AREA_LABELS[ticket.area]}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ESTADO_COLORS[ticket.estado]}`}>
            {ESTADO_LABELS[ticket.estado]}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PRIORIDAD_COLORS[ticket.prioridad]}`}>
            {PRIORIDAD_LABELS[ticket.prioridad]}
          </span>
        </div>

        {/* Info solicitante */}
        <div className="rounded-lg bg-neutral-50 p-4 space-y-2">
          <Row label="Solicitante" value={ticket.solicitante_nombre} />
          <Row label="Área" value={ticket.area_solicitante} />
          <Row label="Fecha" value={formatDate(ticket.created_at)} />
          {ticket.fecha_maxima && <Row label="Fecha límite" value={formatDate(ticket.fecha_maxima)} />}
        </div>

        {/* Descripción */}
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-neutral-500">Descripción</p>
          <p className="whitespace-pre-wrap text-neutral-800">{ticket.descripcion}</p>
        </div>

        {/* Datos extra (sin adjuntos, se muestran aparte) */}
        {Object.entries(ext).filter(([k, v]) => k !== "adjuntos" && v).length > 0 && (
          <div className="rounded-lg border border-neutral-100 p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Detalles adicionales</p>
            {Object.entries(ext).filter(([k, v]) => k !== "adjuntos" && v).map(([k, v]) => (
              <Row key={k} label={k.replace(/_/g, " ")} value={String(v)} />
            ))}
          </div>
        )}

        {/* Adjuntos */}
        {ext.adjuntos && Array.isArray(ext.adjuntos) && ext.adjuntos.length > 0 && (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <AdjuntosViewer adjuntos={ext.adjuntos as any} />
        )}

        {/* Cliente */}
        {ticket.asociado_cliente && (
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Vinculado a cliente</p>
            {ticket.cliente_nombre && <Row label="Cliente" value={ticket.cliente_nombre} />}
            {ticket.numero_operacion && <Row label="Operación" value={ticket.numero_operacion} />}
          </div>
        )}

        {/* Respuesta anterior */}
        {ticket.respuesta && (
          <div className="rounded-lg bg-green-50 border border-green-100 p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-green-600">Respuesta del área</p>
            <p className="whitespace-pre-wrap text-neutral-800">{ticket.respuesta}</p>
          </div>
        )}

        {/* Formulario de respuesta — solo para el responsable del área o admin */}
        {canRespond ? (
          <div className="space-y-3 border-t border-neutral-100 pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Actualizar ticket</p>
            <select
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-lothar-yellow focus:ring-1 focus:ring-lothar-yellow"
              value={estado}
              onChange={e => setEstado(e.target.value as TicketEstado)}
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En proceso</option>
              <option value="resuelto">Resuelto</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-lothar-yellow focus:ring-1 focus:ring-lothar-yellow"
              placeholder="Respuesta o comentario del área responsable..."
              value={respuesta}
              onChange={e => setRespuesta(e.target.value)}
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-lothar-yellow py-2.5 text-sm font-bold text-lothar-black transition hover:bg-yellow-400 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        ) : (
          <div className="border-t border-neutral-100 pt-4">
            <p className="text-xs text-neutral-400 text-center">Solo el responsable del área puede responder este ticket.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="capitalize text-neutral-500">{label}</span>
      <span className="text-right font-medium text-neutral-900">{value}</span>
    </div>
  );
}

/* ── Módulo principal ── */
export function TicketsModule() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("todos");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [defaultArea, setDefaultArea] = useState<TicketArea | undefined>();

  // Perfil del usuario actual
  const [userRole, setUserRole] = useState<string>("vendedor");
  const [userAreaResponsable, setUserAreaResponsable] = useState<TicketArea | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("profiles").select("role, area_responsable").eq("id", data.user.id).single()
        .then(({ data: p }) => {
          if (!p) return;
          setUserRole(p.role ?? "vendedor");
          setUserAreaResponsable((p.area_responsable as TicketArea) ?? null);
          // Si es responsable de área, abrir directo en su tab
          if (p.area_responsable && p.role !== "administrador") {
            setTab(p.area_responsable as TicketArea);
          }
        });
    });
  }, []);

  const esAdmin = userRole === "administrador";
  const esResponsable = !esAdmin && userAreaResponsable !== null;

  // Los tabs visibles: admin ve todo, responsable solo su área + sus tickets creados
  const tabsVisibles: { value: Tab; label: string }[] = esAdmin
    ? TABS
    : esResponsable
      ? [
          { value: "todos" as Tab, label: "Mis solicitudes" },
          { value: userAreaResponsable as Tab, label: AREA_LABELS[userAreaResponsable!] },
        ]
      : [{ value: "todos" as Tab, label: "Mis solicitudes" }];

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("tickets")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    setTickets((data as Ticket[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const filtered = tickets.filter(t => {
    if (tab !== "todos" && t.area !== tab) return false;
    if (query) {
      const q = query.toLowerCase();
      return [t.numero_ticket, t.solicitante_nombre, t.tipo_solicitud, t.descripcion, t.cliente_nombre ?? ""]
        .join(" ").toLowerCase().includes(q);
    }
    return true;
  });

  /* Conteos por área */
  const counts: Record<Tab, number> = {
    todos:          tickets.filter(t => t.estado !== "resuelto" && t.estado !== "cancelado").length,
    compras:        tickets.filter(t => t.area === "compras"        && t.estado === "pendiente").length,
    postventa:      tickets.filter(t => t.area === "postventa"      && t.estado === "pendiente").length,
    marketing:      tickets.filter(t => t.area === "marketing"      && t.estado === "pendiente").length,
    fabrica:        tickets.filter(t => t.area === "fabrica"        && t.estado === "pendiente").length,
    administracion: tickets.filter(t => t.area === "administracion" && t.estado === "pendiente").length,
  };

  function openNew(area?: TicketArea) {
    setDefaultArea(area);
    setShowModal(true);
  }

  return (
    <main className="min-h-screen flex-1 overflow-auto pb-24 lg:pb-0">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">

        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">Lothar Maquinaria</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">Tickets internos</h1>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-lothar-yellow focus:ring-1 focus:ring-lothar-yellow sm:w-72"
                placeholder="Buscar ticket, solicitante..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => fetchTickets()}
              className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              <RefreshCw className="h-4 w-4" /> Actualizar
            </button>
            <button
              onClick={() => openNew()}
              className="flex items-center justify-center gap-2 rounded-lg bg-lothar-yellow px-4 py-2.5 text-sm font-bold text-lothar-black hover:bg-yellow-400"
            >
              <Plus className="h-4 w-4" /> Nuevo ticket
            </button>
          </div>
        </header>

        {/* Tarjetas de acceso rápido — todos pueden enviar a cualquier área */}
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">Enviar solicitud a...</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {(Object.entries(AREA_LABELS) as [TicketArea, string][]).map(([area, label]) => {
              const Icon = AREA_ICONS[area];
              const pending = counts[area];
              // Solo admins y responsables del área ven el contador de pendientes
              const canSeePending = esAdmin || userAreaResponsable === area;
              return (
                <button
                  key={area}
                  onClick={() => openNew(area)}
                  className="flex items-center gap-3 rounded-xl border-2 border-neutral-200 bg-white p-4 text-left transition hover:border-lothar-yellow hover:bg-yellow-50"
                >
                  <div className={`shrink-0 rounded-lg p-2 ${AREA_BG[area]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-neutral-700">{label}</p>
                    {canSeePending && pending > 0 && (
                      <p className="text-xs font-semibold text-orange-600">{pending} pendiente{pending !== 1 ? "s" : ""}</p>
                    )}
                    {canSeePending && pending === 0 && <p className="text-xs text-neutral-400">Al día ✓</p>}
                    {!canSeePending && <p className="text-xs text-neutral-400">Nueva solicitud →</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs + lista */}
        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-4">
            {/* Tabs — solo los visibles para este usuario */}
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-neutral-200 bg-neutral-50 p-1">
              {tabsVisibles.map(t => (
                <button
                  key={t.value}
                  onClick={() => { setTab(t.value); setSelected(null); }}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition
                    ${tab === t.value ? "bg-lothar-yellow text-lothar-black shadow-sm" : "text-neutral-500 hover:text-neutral-800"}`}
                >
                  {t.label}
                  {counts[t.value] > 0 && (
                    <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] text-white">
                      {counts[t.value]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Lista */}
            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-neutral-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-neutral-400">
                  <p className="text-sm">No hay tickets en esta categoría.</p>
                  <button onClick={() => openNew(tab !== "todos" ? tab as TicketArea : undefined)}
                    className="text-sm font-semibold text-lothar-black underline underline-offset-2">
                    Crear el primero
                  </button>
                </div>
              ) : (
                filtered.map(t => {
                  const Icon = AREA_ICONS[t.area];
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelected(t)}
                      className={`flex w-full items-center gap-4 border-b border-neutral-100 px-4 py-3.5 text-left transition last:border-0
                        hover:bg-neutral-50 ${selected?.id === t.id ? "bg-yellow-50" : ""}`}
                    >
                      <div className={`shrink-0 rounded-lg p-2 ${AREA_BG[t.area]}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-neutral-500">{t.numero_ticket}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ESTADO_COLORS[t.estado]}`}>
                            {ESTADO_LABELS[t.estado]}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${PRIORIDAD_COLORS[t.prioridad]}`}>
                            {PRIORIDAD_LABELS[t.prioridad]}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-sm font-semibold text-neutral-900">{t.tipo_solicitud}</p>
                        <p className="mt-0.5 truncate text-xs text-neutral-500">
                          {t.solicitante_nombre} · {t.area_solicitante} · {formatDate(t.created_at)}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300" />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Panel detalle */}
          <div className="hidden lg:block">
            {selected ? (
              <div className="sticky top-8 rounded-xl border border-neutral-200 bg-white overflow-hidden" style={{ maxHeight: "calc(100vh - 8rem)" }}>
                <TicketDetail
                  ticket={selected}
                  onClose={() => setSelected(null)}
                  onUpdated={() => { fetchTickets(); setSelected(null); }}
                  canRespond={esAdmin || userAreaResponsable === selected.area}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 py-20 text-neutral-400">
                <p className="text-sm">Seleccioná un ticket para ver el detalle</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal nuevo ticket */}
      {showModal && (
        <NuevoTicketModal
          defaultArea={defaultArea}
          onClose={() => setShowModal(false)}
          onCreated={() => { fetchTickets(); setShowModal(false); }}
        />
      )}
    </main>
  );
}
