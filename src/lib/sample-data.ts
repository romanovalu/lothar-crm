import type { Cliente, Operacion, Producto } from "@/types/domain";

export const clientes: Cliente[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    tipo_cliente: "persona_juridica",
    nombre_razon_social: "Agro Norte S.A.",
    cuit: "30-71234567-8",
    telefono: "+54 9 351 555-1400",
    email: "compras@agronorte.com",
    direccion: "Ruta 9 km 721",
    localidad: "Jesus Maria",
    provincia: "Cordoba",
    condicion_iva: "IVA RESPONSABLE INSCRIPTO",
    created_at: "2026-06-01T12:00:00.000Z",
    updated_at: "2026-06-01T12:00:00.000Z"
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    tipo_cliente: "persona_fisica",
    nombre_razon_social: "Martin Alvarez",
    cuit: "20-28444555-1",
    telefono: "+54 9 341 555-2231",
    email: "martin.alvarez@mail.com",
    direccion: "Belgrano 420",
    localidad: "Pergamino",
    provincia: "Buenos Aires",
    condicion_iva: "CONSUMIDOR FINAL",
    created_at: "2026-06-02T12:00:00.000Z",
    updated_at: "2026-06-02T12:00:00.000Z"
  }
];

export const productos: Producto[] = [
  {
    id: "33333333-3333-4333-8333-333333333333",
    marca: "Mahindra",
    modelo: "717H",
    descripcion: "Tractor compacto 4x4 con pala frontal",
    precio_lista: 100000,
    moneda: "USD",
    garantia: "12 meses o 1.000 horas",
    imagen: null,
    activo: true,
    created_at: "2026-06-01T12:00:00.000Z",
    updated_at: "2026-06-01T12:00:00.000Z"
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    marca: "Lothar",
    modelo: "Retro 320",
    descripcion: "Retroexcavadora industrial para obra y campo",
    precio_lista: 145000,
    moneda: "USD",
    garantia: "18 meses",
    imagen: null,
    activo: true,
    created_at: "2026-06-01T12:00:00.000Z",
    updated_at: "2026-06-01T12:00:00.000Z"
  }
];

export const operaciones: Operacion[] = [
  {
    id: "55555555-5555-4555-8555-555555555555",
    numero_operacion: "OP-2026-0001",
    cliente_id: clientes[0].id,
    cliente: clientes[0],
    fecha: "2026-06-04",
    vendedor_id: "66666666-6666-4666-8666-666666666666",
    vendedor_nombre: "Roman Lopez",
    estado: "Vendida",
    moneda: "USD",
    cotizacion_dolar: 1250,
    subtotal: 100000,
    descuento: 5000,
    total: 95000,
    forma_pago: "Entrega 30% y saldo en 12 cheques mensuales.",
    observaciones: "Incluye flete hasta concesionario.",
    items: [
      {
        id: "77777777-7777-4777-8777-777777777777",
        operacion_id: "55555555-5555-4555-8555-555555555555",
        producto_id: productos[0].id,
        producto: productos[0],
        cantidad: 1,
        descripcion_manual: "Mahindra 717H con pala frontal",
        precio_unitario: 100000,
        subtotal: 100000
      }
    ],
    patentamiento: {
      id: "88888888-8888-4888-8888-888888888888",
      operacion_id: "55555555-5555-4555-8555-555555555555",
      tipo_persona: "juridica",
      datos_json: {
        representante: "Laura Martinez",
        dni_representante: "27.555.444",
        domicilio_legal: "Ruta 9 km 721"
      },
      created_at: "2026-06-04T12:00:00.000Z"
    },
    created_at: "2026-06-04T12:00:00.000Z",
    updated_at: "2026-06-04T12:00:00.000Z"
  }
];
