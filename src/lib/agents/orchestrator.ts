import { SaraEventBus } from './event-bus';
import { SaraSharedMemory } from './shared-memory';
import { SaraConstructoraAgent } from './workers/saraConstructora';
import { SaraApuAgent } from './workers/saraApu';
import { SaraMarketplaceAgent } from './workers/saraMarketplace';
import { SaraFletesAgent } from './workers/saraFletes';
import { SaraTalentoHumanoAgent } from './workers/saraTalentoHumano';
import { SaraInmobiliariaAgent } from './workers/saraInmobiliaria';
import { SaraAlojamientoAgent } from './workers/saraAlojamiento';
import { SaraPagosAgent } from './workers/saraPagos';
import { SaraLearningEngine, ProyectoFinalizadoReport } from './learning-engine';
import { 
  ProyectoCreadoPayload, 
  ApuConsolidadoPayload, 
  SuministrosAsignadosPayload, 
  LogisticaProcesadaPayload, 
  ConvocatoriaTalentoEmitidaPayload, 
  AnalisisInmobiliarioCompletoPayload, 
  AlojamientosLogisticosReservadosPayload, 
  EcosistemaFinanciadoPayload,
  SaraAgentEvent 
} from './types';

export interface ChoreographyExecutionResult {
  correlationId: string;
  proyectoId: string;
  timestamp: string;
  status: 'EXITOSO' | 'PARCIAL' | 'FALLIDO';
  executionTrace: Array<{
    step: number;
    agent: string;
    action: string;
    eventEmitted: string;
    durationMs: number;
  }>;
  resultados: {
    constructora: ProyectoCreadoPayload;
    apu: ApuConsolidadoPayload;
    marketplace: SuministrosAsignadosPayload;
    fletes: LogisticaProcesadaPayload;
    talento: ConvocatoriaTalentoEmitidaPayload;
    inmobiliaria: AnalisisInmobiliarioCompletoPayload;
    alojamiento: AlojamientosLogisticosReservadosPayload;
    pagos: EcosistemaFinanciadoPayload;
  };
}

export class SaraAgentOrchestrator {
  private static isInitialized = false;
  private static pagosTriggeredCorrelations = new Set<string>();

  /**
   * Inicializa la suscripción reactiva de todos los agentes del ecosistema
   */
  static init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    console.log('[SaraAgentOrchestrator] 🌐 Red Agéntica SARA iniciada en producción.');

    // Suscripción reactiva 1: PROYECTO_CREADO -> Despierta primero a SARA-APU
    SaraEventBus.subscribe('PROYECTO_CREADO', async (event: SaraAgentEvent<ProyectoCreadoPayload>) => {
      console.log(`[Orchestrator Trigger] PROYECTO_CREADO recibido. Despertando SARA-APU...`);
      SaraApuAgent.computarApu(event.payload, event.correlationId)
        .catch(err => console.error('[Orchestrator Error en fase 1 - APU]:', err));
    });

    // Suscripción reactiva 2: APU_CONSOLIDADO -> Despierta en paralelo a INMOBILIARIA (con costo real de obra listo), MARKETPLACE y TALENTOHUMANO
    SaraEventBus.subscribe('APU_CONSOLIDADO', async (event: SaraAgentEvent<ApuConsolidadoPayload>) => {
      console.log(`[Orchestrator Trigger] APU_CONSOLIDADO recibido. Despertando SARA-INMOBILIARIA, SARA-MARKETPLACE y SARA-TALENTOHUMANO...`);
      const proyecto = await SaraSharedMemory.get<ProyectoCreadoPayload>(event.correlationId, 'constructora', 'proyecto_raiz');
      Promise.all([
        proyecto ? SaraInmobiliariaAgent.evaluarViabilidadInmobiliaria(proyecto, event.correlationId) : Promise.resolve(),
        SaraMarketplaceAgent.optimizarSuministros(event.payload, event.correlationId),
        SaraTalentoHumanoAgent.reclutarPersonal(event.payload, event.correlationId)
      ]).catch(err => console.error('[Orchestrator Error en fase 2]:', err));
    });

    // Suscripción reactiva 3: SUMINISTROS_ASIGNADOS -> Despierta a SARA-FLETES
    SaraEventBus.subscribe('SUMINISTROS_ASIGNADOS', async (event: SaraAgentEvent<SuministrosAsignadosPayload>) => {
      console.log(`[Orchestrator Trigger] SUMINISTROS_ASIGNADOS recibido. Despertando SARA-FLETES...`);
      SaraFletesAgent.procesarLogistica(event.payload, event.correlationId)
        .catch(err => console.error('[Orchestrator Error en fase 3]:', err));
    });

    // Suscripción reactiva 4: CONVOCATORIA_TALENTO_EMITIDA -> Despierta a SARA-ALOJAMIENTO
    SaraEventBus.subscribe('CONVOCATORIA_TALENTO_EMITIDA', async (event: SaraAgentEvent<ConvocatoriaTalentoEmitidaPayload>) => {
      console.log(`[Orchestrator Trigger] Convocatoria de talento emitida. Gestionando SARA-ALOJAMIENTO...`);
      SaraAlojamientoAgent.gestionarAlojamiento(event.correlationId)
        .catch(err => console.error('[Orchestrator Error en alojamiento]:', err));
    });

    // Barrera de Sincronización (Join Barrier): LOGISTICA_PROCESADA + ALOJAMIENTOS_LOGISTICOS_RESERVADOS -> SARA-PAGOS
    const tryTriggerPagosJoinBarrier = async (correlationId: string) => {
      if (this.pagosTriggeredCorrelations.has(correlationId)) return;
      const logistica = await SaraSharedMemory.get<LogisticaProcesadaPayload>(correlationId, 'fletes', 'logistica_despachos');
      const alojamiento = await SaraSharedMemory.get<AlojamientosLogisticosReservadosPayload>(correlationId, 'alojamiento', 'reserva_logistica');
      if (logistica && alojamiento) {
        this.pagosTriggeredCorrelations.add(correlationId);
        console.log(`[Orchestrator Trigger] Join Barrier completada (Logística + Alojamiento). Activando SARA-PAGOS...`);
        SaraPagosAgent.blindarFinanciamientoEscrow(correlationId)
          .catch(err => console.error('[Orchestrator Error en Pagos]:', err));
      }
    };

    SaraEventBus.subscribe('LOGISTICA_PROCESADA', async (event: SaraAgentEvent<LogisticaProcesadaPayload>) => {
      await tryTriggerPagosJoinBarrier(event.correlationId);
    });

    SaraEventBus.subscribe('ALOJAMIENTOS_LOGISTICOS_RESERVADOS', async (event: SaraAgentEvent<AlojamientosLogisticosReservadosPayload>) => {
      await tryTriggerPagosJoinBarrier(event.correlationId);
    });
  }

  /**
   * Ejecuta la coreografía integral sincronizada de los 8 agentes de punta a punta
   * (Ideal para cotizaciones inmediatas, simulaciones y aprobaciones de proyectos)
   */
  static async ejecutarFlujoIntegral(input: {
    nombre: string;
    provincia: string;
    ciudad: string;
    tipologia: 'Residencial' | 'Vial' | 'Comercial' | 'Estructura Metálica';
    areaM2: number;
    niveles?: number;
    coordenadas?: { lat: number; lng: number };
    cliente: { nombre: string; contacto: string; email: string };
  }): Promise<ChoreographyExecutionResult> {
    const trace: ChoreographyExecutionResult['executionTrace'] = [];

    // Suprimir suscriptores reactivos durante el flujo imperativo para evitar doble disparo
    SaraEventBus.setSuppressReactiveHandlers(true);

    try {
      // Paso 1: SARA-CONSTRUCTORA
      let t0 = Date.now();
      const { correlationId, payload: constructoraPayload } = await SaraConstructoraAgent.estructurarProyecto(input);
      SaraEventBus.setImperativeCorrelation(correlationId, true);

      trace.push({
        step: 1,
        agent: SaraConstructoraAgent.AGENT_ID,
        action: 'Estructuración raíz, zonificación sísmica NEC-15 y geolocalización de obra',
        eventEmitted: 'PROYECTO_CREADO',
        durationMs: Date.now() - t0
      });

      try {
        // Paso 2A: SARA-APU (Primero para consolidar el costo real de obra en Memoria Compartida)
        t0 = Date.now();
        const apuPayload = await SaraApuAgent.computarApu(constructoraPayload, correlationId);
        trace.push({
          step: 2,
          agent: SaraApuAgent.AGENT_ID,
          action: 'Cómputo volumétrico, Fórmula Polinómica INEC y horas/hombre provinciales',
          eventEmitted: 'APU_CONSOLIDADO',
          durationMs: Date.now() - t0
        });

        // Paso 2B: SARA-INMOBILIARIA (Con el costoTotalObra real de SARA-APU ya disponible en memoria)
        t0 = Date.now();
        const inmobiliariaPayload = await SaraInmobiliariaAgent.evaluarViabilidadInmobiliaria(constructoraPayload, correlationId);
        trace.push({
          step: 3,
          agent: SaraInmobiliariaAgent.AGENT_ID,
          action: 'Tasación IVS 2025, VAN/TIR y precalificación hipotecaria BIESS',
          eventEmitted: 'ANALISIS_INMOBILIARIO_COMPLETO',
          durationMs: Date.now() - t0
        });

        // Paso 3: SARA-MARKETPLACE y SARA-TALENTOHUMANO (Paralelo)
        t0 = Date.now();
        const [marketplacePayload, talentoPayload] = await Promise.all([
          SaraMarketplaceAgent.optimizarSuministros(apuPayload, correlationId),
          SaraTalentoHumanoAgent.reclutarPersonal(apuPayload, correlationId)
        ]);
        trace.push({
          step: 4,
          agent: SaraMarketplaceAgent.AGENT_ID,
          action: 'Cruce con proveedores mayoristas, IVA 5% construcción y predicción de volatilidad',
          eventEmitted: 'SUMINISTROS_ASIGNADOS',
          durationMs: Date.now() - t0
        });
        trace.push({
          step: 5,
          agent: SaraTalentoHumanoAgent.AGENT_ID,
          action: 'Push-to-Work geolocalizado, validación SST Decreto 255 y SBU 2026',
          eventEmitted: 'CONVOCATORIA_TALENTO_EMITIDA',
          durationMs: Date.now() - t0
        });

        // Paso 4: SARA-FLETES y SARA-ALOJAMIENTO (Paralelo)
        t0 = Date.now();
        const [fletesPayload, alojamientoPayload] = await Promise.all([
          SaraFletesAgent.procesarLogistica(marketplacePayload, correlationId),
          SaraAlojamientoAgent.gestionarAlojamiento(correlationId)
        ]);
        trace.push({
          step: 6,
          agent: SaraFletesAgent.AGENT_ID,
          action: 'Cubicación MTOP, optimización Backhaul y trazado de rutas',
          eventEmitted: 'LOGISTICA_PROCESADA',
          durationMs: Date.now() - t0
        });
        trace.push({
          step: 7,
          agent: SaraAlojamientoAgent.AGENT_ID,
          action: 'Gestión de alojamiento corporativo USALI, PIN autónomo e IVA turístico',
          eventEmitted: 'ALOJAMIENTOS_LOGISTICOS_RESERVADOS',
          durationMs: Date.now() - t0
        });

        // Paso 5: SARA-PAGOS (Consolidación, Fideicomiso Escrow y UAFE)
        t0 = Date.now();
        const pagosPayload = await SaraPagosAgent.blindarFinanciamientoEscrow(correlationId);
        trace.push({
          step: 8,
          agent: SaraPagosAgent.AGENT_ID,
          action: 'Apertura de cuenta custodia Escrow 100%, validación UAFE y liberación por hitos',
          eventEmitted: 'ECOSISTEMA_FINANCIADO_Y_BLINDADO',
          durationMs: Date.now() - t0
        });

        return {
          correlationId,
          proyectoId: constructoraPayload.proyectoId,
          timestamp: new Date().toISOString(),
          status: 'EXITOSO',
          executionTrace: trace,
          resultados: {
            constructora: constructoraPayload,
            apu: apuPayload,
            marketplace: marketplacePayload,
            fletes: fletesPayload,
            talento: talentoPayload,
            inmobiliaria: inmobiliariaPayload,
            alojamiento: alojamientoPayload,
            pagos: pagosPayload
          }
        };
      } finally {
        SaraEventBus.setImperativeCorrelation(correlationId, false);
      }
    } finally {
      SaraEventBus.setSuppressReactiveHandlers(false);
    }
  }

  /**
   * Ejecuta el ciclo de aprendizaje evolutivo tras la conclusión de una obra
   */
  static async retroalimentarProyectoFinalizado(reporte: ProyectoFinalizadoReport) {
    return await SaraLearningEngine.consolidarAprendizajeProyecto(reporte);
  }
}
