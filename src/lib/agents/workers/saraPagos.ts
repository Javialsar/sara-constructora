import { SaraSharedMemory } from '../shared-memory';
import { SaraEventBus } from '../event-bus';
import { 
  EcosistemaFinanciadoPayload, 
  SuministrosAsignadosPayload, 
  LogisticaProcesadaPayload, 
  ApuConsolidadoPayload, 
  AlojamientosLogisticosReservadosPayload, 
  ProyectoCreadoPayload 
} from '../types';

export class SaraPagosAgent {
  static readonly AGENT_ID = 'SARA-PAGOS';

  /**
   * Consolida el financiamiento integral del proyecto, estructura el fideicomiso Escrow y blindaje
   */
  static async blindarFinanciamientoEscrow(
    correlationId: string
  ): Promise<EcosistemaFinanciadoPayload> {
    // 1. Recuperar datos de todos los agentes desde la memoria colectiva
    const proyecto = await SaraSharedMemory.get<ProyectoCreadoPayload>(correlationId, 'constructora', 'proyecto_raiz');
    const apu = await SaraSharedMemory.get<ApuConsolidadoPayload>(correlationId, 'apu', 'computo_metricas');
    const suministros = await SaraSharedMemory.get<SuministrosAsignadosPayload>(correlationId, 'marketplace', 'suministros_optimizados');
    const logistica = await SaraSharedMemory.get<LogisticaProcesadaPayload>(correlationId, 'fletes', 'logistica_despachos');
    const alojamiento = await SaraSharedMemory.get<AlojamientosLogisticosReservadosPayload>(correlationId, 'alojamiento', 'reserva_logistica');

    // Desglose de costos consolidados
    const costoSuministros = suministros?.costoTotalSuministros || 28500;
    const costoLogistica = logistica?.costoLogisticoTotalUSD || 1850;
    const costoNomina = apu?.costoDirectoTotal ? Math.round(apu.costoDirectoTotal * 0.38) : 12400;
    const costoAlojamiento = alojamiento?.totalAlojamientoUSD || 770;
    const reservaContingencia = Math.round((costoSuministros + costoLogistica + costoNomina) * 0.05); // 5% colchón de contingencia

    const montoTotalEscrowUSD = costoSuministros + costoLogistica + costoNomina + costoAlojamiento + reservaContingencia;

    // APRENDIZAJE EVOLUTIVO: Consultar reglas de custodia y mitigación de liquidez
    const escrowRules = await SaraSharedMemory.getKnowledge('escrow_risk', 'umbrales_liberacion_fondos');
    const maxAnticipo = escrowRules?.currentValue?.max_anticipo_pct || 30.0;

    // Hitos contractuales de liberación contra acta de fiscalización
    const hitosLiberacionFondos: EcosistemaFinanciadoPayload['hitosLiberacionFondos'] = [
      {
        hito: 'Hito 1: Anticipo de Arranque & Movilización de Maquinaria',
        porcentaje: maxAnticipo,
        montoUSD: Math.round(montoTotalEscrowUSD * (maxAnticipo / 100)),
        condicionValidacion: 'Firma de Contrato Notariado y Verificación Topográfica Satelital',
        estado: 'Liberado'
      },
      {
        hito: 'Hito 2: Cimentación & Estructura Portante (Hormigonado)',
        porcentaje: 35,
        montoUSD: Math.round(montoTotalEscrowUSD * 0.35),
        condicionValidacion: 'Validación Fotográfica Fiscaliza + Resistencia a la Compresión Laboratorio (f’c 210 kg/cm2)',
        estado: 'Retenido'
      },
      {
        hito: 'Hito 3: Mampostería, Cubierta e Instalaciones Hidrosanitarias',
        porcentaje: 20,
        montoUSD: Math.round(montoTotalEscrowUSD * 0.20),
        condicionValidacion: 'Prueba Hidrostática de Tuberías y Avance Físico del 70% en App SARA',
        estado: 'Retenido'
      },
      {
        hito: 'Hito 4: Acabados, Pintura y Entrega Llave en Mano',
        porcentaje: 15,
        montoUSD: Math.round(montoTotalEscrowUSD * 0.15),
        condicionValidacion: 'Acta Entrega-Recepción Definitiva Aprobada por Cliente y Fiscalizador Colegiado',
        estado: 'Retenido'
      }
    ];

    const cuentaCustodia = `ESCROW-SARA-EC-${Math.floor(100000 + Math.random() * 900000)}-BP`;
    const qrData = `pichincha://deuna/pay?merchant=GRUPOSARA_ESCROW&acc=${cuentaCustodia}&amount=${montoTotalEscrowUSD}&ref=${proyecto?.proyectoId || 'proy'}`;

    const payload: EcosistemaFinanciadoPayload = {
      proyectoId: proyecto?.proyectoId || 'proy_default',
      montoTotalEscrowUSD,
      resumenCostos: {
        suministrosMarketplace: costoSuministros,
        fletesLogistica: costoLogistica,
        nominaManoObra: costoNomina,
        alojamientoEstancia: costoAlojamiento,
        reservaContingencia
      },
      cuentaCustodiaEscrow: cuentaCustodia,
      codigoQREmpresarial: qrData,
      hitosLiberacionFondos,
      scoreRiesgoLiquidez: 'BAJO',
      estadoFinanciero: 'BLINDADO_Y_ACTIVO'
    };

    // 1. Guardar en Memoria Colectiva
    await SaraSharedMemory.set(
      correlationId,
      'pagos',
      'custodia_escrow',
      payload,
      0.99,
      ['pagos', 'escrow', 'blindaje_financiero'],
      proyecto?.proyectoId
    );

    // 2. Disparar Evento Global de Cierre de Coreografía
    await SaraEventBus.publish<EcosistemaFinanciadoPayload>(
      'ECOSISTEMA_FINANCIADO_Y_BLINDADO',
      this.AGENT_ID,
      ['SARA-CONSTRUCTORA', 'SARA-APU'],
      payload,
      correlationId,
      proyecto?.proyectoId
    );

    return payload;
  }
}
