import { companyData } from "@/lib/company";
import { formatDate } from "@/lib/utils";
import type { Operacion } from "@/types/domain";

function esc(v: string | number | null | undefined) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function field(label: string, value: string | null | undefined, span = false) {
  return `<div class="field${span ? " span2" : ""}">
    <div class="field-label">${label}</div>
    <div class="field-value">${esc(value)}</div>
  </div>`;
}

export interface OrdenEntregaData {
  fecha_entrega: string;
  lugar_entrega: string;
  transportista?: string;
  numero_remito?: string;
  kilometraje_inicial?: string;
  horometro_inicial?: string;
  accesorios_incluidos?: string;
  manual_incluido: boolean;
  herramientas_incluidas: boolean;
  observaciones?: string;
}

export function renderOrdenEntregaHtml(
  operacion: Operacion,
  datos: OrdenEntregaData
) {
  const c = operacion.cliente;
  const ordenNum = operacion.numero_operacion.replace(/^OP-/i, "OE-");

  const itemsRows = operacion.items
    .map(
      (item) => `<tr>
        <td style="text-align:center">${esc(item.cantidad)}</td>
        <td>${esc(item.descripcion_manual)}</td>
        <td style="text-align:center">☐</td>
        <td></td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Orden de Entrega ${esc(ordenNum)}</title>
<style>
*{box-sizing:border-box}
body{margin:0;padding:20px;background:#e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px}
.page{width:1100px;background:#fff;margin:auto;border:2px solid #111}
.header{display:flex;align-items:stretch;border-bottom:2px solid #111}
.logo-box{width:180px;border-right:2px solid #111;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14px 8px;gap:6px}
.logo-mark{display:inline-grid;place-items:center;width:80px;height:52px;background:#f5d21f;color:#111;font-size:38px;font-weight:900;border:2px solid #111}
.company-info{font-size:10px;text-align:center;line-height:1.5}
.title-box{flex:1;padding:14px 20px;display:flex;flex-direction:column;justify-content:center}
.title-box h1{margin:0 0 2px;font-size:22px;letter-spacing:.5px;text-transform:uppercase}
.title-box .sub{font-size:11px;color:#555;margin:0 0 8px}
.doc-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:6px 20px;font-size:12px}
.section{border-top:1px solid #ccc;padding:10px 14px}
.section-title{font-weight:bold;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#444;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #eee}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.field{}
.field.span2{grid-column:span 2}
.field.span4{grid-column:span 4}
.field-label{font-size:9px;font-weight:bold;text-transform:uppercase;letter-spacing:.04em;color:#777;margin-bottom:2px}
.field-value{border-bottom:1px solid #aaa;min-height:18px;padding:2px 0;font-size:12px}
table{width:100%;border-collapse:collapse;font-size:12px}
table th{background:#f3f4f6;border:1px solid #999;padding:5px 8px;text-transform:uppercase;font-size:10px;letter-spacing:.04em}
table td{border:1px solid #ccc;padding:5px 8px;vertical-align:middle}
.check-row{display:flex;align-items:center;gap:8px;padding:4px 0;font-size:12px}
.check-box{display:inline-block;width:16px;height:16px;border:1.5px solid #555;margin-right:4px;text-align:center;line-height:14px;font-size:14px}
.firma-box{display:flex;gap:40px;padding:16px 14px 20px;border-top:1px solid #ccc}
.firma-line{flex:1;text-align:center;border-top:1px solid #111;padding-top:6px;font-size:10px}
.footer-note{border-top:1px solid #ccc;padding:8px 14px;font-size:10px;color:#666;line-height:1.6}
@media print{body{background:#fff;padding:0}.page{border:2px solid #111;width:100%}}
</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div class="logo-box">
      <div class="logo-mark">L</div>
      <div class="company-info">
        <b>${esc(companyData.razonSocial)}</b><br>
        CUIT: ${esc(companyData.cuit)}<br>
        ${esc(companyData.telefono)}<br>
        ${esc(companyData.email)}
      </div>
    </div>
    <div class="title-box">
      <h1>Orden de Entrega</h1>
      <p class="sub">Constancia de entrega de maquinaria al comprador</p>
      <div class="doc-meta">
        <span><b>N° Orden:</b> ${esc(ordenNum)}</span>
        <span><b>Operación:</b> ${esc(operacion.numero_operacion)}</span>
        <span><b>Vendedor:</b> ${esc(operacion.vendedor_nombre ?? "")}</span>
        <span><b>Fecha Venta:</b> ${esc(formatDate(operacion.fecha))}</span>
        <span><b>Fecha Entrega:</b> ${esc(datos.fecha_entrega)}</span>
        <span><b>Lugar Entrega:</b> ${esc(datos.lugar_entrega)}</span>
      </div>
    </div>
  </div>

  <!-- DATOS DEL COMPRADOR -->
  <div class="section">
    <div class="section-title">Datos del Comprador</div>
    <div class="grid">
      ${field("Nombre / Razón Social", c?.nombre_razon_social, true)}
      ${field("CUIT", c?.cuit)}
      ${field("Teléfono", c?.telefono)}
      ${field("Domicilio", c?.direccion, true)}
      ${field("Localidad", c?.localidad)}
      ${field("Provincia", c?.provincia)}
    </div>
  </div>

  <!-- DETALLE DE MAQUINARIA ENTREGADA -->
  <div class="section">
    <div class="section-title">Detalle de Maquinaria / Productos Entregados</div>
    <table>
      <thead>
        <tr>
          <th style="width:8%;text-align:center">Cant.</th>
          <th>Descripción</th>
          <th style="width:10%;text-align:center">Conforme</th>
          <th style="width:25%">Observación</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>
  </div>

  <!-- DATOS DE ENTREGA -->
  <div class="section">
    <div class="section-title">Datos de la Entrega</div>
    <div class="grid">
      ${field("Transportista / Flete", datos.transportista ?? "")}
      ${field("N° de Remito", datos.numero_remito ?? "")}
      ${field("Kilometraje / Horómetro inicial", datos.kilometraje_inicial ?? datos.horometro_inicial ?? "")}
    </div>
    <div style="margin-top:12px">
      <div class="section-title" style="margin-bottom:6px">Elementos incluidos en la entrega</div>
      <div style="display:flex;gap:30px;flex-wrap:wrap">
        <div class="check-row">
          <span class="check-box">${datos.manual_incluido ? "✓" : ""}</span> Manual del propietario
        </div>
        <div class="check-row">
          <span class="check-box">${datos.herramientas_incluidas ? "✓" : ""}</span> Herramientas / kit básico
        </div>
        <div class="check-row">
          <span class="check-box">☐</span> Garantía firmada
        </div>
        <div class="check-row">
          <span class="check-box">☐</span> Documentación registral
        </div>
      </div>
      ${datos.accesorios_incluidos ? `<div style="margin-top:8px"><b>Accesorios adicionales:</b> ${esc(datos.accesorios_incluidos)}</div>` : ""}
    </div>
  </div>

  <!-- OBSERVACIONES -->
  ${datos.observaciones ? `<div class="section">
    <div class="section-title">Observaciones</div>
    <p style="margin:0;line-height:1.7">${esc(datos.observaciones)}</p>
  </div>` : ""}

  <!-- CONFORMIDAD -->
  <div class="section">
    <div class="section-title">Conformidad de Recepción</div>
    <p style="font-size:11px;line-height:1.7;margin:0">
      El comprador declara haber recibido la/s maquinaria/s detallada/s en perfectas condiciones de funcionamiento y completas,
      de acuerdo con lo pactado en la operación comercial N° ${esc(operacion.numero_operacion)}.
      Cualquier observación o disconformidad deberá ser indicada en el campo correspondiente antes de la firma.
    </p>
  </div>

  <!-- FIRMAS -->
  <div class="firma-box">
    <div class="firma-line">
      Firma y Aclaración del Comprador<br><br>
      ${esc(c?.nombre_razon_social)}<br>
      CUIT: ${esc(c?.cuit)}
    </div>
    <div class="firma-line">
      Firma y Sello del Vendedor / Entregador<br><br>
      ${esc(companyData.razonSocial)}<br>
      CUIT: ${esc(companyData.cuit)}
    </div>
  </div>

  <div class="footer-note">
    Documento generado por el sistema CRM Lothar Maquinaria — ${esc(companyData.razonSocial)} — ${esc(companyData.direccion)}.
    Este documento acredita la entrega física del bien y no reemplaza a la factura ni a los documentos de transferencia de dominio.
  </div>

</div>
</body>
</html>`;
}
