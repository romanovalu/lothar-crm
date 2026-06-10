"use client";

import { BarChart3, FileText, Gauge, Tractor, Users, Ticket } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

const items: { label: string; icon: typeof Gauge; href: Route }[] = [
  { label: "Panel", icon: Gauge, href: "/" },
  { label: "Operaciones", icon: BarChart3, href: "/operaciones" },
  { label: "Clientes", icon: Users, href: "/clientes" },
  { label: "Máquinas", icon: Tractor, href: "/productos" },
  { label: "Docs",    icon: FileText, href: "/documentos" },
  { label: "Tickets", icon: Ticket,   href: "/tickets"   }
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-6 rounded-lg border border-neutral-200 bg-white p-1 shadow-lg lg:hidden">
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-semibold transition-colors ${
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
