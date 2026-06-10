import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { renderOfficialProformaHtml } from "@/lib/proforma-html";
import { renderBoletoHtml } from "@/lib/boleto-html";
import { renderPatentamientoFisicaHtml } from "@/lib/patentamiento-fisica-html";
import { renderPatentamientoJuridicaHtml } from "@/lib/patentamiento-juridica-html";
import { renderOrdenEntregaHtml } from "@/lib/orden-entrega-html";
import type { DocumentoTipo, Operacion } from "@/types/domain";

type RouteParams = { params: Promise<{ tipo: string }> };

async function fetchOperacion(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, operacionId: string): Promise<Operacion | null> {
  const { data: operacion, error } = await supabase
    .from("operaciones")
    .select(`
      *,
      cliente:clientes(*),
      items:operacion_items(*, producto:productos(*)),
      patentamiento:patentamientos(*)
    `)
    .eq("id", operacionId)
    .single();

  if (error || !operacion) return null;

  // Resolver nombre del vendedor
  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre")
    .eq("id", operacion.vendedor_id)
    .single();

  // patentamiento viene como array, tomamos el primero si existe
  const patentamiento = Array.isArray(operacion.patentamiento)
    ? operacion.patentamiento[0] ?? undefined
    : operacion.patentamiento ?? undefined;

  return {
    ...operacion,
    vendedor_nombre: profile?.nombre ?? "",
    patentamiento
  } as Operacion;
}

function renderHtml(tipo: DocumentoTipo, operacion: Operacion): string {
  const patData = (operacion.patentamiento?.datos_json ?? {}) as Record<string, unknown>;
  switch (tipo) {
    case "proforma":
      return renderOfficialProformaHtml(operacion);
    case "boleto_compraventa":
      return renderBoletoHtml(operacion);
    case "patentamiento_fisica":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return renderPatentamientoFisicaHtml(operacion, patData as any);
    case "patentamiento_juridica":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return renderPatentamientoJuridicaHtml(operacion, patData as any);
    case "orden_entrega":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return renderOrdenEntregaHtml(operacion, patData as any);
    default:
      throw new Error(`Tipo de documento desconocido: ${tipo}`);
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tipo } = await params;
  const operacionId = req.nextUrl.searchParams.get("operacion_id");

  if (!operacionId) {
    return NextResponse.json({ error: "Falta el parámetro operacion_id" }, { status: 400 });
  }

  const tiposValidos: DocumentoTipo[] = [
    "proforma",
    "boleto_compraventa",
    "patentamiento_fisica",
    "patentamiento_juridica",
    "orden_entrega"
  ];

  if (!tiposValidos.includes(tipo as DocumentoTipo)) {
    return NextResponse.json({ error: `Tipo de documento inválido: ${tipo}` }, { status: 400 });
  }

  try {
    const supabase = await createServerSupabaseClient();

    // Verificar sesión
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const operacion = await fetchOperacion(supabase, operacionId);
    if (!operacion) {
      return NextResponse.json({ error: "Operación no encontrada" }, { status: 404 });
    }

    const html = renderHtml(tipo as DocumentoTipo, operacion);

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  } catch (err) {
    console.error("[forms/[tipo]] Error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
