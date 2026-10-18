/**
 * SERVICIO DE KARDEX MULTIBODEGA, TRANSFERENCIAS TRANSACCIONALES Y MODELADO MATEMÁTICO
 * Gestiona Bodega Central (Matriz) y Sub-bodegas de Obras, Vales de Distribución y Trazabilidad Inversa.
 */

export interface BodegaStock {
  bodegaId: string;
  bodegaCodigo: string;
  bodegaNombre: string;
  tipo: 'matriz' | 'obra_subbodega' | 'transito';
  proyectoId?: string;
  insumoId: string;
  insumoNombre: string;
  insumoCodigo: string;
  unidad: string;
  saldoCantidad: number;
  costoPromedioPonderado: number;
  costoTotal: number;
  stockSeguridadDinamico: number;
  puntoReorden: number;
  loteEconomicoEoq: number;
}

export interface DistributionSlipInput {
  bodegaOrigenId: string;
  bodegaDestinoId: string;
  insumoId: string;
  cantidad: number;
  referenciaFacturaSriId?: string;
  referenciaOrdenCompraId?: string;
  solicitadoPor: string;
  motivoDespacho: string;
  proyectoDestinoId: string;
}

export interface DistributionSlipResult {
  valeDistribucionId: string;
  fecha: string;
  insumoId: string;
  cantidadTransferida: number;
  costoUnitarioAplicado: number; // CPP de la bodega matriz
  costoTotalTransferido: number;
  bodegaOrigen: { id: string; saldoAnterior: number; saldoNuevo: number };
  bodegaDestino: { id: string; saldoAnterior: number; saldoNuevo: number };
  trazabilidadInversa: {
    facturaSriId?: string;
    ordenCompraId?: string;
    cadenaCustodiaHash: string;
  };
  asientoGeneradoId?: string;
}

export interface WasteRecordInput {
  bodegaId: string;
  insumoId: string;
  categoriaMaterial: 'CEMENTO' | 'ACERO_CORRUGADO' | 'BLOQUES_LADRILLOS' | 'ARIDOS' | 'TUBERIA_PVC';
  cantidadConsumidaTotal: number;
  cantidadMermaRegistrada: number;
  motivoMerma: string;
  inspectorId: string;
}

export interface WasteAnalysisResult {
  porcentajeMermaReal: number;
  umbralToleranciaMaximo: number;
  dentroDeTolerancia: boolean;
  costoPerdidaUSD: number;
  alertaEmitida?: string;
}

export class KardexMultibodegaService {
  // Umbrales de merma técnica aceptable según la Cámara de la Construcción y normativas NEC
  public static readonly TOLERANCIAS_MERMA_PCT: Record<string, number> = {
    'CEMENTO': 4.0, // 3% a 5% por fraguado, rotura de sacos o humedad
    'ACERO_CORRUGADO': 6.0, // 4% a 7% por despuntes de doblado y cortes estructurales
    'BLOQUES_LADRILLOS': 4.5, // 3% a 5% por rotura en descargue y ajuste perimetral
    'ARIDOS': 5.0, // 5% por dispersión y viento
    'TUBERIA_PVC': 3.5, // 3% por empalmes y sobras
  };

  /**
   * Modela el Lote Económico de Pedido (EOQ - Economic Order Quantity)
   * Formula: EOQ = sqrt( (2 * D * S) / H )
   * D: Demanda anual o del proyecto en unidades
   * S: Costo administrativo y de flete por emitir cada orden de compra
   * H: Costo de almacenamiento y custodia por unidad/año
   */
  public static calculateEoq(demandaD: number, costoEmisionOrdenS: number, costoAlmacenamientoH: number): number {
    if (costoAlmacenamientoH <= 0 || demandaD <= 0 || costoEmisionOrdenS <= 0) return 0;
    const eoq = Math.sqrt((2 * demandaD * costoEmisionOrdenS) / costoAlmacenamientoH);
    return +eoq.toFixed(2);
  }

  /**
   * Modela el Punto de Reorden (ROP - Reorder Point) con Stock de Seguridad
   * Formula: ROP = (ConsumoPromedioDiario * LeadTimeDias) + StockSeguridad
   */
  public static calculateRop(
    consumoPromedioDiario: number,
    leadTimeDiasProveedor: number,
    stockSeguridad: number
  ): number {
    const rop = (consumoPromedioDiario * leadTimeDiasProveedor) + stockSeguridad;
    return +rop.toFixed(2);
  }

  /**
   * Calcula el Stock de Seguridad Dinámico acoplado al Diagrama de Gantt de la Obra
   * Si la fecha actual está a menos de 10 días de un hito crítico (Vaciado de losa, hormigonado),
   * el stock de seguridad se amplía en un factor multiplicador de contingencia (1.5x a 2.0x).
   */
  public static calculateDynamicSafetyStock(
    stockSeguridadBase: number,
    diasParaHitoCriticoGantt: number,
    esFaseCriticaVaciado: boolean
  ): { stockSeguridadAjustado: number; factorAplicado: number; justificacion: string } {
    let factor = 1.0;
    let justificacion = 'Operación normal de obra. Stock de seguridad base.';

    if (esFaseCriticaVaciado && diasParaHitoCriticoGantt <= 5) {
      factor = 2.0;
      justificacion = 'ALERTA GANTT: A 5 días o menos de vaciado masivo de losa. Stock de seguridad duplicado para blindar abastecimiento.';
    } else if (esFaseCriticaVaciado && diasParaHitoCriticoGantt <= 12) {
      factor = 1.5;
      justificacion = 'PRECAUCIÓN GANTT: Próxima fase de hormigonado estructural. Amortiguador de inventario incrementado en 50%.';
    }

    return {
      stockSeguridadAjustado: +(stockSeguridadBase * factor).toFixed(2),
      factorAplicado: factor,
      justificacion,
    };
  }

  /**
   * Valida y audita el porcentaje de merma técnica de obra
   */
  public static auditWaste(input: WasteRecordInput, costoUnitarioMaterial: number): WasteAnalysisResult {
    if (input.cantidadConsumidaTotal <= 0) {
      return {
        porcentajeMermaReal: 0,
        umbralToleranciaMaximo: this.TOLERANCIAS_MERMA_PCT[input.categoriaMaterial] || 5.0,
        dentroDeTolerancia: true,
        costoPerdidaUSD: 0,
      };
    }

    const pctReal = +( (input.cantidadMermaRegistrada / input.cantidadConsumidaTotal) * 100 ).toFixed(2);
    const umbral = this.TOLERANCIAS_MERMA_PCT[input.categoriaMaterial] || 5.0;
    const dentroDeTolerancia = pctReal <= umbral;
    const costoPerdida = +(input.cantidadMermaRegistrada * costoUnitarioMaterial).toFixed(2);

    let alertaEmitida: string | undefined;
    if (!dentroDeTolerancia) {
      alertaEmitida = `ALERTA DE DESVÍO DE INVENTARIO: La merma de ${input.categoriaMaterial} (${pctReal}%) superó el umbral reglamentario (${umbral}%). Pérdida no justificada: $${costoPerdida} USD. Se requiere auditoría de fiscalización en bodega.`;
    }

    return {
      porcentajeMermaReal: pctReal,
      umbralToleranciaMaximo: umbral,
      dentroDeTolerancia,
      costoPerdidaUSD: costoPerdida,
      alertaEmitida,
    };
  }
}
