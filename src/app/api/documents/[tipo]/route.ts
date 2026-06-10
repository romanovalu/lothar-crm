import { renderToStream, type DocumentProps } from "@react-pdf/renderer";
import { NextResponse, type NextRequest } from "next/server";
import { createElement, type ReactElement, type JSXElementConstructor } from "react";
import { OperationDocumentPdf } from "@/components/crm/document-pdf";
import { ProformaOficialPdf } from "@/components/crm/proforma-oficial-pdf";
import { operaciones } from "@/lib/sample-data";
import { renderOfficialProformaHtml } from "@/lib/proforma-html";
import { renderBoletoHtml } from "@/lib/boleto-html";
import { renderPatentamientoFisicaHtml } from "@/lib/patentamiento-fisica-html";
import { renderPatentamientoJuridicaHtml } from "@/lib/patentamiento-juridica-html";
import { renderOrdenEntregaHtml } from "@/lib/orden-entrega-html";
import type { DocumentoTipo } from "@/types/domain";
import type { PatentamientoFisicaData } from "@/lib/patentamiento-fisica-html";
import type { PatentamientoJuridicaData } from "@/lib/patentamiento-juridica-html";
import type { OrdenEntregaData } from "@/lib/orden-entrega-html";

const tipos: DocumentoTipo[] = [
  "proforma",
  "boleto_compraventa",
  "patentamiento_fisica",
  "patentamiento_juridica",
  "orden_entrega"
];

/** Genera el HTML del documento solicitado. Retorna null si el tipo usa solo PDF. */
function buildHtml(tipo: DocumentoTipo, operacion: (typeof operaciones)[0]): string | null {
  const pat = operacion.patentamiento?.datos_json ?? {};

  switch (tipo) {
    case "proforma":
      return renderOfficialProformaHtml(operacion);

    case "boleto_compraventa":
      return renderBoletoHtml(operacion);

    case "patentamiento_fisica": {
      const cli = operacion.cliente;
      const d: PatentamientoFisicaData = {
        apellido: String(pat.apellido ?? cli?.nombre_razon_social ?? ""),
        nombre: String(pat.nombre ?? ""),
        tipo_doc: String(pat.tipo_doc ?? "DNI"),
        num_doc: String(pat.num_doc ?? pat.dni ?? ""),
        cuit: String(pat.cuit ?? cli?.cuit ?? ""),
        nacionalidad: String(pat.nacionalidad ?? "Argentina"),
        telefono: String(pat.telefono ?? cli?.telefono ?? ""),
        email: String(pat.email ?? cli?.email ?? ""),
        profesion: String(pat.profesion ?? ""),
        fecha_nacimiento: String(pat.fecha_nacimiento ?? ""),
        lugar_nacimiento: String(pat.lugar_nacimiento ?? ""),
        sexo: String(pat.sexo ?? ""),
        estado_civil: String(pat.estado_civil ?? ""),
        num_nupcias: pat.num_nupcias ? String(pat.num_nupcias) : undefined,
        tipo_doc_conyuge: pat.tipo_doc_conyuge ? String(pat.tipo_doc_conyuge) : undefined,
        num_doc_conyuge: pat.num_doc_conyuge ? String(pat.num_doc_conyuge) : undefined,
        cuit_conyuge: pat.cuit_conyuge ? String(pat.cuit_conyuge) : undefined,
        apellido_nombre_conyuge: pat.apellido_nombre_conyuge ? String(pat.apellido_nombre_conyuge) : undefined,
        // Domicilio Legal (DNI)
        dom_legal_calle: String(pat.dom_legal_calle ?? cli?.direccion ?? ""),
        dom_legal_localidad: String(pat.dom_legal_localidad ?? cli?.localidad ?? ""),
        dom_legal_partido: String(pat.dom_legal_partido ?? ""),
        dom_legal_barrio: pat.dom_legal_barrio ? String(pat.dom_legal_barrio) : undefined,
        dom_legal_cp: String(pat.dom_legal_cp ?? pat.codigo_postal ?? ""),
        dom_legal_provincia: String(pat.dom_legal_provincia ?? cli?.provincia ?? ""),
        // Domicilio Real (actual)
        dom_real_calle: String(pat.dom_real_calle ?? pat.domicilio_real ?? cli?.direccion ?? ""),
        dom_real_localidad: String(pat.dom_real_localidad ?? cli?.localidad ?? ""),
        dom_real_partido: String(pat.dom_real_partido ?? ""),
        dom_real_barrio: pat.dom_real_barrio ? String(pat.dom_real_barrio) : undefined,
        dom_real_cp: String(pat.dom_real_cp ?? pat.codigo_postal ?? ""),
        dom_real_provincia: String(pat.dom_real_provincia ?? cli?.provincia ?? ""),
        // Maquinaria
        uso_maquinaria: String(pat.uso_maquinaria ?? pat.tipo_uso ?? "Privado"),
        registro_inscripcion: String(pat.registro_inscripcion ?? ""),
      };
      return renderPatentamientoFisicaHtml(operacion, d);
    }

    case "patentamiento_juridica": {
      const cli = operacion.cliente;
      const d: PatentamientoJuridicaData = {
        razon_social: String(pat.razon_social ?? cli?.nombre_razon_social ?? ""),
        personeria_juridica: String(pat.personeria_juridica ?? ""),
        fecha_inscripcion: String(pat.fecha_inscripcion ?? pat.fecha_constitucion ?? ""),
        num_inscripcion: String(pat.num_inscripcion ?? pat.numero_inscripcion ?? ""),
        cuit: String(pat.cuit ?? cli?.cuit ?? ""),
        // Domicilio Legal empresa
        emp_dom_legal_calle: String(pat.emp_dom_legal_calle ?? pat.domicilio_legal ?? cli?.direccion ?? ""),
        emp_dom_legal_localidad: String(pat.emp_dom_legal_localidad ?? cli?.localidad ?? ""),
        emp_dom_legal_partido: String(pat.emp_dom_legal_partido ?? ""),
        emp_dom_legal_barrio: pat.emp_dom_legal_barrio ? String(pat.emp_dom_legal_barrio) : undefined,
        emp_dom_legal_cp: String(pat.emp_dom_legal_cp ?? pat.codigo_postal ?? ""),
        emp_dom_legal_provincia: String(pat.emp_dom_legal_provincia ?? cli?.provincia ?? ""),
        // Domicilio Real empresa
        emp_dom_real_calle: String(pat.emp_dom_real_calle ?? pat.domicilio_legal ?? cli?.direccion ?? ""),
        emp_dom_real_localidad: String(pat.emp_dom_real_localidad ?? cli?.localidad ?? ""),
        emp_dom_real_partido: String(pat.emp_dom_real_partido ?? ""),
        emp_dom_real_barrio: pat.emp_dom_real_barrio ? String(pat.emp_dom_real_barrio) : undefined,
        emp_dom_real_cp: String(pat.emp_dom_real_cp ?? pat.codigo_postal ?? ""),
        emp_dom_real_provincia: String(pat.emp_dom_real_provincia ?? cli?.provincia ?? ""),
        // Actividad
        telefono: String(pat.telefono ?? cli?.telefono ?? ""),
        email: String(pat.email ?? cli?.email ?? ""),
        actividad_principal: String(pat.actividad_principal ?? ""),
        porcentaje_titularidad: String(pat.porcentaje_titularidad ?? "100%"),
        cantidad_apoderados: String(pat.cantidad_apoderados ?? "1"),
        uso_maquinaria: String(pat.uso_maquinaria ?? pat.tipo_uso ?? "Privado"),
        // Representante
        rep_apellido_nombre: String(pat.rep_apellido_nombre ?? `${pat.rep_apellido ?? ""} ${pat.rep_nombre ?? ""}`.trim()),
        rep_tipo_doc: String(pat.rep_tipo_doc ?? "DNI"),
        rep_num_doc: String(pat.rep_num_doc ?? pat.rep_dni ?? pat.dni_representante ?? ""),
        rep_cuit: String(pat.rep_cuit ?? ""),
        rep_nacionalidad: String(pat.rep_nacionalidad ?? "Argentina"),
        rep_telefono: String(pat.rep_telefono ?? cli?.telefono ?? ""),
        rep_email: String(pat.rep_email ?? cli?.email ?? ""),
        rep_profesion: String(pat.rep_profesion ?? ""),
        rep_fecha_nacimiento: String(pat.rep_fecha_nacimiento ?? ""),
        rep_lugar_nacimiento: String(pat.rep_lugar_nacimiento ?? ""),
        rep_sexo: String(pat.rep_sexo ?? ""),
        rep_estado_civil: String(pat.rep_estado_civil ?? ""),
        // Domicilio Legal Representante (DNI)
        rep_dom_legal_calle: String(pat.rep_dom_legal_calle ?? cli?.direccion ?? ""),
        rep_dom_legal_localidad: String(pat.rep_dom_legal_localidad ?? cli?.localidad ?? ""),
        rep_dom_legal_partido: String(pat.rep_dom_legal_partido ?? ""),
        rep_dom_legal_barrio: pat.rep_dom_legal_barrio ? String(pat.rep_dom_legal_barrio) : undefined,
        rep_dom_legal_cp: String(pat.rep_dom_legal_cp ?? ""),
        rep_dom_legal_provincia: String(pat.rep_dom_legal_provincia ?? cli?.provincia ?? ""),
        // Domicilio Real Representante
        rep_dom_real_calle: String(pat.rep_dom_real_calle ?? cli?.direccion ?? ""),
        rep_dom_real_localidad: String(pat.rep_dom_real_localidad ?? cli?.localidad ?? ""),
        rep_dom_real_partido: String(pat.rep_dom_real_partido ?? ""),
        rep_dom_real_barrio: pat.rep_dom_real_barrio ? String(pat.rep_dom_real_barrio) : undefined,
        rep_dom_real_cp: String(pat.rep_dom_real_cp ?? ""),
        rep_dom_real_provincia: String(pat.rep_dom_real_provincia ?? cli?.provincia ?? ""),
        // Registro
        registro_inscripcion: String(pat.registro_inscripcion ?? ""),
      };
      return renderPatentamientoJuridicaHtml(operacion, d);
    }

    case "orden_entrega": {
      const d: OrdenEntregaData = {
        fecha_entrega: String(pat.fecha_entrega ?? operacion.fecha),
        lugar_entrega: String(pat.lugar_entrega ?? operacion.cliente?.localidad ?? ""),
        transportista: pat.transportista ? String(pat.transportista) : undefined,
        numero_remito: pat.numero_remito ? String(pat.numero_remito) : undefined,
        kilometraje_inicial: pat.kilometraje_inicial ? String(pat.kilometraje_inicial) : undefined,
        horometro_inicial: pat.horometro_inicial ? String(pat.horometro_inicial) : undefined,
        accesorios_incluidos: pat.accesorios_incluidos ? String(pat.accesorios_incluidos) : undefined,
        manual_incluido: Boolean(pat.manual_incluido ?? false),
        herramientas_incluidas: Boolean(pat.herramientas_incluidas ?? false),
        observaciones: pat.observaciones ? String(pat.observaciones) : undefined
      };
      return renderOrdenEntregaHtml(operacion, d);
    }

    default:
      return null;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ tipo: string }> }
) {
  const { searchParams } = new URL(request.url);
  const { tipo } = await context.params;

  if (!tipos.includes(tipo as DocumentoTipo)) {
    return NextResponse.json({ error: "Tipo de documento invalido" }, { status: 400 });
  }

  const operacionId = searchParams.get("operacionId") ?? operaciones[0].id;
  const operacion = operaciones.find((item) => item.id === operacionId);

  if (!operacion) {
    return NextResponse.json({ error: "Operacion no encontrada" }, { status: 404 });
  }

  // HTML imprimible (default para todos excepto que se pida PDF explícito)
  const wantPdf = searchParams.get("format") === "pdf";

  if (!wantPdf) {
    const html = buildHtml(tipo as DocumentoTipo, operacion);
    if (html) {
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }
  }

  // PDF vía React PDF
  type PdfElement = ReactElement<DocumentProps, JSXElementConstructor<DocumentProps>>;
  const element: PdfElement =
    tipo === "proforma"
      ? (createElement(ProformaOficialPdf, { operacion }) as unknown as PdfElement)
      : (createElement(OperationDocumentPdf, { tipo: tipo as DocumentoTipo, operacion }) as unknown as PdfElement);
  const stream = await renderToStream(element);

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${tipo}-${operacion.numero_operacion}.pdf"`
    }
  });
}
