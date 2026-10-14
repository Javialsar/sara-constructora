/**
 * GRUPO SARA - RED DE AGENTES ASESORES INTERACTIVOS Y CO-PILOTOS
 * Tipos de datos para Diálogo con el Técnico, Persistencia en sara_ai_advisory_logs
 * y Generación de Exportables (Cuadro Comparativo y Reporte Consolidado).
 */

export type SaraAdvisorAgentId =
  | 'SARA-APU + SARA-MARKETPLACE'
  | 'SARA-FLETES'
  | 'SARA-INMOBILIARIA + SARA-ALOJAMIENTO'
  | 'SARA-CONSTRUCTORA'
  | 'SARA-PAGOS'
  | 'SARA-TALENTOHUMANO';

export type SaraAdvisoryTipo =
  | 'compras_suministros'
  | 'coordinacion_carga'
  | 'rentabilidad_campamentos'
  | 'planificacion_obra'
  | 'riesgo_financiero';

export type SaraDecisionTecnico = 'pendiente' | 'aceptada' | 'rechazada';

export type SaraDocumentoTipo =
  | 'cuadro_comparativo_proveedores'
  | 'reporte_consolidado_insumos_logistica'
  | 'otro';

export interface SaraAdvisoryLog {
  id: string;
  proyecto_id?: string | null;
  correlation_id?: string | null;
  agent_id: string;
  tipo_asesoria: SaraAdvisoryTipo | string;
  mensaje_sugerencia: string;
  datos_contexto: Record<string, any>;
  decision_tecnico: SaraDecisionTecnico;
  ahorro_estimado_usd: number;
  documento_generado_tipo?: SaraDocumentoTipo | null;
  documento_url_o_datos?: Record<string, any> | null;
  created_at: string;
  decided_at?: string | null;
}

export interface SupplierComparisonItem {
  id: string;
  insumo: string;
  proveedor: string;
  ciudadOrigen: string;
  precioUnitario: number;
  unidad: string;
  fleteIncluido: boolean;
  costoFleteUnitario?: number;
  diasCredito: number;
  tiempoEntregaDias: number;
  puntuacionConfianzaIA: number; // Ej: 96 (porcentaje)
  recomendado: boolean;
  motivoRecomendacion: string;
}

export interface ConsolidatedLogisticsItem {
  id: string;
  material: string;
  cantidad: number;
  unidad: string;
  pesoTotalKg: number;
  volumenM3: number;
  ubicacionDespacho: string;
  proveedorAsignado: string;
  tipoTransporteSugerido: string; // 'Plataforma Rígida', 'Volqueta 14m3', etc.
  cooperativaAliada: string;
  costoBaseUSD: number;
  costoOptimizadoUSD: number;
  ahorroEstimadoUSD: number;
  seguroCargaIncluido: boolean;
}

export interface CuadroComparativoDocumentData {
  titulo: string;
  proyectoNombre: string;
  ubicacion: string;
  fechaEmision: string;
  codigoDocumento: string;
  tecnicoResponsable: string;
  directorObra: string;
  items: SupplierComparisonItem[];
  resumenFinanciero: {
    totalOpcionesAnalizadas: number;
    proveedoresAdjudicados: string[];
    ahorroTotalProyectadoUSD: number;
    optimizacionFlujoCajaPct: number;
    diasCreditoPromedio: number;
  };
  dictamenIA: string;
}

export interface ReporteConsolidadoDocumentData {
  titulo: string;
  proyectoNombre: string;
  codigoDocumento: string;
  fechaEmision: string;
  directorObra: string;
  fiscalizadorColegiado: string;
  ubicacionObra: string;
  volumenDesalojoTotalM3: number;
  pesoTotalCargaTon: number;
  materiales: ConsolidatedLogisticsItem[];
  cooperativasAsignadas: Array<{
    nombre: string;
    ruta: string;
    viajes: number;
    tipoUnidad: string;
    seguroCarga: boolean;
  }>;
  balanceFinanciero: {
    costoLogisticoTradicionalUSD: number;
    costoLogisticoOptimizadoUSD: number;
    ahorroNetoLogisticaUSD: number;
    porcentajeAhorroGlobal: number;
  };
  declaracionResponsabilidad: string;
}
