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
    const costoSuministros = suministros?.costoTotalSuministros ?? 28500;
    const costoLogistica = logistica?.costoLogisticoTotalUSD ?? 1850;
    const costoNomina = apu?.costoDirectoTotal ? Math.round(apu.costoDirectoTotal * 0.38) : 12400;
    const costoAlojamiento = alojamiento ? alojamiento.totalAlojamientoUSD : 770;
    const reservaContingencia = Math.round((costoSuministros + costoLogistica + costoNomina) * 0.05); // 5% colchón de contingencia

    const montoTotalEscrowUSD = costoSuministros + costoLogistica + costoNomina + costoAlojamiento + reservaContingencia;

    // APRENDIZAJE EVOLUTIVO: Consultar reglas de custodia y mitigación de liquidez
    const escrowRules = await SaraSharedMemory.getKnowledge('escrow_risk', 'umbrales_liberacion_fondos');
    const maxAnticipo = Math.min(50, Math.max(10, Number(escrowRules?.currentValue?.max_anticipo_pct || 30.0)));

    // Reescalado proporcional de Hitos 2, 3 y 4 (pesos base 35/70, 20/70, 15/70) para garantizar suma exacta = 100%
    const restantePct = +(100 - maxAnticipo).toFixed(2);
    const pctHito1 = +maxAnticipo.toFixed(2);
    const pctHito2 = +(restantePct * (35 / 70)).toFixed(2);
    const pctHito3 = +(restantePct * (20 / 70)).toFixed(2);
    const pctHito4 = +(100 - pctHito1 - pctHito2 - pctHito3).toFixed(2);

    const montoHito1 = Math.round(montoTotalEscrowUSD * (pctHito1 / 100));
    const montoHito2 = Math.round(montoTotalEscrowUSD * (pctHito2 / 100));
    const montoHito3 = Math.round(montoTotalEscrowUSD * (pctHito3 / 100));
    const montoHito4 = montoTotalEscrowUSD - montoHito1 - montoHito2 - montoHito3;

    // Hitos contractuales de liberación contra acta de fiscalización
    const hitosLiberacionFondos: EcosistemaFinanciadoPayload['hitosLiberacionFondos'] = [
      {
        hito: 'Hito 1: Anticipo de Arranque & Movilización de Maquinaria',
        porcentaje: pctHito1,
        montoUSD: montoHito1,
        condicionValidacion: 'Firma de Contrato Notariado y Verificación Topográfica Satelital',
        estado: 'Liberado'
      },
      {
        hito: 'Hito 2: Cimentación & Estructura Portante (Hormigonado)',
        porcentaje: pctHito2,
        montoUSD: montoHito2,
        condicionValidacion: 'Validación Fotográfica Fiscaliza + Resistencia a la Compresión Laboratorio (f’c 210 kg/cm2)',
        estado: 'Retenido'
      },
      {
        hito: 'Hito 3: Mampostería, Cubierta e Instalaciones Hidrosanitarias',
        porcentaje: pctHito3,
        montoUSD: montoHito3,
        condicionValidacion: 'Prueba Hidrostática de Tuberías y Avance Físico del 70% en App SARA',
        estado: 'Retenido'
      },
      {
        hito: 'Hito 4: Acabados, Pintura y Entrega Llave en Mano',
        porcentaje: pctHito4,
        montoUSD: montoHito4,
        condicionValidacion: 'Acta Entrega-Recepción Definitiva Aprobada por Cliente y Fiscalizador Colegiado',
        estado: 'Retenido'
      }
    ];

    const sumaPorcentajesHitosPct = +(pctHito1 + pctHito2 + pctHito3 + pctHito4).toFixed(2);
    const umbralResuUSD = 10000;
    const requiereReporteResuUafe = montoTotalEscrowUSD >= umbralResuUSD;

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
      estadoFinanciero: 'BLINDADO_Y_ACTIVO',
      cumplimientoUafeSri: {
        requiereReporteResuUafe,
        umbralResuUSD,
        estadoDiligenciaUafe: requiereReporteResuUafe
          ? 'DEBIDA_DILIGENCIA_AMPLIADA_RESU_ACTIVA'
          : 'DEBIDA_DILIGENCIA_SIMPLIFICADA',
        sumaPorcentajesHitosPct
      }
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
