/**
 * 🤖 SARA-CATALOG-INGESTION-ENGINE
 * Motor Agéntico de Ingesta Masiva, Normalización Técnica INEN y Clasificación Tributaria de Catálogos
 * Ecosistema GRUPO SARA - SARA MARKETPLACE
 */

import { SaraSharedMemory } from '../shared-memory';
import { SaraEventBus } from '../event-bus';
import { CatalogoMasivoIngestadoPayload } from '../types';
import { SellerMarketplaceService } from '../../services/sellerMarketplaceService';

export class SaraCatalogIngestionEngineAgent {
  public static readonly AGENT_ID = 'SARA-CATALOG-INGESTION-ENGINE';

  /**
   * Procesa la ingesta masiva de catálogo desde archivo Excel o API REST
   */
  public static async procesarIngestaCatalogo(
    sellerId: string,
    items: any[],
    origen: 'EXCEL_XLSX' | 'API_REST_ERP' | 'MANUAL',
    correlationId: string
  ): Promise<CatalogoMasivoIngestadoPayload> {
    console.log(`[🤖 ${this.AGENT_ID}] Procesando lote de ${items.length} materiales vía ${origen} para proveedor ${sellerId}...`);

    // Ingesta y normalización técnica a través del servicio
    const resultado = SellerMarketplaceService.importProductsFromExcel(sellerId, items);

    const payload: CatalogoMasivoIngestadoPayload = {
      sellerId,
      origen,
      totalProcesados: resultado.exitosos,
      skusValidados: items.map((it, idx) => it.sku || `SKU-AUTO-${idx + 1}`),
      erroresDetectados: resultado.errores
    };

    // Persistir en Memoria Compartida
    await SaraSharedMemory.set(
      correlationId,
      'marketplace_catalog',
      `batch_ingest:${sellerId}:${Date.now()}`,
      payload,
      resultado.errores.length === 0 ? 0.98 : 0.85
    );

    // Emitir Evento en el Bus
    await SaraEventBus.publish(
      'CATALOGO_MASIVO_INGESTADO',
      this.AGENT_ID,
      ['SARA-MARKETPLACE', 'SARA-APU'],
      payload,
      correlationId
    );

    console.log(`[🤖 ${this.AGENT_ID}] Lote completado: ${resultado.exitosos} SKUs normalizados y publicados en vitrina.`);
    return payload;
  }
}
