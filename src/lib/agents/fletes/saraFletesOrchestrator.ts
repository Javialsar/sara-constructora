import { SaraFletesMultiRoutingEngine, RoutePoint, MultimodalRouteResult } from './saraFletesMultiRoutingEngine';
import { SaraFletesSmartBidding, FairFareResult } from './saraFletesSmartBidding';
import { SaraFletesUXUIDesigner, MultimodalVerticalKey } from './saraFletesUXUIDesigner';
import { SaraFletesSystemArchitect, MultimodalOrderEntity } from './saraFletesSystemArchitect';
import { SaraFletesReflectiveMemory, TelemetryData, ReflectiveDreamResult } from './saraFletesReflectiveMemory';

export interface CotizacionMultimodalCompleta {
  modalidad: MultimodalVerticalKey;
  ruta: MultimodalRouteResult;
  tarifa: FairFareResult;
  tiempoEstimadoMinutos: number;
  distanciaKm: number;
  explicacionIA: string;
  insightsMemoria: string[];
}

export class SaraFletesOrchestrator {
  static readonly AGENT_ID = '@Agent-Orchestrator';

  /**
   * COTIZACIÓN MULTIMODAL UNIFICADA EN UN SOLO TOQUE (< 2.5 SEGUNDOS)
   */
  static async cotizarModalidad(params: {
    modalidad: MultimodalVerticalKey;
    origen: RoutePoint;
    destino: RoutePoint;
    vehicleType: string;
    material?: string;
    pesoTon?: number;
    volumenM3?: number;
    esUrgente?: boolean;
    rentaHorasODias?: 'HORAS' | 'DIAS';
    duracionRentaValor?: number;
    conChofer?: boolean;
    horaActual?: string;
  }): Promise<CotizacionMultimodalCompleta> {
    const modalidadMap: Record<MultimodalVerticalKey, 'VIAJE' | 'MANDADITO' | 'FLETE' | 'RENTA'> = {
      viajes: 'VIAJE',
      mandaditos: 'MANDADITO',
      fletes: 'FLETE',
      renta: 'RENTA'
    };
    const modUpper = modalidadMap[params.modalidad];

    // 1. Enrutamiento concurrente vía @Agent-MultiRoutingEngine
    const ruta = await SaraFletesMultiRoutingEngine.calculateRoute({
      origen: params.origen,
      destino: params.destino,
      modalidad: modUpper,
      vehicleType: params.vehicleType,
      material: params.material,
      horaActual: params.horaActual
    });

    // 2. Tarificación justa Win-Win vía @Agent-SmartBidding
    const tarifa = SaraFletesSmartBidding.calculateFare({
      modalidad: modUpper,
      vehicleType: params.vehicleType,
      distanciaKm: ruta.distanciaKm,
      duracionMinutos: ruta.duracionEstimadaMinutos,
      pesoTon: params.pesoTon,
      volumenM3: params.volumenM3,
      material: params.material,
      esUrgente: params.esUrgente,
      rentaHorasODias: params.rentaHorasODias,
      duracionRentaValor: params.duracionRentaValor,
      conChofer: params.conChofer,
      horaActual: params.horaActual
    });

    return {
      modalidad: params.modalidad,
      ruta,
      tarifa,
      tiempoEstimadoMinutos: ruta.duracionEstimadaMinutos,
      distanciaKm: ruta.distanciaKm,
      explicacionIA: tarifa.explicacionIA,
      insightsMemoria: ruta.insightsIA
    };
  }

  /**
   * CONFIRMACIÓN INSTANTÁNEA DE ORDEN MULTIMODAL
   */
  static async confirmarOrden(params: {
    modalidad: MultimodalVerticalKey;
    clienteNombre?: string;
    clienteTelefono?: string;
    vehiculoTipo: string;
    origen: RoutePoint;
    destino: RoutePoint;
    distanciaKm: number;
    duracionEstimadaMinutos: number;
    tarifaTotalUSD: number;
    detalles?: string;
  }): Promise<MultimodalOrderEntity> {
    const modalidadMap: Record<MultimodalVerticalKey, 'VIAJE' | 'MANDADITO' | 'FLETE' | 'RENTA'> = {
      viajes: 'VIAJE',
      mandaditos: 'MANDADITO',
      fletes: 'FLETE',
      renta: 'RENTA'
    };

    return SaraFletesSystemArchitect.createOrderEntity({
      modalidad: modalidadMap[params.modalidad],
      clienteNombre: params.clienteNombre,
      clienteTelefono: params.clienteTelefono,
      vehiculoTipo: params.vehiculoTipo,
      origen: params.origen.nombre,
      origenCoords: [params.origen.lat, params.origen.lng],
      destino: params.destino.nombre,
      destinoCoords: [params.destino.lat, params.destino.lng],
      distanciaKm: params.distanciaKm,
      duracionEstimadaMinutos: params.duracionEstimadaMinutos,
      tarifaTotalUSD: params.tarifaTotalUSD,
      detalles: params.detalles
    });
  }

  /**
   * CIERRE DE VIAJE, TELEMETRÍA Y CICLO "REFLECTIVE DREAM" DE AUTO-ENTRENAMIENTO
   */
  static async registrarTelemetriaYAutoAprender(telemetry: TelemetryData): Promise<ReflectiveDreamResult> {
    // 1. Ejecutar análisis de discrepancias vía @Agent-ReflectiveMemory
    const resultado = SaraFletesReflectiveMemory.processReflectiveDream(telemetry);
    return resultado;
  }
}
