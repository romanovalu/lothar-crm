"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) { setError("El nombre es requerido"); return; }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }

    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Crear perfil con aprobado = false (via API route con service role, bypassa RLS)
    if (data.user) {
      await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: data.user.id, nombre }),
      });
    }

    setLoading(false);
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-lothar-black px-4">
        <div className="w-full max-w-md rounded-2xl bg-neutral-900 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lothar-yellow text-3xl">
            ⏳
          </div>
          <h1 className="mb-2 text-xl font-bold text-white">Solicitud enviada</h1>
          <p className="text-sm text-neutral-400">
            Tu cuenta fue creada y está pendiente de aprobación por un administrador.
            Te avisarán cuando puedas ingresar.
          </p>
          <a href="/login"
            className="mt-6 block rounded-lg bg-lothar-yellow py-2.5 text-sm font-bold text-lothar-black transition hover:bg-yellow-400">
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-lothar-black px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-lothar-yellow">
            <span className="text-2xl font-black text-lothar-black">L</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-lothar-yellow">Lothar Maquinaria</p>
          <p className="text-xs text-neutral-500">CRM Comercial</p>
        </div>

        <div className="rounded-2xl bg-neutral-900 p-8 shadow-2xl">
          <h1 className="mb-1 text-xl font-bold text-white">Crear cuenta</h1>
          <p className="mb-6 text-sm text-neutral-400">Completá tus datos para solicitar acceso</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Nombre completo</label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Juan Pérez"
                required
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-lothar-yellow"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vendedor@lothar.com.ar"
                required
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-lothar-yellow"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-lothar-yellow"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-400">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-lothar-yellow py-3 text-sm font-bold text-lothar-black transition hover:bg-yellow-400 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Enviando solicitud..." : "Solicitar acceso"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-neutral-500">
            ¿Ya tenés cuenta?{" "}
            <a href="/login" className="text-lothar-yellow hover:underline">Iniciá sesión</a>
          </p>
        </div>
      </div>
    </div>
  );
}
