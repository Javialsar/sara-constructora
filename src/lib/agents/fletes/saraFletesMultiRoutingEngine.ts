import { SaraFletesReflectiveMemory } from './saraFletesReflectiveMemory';

export interface RoutePoint {
  nombre: string;
  lat: number;
  lng: number;
  ciudad?: string;
  provincia?: string;
}

export interface MultimodalRouteResult {
  origen: RoutePoint;
  destino: RoutePoint;
  modalidad: 'VIAJE' | 'MANDADITO' | 'FLETE' | 'RENTA';
  vehicleType: string;
  distanciaKm: number;
  duracionEstimadaMinutos: number;
  polyline: [number, number][];
  velocidadMediaKmh: number;
  alertasViales: string[];
  memoriaReflectivaAplicada: boolean;
  insightsIA: string[];
}

export class SaraFletesMultiRoutingEngine {
  static readonly AGENT_ID = '@Agent-MultiRoutingEngine';

  /**
   * Calcula la distancia geodésica mediante la fórmula de Haversine
   */
  static haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  }

  /**
   * Genera coordenadas intermedias fluidas para pintar la polyline en el mapa interactivo
   */
  static interpolatePolyline(
    p1: [number, number],
    p2: [number, number],
    steps: number = 8
  ): [number, number][] {
    const points: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Ligera ondulación para simular trazado vial real de curvas ecuatorianas
      const curve = Math.sin(t * Math.PI) * 0.002;
      const lat = p1[0] + (p2[0] - p1[0]) * t + curve;
      const lng = p1[1] + (p2[1] - p1[1]) * t + curve * 0.8;
      points.push([+lat.toFixed(6), +lng.toFixed(6)]);
    }
    return points;
  }

  /**
   * CÁLCULO DE RUTA MULTIMODAL CONCURRENTE CON RECALL DE MEMORIA REFLECTIVA
   */
  static async calculateRoute(params: {
    origen: RoutePoint;
    destino: RoutePoint;
    modalidad: 'VIAJE' | 'MANDADITO' | 'FLETE' | 'RENTA';
    vehicleType: string;
    material?: string;
    horaActual?: string;
  }): Promise<MultimodalRouteResult> {
    const dGeo = this.haversineDistanceKm(
      params.origen.lat,
      params.origen.lng,
      params.destino.lat,
      params.destino.lng
    );

    const esUrbana = dGeo <= 8.0;
    let sinuosidad = 1.20;
    let velocidadMedia = 30; // km/h
    const alertas: string[] = [];

    // 1. Físicas y restricciones por modalidad
    switch (params.modalidad) {
      case 'VIAJE':
        if (params.vehicleType.includes('MOTO')) {
          sinuosidad = 1.10; // Motos tienen mayor maniobrabilidad
          velocidadMedia = esUrbana ? 28 : 55;
        } else if (params.vehicleType.includes('MINIVAN')) {
          sinuosidad = 1.25;
          velocidadMedia = esUrbana ? 20 : 65;
        } else {
          sinuosidad = 1.18;
          velocidadMedia = esUrbana ? 22 : 70;
        }
        break;

      case 'MANDADITO':
        if (params.vehicleType.includes('MOTO')) {
          sinuosidad = 1.08; // Rutas peatonales/pasajes permitidos para delivery
          velocidadMedia = esUrbana ? 30 : 50;
        } else {
          sinuosidad = 1.18;
          velocidadMedia = esUrbana ? 22 : 60;
        }
        break;

      case 'FLETE':
        if (params.vehicleType.includes('TRACTO') || params.vehicleType.includes('3S3')) {
          sinuosidad = 1.35; // Curvas de radio amplio y cuestas de montaña
          velocidadMedia = esUrbana ? 15 : 42;
          alertas.push('Restricción MTOP: Tráiler sujeto a pesaje obligatorio en balanzas activas.');
        } else if (params.vehicleType.includes('VOLQUETA')) {
          sinuosidad = 1.30;
          velocidadMedia = esUrbana ? 18 : 45;
          alertas.push('Corredor de cantera verificado bajo límite de peso por eje MTOP V3A 27T.');
        } else {
          sinuosidad = 1.25;
          velocidadMedia = esUrbana ? 20 : 58;
        }
        break;

      case 'RENTA':
        sinuosidad = 1.20;
        velocidadMedia = 45;
        break;
    }

    const distanciaEfectivaKm = +(Math.max(0.5, dGeo * sinuosidad)).toFixed(2);
    let tiempoBaseMinutos = Math.max(4, Math.round((distanciaEfectivaKm / velocidadMedia) * 60));

    // 2. RECALL DE MEMORIA REFLECTIVA (Inteligencia Predictiva)
    const recall = SaraFletesReflectiveMemory.recallContextual({
      modalidad: params.modalidad,
      vehicleType: params.vehicleType,
      zonaUrbana: params.origen.ciudad || params.origen.nombre,
      material: params.material,
      corredor: `${params.origen.nombre} - ${params.destino.nombre}`,
      hora: params.horaActual
    });

    if (recall.reglasAplicables.length > 0) {
      tiempoBaseMinutos = Math.max(3, tiempoBaseMinutos + recall.ajusteTiempoMinutos);
    }

    const polyline = this.interpolatePolyline(
      [params.origen.lat, params.origen.lng],
      [params.destino.lat, params.destino.lng],
      Math.min(20, Math.max(6, Math.round(distanciaEfectivaKm)))
    );

    return {
      origen: params.origen,
      destino: params.destino,
      modalidad: params.modalidad,
      vehicleType: params.vehicleType,
      distanciaKm: distanciaEfectivaKm,
      duracionEstimadaMinutos: tiempoBaseMinutos,
      polyline,
      velocidadMediaKmh: velocidadMedia,
      alertasViales: alertas,
      memoriaReflectivaAplicada: recall.reglasAplicables.length > 0,
      insightsIA: recall.insights
    };
  }
}
