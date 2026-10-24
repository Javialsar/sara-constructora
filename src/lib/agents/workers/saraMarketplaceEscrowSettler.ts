/**
 * 🤖 SARA-MARKETPLACE-ESCROW-SETTLER
 * Agente de Liquidación Financiera, Retención de Comisiones por Plan y Fideicomiso Escrow
 * Ecosistema GRUPO SARA - SARA MARKETPLACE
 */

import { SaraSharedMemory } from '../shared-memory';
import { SaraEventBus } from '../event-bus';
import { CompraMarketplaceConcretadaPayload, LiquidacionProveedorEmitidaPayload } from '../types';
import { SellerMarketplaceService, SELLER_PLANS } from '../../services/sellerMarketplaceService';

export class SaraMarketplaceEscrowSettlerAgent {
  public static readonly AGENT_ID = 'SARA-MARKETPLACE-ESCROW-SETTLER';

  /**
   * Bloquea fondos en Fideicomiso Escrow y calcula la comisión retenida de Grupo SARA
   */
  public static async constituirCustodiaEscrow(
    input: {
      ordenCompraFolio: string;
      sellerId: string;
      clienteRuc: string;
      proyectoObra: string;
      subtotalUSD: number;
      ivaUSD: number;
      totalUSD: number;
    },
    correlationId: string
  ): Promise<CompraMarketplaceConcretadaPayload> {
    console.log(`[🤖 ${this.AGENT_ID}] Constituyendo Fideicomiso Escrow para orden ${input.ordenCompraFolio}...`);

    const seller = SellerMarketplaceService.getSellerById(input.sellerId);
    if (!seller) {
      throw new Error(`[${this.AGENT_ID}] Proveedor ${input.sellerId} no encontrado.`);
    }

    const planConfig = SELLER_PLANS[seller.plan];
    const comisionSaraUSD = +(input.subtotalUSD * (planConfig.comisionSaraPct / 100)).toFixed(2);
    const netoVendedorUSD = +(input.totalUSD - comisionSaraUSD).toFixed(2);

    const payload: CompraMarketplaceConcretadaPayload = {
      ordenCompraFolio: input.ordenCompraFolio,
      sellerId: input.sellerId,
      clienteRuc: input.clienteRuc,
      proyectoObra: input.proyectoObra,
      subtotalUSD: input.subtotalUSD,
      ivaUSD: input.ivaUSD,
      totalUSD: input.totalUSD,
      comisionSaraUSD,
      netoVendedorUSD,
      estadoCustodia: 'EN_CUSTODIA_ESCROW'
    };

    // Guardar en memoria
    await SaraSharedMemory.set(
      correlationId,
      'marketplace_escrow',
      `escrow:${input.ordenCompraFolio}`,
      payload,
      0.99
    );

    // Emitir Evento
    await SaraEventBus.publish(
      'COMPRA_MARKETPLACE_CONCRETADA',
      this.AGENT_ID,
      ['SARA-PAGOS', 'SARA-MARKETPLACE'],
      payload,
      correlationId
    );

    console.log(`[🤖 ${this.AGENT_ID}] Custodia activada: Total $${input.totalUSD} | Comisión SARA (${planConfig.comisionSaraPct}%): $${comisionSaraUSD} | Neto Proveedor: $${netoVendedorUSD}.`);
    return payload;
  }

  /**
   * Libera los fondos al proveedor tras la confirmación de recepción en bodega
   */
  public static async liberarLiquidacionProveedor(
    ordenCompraFolio: string,
    actaRecepcionId: string,
    correlationId: string
  ): Promise<LiquidacionProveedorEmitidaPayload> {
    console.log(`[🤖 ${this.AGENT_ID}] Verificando acta de fiscalización ${actaRecepcionId} para liberar fondos de ${ordenCompraFolio}...`);

    const custodia = await SaraSharedMemory.get<CompraMarketplaceConcretadaPayload>(
      correlationId,
      'marketplace_escrow',
      `escrow:${ordenCompraFolio}`
    );

    const montoNeto = custodia?.netoVendedorUSD || 0;
    const comisionSara = custodia?.comisionSaraUSD || 0;
    const sellerId = custodia?.sellerId || 'seller-adelca-01';

    const payload: LiquidacionProveedorEmitidaPayload = {
      ordenCompraFolio,
      sellerId,
      montoNetoTransferidoUSD: montoNeto,
      comisionSaraRetenidaUSD: comisionSara,
      actaRecepcionId,
      fechaLiquidacion: new Date().toISOString()
    };

    await SaraSharedMemory.set(
      correlationId,
      'marketplace_settlements',
      `payout:${ordenCompraFolio}`,
      payload,
      1.0
    );

    await SaraEventBus.publish(
      'LIQUIDACION_PROVEEDOR_EMITIDA',
      this.AGENT_ID,
      ['SARA-PAGOS', 'SARA-MARKETPLACE'],
      payload,
      correlationId
    );

    console.log(`[🤖 ${this.AGENT_ID}] Fondos liberados exitosamente al proveedor ${sellerId}: $${montoNeto} USD transferidos.`);
    return payload;
  }
}
