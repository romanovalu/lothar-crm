import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/crm/sidebar";
import { MobileNav } from "@/components/crm/mobile-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lothar CRM Comercial",
  description: "CRM comercial SaaS para Lothar Maquinaria"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body className="flex min-h-screen bg-neutral-50 text-neutral-950 antialiased">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
