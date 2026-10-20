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
    const pesoMaterialesSuministrosTon = apu?.materialesRequeridos
      ? +(apu.materialesRequeridos.reduce((acc, m) => acc + (m.pesoEstimadoKg || 0), 0) / 1000).toFixed(1)
      : (apu?.desalojoCarga?.materialCargaTon || 85);
    const volumenDesalojoM3 = apu?.desalojoCarga?.volumenTierraDesalojoM3 || 110;
    const pesoDesalojoTon = +(volumenDesalojoM3 * 1.45).toFixed(1);
    const pesoTotalTon = +(pesoMaterialesSuministrosTon + pesoDesalojoTon).toFixed(1);
    const volumenMaterialesM3 = apu?.materialesRequeridos
      ? +(apu.materialesRequeridos.reduce((acc, m) => acc + (m.volumenM3 || 0), 0)).toFixed(1)
      : 45;
    const volumenTotalM3 = +(volumenDesalojoM3 + volumenMaterialesM3).toFixed(1);

    // Extraer orígenes reales de los proveedores seleccionados en SARA-MARKETPLACE
    const origenesPesados = suministros.proveedoresSeleccionados
      .filter(p => p.proveedorId.includes('ADELCA') || p.proveedorId.includes('HOLCIM'))
      .map(p => p.ciudadOrigen)
      .join(' & ') || 'Lasso / Guayaquil (Plantas Siderúrgicas & Cemento)';

    const origenesCantera = suministros.proveedoresSeleccionados
      .filter(p => p.proveedorId.includes('CANTERA') || p.proveedorId.includes('CERAMICA'))
      .map(p => p.ciudadOrigen)
      .join(' & ') || 'Cantera El Tablón / Challuabamba';

    // APRENDIZAJE EVOLUTIVO: Consultar retrasos de rutas históricas
    const rutaGyeCue = await SaraSharedMemory.getKnowledge('freight_delays', 'ruta_guayaquil_cuenca');
    const alertaMolleturo = rutaGyeCue?.currentValue?.cuello_botella || 'Molleturo / Deslaves';
    const probRetraso = rutaGyeCue?.currentValue?.retraso_probabilidad || 0.25;

    // Límites MTOP Tabla Nacional de Pesos y Dimensiones:
    // Tractocamión 3S3: máx 51T PBV (~32T carga útil segura)
    // Volqueta V3A (14m3): máx 27T PBV (~18T carga útil / 14m3)
    const capacidadUtilMula3S3Ton = 30; // <= 32T máx legal 3S3 (51T PBV)
    const capacidadVolquetaV3AM3 = 14; // Volqueta V3A 27T PBV

    const viajesMula3S3 = Math.max(1, Math.ceil(pesoMaterialesSuministrosTon / capacidadUtilMula3S3Ton));
    const viajesVolquetaV3A = Math.max(1, Math.ceil(volumenTotalM3 / capacidadVolquetaV3AM3));

    const tarifaBrutaVolquetasUSD = viajesVolquetaV3A * 85;
    // Optimización Backhaul: Sincronización de retorno de volquetas de desalojo cargando áridos de cantera (~28% ahorro)
    const ahorroBackhaulUSD = Math.round(tarifaBrutaVolquetasUSD * 0.28);
    const tarifaNetaVolquetasUSD = tarifaBrutaVolquetasUSD - ahorroBackhaulUSD;
    const peajesEstimadosUSD = (viajesMula3S3 * 18) + (viajesVolquetaV3A * 4);

    // Despachos requeridos
    const despachos: LogisticaProcesadaPayload['despachosRequeridos'] = [
      {
        tipoVehiculo: 'Mula Plataforma',
        cantidadViajes: viajesMula3S3,
        ruta: {
          origen: origenesPesados,
          destino,
          distanciaKm: 195,
          tiempoEstimadoHoras: +(rutaGyeCue?.currentValue?.duracion_media_horas || 4.5),
          probabilidadRetrasoClima: probRetraso
        },
        cooperativaAliada: 'Cooperativa de Transporte Pesado AustroTrans / SurAndina (Config. MTOP 3S3 51T PBV)',
        tarifaTotalUSD: Math.round(viajesMula3S3 * 380)
      },
      {
        tipoVehiculo: 'Volqueta 14m3',
        cantidadViajes: viajesVolquetaV3A,
        ruta: {
          origen: origenesCantera,
          destino,
          distanciaKm: 28,
          tiempoEstimadoHoras: 1.2,
          probabilidadRetrasoClima: 0.08
        },
        cooperativaAliada: 'Asociación de Volqueteros Unidos del Azuay (Config. MTOP V3A 27T PBV - Ciclo Backhaul)',
        tarifaTotalUSD: tarifaNetaVolquetasUSD
      }
    ];

    const costoLogisticoTotalUSD = despachos.reduce((acc, d) => acc + d.tarifaTotalUSD, 0);

    const alertasViales: string[] = [
      `Monitoreo preventivo Vía Km 49 Molleturo-El Empalme: ${alertaMolleturo} (Probabilidad de retraso: ${Math.round(probRetraso * 100)}%)`,
      `Optimización Backhaul MTOP activa: Ahorro de $${ahorroBackhaulUSD} USD sincronizando desalojo de excavación con retorno de áridos`
    ];

    const payload: LogisticaProcesadaPayload = {
      proyectoId: suministros.proyectoId,
      pesoTotalCargaTon: pesoTotalTon,
      volumenTotalM3,
      despachosRequeridos: despachos,
      costoLogisticoTotalUSD,
      alertasViales,
      cumplimientoMtop: {
        configuracionesValidas: true,
        certificadoRequerido: 'COR',
        ahorroBackhaulUSD,
        peajesEstimadosUSD
      }
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
