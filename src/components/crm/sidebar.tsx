"use client";

import { BarChart3, FileText, Gauge, LogOut, Settings, Tractor, Users, Ticket } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

const items: { label: string; icon: typeof Gauge; href: Route }[] = [
  { label: "Dashboard",    icon: Gauge,    href: "/"             },
  { label: "Operaciones",  icon: BarChart3, href: "/operaciones" },
  { label: "Clientes",     icon: Users,     href: "/clientes"    },
  { label: "Máquinas",     icon: Tractor,   href: "/productos"   },
  { label: "Documentos",   icon: FileText,  href: "/documentos"  },
  { label: "Tickets",      icon: Ticket,    href: "/tickets"     },
  { label: "Configuración",icon: Settings,  href: "/configuracion"}
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email ?? "");
        // Intentar obtener el nombre del perfil
        supabase
          .from("profiles")
          .select("nombre")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile?.nombre) setUserName(profile.nombre);
            else setUserName(data.user!.email?.split("@")[0] ?? "Usuario");
          });
      }
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden w-72 shrink-0 border-r border-neutral-200 bg-white px-5 py-6 lg:flex lg:flex-col">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-md bg-lothar-yellow text-lg font-black text-lothar-black">
          L
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-900">Lothar</p>
          <p className="text-xs text-neutral-500">CRM Comercial</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="space-y-1">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(String(item.href)));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950",
                active && "bg-lothar-yellow text-lothar-black hover:bg-lothar-yellow"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Usuario + Logout */}
      <div className="mt-auto">
        <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lothar-yellow text-sm font-black text-lothar-black">
            {userName ? userName[0].toUpperCase() : "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-neutral-900">{userName || "—"}</p>
            <p className="truncate text-xs text-neutral-500">{userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="ml-auto shrink-0 rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-200 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
