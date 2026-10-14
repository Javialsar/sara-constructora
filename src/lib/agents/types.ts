/**
 * GRUPO SARA - RED DE AGENTES COREOGRAFIADOS (SARA-ECOSYSTEM)
 * Tipado de Eventos, Memoria Compartida, Conocimiento Evolutivo y Agentes Autónomos.
 */

export type SaraAgentId =
  | 'SARA-CONSTRUCTORA'
  | 'SARA-APU'
  | 'SARA-MARKETPLACE'
  | 'SARA-FLETES'
  | 'SARA-TALENTOHUMANO'
  | 'SARA-INMOBILIARIA'
  | 'SARA-ALOJAMIENTO'
  | 'SARA-PAGOS';

export type SaraEventType =
  | 'PROYECTO_CREADO'
  | 'APU_CONSOLIDADO'
  | 'SUMINISTROS_ASIGNADOS'
  | 'LOGISTICA_PROCESADA'
  | 'CONVOCATORIA_TALENTO_EMITIDA'
  | 'ANALISIS_INMOBILIARIO_COMPLETO'
  | 'ALOJAMIENTOS_LOGISTICOS_RESERVADOS'
  | 'ECOSISTEMA_FINANCIADO_Y_BLINDADO'
  | 'CICLO_APRENDIZAJE_FINALIZADO';

export interface SaraAgentEvent<T = any> {
  id: string;
  correlationId: string;
  proyectoId?: string;
  eventType: SaraEventType;
  originAgent: SaraAgentId;
  targetAgents: SaraAgentId[];
  payload: T;
  status: 'emitted' | 'processing' | 'completed' | 'failed';
  executionTimeMs?: number;
  createdAt: string;
  processedAt?: string;
}

export interface SharedMemoryEntry<T = any> {
  id?: string;
  correlationId: string;
  proyectoId?: string;
  namespace: string;
  memoryKey: string;
  memoryValue: T;
  confidenceScore: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EvolutionaryKnowledge {
  id?: string;
  domain: 'apu_yields' | 'freight_delays' | 'material_volatility' | 'talent_efficiency' | 'real_estate_absorption' | 'escrow_risk';
  entityKey: string;
  currentValue: Record<string, any>;
  sampleCount: number;
  confidenceLevel: number;
  lastEvolvedAt?: string;
  metadata?: Record<string, any>;
}

export interface EvolutionLog {
  id?: string;
  proyectoId?: string;
  correlationId?: string;
  agentId: SaraAgentId;
  metricName: string;
  previousValue: Record<string, any> | number | string;
  newValue: Record<string, any> | number | string;
  variancePercentage: number;
  rationale: string;
  appliedAt?: string;
}

// -------------------------------------------------------------
// PAYLOADS ESPECÍFICOS DE CADA EVENTO EN LA COREOGRAFÍA
// -------------------------------------------------------------

export interface ProyectoCreadoPayload {
  proyectoId: string;
  nombre: string;
  provincia: string;
  ciudad: string;
  tipologia: 'Residencial' | 'Vial' | 'Comercial' | 'Estructura Metálica';
  sistemaConstructivo: 'Hormigón Armado' | 'Estructura de Acero' | 'Mampostería Portante' | 'Mixto';
  areaM2: number;
  niveles: number;
  coordenadas: { lat: number; lng: number };
  presupuestoEstimadoReferencial: number;
  cliente: {
    nombre: string;
    contacto: string;
    email: string;
  };
}

export interface ApuConsolidadoPayload {
  proyectoId: string;
  costoDirectoTotal: number;
  costoIndirectoTotal: number;
  costoTotalObra: number;
  materialesRequeridos: Array<{
    codigo: string;
    nombre: string;
    unidad: string;
    cantidad: number;
    pesoEstimadoKg: number;
    volumenM3: number;
  }>;
  horasHombreDesglose: Array<{
    categoriaLaboral: 'Ingeniero Civil' | 'Arquitecto' | 'Maestro Mayor' | 'Topógrafo' | 'Albañil' | 'Fierrero' | 'Peón';
    horasRequeridas: number;
    cantidadTrabajadoresSugerida: number;
    rendimientoAjustadoProvincia: number;
  }>;
  desalojoCarga: {
    volumenTierraDesalojoM3: number;
    materialCargaTon: number;
  };
  factorRendimientoAplicado: number;
}

export interface SuministrosAsignadosPayload {
  proyectoId: string;
  proveedoresSeleccionados: Array<{
    proveedorId: string;
    nombre: string;
    ciudadOrigen: string;
    coordenadas: { lat: number; lng: number };
    materialesAsignados: string[];
    subtotalUSD: number;
    ahorroObtenidoUSD: number;
  }>;
  costoTotalSuministros: number;
  prediccionAlzaPrecios: {
    alertaCompraAnticipada: boolean;
    materialesEnRiesgo: string[];
    ahorroProyectadoUSD: number;
  };
}

export interface LogisticaProcesadaPayload {
  proyectoId: string;
  pesoTotalCargaTon: number;
  volumenTotalM3: number;
  despachosRequeridos: Array<{
    tipoVehiculo: 'Mula Plataforma' | 'Volqueta 14m3' | 'Camión Pesado 10T' | 'Cama Baja';
    cantidadViajes: number;
    ruta: {
      origen: string;
      destino: string;
      distanciaKm: number;
      tiempoEstimadoHoras: number;
      probabilidadRetrasoClima: number;
    };
    cooperativaAliada: string;
    tarifaTotalUSD: number;
  }>;
  costoLogisticoTotalUSD: number;
  alertasViales: string[];
}

export interface ConvocatoriaTalentoEmitidaPayload {
  proyectoId: string;
  vacantesPublicadas: number;
  perfilesContactadosWhatsApp: number;
  ternaCalificada: Array<{
    trabajadorId: string;
    nombre: string;
    rol: string;
    calificacionHistorica: number;
    distanciaObraKm: number;
    tarifaHoraUSD: number;
    certificaciones: string[];
    indiceAfinidadIA: number;
  }>;
  requiereAlojamientoTecnico: boolean;
  personalForaneoCount: number;
}

export interface AnalisisInmobiliarioCompletoPayload {
  proyectoId: string;
  tasacionTerrenoUSD: number;
  valorM2ZonaUSD: number;
  costoConstruccionM2USD: number;
  precioVentaSugeridoM2USD: number;
  margenUtilidadBrutaPct: number;
  margenNetoProyectadoUSD: number;
  roiProyectadoPct: number;
  velocidadAbsorcionMeses: number;
  viabilidadComercial: 'EXCELENTE' | 'ALTA' | 'MODERADA' | 'RIESGOSA';
}

export interface AlojamientosLogisticosReservadosPayload {
  proyectoId: string;
  habitacionesBloqueadas: number;
  ubicacionAlojamiento: string;
  propiedadNombre: string;
  tipoEstadia: 'Campamento Técnico Ejecutivos' | 'Vivienda Operativa' | 'Suite Airbnb Superhost';
  fechaIngreso: string;
  fechaSalida: string;
  tarifaNocheUSD: number;
  totalAlojamientoUSD: number;
  checkInAutonomoPIN: string;
  optimizacionTarifaDinamicaPct: number;
}

export interface EcosistemaFinanciadoPayload {
  proyectoId: string;
  montoTotalEscrowUSD: number;
  resumenCostos: {
    suministrosMarketplace: number;
    fletesLogistica: number;
    nominaManoObra: number;
    alojamientoEstancia: number;
    reservaContingencia: number;
  };
  cuentaCustodiaEscrow: string;
  codigoQREmpresarial: string;
  hitosLiberacionFondos: Array<{
    hito: string;
    porcentaje: number;
    montoUSD: number;
    condicionValidacion: string;
    estado: 'Retenido' | 'Liberado';
  }>;
  scoreRiesgoLiquidez: 'BAJO' | 'MODERADO' | 'CRITICO';
  estadoFinanciero: 'BLINDADO_Y_ACTIVO';
}

export interface CicloAprendizajePayload {
  proyectoId: string;
  fechaCierre: string;
  deltasDetectados: {
    desviacionPresupuestoPct: number;
    desviacionCronogramaDias: number;
    desviacionFletesPct: number;
  };
  aprendizajesConsolidados: Array<{
    agente: SaraAgentId;
    reglaActualizada: string;
    impactoFuturo: string;
  }>;
}
