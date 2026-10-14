import { SaraSharedMemory } from '../shared-memory';
import { SaraEventBus } from '../event-bus';
import { SuministrosAsignadosPayload, ApuConsolidadoPayload, LogisticaProcesadaPayload, ProyectoCreadoPayload } from '../types';

export class SaraFletesAgent {
  static readonly AGENT_ID = 'SARA-FLETES';

  /**
   * Planifica la logística de carga pesada, cubicación y rutas óptimas en Ecuador
   */
  static async procesarLogistica(
    suministros: SuministrosAsignadosPayload,
    correlationId: string
  ): Promise<LogisticaProcesadaPayload> {
    // Obtener datos del proyecto y APU desde la memoria compartida
    const proyecto = await SaraSharedMemory.get<ProyectoCreadoPayload>(correlationId, 'constructora', 'proyecto_raiz');
    const apu = await SaraSharedMemory.get<ApuConsolidadoPayload>(correlationId, 'apu', 'computo_metricas');

    const destino = proyecto ? `${proyecto.ciudad}, ${proyecto.provincia}` : 'Cuenca, Azuay';
    const pesoTotalTon = apu?.desalojoCarga?.materialCargaTon || 85;
    const volumenTotalM3 = apu?.desalojoCarga?.volumenTierraDesalojoM3 || 110;

    // APRENDIZAJE EVOLUTIVO: Consultar retrasos de rutas históricas
    const rutaGyeCue = await SaraSharedMemory.getKnowledge('freight_delays', 'ruta_guayaquil_cuenca');
    const alertaMolleturo = rutaGyeCue?.currentValue?.cuello_botella || 'Molleturo / Deslaves';
    const probRetraso = rutaGyeCue?.currentValue?.retraso_probabilidad || 0.25;

    // Despachos requeridos
    const despachos: LogisticaProcesadaPayload['despachosRequeridos'] = [
      {
        tipoVehiculo: 'Mula Plataforma',
        cantidadViajes: Math.ceil(pesoTotalTon / 28), // 28 toneladas por mula
        ruta: {
          origen: 'Lasso / Guayaquil (Plantas Siderúrgicas & Cemento)',
          destino,
          distanciaKm: 195,
          tiempoEstimadoHoras: +(rutaGyeCue?.currentValue?.duracion_media_horas || 4.5),
          probabilidadRetrasoClima: probRetraso
        },
        cooperativaAliada: 'Cooperativa de Transporte Pesado AustroTrans / SurAndina',
        tarifaTotalUSD: Math.round(Math.ceil(pesoTotalTon / 28) * 380)
      },
      {
        tipoVehiculo: 'Volqueta 14m3',
        cantidadViajes: Math.ceil(volumenTotalM3 / 14), // 14 m3 por volqueta
        ruta: {
          origen: 'Cantera El Tablón / Challuabamba',
          destino,
          distanciaKm: 28,
          tiempoEstimadoHoras: 1.2,
          probabilidadRetrasoClima: 0.08
        },
        cooperativaAliada: 'Asociación de Volqueteros Unidos del Azuay',
        tarifaTotalUSD: Math.round(Math.ceil(volumenTotalM3 / 14) * 85)
      }
    ];

    const costoLogisticoTotalUSD = despachos.reduce((acc, d) => acc + d.tarifaTotalUSD, 0);

    const alertasViales: string[] = [
      `Monitoreo preventivo Vía Km 49 Molleturo-El Empalme: ${alertaMolleturo} (Probabilidad de retraso: ${Math.round(probRetraso * 100)}%)`,
      'Ruta alternativa habilitada vía Zhud-Cochancay para convoyes de carga indivisible'
    ];

    const payload: LogisticaProcesadaPayload = {
      proyectoId: suministros.proyectoId,
      pesoTotalCargaTon: pesoTotalTon,
      volumenTotalM3,
      despachosRequeridos: despachos,
      costoLogisticoTotalUSD,
      alertasViales
    };

    // 1. Guardar en Memoria Colectiva
    await SaraSharedMemory.set(
      correlationId,
      'fletes',
      'logistica_despachos',
      payload,
      0.95,
      ['fletes', 'transporte_pesado', 'rutas'],
      suministros.proyectoId
    );

    // 2. Disparar Evento Global
    await SaraEventBus.publish<LogisticaProcesadaPayload>(
      'LOGISTICA_PROCESADA',
      this.AGENT_ID,
      ['SARA-CONSTRUCTORA', 'SARA-PAGOS'],
      payload,
      correlationId,
      suministros.proyectoId
    );

    return payload;
  }
}
