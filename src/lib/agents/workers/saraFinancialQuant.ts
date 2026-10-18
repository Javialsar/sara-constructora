import { SaraEventBus } from '../event-bus';
import { SaraSharedMemory } from '../shared-memory';
import { SriFacturaParsed, SriXmlService } from '../../services/sriXmlService';
import { ThreeWayMatchService, PurchaseOrder, ThreeWayMatchResult } from '../../services/threeWayMatchService';
import { IessPayrollService, DailyTareoInput, PayrollBatchResult } from '../../services/iessPayrollService';

/**
 * 🤖 SARA_FINANCIAL_QUANT_AGENT
 * Especialista Contable, Fiscal y de Nómina de Élite.
 * Auditor Tributario (SRI/IESS), 3-Way Match, Retenciones de Ley y Contabilidad de Costos.
 */
export class SaraFinancialQuantAgent {
  public static readonly agentId = 'SARA_FINANCIAL_QUANT_AGENT';

  /**
   * Procesa la conciliación Three-Way Match entre la Factura del SRI y la Orden de Compra
   */
  public static async auditarFacturaSri(
    xmlContent: string,
    ordenCompra: PurchaseOrder,
    correlationId: string
  ): Promise<ThreeWayMatchResult> {
    const startTime = Date.now();
    console.log(`[🤖 ${this.agentId}] Iniciando auditoría tributaria SRI y Three-Way Match...`);

    // 1. Parsing y validación de firma
    const facturaParsed = SriXmlService.parseFacturaXml(xmlContent);

    // 2. Ejecutar conciliación con tolerancia del 1%
    const matchResult = ThreeWayMatchService.executeMatch(facturaParsed, ordenCompra);

    // 3. Guardar en memoria compartida
    await SaraSharedMemory.set(
      correlationId,
      'finance',
      `three_way_match:${facturaParsed.claveAcceso}`,
      {
        matchResult,
        facturaNumero: facturaParsed.numeroComprobante,
        fechaAuditoria: new Date().toISOString(),
      },
      matchResult.status === 'MATCHED_SUCCESS' ? 0.99 : 0.65
    );

    // 4. Emitir eventos correspondientes
    if (matchResult.status === 'MATCHED_SUCCESS') {
      await SaraEventBus.publish(
        'ECOSISTEMA_FINANCIADO_Y_BLINDADO',
        'SARA-PAGOS',
        ['SARA-CONSTRUCTORA'],
        {
          tipo: 'THREE_WAY_MATCH_APROBADO',
          facturaNumero: facturaParsed.numeroComprobante,
          retencionEmitida: matchResult.retencionPropuesta,
          asientoContable: matchResult.asientoPropuesto,
        },
        correlationId
      );
    }

    return matchResult;
  }

  /**
   * Liquida el tareo de cuadrilla y calcula aportes IESS sectoriales de construcción
   */
  public static async liquidarTareoNomina(
    tareos: DailyTareoInput[],
    periodo: { mes: number; anio: number },
    correlationId: string
  ): Promise<PayrollBatchResult> {
    const startTime = Date.now();
    console.log(`[🤖 ${this.agentId}] Liquidando tareo IESS para ${tareos.length} operarios...`);

    const result = IessPayrollService.calculatePayroll(tareos, periodo);

    await SaraSharedMemory.set(
      correlationId,
      'finance',
      `payroll_settlement:${periodo.anio}_${periodo.mes}`,
      result,
      0.98
    );

    return result;
  }
}
