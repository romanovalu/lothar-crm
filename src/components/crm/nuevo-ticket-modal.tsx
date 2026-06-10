"use client";

import { useState, useEffect } from "react";
import {
  X, ChevronRight, ChevronLeft, Loader2,
  ShoppingCart, Wrench, Megaphone, Factory, Receipt
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { TicketArea } from "@/types/tickets";
import {
  AREA_LABELS, TIPOS_POR_AREA, AREAS_SOLICITANTES
} from "@/types/tickets";
import { FileUpload, type Adjunto } from "@/components/crm/file-upload";

/* ─── Helpers ─── */
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
        {label}{required && <span className="ml-1 text-red-400">*</span>}
      </span>
      {children}
    </label>
  );
}
const inputCls = "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-lothar-yellow focus:ring-1 focus:ring-lothar-yellow";
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputCls} ${props.className ?? ""}`} {...props} />;
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} className={`${inputCls} ${props.className ?? ""}`} {...props} />;
}
function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={inputCls} {...props}>
      {children}
    </select>
  );
}

/* ─── Áreas disponibles ─── */
const AREAS: { area: TicketArea; label: string; desc: string; icon: typeof ShoppingCart; color: string }[] = [
  {
    area: "compras",
    label: "Compras",
    desc: "Solicitudes de compra, contrataciones, insumos y logística.",
    icon: ShoppingCart,
    color: "border-blue-200 hover:border-blue-400 hover:bg-blue-50",
  },
  {
    area: "postventa",
    label: "Postventa",
    desc: "Reparaciones, consultas técnicas y derivaciones de clientes.",
    icon: Wrench,
    color: "border-orange-200 hover:border-orange-400 hover:bg-orange-50",
  },
  {
    area: "marketing",
    label: "Marketing",
    desc: "Piezas gráficas, redes sociales, merchandising y eventos.",
    icon: Megaphone,
    color: "border-purple-200 hover:border-purple-400 hover:bg-purple-50",
  },
  {
    area: "fabrica",
    label: "Fábrica",
    desc: "Pedidos de unidades, consultas de stock y tiempos de entrega.",
    icon: Factory,
    color: "border-green-200 hover:border-green-400 hover:bg-green-50",
  },
  {
    area: "administracion",
    label: "Administración",
    desc: "Facturación, pagos, documentación y consultas contables.",
    icon: Receipt,
    color: "border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50",
  },
];

interface Props {
  defaultArea?: TicketArea;
  onClose: () => void;
  onCreated: () => void;
}

export function NuevoTicketModal({ defaultArea, onClose, onCreated }: Props) {
  const [area, setArea] = useState<TicketArea | null>(defaultArea ?? null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── Campos comunes ── */
  const [solicitanteNombre, setSolicitanteNombre] = useState("");
  const [areaSolicitante, setAreaSolicitante] = useState("Comercial");
  const [tipoSolicitud, setTipoSolicitud] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState("media");
  const [fechaMaxima, setFechaMaxima] = useState("");
  const [asociadoCliente, setAsociadoCliente] = useState(false);
  const [clienteNombre, setClienteNombre] = useState("");
  const [numeroOperacion, setNumeroOperacion] = useState("");

  /* ── Campos específicos Compras ── */
  const [cantidad, setCantidad] = useState("");
  const [marcaEspec, setMarcaEspec] = useState("");
  const [linkReferencia, setLinkReferencia] = useState("");
  const [motivo, setMotivo] = useState("");
  const [presupuestoAprobado, setPresupuestoAprobado] = useState("");
  const [montoEstimado, setMontoEstimado] = useState("");
  const [proveedorSugerido, setProveedorSugerido] = useState("");
  const [impacto, setImpacto] = useState("");

  /* ── Campos específicos Postventa ── */
  const [serieUnidad, setSerieUnidad] = useState("");

  /* ── Campos específicos Marketing ── */
  const [fechaEvento, setFechaEvento] = useState("");
  const [presupuestoMarketing, setPresupuestoMarketing] = useState("");
  const [referencia, setReferencia] = useState("");

  /* ── Campos específicos Fábrica ── */
  const [modeloUnidad, setModeloUnidad] = useState("");
  const [cantidadFab, setCantidadFab] = useState("");
  const [especificaciones, setEspecificaciones] = useState("");

  /* ── Campos específicos Administración ── */
  const [montoAdmin, setMontoAdmin] = useState("");
  const [documentacion, setDocumentacion] = useState("");

  /* ── Adjuntos (compartido entre áreas) ── */
  const [adjuntos, setAdjuntos] = useState<Adjunto[]>([]);

  /* Pre-llenar nombre del usuario */
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from("profiles").select("nombre").eq("id", data.user.id).single()
          .then(({ data: p }) => {
            if (p?.nombre) setSolicitanteNombre(p.nombre);
          });
      }
    });
  }, []);

  /* Resetear tipo de solicitud al cambiar área */
  useEffect(() => {
    setTipoSolicitud("");
  }, [area]);

  const tipos = area ? TIPOS_POR_AREA[area] : [];

  /* ── Pasos según área ── */
  type StepDef = { title: string };
  const STEPS_COMPRAS: StepDef[] = [
    { title: "Solicitante" },
    { title: "Tipo" },
    { title: "Detalle" },
    { title: "Motivo" },
    { title: "Urgencia" },
    { title: "Presupuesto" },
  ];
  const STEPS_GENERALES: StepDef[] = [
    { title: "Solicitante" },
    { title: "Tipo y detalle" },
    { title: "Urgencia" },
  ];

  const steps = area === "compras" ? STEPS_COMPRAS : STEPS_GENERALES;
  const currentTitle = steps[step]?.title ?? "";

  async function handleSave() {
    if (!area) return;
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión activa");

      // Número de ticket
      const { count } = await supabase.from("tickets").select("*", { count: "exact", head: true });
      const num = String((count ?? 0) + 1).padStart(4, "0");
      const numero_ticket = `TK-${new Date().getFullYear()}-${num}`;

      // Datos extra según área
      let datos_extra: Record<string, unknown> = {};
      if (area === "compras") {
        datos_extra = {
          cantidad, marca_especificacion: marcaEspec,
          link_referencia: linkReferencia, motivo,
          presupuesto_aprobado: presupuestoAprobado,
          monto_estimado: montoEstimado,
          proveedor_sugerido: proveedorSugerido,
          impacto_si_no_se_realiza: impacto,
        };
      } else if (area === "postventa") {
        datos_extra = { serie_unidad: serieUnidad };
      } else if (area === "marketing") {
        datos_extra = {
          fecha_evento: fechaEvento,
          presupuesto: presupuestoMarketing,
          referencia,
        };
      } else if (area === "fabrica") {
        datos_extra = {
          modelo_unidad: modeloUnidad,
          cantidad: cantidadFab,
          especificaciones,
        };
      } else if (area === "administracion") {
        datos_extra = {
          monto: montoAdmin,
          documentacion,
        };
      }
      // Adjuntos disponibles para todas las áreas
      if (adjuntos.length > 0) {
        datos_extra.adjuntos = adjuntos;
      }

      const { error: err } = await supabase.from("tickets").insert({
        numero_ticket,
        area,
        estado: "pendiente",
        prioridad,
        solicitante_id: user.id,
        solicitante_nombre: solicitanteNombre,
        area_solicitante: areaSolicitante,
        tipo_solicitud: tipoSolicitud,
        descripcion,
        asociado_cliente: asociadoCliente,
        cliente_nombre: asociadoCliente ? clienteNombre : null,
        numero_operacion: asociadoCliente ? numeroOperacion : null,
        fecha_maxima: fechaMaxima || null,
        datos_extra,
      });

      if (err) throw new Error(err.message);
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  const canNext = () => {
    if (!area) return false;
    if (step === 0) return solicitanteNombre.trim().length > 0;
    if (area === "compras") {
      if (step === 1) return tipoSolicitud.length > 0;
      if (step === 2) return descripcion.trim().length > 0;
    } else {
      if (step === 1) return tipoSolicitud.length > 0 && descripcion.trim().length > 0;
    }
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex h-full max-h-[88vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-950">Nuevo Ticket</h2>
            {area ? (
              <p className="text-xs text-neutral-500">
                {AREA_LABELS[area]} · Paso {step + 1} de {steps.length} — {currentTitle}
              </p>
            ) : (
              <p className="text-xs text-neutral-500">Elegí el área destinataria</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {area && (
              <button
                onClick={() => { setArea(null); setStep(0); }}
                className="rounded-md px-3 py-1.5 text-xs font-semibold text-neutral-500 hover:bg-neutral-100"
              >
                ← Cambiar área
              </button>
            )}
            <button onClick={onClose} className="rounded-md p-2 text-neutral-400 hover:bg-neutral-100">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Steps */}
        {area && (
          <div className="shrink-0 border-b border-neutral-100 px-6 py-3">
            <div className="flex gap-1">
              {steps.map((s, i) => (
                <button
                  key={s.title}
                  onClick={() => i < step && setStep(i)}
                  className={`flex h-7 flex-1 items-center justify-center rounded-md text-xs font-bold transition
                    ${i === step ? "bg-lothar-yellow text-lothar-black" :
                      i < step ? "bg-green-100 text-green-700 cursor-pointer" :
                      "bg-neutral-100 text-neutral-400 cursor-default"}`}
                >
                  <span className="hidden sm:inline">{s.title}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Selector de área */}
          {!area && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {AREAS.map(({ area: a, label, desc, icon: Icon, color }) => (
                <button
                  key={a}
                  onClick={() => { setArea(a); setStep(0); }}
                  className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition ${color}`}
                >
                  <div className="mt-0.5 shrink-0 rounded-lg bg-neutral-100 p-2">
                    <Icon className="h-5 w-5 text-neutral-700" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">{label}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── Paso: Solicitante (todas las áreas) ── */}
          {area && step === 0 && (
            <div className="space-y-4">
              <Field label="Nombre y apellido" required>
                <Input value={solicitanteNombre} onChange={e => setSolicitanteNombre(e.target.value)} placeholder="Juan Pérez" />
              </Field>
              <Field label="Área solicitante" required>
                <Select value={areaSolicitante} onChange={e => setAreaSolicitante(e.target.value)}>
                  {AREAS_SOLICITANTES.map(a => <option key={a}>{a}</option>)}
                </Select>
              </Field>
            </div>
          )}

          {/* ── Compras paso 1: Tipo ── */}
          {area === "compras" && step === 1 && (
            <div className="space-y-4">
              <Field label="¿Qué necesita gestionar?" required>
                <div className="grid gap-2 sm:grid-cols-2">
                  {tipos.map(t => (
                    <label key={t} className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition
                      ${tipoSolicitud === t ? "border-lothar-yellow bg-yellow-50" : "border-neutral-200 hover:border-neutral-300"}`}>
                      <input type="radio" className="accent-lothar-yellow" name="tipo" value={t}
                        checked={tipoSolicitud === t} onChange={() => setTipoSolicitud(t)} />
                      <span className="text-sm font-medium">{t}</span>
                    </label>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* ── Compras paso 2: Detalle ── */}
          {area === "compras" && step === 2 && (
            <div className="space-y-4">
              <Field label="Describa exactamente lo que necesita" required>
                <Textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
                  placeholder="Descripción detallada del pedido..." rows={4} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Cantidad">
                  <Input value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="Ej: 2 unidades, 5 kg..." />
                </Field>
                <Field label="Marca o especificación requerida">
                  <Input value={marcaEspec} onChange={e => setMarcaEspec(e.target.value)} placeholder="Marca, modelo, referencia..." />
                </Field>
              </div>
              <Field label="Link de referencia (si existe)">
                <Input type="url" value={linkReferencia} onChange={e => setLinkReferencia(e.target.value)}
                  placeholder="https://..." />
              </Field>
              <FileUpload
                label="Adjuntar imágenes, capturas o documentación"
                adjuntos={adjuntos}
                onChange={setAdjuntos}
              />
            </div>
          )}

          {/* ── Compras paso 3: Motivo ── */}
          {area === "compras" && step === 3 && (
            <div className="space-y-4">
              <Field label="¿Para qué se necesita?">
                <Textarea value={motivo} onChange={e => setMotivo(e.target.value)}
                  placeholder="Explicá el motivo o contexto de esta solicitud..." />
              </Field>
              <Field label="¿Está asociado a un cliente?">
                <div className="flex gap-4">
                  {["Sí", "No"].map(v => (
                    <label key={v} className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-semibold transition
                      ${(v === "Sí") === asociadoCliente ? "border-lothar-yellow bg-yellow-50" : "border-neutral-200"}`}>
                      <input type="radio" className="accent-lothar-yellow" checked={(v === "Sí") === asociadoCliente}
                        onChange={() => setAsociadoCliente(v === "Sí")} />
                      {v}
                    </label>
                  ))}
                </div>
              </Field>
              {asociadoCliente && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nombre del cliente">
                    <Input value={clienteNombre} onChange={e => setClienteNombre(e.target.value)} placeholder="Agro Norte S.A." />
                  </Field>
                  <Field label="Número de presupuesto / operación">
                    <Input value={numeroOperacion} onChange={e => setNumeroOperacion(e.target.value)} placeholder="OP-2026-0001" />
                  </Field>
                </div>
              )}
            </div>
          )}

          {/* ── Compras paso 4: Urgencia ── */}
          {area === "compras" && step === 4 && (
            <div className="space-y-4">
              <Field label="Nivel de prioridad" required>
                <div className="space-y-2">
                  {[
                    { v: "critica", label: "🔴 Crítica", desc: "Impacta una venta, detiene una entrega o una máquina" },
                    { v: "alta",    label: "🟠 Alta",    desc: "Necesaria esta semana" },
                    { v: "media",   label: "🟡 Media",   desc: "Puede esperar algunos días" },
                    { v: "baja",    label: "🟢 Baja",    desc: "Compra planificada / sin urgencia" },
                  ].map(({ v, label, desc }) => (
                    <label key={v} className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition
                      ${prioridad === v ? "border-lothar-yellow bg-yellow-50" : "border-neutral-200 hover:border-neutral-300"}`}>
                      <input type="radio" className="accent-lothar-yellow" name="prioridad" value={v}
                        checked={prioridad === v} onChange={() => setPrioridad(v)} />
                      <div>
                        <p className="text-sm font-bold">{label}</p>
                        <p className="text-xs text-neutral-500">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Fecha máxima requerida">
                <Input type="date" value={fechaMaxima} onChange={e => setFechaMaxima(e.target.value)} />
              </Field>
            </div>
          )}

          {/* ── Compras paso 5: Presupuesto ── */}
          {area === "compras" && step === 5 && (
            <div className="space-y-4">
              <Field label="¿Existe presupuesto aprobado?">
                <Select value={presupuestoAprobado} onChange={e => setPresupuestoAprobado(e.target.value)}>
                  <option value="">— Seleccionar —</option>
                  <option>Sí</option>
                  <option>No</option>
                  <option>No sé</option>
                </Select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Monto estimado">
                  <Input value={montoEstimado} onChange={e => setMontoEstimado(e.target.value)} placeholder="USD 500 / ARS 200.000" />
                </Field>
                <Field label="Proveedor sugerido">
                  <Input value={proveedorSugerido} onChange={e => setProveedorSugerido(e.target.value)} placeholder="Nombre del proveedor" />
                </Field>
              </div>
              <Field label="Si no se realiza esta compra...">
                <Select value={impacto} onChange={e => setImpacto(e.target.value)}>
                  <option value="">— Seleccionar impacto —</option>
                  <option>Se detiene una venta</option>
                  <option>Se retrasa una entrega</option>
                  <option>Se afecta un cliente</option>
                  <option>Se afecta una campaña de marketing</option>
                  <option>Se afecta el funcionamiento interno</option>
                  <option>No genera impacto inmediato</option>
                  <option>Otro</option>
                </Select>
              </Field>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}
            </div>
          )}

          {/* ── Áreas generales: paso 1 (tipo + detalle) ── */}
          {area && area !== "compras" && step === 1 && (
            <div className="space-y-4">
              <Field label="Tipo de solicitud" required>
                <div className="grid gap-2 sm:grid-cols-2">
                  {tipos.map(t => (
                    <label key={t} className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition
                      ${tipoSolicitud === t ? "border-lothar-yellow bg-yellow-50" : "border-neutral-200 hover:border-neutral-300"}`}>
                      <input type="radio" className="accent-lothar-yellow" name="tipo" value={t}
                        checked={tipoSolicitud === t} onChange={() => setTipoSolicitud(t)} />
                      <span className="text-sm font-medium">{t}</span>
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Descripción detallada" required>
                <Textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
                  placeholder="Explicá exactamente qué necesitás..." rows={4} />
              </Field>

              {/* Campos extra por área */}
              {area === "postventa" && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="N° de serie / modelo de la unidad">
                      <Input value={serieUnidad} onChange={e => setSerieUnidad(e.target.value)} placeholder="Ej: MH-717H-2024-001" />
                    </Field>
                  </div>
                  <FileUpload
                    label="Fotos o documentos del problema"
                    adjuntos={adjuntos}
                    onChange={setAdjuntos}
                  />
                </>
              )}
              {area === "marketing" && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Fecha del evento o entrega">
                      <Input type="date" value={fechaEvento} onChange={e => setFechaEvento(e.target.value)} />
                    </Field>
                    <Field label="Presupuesto disponible">
                      <Input value={presupuestoMarketing} onChange={e => setPresupuestoMarketing(e.target.value)} placeholder="ARS 50.000" />
                    </Field>
                    <Field label="Referencias o ejemplos (link)">
                      <Input type="url" value={referencia} onChange={e => setReferencia(e.target.value)} placeholder="https://..." />
                    </Field>
                  </div>
                  <FileUpload
                    label="Adjuntar referencias visuales o archivos"
                    adjuntos={adjuntos}
                    onChange={setAdjuntos}
                  />
                </>
              )}
              {area === "fabrica" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Modelo / unidad">
                    <Input value={modeloUnidad} onChange={e => setModeloUnidad(e.target.value)} placeholder="Mahindra 717H" />
                  </Field>
                  <Field label="Cantidad">
                    <Input value={cantidadFab} onChange={e => setCantidadFab(e.target.value)} placeholder="2 unidades" />
                  </Field>
                  <Field label="Especificaciones o personalización">
                    <Textarea value={especificaciones} onChange={e => setEspecificaciones(e.target.value)}
                      placeholder="Color, accesorios, configuración..." className="sm:col-span-2" />
                  </Field>
                </div>
              )}
              {area === "administracion" && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Monto (si aplica)">
                      <Input value={montoAdmin} onChange={e => setMontoAdmin(e.target.value)} placeholder="USD 1.500" />
                    </Field>
                    <Field label="N° de operación / cliente">
                      <Input value={documentacion} onChange={e => setDocumentacion(e.target.value)} placeholder="OP-2026-0001" />
                    </Field>
                  </div>
                  {tipoSolicitud === "Rendición de gastos" && (
                    <FileUpload
                      label="Comprobantes / tickets / facturas"
                      adjuntos={adjuntos}
                      onChange={setAdjuntos}
                      maxArchivos={10}
                    />
                  )}
                  {tipoSolicitud !== "Rendición de gastos" && (
                    <FileUpload
                      label="Adjuntar documentación (opcional)"
                      adjuntos={adjuntos}
                      onChange={setAdjuntos}
                    />
                  )}
                </>
              )}

              {/* Asociado a cliente */}
              <Field label="¿Está asociado a un cliente?">
                <div className="flex gap-4">
                  {["Sí", "No"].map(v => (
                    <label key={v} className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-semibold transition
                      ${(v === "Sí") === asociadoCliente ? "border-lothar-yellow bg-yellow-50" : "border-neutral-200"}`}>
                      <input type="radio" className="accent-lothar-yellow" checked={(v === "Sí") === asociadoCliente}
                        onChange={() => setAsociadoCliente(v === "Sí")} />
                      {v}
                    </label>
                  ))}
                </div>
              </Field>
              {asociadoCliente && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nombre del cliente">
                    <Input value={clienteNombre} onChange={e => setClienteNombre(e.target.value)} placeholder="Agro Norte S.A." />
                  </Field>
                  <Field label="Número de operación">
                    <Input value={numeroOperacion} onChange={e => setNumeroOperacion(e.target.value)} placeholder="OP-2026-0001" />
                  </Field>
                </div>
              )}
            </div>
          )}

          {/* ── Áreas generales: paso 2 (urgencia) ── */}
          {area && area !== "compras" && step === 2 && (
            <div className="space-y-4">
              <Field label="Nivel de prioridad" required>
                <div className="space-y-2">
                  {[
                    { v: "critica", label: "🔴 Crítica", desc: "Urgente, impacta directamente en un cliente o venta" },
                    { v: "alta",    label: "🟠 Alta",    desc: "Necesaria esta semana" },
                    { v: "media",   label: "🟡 Media",   desc: "Puede esperar algunos días" },
                    { v: "baja",    label: "🟢 Baja",    desc: "Sin urgencia particular" },
                  ].map(({ v, label, desc }) => (
                    <label key={v} className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition
                      ${prioridad === v ? "border-lothar-yellow bg-yellow-50" : "border-neutral-200 hover:border-neutral-300"}`}>
                      <input type="radio" className="accent-lothar-yellow" name="prioridad" value={v}
                        checked={prioridad === v} onChange={() => setPrioridad(v)} />
                      <div>
                        <p className="text-sm font-bold">{label}</p>
                        <p className="text-xs text-neutral-500">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Fecha máxima requerida">
                <Input type="date" value={fechaMaxima} onChange={e => setFechaMaxima(e.target.value)} />
              </Field>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {area && (
          <div className="flex shrink-0 items-center justify-between border-t border-neutral-200 px-6 py-4">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Atrás
            </button>

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                className="flex items-center gap-2 rounded-lg bg-lothar-yellow px-5 py-2 text-sm font-bold text-lothar-black transition hover:bg-yellow-400 disabled:opacity-40"
              >
                Siguiente <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving || !canNext()}
                className="flex items-center gap-2 rounded-lg bg-lothar-yellow px-5 py-2 text-sm font-bold text-lothar-black transition hover:bg-yellow-400 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Enviando..." : "Enviar ticket"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
