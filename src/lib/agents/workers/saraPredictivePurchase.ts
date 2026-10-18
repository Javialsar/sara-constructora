import { SaraEventBus } from '../event-bus';
import { SaraSharedMemory } from '../shared-memory';
import { 
  PredictivePurchaseService, 
  LandedCostQuote, 
  MultiProjectConsolidationInput, 
  MultiProjectConsolidationResult,
  BimMaterialTakeoffRow,
  MaterialExplosionResult,
  SupplierCatalogItem
} from '../../services/predictivePurchaseService';

/**
 * 🤖 SARA_PREDICTIVE_PURCHASE_AGENT
 * Procurador Predictivo y Ruteo Georreferenciado.
 * Optimiza fletes y compras en 24 provincias de Ecuador, escalas por volumen y explosión BIM.
 */
export class SaraPredictivePurchaseAgent {
  public static readonly agentId = 'SARA_PREDICTIVE_PURCHASE_AGENT';

  /**
   * Ejecuta la explosión de materiales a partir de la cubicación BIM
   */
  public static procesarExplosionBim(
    takeoff: BimMaterialTakeoffRow[],
    correlationId: string
  ): MaterialExplosionResult {
    console.log(`[🤖 ${this.agentId}] Procesando explosión de materiales BIM para ${takeoff.length} elementos...`);
    const explosion = PredictivePurchaseService.explodeBimTakeoff(takeoff);

    SaraSharedMemory.set(
      correlationId,
      'procurement',
      'bim_material_takeoff_explosion',
      explosion,
      0.97
    );

    return explosion;
  }

  /**
   * Cotiza con proveedores georreferenciados calculando el Landed Cost (Material + Flete)
   */
  public static cotizarLandedCostLocalizado(
    destino: { canton: string; provincia: string; lat?: number; lng?: number },
    insumoCodigo: string,
    cantidad: number,
    pesoToneladas: number,
    catalogo: SupplierCatalogItem[],
    correlationId: string
  ): LandedCostQuote[] {
    console.log(`[🤖 ${this.agentId}] Cotizando insumo ${insumoCodigo} para destino: ${destino.canton}, ${destino.provincia}...`);
    const quotes = PredictivePurchaseService.quoteBestSupplier(destino, insumoCodigo, cantidad, pesoToneladas, catalogo);

    SaraSharedMemory.set(
      correlationId,
      'procurement',
      `landed_quote:${insumoCodigo}:${destino.canton}`,
      quotes,
      0.96
    );

    return quotes;
  }

  /**
   * Consolida compras para múltiples proyectos obteniendo descuentos por volumen
   */
  public static consolidarCompras(
    input: MultiProjectConsolidationInput,
    escalas: Array<{ minCantidad: number; maxCantidad?: number; descuentoPct: number; precioBase: number }>,
    correlationId: string
  ): MultiProjectConsolidationResult {
    console.log(`[🤖 ${this.agentId}] Consolidando pedidos de ${input.pedidosPorProyecto.length} proyectos para el insumo ${input.insumoCodigo}...`);
    const result = PredictivePurchaseService.consolidateMultiProjectOrders(input, escalas);

    SaraSharedMemory.set(
      correlationId,
      'procurement',
      `consolidation:${input.insumoCodigo}`,
      result,
      0.98
    );

    return result;
  }
}
