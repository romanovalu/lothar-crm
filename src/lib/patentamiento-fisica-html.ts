import { companyData } from "@/lib/company";
import { formatDate } from "@/lib/utils";
import type { Operacion } from "@/types/domain";

function esc(v: string | number | null | undefined) {
  return String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export interface PatentamientoFisicaData {
  // Persona
  apellido: string;
  nombre: string;
  tipo_doc: string;           // DNI / LE / LC
  num_doc: string;
  cuit: string;
  nacionalidad: string;
  telefono: string;
  email: string;
  profesion: string;
  fecha_nacimiento: string;
  lugar_nacimiento: string;
  sexo: string;               // M / F
  estado_civil: string;       // soltero / casado / divorciado / viudo
  num_nupcias?: string;
  tipo_doc_conyuge?: string;
  num_doc_conyuge?: string;
  cuit_conyuge?: string;
  apellido_nombre_conyuge?: string;
  // Domicilio Legal (el del DNI)
  dom_legal_calle: string;
  dom_legal_localidad: string;
  dom_legal_partido: string;
  dom_legal_barrio?: string;
  dom_legal_cp: string;
  dom_legal_provincia: string;
  // Domicilio Real (actual)
  dom_real_calle: string;
  dom_real_localidad: string;
  dom_real_partido: string;
  dom_real_barrio?: string;
  dom_real_cp: string;
  dom_real_provincia: string;
  // Maquinaria
  uso_maquinaria: string;
  registro_inscripcion: string;
}

function row(label: string, value: string, fullWidth = false) {
  return `
  <tr>
    <td class="label" ${fullWidth ? 'colspan="3"' : ""}>${label}</td>
    ${fullWidth ? "" : '<td class="sep"></td><td class="value"></td>'}
  </tr>
  <tr>
    <td class="field-value${fullWidth ? " full"  : ""}" ${fullWidth ? 'colspan="3"' : ""}>${esc(value) || "&nbsp;"}</td>
    ${fullWidth ? "" : '<td class="sep"></td><td class="field-value"></td>'}
  </tr>`;
}

function row2(label1: string, val1: string, label2: string, val2: string) {
  return `
  <tr>
    <td class="label">${label1}</td>
    <td class="sep"></td>
    <td class="label">${label2}</td>
  </tr>
  <tr>
    <td class="field-value">${esc(val1) || "&nbsp;"}</td>
    <td class="sep"></td>
    <td class="field-value">${esc(val2) || "&nbsp;"}</td>
  </tr>`;
}

function sectionHeader(title: string) {
  return `<tr><td colspan="3" class="section-header">${title}</td></tr>`;
}

export function renderPatentamientoFisicaHtml(
  operacion: Operacion,
  d: PatentamientoFisicaData
): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Declaración Jurada Persona Física — ${esc(operacion.numero_operacion)}</title>
<style>
@page { size: A4; margin: 15mm 18mm; }
* { box-sizing: border-box; }
body {
  font-family: Arial, sans-serif;
  font-size: 11px;
  background: #e5e7eb;
  padding: 16px;
  margin: 0;
  color: #000;
}
.page {
  width: 210mm;
  min-height: 297mm;
  background: #fff;
  margin: auto;
  padding: 14mm 16mm 12mm;
  box-shadow: 0 0 12px rgba(0,0,0,.15);
}

/* Encabezado Lothar */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #111;
  padding-bottom: 10px;
  margin-bottom: 12px;
}
.logo-wrap { display: flex; align-items: center; gap: 10px; }
.logo-mark {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 30px; background: #f5d21f; color: #111;
  font-size: 22px; font-weight: 900; border: 2px solid #111;
}
.company-info { font-size: 9px; line-height: 1.5; color: #333; }
.company-info strong { font-size: 10px; color: #000; }
.doc-ref { text-align: right; font-size: 10px; line-height: 1.6; color: #444; }
.doc-ref strong { display: block; font-size: 11px; color: #000; }

/* Título del formulario */
.form-title {
  text-align: center;
  font-size: 13px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: .04em;
  border: 2px solid #000;
  padding: 6px 10px;
  margin-bottom: 12px;
  background: #f8f8f8;
}
.form-subtitle {
  font-size: 10px;
  color: #555;
  text-align: center;
  margin-top: -8px;
  margin-bottom: 12px;
}

/* Tabla de campos */
table.form-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10.5px;
}
.form-table .section-header {
  background: #111;
  color: #f5d21f;
  font-weight: bold;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .06em;
  padding: 4px 6px;
}
.form-table .label {
  font-size: 8.5px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: #444;
  padding: 6px 4px 1px;
}
.form-table .field-value {
  border-bottom: 1px solid #555;
  padding: 2px 4px 3px;
  min-height: 18px;
  font-size: 11px;
  color: #000;
}
.form-table .field-value.full { width: 100%; }
.form-table .sep { width: 12px; }
td[colspan="3"].field-value { width: 100%; }

/* Sexo inline */
.sexo-opts { display: inline-flex; gap: 20px; }
.sexo-opt {
  display: inline-flex; align-items: center; gap: 5px; font-size: 11px;
}
.sexo-box {
  display: inline-block; width: 14px; height: 14px;
  border: 1.5px solid #333; text-align: center; line-height: 12px;
  font-size: 12px; font-weight: bold;
}

/* Footer */
.form-footer {
  margin-top: 14px;
  font-size: 9px;
  color: #555;
  border-top: 1px solid #ccc;
  padding-top: 6px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.obligatorio {
  text-align: center;
  font-weight: bold;
  font-size: 10px;
  color: #c00;
  border: 1px solid #c00;
  padding: 5px 10px;
  margin-top: 14px;
  letter-spacing: .04em;
}

@media print {
  body { background: #fff; padding: 0; }
  .page { box-shadow: none; width: 100%; padding: 10mm 14mm; min-height: auto; }
}
</style>
</head>
<body>
<div class="page">

  <!-- ENCABEZADO LOTHAR -->
  <div class="header">
    <div class="logo-wrap">
      <div class="logo-mark">L</div>
      <div class="company-info">
        <strong>${esc(companyData.razonSocial)}</strong><br>
        ${esc(companyData.direccion)}<br>
        ${esc(companyData.email)} · ${esc(companyData.telefono)}
      </div>
    </div>
    <div class="doc-ref">
      <strong>Operación: ${esc(operacion.numero_operacion)}</strong>
      Fecha: ${esc(formatDate(operacion.fecha))}<br>
      Vendedor: ${esc(operacion.vendedor_nombre ?? "")}
    </div>
  </div>

  <!-- TÍTULO OFICIAL -->
  <div class="form-title">Declaración Jurada de Personas Físicas — 01 Digital</div>
  <div class="form-subtitle">Todos los datos son obligatorios sin excepción · CUIT: ${esc(companyData.cuit)}</div>

  <table class="form-table">

    <!-- DATOS PERSONALES -->
    ${sectionHeader("Datos Personales")}
    ${row("Apellido y Nombre Completo", `${d.apellido}${d.nombre ? ", " + d.nombre : ""}`, true)}
    ${row2(
      "Tipo de Documento (DNI/LE/LC)", d.tipo_doc || "DNI",
      "N° de Documento", d.num_doc
    )}
    ${row2("N° CUIT / CUIL / CDI", d.cuit, "Nacionalidad", d.nacionalidad)}
    ${row2("Teléfono", d.telefono, "E-Mail", d.email)}
    ${row("Profesión, Oficio o Actividad Principal", d.profesion, true)}
    ${row2("Fecha de Nacimiento", d.fecha_nacimiento, "Lugar de Nacimiento", d.lugar_nacimiento)}

    <!-- SEXO (fila especial) -->
    <tr>
      <td class="label" colspan="3">Sexo</td>
    </tr>
    <tr>
      <td class="field-value" colspan="3">
        <div class="sexo-opts">
          <div class="sexo-opt">
            <span class="sexo-box">${d.sexo?.toUpperCase() === "M" ? "✓" : ""}</span> M
          </div>
          <div class="sexo-opt">
            <span class="sexo-box">${d.sexo?.toUpperCase() === "F" ? "✓" : ""}</span> F
          </div>
        </div>
      </td>
    </tr>

    ${row("Estado Civil (soltero / casado / divorciado / viudo)", d.estado_civil, true)}
    ${row("N° de Nupcias (para casados, divorciados y viudos)", d.num_nupcias ?? "", true)}
    ${row2(
      "Tipo y N° de Doc. del Cónyuge (solo casados)",
      (d.tipo_doc_conyuge ?? "") + (d.num_doc_conyuge ? " — " + d.num_doc_conyuge : ""),
      "CUIT del Cónyuge (solo casados)",
      d.cuit_conyuge ?? ""
    )}
    ${row("Apellido y Nombre del Cónyuge (solo casados)", d.apellido_nombre_conyuge ?? "", true)}

    <!-- DOMICILIO LEGAL (DNI) -->
    ${sectionHeader("Domicilio que Figura en el Documento (Domicilio Legal)")}
    ${row("Calle y N°", d.dom_legal_calle, true)}
    ${row2("Localidad", d.dom_legal_localidad, "Partido / Departamento", d.dom_legal_partido)}
    ${row2("Barrio (si es CABA)", d.dom_legal_barrio ?? "", "Código Postal", d.dom_legal_cp)}
    ${row("Provincia", d.dom_legal_provincia, true)}

    <!-- DOMICILIO REAL (actual) -->
    ${sectionHeader("Domicilio donde Reside Actualmente (Domicilio Real)")}
    ${row("Calle y N°", d.dom_real_calle, true)}
    ${row2("Localidad", d.dom_real_localidad, "Partido / Departamento", d.dom_real_partido)}
    ${row2("Barrio (si es CABA)", d.dom_real_barrio ?? "", "Código Postal", d.dom_real_cp)}
    ${row("Provincia", d.dom_real_provincia, true)}

    <!-- MAQUINARIA -->
    ${sectionHeader("Datos de la Maquinaria")}
    ${row("Uso de la Maquinaria (ej. Privado, Oficial, Público, etc.)", d.uso_maquinaria, true)}
    ${row(
      "Registro en el cual se va a presentar la Inscripción (Provincia y Localidad)",
      d.registro_inscripcion,
      true
    )}

  </table>

  <div class="obligatorio">⚠ TODOS LOS DATOS SON OBLIGATORIOS SIN EXCEPCIÓN</div>

  <div class="form-footer">
    <span>Documento generado por el sistema CRM Lothar Maquinaria — ${esc(companyData.razonSocial)}</span>
    <span>Operación: ${esc(operacion.numero_operacion)} · ${esc(formatDate(operacion.fecha))}</span>
  </div>

</div>
</body>
</html>`;
}
