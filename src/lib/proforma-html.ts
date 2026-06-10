import { companyData } from "@/lib/company";
import { formatDate } from "@/lib/utils";
import type { Operacion } from "@/types/domain";

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function proformaNumber(operacion: Operacion) {
  return operacion.numero_operacion.replace(/^OP-/i, "PF-");
}

function officialCurrency(value: number, currency: string) {
  return `${currency} ${new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0
  }).format(value)}`;
}

export function renderOfficialProformaHtml(operacion: Operacion) {
  const cliente = operacion.cliente;
  const rows = operacion.items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.cantidad)}</td>
          <td>${escapeHtml(item.descripcion_manual)}</td>
          <td>${escapeHtml(officialCurrency(item.precio_unitario, operacion.moneda))}</td>
          <td>${escapeHtml(officialCurrency(item.subtotal, operacion.moneda))}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Proforma ${escapeHtml(proformaNumber(operacion))}</title>
<style>
body{margin:0;padding:20px;background:#e5e7eb;font-family:Arial,Helvetica,sans-serif}
.page{width:1100px;min-height:780px;background:#fff;margin:auto;border:1px solid #000}
table{width:100%;border-collapse:collapse}
td,th{border:1px solid #000;padding:4px;font-size:12px}
.header td{height:180px;vertical-align:top}
.logo{text-align:center;padding-top:18px}
.logo-mark{display:inline-grid;place-items:center;width:90px;height:58px;background:#f5d21f;color:#111;font-size:42px;font-weight:900;border:2px solid #111}
.company{text-align:center;font-size:12px;margin-top:10px;line-height:1.4}
.middle-x{text-align:center;font-size:72px;font-weight:bold;padding-top:40px}
.right-head{text-align:center;padding-top:20px}
.right-head h1{margin:0;font-size:24px}
.right-head .data{margin-top:20px;line-height:1.8;font-size:13px}
.notice{text-align:center;font-weight:bold;font-size:14px;padding:4px;border-top:1px solid #000;border-bottom:1px solid #000}
.client td{font-size:13px;font-weight:bold}
.products th{background:#f3f3f3;text-align:center}
.blank{height:280px}
.totals{width:280px;margin-left:auto}
.totals td{font-size:14px}
.footer{padding:10px;font-size:12px;border-top:1px solid #000;line-height:1.8}
@media print{body{background:#fff;padding:0}.page{border:1px solid #000;margin:0;width:100%;min-height:100vh}}
</style>
</head>
<body>
<div class="page">
<table class="header">
<tr>
<td width="38%">
<div class="logo"><div class="logo-mark">L</div></div>
<div class="company">
<b>${escapeHtml(companyData.razonSocial)}</b><br>
${escapeHtml(companyData.direccion)}<br>
${escapeHtml(companyData.email)} - Tel.: ${escapeHtml(companyData.telefono)}<br><br>
<b>${escapeHtml(companyData.condicionIva)}</b>
</div>
</td>
<td width="18%"><div class="middle-x">X</div></td>
<td width="44%">
<div class="right-head">
<h1>FACTURA PROFORMA</h1>
<div class="data">
<b>N°:</b> ${escapeHtml(proformaNumber(operacion))}<br>
<b>FECHA:</b> ${escapeHtml(formatDate(operacion.fecha))}<br><br>
<b>CUIT:</b> ${escapeHtml(companyData.cuit)}<br>
<b>Ingresos Brutos:</b> ${escapeHtml(companyData.ingresosBrutos)}<br>
<b>Inicio de Actividades:</b> ${escapeHtml(companyData.inicioActividades)}
</div>
</div>
</td>
</tr>
</table>
<div class="notice">Comprobante No Valido Como Factura</div>
<table class="client">
<tr>
<td width="60%">CLIENTE: ${escapeHtml(cliente?.nombre_razon_social).toUpperCase()}</td>
<td>${escapeHtml(cliente?.provincia).toUpperCase()}</td>
</tr>
<tr>
<td>DOMICILIO: ${escapeHtml(cliente?.direccion)}</td>
<td>${escapeHtml(cliente?.localidad)}</td>
</tr>
<tr>
<td>CUIT: ${escapeHtml(cliente?.cuit)}</td>
<td></td>
</tr>
<tr>
<td>CONDICION DE IVA: ${escapeHtml(cliente?.condicion_iva)}</td>
<td></td>
</tr>
</table>
<table class="products">
<tr>
<th width="10%">CANT.</th>
<th>DESCRIPCION</th>
<th width="15%">PRECIO UNIT.</th>
<th width="15%">IMPORTE</th>
</tr>
${rows}
<tr class="blank"><td></td><td></td><td></td><td></td></tr>
</table>
<table class="totals">
<tr><td>SUBTOTAL</td><td align="right">${escapeHtml(officialCurrency(operacion.subtotal, operacion.moneda))}</td></tr>
<tr><td>DESCUENTO</td><td align="right">${escapeHtml(officialCurrency(operacion.descuento, operacion.moneda))}</td></tr>
<tr><td><b>TOTAL</b></td><td align="right"><b>${escapeHtml(officialCurrency(operacion.total, operacion.moneda))}</b></td></tr>
</table>
<div class="footer">
<b>FORMA DE PAGO:</b> ${escapeHtml(operacion.forma_pago)}<br>
<b>OBSERVACIONES:</b> ${escapeHtml(operacion.observaciones)}
</div>
</div>
</body>
</html>`;
}
