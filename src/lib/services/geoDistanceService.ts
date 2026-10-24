/**
 * SERVICIO DE GEOLOCALIZACIÓN, DISTANCIAS Y LOGÍSTICA VIAL ECUATORIANA
 * Ecosistema Empresarial GRUPO SARA - SARA-FLETES & SARA-MARKETPLACE
 * 
 * Normativa y factores:
 * - Factor de sinuosidad vial andina MTOP: 1.35
 * - Velocidad media de transporte de carga pesada: 45 km/h en sierra / 65 km/h en costa
 * - Coordenadas oficiales de cantones y polos industriales del Ecuador
 */

export interface CoordenadasGPS {
  lat: number;
  lng: number;
}

export interface CantonEcuador {
  id: string;
  nombre: string;
  provincia: string;
  region: 'SIERRA' | 'COSTA' | 'ORIENTE' | 'INSULAR';
  coordenadas: CoordenadasGPS;
}

export const CANTONES_ECUADOR: CantonEcuador[] = [
  { id: 'uio', nombre: 'Quito', provincia: 'Pichincha', region: 'SIERRA', coordenadas: { lat: -0.1807, lng: -78.4678 } },
  { id: 'gye', nombre: 'Guayaquil', provincia: 'Guayas', region: 'COSTA', coordenadas: { lat: -2.1894, lng: -79.8891 } },
  { id: 'cue', nombre: 'Cuenca', provincia: 'Azuay', region: 'SIERRA', coordenadas: { lat: -2.9001, lng: -79.0059 } },
  { id: 'loj', nombre: 'Loja', provincia: 'Loja', region: 'SIERRA', coordenadas: { lat: -3.9931, lng: -79.2042 } },
  { id: 'amb', nombre: 'Ambato', provincia: 'Tungurahua', region: 'SIERRA', coordenadas: { lat: -1.2491, lng: -78.6168 } },
  { id: 'rio', nombre: 'Riobamba', provincia: 'Chimborazo', region: 'SIERRA', coordenadas: { lat: -1.6636, lng: -78.6546 } },
  { id: 'mta', nombre: 'Manta', provincia: 'Manabí', region: 'COSTA', coordenadas: { lat: -0.9677, lng: -80.7089 } },
  { id: 'pto', nombre: 'Portoviejo', provincia: 'Manabí', region: 'COSTA', coordenadas: { lat: -1.0546, lng: -80.4544 } },
  { id: 'mch', nombre: 'Machala', provincia: 'El Oro', region: 'COSTA', coordenadas: { lat: -3.2581, lng: -79.9554 } },
  { id: 'sto', nombre: 'Santo Domingo', provincia: 'Santo Domingo de los Tsáchilas', region: 'COSTA', coordenadas: { lat: -0.2530, lng: -79.1754 } },
  { id: 'iba', nombre: 'Ibarra', provincia: 'Imbabura', region: 'SIERRA', coordenadas: { lat: 0.3517, lng: -78.1223 } },
  { id: 'esl', nombre: 'Esmeraldas', provincia: 'Esmeraldas', region: 'COSTA', coordenadas: { lat: 0.9682, lng: -79.6517 } },
  { id: 'lat', nombre: 'Latacunga / Lasso', provincia: 'Cotopaxi', region: 'SIERRA', coordenadas: { lat: -0.9316, lng: -78.6155 } },
  { id: 'bab', nombre: 'Babahoyo', provincia: 'Los Ríos', region: 'COSTA', coordenadas: { lat: -1.8022, lng: -79.5344 } },
  { id: 'que', nombre: 'Quevedo', provincia: 'Los Ríos', region: 'COSTA', coordenadas: { lat: -1.0286, lng: -79.4635 } },
  { id: 'pau', nombre: 'Paute', provincia: 'Azuay', region: 'SIERRA', coordenadas: { lat: -2.7758, lng: -78.7562 } }
];

export class GeoDistanceService {
  /** Factor de sinuosidad vial andina MTOP */
  static readonly FACTOR_SINUOSIDAD_MTOP = 1.35;

  /**
   * Calcula la distancia en línea recta (Haversine) entre dos puntos GPS
   */
  static distanciaHaversineKm(puntoA: CoordenadasGPS, puntoB: CoordenadasGPS): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((puntoB.lat - puntoA.lat) * Math.PI) / 180;
    const dLng = ((puntoB.lng - puntoA.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((puntoA.lat * Math.PI) / 180) *
        Math.cos((puntoB.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calcula la distancia estimada real por carretera en Ecuador
   */
  static distanciaVialEcuadorKm(origen: CoordenadasGPS, destino: CoordenadasGPS): number {
    const dLineal = this.distanciaHaversineKm(origen, destino);
    // Para distancias muy cortas dentro de la misma ciudad (< 8km), menor sinuosidad
    if (dLineal < 8) {
      return +(dLineal * 1.15).toFixed(1);
    }
    return +(dLineal * this.FACTOR_SINUOSIDAD_MTOP).toFixed(1);
  }

  /**
   * Calcula el tiempo estimado de transporte y tipo de entrega
   */
  static estimarTiempoTransporte(distanciaKm: number): {
    tiempoHoras: number;
    etiquetaTexto: string;
    esExpress: boolean;
  } {
    if (distanciaKm <= 15) {
      return {
        tiempoHoras: 2,
        etiquetaTexto: 'Entrega Express (2 - 4 horas)',
        esExpress: true
      };
    }
    if (distanciaKm <= 60) {
      return {
        tiempoHoras: 6,
        etiquetaTexto: 'Entrega en el día (Mismo día)',
        esExpress: false
      };
    }
    if (distanciaKm <= 200) {
      return {
        tiempoHoras: 18,
        etiquetaTexto: 'Despacho 24 horas',
        esExpress: false
      };
    }
    return {
      tiempoHoras: 36,
      etiquetaTexto: 'Despacho Nacional 24h - 48h',
      esExpress: false
    };
  }

  /**
   * Encuentra el cantón más cercano a partir de coordenadas GPS
   */
  static encontrarCantonMasCercano(gps: CoordenadasGPS): CantonEcuador {
    let cantonCercano = CANTONES_ECUADOR[0];
    let distanciaMinima = Infinity;

    for (const canton of CANTONES_ECUADOR) {
      const dist = this.distanciaHaversineKm(gps, canton.coordenadas);
      if (dist < distanciaMinima) {
        distanciaMinima = dist;
        cantonCercano = canton;
      }
    }
    return cantonCercano;
  }
}
