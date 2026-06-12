"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Pencil, X, ShieldCheck, UserCog, UserPlus, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { AREA_LABELS } from "@/types/tickets";
import type { TicketArea } from "@/types/tickets";

interface Profile {
  id: string;
  nombre: string;
  role: "administrador" | "jefe_area" | "vendedor";
  area_responsable: string | null;
  aprobado: boolean;
  email?: string;
}

const AREAS_OPTIONS: { value: string; label: string }[] = [
  { value: "",               label: "— Sin área asignada —" },
  { value: "compras",        label: "🛒 Compras" },
  { value: "postventa",      label: "🔧 Postventa" },
  { value: "marketing",      label: "📣 Marketing" },
  { value: "fabrica",        label: "🏭 Fábrica" },
  { value: "administracion", label: "🧾 Administración" },
];

function EditUserRow({
  profile,
  onSaved,
  currentUserId,
}: {
  profile: Profile;
  onSaved: () => void;
  currentUserId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [nombre, setNombre] = useState(profile.nombre);
  const [role, setRole] = useState(profile.role);
  const [area, setArea] = useState(profile.area_responsable ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({
      nombre,
      role,
      area_responsable: area || null,
      updated_at: new Date().toISOString(),
    }).eq("id", profile.id);
    setSaving(false);
    setEditing(false);
    onSaved();
  }

  function handleCancel() {
    setNombre(profile.nombre);
    setRole(profile.role);
    setArea(profile.area_responsable ?? "");
    setEditing(false);
  }

  const isSelf = profile.id === currentUserId;

  return (
    <div className={`flex flex-col gap-3 border-b border-neutral-100 px-5 py-4 last:border-0 sm:flex-row sm:items-center
      ${editing ? "bg-yellow-50" : ""}`}>

      {/* Avatar + info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lothar-yellow text-sm font-black text-lothar-black">
          {(nombre || profile.nombre)[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="min-w-0">
          {editing ? (
            <input
              className="w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-semibold outline-none focus:border-lothar-yellow"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
            />
          ) : (
            <p className="truncate text-sm font-semibold text-neutral-900">
              {profile.nombre}
              {isSelf && <span className="ml-2 text-xs text-neutral-400">(vos)</span>}
            </p>
          )}
          {profile.email && (
            <p className="truncate text-xs text-neutral-500">{profile.email}</p>
          )}
        </div>
      </div>

      {/* Rol */}
      <div className="shrink-0">
        {editing ? (
          <select
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm outline-none focus:border-lothar-yellow"
            value={role}
            onChange={e => setRole(e.target.value as "administrador" | "jefe_area" | "vendedor")}
          >
            <option value="vendedor">Vendedor / Asistente</option>
            <option value="jefe_area">Jefe de área</option>
            <option value="administrador">Administrador</option>
          </select>
        ) : (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold
            ${profile.role === "administrador" ? "bg-lothar-yellow text-lothar-black"
            : profile.role === "jefe_area" ? "bg-blue-100 text-blue-700"
            : "bg-neutral-100 text-neutral-600"}`}>
            {profile.role === "administrador"
              ? <><ShieldCheck className="h-3 w-3" /> Administrador</>
              : profile.role === "jefe_area"
              ? <><UserCog className="h-3 w-3" /> Jefe de área</>
              : <><UserCog className="h-3 w-3" /> Vendedor</>}
          </span>
        )}
      </div>

      {/* Área responsable */}
      <div className="w-full sm:w-auto sm:min-w-[160px] shrink-0">
        {editing ? (
          <select
            className="w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm outline-none focus:border-lothar-yellow"
            value={area}
            onChange={e => setArea(e.target.value)}
          >
            {AREAS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ) : (
          <span className="text-sm text-neutral-600">
            {profile.area_responsable
              ? AREAS_OPTIONS.find(o => o.value === profile.area_responsable)?.label ?? profile.area_responsable
              : <span className="text-neutral-400">Sin área</span>}
          </span>
        )}
      </div>

      {/* Acciones */}
      <div className="flex shrink-0 gap-2">
        {editing ? (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-lothar-yellow px-3 py-1.5 text-xs font-bold text-lothar-black transition hover:bg-yellow-400 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Guardar
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
            >
              <X className="h-3.5 w-3.5" /> Cancelar
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
          >
            <Pencil className="h-3.5 w-3.5" /> Editar
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Modal invitar usuario ── */
function InvitarModal({ onClose, onInvited }: { onClose: () => void; onInvited: () => void }) {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [role, setRole] = useState("vendedor");
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleInvite() {
    if (!email || !nombre) { setError("Email y nombre son requeridos."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nombre, role, area_responsable: area || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al invitar");
      setSuccess(true);
      setTimeout(() => { onInvited(); onClose(); }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="w-full rounded-t-2xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-950">Invitar usuario</h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100"><X className="h-4 w-4" /></button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6 text-green-600">
            <Check className="h-10 w-10" />
            <p className="font-semibold">Invitación enviada a {email}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Nombre completo *</label>
              <input className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-lothar-yellow"
                value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Juan Pérez" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Email *</label>
              <input type="email" className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-lothar-yellow"
                value={email} onChange={e => setEmail(e.target.value)} placeholder="juan@lothar.com.ar" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Rol</label>
                <select className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-lothar-yellow"
                  value={role} onChange={e => setRole(e.target.value)}>
                  <option value="vendedor">Vendedor / Asistente</option>
                  <option value="jefe_area">Jefe de área</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Área responsable</label>
                <select className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-lothar-yellow"
                  value={area} onChange={e => setArea(e.target.value)}>
                  {AREAS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <p className="text-xs text-neutral-400">
              El usuario recibirá un email para crear su contraseña y acceder al CRM.
            </p>
            <button onClick={handleInvite} disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-lothar-yellow py-2.5 text-sm font-bold text-lothar-black transition hover:bg-yellow-400 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {loading ? "Enviando invitación..." : "Enviar invitación"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfiguracionModule() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState<string>("vendedor");
  const [showInvitar, setShowInvitar] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      setCurrentUserRole(me?.role ?? "vendedor");
    }

    const { data } = await supabase
      .from("profiles")
      .select("id, nombre, role, area_responsable, aprobado")
      .order("aprobado", { ascending: true })
      .order("nombre");

    setProfiles((data as Profile[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const esAdmin = currentUserRole === "administrador";

  const pendientes = profiles.filter(p => !p.aprobado);
  const aprobados = profiles.filter(p => p.aprobado);

  async function aprobarUsuario(id: string) {
    const supabase = createClient();
    await supabase.from("profiles").update({ aprobado: true }).eq("id", id);
    fetchProfiles();
  }

  async function rechazarUsuario(id: string) {
    const supabase = createClient();
    await supabase.from("profiles").delete().eq("id", id);
    fetchProfiles();
  }

  // Resumen de cobertura de áreas
  const areasConResponsable = new Set(aprobados.map(p => p.area_responsable).filter(Boolean));
  const areasSinCobertura = (Object.keys(AREA_LABELS) as TicketArea[]).filter(a => !areasConResponsable.has(a));

  return (
    <main className="min-h-screen flex-1 overflow-auto pb-24 lg:pb-0">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">

        {/* Header */}
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">Lothar Maquinaria</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">Configuración</h1>
        </header>

        {/* Alerta si hay áreas sin responsable */}
        {esAdmin && areasSinCobertura.length > 0 && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 px-5 py-4">
            <p className="text-sm font-semibold text-orange-800">
              ⚠️ Áreas sin responsable asignado:{" "}
              <span className="font-bold">
                {areasSinCobertura.map(a => AREA_LABELS[a]).join(", ")}
              </span>
            </p>
            <p className="mt-1 text-xs text-orange-600">
              Los tickets enviados a estas áreas no tendrán un responsable que los gestione.
              Asigná un responsable editando el usuario correspondiente.
            </p>
          </div>
        )}

        {/* Usuarios pendientes de aprobación */}
        {esAdmin && pendientes.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <h2 className="text-base font-bold text-neutral-900">Solicitudes pendientes</h2>
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-600">{pendientes.length}</span>
            </div>
            <div className="rounded-xl border border-orange-200 bg-white overflow-hidden">
              {pendientes.map(p => (
                <div key={p.id} className="flex flex-col gap-3 border-b border-neutral-100 px-5 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-100 text-sm font-black text-orange-600">
                      {p.nombre[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{p.nombre}</p>
                      <p className="text-xs text-neutral-400">Pendiente de aprobación</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => aprobarUsuario(p.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700 transition hover:bg-green-200">
                      <Check className="h-3.5 w-3.5" /> Aprobar
                    </button>
                    <button onClick={() => rechazarUsuario(p.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-200">
                      <X className="h-3.5 w-3.5" /> Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Usuarios */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900">Usuarios del sistema</h2>
            {esAdmin ? (
              <button onClick={() => setShowInvitar(true)}
                className="flex items-center gap-2 rounded-lg bg-lothar-yellow px-4 py-2 text-sm font-bold text-lothar-black transition hover:bg-yellow-400">
                <UserPlus className="h-4 w-4" /> Invitar usuario
              </button>
            ) : (
              <span className="text-xs text-neutral-400">Solo administradores pueden editar usuarios</span>
            )}
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
            {/* Cabecera */}
            <div className="hidden border-b border-neutral-100 bg-neutral-50 px-5 py-3 sm:grid sm:grid-cols-[1fr_140px_160px_100px] sm:gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Usuario</span>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Rol</span>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Área responsable</span>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400"></span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
              </div>
            ) : aprobados.length === 0 ? (
              <div className="py-12 text-center text-sm text-neutral-400">No hay usuarios.</div>
            ) : (
              aprobados.map(p => (
                esAdmin ? (
                  <EditUserRow
                    key={p.id}
                    profile={p}
                    onSaved={fetchProfiles}
                    currentUserId={currentUserId}
                  />
                ) : (
                  // Vista de solo lectura para no-admins
                  <div key={p.id} className="flex flex-col gap-2 border-b border-neutral-100 px-5 py-4 last:border-0 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lothar-yellow text-sm font-black">
                        {p.nombre[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {p.nombre}
                          {p.id === currentUserId && <span className="ml-2 text-xs text-neutral-400">(vos)</span>}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold
                      ${p.role === "administrador" ? "bg-lothar-yellow text-lothar-black"
                      : p.role === "jefe_area" ? "bg-blue-100 text-blue-700"
                      : "bg-neutral-100 text-neutral-600"}`}>
                      {p.role === "administrador" ? "Administrador" : p.role === "jefe_area" ? "Jefe de área" : "Vendedor"}
                    </span>
                    <span className="text-sm text-neutral-500">
                      {p.area_responsable
                        ? AREAS_OPTIONS.find(o => o.value === p.area_responsable)?.label
                        : <span className="text-neutral-400">Sin área</span>}
                    </span>
                  </div>
                )
              ))
            )}
          </div>
        </section>

        {/* Info sobre permisos */}
        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 space-y-3">
          <h3 className="text-sm font-bold text-neutral-800">¿Cómo funcionan los permisos?</h3>
          <div className="space-y-2 text-sm text-neutral-600">
            <div className="flex gap-3">
              <span className="shrink-0 font-bold text-lothar-black">Todos</span>
              <span>pueden crear tickets para cualquier área.</span>
            </div>
            <div className="flex gap-3">
              <span className="shrink-0 font-bold text-blue-700">Jefe de área</span>
              <span>ve y gestiona los tickets de su área asignada.</span>
            </div>
            <div className="flex gap-3">
              <span className="shrink-0 font-bold text-lothar-black">Administrador</span>
              <span>ve y gestiona todos los tickets de todas las áreas.</span>
            </div>
          </div>
        </section>

      </div>

      {showInvitar && (
        <InvitarModal
          onClose={() => setShowInvitar(false)}
          onInvited={fetchProfiles}
        />
      )}
    </main>
  );
}
