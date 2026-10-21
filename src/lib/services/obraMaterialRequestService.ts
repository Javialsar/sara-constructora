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
   * El Área de Compras aprueba la Solicitud del Bodeguero y emite la Orden de Compra (OC) oficial,
   * dejándola lista para recepción física cuando llegue el camión a Bodega.
   */
  public static emitirOrdenCompraDesdeSolicitud(params: {
    solicitudId: string;
    proveedorNombre: string;
    rucProveedor: string;
  }): {
    solicitudActualizada: SolicitudCompraDesdeBodega;
    numeroOC: string;
  } {
    const solicitudes = this.getSolicitudesCompraBodega();
    const idx = solicitudes.findIndex(s => s.id === params.solicitudId);
    if (idx < 0) {
      throw new Error('Solicitud de compra no encontrada');
    }

    const sol = solicitudes[idx];
    const numeroOC = `OC-2026-${Math.floor(100 + Math.random() * 899)}`;

    const solicitudActualizada: SolicitudCompraDesdeBodega = {
      ...sol,
      estado: 'OC_GENERADA_ENVIADA_PROVEEDOR',
      numeroOCGenerada: numeroOC,
      proveedorSeleccionado: params.proveedorNombre,
      rucProveedor: params.rucProveedor,
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
        ordenCompraGeneradaRef: numeroOC,
      };
      this.savePedidos(pedidos);
    }

    return {
      solicitudActualizada,
      numeroOC,
    };
  }
}
