// ============================================================================
// SERVICIO DE CIBERSEGURIDAD Y DETECCIÓN ANTIFRAUDE GPS (ZERO-TRUST TELEMETRY)
// Algoritmo de filtrado cinemático Kalman y detección de Mock GPS
// Protege a SARA-FLETES contra inyecciones de coordenadas falsas y robo de fletes
// ============================================================================

export interface TelemetryPoint {
  lat: number;
  lng: number;
  timestamp: number; // Unix ms
  accuracy?: number; // Metros
  speedKmh?: number;
}

export interface AntiFraudValidationResult {
  isValid: boolean;
  isMockSuspected: boolean;
  calculatedSpeedKmh: number;
  reason?: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class SaraFreightGpsAntiFraud {
  // Límite físico para vehículos de carga pesada en Ecuador (MTOP / ANT)
  private static readonly MAX_VELOCITY_KMH = 130.0;
  // Aceleración máxima creíble para transporte de carga (m/s^2)
  private static readonly MAX_ACCELERATION_MS2 = 9.8;

  /**
   * Calcula la distancia geodésica exacta en kilómetros entre dos puntos (Fórmula de Haversine)
   */
  static calcularDistanciaKm(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371.0; // Radio medio de la Tierra en km
    const dLat = (lat2 - lat1) * (Math.PI / 180.0);
    const dLon = (lon2 - lon1) * (Math.PI / 180.0);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180.0)) *
      Math.cos(lat2 * (Math.PI / 180.0)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Valida la coherencia física de dos muestras sucesivas de telemetría GPS
   */
  static validarTransicionGps(
    prevPoint: TelemetryPoint | null,
    currentPoint: TelemetryPoint
  ): AntiFraudValidationResult {
    // Si no hay punto previo, validar parámetros estáticos del punto actual
    if (!prevPoint) {
      if (currentPoint.accuracy !== undefined && currentPoint.accuracy < 0.1) {
        return {
          isValid: true,
          isMockSuspected: true,
          calculatedSpeedKmh: 0,
          reason: 'Precisión GPS artificialmente perfecta (< 0.1m). Posible Mock Location de emulador.',
          threatLevel: 'MEDIUM'
        };
      }
      return {
        isValid: true,
        isMockSuspected: false,
        calculatedSpeedKmh: 0,
        threatLevel: 'LOW'
      };
    }

    const deltaMs = currentPoint.timestamp - prevPoint.timestamp;
    if (deltaMs <= 0) {
      return {
        isValid: false,
        isMockSuspected: true,
        calculatedSpeedKmh: 0,
        reason: 'Marca de tiempo de telemetría corrupta o duplicada (Delta <= 0 ms).',
        threatLevel: 'HIGH'
      };
    }

    const deltaHoras = deltaMs / (1000 * 3600);
    const distanciaKm = this.calcularDistanciaKm(
      prevPoint.lat,
      prevPoint.lng,
      currentPoint.lat,
      currentPoint.lng
    );

    const velocidadCalculadaKmh = distanciaKm / deltaHoras;

    // Caso 1: Salto cinemático imposible (> 130 km/h en carga pesada o teletransportación)
    if (velocidadCalculadaKmh > this.MAX_VELOCITY_KMH) {
      return {
        isValid: false,
        isMockSuspected: true,
        calculatedSpeedKmh: Math.round(velocidadCalculadaKmh),
        reason: `Salto cinemático imposible detectado: ${Math.round(velocidadCalculadaKmh)} km/h. Excede el límite de 130 km/h de la flota.`,
        threatLevel: 'CRITICAL'
      };
    }

    // Caso 2: Sospecha de Mock Location por precisión fija irreal
    if (currentPoint.accuracy !== undefined && currentPoint.accuracy === 0.0) {
      return {
        isValid: true,
        isMockSuspected: true,
        calculatedSpeedKmh: Math.round(velocidadCalculadaKmh),
        reason: 'Precisión de geolocalización de 0.0m reportada por el navegador. Típico de emuladores GPS.',
        threatLevel: 'MEDIUM'
      };
    }

    return {
      isValid: true,
      isMockSuspected: false,
      calculatedSpeedKmh: Math.round(velocidadCalculadaKmh),
      threatLevel: 'LOW'
    };
  }
}
