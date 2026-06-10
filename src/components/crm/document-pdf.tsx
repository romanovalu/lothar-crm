import {
  Document,
  Page,
  StyleSheet,
  Text,
  View
} from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/utils";
import type { DocumentoTipo, Operacion } from "@/types/domain";
import { getDocumentTitle } from "@/lib/document-factory";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    color: "#111111",
    fontSize: 10,
    fontFamily: "Helvetica"
  },
  header: {
    borderBottom: "2px solid #F5D21F",
    paddingBottom: 16,
    marginBottom: 22
  },
  brand: {
    fontSize: 18,
    fontWeight: 700
  },
  title: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: 700
  },
  section: {
    marginBottom: 16
  },
  label: {
    color: "#666666",
    fontSize: 8,
    textTransform: "uppercase"
  },
  value: {
    marginTop: 3,
    fontSize: 11
  },
  grid: {
    display: "flex",
    flexDirection: "row",
    gap: 12
  },
  column: {
    flex: 1
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderBottom: "1px solid #DDDDDD",
    padding: 8,
    fontSize: 8,
    fontWeight: 700
  },
  row: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1px solid #EEEEEE",
    padding: 8
  },
  qty: {
    width: "15%"
  },
  desc: {
    width: "45%"
  },
  amount: {
    width: "20%",
    textAlign: "right"
  },
  totalBox: {
    marginLeft: "auto",
    width: 180,
    backgroundColor: "#F5F5F5",
    padding: 12
  },
  total: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: 700
  }
});

export function OperationDocumentPdf({
  tipo,
  operacion
}: {
  tipo: DocumentoTipo;
  operacion: Operacion;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>LOTHAR MAQUINARIA</Text>
          <Text style={styles.title}>{getDocumentTitle(tipo)}</Text>
          <Text style={styles.value}>Operacion {operacion.numero_operacion}</Text>
        </View>

        <View style={[styles.section, styles.grid]}>
          <View style={styles.column}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>{operacion.cliente?.nombre_razon_social}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>CUIT</Text>
            <Text style={styles.value}>{operacion.cliente?.cuit}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Fecha</Text>
            <Text style={styles.value}>{operacion.fecha}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={styles.qty}>Cant.</Text>
            <Text style={styles.desc}>Descripcion</Text>
            <Text style={styles.amount}>Precio</Text>
            <Text style={styles.amount}>Subtotal</Text>
          </View>
          {operacion.items.map((item) => (
            <View style={styles.row} key={item.id}>
              <Text style={styles.qty}>{item.cantidad}</Text>
              <Text style={styles.desc}>{item.descripcion_manual}</Text>
              <Text style={styles.amount}>{formatCurrency(item.precio_unitario, operacion.moneda)}</Text>
              <Text style={styles.amount}>{formatCurrency(item.subtotal, operacion.moneda)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Forma de pago</Text>
          <Text style={styles.value}>{operacion.forma_pago}</Text>
        </View>

        {tipo.startsWith("patentamiento") && (
          <View style={styles.section}>
            <Text style={styles.label}>Datos patentamiento</Text>
            <Text style={styles.value}>{JSON.stringify(operacion.patentamiento?.datos_json ?? {}, null, 2)}</Text>
          </View>
        )}

        <View style={styles.totalBox}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.total}>{formatCurrency(operacion.total, operacion.moneda)}</Text>
        </View>
      </Page>
    </Document>
  );
}
