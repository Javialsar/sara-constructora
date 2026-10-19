/**
 * SERVICIO AGÉNTICO INTEGRAL DE REQUISICIONES APU, PROCURAMIENTO PREDICTIVO
 * Y FRAGMENTACIÓN AUTOMÁTICA DE ÓRDENES DE COMPRA (GRUPO SARA)
 * 
 * Orquesta la cadena completa:
 * 1. Cronograma & Explosión Matemática de APU (Materiales, Equipos, Cuadrillas)
 * 2. Requisición Oficial de Obra con Desperdicio Normativo NEC
 * 3. Análisis Multicriterio (Agente SARA_PREDICTIVE_PURCHASE: Landed Cost & Ubicación Geográfica)
 * 4. Presentación de 2 Opciones Estratégicas (Máximo Ahorro vs. Máxima Inmediatez Local)
 * 5. Fragmentación Automática en Órdenes de Compra por Proveedor
 * 6. Sincronización en Cascada con Bodega, Contabilidad (3-Way Match) y SARA Talento
 */

export interface InsumoExplosionado {
  id: string;
  codigo: string;
  descripcion: string;
  rubroOrigen: string;
  categoria: 'ACERO' | 'CEMENTO_HORMIGON' | 'ARIDOS' | 'MAMPOSTERIA' | 'TUBERIAS_PVC' | 'ACABADOS' | 'FIJACION';
  unidad: string;
  cantidadNeta: number;
  desperdicioNormativoPct: number;
  cantidadRequerida: number;
  pesoUnitarioKg: number;
  pesoTotalToneladas: number;
}

export interface EquipoRequerido {
  id: string;
  codigo: string;
  descripcion: string;
  horasRequeridas: number;
  costoHoraUSD: number;
  operadorIncluido: boolean;
  proveedorSugerido: string;
}

export interface CuadrillaRequerida {
  id: string;
  categoriaOcupacional: string;
  especialidad: string;
  cantidadPersonas: number;
  jornadasEstimadas: number;
  certificacionRequerida: string;
  costoHorarioEstimado: number;
}

export interface FaseCronogramaObra {
  id: string;
  numeroFase: number;
  nombreFase: string;
  semanasEstimadas: string;
  estadoAvancePct: number;
  rubrosPrincipales: string[];
  insumos: InsumoExplosionado[];
  equipos: EquipoRequerido[];
  cuadrilla: CuadrillaRequerida[];
}

export interface ProyectoObraActivo {
  id: string;
  codigo: string;
  nombre: string;
  provincia: string;
  canton: string;
  direccionExacta: string;
  coordenadas: { lat: number; lng: number };
  residenteObra: string;
  fiscalizadorObra: string;
  presupuestoTotalUSD: number;
  fasesCronograma: FaseCronogramaObra[];
}

export interface RequisicionObra {
  id: string;
  numeroRequisicion: string;
  proyectoId: string;
  proyectoNombre: string;
  cantonDestino: string;
  provinciaDestino: string;
  faseCronogramaId: string;
  faseNombre: string;
  fechaEmision: string;
  residenteEmisor: string;
  observaciones: string;
  materiales: InsumoExplosionado[];
  equipos: EquipoRequerido[];
  cuadrilla: CuadrillaRequerida[];
  pesoTotalCargaToneladas: number;
  estado: 'PENDIENTE_ANALISIS_COMPRAS' | 'ANALIZADA_IA' | 'ORDEN_DESPACHADA';
}

export interface ProveedorAsignadoCompra {
  proveedorId: string;
  razonSocial: string;
  ruc: string;
  ciudadDespacho: string;
  distanciaKm: number;
  fleteTotalUSD: number;
  items: Array<{
    insumoCodigo: string;
    descripcion: string;
    unidad: string;
    cantidad: number;
    precioUnitarioBase: number;
    descuentoVolumenPct: number;
    precioUnitarioNeto: number;
    subtotalUSD: number;
  }>;
  subtotalMaterialesUSD: number;
  costoFleteUSD: number;
  totalPuestoEnObraUSD: number;
  tiempoEntregaHoras: number;
}

export interface EscenarioOpcionCompra {
  id: 'OPCION_A_AHORRO' | 'OPCION_B_INMEDIATEZ';
  titulo: string;
  estrategia: string;
  enfoque: 'FABRICA_MAYORISTA_AHORRO' | 'DISTRIBUIDOR_LOCAL_VELOCIDAD';
  costoMaterialesNetoUSD: number;
  descuentoGlobalAlcanzadoUSD: number;
  costoFletePesadoUSD: number;
  costoTotalLandedUSD: number;
  tiempoEstimadoHoras: number;
  ahorroRespectoPrecioListaUSD: number;
  proveedoresInvolucrados: ProveedorAsignadoCompra[];
  justificacionAgenteIA: string;
  recomendado: boolean;
}

export interface AnalisisAgenteComprasResult {
  requisicionId: string;
  fechaAnalisis: string;
  agenteResponsable: string;
  cantonObra: string;
  toneladasEvaluadas: number;
  opcionA: EscenarioOpcionCompra;
  opcionB: EscenarioOpcionCompra;
}

export interface OrdenCompraGenerada {
  id: string;
  numeroOC: string;
  requisicionId: string;
  proveedorId: string;
  razonSocial: string;
  ruc: string;
  ciudadOrigen: string;
  obraDestino: string;
  fechaEmision: string;
  fechaEntregaEstimada: string;
  condicionPago: string;
  subtotal: number;
  flete: number;
  iva15: number;
  totalAPagar: number;
  items: Array<{
    codigo: string;
    descripcion: string;
    unidad: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }>;
  archivoPDFGenerado: string;
  estado: 'EMITIDA_ENVIADA_PROVEEDOR' | 'EN_TRANSITO_A_BODEGA' | 'RECIBIDA_EN_BODEGA';
  notificacionBodegaEnviada: boolean;
  notificacionContabilidadEnviada: boolean;
}

// -----------------------------------------------------------------------------
// CATÁLOGO BASE DE PROYECTOS Y FASES APU ECUADOR
// -----------------------------------------------------------------------------
export const PROYECTOS_OBRA_MOCK: ProyectoObraActivo[] = [
  {
    id: 'proy-01',
    codigo: 'SARA-OBRA-LOJA-01',
    nombre: 'Edificio Residencial El Mirador (Loja)',
    provincia: 'Loja',
    canton: 'Loja',
    direccionExacta: 'Av. Salvador Bustamante Celi y San Cayetano Alto',
    coordenadas: { lat: -3.9931, lng: -79.2042 },
    residenteObra: 'Ing. Luis Castro',
    fiscalizadorObra: 'Ing. Gonzalo Benítez',
    presupuestoTotalUSD: 485200.0,
    fasesCronograma: [
      {
        id: 'fase-01',
        numeroFase: 1,
        nombreFase: 'Cimentación, Zapatas Aisladas y Muros de Contención',
        semanasEstimadas: 'Semanas 1 - 4',
        estadoAvancePct: 100,
        rubrosPrincipales: [
          'Hormigón Simple f\'c=210 kg/cm² en Zapatas',
          'Acero de Refuerzo Corrugado Fy=420 MPa',
          'Encofrado de Madera para Cimientos'
        ],
        insumos: [
          {
            id: 'ins-01',
            codigo: 'AC-ADEL-16MM',
            descripcion: 'Varilla corrugada de acero 16mm x 12m soldable ASTM A706',
            rubroOrigen: 'Acero de Refuerzo en Zapatas',
            categoria: 'ACERO',
            unidad: 'Varilla 12m',
            cantidadNeta: 340,
            desperdicioNormativoPct: 5.0,
            cantidadRequerida: 357,
            pesoUnitarioKg: 18.96,
            pesoTotalToneladas: 6.77
          },
          {
            id: 'ins-02',
            codigo: 'AC-ADEL-12MM',
            descripcion: 'Varilla corrugada de acero 12mm x 12m soldable ASTM A706',
            rubroOrigen: 'Armado Canastillas Zapatas',
            categoria: 'ACERO',
            unidad: 'Varilla 12m',
            cantidadNeta: 480,
            desperdicioNormativoPct: 5.0,
            cantidadRequerida: 504,
            pesoUnitarioKg: 10.66,
            pesoTotalToneladas: 5.37
          },
          {
            id: 'ins-03',
            codigo: 'CM-HOLC-F50',
            descripcion: 'Cemento Portland Tipo GU Especial Obra Holcim Fuerte 50kg',
            rubroOrigen: 'Hormigón f\'c=210 kg/cm²',
            categoria: 'CEMENTO_HORMIGON',
            unidad: 'Saco 50kg',
            cantidadNeta: 600,
            desperdicioNormativoPct: 4.0,
            cantidadRequerida: 624,
            pesoUnitarioKg: 50.0,
            pesoTotalToneladas: 31.20
          },
          {
            id: 'ins-04',
            codigo: 'AG-HOLC-ARLA',
            descripcion: 'Arena Lavada Clasificada de Río (Humedad < 3%)',
            rubroOrigen: 'Mortero y Hormigón Zapatas',
            categoria: 'ARIDOS',
            unidad: 'm³',
            cantidadNeta: 42,
            desperdicioNormativoPct: 8.0,
            cantidadRequerida: 45,
            pesoUnitarioKg: 1450.0,
            pesoTotalToneladas: 65.25
          },
          {
            id: 'ins-05',
            codigo: 'AC-ADEL-AL18',
            descripcion: 'Alambre recocido negro calibre 18 para amarre',
            rubroOrigen: 'Amarre de Armaduras',
            categoria: 'FIJACION',
            unidad: 'Rollo 50kg',
            cantidadNeta: 8,
            desperdicioNormativoPct: 10.0,
            cantidadRequerida: 9,
            pesoUnitarioKg: 50.0,
            pesoTotalToneladas: 0.45
          }
        ],
        equipos: [
          {
            id: 'eq-01',
            codigo: 'EQ-EXC-CAT320',
            descripcion: 'Excavadora sobre orugas CAT 320 GC con cuchara 1.2 m³',
            horasRequeridas: 45,
            costoHoraUSD: 48.0,
            operadorIncluido: true,
            proveedorSugerido: 'IIASA Caterpillar Loja'
          },
          {
            id: 'eq-02',
            codigo: 'EQ-VIB-55HP',
            descripcion: 'Vibrador de concreto con motor a gasolina 5.5 HP y sonda 38mm',
            horasRequeridas: 32,
            costoHoraUSD: 8.5,
            operadorIncluido: false,
            proveedorSugerido: 'Alcomaq Alquileres'
          }
        ],
        cuadrilla: [
          {
            id: 'cu-01',
            categoriaOcupacional: 'Maestro Mayor de Obra',
            especialidad: 'Dirección de Vaciados & Encofrados',
            cantidadPersonas: 1,
            jornadasEstimadas: 24,
            certificacionRequerida: 'SECAP Nivel Experto',
            costoHorarioEstimado: 4.39
          },
          {
            id: 'cu-02',
            categoriaOcupacional: 'Fierrero Especialista',
            especialidad: 'Habilitación y Amarre de Parrillas',
            cantidadPersonas: 3,
            jornadasEstimadas: 20,
            certificacionRequerida: 'Acreditado SECAP',
            costoHorarioEstimado: 3.56
          },
          {
            id: 'cu-03',
            categoriaOcupacional: 'Albañil Calificado',
            especialidad: 'Hormigonado y Vibrado Estructural',
            cantidadPersonas: 5,
            jornadasEstimadas: 24,
            certificacionRequerida: 'Planilla IESS Sector Construcción',
            costoHorarioEstimado: 3.25
          }
        ]
      },
      {
        id: 'fase-02',
        numeroFase: 2,
        nombreFase: 'Estructura Vertical (Columnas) & Losa Entrepiso Nivel +3.00m',
        semanasEstimadas: 'Semanas 5 - 8 (FASE ACTUAL)',
        estadoAvancePct: 35,
        rubrosPrincipales: [
          'Hormigón Premezclado Bombeado f\'c=210 kg/cm²',
          'Acero Corrugado en Columnas y Vigas Descolgadas',
          'Losa Aligerada con Bloque y Malla Electrosoldada R-188'
        ],
        insumos: [
          {
            id: 'ins-06',
            codigo: 'AC-ADEL-12MM',
            descripcion: 'Varilla corrugada de acero 12mm x 12m soldable ASTM A706',
            rubroOrigen: 'Columnas y Vigas de Entrepiso',
            categoria: 'ACERO',
            unidad: 'Varilla 12m',
            cantidadNeta: 420,
            desperdicioNormativoPct: 6.0,
            cantidadRequerida: 445,
            pesoUnitarioKg: 10.66,
            pesoTotalToneladas: 4.74
          },
          {
            id: 'ins-07',
            codigo: 'AC-ADEL-10MM',
            descripcion: 'Varilla corrugada de acero 10mm x 12m para estribos confinados',
            rubroOrigen: 'Estribos en Columnas Sismorresistentes',
            categoria: 'ACERO',
            unidad: 'Varilla 12m',
            cantidadNeta: 310,
            desperdicioNormativoPct: 6.0,
            cantidadRequerida: 329,
            pesoUnitarioKg: 7.40,
            pesoTotalToneladas: 2.43
          },
          {
            id: 'ins-08',
            codigo: 'CM-HOLC-F50',
            descripcion: 'Cemento Portland Tipo GU Especial Obra Holcim Fuerte 50kg',
            rubroOrigen: 'Vaciado de Losa y Columnas',
            categoria: 'CEMENTO_HORMIGON',
            unidad: 'Saco 50kg',
            cantidadNeta: 750,
            desperdicioNormativoPct: 5.0,
            cantidadRequerida: 788,
            pesoUnitarioKg: 50.0,
            pesoTotalToneladas: 39.40
          },
          {
            id: 'ins-09',
            codigo: 'AC-ADEL-MR188',
            descripcion: 'Malla electrosoldada estándar R-188 (15x15 cm - 6mm)',
            rubroOrigen: 'Capa de Compresión Losa Nivel +3.00m',
            categoria: 'ACERO',
            unidad: 'Panel 6x2.40m',
            cantidadNeta: 48,
            desperdicioNormativoPct: 7.0,
            cantidadRequerida: 51,
            pesoUnitarioKg: 38.5,
            pesoTotalToneladas: 1.96
          },
          {
            id: 'ins-10',
            codigo: 'BQ-DIS-1520',
            descripcion: 'Bloque de Concreto Alivianamiento de Losa 15x20x40cm',
            rubroOrigen: 'Aligeramiento de Losa Nervada',
            categoria: 'MAMPOSTERIA',
            unidad: 'Unidad',
            cantidadNeta: 2100,
            desperdicioNormativoPct: 5.0,
            cantidadRequerida: 2205,
            pesoUnitarioKg: 12.0,
            pesoTotalToneladas: 26.46
          },
          {
            id: 'ins-11',
            codigo: 'TU-RIV-PR12',
            descripcion: 'Tubería PVC Presión 1/2" E/C 1.25 MPa x 6m Pases de Losa',
            rubroOrigen: 'Pases de Fontanería en Losa',
            categoria: 'TUBERIAS_PVC',
            unidad: 'Tubo 6m',
            cantidadNeta: 35,
            desperdicioNormativoPct: 8.0,
            cantidadRequerida: 38,
            pesoUnitarioKg: 1.8,
            pesoTotalToneladas: 0.07
          }
        ],
        equipos: [
          {
            id: 'eq-03',
            codigo: 'EQ-BOM-MIXER',
            descripcion: 'Servicio de Bomba Pluma de Hormigón 28m y Mixer 8m³',
            horasRequeridas: 16,
            costoHoraUSD: 85.0,
            operadorIncluido: true,
            proveedorSugerido: 'Holcim Planta Loja'
          },
          {
            id: 'eq-04',
            codigo: 'EQ-PUNTAL-MET',
            descripcion: 'Lote de 300 Puntales Metálicos Telescópicos para Encofrado de Losa',
            horasRequeridas: 240,
            costoHoraUSD: 3.2,
            operadorIncluido: false,
            proveedorSugerido: 'Alcomaq Loja'
          }
        ],
        cuadrilla: [
          {
            id: 'cu-04',
            categoriaOcupacional: 'Maestro Mayor de Obra',
            especialidad: 'Nivelación Láser & Armado de Nervaduras',
            cantidadPersonas: 1,
            jornadasEstimadas: 24,
            certificacionRequerida: 'SECAP Nivel Experto',
            costoHorarioEstimado: 4.39
          },
          {
            id: 'cu-05',
            categoriaOcupacional: 'Fierrero Especialista',
            especialidad: 'Corte y Colocación de Acero Positivo y Negativo',
            cantidadPersonas: 3,
            jornadasEstimadas: 22,
            certificacionRequerida: 'SECAP Fierrero',
            costoHorarioEstimado: 3.56
          },
          {
            id: 'cu-06',
            categoriaOcupacional: 'Albañil Calificado',
            especialidad: 'Vaciado, Regleado y Curado de Losa',
            cantidadPersonas: 6,
            jornadasEstimadas: 24,
            certificacionRequerida: 'Planilla IESS CICS',
            costoHorarioEstimado: 3.25
          }
        ]
      }
    ]
  },
  {
    id: 'proy-02',
    codigo: 'SARA-OBRA-CALV-02',
    nombre: 'Conjunto Habitacional Las Acacias (Cariamanga)',
    provincia: 'Loja',
    canton: 'Cariamanga',
    direccionExacta: 'Sector Baño del Inca / Calvas',
    coordenadas: { lat: -4.3312, lng: -79.5542 },
    residenteObra: 'Ing. Marcelo Valarezo',
    fiscalizadorObra: 'Ing. Rodrigo Paredes',
    presupuestoTotalUSD: 215000.0,
    fasesCronograma: [
      {
        id: 'fase-03',
        numeroFase: 1,
        nombreFase: 'Mamposterías de Bloque, Tuberías Hidrosanitarias & Contrapisos',
        semanasEstimadas: 'Semanas 4 - 7 (FASE ACTUAL)',
        estadoAvancePct: 20,
        rubrosPrincipales: [
          'Mampostería de Bloque de Cemento 15x20x40cm',
          'Red Sanitaria PVC 110mm y Desagües 50mm',
          'Contrapiso de Hormigón e=8cm'
        ],
        insumos: [
          {
            id: 'ins-12',
            codigo: 'BQ-DIS-1520',
            descripcion: 'Bloque de Concreto Vibroprensado 15x20x40cm Carga 3.5 MPa',
            rubroOrigen: 'Paredes y Cerramientos',
            categoria: 'MAMPOSTERIA',
            unidad: 'Unidad',
            cantidadNeta: 4500,
            desperdicioNormativoPct: 6.0,
            cantidadRequerida: 4770,
            pesoUnitarioKg: 12.0,
            pesoTotalToneladas: 57.24
          },
          {
            id: 'ins-13',
            codigo: 'CM-HOLC-F50',
            descripcion: 'Cemento Portland Tipo GU Especial Obra Holcim Fuerte 50kg',
            rubroOrigen: 'Pegado de Bloques y Contrapisos',
            categoria: 'CEMENTO_HORMIGON',
            unidad: 'Saco 50kg',
            cantidadNeta: 480,
            desperdicioNormativoPct: 5.0,
            cantidadRequerida: 504,
            pesoUnitarioKg: 50.0,
            pesoTotalToneladas: 25.20
          },
          {
            id: 'ins-14',
            codigo: 'TU-DIS-SAN110',
            descripcion: 'Tubería Sanitaria PVC Pesada 110mm x 3m junta rápida',
            rubroOrigen: 'Redes de Aguas Servidas',
            categoria: 'TUBERIAS_PVC',
            unidad: 'Tubo 3m',
            cantidadNeta: 65,
            desperdicioNormativoPct: 5.0,
            cantidadRequerida: 68,
            pesoUnitarioKg: 3.5,
            pesoTotalToneladas: 0.24
          },
          {
            id: 'ins-15',
            codigo: 'AG-HOLC-ARLA',
            descripcion: 'Arena Lavada Clasificada de Río para Pegado de Mampostería',
            rubroOrigen: 'Mortero 1:4 Pegado Bloque',
            categoria: 'ARIDOS',
            unidad: 'm³',
            cantidadNeta: 30,
            desperdicioNormativoPct: 10.0,
            cantidadRequerida: 33,
            pesoUnitarioKg: 1450.0,
            pesoTotalToneladas: 47.85
          }
        ],
        equipos: [
          {
            id: 'eq-05',
            codigo: 'EQ-TRM-1SAC',
            descripcion: 'Hormigonera de Volteo 1 Saco a Gasolina 9 HP',
            horasRequeridas: 40,
            costoHoraUSD: 7.0,
            operadorIncluido: false,
            proveedorSugerido: 'Ferretería Central Cariamanga'
          }
        ],
        cuadrilla: [
          {
            id: 'cu-07',
            categoriaOcupacional: 'Maestro de Obra',
            especialidad: 'Control de Modulación y Plomos',
            cantidadPersonas: 1,
            jornadasEstimadas: 20,
            certificacionRequerida: 'SECAP',
            costoHorarioEstimado: 4.39
          },
          {
            id: 'cu-08',
            categoriaOcupacional: 'Albañil Oficial',
            especialidad: 'Colocación Rápida de Bloques y Dintelados',
            cantidadPersonas: 4,
            jornadasEstimadas: 20,
            certificacionRequerida: 'IESS Planilla Activa',
            costoHorarioEstimado: 3.25
          }
        ]
      }
    ]
  }
];

// -----------------------------------------------------------------------------
// MOTOR AGÉNTICO PRINCIPAL: APU REQUISITION & PURCHASE WORKFLOW SERVICE
// -----------------------------------------------------------------------------
export class ApuRequisitionWorkflowService {

  /**
   * Genera la Requisición de Obra Oficial a partir de la Fase seleccionada del Cronograma
   */
  public static generarRequisicionDesdeFase(
    proyecto: ProyectoObraActivo,
    fase: FaseCronogramaObra,
    observaciones: string = 'Requisición generada automáticamente desde explosión de APU por SARA_APU_EXPLODER.'
  ): RequisicionObra {
    const pesoTotalToneladas = +(
      fase.insumos.reduce((acc, ins) => acc + ins.pesoTotalToneladas, 0)
    ).toFixed(2);

    const timestamp = Date.now().toString().slice(-4);
    const numeroReq = `RQ-${proyecto.canton.substring(0, 3).toUpperCase()}-${fase.numeroFase}0${timestamp}`;

    return {
      id: `req-${Date.now()}`,
      numeroRequisicion: numeroReq,
      proyectoId: proyecto.id,
      proyectoNombre: proyecto.nombre,
      cantonDestino: proyecto.canton,
      provinciaDestino: proyecto.provincia,
      faseCronogramaId: fase.id,
      faseNombre: fase.nombreFase,
      fechaEmision: new Date().toLocaleDateString('es-EC', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      residenteEmisor: proyecto.residenteObra,
      observaciones,
      materiales: [...fase.insumos],
      equipos: [...fase.equipos],
      cuadrilla: [...fase.cuadrilla],
      pesoTotalCargaToneladas: pesoTotalToneladas,
      estado: 'PENDIENTE_ANALISIS_COMPRAS'
    };
  }

  /**
   * AGENTE SARA_PREDICTIVE_PURCHASE:
   * Analiza la requisición geográficamente y genera las 2 opciones ejecutivas de compra.
   */
  public static analizarRequisicionConAgente(req: RequisicionObra): AnalisisAgenteComprasResult {
    const esCariamanga = req.cantonDestino.toLowerCase().includes('cariamanga');
    const esLoja = req.cantonDestino.toLowerCase().includes('loja');

    // Distancias viales promedio (Km) según cantón de destino
    // ADELCA planta principal (Quito/Guayaquil a Loja: ~680 km, de bodega regional Cuenca a Loja: ~210 km)
    const distanciaAdelcaPlantaKm = esCariamanga ? 295 : 210;
    const distanciaHolcimPlantaKm = esCariamanga ? 85 : 18; // Planta Loja a Cariamanga 85 km, a Loja ciudad 18 km
    const distanciaDisensaLocalKm = esCariamanga ? 6 : 4;   // Patio local en el mismo cantón

    // -------------------------------------------------------------------------
    // OPCIÓN A: MÁXIMO AHORRO CORPORATIVO (FÁBRICA DIRECTA / PLANTA)
    // -------------------------------------------------------------------------
    // En Opción A se compran varillas a ADELCA fábrica (10% descuento), cemento a HOLCIM planta (8% descuento)
    // y tuberías a RIVAL fábrica (10% descuento). Se optimiza el flete pesado MTOP consolidado.

    const itemsAdelcaOpcionA = req.materiales
      .filter(m => m.categoria === 'ACERO' || m.categoria === 'FIJACION')
      .map(m => {
        const precioBase = m.codigo.includes('16MM') ? 20.20 : m.codigo.includes('12MM') ? 11.35 : m.codigo.includes('10MM') ? 7.85 : m.codigo.includes('MR188') ? 38.90 : 68.50;
        const descuento = 10.0; // 10% descuento corporativo en fábrica
        const neto = +(precioBase * (1 - descuento / 100)).toFixed(2);
        return {
          insumoCodigo: m.codigo,
          descripcion: m.descripcion,
          unidad: m.unidad,
          cantidad: m.cantidadRequerida,
          precioUnitarioBase: precioBase,
          descuentoVolumenPct: descuento,
          precioUnitarioNeto: neto,
          subtotalUSD: +(neto * m.cantidadRequerida).toFixed(2)
        };
      });

    const itemsHolcimOpcionA = req.materiales
      .filter(m => m.categoria === 'CEMENTO_HORMIGON' || m.categoria === 'ARIDOS')
      .map(m => {
        const precioBase = m.codigo.includes('F50') ? 8.45 : 18.50;
        const descuento = 8.5; // 8.5% descuento mayorista
        const neto = +(precioBase * (1 - descuento / 100)).toFixed(2);
        return {
          insumoCodigo: m.codigo,
          descripcion: m.descripcion,
          unidad: m.unidad,
          cantidad: m.cantidadRequerida,
          precioUnitarioBase: precioBase,
          descuentoVolumenPct: descuento,
          precioUnitarioNeto: neto,
          subtotalUSD: +(neto * m.cantidadRequerida).toFixed(2)
        };
      });

    const itemsDisensaOpcionA = req.materiales
      .filter(m => m.categoria === 'MAMPOSTERIA' || m.categoria === 'TUBERIAS_PVC')
      .map(m => {
        const precioBase = m.codigo.includes('1520') ? 0.65 : 14.20;
        const descuento = 6.0;
        const neto = +(precioBase * (1 - descuento / 100)).toFixed(2);
        return {
          insumoCodigo: m.codigo,
          descripcion: m.descripcion,
          unidad: m.unidad,
          cantidad: m.cantidadRequerida,
          precioUnitarioBase: precioBase,
          descuentoVolumenPct: descuento,
          precioUnitarioNeto: neto,
          subtotalUSD: +(neto * m.cantidadRequerida).toFixed(2)
        };
      });

    // Fletes pesados MTOP consolidados con optimización de retorno (Backhaul)
    const fleteAdelcaA = +(distanciaAdelcaPlantaKm * 1.35 * 0.14 * 12).toFixed(2); // ~12T acero
    const fleteHolcimA = +(distanciaHolcimPlantaKm * 1.35 * 0.16 * 25).toFixed(2); // ~25T cemento
    const fleteDisensaA = 45.0; // Despacho local patio

    const subAdelcaA = itemsAdelcaOpcionA.reduce((acc, i) => acc + i.subtotalUSD, 0);
    const subHolcimA = itemsHolcimOpcionA.reduce((acc, i) => acc + i.subtotalUSD, 0);
    const subDisensaA = itemsDisensaOpcionA.reduce((acc, i) => acc + i.subtotalUSD, 0);

    const proveedoresOpcionA: ProveedorAsignadoCompra[] = [];
    if (itemsAdelcaOpcionA.length > 0) {
      proveedoresOpcionA.push({
        proveedorId: 'pr-01',
        razonSocial: 'ADELCA Aceros del Ecuador C.A.',
        ruc: '1790012345001',
        ciudadDespacho: 'Centro de Distribución Regional Sur',
        distanciaKm: distanciaAdelcaPlantaKm,
        fleteTotalUSD: fleteAdelcaA,
        items: itemsAdelcaOpcionA,
        subtotalMaterialesUSD: subAdelcaA,
        costoFleteUSD: fleteAdelcaA,
        totalPuestoEnObraUSD: +(subAdelcaA + fleteAdelcaA).toFixed(2),
        tiempoEntregaHoras: 24
      });
    }

    if (itemsHolcimOpcionA.length > 0) {
      proveedoresOpcionA.push({
        proveedorId: 'pr-02',
        razonSocial: 'HOLCIM Ecuador S.A.',
        ruc: '0990004589001',
        ciudadDespacho: 'Planta Loja / Despacho a Granel y Sacos',
        distanciaKm: distanciaHolcimPlantaKm,
        fleteTotalUSD: fleteHolcimA,
        items: itemsHolcimOpcionA,
        subtotalMaterialesUSD: subHolcimA,
        costoFleteUSD: fleteHolcimA,
        totalPuestoEnObraUSD: +(subHolcimA + fleteHolcimA).toFixed(2),
        tiempoEntregaHoras: 18
      });
    }

    if (itemsDisensaOpcionA.length > 0) {
      proveedoresOpcionA.push({
        proveedorId: 'pr-03',
        razonSocial: 'DISENSA Red de Materiales Loja',
        ruc: '1102938475001',
        ciudadDespacho: 'Patio Central de Distribución',
        distanciaKm: distanciaDisensaLocalKm,
        fleteTotalUSD: fleteDisensaA,
        items: itemsDisensaOpcionA,
        subtotalMaterialesUSD: subDisensaA,
        costoFleteUSD: fleteDisensaA,
        totalPuestoEnObraUSD: +(subDisensaA + fleteDisensaA).toFixed(2),
        tiempoEntregaHoras: 6
      });
    }

    const subTotalMatA = +(subAdelcaA + subHolcimA + subDisensaA).toFixed(2);
    const totalFleteA = +(fleteAdelcaA + fleteHolcimA + fleteDisensaA).toFixed(2);
    const totalLandedA = +(subTotalMatA + totalFleteA).toFixed(2);
    const ahorroEstimadoA = +(subTotalMatA * 0.092).toFixed(2); // ~9.2% de ahorro respecto al precio de mostrador

    const opcionA: EscenarioOpcionCompra = {
      id: 'OPCION_A_AHORRO',
      titulo: 'Opción A: Máximo Ahorro Corporativo (Landed Cost Optimizado)',
      estrategia: 'Compra Mayorista Directa a Fabricantes & Plantas (Adelca + Holcim + Disensa)',
      enfoque: 'FABRICA_MAYORISTA_AHORRO',
      costoMaterialesNetoUSD: subTotalMatA,
      descuentoGlobalAlcanzadoUSD: ahorroEstimadoA,
      costoFletePesadoUSD: totalFleteA,
      costoTotalLandedUSD: totalLandedA,
      tiempoEstimadoHoras: 24,
      ahorroRespectoPrecioListaUSD: ahorroEstimadoA,
      proveedoresInvolucrados: proveedoresOpcionA,
      justificacionAgenteIA: `El agente determinó que comprando directamente a las plantas de ADELCA y HOLCIM se obtiene un descuento del 8.5% al 10% por volumen. A pesar de los ${distanciaAdelcaPlantaKm} km de transporte, el flete pesado MTOP se compensa ampliamente, generando un ahorro neto de $${ahorroEstimadoA} USD puesto en obra.`,
      recomendado: true
    };

    // -------------------------------------------------------------------------
    // OPCIÓN B: MÁXIMA VELOCIDAD & PROXIMIDAD LOCAL (DISTRIBUIDOR DE CANTÓN)
    // -------------------------------------------------------------------------
    // En Opción B se adquiere todo a través de la Red Local DISENSA / Ferretería Cantonal a precio de mostrador
    // (descuento menor: 2%), flete mínimo local y entrega inmediata en 2 a 4 horas.

    const itemsTodosDisensaB = req.materiales.map(m => {
      let precioBase = 10.0;
      if (m.codigo.includes('16MM')) precioBase = 20.20;
      else if (m.codigo.includes('12MM')) precioBase = 11.35;
      else if (m.codigo.includes('10MM')) precioBase = 7.85;
      else if (m.codigo.includes('F50')) precioBase = 8.45;
      else if (m.codigo.includes('1520')) precioBase = 0.65;
      else if (m.codigo.includes('MR188')) precioBase = 38.90;
      else if (m.codigo.includes('SAN110')) precioBase = 14.20;

      const descuento = 2.0; // Solo 2% de descuento local
      const neto = +(precioBase * (1 - descuento / 100)).toFixed(2);
      return {
        insumoCodigo: m.codigo,
        descripcion: m.descripcion,
        unidad: m.unidad,
        cantidad: m.cantidadRequerida,
        precioUnitarioBase: precioBase,
        descuentoVolumenPct: descuento,
        precioUnitarioNeto: neto,
        subtotalUSD: +(neto * m.cantidadRequerida).toFixed(2)
      };
    });

    const subTotalMatB = +(itemsTodosDisensaB.reduce((acc, i) => acc + i.subtotalUSD, 0)).toFixed(2);
    const fleteLocalB = esCariamanga ? 75.0 : 40.0; // Flete local en volqueta 14m3
    const totalLandedB = +(subTotalMatB + fleteLocalB).toFixed(2);
    const ahorroEstimadoB = +(subTotalMatB * 0.02).toFixed(2);

    const proveedoresOpcionB: ProveedorAsignadoCompra[] = [
      {
        proveedorId: 'pr-03',
        razonSocial: 'DISENSA Red de Materiales / Ferretería Asociada Local',
        ruc: '1102938475001',
        ciudadDespacho: req.cantonDestino,
        distanciaKm: distanciaDisensaLocalKm,
        fleteTotalUSD: fleteLocalB,
        items: itemsTodosDisensaB,
        subtotalMaterialesUSD: subTotalMatB,
        costoFleteUSD: fleteLocalB,
        totalPuestoEnObraUSD: totalLandedB,
        tiempoEntregaHoras: 3
      }
    ];

    const opcionB: EscenarioOpcionCompra = {
      id: 'OPCION_B_INMEDIATEZ',
      titulo: 'Opción B: Máxima Velocidad & Stock Local (Entrega Inmediata en Obra)',
      estrategia: 'Distribuidor Local de Cantón / Ferretería a Pie de Obra',
      enfoque: 'DISTRIBUIDOR_LOCAL_VELOCIDAD',
      costoMaterialesNetoUSD: subTotalMatB,
      descuentoGlobalAlcanzadoUSD: ahorroEstimadoB,
      costoFletePesadoUSD: fleteLocalB,
      costoTotalLandedUSD: totalLandedB,
      tiempoEstimadoHoras: 3,
      ahorroRespectoPrecioListaUSD: ahorroEstimadoB,
      proveedoresInvolucrados: proveedoresOpcionB,
      justificacionAgenteIA: `Recomendada si el residente requiere vaciar hormigón o armar estribos HOY MISMO. Los materiales se despachan desde el patio del cantón a menos de ${distanciaDisensaLocalKm} km. El tiempo de entrega es de apenas 3 horas, aunque el costo total es $${(totalLandedB - totalLandedA).toFixed(2)} USD superior a la opción de planta.`,
      recomendado: false
    };

    return {
      requisicionId: req.id,
      fechaAnalisis: new Date().toLocaleDateString('es-EC', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      agenteResponsable: 'SARA_PREDICTIVE_PURCHASE_AGENT',
      cantonObra: req.cantonDestino,
      toneladasEvaluadas: req.pesoTotalCargaToneladas,
      opcionA,
      opcionB
    };
  }

  /**
   * SARA_ORDER_DISPATCHER:
   * Fragmenta automáticamente el requerimiento en Órdenes de Compra por Proveedor
   * y las despacha digitalmente con copias a Bodega y Contabilidad.
   */
  public static generarOrdenesDeCompraFragmentadas(
    req: RequisicionObra,
    opcionSeleccionada: EscenarioOpcionCompra
  ): OrdenCompraGenerada[] {
    const ordenes: OrdenCompraGenerada[] = [];
    const fechaActual = new Date().toLocaleDateString('es-EC', { year: 'numeric', month: '2-digit', day: '2-digit' });

    let contador = 1;
    for (const prov of opcionSeleccionada.proveedoresInvolucrados) {
      const sigla = prov.razonSocial.toLowerCase().includes('adelca') 
        ? 'ADEL' 
        : prov.razonSocial.toLowerCase().includes('holcim') 
        ? 'HOLC' 
        : 'DISE';

      const numeroOC = `OC-2026-${sigla}-${String(contador).padStart(3, '0')}`;
      const subtotal = prov.subtotalMaterialesUSD;
      const flete = prov.costoFleteUSD;
      const iva15 = +((subtotal + flete) * 0.15).toFixed(2);
      const totalAPagar = +(subtotal + flete + iva15).toFixed(2);

      const itemsOC = prov.items.map(it => ({
        codigo: it.insumoCodigo,
        descripcion: it.descripcion,
        unidad: it.unidad,
        cantidad: it.cantidad,
        precioUnitario: it.precioUnitarioNeto,
        subtotal: it.subtotalUSD
      }));

      ordenes.push({
        id: `oc-${Date.now()}-${contador}`,
        numeroOC,
        requisicionId: req.id,
        proveedorId: prov.proveedorId,
        razonSocial: prov.razonSocial,
        ruc: prov.ruc,
        ciudadOrigen: prov.ciudadDespacho,
        obraDestino: req.proyectoNombre,
        fechaEmision: fechaActual,
        fechaEntregaEstimada: `${prov.tiempoEntregaHoras} horas hábiles`,
        condicionPago: 'Crédito Corporativo 30 días con 3-Way Match',
        subtotal,
        flete,
        iva15,
        totalAPagar,
        items: itemsOC,
        archivoPDFGenerado: `/documentos/ordenes_compra/${numeroOC}.pdf`,
        estado: 'EMITIDA_ENVIADA_PROVEEDOR',
        notificacionBodegaEnviada: true,
        notificacionContabilidadEnviada: true
      });

      contador++;
    }

    return ordenes;
  }
}
