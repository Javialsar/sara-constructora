/**
 * Telemetría RideCheck:
 * - Frenados bruscos / colisiones vía DeviceMotionEvent (aceleración > 22 m/s²).
 * - Desvíos de ruta > 400 metros.
 * - Detenciones anómalas > 3 minutos en tránsito.
 */

import { GeoPoint, minDistanceToPolylineMeters, ROUTE_DEVIATION_THRESHOLD_METERS } from './geofencing';

export type RideCheckAnomalyType = 'harsh_braking' | 'route_deviation' | 'prolonged_stop';

export interface RideCheckAnomaly {
  type: RideCheckAnomalyType;
  severity: 'WARNING' | 'CRITICAL';
  message: string;
  lat: number;
  lng: number;
  detectedAt: string;
  metrics: Record<string, number>;
}

const HARSH_BRAKING_THRESHOLD_MPS2 = 22.0; // ~2.24g
const PROLONGED_STOP_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutos

export class RideCheckMonitor {
  private stoppedSinceMs: number | null = null;
  private lastStopAlertMs = 0;
  private lastDeviationAlertMs = 0;
  private lastBrakingAlertMs = 0;

  public reset(): void {
    this.stoppedSinceMs = null;
  }

  public evaluateMotion(
    event: DeviceMotionEvent,
    currentPos: GeoPoint | null
  ): RideCheckAnomaly | null {
    const acc = event.acceleration || event.accelerationIncludingGravity;
    if (!acc || !currentPos) return null;

    const ax = acc.x ?? 0;
    const ay = acc.y ?? 0;
    const az = acc.z ?? 0;
    // Si usa accelerationIncludingGravity, descontar ~9.81 m/s² aproximado
    const magnitude = event.acceleration
      ? Math.sqrt(ax * ax + ay * ay + az * az)
      : Math.abs(Math.sqrt(ax * ax + ay * ay + az * az) - 9.81);

    const now = Date.now();
    if (magnitude >= HARSH_BRAKING_THRESHOLD_MPS2 && now - this.lastBrakingAlertMs > 30000) {
      this.lastBrakingAlertMs = now;
      return {
        type: 'harsh_braking',
        severity: 'CRITICAL',
        message: `Frenado brusco o impacto detectado (${magnitude.toFixed(1)} m/s²). ¿Todo bien?`,
        lat: currentPos.lat,
        lng: currentPos.lng,
        detectedAt: new Date(now).toISOString(),
        metrics: { accelerationMps2: Number(magnitude.toFixed(2)) },
      };
    }
    return null;
  }

  public evaluateGps(params: {
    currentPos: GeoPoint;
    speedKmh: number;
    inTransit: boolean;
    plannedRoute?: GeoPoint[];
  }): RideCheckAnomaly | null {
    const now = Date.now();

    if (!params.inTransit) {
      this.stoppedSinceMs = null;
      return null;
    }

    // 1. Desvío de ruta > 400m
    if (params.plannedRoute && params.plannedRoute.length >= 2) {
      const deviationMeters = minDistanceToPolylineMeters(params.currentPos, params.plannedRoute);
      if (
        deviationMeters > ROUTE_DEVIATION_THRESHOLD_METERS &&
        now - this.lastDeviationAlertMs > 60000
      ) {
        this.lastDeviationAlertMs = now;
        return {
          type: 'route_deviation',
          severity: 'WARNING',
          message: `Desvío de ruta detectado (${Math.round(deviationMeters)}m fuera del corredor).`,
          lat: params.currentPos.lat,
          lng: params.currentPos.lng,
          detectedAt: new Date(now).toISOString(),
          metrics: { deviationMeters },
        };
      }
    }

    // 2. Detención anómala > 3 min en tránsito
    if (params.speedKmh < 3) {
      if (this.stoppedSinceMs === null) {
        this.stoppedSinceMs = now;
      } else if (
        now - this.stoppedSinceMs >= PROLONGED_STOP_THRESHOLD_MS &&
        now - this.lastStopAlertMs > 180000
      ) {
        this.lastStopAlertMs = now;
        const stoppedSeconds = Math.round((now - this.stoppedSinceMs) / 1000);
        return {
          type: 'prolonged_stop',
          severity: 'WARNING',
          message: `Detención prolongada en ruta (${Math.round(stoppedSeconds / 60)} min). Verifica seguridad.`,
          lat: params.currentPos.lat,
          lng: params.currentPos.lng,
          detectedAt: new Date(now).toISOString(),
          metrics: { stoppedSeconds },
        };
      }
    } else {
      this.stoppedSinceMs = null;
    }

    return null;
  }
}
