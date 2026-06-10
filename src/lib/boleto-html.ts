import { companyData } from "@/lib/company";
import type { Operacion } from "@/types/domain";

function esc(v: string | number | null | undefined) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// Convierte número a letras en español (pesos / dólares)
function numeroALetras(num: number): string {
  const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE",
    "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
  const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA",
    "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  const centenas = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS",
    "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

  function convertirMenorMil(n: number): string {
    if (n === 0) return "";
    if (n === 100) return "CIEN";
    if (n < 20) return unidades[n];
    if (n < 100) {
      const d = Math.floor(n / 10);
      const u = n % 10;
      return u === 0 ? decenas[d] : `${decenas[d]} Y ${unidades[u]}`;
    }
    const c = Math.floor(n / 100);
    const resto = n % 100;
    return resto === 0 ? centenas[c] : `${centenas[c]} ${convertirMenorMil(resto)}`;
  }

  function convertirGrupo(n: number, grupo: number): string {
    if (n === 0) return "";
    const texto = convertirMenorMil(n);
    if (grupo === 0) return texto;
    if (grupo === 1) {
      if (n === 1) return "MIL";
      return `${texto} MIL`;
    }
    if (grupo === 2) {
      if (n === 1) return "UN MILLÓN";
      return `${texto} MILLONES`;
    }
    return texto;
  }

  if (num === 0) return "CERO";

  const entero = Math.floor(Math.abs(num));
  const grupos: number[] = [];
  let temp = entero;
  while (temp > 0) {
    grupos.unshift(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  const partes = grupos
    .map((g, i) => convertirGrupo(g, grupos.length - 1 - i))
    .filter(Boolean);

  return partes.join(" ");
}

function monedaTexto(moneda: string): { nombre: string; simbolo: string } {
  if (moneda === "USD") return { nombre: "DÓLARES ESTADOUNIDENSES", simbolo: "U$D" };
  return { nombre: "PESOS", simbolo: "$" };
}

function detalleItems(operacion: Operacion): string {
  return operacion.items
    .map((item) => {
      const cantidad = item.cantidad === 1 ? "una (1) unidad de" : `${item.cantidad} unidades de`;
      return `${cantidad} <b>${esc(item.descripcion_manual)}</b>`;
    })
    .join("; ");
}

export function renderBoletoHtml(operacion: Operacion): string {
  const c = operacion.cliente;
  const fecha = new Date(operacion.fecha + "T12:00:00");

  const dia = fecha.getDate().toString();
  const mes = fecha.toLocaleString("es-AR", { month: "long" });
  const anio = fecha.getFullYear().toString();

  const { nombre: monedaNombre, simbolo: monedaSimbolo } = monedaTexto(operacion.moneda);
  const totalLetras = `${monedaNombre} ${numeroALetras(operacion.total)}`;
  const totalNumeros = `${monedaSimbolo} ${new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2 }).format(operacion.total)}`;

  // Para persona jurídica, el representante es el mismo que figura en patentamiento; sino el propio comprador
  const esJuridica = c?.tipo_cliente === "persona_juridica";
  const patDatos = operacion.patentamiento?.datos_json ?? {};
  const representanteComprador = esJuridica
    ? esc(String(patDatos.rep_nombre ?? patDatos.representante ?? ""))
    : esc(c?.nombre_razon_social ?? "");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Propuesta de Compra — ${esc(operacion.numero_operacion)}</title>
<style>
@page { size: A4; margin: 20mm; }
*{ box-sizing: border-box; }
body {
  font-family: Arial, sans-serif;
  background: #e9ecef;
  padding: 20px;
  margin: 0;
}
.page {
  width: 210mm;
  min-height: 297mm;
  margin: auto;
  background: white;
  padding: 20mm 22mm;
  box-shadow: 0 0 20px rgba(0,0,0,.15);
  position: relative;
}
.watermark {
  position: absolute;
  top: 180px;
  left: 50%;
  transform: translateX(-50%);
  opacity: .04;
  font-size: 140px;
  font-weight: bold;
  color: #000;
  z-index: 0;
  white-space: nowrap;
  pointer-events: none;
}
.header {
  position: relative;
  z-index: 1;
  border-bottom: 2px solid #000;
  padding-bottom: 14px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 38px;
  background: #f5d21f;
  color: #111;
  font-size: 28px;
  font-weight: 900;
  border: 2px solid #111;
  letter-spacing: -1px;
  flex-shrink: 0;
}
.logo-name {
  font-size: 13px;
  font-weight: bold;
  color: #111;
  line-height: 1.3;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.logo-name span {
  display: block;
  font-size: 10px;
  font-weight: normal;
  color: #555;
  text-transform: none;
  letter-spacing: 0;
}
.header-title {
  text-align: right;
}
.header-title h1 {
  margin: 0;
  font-size: 20px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.header-title .op-num {
  font-size: 11px;
  color: #555;
  margin-top: 3px;
}
.content {
  position: relative;
  z-index: 1;
  font-size: 13px;
  line-height: 1.75;
  text-align: justify;
  color: #111;
}
.clause {
  margin-top: 14px;
}
.conditions-title {
  text-align: center;
  margin-top: 28px;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.conditions p {
  margin: 8px 0;
  font-size: 12.5px;
  line-height: 1.65;
  text-align: justify;
}
.footer {
  margin-top: 50px;
  display: flex;
  justify-content: space-between;
}
.sign {
  width: 220px;
  text-align: center;
}
.line {
  border-top: 1px solid #000;
  margin-top: 60px;
  padding-top: 8px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}
.data {
  font-size: 11px;
  text-align: center;
  margin-top: 36px;
  color: #444;
  border-top: 1px solid #ccc;
  padding-top: 10px;
}
@media print {
  body { background: #fff; padding: 0; }
  .page { box-shadow: none; padding: 20mm 22mm; width: 100%; min-height: auto; }
}
</style>
</head>
<body>
<div class="page">

  <div class="watermark">LOTHAR</div>

  <div class="header">
    <div class="logo-wrap">
      <div class="logo-mark">L</div>
      <div class="logo-name">
        Imperio Mac S.A.
        <span>${esc(companyData.direccion)}</span>
      </div>
    </div>
    <div class="header-title">
      <h1>Propuesta de Compra</h1>
      <div class="op-num">N° ${esc(operacion.numero_operacion.replace(/^OP-/i, "BC-"))} &nbsp;|&nbsp; ${esc(dia)} de ${esc(mes)} de ${esc(anio)}</div>
    </div>
  </div>

  <div class="content">

    <p>
      En la ciudad de Córdoba, Provincia de Córdoba a los <b>${esc(dia)}</b> días del mes de <b>${esc(mes)}</b>
      de <b>${esc(anio)}</b>, entre <b>${esc(companyData.razonSocial)}</b>, CUIT N° ${esc(companyData.cuit)}
      con domicilio en ${esc(companyData.direccion)}, representada por
      <b>${esc(operacion.vendedor_nombre ?? "")}</b>,
      en adelante <b>EL VENDEDOR</b>, y por la otra <b>${esc(c?.nombre_razon_social ?? "")}</b>,
      CUIT ${esc(c?.cuit ?? "")} con domicilio ${esc(c?.direccion ?? "")}, ${esc(c?.localidad ?? "")},
      ${esc(c?.provincia ?? "")}${representanteComprador ? `, representada por <b>${representanteComprador}</b>` : ""},
      en adelante <b>EL PROPONENTE COMPRADOR</b>, convienen celebrar la presente Propuesta de Compra.
    </p>

    <div class="clause">
      <b>PRIMERA:</b> El PROPONENTE COMPRADOR se compromete a adquirir el/los siguiente/s bien/es:
      ${detalleItems(operacion)}.
    </div>

    <div class="clause">
      <b>SEGUNDA:</b> El precio total de la operación se establece en la suma de
      ${esc(totalLetras)} (${esc(totalNumeros)}).
      El precio no incluye flete, seguro ni gastos de patentamiento.
      SERVICE: 50, 250, 500, 750 y 1000 horas.
    </div>

    <div class="clause">
      <b>TERCERA:</b> El precio total de la operación se abonará de la siguiente manera:
      ${esc(operacion.forma_pago)}.
    </div>

    <div class="conditions-title">Propuesta de Compra – Condiciones Específicas</div>

    <div class="conditions">
      <p>1) La suscripción de la presente propuesta no implica consentimiento ni conformidad por parte de EL VENDEDOR, quedando a su libre elección aceptar o no la misma.</p>
      <p>2) En caso de rechazo de la propuesta por parte de EL VENDEDOR, éste deberá notificar por cualquier medio al PROPONENTE COMPRADOR dentro del plazo establecido.</p>
      <p>3) En caso de aceptación de la presente propuesta de compra por parte de EL VENDEDOR, la entrega de las unidades se efectuará en el local del mismo o donde éste lo indique.</p>
      <p>4) El PROPONENTE COMPRADOR declara bajo juramento que los bienes entregados como parte de pago, si existieren, son de su exclusiva propiedad y libres de gravámenes.</p>
      <p>5) El PROPONENTE COMPRADOR se obliga a tramitar la transferencia de dominio a su nombre dentro de los diez días corridos contados desde la entrega del bien.</p>
      <p>6) EL VENDEDOR declara que la unidad objeto del presente convenio no posee gravámenes.</p>
      <p>7) Ante demoras de transporte, huelgas o fuerza mayor, EL VENDEDOR no tendrá responsabilidad por demoras ocasionadas por terceros.</p>
      <p>8) El bien objeto de esta propuesta gozará de la garantía otorgada por EL IMPORTADOR.</p>
      <p>9) Las obligaciones de pago y documentación se efectuarán en el domicilio indicado por EL VENDEDOR.</p>
      <p>10) El incumplimiento de pago habilitará a EL VENDEDOR a exigir el saldo total o rescindir el contrato.</p>
      <p>11) El saldo adeudado devengará intereses conforme a las tasas pactadas.</p>
      <p>12) De existir saldo impago al momento de la entrega, podrá constituirse derecho real de prenda.</p>
      <p>13) Desde la entrega efectiva de la unidad, toda responsabilidad civil y penal será exclusiva del PROPONENTE COMPRADOR.</p>
      <p>14) Los gastos derivados de transferencias, patentamientos, formularios, seguros y sellados serán a cargo del PROPONENTE COMPRADOR.</p>
      <p>15) Las partes se someten a la jurisdicción de los Tribunales Ordinarios de la Ciudad de Córdoba.</p>
    </div>

    <div class="footer">
      <div class="sign">
        <div class="line">Vendedor<br><small style="font-weight:normal">${esc(companyData.razonSocial)}</small></div>
      </div>
      <div class="sign">
        <div class="line">Proponente Comprador<br><small style="font-weight:normal">${esc(c?.nombre_razon_social ?? "")}</small></div>
      </div>
    </div>

    <div class="data">
      ${esc(companyData.direccion)}<br>
      www.lotharmaquinaria.com.ar &nbsp;|&nbsp; ${esc(companyData.email)}
    </div>

  </div>
</div>
</body>
</html>`;
}
