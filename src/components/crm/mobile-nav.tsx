"use client";

import { BarChart3, FileText, Gauge, Settings, Tractor, Ticket, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

const items: { label: string; icon: typeof Gauge; href: Route }[] = [
  { label: "Panel",      icon: Gauge,     href: "/" },
  { label: "Operac.",    icon: BarChart3,  href: "/operaciones" },
  { label: "Clientes",   icon: Users,      href: "/clientes" },
  { label: "Docs",       icon: FileText,   href: "/documentos" },
  { label: "Tickets",    icon: Ticket,     href: "/tickets" },
  { label: "Config.",    icon: Settings,   href: "/configuracion" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-2 bottom-2 z-30 grid grid-cols-6 rounded-xl border border-neutral-200 bg-white/95 p-1 shadow-lg backdrop-blur lg:hidden">
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex h-12 flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-semibold transition-colors ${
              active ? "bg-lothar-yellow text-lothar-black" : "text-neutral-500 hover:bg-neutral-50"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
