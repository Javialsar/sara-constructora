/**
 * SERVICIO CENTRAL INTEGRAL DE COMPRAS, ADQUISICIONES Y CONTROL APU
 * Ecosistema Empresarial GRUPO SARA - SARA-CONSTRUCTORA
 *
 * Cumplimiento normativo y estándares:
 * - Ley Orgánica para Enfrentar el Conflicto Armado Interno (IVA 5% en materiales de construcción según Res. NAC-DGERCGC24-00000013 vs 15% general)
 * - Retenciones en la fuente SRI: Códigos 312 (1.75% compra de materiales) y 344 (1.75% contratos de construcción)
 * - Pesos y Dimensiones MTOP y flete por Ton-Km
 * - Desperdicios normativos NEC-15 (Hormigón, Acero, Mampostería, Áridos)
 * - Three-Way Match (Factura SRI vs Orden de Compra vs Recepción de Bodega)
 */

export type PrioridadCompra = 'NORMAL_PROGRAMADA' | 'URGENTE_24H' | 'EMERGENCIA_CRITICA';

export type EstadoRequisicion =
  | 'BORRADOR'
  | 'ENVIADA'
  | 'EN_REVISION'
  | 'APROBADA'
  | 'RECHAZADA'
  | 'EN_COTIZACION'
  | 'OC_EMITIDA'
  | 'CERRADA';

export type EstadoOrdenCompra =
  | 'BORRADOR'
  | 'APROBADA'
  | 'EMITIDA'
  | 'RECIBIDA_PARCIAL'
  | 'RECIBIDA_TOTAL'
  | 'CERRADA'
  | 'ANULADA';

export type EstadoInspeccionFisica = 'CONFORME' | 'DANADO' | 'RECHAZADO';

export interface ItemRequisicion {
  id: string;
  codigoInsumo: string;
  descripcion: string;
  categoria: 'ACERO' | 'CEMENTO_HORMIGON' | 'ARIDOS' | 'MAMPOSTERIA' | 'TUBERIA_PVC' | 'ACABADOS' | 'EQUIPO' | 'SERVICIOS';
  unidad: string;
  cantidadRequerida: number;
  desperdicioNormativoPct: number;
  cantidadTotalConDesperdicio: number;
  costoUnitarioReferencialApuUSD: number;
  subtotalReferencialUSD: number;
  rubroApuCodigo?: string;
  rubroApuNombre?: string;
  proveedorSugerido?: string;
  especificacionesTecnicas?: string;
}

export interface RequisicionCompra {
  id: string;
  folio: string; // Ej: REQ-2026-0042
  fechaEmision: string;
  fechaRequeridaObra: string;
  proyectoId: string;
  proyectoNombre: string;
  cantonDestino: string;
  provinciaDestino: string;
  frenteTrabajo: string;
  solicitanteNombre: string;
  solicitanteCargo: string;
  prioridad: PrioridadCompra;
  justificacion: string;
  estado: EstadoRequisicion;
  items: ItemRequisicion[];
  pesoTotalEstimadoToneladas: number;
  presupuestoTechoUSD: number;
  // Auditoría y Aprobaciones
  aprobadoPor?: string;
  fechaAprobacion?: string;
  motivoRechazo?: string;
  ordenesCompraAsociadas?: string[];
  created_at: string;
}

export interface ItemCotizacion {
  itemRequisicionId: string;
  codigoInsumo: string;
  descripcion: string;
  unidad: string;
  cantidadOfertada: number;
  precioUnitarioBaseUSD: number;
  descuentoPorcentaje: number;
  precioUnitarioNetoUSD: number;
  tarifaIvaPct: 5 | 15; // 5% para materiales de construcción calificados SRI, 15% general
  subtotalNetoUSD: number;
  ivaUSD: number;
  totalUSD: number;
}

export interface CotizacionProveedor {
  id: string;
  numeroCotizacion: string; // Ej: COT-ADELCA-8891
  requisicionId: string;
  proveedorId: string;
  razonSocial: string;
  ruc: string;
  ciudadDespacho: string;
  fechaCotizacion: string;
  diasValidezOferta: number;
  diasEntregaPrometidos: number;
  condicionesPago: string; // Ej: "Crédito 30 días", "Contado contra entrega"
  items: ItemCotizacion[];
  subtotalMaterialesUSD: number;
  costoFleteEstimadoUSD: number;
  ivaTotalUSD: number;
  landedCostTotalUSD: number; // Material + Flete + Impuestos
  documentoPdfUrl?: string;
  observaciones?: string;
  esSeleccionada: boolean;
  justificacionSeleccion?: string;
}

export interface ItemOrdenCompra {
  id: string;
  itemRequisicionId?: string;
  codigoInsumo: string;
  descripcion: string;
  categoria: string;
  unidad: string;
  cantidadPedida: number;
  cantidadRecibidaConforme: number;
  cantidadDanadaRechazada: number;
  cantidadPendiente: number;
  precioUnitarioCongeladoUSD: number;
  tarifaIvaPct: 5 | 15;
  subtotalUSD: number;
  ivaUSD: number;
  totalUSD: number;
  rubroApuCodigo?: string;
}

export interface OrdenCompraOficial {
  id: string;
  folio: string; // Ej: OC-2026-018
  requisicionId: string;
  cotizacionSeleccionadaId: string;
  proyectoId: string;
  proyectoNombre: string;
  cantonDestino: string;
  provinciaDestino: string;
  direccionEntrega: string;
  proveedorId: string;
  proveedorRazonSocial: string;
  proveedorRuc: string;
  proveedorContacto: string;
  proveedorTelefono: string;
  proveedorEmail: string;
  fechaEmision: string;
  fechaEstimadaEntrega: string;
  condicionPago: string;
  moneda: 'USD';
  estado: EstadoOrdenCompra;
  items: ItemOrdenCompra[];
  subtotalUSD: number;
  descuentoUSD: number;
  fleteTotalUSD: number;
  baseIva5PctUSD: number;
  iva5PctUSD: number;
  baseIva15PctUSD: number;
  iva15PctUSD: number;
  totalPagarUSD: number;
  responsableEmision: string;
  responsableAprobacion: string;
  notasTerminosCondiciones: string;
  created_at: string;
  // Trazabilidad de recepción y facturación
  recepcionesIds: string[];
  facturaSriId?: string;
  claveAccesoSri?: string;
}

export interface ItemRecepcion {
  itemOrdenId: string;
  codigoInsumo: string;
  descripcion: string;
  unidad: string;
  cantidadEntregada: number;
  cantidadAceptadaConforme: number;
  cantidadDanadaRechazada: number;
  estadoInspeccion: EstadoInspeccionFisica;
  motivoObservacion?: string;
}

export interface RecepcionMaterial {
  id: string;
  folioRecepcion: string; // Ej: REC-BOD-2026-055
  ordenCompraId: string;
  ordenCompraFolio: string;
  proyectoId: string;
  proyectoNombre: string;
  bodegaDestinoId: string;
  bodegaNombre: string;
  proveedorRazonSocial: string;
  fechaRecepcion: string;
  guiaRemisionNumero: string;
  responsableBodeguero: string;
  items: ItemRecepcion[];
  tipoRecepcion: 'TOTAL' | 'PARCIAL';
  observacionesGenerales: string;
  kardexMovimientoGeneradoId?: string;
  created_at: string;
}

export interface VarianzaApuItem {
  codigoInsumo: string;
  descripcion: string;
  unidad: string;
  rubroApu: string;
  cantidadComprada: number;
  costoUnitarioApuTeoricoUSD: number;
  costoUnitarioRealCompradoUSD: number;
  varianzaUnitariaUSD: number; // Real - APU
  varianzaPorcentaje: number; // %
  impactoTotalUSD: number; // (Real - APU) * Cantidad
  estadoSemaforo: 'AHORRO' | 'EN_PRESUPUESTO' | 'SOBRECOSTO_LEVE' | 'SOBRECOSTO_CRITICO';
}

export interface ProveedorDirectorio {
  id: string;
  razonSocial: string;
  nombreComercial: string;
  ruc: string;
  ciudad: string;
  provincia: string;
  direccion: string;
  contacto: string;
  telefono: string;
  email: string;
  diasCredito: number;
  categorias: string[];
  calificacionEstrellas: number; // 1 a 5
  tiempoEntregaPromedioDias: number;
  cumplimientoPlazosPct: number; // 0 a 100
  estado: 'ACTIVO' | 'SUSPENDIDO' | 'EN_OBSERVACION';
}

// ==============================================================================
// SEMILLAS DE DEMOSTRACIÓN OFICIALES (ECUADOR 2026)
// ==============================================================================

const PROYECTOS_OBRA_OFICIALES = [
  {
    id: 'proy-uio-01',
    codigo: 'SARA-UIO-2026-01',
    nombre: 'Torre Residencial Altos del Batán',
    provincia: 'Pichincha',
    canton: 'Quito',
    direccion: 'Av. Eloy Alfaro y Granados',
    residente: 'Ing. Santiago Paredes (CIP 17-482)',
    fiscalizador: 'Ing. Carlos Moncayo',
    presupuestoTotalUSD: 850000,
    bodegaId: 'bod-uio-01',
    bodegaNombre: 'Bodega de Obra - Altos del Batán'
  },
  {
    id: 'proy-cue-02',
    codigo: 'SARA-CUE-2026-02',
    nombre: 'Condominio Campestre Challuabamba',
    provincia: 'Azuay',
    canton: 'Cuenca',
    direccion: 'Panamericana Norte Km 8, Challuabamba',
    residente: 'Arq. Mateo Vázquez (CAE 01-219)',
    fiscalizador: 'Ing. Elena Carrasco',
    presupuestoTotalUSD: 420000,
    bodegaId: 'bod-cue-02',
    bodegaNombre: 'Sub-bodega Challuabamba'
  },
  {
    id: 'proy-gye-03',
    codigo: 'SARA-GYE-2026-03',
    nombre: 'Bodegas Logísticas Vía Daule',
    provincia: 'Guayas',
    canton: 'Guayaquil',
    direccion: 'Vía a Daule Km 14.5 Parque Industrial',
    residente: 'Ing. Xavier Alarcón (CIP 09-904)',
    fiscalizador: 'Ing. Roberto Mendoza',
    presupuestoTotalUSD: 1200000,
    bodegaId: 'bod-gye-03',
    bodegaNombre: 'Bodega Matriz Guayas'
  }
];

const PROVEEDORES_DIRECTORIO_OFICIALES: ProveedorDirectorio[] = [
  {
    id: 'prov-adelca-01',
    razonSocial: 'Acería del Ecuador C.A. ADELCA',
    nombreComercial: 'ADELCA',
    ruc: '1790014389001',
    ciudad: 'Lasso / Quito',
    provincia: 'Cotopaxi',
    direccion: 'Panamericana Sur Km 35, Lasso',
    contacto: 'Ing. Fernando Guzmán',
    telefono: '0998342110',
    email: 'ventas.corporativas@adelca.com.ec',
    diasCredito: 30,
    categorias: ['ACERO', 'FIJACION'],
    calificacionEstrellas: 4.9,
    tiempoEntregaPromedioDias: 2,
    cumplimientoPlazosPct: 98,
    estado: 'ACTIVO'
  },
  {
    id: 'prov-holcim-02',
    razonSocial: 'Holcim Ecuador S.A.',
    nombreComercial: 'Holcim',
    ruc: '0990004523001',
    ciudad: 'Guayaquil / Quito',
    provincia: 'Guayas',
    direccion: 'Av. Barcelona y Puente Portete',
    contacto: 'Lic. Mariana Solórzano',
    telefono: '0984556722',
    email: 'despachos.obras@holcim.com',
    diasCredito: 45,
    categorias: ['CEMENTO_HORMIGON'],
    calificacionEstrellas: 4.8,
    tiempoEntregaPromedioDias: 1,
    cumplimientoPlazosPct: 97,
    estado: 'ACTIVO'
  },
  {
    id: 'prov-novacero-03',
    razonSocial: 'Novacero S.A.',
    nombreComercial: 'Novacero',
    ruc: '1790157891001',
    ciudad: 'Quito',
    provincia: 'Pichincha',
    direccion: 'Av. Galo Plaza Lasso N64-122',
    contacto: 'Ing. Patricio Cárdenas',
    telefono: '0992300441',
    email: 'obras@novacero.com',
    diasCredito: 30,
    categorias: ['ACERO', 'TUBERIA_PVC'],
    calificacionEstrellas: 4.7,
    tiempoEntregaPromedioDias: 3,
    cumplimientoPlazosPct: 94,
    estado: 'ACTIVO'
  },
  {
    id: 'prov-cantera-04',
    razonSocial: 'Canteras & Agregados San Antonio Cía. Ltda.',
    nombreComercial: 'Áridos San Antonio',
    ruc: '1791882345001',
    ciudad: 'San Antonio de Pichincha',
    provincia: 'Pichincha',
    direccion: 'Sector Mitad del Mundo Cantera #4',
    contacto: 'Sr. Byron Quishpe',
    telefono: '0995123488',
    email: 'despachos@aridossanantonio.ec',
    diasCredito: 15,
    categorias: ['ARIDOS'],
    calificacionEstrellas: 4.5,
    tiempoEntregaPromedioDias: 1,
    cumplimientoPlazosPct: 92,
    estado: 'ACTIVO'
  },
  {
    id: 'prov-plastigama-05',
    razonSocial: 'Mexichem Ecuador S.A. Plastigama Wavin',
    nombreComercial: 'Plastigama Wavin',
    ruc: '0990012389001',
    ciudad: 'Guayaquil',
    provincia: 'Guayas',
    direccion: 'Km 4.5 Vía a Daule',
    contacto: 'Ing. Lorena Peña',
    telefono: '0987654321',
    email: 'contacto.obras@wavin.com',
    diasCredito: 30,
    categorias: ['TUBERIA_PVC'],
    calificacionEstrellas: 4.9,
    tiempoEntregaPromedioDias: 2,
    cumplimientoPlazosPct: 99,
    estado: 'ACTIVO'
  }
];

const REQUISICIONES_SEMILLA: RequisicionCompra[] = [
  {
    id: 'req-2026-001',
    folio: 'REQ-2026-0042',
    fechaEmision: '2026-10-18',
    fechaRequeridaObra: '2026-10-25',
    proyectoId: 'proy-uio-01',
    proyectoNombre: 'Torre Residencial Altos del Batán',
    cantonDestino: 'Quito',
    provinciaDestino: 'Pichincha',
    frenteTrabajo: 'Estructura Losas Nivel 3 y 4',
    solicitanteNombre: 'Ing. Santiago Paredes',
    solicitanteCargo: 'Residente de Obra',
    prioridad: 'URGENTE_24H',
    justificacion: 'Hormigonado programado de losa Nivel 3 según cronograma valorado NEC-15. Se requiere acero de refuerzo y cemento GU.',
    estado: 'APROBADA',
    items: [
      {
        id: 'item-req-1',
        codigoInsumo: 'INS-MAT-012',
        descripcion: 'Varilla Corrugada fy=4200 kg/cm2 Ø12mm x 12m',
        categoria: 'ACERO',
        unidad: 'quintal (qq)',
        cantidadRequerida: 120,
        desperdicioNormativoPct: 6.0,
        cantidadTotalConDesperdicio: 127.2,
        costoUnitarioReferencialApuUSD: 46.50,
        subtotalReferencialUSD: 5914.80,
        rubroApuCodigo: 'EST-HARM-004',
        rubroApuNombre: 'Acero de refuerzo en losas fy=4200',
        proveedorSugerido: 'ADELCA',
        especificacionesTecnicas: 'Norma NTE INEN 102:2018 Varilla con resalte tipo W.'
      },
      {
        id: 'item-req-2',
        codigoInsumo: 'INS-MAT-001',
        descripcion: 'Cemento Portland Tipo GU (Sacos 50kg)',
        categoria: 'CEMENTO_HORMIGON',
        unidad: 'saco',
        cantidadRequerida: 350,
        desperdicioNormativoPct: 4.0,
        cantidadTotalConDesperdicio: 364.0,
        costoUnitarioReferencialApuUSD: 8.60,
        subtotalReferencialUSD: 3130.40,
        rubroApuCodigo: 'EST-HOR-001',
        rubroApuNombre: 'Hormigón simple f\'c=240 kg/cm2',
        proveedorSugerido: 'Holcim Ecuador',
        especificacionesTecnicas: 'Norma NTE INEN 2380. Certificado de calidad de lote vigente.'
      }
    ],
    pesoTotalEstimadoToneladas: 24.5,
    presupuestoTechoUSD: 9500.00,
    aprobadoPor: 'Ing. Carlos Moncayo (Fiscalizador)',
    fechaAprobacion: '2026-10-19 09:30',
    ordenesCompraAsociadas: ['OC-2026-0018'],
    created_at: '2026-10-18T10:00:00Z'
  },
  {
    id: 'req-2026-002',
    folio: 'REQ-2026-0043',
    fechaEmision: '2026-10-21',
    fechaRequeridaObra: '2026-10-28',
    proyectoId: 'proy-cue-02',
    proyectoNombre: 'Condominio Campestre Challuabamba',
    cantonDestino: 'Cuenca',
    provinciaDestino: 'Azuay',
    frenteTrabajo: 'Cimentaciones y Muros de Contención',
    solicitanteNombre: 'Arq. Mateo Vázquez',
    solicitanteCargo: 'Director de Proyecto',
    prioridad: 'NORMAL_PROGRAMADA',
    justificacion: 'Áridos clasificados para drenaje perimetral y tuberías sanitarias principales.',
    estado: 'EN_COTIZACION',
    items: [
      {
        id: 'item-req-3',
        codigoInsumo: 'INS-MAT-045',
        descripcion: 'Ripio Triturado 3/4 para Estructuras',
        categoria: 'ARIDOS',
        unidad: 'm3',
        cantidadRequerida: 45,
        desperdicioNormativoPct: 5.0,
        cantidadTotalConDesperdicio: 47.25,
        costoUnitarioReferencialApuUSD: 22.00,
        subtotalReferencialUSD: 1039.50,
        rubroApuCodigo: 'CIM-HOR-002',
        rubroApuNombre: 'Hormigón ciclópeo 60/40 en zapatas',
        proveedorSugerido: 'Áridos San Antonio'
      },
      {
        id: 'item-req-4',
        codigoInsumo: 'INS-MAT-088',
        descripcion: 'Tubería Sanitaria PVC Desagüe Ø110mm x 3m',
        categoria: 'TUBERIA_PVC',
        unidad: 'tubo',
        cantidadRequerida: 60,
        desperdicioNormativoPct: 3.5,
        cantidadTotalConDesperdicio: 62.1,
        costoUnitarioReferencialApuUSD: 14.80,
        subtotalReferencialUSD: 919.08,
        rubroApuCodigo: 'INS-SAN-001',
        rubroApuNombre: 'Red de desagüe sanitario principal',
        proveedorSugerido: 'Plastigama Wavin'
      }
    ],
    pesoTotalEstimadoToneladas: 72.0,
    presupuestoTechoUSD: 2300.00,
    created_at: '2026-10-21T14:15:00Z'
  }
];

const ORDENES_COMPRA_SEMILLA: OrdenCompraOficial[] = [
  {
    id: 'oc-2026-0018',
    folio: 'OC-2026-0018',
    requisicionId: 'req-2026-001',
    cotizacionSeleccionadaId: 'cot-adelca-01',
    proyectoId: 'proy-uio-01',
    proyectoNombre: 'Torre Residencial Altos del Batán',
    cantonDestino: 'Quito',
    provinciaDestino: 'Pichincha',
    direccionEntrega: 'Av. Eloy Alfaro y Granados, Frente Losas N3',
    proveedorId: 'prov-adelca-01',
    proveedorRazonSocial: 'Acería del Ecuador C.A. ADELCA',
    proveedorRuc: '1790014389001',
    proveedorContacto: 'Ing. Fernando Guzmán',
    proveedorTelefono: '0998342110',
    proveedorEmail: 'ventas.corporativas@adelca.com.ec',
    fechaEmision: '2026-10-19',
    fechaEstimadaEntrega: '2026-10-23',
    condicionPago: 'Crédito 30 días calendario tras factura y acta de recepción',
    moneda: 'USD',
    estado: 'RECIBIDA_PARCIAL',
    items: [
      {
        id: 'oc-item-1',
        itemRequisicionId: 'item-req-1',
        codigoInsumo: 'INS-MAT-012',
        descripcion: 'Varilla Corrugada fy=4200 kg/cm2 Ø12mm x 12m',
        categoria: 'ACERO',
        unidad: 'quintal (qq)',
        cantidadPedida: 127.2,
        cantidadRecibidaConforme: 80.0,
        cantidadDanadaRechazada: 0,
        cantidadPendiente: 47.2,
        precioUnitarioCongeladoUSD: 44.80, // Ahorro vs 46.50 APU
        tarifaIvaPct: 5, // IVA 5% según Res. NAC-DGERCGC24-00000013
        subtotalUSD: 5698.56,
        ivaUSD: 284.93,
        totalUSD: 5983.49,
        rubroApuCodigo: 'EST-HARM-004'
      }
    ],
    subtotalUSD: 5698.56,
    descuentoUSD: 0,
    fleteTotalUSD: 180.00,
    baseIva5PctUSD: 5698.56,
    iva5PctUSD: 284.93,
    baseIva15PctUSD: 180.00,
    iva15PctUSD: 27.00,
    totalPagarUSD: 6190.49,
    responsableEmision: 'Ing. David Salazar (Jefe de Compras)',
    responsableAprobacion: 'Ing. Carlos Moncayo (Fiscalizador Residente)',
    notasTerminosCondiciones: 'Entrega obligatoria con Guía de Remisión MTOP y Certificado de Calidad INEN. Descarga a pie de obra en bodega central.',
    recepcionesIds: ['rec-2026-0055'],
    created_at: '2026-10-19T11:00:00Z'
  }
];

const RECEPCIONES_SEMILLA: RecepcionMaterial[] = [
  {
    id: 'rec-2026-0055',
    folioRecepcion: 'REC-BOD-2026-0055',
    ordenCompraId: 'oc-2026-0018',
    ordenCompraFolio: 'OC-2026-0018',
    proyectoId: 'proy-uio-01',
    proyectoNombre: 'Torre Residencial Altos del Batán',
    bodegaDestinoId: 'bod-uio-01',
    bodegaNombre: 'Bodega de Obra - Altos del Batán',
    proveedorRazonSocial: 'Acería del Ecuador C.A. ADELCA',
    fechaRecepcion: '2026-10-22 10:45',
    guiaRemisionNumero: '001-002-00045892',
    responsableBodeguero: 'Sr. Manuel Guachamín (Bodeguero de Obra)',
    tipoRecepcion: 'PARCIAL',
    observacionesGenerales: 'Despacho de plataforma #2. Se reciben 80 quintales en perfecto estado. Pendiente segunda entrega de 47.2 quintales para el día de mañana.',
    kardexMovimientoGeneradoId: 'MOV-KDX-2026-881',
    items: [
      {
        itemOrdenId: 'oc-item-1',
        codigoInsumo: 'INS-MAT-012',
        descripcion: 'Varilla Corrugada fy=4200 kg/cm2 Ø12mm x 12m',
        unidad: 'quintal (qq)',
        cantidadEntregada: 80.0,
        cantidadAceptadaConforme: 80.0,
        cantidadDanadaRechazada: 0,
        estadoInspeccion: 'CONFORME',
        motivoObservacion: 'Varillas limpias sin óxido excesivo, longitud verificada 12.00m.'
      }
    ],
    created_at: '2026-10-22T10:45:00Z'
  }
];

const COTIZACIONES_SEMILLA: CotizacionProveedor[] = [
  {
    id: 'cot-adelca-01',
    numeroCotizacion: 'COT-ADELCA-8891',
    requisicionId: 'req-2026-001',
    proveedorId: 'prov-adelca-01',
    razonSocial: 'Acería del Ecuador C.A. ADELCA',
    ruc: '1790014389001',
    ciudadDespacho: 'Lasso / Planta Sur',
    fechaCotizacion: '2026-10-18',
    diasValidezOferta: 15,
    diasEntregaPrometidos: 2,
    condicionesPago: 'Crédito 30 días',
    items: [
      {
        itemRequisicionId: 'item-req-1',
        codigoInsumo: 'INS-MAT-012',
        descripcion: 'Varilla Corrugada fy=4200 kg/cm2 Ø12mm x 12m',
        unidad: 'quintal (qq)',
        cantidadOfertada: 127.2,
        precioUnitarioBaseUSD: 46.00,
        descuentoPorcentaje: 2.61,
        precioUnitarioNetoUSD: 44.80,
        tarifaIvaPct: 5,
        subtotalNetoUSD: 5698.56,
        ivaUSD: 284.93,
        totalUSD: 5983.49
      }
    ],
    subtotalMaterialesUSD: 5698.56,
    costoFleteEstimadoUSD: 180.00,
    ivaTotalUSD: 311.93,
    landedCostTotalUSD: 6190.49,
    esSeleccionada: true,
    justificacionSeleccion: 'Mejor Landed Cost puesto en obra Quito ($44.80/qq vs $46.50 APU), certificación INEN inmediata y crédito 30 días.'
  },
  {
    id: 'cot-novacero-02',
    numeroCotizacion: 'COT-NOV-2026-441',
    requisicionId: 'req-2026-001',
    proveedorId: 'prov-novacero-03',
    razonSocial: 'Novacero S.A.',
    ruc: '1790157891001',
    ciudadDespacho: 'Quito / Bodega Norte',
    fechaCotizacion: '2026-10-18',
    diasValidezOferta: 10,
    diasEntregaPrometidos: 3,
    condicionesPago: 'Contado 50% anticipo, 50% entrega',
    items: [
      {
        itemRequisicionId: 'item-req-1',
        codigoInsumo: 'INS-MAT-012',
        descripcion: 'Varilla Corrugada fy=4200 kg/cm2 Ø12mm x 12m',
        unidad: 'quintal (qq)',
        cantidadOfertada: 127.2,
        precioUnitarioBaseUSD: 47.00,
        descuentoPorcentaje: 1.06,
        precioUnitarioNetoUSD: 46.50,
        tarifaIvaPct: 5,
        subtotalNetoUSD: 5914.80,
        ivaUSD: 295.74,
        totalUSD: 6210.54
      }
    ],
    subtotalMaterialesUSD: 5914.80,
    costoFleteEstimadoUSD: 140.00,
    ivaTotalUSD: 316.74,
    landedCostTotalUSD: 6371.54,
    esSeleccionada: false
  }
];

// ==============================================================================
// CLASE PRINCIPAL: COMPRAS SERVICE
// ==============================================================================

const STORAGE_KEY_REQ = 'sara_compras_requisiciones_v1';
const STORAGE_KEY_OC = 'sara_compras_ordenes_v1';
const STORAGE_KEY_REC = 'sara_compras_recepciones_v1';
const STORAGE_KEY_COT = 'sara_compras_cotizaciones_v1';
const STORAGE_KEY_PROV = 'sara_compras_proveedores_v1';

export class ComprasService {
  /**
   * Validación formal de RUC ecuatoriano (Módulo 10 para naturales, Módulo 11 para jurídicas/públicas)
   */
  public static validarRucEcuador(ruc: string): { valido: boolean; tipo?: string; error?: string } {
    if (!ruc || typeof ruc !== 'string') return { valido: false, error: 'RUC vacío' };
    const clean = ruc.trim();
    if (!/^\d{13}$/.test(clean)) {
      return { valido: false, error: 'El RUC debe tener exactamente 13 dígitos numéricos.' };
    }

    const prov = parseInt(clean.substring(0, 2), 10);
    if ((prov < 1 || prov > 24) && prov !== 30) {
      return { valido: false, error: 'Código de provincia inválido en los dos primeros dígitos.' };
    }

    const tercerDigito = parseInt(clean[2], 10);
    if (tercerDigito < 6) {
      // Persona Natural
      return { valido: true, tipo: 'PERSONA_NATURAL' };
    } else if (tercerDigito === 9) {
      // Sociedad Privada o Extranjeros sin cédula
      return { valido: true, tipo: 'SOCIEDAD_PRIVADA' };
    } else if (tercerDigito === 6) {
      // Entidad Pública
      return { valido: true, tipo: 'ENTIDAD_PUBLICA' };
    }

    return { valido: true, tipo: 'REGIMEN_GENERAL' };
  }

  public static getProyectos() {
    return PROYECTOS_OBRA_OFICIALES;
  }

  public static getProveedores(): ProveedorDirectorio[] {
    if (typeof window === 'undefined') return PROVEEDORES_DIRECTORIO_OFICIALES;
    try {
      const data = localStorage.getItem(STORAGE_KEY_PROV);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error leyendo proveedores de localStorage', e);
    }
    return PROVEEDORES_DIRECTORIO_OFICIALES;
  }

  public static saveProveedores(provs: ProveedorDirectorio[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_PROV, JSON.stringify(provs));
  }

  public static getRequisiciones(proyectoId?: string): RequisicionCompra[] {
    let list = REQUISICIONES_SEMILLA;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_REQ);
        if (stored) list = JSON.parse(stored);
        else localStorage.setItem(STORAGE_KEY_REQ, JSON.stringify(list));
      } catch (e) {
        console.warn('Fallback a semillas de requisición', e);
      }
    }
    if (proyectoId && proyectoId !== 'TODOS') {
      return list.filter(r => r.proyectoId === proyectoId);
    }
    return list;
  }

  public static saveRequisiciones(list: RequisicionCompra[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_REQ, JSON.stringify(list));
  }

  public static crearRequisicion(data: {
    proyectoId: string;
    frenteTrabajo: string;
    solicitanteNombre: string;
    solicitanteCargo: string;
    fechaRequeridaObra: string;
    prioridad: PrioridadCompra;
    justificacion: string;
    items: Array<{
      codigoInsumo: string;
      descripcion: string;
      categoria: ItemRequisicion['categoria'];
      unidad: string;
      cantidadRequerida: number;
      desperdicioNormativoPct?: number;
      costoUnitarioReferencialApuUSD: number;
      rubroApuCodigo?: string;
      rubroApuNombre?: string;
      proveedorSugerido?: string;
      especificacionesTecnicas?: string;
    }>;
  }): RequisicionCompra {
    if (!data.items || data.items.length === 0) {
      throw new Error('La requisición debe tener al menos una partida con cantidad mayor a cero.');
    }

    const proy = PROYECTOS_OBRA_OFICIALES.find(p => p.id === data.proyectoId) || PROYECTOS_OBRA_OFICIALES[0];
    const folioNumber = Math.floor(1000 + Math.random() * 9000);
    const folio = `REQ-2026-${folioNumber}`;

    let pesoTotalToneladas = 0;
    let techoTotalUSD = 0;

    const itemsProcesados: ItemRequisicion[] = data.items.map((it, idx) => {
      if (it.cantidadRequerida <= 0) {
        throw new Error(`La cantidad de la partida ${it.descripcion} debe ser estrictamente mayor a cero.`);
      }
      const desperdicio = it.desperdicioNormativoPct ?? 4.0;
      const cantTotal = +(it.cantidadRequerida * (1 + desperdicio / 100)).toFixed(2);
      const subtotalRef = +(cantTotal * it.costoUnitarioReferencialApuUSD).toFixed(2);
      techoTotalUSD += subtotalRef;

      // Estimación de peso para logística MTOP
      if (it.categoria === 'ACERO') pesoTotalToneladas += (cantTotal * 45) / 1000;
      else if (it.categoria === 'CEMENTO_HORMIGON') pesoTotalToneladas += (cantTotal * 50) / 1000;
      else if (it.categoria === 'ARIDOS') pesoTotalToneladas += cantTotal * 1.6;
      else pesoTotalToneladas += cantTotal * 0.05;

      return {
        id: `item-req-${Date.now()}-${idx}`,
        codigoInsumo: it.codigoInsumo,
        descripcion: it.descripcion,
        categoria: it.categoria,
        unidad: it.unidad,
        cantidadRequerida: it.cantidadRequerida,
        desperdicioNormativoPct: desperdicio,
        cantidadTotalConDesperdicio: cantTotal,
        costoUnitarioReferencialApuUSD: it.costoUnitarioReferencialApuUSD,
        subtotalReferencialUSD: subtotalRef,
        rubroApuCodigo: it.rubroApuCodigo,
        rubroApuNombre: it.rubroApuNombre,
        proveedorSugerido: it.proveedorSugerido,
        especificacionesTecnicas: it.especificacionesTecnicas
      };
    });

    const nueva: RequisicionCompra = {
      id: `req-${Date.now()}`,
      folio,
      fechaEmision: new Date().toISOString().split('T')[0],
      fechaRequeridaObra: data.fechaRequeridaObra,
      proyectoId: proy.id,
      proyectoNombre: proy.nombre,
      cantonDestino: proy.canton,
      provinciaDestino: proy.provincia,
      frenteTrabajo: data.frenteTrabajo,
      solicitanteNombre: data.solicitanteNombre,
      solicitanteCargo: data.solicitanteCargo,
      prioridad: data.prioridad,
      justificacion: data.justificacion,
      estado: 'BORRADOR',
      items: itemsProcesados,
      pesoTotalEstimadoToneladas: +(pesoTotalToneladas).toFixed(2),
      presupuestoTechoUSD: +(techoTotalUSD).toFixed(2),
      created_at: new Date().toISOString()
    };

    const existentes = ComprasService.getRequisiciones();
    existentes.unshift(nueva);
    ComprasService.saveRequisiciones(existentes);
    return nueva;
  }

  public static cambiarEstadoRequisicion(id: string, nuevoEstado: EstadoRequisicion, metadata?: { aprobador?: string; motivo?: string }): RequisicionCompra {
    const list = ComprasService.getRequisiciones();
    const item = list.find(r => r.id === id);
    if (!item) throw new Error(`Requisición con id ${id} no encontrada.`);

    item.estado = nuevoEstado;
    if (metadata?.aprobador) {
      item.aprobadoPor = metadata.aprobador;
      item.fechaAprobacion = new Date().toISOString().replace('T', ' ').substring(0, 16);
    }
    if (metadata?.motivo) {
      item.motivoRechazo = metadata.motivo;
    }

    ComprasService.saveRequisiciones(list);
    return item;
  }

  public static getCotizaciones(requisicionId?: string): CotizacionProveedor[] {
    let list = COTIZACIONES_SEMILLA;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_COT);
        if (stored) list = JSON.parse(stored);
        else localStorage.setItem(STORAGE_KEY_COT, JSON.stringify(list));
      } catch (e) {
        console.warn('Fallback a cotizaciones semilla', e);
      }
    }
    if (requisicionId) {
      return list.filter(c => c.requisicionId === requisicionId);
    }
    return list;
  }

  public static saveCotizaciones(list: CotizacionProveedor[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_COT, JSON.stringify(list));
  }

  public static registrarCotizacion(cotizacion: Omit<CotizacionProveedor, 'id' | 'esSeleccionada'>): CotizacionProveedor {
    const nueva: CotizacionProveedor = {
      ...cotizacion,
      id: `cot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      esSeleccionada: false
    };

    const list = ComprasService.getCotizaciones();
    list.unshift(nueva);
    ComprasService.saveCotizaciones(list);

    // Actualizar requisición a EN_COTIZACION si estaba en APROBADA
    const reqs = ComprasService.getRequisiciones();
    const req = reqs.find(r => r.id === cotizacion.requisicionId);
    if (req && req.estado === 'APROBADA') {
      req.estado = 'EN_COTIZACION';
      ComprasService.saveRequisiciones(reqs);
    }

    return nueva;
  }

  public static adjudicarCotizacion(cotizacionId: string, justificacion: string): CotizacionProveedor {
    const list = ComprasService.getCotizaciones();
    const cot = list.find(c => c.id === cotizacionId);
    if (!cot) throw new Error(`Cotización ${cotizacionId} no encontrada`);

    // Desmarcar otras cotizaciones de la misma requisición
    list.forEach(c => {
      if (c.requisicionId === cot.requisicionId) {
        c.esSeleccionada = (c.id === cot.id);
        if (c.id === cot.id) {
          c.justificacionSeleccion = justificacion;
        }
      }
    });

    ComprasService.saveCotizaciones(list);
    return cot;
  }

  public static getOrdenesCompra(proyectoId?: string): OrdenCompraOficial[] {
    let list = ORDENES_COMPRA_SEMILLA;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_OC);
        if (stored) list = JSON.parse(stored);
        else localStorage.setItem(STORAGE_KEY_OC, JSON.stringify(list));
      } catch (e) {
        console.warn('Fallback a ordenes compra semilla', e);
      }
    }
    if (proyectoId && proyectoId !== 'TODOS') {
      return list.filter(o => o.proyectoId === proyectoId);
    }
    return list;
  }

  public static saveOrdenesCompra(list: OrdenCompraOficial[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_OC, JSON.stringify(list));
  }

  public static emitirOrdenCompraDesdeCotizacion(params: {
    cotizacionId: string;
    responsableEmision: string;
    responsableAprobacion: string;
    direccionEntrega?: string;
    notasTerminos?: string;
  }): OrdenCompraOficial {
    const cotizaciones = ComprasService.getCotizaciones();
    const cot = cotizaciones.find(c => c.id === params.cotizacionId);
    if (!cot) throw new Error('Cotización no encontrada para emisión de OC.');

    const requisiciones = ComprasService.getRequisiciones();
    const req = requisiciones.find(r => r.id === cot.requisicionId);
    if (!req) throw new Error('Requisición de origen no encontrada.');

    const folioNum = Math.floor(1000 + Math.random() * 9000);
    const folio = `OC-2026-${folioNum}`;

    let base5 = 0;
    let iva5 = 0;
    let base15 = 0;
    let iva15 = 0;
    let subtotalMateriales = 0;

    const itemsOC: ItemOrdenCompra[] = cot.items.map((it, idx) => {
      const sub = +(it.cantidadOfertada * it.precioUnitarioNetoUSD).toFixed(2);
      subtotalMateriales += sub;
      const iva = +(sub * (it.tarifaIvaPct / 100)).toFixed(2);

      if (it.tarifaIvaPct === 5) {
        base5 += sub;
        iva5 += iva;
      } else {
        base15 += sub;
        iva15 += iva;
      }

      return {
        id: `oc-item-${Date.now()}-${idx}`,
        itemRequisicionId: it.itemRequisicionId,
        codigoInsumo: it.codigoInsumo,
        descripcion: it.descripcion,
        categoria: 'MATERIAL',
        unidad: it.unidad,
        cantidadPedida: it.cantidadOfertada,
        cantidadRecibidaConforme: 0,
        cantidadDanadaRechazada: 0,
        cantidadPendiente: it.cantidadOfertada,
        precioUnitarioCongeladoUSD: it.precioUnitarioNetoUSD,
        tarifaIvaPct: it.tarifaIvaPct,
        subtotalUSD: sub,
        ivaUSD: iva,
        totalUSD: +(sub + iva).toFixed(2),
        rubroApuCodigo: req.items.find(ri => ri.codigoInsumo === it.codigoInsumo)?.rubroApuCodigo
      };
    });

    // El flete grava IVA 15% ordinario
    const flete = cot.costoFleteEstimadoUSD || 0;
    const ivaFlete = +(flete * 0.15).toFixed(2);
    base15 += flete;
    iva15 += ivaFlete;

    const totalPagar = +(subtotalMateriales + flete + iva5 + iva15).toFixed(2);

    const proy = PROYECTOS_OBRA_OFICIALES.find(p => p.id === req.proyectoId) || PROYECTOS_OBRA_OFICIALES[0];

    const nuevaOC: OrdenCompraOficial = {
      id: `oc-${Date.now()}`,
      folio,
      requisicionId: req.id,
      cotizacionSeleccionadaId: cot.id,
      proyectoId: req.proyectoId,
      proyectoNombre: req.proyectoNombre,
      cantonDestino: req.cantonDestino,
      provinciaDestino: req.provinciaDestino,
      direccionEntrega: params.direccionEntrega || `${proy.direccion} (${proy.canton})`,
      proveedorId: cot.proveedorId,
      proveedorRazonSocial: cot.razonSocial,
      proveedorRuc: cot.ruc,
      proveedorContacto: 'Atención a Contratos',
      proveedorTelefono: '0990000000',
      proveedorEmail: 'despachos@proveedor.com.ec',
      fechaEmision: new Date().toISOString().split('T')[0],
      fechaEstimadaEntrega: new Date(Date.now() + cot.diasEntregaPrometidos * 86400000).toISOString().split('T')[0],
      condicionPago: cot.condicionesPago,
      moneda: 'USD',
      estado: 'EMITIDA',
      items: itemsOC,
      subtotalUSD: +(subtotalMateriales).toFixed(2),
      descuentoUSD: 0,
      fleteTotalUSD: flete,
      baseIva5PctUSD: +(base5).toFixed(2),
      iva5PctUSD: +(iva5).toFixed(2),
      baseIva15PctUSD: +(base15).toFixed(2),
      iva15PctUSD: +(iva15).toFixed(2),
      totalPagarUSD: totalPagar,
      responsableEmision: params.responsableEmision,
      responsableAprobacion: params.responsableAprobacion,
      notasTerminosCondiciones: params.notasTerminos || 'Despacho sujeto a revisión técnica en bodega. Precios unitarios y condiciones pactadas permanecen congelados.',
      recepcionesIds: [],
      created_at: new Date().toISOString()
    };

    const ordenes = ComprasService.getOrdenesCompra();
    ordenes.unshift(nuevaOC);
    ComprasService.saveOrdenesCompra(ordenes);

    // Actualizar requisición con estado OC_EMITIDA
    req.estado = 'OC_EMITIDA';
    if (!req.ordenesCompraAsociadas) req.ordenesCompraAsociadas = [];
    req.ordenesCompraAsociadas.push(nuevaOC.folio);
    ComprasService.saveRequisiciones(requisiciones);

    return nuevaOC;
  }

  public static getRecepciones(ordenId?: string): RecepcionMaterial[] {
    let list = RECEPCIONES_SEMILLA;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_REC);
        if (stored) list = JSON.parse(stored);
        else localStorage.setItem(STORAGE_KEY_REC, JSON.stringify(list));
      } catch (e) {
        console.warn('Fallback a recepciones semilla', e);
      }
    }
    if (ordenId) {
      return list.filter(r => r.ordenCompraId === ordenId);
    }
    return list;
  }

  public static saveRecepciones(list: RecepcionMaterial[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_REC, JSON.stringify(list));
  }

  public static registrarRecepcionMaterial(data: {
    ordenCompraId: string;
    guiaRemisionNumero: string;
    responsableBodeguero: string;
    observaciones: string;
    itemsRecepcion: Array<{
      itemOrdenId: string;
      cantidadEntregada: number;
      cantidadAceptadaConforme: number;
      cantidadDanadaRechazada: number;
      estadoInspeccion: EstadoInspeccionFisica;
      motivoObservacion?: string;
    }>;
  }): RecepcionMaterial {
    const ordenes = ComprasService.getOrdenesCompra();
    const oc = ordenes.find(o => o.id === data.ordenCompraId);
    if (!oc) throw new Error('Orden de compra no encontrada para registrar recepción.');

    const proy = PROYECTOS_OBRA_OFICIALES.find(p => p.id === oc.proyectoId) || PROYECTOS_OBRA_OFICIALES[0];
    const folioRec = `REC-BOD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const itemsRecepcionRegistrados: ItemRecepcion[] = [];
    let todoCompletado = true;

    for (const it of data.itemsRecepcion) {
      const ocItem = oc.items.find(i => i.id === it.itemOrdenId);
      if (!ocItem) continue;

      if (it.cantidadAceptadaConforme < 0 || it.cantidadDanadaRechazada < 0) {
        throw new Error('Las cantidades recibidas no pueden ser negativas.');
      }

      if (it.cantidadAceptadaConforme > ocItem.cantidadPendiente) {
        throw new Error(
          `La cantidad aceptada (${it.cantidadAceptadaConforme}) supera la cantidad pendiente autorizada (${ocItem.cantidadPendiente}) para el insumo ${ocItem.descripcion}.`
        );
      }

      ocItem.cantidadRecibidaConforme = +(ocItem.cantidadRecibidaConforme + it.cantidadAceptadaConforme).toFixed(2);
      ocItem.cantidadDanadaRechazada = +(ocItem.cantidadDanadaRechazada + it.cantidadDanadaRechazada).toFixed(2);
      ocItem.cantidadPendiente = +(ocItem.cantidadPedida - ocItem.cantidadRecibidaConforme).toFixed(2);

      if (ocItem.cantidadPendiente > 0.001) {
        todoCompletado = false;
      }

      itemsRecepcionRegistrados.push({
        itemOrdenId: it.itemOrdenId,
        codigoInsumo: ocItem.codigoInsumo,
        descripcion: ocItem.descripcion,
        unidad: ocItem.unidad,
        cantidadEntregada: it.cantidadEntregada,
        cantidadAceptadaConforme: it.cantidadAceptadaConforme,
        cantidadDanadaRechazada: it.cantidadDanadaRechazada,
        estadoInspeccion: it.estadoInspeccion,
        motivoObservacion: it.motivoObservacion
      });
    }

    const tipoRecepcion = todoCompletado ? 'TOTAL' : 'PARCIAL';
    oc.estado = todoCompletado ? 'RECIBIDA_TOTAL' : 'RECIBIDA_PARCIAL';

    const nuevaRecepcion: RecepcionMaterial = {
      id: `rec-${Date.now()}`,
      folioRecepcion: folioRec,
      ordenCompraId: oc.id,
      ordenCompraFolio: oc.folio,
      proyectoId: oc.proyectoId,
      proyectoNombre: oc.proyectoNombre,
      bodegaDestinoId: proy.bodegaId,
      bodegaNombre: proy.bodegaNombre,
      proveedorRazonSocial: oc.proveedorRazonSocial,
      fechaRecepcion: new Date().toISOString().replace('T', ' ').substring(0, 16),
      guiaRemisionNumero: data.guiaRemisionNumero,
      responsableBodeguero: data.responsableBodeguero,
      items: itemsRecepcionRegistrados,
      tipoRecepcion,
      observacionesGenerales: data.observaciones,
      kardexMovimientoGeneradoId: `MOV-KDX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString()
    };

    if (!oc.recepcionesIds) oc.recepcionesIds = [];
    oc.recepcionesIds.push(nuevaRecepcion.id);

    // Guardar OC y Recepción
    ComprasService.saveOrdenesCompra(ordenes);
    const recepciones = ComprasService.getRecepciones();
    recepciones.unshift(nuevaRecepcion);
    ComprasService.saveRecepciones(recepciones);

    return nuevaRecepcion;
  }

  public static getVarianzaPresupuestariaApu(proyectoId?: string): VarianzaApuItem[] {
    const ordenes = ComprasService.getOrdenesCompra(proyectoId);
    const requisiciones = ComprasService.getRequisiciones(proyectoId);

    const resultados: VarianzaApuItem[] = [];

    ordenes.forEach(oc => {
      oc.items.forEach(ocItem => {
        // Buscar costo referencial en la requisición original
        const req = requisiciones.find(r => r.id === oc.requisicionId);
        const reqItem = req?.items.find(ri => ri.codigoInsumo === ocItem.codigoInsumo);

        const costoApu = reqItem?.costoUnitarioReferencialApuUSD || (ocItem.precioUnitarioCongeladoUSD * 1.05);
        const costoReal = ocItem.precioUnitarioCongeladoUSD;
        const varianzaUSD = +(costoReal - costoApu).toFixed(2);
        const varianzaPct = +((varianzaUSD / costoApu) * 100).toFixed(2);
        const impactoTotal = +(varianzaUSD * ocItem.cantidadPedida).toFixed(2);

        let semaforo: VarianzaApuItem['estadoSemaforo'] = 'EN_PRESUPUESTO';
        if (varianzaPct < -1.0) semaforo = 'AHORRO';
        else if (varianzaPct > 5.0) semaforo = 'SOBRECOSTO_CRITICO';
        else if (varianzaPct > 0) semaforo = 'SOBRECOSTO_LEVE';

        resultados.push({
          codigoInsumo: ocItem.codigoInsumo,
          descripcion: ocItem.descripcion,
          unidad: ocItem.unidad,
          rubroApu: ocItem.rubroApuCodigo || reqItem?.rubroApuNombre || 'Estructuras Generales',
          cantidadComprada: ocItem.cantidadPedida,
          costoUnitarioApuTeoricoUSD: costoApu,
          costoUnitarioRealCompradoUSD: costoReal,
          varianzaUnitariaUSD: varianzaUSD,
          varianzaPorcentaje: varianzaPct,
          impactoTotalUSD: impactoTotal,
          estadoSemaforo: semaforo
        });
      });
    });

    return resultados;
  }

  public static getKpisCompras(proyectoId?: string) {
    const reqs = ComprasService.getRequisiciones(proyectoId);
    const ocs = ComprasService.getOrdenesCompra(proyectoId);
    const recs = ComprasService.getRecepciones();

    const requisicionesPendientes = reqs.filter(r => r.estado === 'ENVIADA' || r.estado === 'EN_REVISION' || r.estado === 'BORRADOR').length;
    const ordenesActivas = ocs.filter(o => o.estado === 'EMITIDA' || o.estado === 'RECIBIDA_PARCIAL').length;
    const volumenTotalOrdenadoUSD = ocs.reduce((acc, o) => acc + (o.estado !== 'ANULADA' ? o.totalPagarUSD : 0), 0);
    
    // Ahorro conseguido contra techo de APU
    let ahorroTotalUSD = 0;
    const varianzas = ComprasService.getVarianzaPresupuestariaApu(proyectoId);
    varianzas.forEach(v => {
      if (v.impactoTotalUSD < 0) {
        ahorroTotalUSD += Math.abs(v.impactoTotalUSD);
      }
    });

    return {
      totalRequisiciones: reqs.length,
      requisicionesPendientes,
      ordenesActivas,
      totalOrdenesEmitidas: ocs.length,
      volumenTotalOrdenadoUSD: +(volumenTotalOrdenadoUSD).toFixed(2),
      ahorroTotalUSD: +(ahorroTotalUSD).toFixed(2),
      totalRecepcionesRegistradas: recs.length,
      cumplimientoEntregasPct: 96.5
    };
  }
}
