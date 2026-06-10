import { companyData } from "@/lib/company";
import { formatDate } from "@/lib/utils";
import type { Operacion } from "@/types/domain";

function esc(v: string | number | null | undefined) {
  return String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export interface PatentamientoJuridicaData {
  // Empresa
  razon_social: string;
  personeria_juridica: string;    // IGJ / Dir. Prov. de Pers. Jurídicas / AFIP u Otro
  fecha_inscripcion: string;
  num_inscripcion: string;        // N° o datos de inscripción
  cuit: string;
  // Domicilio Legal empresa
  emp_dom_legal_calle: string;
  emp_dom_legal_localidad: string;
  emp_dom_legal_partido: string;
  emp_dom_legal_barrio?: string;
  emp_dom_legal_cp: string;
  emp_dom_legal_provincia: string;
  // Domicilio Real empresa
  emp_dom_real_calle: string;
  emp_dom_real_localidad: string;
  emp_dom_real_partido: string;
  emp_dom_real_barrio?: string;
  emp_dom_real_cp: string;
  emp_dom_real_provincia: string;
  // Contacto y actividad
  telefono: string;
  email: string;
  actividad_principal: string;
  porcentaje_titularidad: string;
  cantidad_apoderados: string;
  uso_maquinaria: string;
  // Representante Legal / Apoderado
  rep_apellido_nombre: string;
  rep_tipo_doc: string;           // DNI / LE / LC
  rep_num_doc: string;
  rep_cuit: string;
  rep_nacionalidad: string;
  rep_telefono: string;
  rep_email: string;
  rep_profesion: string;
  rep_fecha_nacimiento: string;
  rep_lugar_nacimiento: string;
  rep_sexo: string;               // M / F
  rep_estado_civil: string;
  // Domicilio Legal Representante (DNI)
  rep_dom_legal_calle: string;
  rep_dom_legal_localidad: string;
  rep_dom_legal_partido: string;
  rep_dom_legal_barrio?: string;
  rep_dom_legal_cp: string;
  rep_dom_legal_provincia: string;
  // Domicilio Real Representante
  rep_dom_real_calle: string;
  rep_dom_real_localidad: string;
  rep_dom_real_partido: string;
  rep_dom_real_barrio?: string;
  rep_dom_real_cp: string;
  rep_dom_real_provincia: string;
  // Registro
  registro_inscripcion: string;
}

function sectionHeader(title: string) {
  return `<tr><td colspan="3" class="section-header">${title}</td></tr>`;
}

function rowFull(label: string, value: string) {
  return `
  <tr><td class="label" colspan="3">${label}</td></tr>
  <tr><td class="field-value" colspan="3">${esc(value) || "&nbsp;"}</td></tr>`;
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

function domicilioParalelo(
  tituloIzq: string,
  tituloDer: string,
  calle1: string, loc1: string, partido1: string, barrio1: string, cp1: string, prov1: string,
  calle2: string, loc2: string, partido2: string, barrio2: string, cp2: string, prov2: string,
) {
  function v(val: string) {
    return `<td class="field-value dom-col">${esc(val) || "&nbsp;"}</td>`;
  }
  function l(txt: string) {
    return `<td class="label dom-col">${txt}</td>`;
  }
  const gap = `<td class="sep"></td>`;
  return `
  <tr>
    <td class="dom-title">${tituloIzq}</td>${gap}
    <td class="dom-title">${tituloDer}</td>
  </tr>
  <tr>${l("Calle y N°")}${gap}${l("Calle y N°")}</tr>
  <tr>${v(calle1)}${gap}${v(calle2)}</tr>
  <tr>${l("Localidad")}${gap}${l("Localidad")}</tr>
  <tr>${v(loc1)}${gap}${v(loc2)}</tr>
  <tr>${l("Partido / Departamento")}${gap}${l("Partido / Departamento")}</tr>
  <tr>${v(partido1)}${gap}${v(partido2)}</tr>
  <tr>${l("Barrio (si es CABA)")}${gap}${l("Barrio (si es CABA)")}</tr>
  <tr>${v(barrio1)}${gap}${v(barrio2)}</tr>
  <tr>${l("Código Postal")}${gap}${l("Código Postal")}</tr>
  <tr>${v(cp1)}${gap}${v(cp2)}</tr>
  <tr>${l("Provincia")}${gap}${l("Provincia")}</tr>
  <tr>${v(prov1)}${gap}${v(prov2)}</tr>`;
}

export function renderPatentamientoJuridicaHtml(
  operacion: Operacion,
  d: PatentamientoJuridicaData
): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Declaración Jurada Persona Jurídica — ${esc(operacion.numero_operacion)}</title>
<style>
@page { size: A4; margin: 12mm 16mm; }
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
  padding: 12mm 15mm 10mm;
  box-shadow: 0 0 12px rgba(0,0,0,.15);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #111;
  padding-bottom: 10px;
  margin-bottom: 10px;
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

.form-title {
  text-align: center;
  font-size: 13px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: .04em;
  border: 2px solid #000;
  padding: 5px 10px;
  margin-bottom: 10px;
  background: #f8f8f8;
}
.form-subtitle {
  font-size: 10px;
  color: #555;
  text-align: center;
  margin-top: -7px;
  margin-bottom: 10px;
}

table.form-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10.5px;
  table-layout: fixed;
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
.form-table .dom-title {
  background: #f5d21f;
  color: #111;
  font-weight: bold;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: .05em;
  padding: 3px 5px;
  border: 1px solid #ccc;
}
.form-table .label {
  font-size: 8px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: #444;
  padding: 5px 4px 1px;
}
.form-table .field-value {
  border-bottom: 1px solid #555;
  padding: 2px 4px 3px;
  min-height: 17px;
  font-size: 10.5px;
  color: #000;
  word-break: break-word;
}
.form-table .dom-col { width: 47%; }
.form-table .sep { width: 6%; }

.sexo-opts { display: inline-flex; gap: 18px; }
.sexo-opt { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; }
.sexo-box {
  display: inline-block; width: 13px; height: 13px;
  border: 1.5px solid #333; text-align: center; line-height: 11px;
  font-size: 11px; font-weight: bold;
}

.form-footer {
  margin-top: 12px;
  font-size: 9px;
  color: #555;
  border-top: 1px solid #ccc;
  padding-top: 5px;
  display: flex;
  justify-content: space-between;
}
.obligatorio {
  text-align: center;
  font-weight: bold;
  font-size: 10px;
  color: #c00;
  border: 1px solid #c00;
  padding: 4px 10px;
  margin-top: 12px;
  letter-spacing: .04em;
}

@media print {
  body { background: #fff; padding: 0; }
  .page { box-shadow: none; width: 100%; padding: 8mm 13mm; min-height: auto; }
}
</style>
</head>
<body>
<div class="page">

  <!-- ENCABEZADO -->
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

  <!-- TÍTULO -->
  <div class="form-title">Declaración Jurada de Personas Jurídicas — 01 Digital</div>
  <div class="form-subtitle">Todos los datos son obligatorios sin excepción · CUIT: ${esc(companyData.cuit)}</div>

  <table class="form-table">

    <!-- DATOS DE LA EMPRESA -->
    ${sectionHeader("Datos de la Persona Jurídica")}
    ${rowFull("Denominación o Razón Social", d.razon_social)}
    ${rowFull(
      "Personería Jurídica otorgada por (I.G.J. / Dir. Prov. de Pers. Jurídicas / AFIP u Otro)",
      d.personeria_juridica
    )}
    ${row2("Fecha de Inscripción", d.fecha_inscripcion, "N° o Datos de Inscripción", d.num_inscripcion)}
    ${rowFull("CUIT / CDI", d.cuit)}

    <!-- DOMICILIOS EMPRESA -->
    ${sectionHeader("Domicilios de la Empresa")}
    ${domicilioParalelo(
      "Domicilio Legal",
      "Domicilio Real",
      d.emp_dom_legal_calle, d.emp_dom_legal_localidad, d.emp_dom_legal_partido,
      d.emp_dom_legal_barrio ?? "", d.emp_dom_legal_cp, d.emp_dom_legal_provincia,
      d.emp_dom_real_calle, d.emp_dom_real_localidad, d.emp_dom_real_partido,
      d.emp_dom_real_barrio ?? "", d.emp_dom_real_cp, d.emp_dom_real_provincia,
    )}

    <!-- ACTIVIDAD Y USO -->
    ${sectionHeader("Actividad y Uso")}
    ${row2("N° Teléfono", d.telefono, "E-Mail", d.email)}
    ${rowFull("Actividad Principal que Realiza", d.actividad_principal)}
    ${row2(
      "Porcentaje de Titularidad", d.porcentaje_titularidad,
      "Cantidad de Apoderados / Representantes (que firman por la sociedad)", d.cantidad_apoderados
    )}
    ${rowFull("Uso de la Maquinaria (ej. Privado, Oficial, Público, etc.)", d.uso_maquinaria)}

    <!-- REPRESENTANTE LEGAL -->
    ${sectionHeader("Apoderado / Representante Legal  (si es más de uno, completar una planilla por c/u)")}
    ${rowFull("Apellido y Nombre Completo", d.rep_apellido_nombre)}
    ${row2(
      "Tipo de Documento (DNI / LE / LC)", d.rep_tipo_doc,
      "N° de Documento", d.rep_num_doc
    )}
    ${row2("CUIT / CUIL / CDI", d.rep_cuit, "Nacionalidad", d.rep_nacionalidad)}
    ${row2("Teléfono", d.rep_telefono, "E-Mail", d.rep_email)}
    ${rowFull("Profesión, Oficio o Actividad Principal", d.rep_profesion)}
    ${row2("Fecha de Nacimiento", d.rep_fecha_nacimiento, "Lugar de Nacimiento", d.rep_lugar_nacimiento)}

    <tr><td class="label" colspan="3">Sexo</td></tr>
    <tr>
      <td class="field-value" colspan="3">
        <div class="sexo-opts">
          <div class="sexo-opt">
            <span class="sexo-box">${d.rep_sexo?.toUpperCase() === "M" ? "✓" : ""}</span> M
          </div>
          <div class="sexo-opt">
            <span class="sexo-box">${d.rep_sexo?.toUpperCase() === "F" ? "✓" : ""}</span> F
          </div>
        </div>
      </td>
    </tr>

    ${rowFull("Estado Civil (soltero / casado / divorciado / viudo)", d.rep_estado_civil)}

    <!-- DOMICILIOS REPRESENTANTE -->
    ${sectionHeader("Domicilios del Representante Legal")}
    ${domicilioParalelo(
      "Domicilio que Figura en el DNI (Legal)",
      "Domicilio de Residencia Actual (Real)",
      d.rep_dom_legal_calle, d.rep_dom_legal_localidad, d.rep_dom_legal_partido,
      d.rep_dom_legal_barrio ?? "", d.rep_dom_legal_cp, d.rep_dom_legal_provincia,
      d.rep_dom_real_calle, d.rep_dom_real_localidad, d.rep_dom_real_partido,
      d.rep_dom_real_barrio ?? "", d.rep_dom_real_cp, d.rep_dom_real_provincia,
    )}

    <!-- REGISTRO -->
    ${sectionHeader("Registro de Inscripción")}
    ${rowFull(
      "Registro en el cual se va a presentar la Inscripción (Provincia y Localidad)",
      d.registro_inscripcion
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
