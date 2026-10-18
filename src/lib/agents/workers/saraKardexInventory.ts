import { SaraEventBus } from '../event-bus';
import { SaraSharedMemory } from '../shared-memory';
import { KardexMultibodegaService, DistributionSlipInput, DistributionSlipResult, WasteRecordInput } from '../../services/kardexMultibodegaService';
import { KardexRepository } from '../../repositories/saraAdvancedRepositories';

/**
 * 🤖 SARA_KARDEX_INVENTORY_AGENT
 * Controlador de Volúmenes e Inventario Predictivo.
 * Ingeniero de Logística, Modelado Matemático de Almacenes (EOQ, ROP, Mermas Técnicas).
 */
export class SaraKardexInventoryAgent {
  public static readonly agentId = 'SARA_KARDEX_INVENTORY_AGENT';

  /**
   * Procesa la transferencia segura de materiales mediante Vale de Distribución
   */
  public static async transferirMaterialObra(
    input: DistributionSlipInput,
    correlationId: string
  ): Promise<DistributionSlipResult> {
    const startTime = Date.now();
    console.log(`[🤖 ${this.agentId}] Despachando material de Bodega Matriz hacia obra...`);

    const result = await KardexRepository.transferirStock(input);

    await SaraSharedMemory.set(
      correlationId,
      'kardex',
      `distribucion:${result.valeDistribucionId}`,
      result,
      0.99
    );

    return result;
  }

  /**
   * Audita mermas de obra y alerta en caso de fuga o desvío de insumos
   */
  public static async auditarMerma(
    input: WasteRecordInput,
    costoUnitario: number,
    correlationId: string
  ) {
    const analysis = KardexMultibodegaService.auditWaste(input, costoUnitario);

    await SaraSharedMemory.set(
      correlationId,
      'kardex',
      `waste_audit:${input.bodegaId}:${input.insumoId}`,
      analysis,
      analysis.dentroDeTolerancia ? 0.95 : 0.40
    );

    return analysis;
  }
}
