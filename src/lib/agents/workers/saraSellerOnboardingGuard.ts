/**
 * 🤖 SARA-SELLER-ONBOARDING-GUARD
 * Agente Especializado de Compliance, Validación Tributaria SRI Módulo 11 y Onboarding de Proveedores
 * Ecosistema GRUPO SARA - SARA MARKETPLACE
 */

import { SaraSharedMemory } from '../shared-memory';
import { SaraEventBus } from '../event-bus';
import { SellerEmpresaRegistradaPayload } from '../types';
import { ComprasService } from '../../services/comprasService';
import { SellerMarketplaceService, SELLER_PLANS, SellerPlanType } from '../../services/sellerMarketplaceService';

export class SaraSellerOnboardingGuardAgent {
  public static readonly AGENT_ID = 'SARA-SELLER-ONBOARDING-GUARD';

  /**
   * Procesa el onboarding y verificación integral de una nueva empresa proveedora
   */
  public static async auditarYRegistrarEmpresa(
    input: {
      ruc: string;
      razonSocial: string;
      nombreComercial: string;
      email: string;
      telefono: string;
      ciudad: string;
      direccionMatriz: string;
      plan: SellerPlanType;
    },
    correlationId: string
  ): Promise<SellerEmpresaRegistradaPayload> {
    console.log(`[🤖 ${this.AGENT_ID}] Iniciando auditoría tributaria para ${input.nombreComercial} (RUC: ${input.ruc})...`);

    // 1. Auditoría de RUC Módulo 11 oficial del SRI
    const rucValidation = ComprasService.validarRucEcuador(input.ruc);
    if (!rucValidation.valido) {
      throw new Error(`[${this.AGENT_ID}] Rechazo de Compliance: ${rucValidation.error}`);
    }

    // 2. Registro y creación en el servicio
    const seller = SellerMarketplaceService.registerSeller(input);
    const planConfig = SELLER_PLANS[input.plan];

    const payload: SellerEmpresaRegistradaPayload = {
      sellerId: seller.id,
      ruc: seller.ruc,
      razonSocial: seller.razonSocial,
      nombreComercial: seller.nombreComercial,
      plan: seller.plan,
      comisionSaraPct: planConfig.comisionSaraPct,
      apiKey: seller.apiKey,
      verificadoSri: true
    };

    // 3. Persistir en Memoria Compartida
    await SaraSharedMemory.set(
      correlationId,
      'marketplace_sellers',
      `onboarding:${seller.id}`,
      payload,
      0.99
    );

    // 4. Emitir Evento en el Bus Reactivo
    await SaraEventBus.publish(
      'SELLER_EMPRESA_REGISTRADA',
      this.AGENT_ID,
      ['SARA-MARKETPLACE', 'SARA-PAGOS'],
      payload,
      correlationId
    );

    console.log(`[🤖 ${this.AGENT_ID}] Empresa ${seller.nombreComercial} auditada con éxito bajo ${planConfig.nombre} (${planConfig.comisionSaraPct}% comisión).`);
    return payload;
  }
}
