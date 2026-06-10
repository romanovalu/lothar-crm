import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { companyData } from "@/lib/company";
import { formatDate } from "@/lib/utils";
import type { Operacion } from "@/types/domain";

const border = "1px solid #000000";

const styles = StyleSheet.create({
  page: {
    padding: 18,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#111111"
  },
  sheet: {
    border,
    minHeight: 535
  },
  header: {
    display: "flex",
    flexDirection: "row",
    minHeight: 130
  },
  headerCell: {
    borderRight: border,
    padding: 8
  },
  logoWrap: {
    alignItems: "center",
    marginTop: 4
  },
  logoMark: {
    width: 72,
    height: 44,
    backgroundColor: "#F5D21F",
    border,
    alignItems: "center",
    justifyContent: "center"
  },
  logoText: {
    fontSize: 30,
    fontWeight: 700
  },
  company: {
    marginTop: 8,
    textAlign: "center",
    lineHeight: 1.4
  },
  bold: {
    fontWeight: 700
  },
  middleX: {
    fontSize: 58,
    fontWeight: 700,
    textAlign: "center",
    marginTop: 32
  },
  rightHead: {
    padding: 14,
    alignItems: "center"
  },
  title: {
    fontSize: 18,
    fontWeight: 700
  },
  data: {
    marginTop: 14,
    lineHeight: 1.8,
    fontSize: 10
  },
  notice: {
    borderTop: border,
    borderBottom: border,
    padding: 4,
    textAlign: "center",
    fontSize: 10,
    fontWeight: 700
  },
  row: {
    display: "flex",
    flexDirection: "row"
  },
  cell: {
    borderRight: border,
    borderBottom: border,
    padding: 4,
    minHeight: 18
  },
  noRight: {
    borderRight: "0"
  },
  th: {
    backgroundColor: "#F3F3F3",
    textAlign: "center",
    fontWeight: 700
  },
  blank: {
    minHeight: 210
  },
  totals: {
    width: 210,
    marginLeft: "auto"
  },
  footer: {
    borderTop: border,
    padding: 8,
    lineHeight: 1.8
  }
});

function proformaNumber(numeroOperacion: string) {
  return numeroOperacion.replace(/^OP-/i, "PF-");
}

function officialCurrency(value: number, currency: string) {
  return `${currency} ${new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0
  }).format(value)}`;
}

export function ProformaOficialPdf({ operacion }: { operacion: Operacion }) {
  const cliente = operacion.cliente;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={[styles.headerCell, { width: "38%" }]}>
              <View style={styles.logoWrap}>
                <View style={styles.logoMark}>
                  <Text style={styles.logoText}>L</Text>
                </View>
              </View>
              <View style={styles.company}>
                <Text style={styles.bold}>{companyData.razonSocial}</Text>
                <Text>{companyData.direccion}</Text>
                <Text>{companyData.email} - Tel.: {companyData.telefono}</Text>
                <Text> </Text>
                <Text style={styles.bold}>{companyData.condicionIva}</Text>
              </View>
            </View>

            <View style={[styles.headerCell, { width: "18%" }]}>
              <Text style={styles.middleX}>X</Text>
            </View>

            <View style={[styles.headerCell, styles.noRight, { width: "44%" }]}>
              <View style={styles.rightHead}>
                <Text style={styles.title}>FACTURA PROFORMA</Text>
                <View style={styles.data}>
                  <Text>N°: {proformaNumber(operacion.numero_operacion)}</Text>
                  <Text>FECHA: {formatDate(operacion.fecha)}</Text>
                  <Text> </Text>
                  <Text>CUIT: {companyData.cuit}</Text>
                  <Text>Ingresos Brutos: {companyData.ingresosBrutos}</Text>
                  <Text>Inicio de Actividades: {companyData.inicioActividades}</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.notice}>Comprobante No Valido Como Factura</Text>

          <View>
            <View style={styles.row}>
              <Text style={[styles.cell, { width: "60%" }]}>CLIENTE: {cliente?.nombre_razon_social.toUpperCase()}</Text>
              <Text style={[styles.cell, styles.noRight, { width: "40%" }]}>{cliente?.provincia.toUpperCase()}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.cell, { width: "60%" }]}>DOMICILIO: {cliente?.direccion}</Text>
              <Text style={[styles.cell, styles.noRight, { width: "40%" }]}>{cliente?.localidad}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.cell, { width: "60%" }]}>CUIT: {cliente?.cuit}</Text>
              <Text style={[styles.cell, styles.noRight, { width: "40%" }]}> </Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.cell, { width: "60%" }]}>CONDICION DE IVA: {cliente?.condicion_iva}</Text>
              <Text style={[styles.cell, styles.noRight, { width: "40%" }]}> </Text>
            </View>
          </View>

          <View>
            <View style={styles.row}>
              <Text style={[styles.cell, styles.th, { width: "10%" }]}>CANT.</Text>
              <Text style={[styles.cell, styles.th, { width: "60%" }]}>DESCRIPCION</Text>
              <Text style={[styles.cell, styles.th, { width: "15%" }]}>PRECIO UNIT.</Text>
              <Text style={[styles.cell, styles.th, styles.noRight, { width: "15%" }]}>IMPORTE</Text>
            </View>
            {operacion.items.map((item) => (
              <View style={styles.row} key={item.id}>
                <Text style={[styles.cell, { width: "10%" }]}>{item.cantidad}</Text>
                <Text style={[styles.cell, { width: "60%" }]}>{item.descripcion_manual.toUpperCase()}</Text>
                <Text style={[styles.cell, { width: "15%" }]}>{officialCurrency(item.precio_unitario, operacion.moneda)}</Text>
                <Text style={[styles.cell, styles.noRight, { width: "15%" }]}>{officialCurrency(item.subtotal, operacion.moneda)}</Text>
              </View>
            ))}
            <View style={styles.row}>
              <Text style={[styles.cell, styles.blank, { width: "10%" }]}> </Text>
              <Text style={[styles.cell, styles.blank, { width: "60%" }]}> </Text>
              <Text style={[styles.cell, styles.blank, { width: "15%" }]}> </Text>
              <Text style={[styles.cell, styles.blank, styles.noRight, { width: "15%" }]}> </Text>
            </View>
          </View>

          <View style={styles.totals}>
            <View style={styles.row}>
              <Text style={[styles.cell, { width: "50%" }]}>SUBTOTAL</Text>
              <Text style={[styles.cell, styles.noRight, { width: "50%", textAlign: "right" }]}>
                {officialCurrency(operacion.subtotal, operacion.moneda)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.cell, { width: "50%" }]}>DESCUENTO</Text>
              <Text style={[styles.cell, styles.noRight, { width: "50%", textAlign: "right" }]}>
                {officialCurrency(operacion.descuento, operacion.moneda)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.cell, styles.bold, { width: "50%" }]}>TOTAL</Text>
              <Text style={[styles.cell, styles.bold, styles.noRight, { width: "50%", textAlign: "right" }]}>
                {officialCurrency(operacion.total, operacion.moneda)}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text>FORMA DE PAGO: {operacion.forma_pago}</Text>
            <Text>OBSERVACIONES: {operacion.observaciones}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
