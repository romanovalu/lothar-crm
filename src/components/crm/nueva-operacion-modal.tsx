"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronRight, ChevronLeft, Check, Plus, Trash2, Loader2, Search, FileText, Printer, User, Building2, Truck, ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase";

/* ─── Tipos ─── */
type TipoOperacion = "completa" | "proforma" | "boleto" | "patentamiento_fisica" | "patentamiento_juridica" | "orden_entrega";

interface ClienteRow {
  id: string;
  nombre_razon_social: string;
  cuit: string;
  tipo_cliente: "persona_fisica" | "persona_juridica";
  telefono?: string;
  email?: string;
  direccion?: string;
  localidad?: string;
  provincia?: string;
}
interface ProductoRow {
  id: string;
  marca: string;
  modelo: string;
  descripcion?: string;
  precio_lista: number;
  moneda: string;
}
interface ItemWizard {
  producto_id?: string;
  descripcion_manual: string;
  cantidad: number;
  precio_unitario: number;
}

/* Pasos por tipo de operación */
type StepKey = "cliente" | "productos" | "comercial" | "contrato" | "patentamiento" | "resumen";

const STEPS_BY_TIPO: Record<TipoOperacion, StepKey[]> = {
  completa:              ["cliente", "productos", "comercial", "contrato", "patentamiento", "resumen"],
  proforma:              ["cliente", "productos", "comercial", "resumen"],
  boleto:                ["cliente", "productos", "comercial", "contrato", "resumen"],
  patentamiento_fisica:  ["cliente", "patentamiento", "resumen"],
  patentamiento_juridica:["cliente", "patentamiento", "resumen"],
  orden_entrega:         ["cliente", "productos", "resumen"],
};

const STEP_LABELS: Record<StepKey, string> = {
  cliente:       "Cliente",
  productos:     "Productos",
  comercial:     "Comercial",
  contrato:      "Contrato",
  patentamiento: "Patentamiento",
  resumen:       "Resumen",
};

const TIPO_OPTIONS: { tipo: TipoOperacion; label: string; desc: string; icon: typeof FileText; color: string }[] = [
  {
    tipo: "completa",
    label: "Operación completa",
    desc: "Carga todos los datos: cliente, productos, condiciones comerciales y patentamiento.",
    icon: ClipboardList,
    color: "bg-lothar-yellow text-lothar-black border-yellow-300 hover:bg-yellow-300",
  },
  {
    tipo: "proforma",
    label: "Proforma",
    desc: "Cotización formal con productos y condiciones de pago.",
    icon: FileText,
    color: "bg-white text-neutral-800 border-neutral-200 hover:border-lothar-yellow hover:bg-yellow-50",
  },
  {
    tipo: "boleto",
    label: "Boleto de Compraventa",
    desc: "Contrato de compraventa con estado de la operación.",
    icon: Printer,
    color: "bg-white text-neutral-800 border-neutral-200 hover:border-lothar-yellow hover:bg-yellow-50",
  },
  {
    tipo: "patentamiento_fisica",
    label: "Patentamiento — Persona Física",
    desc: "Declaración jurada para patentamiento de persona física.",
    icon: User,
    color: "bg-white text-neutral-800 border-neutral-200 hover:border-lothar-yellow hover:bg-yellow-50",
  },
  {
    tipo: "patentamiento_juridica",
    label: "Patentamiento — Persona Jurídica",
    desc: "Declaración jurada para patentamiento de empresa.",
    icon: Building2,
    color: "bg-white text-neutral-800 border-neutral-200 hover:border-lothar-yellow hover:bg-yellow-50",
  },
  {
    tipo: "orden_entrega",
    label: "Orden de Entrega",
    desc: "Documento de entrega de máquina al cliente.",
    icon: Truck,
    color: "bg-white text-neutral-800 border-neutral-200 hover:border-lothar-yellow hover:bg-yellow-50",
  },
];

const PROVINCIAS = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba",
  "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja",
  "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan",
  "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero",
  "Tierra del Fuego", "Tucumán"
];

/* ─── Componentes de campo ─── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">{label}</span>
      {children}
    </label>
  );
}
function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-lothar-yellow focus:ring-1 focus:ring-lothar-yellow ${className}`}
      {...props}
    />
  );
}
function Select({ className = "", children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-lothar-yellow focus:ring-1 focus:ring-lothar-yellow ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
function Textarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      className={`w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-lothar-yellow focus:ring-1 focus:ring-lothar-yellow ${className}`}
      {...props}
    />
  );
}

/* ─── Modal principal ─── */
export function NuevaOperacionModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [tipoOperacion, setTipoOperacion] = useState<TipoOperacion | null>(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps: StepKey[] = tipoOperacion ? STEPS_BY_TIPO[tipoOperacion] : [];

  /* Clientes y productos de Supabase */
  const [clientes, setClientes] = useState<ClienteRow[]>([]);
  const [productos, setProductos] = useState<ProductoRow[]>([]);
  const [clienteSearch, setClienteSearch] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteRow | null>(null);

  /* ── Datos del wizard ── */
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteCuit, setClienteCuit] = useState("");
  const [clienteTipo, setClienteTipo] = useState<"persona_fisica" | "persona_juridica">("persona_fisica");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteDireccion, setClienteDireccion] = useState("");
  const [clienteLocalidad, setClienteLocalidad] = useState("");
  const [clienteProvincia, setClienteProvincia] = useState("Córdoba");

  const [items, setItems] = useState<ItemWizard[]>([
    { descripcion_manual: "", cantidad: 1, precio_unitario: 0 }
  ]);

  const [moneda, setMoneda] = useState<"USD" | "ARS">("USD");
  const [descuento, setDescuento] = useState(0);
  const [formaPago, setFormaPago] = useState("");

  const [estado, setEstado] = useState("Cotizacion");
  const [observaciones, setObservaciones] = useState("");

  const [patTipo, setPatTipo] = useState<"fisica" | "juridica">("fisica");
  const [patDni, setPatDni] = useState("");
  const [patProfesion, setPatProfesion] = useState("");
  const [patFechaNac, setPatFechaNac] = useState("");
  const [patLugarNac, setPatLugarNac] = useState("");
  const [patSexo, setPatSexo] = useState("M");
  const [patEstadoCivil, setPatEstadoCivil] = useState("soltero");
  const [patNacionalidad, setPatNacionalidad] = useState("Argentina");
  const [patDomLegalCalle, setPatDomLegalCalle] = useState("");
  const [patDomLegalLocalidad, setPatDomLegalLocalidad] = useState("");
  const [patDomLegalProvincia, setPatDomLegalProvincia] = useState("Córdoba");
  const [patDomLegalCp, setPatDomLegalCp] = useState("");
  const [patDomRealCalle, setPatDomRealCalle] = useState("");
  const [patDomRealLocalidad, setPatDomRealLocalidad] = useState("");
  const [patDomRealProvincia, setPatDomRealProvincia] = useState("Córdoba");
  const [patDomRealCp, setPatDomRealCp] = useState("");
  const [patUso, setPatUso] = useState("Privado");
  const [patRegistro, setPatRegistro] = useState("");
  const [patPersoneria, setPatPersoneria] = useState("");
  const [patFechaInscripcion, setPatFechaInscripcion] = useState("");
  const [patNumInscripcion, setPatNumInscripcion] = useState("");
  const [patActividad, setPatActividad] = useState("");
  const [patRepNombre, setPatRepNombre] = useState("");
  const [patRepDoc, setPatRepDoc] = useState("");

  /* Cargar datos */
  useEffect(() => {
    const supabase = createClient();
    supabase.from("clientes").select("*").is("deleted_at", null).order("nombre_razon_social")
      .then(({ data }) => setClientes((data as ClienteRow[]) ?? []));
    supabase.from("productos").select("*").eq("activo", true).is("deleted_at", null).order("marca")
      .then(({ data }) => setProductos((data as ProductoRow[]) ?? []));
  }, []);

  /* Pre-setear tipo patentamiento según tipo seleccionado */
  useEffect(() => {
    if (tipoOperacion === "patentamiento_fisica") setPatTipo("fisica");
    if (tipoOperacion === "patentamiento_juridica") setPatTipo("juridica");
  }, [tipoOperacion]);

  const clientesFiltrados = clientes.filter(c =>
    c.nombre_razon_social.toLowerCase().includes(clienteSearch.toLowerCase()) ||
    c.cuit.includes(clienteSearch)
  );

  function seleccionarCliente(c: ClienteRow) {
    setClienteSeleccionado(c);
    setClienteNombre(c.nombre_razon_social);
    setClienteCuit(c.cuit);
    setClienteTipo(c.tipo_cliente);
    setClienteTelefono(c.telefono ?? "");
    setClienteEmail(c.email ?? "");
    setClienteDireccion(c.direccion ?? "");
    setClienteLocalidad(c.localidad ?? "");
    setClienteProvincia(c.provincia ?? "Córdoba");
    setClienteSearch("");
  }

  const subtotal = items.reduce((s, i) => s + i.cantidad * i.precio_unitario, 0);
  const total = subtotal - descuento;

  const addItem = () => setItems([...items, { descripcion_manual: "", cantidad: 1, precio_unitario: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof ItemWizard, value: string | number) =>
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  const selectProducto = (i: number, productoId: string) => {
    const p = productos.find(p => p.id === productoId);
    setItems(items.map((item, idx) => idx === i
      ? { ...item, producto_id: p?.id, descripcion_manual: `${p?.marca} ${p?.modelo}`, precio_unitario: p?.precio_lista ?? 0 }
      : item
    ));
  };

  /* Guardar */
  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión activa");

      const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
      if (!profile) throw new Error("Perfil no encontrado");

      let clienteId = clienteSeleccionado?.id;
      if (!clienteId) {
        const { data: newCliente, error: errCliente } = await supabase
          .from("clientes")
          .insert({
            nombre_razon_social: clienteNombre,
            cuit: clienteCuit,
            tipo_cliente: clienteTipo,
            telefono: clienteTelefono,
            email: clienteEmail,
            direccion: clienteDireccion,
            localidad: clienteLocalidad,
            provincia: clienteProvincia,
          })
          .select("id")
          .single();
        if (errCliente) throw new Error(errCliente.message);
        clienteId = newCliente.id;
      }

      const year = new Date().getFullYear();
      const { count } = await supabase.from("operaciones").select("*", { count: "exact", head: true });
      const num = String((count ?? 0) + 1).padStart(4, "0");
      const numero_operacion = `OP-${year}-${num}`;

      const includeProductos = steps.includes("productos");
      const includePatentamiento = steps.includes("patentamiento");

      const { data: op, error: errOp } = await supabase
        .from("operaciones")
        .insert({
          numero_operacion,
          cliente_id: clienteId,
          vendedor_id: profile.id,
          fecha: new Date().toISOString().split("T")[0],
          estado,
          moneda,
          cotizacion_dolar: 1,
          subtotal: includeProductos ? subtotal : 0,
          descuento: includeProductos ? descuento : 0,
          total: includeProductos ? total : 0,
          forma_pago: formaPago,
          observaciones,
        })
        .select("id")
        .single();
      if (errOp) throw new Error(errOp.message);

      if (includeProductos) {
        const itemsToInsert = items
          .filter(i => i.descripcion_manual.trim())
          .map(i => ({
            operacion_id: op.id,
            producto_id: i.producto_id ?? null,
            descripcion_manual: i.descripcion_manual,
            cantidad: i.cantidad,
            precio_unitario: i.precio_unitario,
            subtotal: i.cantidad * i.precio_unitario,
          }));
        if (itemsToInsert.length > 0) {
          const { error: errItems } = await supabase.from("operacion_items").insert(itemsToInsert);
          if (errItems) throw new Error(errItems.message);
        }
      }

      if (includePatentamiento) {
        const datosPat = patTipo === "fisica" ? {
          apellido: clienteNombre.split(",")[0] ?? clienteNombre,
          nombre: clienteNombre.split(",")[1]?.trim() ?? "",
          tipo_doc: "DNI", num_doc: patDni,
          cuit: clienteCuit, nacionalidad: patNacionalidad,
          telefono: clienteTelefono, email: clienteEmail,
          profesion: patProfesion, fecha_nacimiento: patFechaNac,
          lugar_nacimiento: patLugarNac, sexo: patSexo,
          estado_civil: patEstadoCivil,
          dom_legal_calle: patDomLegalCalle, dom_legal_localidad: patDomLegalLocalidad,
          dom_legal_partido: "", dom_legal_cp: patDomLegalCp,
          dom_legal_provincia: patDomLegalProvincia,
          dom_real_calle: patDomRealCalle, dom_real_localidad: patDomRealLocalidad,
          dom_real_partido: "", dom_real_cp: patDomRealCp,
          dom_real_provincia: patDomRealProvincia,
          uso_maquinaria: patUso, registro_inscripcion: patRegistro,
        } : {
          razon_social: clienteNombre, cuit: clienteCuit,
          personeria_juridica: patPersoneria,
          fecha_inscripcion: patFechaInscripcion, num_inscripcion: patNumInscripcion,
          telefono: clienteTelefono, email: clienteEmail,
          actividad_principal: patActividad,
          porcentaje_titularidad: "100%", cantidad_apoderados: "1",
          uso_maquinaria: patUso,
          emp_dom_legal_calle: patDomLegalCalle, emp_dom_legal_localidad: patDomLegalLocalidad,
          emp_dom_legal_partido: "", emp_dom_legal_cp: patDomLegalCp,
          emp_dom_legal_provincia: patDomLegalProvincia,
          emp_dom_real_calle: patDomRealCalle, emp_dom_real_localidad: patDomRealLocalidad,
          emp_dom_real_partido: "", emp_dom_real_cp: patDomRealCp,
          emp_dom_real_provincia: patDomRealProvincia,
          rep_apellido_nombre: patRepNombre, rep_tipo_doc: "DNI",
          rep_num_doc: patRepDoc, rep_cuit: "", rep_nacionalidad: "Argentina",
          rep_telefono: clienteTelefono, rep_email: clienteEmail,
          rep_profesion: "", rep_fecha_nacimiento: "", rep_lugar_nacimiento: "",
          rep_sexo: "M", rep_estado_civil: "soltero",
          rep_dom_legal_calle: "", rep_dom_legal_localidad: "", rep_dom_legal_partido: "",
          rep_dom_legal_cp: "", rep_dom_legal_provincia: "Córdoba",
          rep_dom_real_calle: "", rep_dom_real_localidad: "", rep_dom_real_partido: "",
          rep_dom_real_cp: "", rep_dom_real_provincia: "Córdoba",
          registro_inscripcion: patRegistro,
        };

        await supabase.from("patentamientos").insert({
          operacion_id: op.id,
          tipo_persona: patTipo,
          datos_json: datosPat,
        });
      }

      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }, [
    steps, clienteSeleccionado, clienteNombre, clienteCuit, clienteTipo, clienteTelefono,
    clienteEmail, clienteDireccion, clienteLocalidad, clienteProvincia,
    items, moneda, descuento, formaPago, estado, observaciones, subtotal, total,
    patTipo, patDni, patProfesion, patFechaNac, patLugarNac, patSexo, patEstadoCivil,
    patNacionalidad, patDomLegalCalle, patDomLegalLocalidad, patDomLegalProvincia,
    patDomLegalCp, patDomRealCalle, patDomRealLocalidad, patDomRealProvincia, patDomRealCp,
    patUso, patRegistro, patPersoneria, patFechaInscripcion, patNumInscripcion,
    patActividad, patRepNombre, patRepDoc, onCreated, onClose
  ]);

  const fmt = (n: number) => new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2 }).format(n);
  const currentStepKey = steps[step];

  /* ─── Render ─── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex h-full max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-950">Nueva Operación</h2>
            {tipoOperacion ? (
              <p className="text-xs text-neutral-500">
                {TIPO_OPTIONS.find(t => t.tipo === tipoOperacion)?.label} · Paso {step + 1} de {steps.length} — {STEP_LABELS[currentStepKey]}
              </p>
            ) : (
              <p className="text-xs text-neutral-500">Elegí qué tipo de operación querés cargar</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {tipoOperacion && (
              <button
                onClick={() => { setTipoOperacion(null); setStep(0); }}
                className="rounded-md px-3 py-1.5 text-xs font-semibold text-neutral-500 hover:bg-neutral-100"
              >
                ← Cambiar tipo
              </button>
            )}
            <button onClick={onClose} className="rounded-md p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Steps tabs (solo cuando hay tipo seleccionado) */}
        {tipoOperacion && (
          <div className="shrink-0 border-b border-neutral-100 px-6 py-3">
            <div className="flex gap-1">
              {steps.map((s, i) => (
                <button
                  key={s}
                  onClick={() => i < step && setStep(i)}
                  className={`flex h-8 flex-1 items-center justify-center rounded-md text-xs font-bold transition
                    ${i === step ? "bg-lothar-yellow text-lothar-black" :
                      i < step ? "bg-green-100 text-green-700 cursor-pointer" :
                      "bg-neutral-100 text-neutral-400 cursor-default"}`}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  <span className="ml-1 hidden sm:inline">{STEP_LABELS[s]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── PANTALLA 0: Selector de tipo ── */}
          {!tipoOperacion && (
            <div className="grid gap-3 sm:grid-cols-2">
              {TIPO_OPTIONS.map(({ tipo, label, desc, icon: Icon, color }) => (
                <button
                  key={tipo}
                  onClick={() => { setTipoOperacion(tipo); setStep(0); }}
                  className={`flex items-start gap-4 rounded-xl border-2 p-4 text-left transition ${color}`}
                >
                  <div className="mt-0.5 shrink-0 rounded-lg bg-black/10 p-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold">{label}</p>
                    <p className="mt-0.5 text-xs opacity-70">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── PASO: Cliente ── */}
          {tipoOperacion && currentStepKey === "cliente" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  className="pl-9"
                  placeholder="Buscar cliente existente por nombre o CUIT..."
                  value={clienteSearch}
                  onChange={e => setClienteSearch(e.target.value)}
                />
                {clienteSearch && clientesFiltrados.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-lg">
                    {clientesFiltrados.slice(0, 6).map(c => (
                      <button key={c.id} onClick={() => seleccionarCliente(c)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-lothar-yellow text-sm font-black">
                          {c.nombre_razon_social[0]}
                        </span>
                        <div>
                          <p className="text-sm font-semibold">{c.nombre_razon_social}</p>
                          <p className="text-xs text-neutral-500">{c.cuit} · {c.tipo_cliente === "persona_fisica" ? "Persona Física" : "Persona Jurídica"}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {clienteSeleccionado && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
                  <Check className="h-4 w-4" />
                  <span>Cliente seleccionado: <strong>{clienteSeleccionado.nombre_razon_social}</strong></span>
                  <button onClick={() => setClienteSeleccionado(null)} className="ml-auto text-green-500 hover:text-green-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {clienteSeleccionado ? "Datos del cliente (editables)" : "O completá los datos del nuevo cliente"}
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre / Razón Social">
                  <Input value={clienteNombre} onChange={e => setClienteNombre(e.target.value)} placeholder="Agro Norte S.A." />
                </Field>
                <Field label="CUIT">
                  <Input value={clienteCuit} onChange={e => setClienteCuit(e.target.value)} placeholder="30-12345678-9" />
                </Field>
                <Field label="Tipo">
                  <Select value={clienteTipo} onChange={e => setClienteTipo(e.target.value as "persona_fisica" | "persona_juridica")}>
                    <option value="persona_fisica">Persona Física</option>
                    <option value="persona_juridica">Persona Jurídica</option>
                  </Select>
                </Field>
                <Field label="Teléfono">
                  <Input value={clienteTelefono} onChange={e => setClienteTelefono(e.target.value)} placeholder="+54 9 351..." />
                </Field>
                <Field label="Email">
                  <Input type="email" value={clienteEmail} onChange={e => setClienteEmail(e.target.value)} placeholder="cliente@empresa.com" />
                </Field>
                <Field label="Provincia">
                  <Select value={clienteProvincia} onChange={e => setClienteProvincia(e.target.value)}>
                    {PROVINCIAS.map(p => <option key={p}>{p}</option>)}
                  </Select>
                </Field>
                <Field label="Localidad">
                  <Input value={clienteLocalidad} onChange={e => setClienteLocalidad(e.target.value)} placeholder="Jesús María" />
                </Field>
                <Field label="Dirección">
                  <Input value={clienteDireccion} onChange={e => setClienteDireccion(e.target.value)} placeholder="Av. Colón 1234" />
                </Field>
              </div>
            </div>
          )}

          {/* ── PASO: Productos ── */}
          {tipoOperacion && currentStepKey === "productos" && (
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="rounded-xl border border-neutral-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-neutral-500">Ítem {i + 1}</span>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(i)} className="text-neutral-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Producto del catálogo (opcional)">
                      <Select value={item.producto_id ?? ""} onChange={e => selectProducto(i, e.target.value)}>
                        <option value="">— Seleccionar producto —</option>
                        {productos.map(p => (
                          <option key={p.id} value={p.id}>{p.marca} {p.modelo}</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Descripción">
                      <Input value={item.descripcion_manual} onChange={e => updateItem(i, "descripcion_manual", e.target.value)}
                        placeholder="Mahindra 717H con pala frontal" />
                    </Field>
                    <Field label="Cantidad">
                      <Input type="number" min="1" step="0.01" value={item.cantidad}
                        onChange={e => updateItem(i, "cantidad", parseFloat(e.target.value) || 1)} />
                    </Field>
                    <Field label="Precio Unitario">
                      <Input type="number" min="0" step="0.01" value={item.precio_unitario}
                        onChange={e => updateItem(i, "precio_unitario", parseFloat(e.target.value) || 0)} />
                    </Field>
                  </div>
                  <p className="mt-2 text-right text-sm font-bold text-neutral-700">
                    Subtotal: {moneda} {fmt(item.cantidad * item.precio_unitario)}
                  </p>
                </div>
              ))}
              <button onClick={addItem}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 py-3 text-sm font-semibold text-neutral-500 hover:border-lothar-yellow hover:text-lothar-black">
                <Plus className="h-4 w-4" /> Agregar ítem
              </button>
            </div>
          )}

          {/* ── PASO: Comercial ── */}
          {tipoOperacion && currentStepKey === "comercial" && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Moneda">
                  <Select value={moneda} onChange={e => setMoneda(e.target.value as "USD" | "ARS")}>
                    <option value="USD">USD — Dólares</option>
                    <option value="ARS">ARS — Pesos</option>
                  </Select>
                </Field>
                <Field label="Descuento">
                  <Input type="number" min="0" step="0.01" value={descuento}
                    onChange={e => setDescuento(parseFloat(e.target.value) || 0)} />
                </Field>
              </div>
              <Field label="Forma de Pago">
                <Textarea value={formaPago} onChange={e => setFormaPago(e.target.value)}
                  placeholder="50% anticipo, saldo contra entrega. Cheques a nombre de IMPERIO MAC S.A." />
              </Field>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Subtotal</span><span className="font-semibold">{moneda} {fmt(subtotal)}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm text-neutral-600">
                  <span>Descuento</span><span className="font-semibold text-red-600">- {moneda} {fmt(descuento)}</span>
                </div>
                <div className="mt-3 flex justify-between border-t border-neutral-200 pt-3 text-base font-bold">
                  <span>Total</span><span className="text-lg">{moneda} {fmt(total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── PASO: Contrato ── */}
          {tipoOperacion && currentStepKey === "contrato" && (
            <div className="space-y-4">
              <Field label="Estado inicial de la operación">
                <Select value={estado} onChange={e => setEstado(e.target.value)}>
                  <option value="Cotizacion">Cotización</option>
                  <option value="Reservada">Reservada</option>
                  <option value="Vendida">Vendida</option>
                </Select>
              </Field>
              <Field label="Observaciones">
                <Textarea value={observaciones} onChange={e => setObservaciones(e.target.value)}
                  placeholder="Notas adicionales sobre la operación..." />
              </Field>
            </div>
          )}

          {/* ── PASO: Patentamiento ── */}
          {tipoOperacion && currentStepKey === "patentamiento" && (
            <div className="space-y-4">
              {tipoOperacion === "completa" && (
                <Field label="Tipo de persona">
                  <Select value={patTipo} onChange={e => setPatTipo(e.target.value as "fisica" | "juridica")}>
                    <option value="fisica">Persona Física</option>
                    <option value="juridica">Persona Jurídica</option>
                  </Select>
                </Field>
              )}

              {patTipo === "fisica" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="N° de Documento (DNI)"><Input value={patDni} onChange={e => setPatDni(e.target.value)} placeholder="12345678" /></Field>
                  <Field label="Nacionalidad"><Input value={patNacionalidad} onChange={e => setPatNacionalidad(e.target.value)} /></Field>
                  <Field label="Profesión / Actividad"><Input value={patProfesion} onChange={e => setPatProfesion(e.target.value)} /></Field>
                  <Field label="Fecha de Nacimiento"><Input type="date" value={patFechaNac} onChange={e => setPatFechaNac(e.target.value)} /></Field>
                  <Field label="Lugar de Nacimiento"><Input value={patLugarNac} onChange={e => setPatLugarNac(e.target.value)} /></Field>
                  <Field label="Sexo">
                    <Select value={patSexo} onChange={e => setPatSexo(e.target.value)}>
                      <option value="M">M</option><option value="F">F</option>
                    </Select>
                  </Field>
                  <Field label="Estado Civil">
                    <Select value={patEstadoCivil} onChange={e => setPatEstadoCivil(e.target.value)}>
                      <option value="soltero">Soltero/a</option>
                      <option value="casado">Casado/a</option>
                      <option value="divorciado">Divorciado/a</option>
                      <option value="viudo">Viudo/a</option>
                    </Select>
                  </Field>
                  <div className="sm:col-span-2"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">Domicilio Legal (DNI)</p></div>
                  <Field label="Calle y N°"><Input value={patDomLegalCalle} onChange={e => setPatDomLegalCalle(e.target.value)} /></Field>
                  <Field label="Localidad"><Input value={patDomLegalLocalidad} onChange={e => setPatDomLegalLocalidad(e.target.value)} /></Field>
                  <Field label="Código Postal"><Input value={patDomLegalCp} onChange={e => setPatDomLegalCp(e.target.value)} /></Field>
                  <Field label="Provincia">
                    <Select value={patDomLegalProvincia} onChange={e => setPatDomLegalProvincia(e.target.value)}>
                      {PROVINCIAS.map(p => <option key={p}>{p}</option>)}
                    </Select>
                  </Field>
                  <div className="sm:col-span-2"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">Domicilio Real (actual)</p></div>
                  <Field label="Calle y N°"><Input value={patDomRealCalle} onChange={e => setPatDomRealCalle(e.target.value)} /></Field>
                  <Field label="Localidad"><Input value={patDomRealLocalidad} onChange={e => setPatDomRealLocalidad(e.target.value)} /></Field>
                  <Field label="Código Postal"><Input value={patDomRealCp} onChange={e => setPatDomRealCp(e.target.value)} /></Field>
                  <Field label="Provincia">
                    <Select value={patDomRealProvincia} onChange={e => setPatDomRealProvincia(e.target.value)}>
                      {PROVINCIAS.map(p => <option key={p}>{p}</option>)}
                    </Select>
                  </Field>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Personería Jurídica otorgada por"><Input value={patPersoneria} onChange={e => setPatPersoneria(e.target.value)} placeholder="IGJ / Dir. Prov. / AFIP" /></Field>
                  <Field label="Fecha de Inscripción"><Input type="date" value={patFechaInscripcion} onChange={e => setPatFechaInscripcion(e.target.value)} /></Field>
                  <Field label="N° Inscripción"><Input value={patNumInscripcion} onChange={e => setPatNumInscripcion(e.target.value)} /></Field>
                  <Field label="Actividad Principal"><Input value={patActividad} onChange={e => setPatActividad(e.target.value)} /></Field>
                  <div className="sm:col-span-2"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">Domicilio Legal empresa</p></div>
                  <Field label="Calle y N°"><Input value={patDomLegalCalle} onChange={e => setPatDomLegalCalle(e.target.value)} /></Field>
                  <Field label="Localidad"><Input value={patDomLegalLocalidad} onChange={e => setPatDomLegalLocalidad(e.target.value)} /></Field>
                  <Field label="Código Postal"><Input value={patDomLegalCp} onChange={e => setPatDomLegalCp(e.target.value)} /></Field>
                  <Field label="Provincia">
                    <Select value={patDomLegalProvincia} onChange={e => setPatDomLegalProvincia(e.target.value)}>
                      {PROVINCIAS.map(p => <option key={p}>{p}</option>)}
                    </Select>
                  </Field>
                  <div className="sm:col-span-2"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">Representante Legal</p></div>
                  <Field label="Apellido y Nombre del Representante"><Input value={patRepNombre} onChange={e => setPatRepNombre(e.target.value)} /></Field>
                  <Field label="N° Documento del Representante"><Input value={patRepDoc} onChange={e => setPatRepDoc(e.target.value)} /></Field>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Uso de la Maquinaria">
                  <Select value={patUso} onChange={e => setPatUso(e.target.value)}>
                    <option value="Privado">Privado</option>
                    <option value="Oficial">Oficial</option>
                    <option value="Público">Público</option>
                    <option value="Agropecuario">Agropecuario</option>
                  </Select>
                </Field>
                <Field label="Registro de Inscripción (Provincia y Localidad)">
                  <Input value={patRegistro} onChange={e => setPatRegistro(e.target.value)} placeholder="Córdoba — Jesús María" />
                </Field>
              </div>
            </div>
          )}

          {/* ── PASO: Resumen ── */}
          {tipoOperacion && currentStepKey === "resumen" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-neutral-200 p-5 space-y-3">
                <h3 className="font-bold text-neutral-950">Resumen de la operación</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-neutral-500">Tipo</span><span className="font-semibold">{TIPO_OPTIONS.find(t => t.tipo === tipoOperacion)?.label}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Cliente</span><span className="font-semibold">{clienteNombre}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">CUIT</span><span className="font-semibold">{clienteCuit}</span></div>
                  {steps.includes("contrato") && (
                    <div className="flex justify-between"><span className="text-neutral-500">Estado</span><span className="font-semibold">{estado}</span></div>
                  )}
                  {steps.includes("productos") && (
                    <>
                      <div className="flex justify-between"><span className="text-neutral-500">Moneda</span><span className="font-semibold">{moneda}</span></div>
                      <div className="flex justify-between"><span className="text-neutral-500">Ítems</span><span className="font-semibold">{items.filter(i => i.descripcion_manual).length}</span></div>
                      <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-bold">
                        <span>Total</span><span>{moneda} {fmt(total)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {steps.includes("productos") && (
                <div className="rounded-xl border border-neutral-200 p-5">
                  <h3 className="mb-3 font-bold text-neutral-950">Ítems</h3>
                  {items.filter(i => i.descripcion_manual).map((item, i) => (
                    <div key={i} className="flex justify-between py-1 text-sm">
                      <span>{item.cantidad}x {item.descripcion_manual}</span>
                      <span className="font-semibold">{moneda} {fmt(item.cantidad * item.precio_unitario)}</span>
                    </div>
                  ))}
                </div>
              )}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}
            </div>
          )}
        </div>

        {/* Footer nav */}
        {tipoOperacion && (
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
                disabled={currentStepKey === "cliente" && !clienteNombre.trim()}
                className="flex items-center gap-2 rounded-lg bg-lothar-yellow px-5 py-2 text-sm font-bold text-lothar-black transition hover:bg-yellow-400 disabled:opacity-40"
              >
                Siguiente <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-lothar-yellow px-5 py-2 text-sm font-bold text-lothar-black transition hover:bg-yellow-400 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Guardando..." : "Crear Operación"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
