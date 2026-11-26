/**
 * Filtro de Kalman 2D para Telemetría GPS de SARA FLETES v2.0.
 * - Descarta lecturas con precisión > 35m.
 * - Rechaza saltos irreales de velocidad (> 180 km/h) causados por rebote satelital en túneles o canteras.
 */

export interface RawGpsFix {
  lat: number;
  lng: number;
  accuracy: number;
  speedMps: number | null;
  heading: number | null;
  timestamp: number;
}

export interface FilteredGpsFix {
  lat: number;
  lng: number;
  accuracy: number;
  speedKmh: number;
  heading: number;
  timestamp: number;
  accepted: boolean;
  rejectReason?: string;
}

const MAX_ACCEPTABLE_ACCURACY_M = 35;
const MAX_REALISTIC_SPEED_MPS = 50; // 180 km/h

function haversineMetersInternal(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function computeBearingDegrees(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dLambda = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  const theta = Math.atan2(y, x);
  return ((theta * 180) / Math.PI + 360) % 360;
}

export class GpsKalmanFilter {
  private readonly qMetersPerSecond: number;
  private variance = -1;
  private lat = 0;
  private lng = 0;
  private lastTimestamp = 0;
  private lastHeading = 0;

  constructor(qMetersPerSecond = 3.0) {
    this.qMetersPerSecond = qMetersPerSecond;
  }

  public reset(): void {
    this.variance = -1;
    this.lastTimestamp = 0;
  }

  public process(fix: RawGpsFix): FilteredGpsFix {
    if (!Number.isFinite(fix.lat) || !Number.isFinite(fix.lng)) {
      return {
        lat: this.lat,
        lng: this.lng,
        accuracy: fix.accuracy,
        speedKmh: 0,
        heading: this.lastHeading,
        timestamp: fix.timestamp,
        accepted: false,
        rejectReason: 'INVALID_COORDINATES',
      };
    }

    if (fix.accuracy > MAX_ACCEPTABLE_ACCURACY_M) {
      return {
        lat: this.lat || fix.lat,
        lng: this.lng || fix.lng,
        accuracy: fix.accuracy,
        speedKmh: 0,
        heading: this.lastHeading,
        timestamp: fix.timestamp,
        accepted: false,
        rejectReason: `ACCURACY_EXCEEDS_35M (${fix.accuracy.toFixed(1)}m)`,
      };
    }

    const accuracy = Math.max(fix.accuracy, 1);

    if (this.variance < 0) {
      this.lat = fix.lat;
      this.lng = fix.lng;
      this.variance = accuracy * accuracy;
      this.lastTimestamp = fix.timestamp;
      this.lastHeading = fix.heading ?? 0;

      return {
        lat: this.lat,
        lng: this.lng,
        accuracy,
        speedKmh: fix.speedMps != null && fix.speedMps > 0 ? fix.speedMps * 3.6 : 0,
        heading: this.lastHeading,
        timestamp: fix.timestamp,
        accepted: true,
      };
    }

    const dtSec = Math.max((fix.timestamp - this.lastTimestamp) / 1000, 0.25);
    const jumpMeters = haversineMetersInternal(this.lat, this.lng, fix.lat, fix.lng);
    const impliedSpeedMps = jumpMeters / dtSec;

    if (impliedSpeedMps > MAX_REALISTIC_SPEED_MPS && jumpMeters > 100) {
      return {
        lat: this.lat,
        lng: this.lng,
        accuracy: Math.sqrt(this.variance),
        speedKmh: 0,
        heading: this.lastHeading,
        timestamp: fix.timestamp,
        accepted: false,
        rejectReason: `UNREALISTIC_GPS_JUMP (${(impliedSpeedMps * 3.6).toFixed(0)} km/h)`,
      };
    }

    // Propagación de covarianza temporal
    this.variance += dtSec * this.qMetersPerSecond * this.qMetersPerSecond;

    // Ganancia de Kalman
    const k = this.variance / (this.variance + accuracy * accuracy);
    const prevLat = this.lat;
    const prevLng = this.lng;

    this.lat += k * (fix.lat - this.lat);
    this.lng += k * (fix.lng - this.lng);
    this.variance = (1 - k) * this.variance;
    this.lastTimestamp = fix.timestamp;

    const filteredDist = haversineMetersInternal(prevLat, prevLng, this.lat, this.lng);
    const computedHeading =
      fix.heading != null && Number.isFinite(fix.heading)
        ? fix.heading
        : filteredDist > 3
          ? computeBearingDegrees(prevLat, prevLng, this.lat, this.lng)
          : this.lastHeading;

    this.lastHeading = computedHeading;

    const speedMps =
      fix.speedMps != null && fix.speedMps >= 0 ? fix.speedMps : filteredDist / dtSec;

    return {
      lat: this.lat,
      lng: this.lng,
      accuracy: Math.sqrt(this.variance),
      speedKmh: Number((speedMps * 3.6).toFixed(2)),
      heading: Number(computedHeading.toFixed(1)),
      timestamp: fix.timestamp,
      accepted: true,
    };
  }
}
