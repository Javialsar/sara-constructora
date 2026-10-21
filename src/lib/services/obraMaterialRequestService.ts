/**
 * SERVICIO INTEGRAL DE PEDIDOS DE MATERIALES DE OBRA (RESIDENTE -> BODEGUERO -> COMPRAS)
 * Ecosistema GRUPO SARA Constructora
 *
 * Orquesta el flujo oficial de control interno:
 * 1. El Ingeniero Residente crea un Pedido de Materiales:
 *    - Apoyado en el Presupuesto APU de la obra (con control de techo presupuestario y desperdicio NEC-15)
 *    - O de forma Manual / Emergente (imprevistos de obra con justificación técnica)
 * 2. El Pedido llega en tiempo real a la bandeja del Bodeguero (Bodega & Kardex):
 *    - Si existe stock suficiente en Bodega: El Bodeguero aprueba y emite el Vale de Despacho a Obra (descontando Kardex al CPP).
 *    - Si existe stock parcial: Despacha lo disponible con Vale y escala automáticamente el saldo faltante al Área de Compras.
 *    - Si no existe stock (0 disponible): Escala el requerimiento al Área de Compras generando la Solicitud / Orden de Compra.
 * 3. El Área de Compras recibe las Solicitudes de Compra generadas por Bodega para cotizar y emitir la Orden de Compra (OC) al proveedor.
 */

export type OrigenPedidoMaterial = 'APU_PRESUPUESTO' | 'MANUAL_EMERGENTE' | 'MIXTO_APU_Y_MANUAL';
export type PrioridadPedido = 'NORMAL_PROGRAMADO' | 'URGENTE_24H' | 'EMERGENCIA_CRITICA';
export type EstadoPedidoObra =
  | 'PENDIENTE_BODEGA'
  | 'DESPACHADO_TOTAL_BODEGA'
  | 'DESPACHADO_PARCIAL_Y_EN_COMPRAS'
  | 'ESCALADO_A_COMPRAS'
  | 'ORDEN_COMPRA_EMITIDA';

export interface ItemPedidoResidente {
  id: string;
  insumoKardexId: string; // ID en el catálogo de bodega, ID de insumo maestro o 'custom'
  codigo: string;
  nombre: string;
  categoria: 'ACERO' | 'CEMENTO' | 'ARIDOS' | 'MAMPOSTERIA' | 'HORMIGON' | 'TUBERIA' | 'OTROS';
  unidad: string;
  origenItem: 'APU' | 'CATALOGO_MAESTRO_SARA' | 'MANUAL';
  rubroApuCodigo?: string;
  rubroApuNombre?: string;
  cantidadPresupuestadaApu?: number;
  cantidadDespachadaPrevia?: number;
  cantidadSolicitada: number;
  cantidadDespachadaBodega: number;
  cantidadFaltanteParaCompra: number;
  costoUnitarioEstimadoUSD: number;
  observacionTecnica?: string;
  esDeCatalogoMaestroSara?: boolean;
}

export interface PedidoMaterialObra {
  id: string;
  numeroPedido: string;
  fechaEmision: string;
  horaEmision: string;
  proyectoId: string;
  proyectoNombre: string;
  frenteObraEspecifico: string;
  faseApuId?: string;
  faseApuNombre?: string;
  residenteNombre: string;
  residenteCargo: string;
  origen: OrigenPedidoMaterial;
  prioridad: PrioridadPedido;
  justificacionGeneral: string;
  estado: EstadoPedidoObra;
  items: ItemPedidoResidente[];
  // Datos de atención en Bodega
  atendidoPorBodeguero?: string;
  fechaAtencionBodega?: string;
  valesGeneradosRef: string[];
  solicitudCompraRef?: string;
  ordenCompraGeneradaRef?: string;
}

export type AnilloCoberturaGeografica =
  | 'ANILLO_1_LOCAL'
  | 'ANILLO_2_REGIONAL'
  | 'ANILLO_3_NACIONAL';

export interface OpcionProveedorMarketplaceItem {
  proveedorId: string;
  razonSocial: string;
  ruc: string;
  ciudadUbicacion: string;
  anilloCobertura: AnilloCoberturaGeografica;
  ordenCercania: 1 | 2 | 3;
  etiquetaAnillo: string;
  distanciaKmDesdeObra: number;
  tiempoEntregaEstimado: string;
  stockDisponibleProveedor: number;
  precioUnitarioNetoUSD: number;
  costoFleteEstimadoUSD: number;
  subtotalMaterialUSD: number;
  subtotalPuestoEnObraUSD: number;
  ivaAplicablePct: 5 | 15;
  esRecomendadoIA: boolean;
  razonRecomendacionIA: string;
}

export interface SubPedidoProveedorOC {
  numeroSubPedido: string; // Ej: OC-2026-780-P1, OC-2026-780-P2
  ordenCompraMatrizRef: string; // Ej: OC-2026-780
  solicitudOrigenRef: string; // Ej: REQ-BOD-COMP-2026-020
  pedidoResidenteOrigenRef: string; // Ej: PED-OBRA-2026-043
  proveedorId: string;
  razonSocial: string;
  ruc: string;
  ciudadUbicacion: string;
  anilloCobertura: AnilloCoberturaGeografica;
  etiquetaAnillo: string;
  distanciaKmDesdeObra: number;
  tiempoEntregaEstimado: string;
  itemsAsignados: Array<{
    codigo: string;
    nombre: string;
    unidad: string;
    cantidad: number;
    precioUnitarioUSD: number;
    subtotalMaterialUSD: number;
    ivaPct: 5 | 15;
  }>;
  subtotalMaterialesUSD: number;
  costoFleteConsolidadoUSD: number;
  ivaTotalUSD: number;
  totalPedidoProveedorUSD: number;
  fechaEmision: string;
  estadoDespachoProveedor: 'EMITIDO_AL_PROVEEDOR' | 'EN_RUTA_OBRA' | 'RECIBIDO_EN_BODEGA';
}

export interface SolicitudCompraDesdeBodega {
  id: string;
  numeroSolicitudCompra: string;
  pedidoOrigenId: string;
  numeroPedidoOrigen: string;
  fechaSolicitud: string;
  horaSolicitud: string;
  proyectoDestino: string;
  frenteObra: string;
  residenteSolicitante: string;
  bodegueroSolicitante: string;
  prioridad: PrioridadPedido;
  motivoEscalamiento: string;
  estado: 'PENDIENTE_COTIZACION_COMPRAS' | 'OC_GENERADA_ENVIADA_PROVEEDOR';
  numeroOCGenerada?: string;
  proveedorSeleccionado?: string;
  rucProveedor?: string;
  subPedidosPorProveedor?: SubPedidoProveedorOC[];
  itemsAComprar: Array<{
    insumoKardexId: string;
    codigo: string;
    nombre: string;
    categoria: string;
    unidad: string;
    cantidadSolicitadaResidente: number;
    stockDisponibleEnBodega: number;
    cantidadDespachadaDesdeBodega: number;
    cantidadAComprar: number;
    costoUnitarioEstimadoUSD: number;
    subtotalEstimadoUSD: number;
    rubroApuOrigen?: string;
    proveedorAsignadoId?: string;
    proveedorAsignadoNombre?: string;
    subPedidoGeneradoRef?: string;
  }>;
  montoTotalEstimadoUSD: number;
}

export interface RubroApuPlantilla {
  id: string;
  codigoRubro: string;
  nombreRubro: string;
  faseObra: string;
  unidadRubro: string;
  cantidadTotalObra: number;
  insumosReceta: Array<{
    insumoKardexId: string;
    codigo: string;
    nombre: string;
    categoria: 'ACERO' | 'CEMENTO' | 'ARIDOS' | 'MAMPOSTERIA' | 'HORMIGON' | 'TUBERIA' | 'OTROS';
    unidad: string;
    rendimientoPorUnidadRubro: number;
    desperdicioNecPct: number;
    techoPresupuestadoTotal: number;
    yaDespachadoAcumulado: number;
    sugeridoParaPedido: number;
    costoUnitarioRefUSD: number;
  }>;
}

const STORAGE_KEY_PEDIDOS = 'sara_pedidos_materiales_obra_v1';
const STORAGE_KEY_SOLICITUDES_COMPRAS = 'sara_solicitudes_compra_bodega_v1';

const PLANTILLAS_RUBROS_APU: RubroApuPlantilla[] = [
  {
    id: 'rub-apu-01',
    codigoRubro: 'APU-EST-014',
    nombreRubro: 'Hormigón Estructural en Columnas y Pórticos f\'c=280 kg/cm² (Sismorresistente NEC-15)',
    faseObra: 'Fase 2: Superestructura Pórticos Niveles 4 al 8',
    unidadRubro: 'm³',
    cantidadTotalObra: 185,
    insumosReceta: [
      {
        insumoKardexId: 'cemento_holcim',
        codigo: 'INS-CEM-001',
        nombre: 'Cemento Holcim Fuerte 50kg',
        categoria: 'CEMENTO',
        unidad: 'Saco',
        rendimientoPorUnidadRubro: 8.5,
        desperdicioNecPct: 3.0,
        techoPresupuestadoTotal: 1620,
        yaDespachadoAcumulado: 950,
        sugeridoParaPedido: 220, // En bodega hay 85 -> disparará despacho parcial (85) + compra (135)!
        costoUnitarioRefUSD: 7.45,
      },
      {
        insumoKardexId: 'acero_adelca_12',
        codigo: 'INS-ACE-012',
        nombre: 'Varilla Acero Corrugado Adelca 12mm x 12m',
        categoria: 'ACERO',
        unidad: 'kg',
        rendimientoPorUnidadRubro: 115,
        desperdicioNecPct: 5.0,
        techoPresupuestadoTotal: 22338,
        yaDespachadoAcumulado: 11200,
        sugeridoParaPedido: 3200, // En bodega hay 24500 -> despacho 100% desde bodega
        costoUnitarioRefUSD: 1.18,
      },
      {
        insumoKardexId: 'arena_gruesa',
        codigo: 'INS-ARI-003',
        nombre: 'Arena Gruesa de Mina Lavada',
        categoria: 'ARIDOS',
        unidad: 'm³',
        rendimientoPorUnidadRubro: 0.52,
        desperdicioNecPct: 5.0,
        techoPresupuestadoTotal: 101,
        yaDespachadoAcumulado: 55,
        sugeridoParaPedido: 30, // En bodega hay 18 -> despacho parcial (18) + compra (12)
        costoUnitarioRefUSD: 14.5,
      },
    ],
  },
  {
    id: 'rub-apu-02',
    codigoRubro: 'APU-MAM-022',
    nombreRubro: 'Mampostería de Bloque Alivianado Prensado e=15cm con Mortero 1:4',
    faseObra: 'Fase 3: Albañilería, Divisiones Interiores & Ductos',
    unidadRubro: 'm²',
    cantidadTotalObra: 1450,
    insumosReceta: [
      {
        insumoKardexId: 'bloque_15',
        codigo: 'INS-MAM-015',
        nombre: 'Bloque Alivianado Prensado 15x20x40',
        categoria: 'MAMPOSTERIA',
        unidad: 'Unidad',
        rendimientoPorUnidadRubro: 12.5,
        desperdicioNecPct: 4.0,
        techoPresupuestadoTotal: 18850,
        yaDespachadoAcumulado: 8400,
        sugeridoParaPedido: 2500, // En bodega hay 6200 -> 100% disponible
        costoUnitarioRefUSD: 0.48,
      },
      {
        insumoKardexId: 'cemento_holcim',
        codigo: 'INS-CEM-001',
        nombre: 'Cemento Holcim Fuerte 50kg',
        categoria: 'CEMENTO',
        unidad: 'Saco',
        rendimientoPorUnidadRubro: 0.22,
        desperdicioNecPct: 3.0,
        techoPresupuestadoTotal: 330,
        yaDespachadoAcumulado: 140,
        sugeridoParaPedido: 90,
        costoUnitarioRefUSD: 7.45,
      },
    ],
  },
  {
    id: 'rub-apu-03',
    codigoRubro: 'APU-HID-008',
    nombreRubro: 'Red Hidrosanitaria Principal y Bajantes Pluviales PVC 110mm',
    faseObra: 'Fase 3: Instalaciones Hidrosanitarias y Colectores',
    unidadRubro: 'ml',
    cantidadTotalObra: 540,
    insumosReceta: [
      {
        insumoKardexId: 'tuberia_pvc_110',
        codigo: 'INS-TUB-110',
        nombre: 'Tubo PVC Sanitario Reforzado 110mm x 3m',
        categoria: 'TUBERIA',
        unidad: 'Tubo',
        rendimientoPorUnidadRubro: 0.35,
        desperdicioNecPct: 3.0,
        techoPresupuestadoTotal: 195,
        yaDespachadoAcumulado: 60,
        sugeridoParaPedido: 80,
        costoUnitarioRefUSD: 11.2,
      },
    ],
  },
  {
    id: 'rub-apu-04',
    codigoRubro: 'APU-LOS-019',
    nombreRubro: 'Losa de Entrepiso Alivianada H=25cm con Hormigón Premezclado f\'c=210 kg/cm²',
    faseObra: 'Fase 2: Vaciado Masivo de Losa Nivel 5',
    unidadRubro: 'm³',
    cantidadTotalObra: 240,
    insumosReceta: [
      {
        insumoKardexId: 'hormigon_210',
        codigo: 'INS-HOR-210',
        nombre: 'Hormigón Premezclado f\'c=210 kg/cm²',
        categoria: 'HORMIGON',
        unidad: 'm³',
        rendimientoPorUnidadRubro: 1.03,
        desperdicioNecPct: 3.0,
        techoPresupuestadoTotal: 248,
        yaDespachadoAcumulado: 120,
        sugeridoParaPedido: 85, // En bodega hay 65 -> 65 despacho + 20 a compra
        costoUnitarioRefUSD: 94.5,
      },
      {
        insumoKardexId: 'acero_adelca_12',
        codigo: 'INS-ACE-012',
        nombre: 'Varilla Acero Corrugado Adelca 12mm x 12m',
        categoria: 'ACERO',
        unidad: 'kg',
        rendimientoPorUnidadRubro: 65,
        desperdicioNecPct: 5.0,
        techoPresupuestadoTotal: 16380,
        yaDespachadoAcumulado: 7500,
        sugeridoParaPedido: 2800,
        costoUnitarioRefUSD: 1.18,
      },
    ],
  },
];

const INITIAL_PEDIDOS: PedidoMaterialObra[] = [
  {
    id: 'ped-obra-001',
    numeroPedido: 'PED-OBRA-2026-041',
    fechaEmision: '2026-10-20',
    horaEmision: '08:15',
    proyectoId: 'proy-torre-loja',
    proyectoNombre: 'Torre SARA Loja (Pisos 4-8)',
    frenteObraEspecifico: 'Núcleo de Ascensores y Columnas Eje B-D (Nivel 5)',
    faseApuId: 'rub-apu-01',
    faseApuNombre: 'APU-EST-014 • Hormigón Estructural en Columnas f\'c=280 kg/cm²',
    residenteNombre: 'Ing. David Sarango (Residente de Obra)',
    residenteCargo: 'Ingeniero Residente Principal',
    origen: 'MIXTO_APU_Y_MANUAL',
    prioridad: 'URGENTE_24H',
    justificacionGeneral: 'Vaciado programado de columnas del Nivel 5 y aditivo acelerante de fraguado por lluvias en Loja.',
    estado: 'PENDIENTE_BODEGA',
    valesGeneradosRef: [],
    items: [
      {
        id: 'it-ped-1',
        insumoKardexId: 'cemento_holcim',
        codigo: 'INS-CEM-001',
        nombre: 'Cemento Holcim Fuerte 50kg',
        categoria: 'CEMENTO',
        unidad: 'Saco',
        origenItem: 'APU',
        rubroApuCodigo: 'APU-EST-014',
        rubroApuNombre: 'Hormigón Estructural en Columnas f\'c=280 kg/cm²',
        cantidadPresupuestadaApu: 1620,
        cantidadDespachadaPrevia: 950,
        cantidadSolicitada: 200, // En bodega hay 85 sacos -> Caso real de Stock Insuficiente (85 en bodega, faltan 115 para Compras)
        cantidadDespachadaBodega: 0,
        cantidadFaltanteParaCompra: 0,
        costoUnitarioEstimadoUSD: 7.45,
        observacionTecnica: 'Requerido según explosión de APU para fundición de pórticos.',
      },
      {
        id: 'it-ped-2',
        insumoKardexId: 'acero_adelca_12',
        codigo: 'INS-ACE-012',
        nombre: 'Varilla Acero Corrugado Adelca 12mm x 12m',
        categoria: 'ACERO',
        unidad: 'kg',
        origenItem: 'APU',
        rubroApuCodigo: 'APU-EST-014',
        rubroApuNombre: 'Hormigón Estructural en Columnas f\'c=280 kg/cm²',
        cantidadPresupuestadaApu: 22338,
        cantidadDespachadaPrevia: 11200,
        cantidadSolicitada: 2500, // En bodega hay 24,500 kg -> 100% disponible en Bodega
        cantidadDespachadaBodega: 0,
        cantidadFaltanteParaCompra: 0,
        costoUnitarioEstimadoUSD: 1.18,
        observacionTecnica: 'Refuerzo longitudinal de columnas Nivel 5.',
      },
      {
        id: 'it-ped-3',
        insumoKardexId: 'aditivo_sika_1',
        codigo: 'INS-QUI-009',
        nombre: 'Aditivo Plastificante Acelerante SikaPlast-100 (Caneca 20L)',
        categoria: 'OTROS',
        unidad: 'Caneca',
        origenItem: 'MANUAL',
        cantidadSolicitada: 12, // Stock 0 en bodega -> 100% para Orden de Compra
        cantidadDespachadaBodega: 0,
        cantidadFaltanteParaCompra: 0,
        costoUnitarioEstimadoUSD: 46.5,
        observacionTecnica: 'Pedido manual emergente autorizado por Fiscalización para desencofrado temprano.',
      },
    ],
  },
  {
    id: 'ped-obra-002',
    numeroPedido: 'PED-OBRA-2026-040',
    fechaEmision: '2026-10-19',
    horaEmision: '15:40',
    proyectoId: 'proy-cariamanga',
    proyectoNombre: 'Residencial Cariamanga Plaza',
    frenteObraEspecifico: 'Bloque B - Mampostería Planta Baja',
    faseApuId: 'rub-apu-02',
    faseApuNombre: 'APU-MAM-022 • Mampostería de Bloque Alivianado e=15cm',
    residenteNombre: 'Arq. Valeria Rojas (Residente Bloque B)',
    residenteCargo: 'Residente de Arquitectura & Acabados',
    origen: 'APU_PRESUPUESTO',
    prioridad: 'NORMAL_PROGRAMADO',
    justificacionGeneral: 'Levantamiento de paredes interiores departamentos 101 al 104 según cronograma.',
    estado: 'PENDIENTE_BODEGA',
    valesGeneradosRef: [],
    items: [
      {
        id: 'it-ped-4',
        insumoKardexId: 'bloque_15',
        codigo: 'INS-MAM-015',
        nombre: 'Bloque Alivianado Prensado 15x20x40',
        categoria: 'MAMPOSTERIA',
        unidad: 'Unidad',
        origenItem: 'APU',
        rubroApuCodigo: 'APU-MAM-022',
        rubroApuNombre: 'Mampostería de Bloque Alivianado e=15cm',
        cantidadPresupuestadaApu: 18850,
        cantidadDespachadaPrevia: 8400,
        cantidadSolicitada: 1800, // En bodega hay 6,200 -> 100% disponible en Bodega
        cantidadDespachadaBodega: 0,
        cantidadFaltanteParaCompra: 0,
        costoUnitarioEstimadoUSD: 0.48,
      },
    ],
  },
];

const INITIAL_SOLICITUDES_COMPRA: SolicitudCompraDesdeBodega[] = [
  {
    id: 'sol-comp-001',
    numeroSolicitudCompra: 'REQ-BOD-COMP-2026-018',
    pedidoOrigenId: 'ped-obra-000',
    numeroPedidoOrigen: 'PED-OBRA-2026-038',
    fechaSolicitud: '2026-10-18',
    horaSolicitud: '16:20',
    proyectoDestino: 'Torre SARA Loja (Pisos 4-8)',
    frenteObra: 'Subsuelo 2 - Cisterna y Cuarto de Bombas',
    residenteSolicitante: 'Ing. David Sarango (Residente de Obra)',
    bodegueroSolicitante: 'Jefe de Bodega Matriz SARA',
    prioridad: 'URGENTE_24H',
    motivoEscalamiento: 'Stock en Bodega Matriz insuficiente para cubrir el pedido del Residente (Faltante certificado por Bodega).',
    estado: 'PENDIENTE_COTIZACION_COMPRAS',
    itemsAComprar: [
      {
        insumoKardexId: 'arena_gruesa',
        codigo: 'INS-ARI-003',
        nombre: 'Arena Gruesa de Mina Lavada',
        categoria: 'ARIDOS',
        unidad: 'm³',
        cantidadSolicitadaResidente: 45,
        stockDisponibleEnBodega: 15,
        cantidadDespachadaDesdeBodega: 15,
        cantidadAComprar: 30,
        costoUnitarioEstimadoUSD: 14.5,
        subtotalEstimadoUSD: 435.0,
        rubroApuOrigen: 'APU-EST-014',
      },
    ],
    montoTotalEstimadoUSD: 435.0,
  },
];

export class ObraMaterialRequestService {
  public static getRubrosApuPlantillas(): RubroApuPlantilla[] {
    return PLANTILLAS_RUBROS_APU;
  }

  public static getPedidos(): PedidoMaterialObra[] {
    if (typeof window === 'undefined') return INITIAL_PEDIDOS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PEDIDOS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_PEDIDOS, JSON.stringify(INITIAL_PEDIDOS));
        return INITIAL_PEDIDOS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_PEDIDOS;
    }
  }

  public static savePedidos(pedidos: PedidoMaterialObra[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_PEDIDOS, JSON.stringify(pedidos));
    window.dispatchEvent(new CustomEvent('sara_pedidos_obra_updated'));
  }

  public static crearPedidoResidente(
    nuevo: Omit<PedidoMaterialObra, 'id' | 'numeroPedido' | 'fechaEmision' | 'horaEmision' | 'estado' | 'valesGeneradosRef'>
  ): PedidoMaterialObra {
    const pedidos = this.getPedidos();
    const correlativo = pedidos.length + 41;
    const creado: PedidoMaterialObra = {
      ...nuevo,
      id: `ped-obra-${Date.now()}`,
      numeroPedido: `PED-OBRA-2026-0${correlativo}`,
      fechaEmision: new Date().toISOString().split('T')[0],
      horaEmision: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
      estado: 'PENDIENTE_BODEGA',
      valesGeneradosRef: [],
    };
    const actualizados = [creado, ...pedidos];
    this.savePedidos(actualizados);
    return creado;
  }

  public static getSolicitudesCompraBodega(): SolicitudCompraDesdeBodega[] {
    if (typeof window === 'undefined') return INITIAL_SOLICITUDES_COMPRA;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SOLICITUDES_COMPRAS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_SOLICITUDES_COMPRAS, JSON.stringify(INITIAL_SOLICITUDES_COMPRA));
        return INITIAL_SOLICITUDES_COMPRA;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_SOLICITUDES_COMPRA;
    }
  }

  public static saveSolicitudesCompraBodega(solicitudes: SolicitudCompraDesdeBodega[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_SOLICITUDES_COMPRAS, JSON.stringify(solicitudes));
    window.dispatchEvent(new CustomEvent('sara_pedidos_obra_updated'));
  }

  /**
   * Procesa un Pedido de Obra desde el rol del Bodeguero:
   * - Compara lo solicitado por el Residente contra el stock real en Bodega.
   * - Despacha todo lo que alcanza en stock.
   * - Si hay faltantes, crea automáticamente una Solicitud de Compra para el Área de Compras.
   */
  public static procesarPedidoEnBodega(params: {
    pedidoId: string;
    bodegueroNombre: string;
    stockActualPorInsumo: Record<string, number>;
    valesEmitidosNumeros: string[];
    itemsResultado: Array<{
      itemId: string;
      insumoKardexId: string;
      codigo: string;
      nombre: string;
      categoria: string;
      unidad: string;
      Solicitado: number;
      StockBodega: number;
      DespachadoBodega: number;
      FaltanteCompra: number;
      costoUnitarioUSD: number;
      rubroApuOrigen?: string;
    }>;
  }): {
    pedidoActualizado: PedidoMaterialObra;
    solicitudCompraCreada?: SolicitudCompraDesdeBodega;
  } {
    const pedidos = this.getPedidos();
    const idx = pedidos.findIndex(p => p.id === params.pedidoId);
    if (idx < 0) {
      throw new Error('Pedido de materiales no encontrado');
    }

    const pedido = pedidos[idx];
    const itemsFaltantes = params.itemsResultado.filter(r => r.FaltanteCompra > 0);
    const huboDespacho = params.itemsResultado.some(r => r.DespachadoBodega > 0);

    let nuevaSolicitudCompra: SolicitudCompraDesdeBodega | undefined;

    if (itemsFaltantes.length > 0) {
      const solicitudesActuales = this.getSolicitudesCompraBodega();
      const numSol = `REQ-BOD-COMP-2026-0${solicitudesActuales.length + 19}`;
      const itemsCompra = itemsFaltantes.map(f => ({
        insumoKardexId: f.insumoKardexId,
        codigo: f.codigo,
        nombre: f.nombre,
        categoria: f.categoria,
        unidad: f.unidad,
        cantidadSolicitadaResidente: f.Solicitado,
        stockDisponibleEnBodega: f.StockBodega,
        cantidadDespachadaDesdeBodega: f.DespachadoBodega,
        cantidadAComprar: f.FaltanteCompra,
        costoUnitarioEstimadoUSD: f.costoUnitarioUSD,
        subtotalEstimadoUSD: +(f.FaltanteCompra * f.costoUnitarioUSD).toFixed(2),
        rubroApuOrigen: f.rubroApuOrigen,
      }));

      const montoTotal = +(itemsCompra.reduce((acc, i) => acc + i.subtotalEstimadoUSD, 0)).toFixed(2);

      nuevaSolicitudCompra = {
        id: `sol-comp-${Date.now()}`,
        numeroSolicitudCompra: numSol,
        pedidoOrigenId: pedido.id,
        numeroPedidoOrigen: pedido.numeroPedido,
        fechaSolicitud: new Date().toISOString().split('T')[0],
        horaSolicitud: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
        proyectoDestino: pedido.proyectoNombre,
        frenteObra: pedido.frenteObraEspecifico,
        residenteSolicitante: pedido.residenteNombre,
        bodegueroSolicitante: params.bodegueroNombre,
        prioridad: pedido.prioridad,
        motivoEscalamiento: huboDespacho
          ? `Despacho parcial ejecutado en Bodega (${params.valesEmitidosNumeros.join(', ')}). Se solicita compra inmediata del saldo sin stock.`
          : `Sin existencias disponibles en Bodega Matriz. Bodeguero solicita compra total al Área de Compras.`,
        estado: 'PENDIENTE_COTIZACION_COMPRAS',
        itemsAComprar: itemsCompra,
        montoTotalEstimadoUSD: montoTotal,
      };

      this.saveSolicitudesCompraBodega([nuevaSolicitudCompra, ...solicitudesActuales]);
    }

    const nuevoEstado: EstadoPedidoObra =
      itemsFaltantes.length === 0
        ? 'DESPACHADO_TOTAL_BODEGA'
        : huboDespacho
          ? 'DESPACHADO_PARCIAL_Y_EN_COMPRAS'
          : 'ESCALADO_A_COMPRAS';

    const pedidoActualizado: PedidoMaterialObra = {
      ...pedido,
      estado: nuevoEstado,
      atendidoPorBodeguero: params.bodegueroNombre,
      fechaAtencionBodega: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}`,
      valesGeneradosRef: [...pedido.valesGeneradosRef, ...params.valesEmitidosNumeros],
      solicitudCompraRef: nuevaSolicitudCompra?.numeroSolicitudCompra || pedido.solicitudCompraRef,
      items: pedido.items.map(it => {
        const res = params.itemsResultado.find(r => r.itemId === it.id);
        if (!res) return it;
        return {
          ...it,
          cantidadDespachadaBodega: res.DespachadoBodega,
          cantidadFaltanteParaCompra: res.FaltanteCompra,
        };
      }),
    };

    pedidos[idx] = pedidoActualizado;
    this.savePedidos(pedidos);

    return {
      pedidoActualizado,
      solicitudCompraCreada: nuevaSolicitudCompra,
    };
  }

  /**
   * AGENTE IA SARA-MARKETPLACE:
   * Evalúa un artículo faltante en el Marketplace de Proveedores de Grupo SARA
   * priorizando como 1ra opción el proveedor más cercano a la obra (Anillo 1 Local)
   * y ampliando progresivamente el radio de cobertura hacia Anillo 2 (Regional) y Anillo 3 (Planta Nacional).
   */
  public static analizarOpcionesMarketplacePorItem(
    item: {
      codigo: string;
      nombre: string;
      categoria: string;
      unidad: string;
      cantidadAComprar: number;
      costoUnitarioEstimadoUSD: number;
    },
    ciudadObra: string = 'Loja'
  ): OpcionProveedorMarketplaceItem[] {
    const texto = `${item.codigo} ${item.nombre} ${item.categoria}`.toLowerCase();
    const cant = Math.max(1, item.cantidadAComprar);
    const precioRef = item.costoUnitarioEstimadoUSD > 0 ? item.costoUnitarioEstimadoUSD : 12.0;

    const esElectrico =
      texto.includes('ele') ||
      texto.includes('cable') ||
      texto.includes('thhn') ||
      texto.includes('incable') ||
      texto.includes('breaker') ||
      texto.includes('tablero');
    const esSanitario =
      texto.includes('san') ||
      texto.includes('asiento') ||
      texto.includes('inodoro') ||
      texto.includes('briggs') ||
      texto.includes('brigs') ||
      texto.includes('fv') ||
      texto.includes('edesa') ||
      texto.includes('lavamanos') ||
      texto.includes('grif');
    const esCemento =
      texto.includes('cem') ||
      texto.includes('cemento') ||
      texto.includes('portland') ||
      texto.includes('holcim') ||
      texto.includes('selvalegre') ||
      texto.includes('guapán');
    const esAcero =
      texto.includes('ace') ||
      texto.includes('acero') ||
      texto.includes('varilla') ||
      texto.includes('adelca') ||
      texto.includes('novacero') ||
      texto.includes('malla');
    const esArido =
      texto.includes('ari') ||
      texto.includes('arena') ||
      texto.includes('ripio') ||
      texto.includes('lastre') ||
      texto.includes('grava') ||
      texto.includes('piedra');
    const esQuimico =
      texto.includes('qui') ||
      texto.includes('sika') ||
      texto.includes('aditivo') ||
      texto.includes('impermeabilizante') ||
      texto.includes('epox');
    const esTuberia =
      texto.includes('tub') ||
      texto.includes('pvc') ||
      texto.includes('plastigama') ||
      texto.includes('tigre');

    // IVA 5% para materiales de construcción (Res. SRI NAC-DGERCGC24-00000013) vs 15% general
    const ivaAplicablePct: 5 | 15 =
      esCemento || esAcero || esArido || texto.includes('bloque') || texto.includes('ladrillo') || texto.includes('hormigon')
        ? 5
        : 15;

    type ConfigAnillo = {
      id: string;
      razonSocial: string;
      ruc: string;
      ciudad: string;
      anillo: AnilloCoberturaGeografica;
      orden: 1 | 2 | 3;
      etiqueta: string;
      distanciaKm: number;
      tiempo: string;
      factorPrecio: number;
      fleteBaseUSD: number;
      stockDisp: number;
    };

    let configs: ConfigAnillo[];

    if (esElectrico) {
      configs = [
        {
          id: 'PROV-ELE-LOC-01',
          razonSocial: `ELECTROSUR & CABLES INDUSTRIALES ${ciudadObra.toUpperCase()} CÍA. LTDA.`,
          ruc: '1191748291001',
          ciudad: `${ciudadObra} (Sector Parque Industrial)`,
          anillo: 'ANILLO_1_LOCAL',
          orden: 1,
          etiqueta: '1ra Opción • Cobertura Local (Más Cercano)',
          distanciaKm: 2.1,
          tiempo: '45 min (Entrega Inmediata)',
          factorPrecio: 0.99,
          fleteBaseUSD: 3.5,
          stockDisp: Math.max(cant + 45, 80),
        },
        {
          id: 'PROV-ELE-REG-02',
          razonSocial: 'IMPORTADORA ELÉCTRICA DEL AUSTRO S.A. (CUENCA)',
          ruc: '0190384712001',
          ciudad: 'Cuenca (Av. Gil Ramírez Dávalos)',
          anillo: 'ANILLO_2_REGIONAL',
          orden: 2,
          etiqueta: '2da Opción • Cobertura Regional Austro',
          distanciaKm: 205.0,
          tiempo: '8 horas (Ruta E35)',
          factorPrecio: 0.94,
          fleteBaseUSD: 45.0,
          stockDisp: Math.max(cant + 300, 500),
        },
        {
          id: 'PROV-ELE-NAC-03',
          razonSocial: 'INCABLE S.A. PLANTA MATRIZ & DISTRIBUCIÓN NACIONAL',
          ruc: '0990048129001',
          ciudad: 'Durán / Guayaquil (Planta Industrial)',
          anillo: 'ANILLO_3_NACIONAL',
          orden: 3,
          etiqueta: '3ra Opción • Cobertura Nacional (Planta Matriz)',
          distanciaKm: 412.0,
          tiempo: '24 - 36 horas',
          factorPrecio: 0.89,
          fleteBaseUSD: 140.0,
          stockDisp: 5000,
        },
      ];
    } else if (esSanitario) {
      configs = [
        {
          id: 'PROV-SAN-LOC-01',
          razonSocial: `ACABADOS & SANITARIOS DEL SUR (${ciudadObra.toUpperCase()})`,
          ruc: '1191729402001',
          ciudad: `${ciudadObra} (Av. Universitaria)`,
          anillo: 'ANILLO_1_LOCAL',
          orden: 1,
          etiqueta: '1ra Opción • Cobertura Local (Más Cercano)',
          distanciaKm: 1.8,
          tiempo: '40 min (Despacho Urbano)',
          factorPrecio: 1.0,
          fleteBaseUSD: 4.0,
          stockDisp: Math.max(cant + 24, 36),
        },
        {
          id: 'PROV-SAN-REG-02',
          razonSocial: 'CENTRO CERÁMICO & BAÑOS REGIONAL CUENCA CÍA. LTDA.',
          ruc: '0190441820001',
          ciudad: 'Cuenca (Parque Industrial)',
          anillo: 'ANILLO_2_REGIONAL',
          orden: 2,
          etiqueta: '2da Opción • Cobertura Regional Austro',
          distanciaKm: 208.0,
          tiempo: '8 horas',
          factorPrecio: 0.93,
          fleteBaseUSD: 48.0,
          stockDisp: Math.max(cant + 150, 240),
        },
        {
          id: 'PROV-SAN-NAC-03',
          razonSocial: 'EDESA / BRIGGS & FV ECUADOR PLANTA MATRIZ',
          ruc: '1790014289001',
          ciudad: 'Quito / Sangolquí (Planta Matriz)',
          anillo: 'ANILLO_3_NACIONAL',
          orden: 3,
          etiqueta: '3ra Opción • Cobertura Nacional (Fábrica)',
          distanciaKm: 635.0,
          tiempo: '36 - 48 horas',
          factorPrecio: 0.87,
          fleteBaseUSD: 185.0,
          stockDisp: 3500,
        },
      ];
    } else if (esCemento) {
      configs = [
        {
          id: 'PROV-CEM-LOC-01',
          razonSocial: `DISENSA DISTRIBUIDORA MAYORISTA SUR (${ciudadObra.toUpperCase()})`,
          ruc: '1190084210001',
          ciudad: `${ciudadObra} (Vía de Integración Barrial)`,
          anillo: 'ANILLO_1_LOCAL',
          orden: 1,
          etiqueta: '1ra Opción • Cobertura Local (Más Cercano)',
          distanciaKm: 3.2,
          tiempo: '1.5 horas (Camión Urbano)',
          factorPrecio: 0.98,
          fleteBaseUSD: 12.0,
          stockDisp: Math.max(cant + 450, 600),
        },
        {
          id: 'PROV-CEM-REG-02',
          razonSocial: 'CENTRO LOGÍSTICO CEMENTERO CATAMAYO / CUENCA',
          ruc: '1191402918001',
          ciudad: 'Catamayo / Cuenca (Bodega Regional)',
          anillo: 'ANILLO_2_REGIONAL',
          orden: 2,
          etiqueta: '2da Opción • Cobertura Regional Provincial',
          distanciaKm: 36.5,
          tiempo: '3.5 horas',
          factorPrecio: 0.95,
          fleteBaseUSD: 55.0,
          stockDisp: Math.max(cant + 1800, 2500),
        },
        {
          id: 'PROV-CEM-NAC-03',
          razonSocial: 'HOLCIM ECUADOR S.A. - PLANTA INDUSTRIAL SAN EDUARDO',
          ruc: '0990023541001',
          ciudad: 'Guayaquil (Planta Matriz)',
          anillo: 'ANILLO_3_NACIONAL',
          orden: 3,
          etiqueta: '3ra Opción • Cobertura Nacional (Planta Matriz)',
          distanciaKm: 418.0,
          tiempo: '24 horas (Mula 3S3)',
          factorPrecio: 0.90,
          fleteBaseUSD: 380.0,
          stockDisp: 25000,
        },
      ];
    } else if (esAcero) {
      configs = [
        {
          id: 'PROV-ACE-LOC-01',
          razonSocial: `HIERROS & ACEROS DEL SUR (${ciudadObra.toUpperCase()})`,
          ruc: '1191550291001',
          ciudad: `${ciudadObra} (Sector Norte)`,
          anillo: 'ANILLO_1_LOCAL',
          orden: 1,
          etiqueta: '1ra Opción • Cobertura Local (Más Cercano)',
          distanciaKm: 2.9,
          tiempo: '1 hora (Entrega en Obra)',
          factorPrecio: 0.99,
          fleteBaseUSD: 15.0,
          stockDisp: Math.max(cant + 4000, 8000),
        },
        {
          id: 'PROV-ACE-REG-02',
          razonSocial: 'NOVACERO / ADELCA CENTRO DISTRIBUCIÓN CUENCA',
          ruc: '0190159283001',
          ciudad: 'Cuenca (Panamericana Norte)',
          anillo: 'ANILLO_2_REGIONAL',
          orden: 2,
          etiqueta: '2da Opción • Cobertura Regional Austro',
          distanciaKm: 210.0,
          tiempo: '8 horas',
          factorPrecio: 0.94,
          fleteBaseUSD: 165.0,
          stockDisp: Math.max(cant + 25000, 45000),
        },
        {
          id: 'PROV-ACE-NAC-03',
          razonSocial: 'ACERÍA DEL ECUADOR C.A. (ADELCA) - PLANTA LASSO / ALOAG',
          ruc: '1790008941001',
          ciudad: 'Lasso / Cotopaxi (Planta Fundición)',
          anillo: 'ANILLO_3_NACIONAL',
          orden: 3,
          etiqueta: '3ra Opción • Cobertura Nacional (Planta Fundición)',
          distanciaKm: 560.0,
          tiempo: '30 horas (Plataforma 30T)',
          factorPrecio: 0.89,
          fleteBaseUSD: 520.0,
          stockDisp: 150000,
        },
      ];
    } else if (esArido) {
      configs = [
        {
          id: 'PROV-ARI-LOC-01',
          razonSocial: `CANTERA & ÁRIDOS LAVADOS SUR ${ciudadObra.toUpperCase()} CÍA. LTDA.`,
          ruc: '1191755443001',
          ciudad: `${ciudadObra} / Malacatos (Cantera Local)`,
          anillo: 'ANILLO_1_LOCAL',
          orden: 1,
          etiqueta: '1ra Opción • Cobertura Local (Cantera Más Cercana)',
          distanciaKm: 9.4,
          tiempo: '1.5 horas (Volqueta V3A 14m³)',
          factorPrecio: 0.97,
          fleteBaseUSD: 28.0,
          stockDisp: Math.max(cant + 350, 600),
        },
        {
          id: 'PROV-ARI-REG-02',
          razonSocial: 'MINERA & AGREGADOS VALLE DE CATAMAYO S.A.',
          ruc: '1191604921001',
          ciudad: 'Catamayo (Río Boquerón)',
          anillo: 'ANILLO_2_REGIONAL',
          orden: 2,
          etiqueta: '2da Opción • Cobertura Provincial (38 km)',
          distanciaKm: 38.0,
          tiempo: '3 horas',
          factorPrecio: 0.91,
          fleteBaseUSD: 75.0,
          stockDisp: 2500,
        },
        {
          id: 'PROV-ARI-NAC-03',
          razonSocial: 'CANTERA EL TABLÓN & AGREGADOS DEL AUSTRO (PAUTE)',
          ruc: '0190332910001',
          ciudad: 'Paute / Azuay',
          anillo: 'ANILLO_3_NACIONAL',
          orden: 3,
          etiqueta: '3ra Opción • Cobertura Interprovincial',
          distanciaKm: 235.0,
          tiempo: '9 horas',
          factorPrecio: 0.86,
          fleteBaseUSD: 290.0,
          stockDisp: 9000,
        },
      ];
    } else if (esQuimico || esTuberia) {
      configs = [
        {
          id: 'PROV-TEC-LOC-01',
          razonSocial: `FERRETERÍA TÉCNICA & HIDROSANITARIA ${ciudadObra.toUpperCase()}`,
          ruc: '1191683920001',
          ciudad: `${ciudadObra} (Centro Comercial Industrial)`,
          anillo: 'ANILLO_1_LOCAL',
          orden: 1,
          etiqueta: '1ra Opción • Cobertura Local (Más Cercano)',
          distanciaKm: 2.4,
          tiempo: '50 min (Entrega Directa)',
          factorPrecio: 0.99,
          fleteBaseUSD: 5.0,
          stockDisp: Math.max(cant + 60, 120),
        },
        {
          id: 'PROV-TEC-REG-02',
          razonSocial: 'DISTRIBUIDORA REGIONAL SIKA & PLASTIGAMA AUSTRO',
          ruc: '0190293847001',
          ciudad: 'Cuenca (Av. Las Américas)',
          anillo: 'ANILLO_2_REGIONAL',
          orden: 2,
          etiqueta: '2da Opción • Cobertura Regional Austro',
          distanciaKm: 204.0,
          tiempo: '8 horas',
          factorPrecio: 0.93,
          fleteBaseUSD: 42.0,
          stockDisp: 850,
        },
        {
          id: 'PROV-TEC-NAC-03',
          razonSocial: 'SIKA ECUATORIANA S.A. / PLASTIGAMA WAVIN PLANTA DURÁN',
          ruc: '0990018273001',
          ciudad: 'Durán / Guayas (Planta Matriz)',
          anillo: 'ANILLO_3_NACIONAL',
          orden: 3,
          etiqueta: '3ra Opción • Cobertura Nacional (Planta Matriz)',
          distanciaKm: 415.0,
          tiempo: '24 - 36 horas',
          factorPrecio: 0.88,
          fleteBaseUSD: 155.0,
          stockDisp: 6000,
        },
      ];
    } else {
      configs = [
        {
          id: 'PROV-GEN-LOC-01',
          razonSocial: `CENTRO FERRETERO MAYORISTA ${ciudadObra.toUpperCase()} S.A.`,
          ruc: '1191804921001',
          ciudad: `${ciudadObra} (Zona Urbana)`,
          anillo: 'ANILLO_1_LOCAL',
          orden: 1,
          etiqueta: '1ra Opción • Cobertura Local (Más Cercano)',
          distanciaKm: 2.6,
          tiempo: '1 hora (Despacho Local)',
          factorPrecio: 0.99,
          fleteBaseUSD: 6.0,
          stockDisp: Math.max(cant + 100, 200),
        },
        {
          id: 'PROV-GEN-REG-02',
          razonSocial: 'CORPORACIÓN FERRETERA REGIONAL DEL AUSTRO CÍA. LTDA.',
          ruc: '0190482910001',
          ciudad: 'Cuenca (Zona Industrial)',
          anillo: 'ANILLO_2_REGIONAL',
          orden: 2,
          etiqueta: '2da Opción • Cobertura Regional Provincial',
          distanciaKm: 206.0,
          tiempo: '8 horas',
          factorPrecio: 0.94,
          fleteBaseUSD: 50.0,
          stockDisp: Math.max(cant + 500, 1000),
        },
        {
          id: 'PROV-GEN-NAC-03',
          razonSocial: 'CONSORCIO MAYORISTA NACIONAL QUITO / GUAYAQUIL',
          ruc: '0991283940001',
          ciudad: 'Guayaquil (Vía Daule)',
          anillo: 'ANILLO_3_NACIONAL',
          orden: 3,
          etiqueta: '3ra Opción • Cobertura Nacional Mayorista',
          distanciaKm: 416.0,
          tiempo: '24 - 36 horas',
          factorPrecio: 0.89,
          fleteBaseUSD: 160.0,
          stockDisp: 10000,
        },
      ];
    }

    const opcionesCalculadas = configs.map(cfg => {
      const precioUnitarioNetoUSD = +(precioRef * cfg.factorPrecio).toFixed(2);
      const subtotalMaterialUSD = +(precioUnitarioNetoUSD * cant).toFixed(2);
      const costoFleteEstimadoUSD = +cfg.fleteBaseUSD.toFixed(2);
      const subtotalPuestoEnObraUSD = +(subtotalMaterialUSD + costoFleteEstimadoUSD).toFixed(2);

      return {
        proveedorId: cfg.id,
        razonSocial: cfg.razonSocial,
        ruc: cfg.ruc,
        ciudadUbicacion: cfg.ciudad,
        anilloCobertura: cfg.anillo,
        ordenCercania: cfg.orden,
        etiquetaAnillo: cfg.etiqueta,
        distanciaKmDesdeObra: cfg.distanciaKm,
        tiempoEntregaEstimado: cfg.tiempo,
        stockDisponibleProveedor: cfg.stockDisp,
        precioUnitarioNetoUSD,
        costoFleteEstimadoUSD,
        subtotalMaterialUSD,
        subtotalPuestoEnObraUSD,
        ivaAplicablePct,
        esRecomendadoIA: false,
        razonRecomendacionIA: '',
      };
    });

    // Determinar cuál tiene mejor Landed Cost pero dando prioridad al Anillo 1 (Más Cercano)
    // salvo que el ahorro neto en otro anillo supere ampliamente el flete y tiempo de espera
    const mejorLanded = [...opcionesCalculadas].sort(
      (a, b) => a.subtotalPuestoEnObraUSD - b.subtotalPuestoEnObraUSD
    )[0];

    const opcionLocal = opcionesCalculadas[0];
    // Prioridad 1ra Opción: Lugar más cercano si su Landed Cost es el mejor o está a menos de 8% de diferencia
    const elegirLocal =
      opcionLocal.subtotalPuestoEnObraUSD <= mejorLanded.subtotalPuestoEnObraUSD * 1.08;
    const ganadorId = elegirLocal ? opcionLocal.proveedorId : mejorLanded.proveedorId;

    return opcionesCalculadas.map(op => {
      const esGanador = op.proveedorId === ganadorId;
      let razon = '';
      if (esGanador && op.anilloCobertura === 'ANILLO_1_LOCAL') {
        const ahorroVsPlanta = +(
          opcionesCalculadas[2].subtotalPuestoEnObraUSD - op.subtotalPuestoEnObraUSD
        ).toFixed(2);
        razon =
          ahorroVsPlanta > 0
            ? `1ra Opción IA (Más cercano a ${op.distanciaKmDesdeObra} km): Entrega en ${op.tiempoEntregaEstimado} y ahorra $${ahorroVsPlanta} USD en flete frente a planta nacional.`
            : `1ra Opción IA (Más cercano a ${op.distanciaKmDesdeObra} km): Disponibilidad inmediata en ${op.tiempoEntregaEstimado} con flete urbano mínimo.`;
      } else if (esGanador) {
        const ahorroVsLocal = +(
          opcionLocal.subtotalPuestoEnObraUSD - op.subtotalPuestoEnObraUSD
        ).toFixed(2);
        razon = `Recomendado IA por Volumen (${op.etiquetaAnillo}): El descuento mayorista compensa el flete y ahorra $${ahorroVsLocal} USD netos.`;
      } else if (op.anilloCobertura === 'ANILLO_2_REGIONAL') {
        razon = `Alternativa Regional (${op.distanciaKmDesdeObra} km): Útil si requiere ampliar cobertura por agotamiento local.`;
      } else {
        razon = `Alternativa Planta Nacional (${op.distanciaKmDesdeObra} km): Precio ex-fábrica menor ($${op.precioUnitarioNetoUSD}), pero flete de $${op.costoFleteEstimadoUSD} USD.`;
      }

      return {
        ...op,
        esRecomendadoIA: esGanador,
        razonRecomendacionIA: razon,
      };
    });
  }

  /**
   * Permite re-abrir una Solicitud de Compra para volver a cotizar y dividir por proveedor con IA Marketplace.
   */
  public static reabrirParaCotizacionIA(solicitudId: string): SolicitudCompraDesdeBodega {
    const solicitudes = this.getSolicitudesCompraBodega();
    const idx = solicitudes.findIndex(s => s.id === solicitudId);
    if (idx < 0) {
      throw new Error('Solicitud de compra no encontrada');
    }
    const actualizada: SolicitudCompraDesdeBodega = {
      ...solicitudes[idx],
      estado: 'PENDIENTE_COTIZACION_COMPRAS',
    };
    solicitudes[idx] = actualizada;
    this.saveSolicitudesCompraBodega(solicitudes);
    return actualizada;
  }

  /**
   * El Área de Compras aprueba la Solicitud del Bodeguero seleccionando el proveedor óptimo por cada artículo.
   * Si en la misma Orden de Compra hay artículos de más de un proveedor, genera la Orden de Compra Matriz (ej. OC-2026-780)
   * y automáticamente desglosa los Sub-Pedidos por proveedor basados en ese mismo número (ej. OC-2026-780-P1, OC-2026-780-P2).
   */
  public static emitirOrdenCompraDesdeSolicitud(params: {
    solicitudId: string;
    proveedorNombre?: string;
    rucProveedor?: string;
    seleccionesPorItem?: Record<number, OpcionProveedorMarketplaceItem>;
  }): {
    solicitudActualizada: SolicitudCompraDesdeBodega;
    numeroOC: string;
    subPedidosGenerados: SubPedidoProveedorOC[];
  } {
    const solicitudes = this.getSolicitudesCompraBodega();
    const idx = solicitudes.findIndex(s => s.id === params.solicitudId);
    if (idx < 0) {
      throw new Error('Solicitud de compra no encontrada');
    }

    const sol = solicitudes[idx];
    const numeroOC = sol.numeroOCGenerada && sol.numeroOCGenerada.startsWith('OC-')
      ? sol.numeroOCGenerada
      : `OC-2026-${Math.floor(100 + Math.random() * 899)}`;

    // Agrupar ítems por proveedor seleccionado (usando la recomendación IA #1 más cercana por defecto si no se especificó)
    const gruposPorProveedor = new Map<
      string,
      {
        opcionProveedor: OpcionProveedorMarketplaceItem;
        itemsIndices: number[];
      }
    >();

    sol.itemsAComprar.forEach((it, itemIdx) => {
      const opcionesItem = this.analizarOpcionesMarketplacePorItem(it, 'Loja');
      const recomendada = opcionesItem.find(o => o.esRecomendadoIA) || opcionesItem[0];
      const elegida = params.seleccionesPorItem?.[itemIdx] || recomendada;

      const existente = gruposPorProveedor.get(elegida.proveedorId);
      if (existente) {
        existente.itemsIndices.push(itemIdx);
      } else {
        gruposPorProveedor.set(elegida.proveedorId, {
          opcionProveedor: elegida,
          itemsIndices: [itemIdx],
        });
      }
    });

    const subPedidosGenerados: SubPedidoProveedorOC[] = [];
    const mapaItemSubPedido: Record<
      number,
      { proveedorId: string; proveedorNombre: string; subPedidoRef: string; unitPrice: number; subtotal: number }
    > = {};

    let correlativoProveedor = 1;
    const fechaHoy = new Date().toISOString().split('T')[0];

    gruposPorProveedor.forEach(({ opcionProveedor, itemsIndices }) => {
      const numeroSubPedido = `${numeroOC}-P${correlativoProveedor}`;
      correlativoProveedor += 1;

      const itemsAsignados = itemsIndices.map(iIdx => {
        const rawItem = sol.itemsAComprar[iIdx];
        const subtotalMat = +(rawItem.cantidadAComprar * opcionProveedor.precioUnitarioNetoUSD).toFixed(2);
        mapaItemSubPedido[iIdx] = {
          proveedorId: opcionProveedor.proveedorId,
          proveedorNombre: opcionProveedor.razonSocial,
          subPedidoRef: numeroSubPedido,
          unitPrice: opcionProveedor.precioUnitarioNetoUSD,
          subtotal: subtotalMat,
        };
        return {
          codigo: rawItem.codigo,
          nombre: rawItem.nombre,
          unidad: rawItem.unidad,
          cantidad: rawItem.cantidadAComprar,
          precioUnitarioUSD: opcionProveedor.precioUnitarioNetoUSD,
          subtotalMaterialUSD: subtotalMat,
          ivaPct: opcionProveedor.ivaAplicablePct,
        };
      });

      const subtotalMaterialesUSD = +itemsAsignados
        .reduce((acc, x) => acc + x.subtotalMaterialUSD, 0)
        .toFixed(2);
      const costoFleteConsolidadoUSD = opcionProveedor.costoFleteEstimadoUSD;
      const ivaTotalUSD = +itemsAsignados
        .reduce((acc, x) => acc + x.subtotalMaterialUSD * (x.ivaPct / 100), 0)
        .toFixed(2);
      const totalPedidoProveedorUSD = +(
        subtotalMaterialesUSD +
        costoFleteConsolidadoUSD +
        ivaTotalUSD
      ).toFixed(2);

      subPedidosGenerados.push({
        numeroSubPedido,
        ordenCompraMatrizRef: numeroOC,
        solicitudOrigenRef: sol.numeroSolicitudCompra,
        pedidoResidenteOrigenRef: sol.numeroPedidoOrigen,
        proveedorId: opcionProveedor.proveedorId,
        razonSocial: opcionProveedor.razonSocial,
        ruc: opcionProveedor.ruc,
        ciudadUbicacion: opcionProveedor.ciudadUbicacion,
        anilloCobertura: opcionProveedor.anilloCobertura,
        etiquetaAnillo: opcionProveedor.etiquetaAnillo,
        distanciaKmDesdeObra: opcionProveedor.distanciaKmDesdeObra,
        tiempoEntregaEstimado: opcionProveedor.tiempoEntregaEstimado,
        itemsAsignados,
        subtotalMaterialesUSD,
        costoFleteConsolidadoUSD,
        ivaTotalUSD,
        totalPedidoProveedorUSD,
        fechaEmision: fechaHoy,
        estadoDespachoProveedor: 'EMITIDO_AL_PROVEEDOR',
      });
    });

    const resumenProveedores = subPedidosGenerados
      .map(sp => `${sp.numeroSubPedido}: ${sp.razonSocial}`)
      .join(' | ');
    const resumenRucs = subPedidosGenerados.map(sp => sp.ruc).join(' / ');

    const itemsActualizados = sol.itemsAComprar.map((it, iIdx) => {
      const info = mapaItemSubPedido[iIdx];
      if (!info) return it;
      return {
        ...it,
        costoUnitarioEstimadoUSD: info.unitPrice,
        subtotalEstimadoUSD: info.subtotal,
        proveedorAsignadoId: info.proveedorId,
        proveedorAsignadoNombre: info.proveedorNombre,
        subPedidoGeneradoRef: info.subPedidoRef,
      };
    });

    const nuevoMontoTotal = +subPedidosGenerados
      .reduce((acc, sp) => acc + sp.totalPedidoProveedorUSD, 0)
      .toFixed(2);

    const solicitudActualizada: SolicitudCompraDesdeBodega = {
      ...sol,
      estado: 'OC_GENERADA_ENVIADA_PROVEEDOR',
      numeroOCGenerada: numeroOC,
      proveedorSeleccionado: params.proveedorNombre || resumenProveedores,
      rucProveedor: params.rucProveedor || resumenRucs,
      subPedidosPorProveedor: subPedidosGenerados,
      itemsAComprar: itemsActualizados,
      montoTotalEstimadoUSD: nuevoMontoTotal,
    };

    solicitudes[idx] = solicitudActualizada;
    this.saveSolicitudesCompraBodega(solicitudes);

    // Actualizar también el pedido original del residente
    const pedidos = this.getPedidos();
    const pIdx = pedidos.findIndex(p => p.id === sol.pedidoOrigenId);
    if (pIdx >= 0) {
      pedidos[pIdx] = {
        ...pedidos[pIdx],
        estado: 'ORDEN_COMPRA_EMITIDA',
        ordenCompraGeneradaRef: `${numeroOC} (${subPedidosGenerados.map(s => s.numeroSubPedido).join(', ')})`,
      };
      this.savePedidos(pedidos);
    }

    return {
      solicitudActualizada,
      numeroOC,
      subPedidosGenerados,
    };
  }
}
