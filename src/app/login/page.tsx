"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    // Verificar si el usuario está aprobado
    const { data: profile } = await supabase
      .from("profiles")
      .select("aprobado")
      .eq("id", data.user.id)
      .single();

    if (!profile?.aprobado) {
      await supabase.auth.signOut();
      setError("Tu cuenta está pendiente de aprobación por un administrador.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-xl bg-lothar-yellow text-2xl font-black text-lothar-black shadow-lg">
            L
          </div>
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-lothar-yellow">Lothar Maquinaria</p>
            <p className="text-xs text-neutral-500">CRM Comercial</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl">
          <h1 className="mb-1 text-xl font-bold text-white">Iniciar sesión</h1>
          <p className="mb-6 text-sm text-neutral-400">Ingresá con tu cuenta de vendedor</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="vendedor@lothar.com.ar"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition focus:border-lothar-yellow focus:ring-1 focus:ring-lothar-yellow"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 pr-11 text-sm text-white placeholder-neutral-600 outline-none transition focus:border-lothar-yellow focus:ring-1 focus:ring-lothar-yellow"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-lothar-yellow py-3 text-sm font-bold text-lothar-black transition hover:bg-yellow-400 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500">
          ¿No tenés cuenta?{" "}
          <a href="/register" className="text-lothar-yellow hover:underline">Solicitá acceso</a>
        </p>
      </div>
    </div>
  );
}
