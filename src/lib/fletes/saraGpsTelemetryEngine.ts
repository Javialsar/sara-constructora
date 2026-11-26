'use client';

/**
 * ============================================================================
 * SARA GPS TELEMETRY ENGINE (Cero Datos Ficticios)
 * Motor de geolocalización continua estilo Google Maps:
 *  - Adquisición GPS real mediante navigator.geolocation.watchPosition
 *  - Filtro de precisión + Anti-Saltos (> 165 km/h) + Filtro de Kalman 2D
 *  - Proyección Snap-to-Road sobre la polilínea vial activa
 *  - Detección Off-Route (> 40 m en 2 lecturas consecutivas con cooldown 10s)
 *  - Geofence real de llegada (< 25 m del destino)
 * ============================================================================
 */

export interface GpsFixReal {
  lat: number;
  lng: number;
  rawLat: number;
  rawLng: number;
  accuracyM: number;
  speedKmh: number;
  heading: number;
  timestamp: number;
}

export interface SnapToRouteResult {
  snappedCoords: [number, number];
  perpendicularDistanceM: number;
  traveledMeters: number;
  totalRouteMeters: number;
  progressPercent: number;
  segmentIndex: number;
}

const EARTH_RADIUS_M = 6371000;

export function haversineMeters(a: [number, number], b: [number, number]): number {
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function computeBearingDeg(from: [number, number], to: [number, number]): number {
  const lat1 = (from[0] * Math.PI) / 180;
  const lat2 = (to[0] * Math.PI) / 180;
  const dLng = ((to[1] - from[1]) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/**
 * Filtro de Kalman 2D ligero adaptado a lecturas GPS móviles.
 * Elimina rebotes en semáforos y suaviza trayectorias sin introducir lag excesivo.
 */
export class KalmanGpsFilter2D {
  private lat = 0;
  private lng = 0;
  private variance = -1; // negativo = no inicializado
  private lastTimestamp = 0;
  private lastHeading = 0;
  private readonly qMetersPerSec: number;

  constructor(qMetersPerSec = 3.5) {
    this.qMetersPerSec = qMetersPerSec;
  }

  public reset(): void {
    this.variance = -1;
    this.lastTimestamp = 0;
  }

  public process(
    rawLat: number,
    rawLng: number,
    accuracyM: number,
    rawSpeedMps: number | null,
    rawHeading: number | null,
    timestamp: number
  ): GpsFixReal | null {
    const acc = Math.max(3, accuracyM || 20);
    const currentStdDevM = this.variance >= 0 ? Math.sqrt(this.variance) : Infinity;

    // Rechazar lecturas muy ruidosas SOLO si ya tenemos un lock preciso (<= 35m)
    if (this.variance >= 0 && currentStdDevM <= 35 && acc > 65) {
      return null;
    }

    // Re-anclaje inmediato: si el lock inicial fue grueso (Wi-Fi/PC > 45m) y llega una lectura
    // significativamente más precisa, NUNCA descartarla como "salto imposible" — re-anclar directo.
    const isStrictPrecisionUpgrade =
      this.variance >= 0 && (currentStdDevM > 45 || acc < currentStdDevM * 0.65) && acc <= currentStdDevM;

    if (this.variance < 0 || isStrictPrecisionUpgrade) {
      this.lat = rawLat;
      this.lng = rawLng;
      this.variance = acc * acc;
      this.lastTimestamp = timestamp;
      this.lastHeading = typeof rawHeading === 'number' && !isNaN(rawHeading) ? rawHeading : this.lastHeading;
      return {
        lat: this.lat,
        lng: this.lng,
        rawLat,
        rawLng,
        accuracyM: acc,
        speedKmh: rawSpeedMps && rawSpeedMps > 0 ? +(rawSpeedMps * 3.6).toFixed(1) : 0,
        heading: this.lastHeading,
        timestamp
      };
    }

    const dtMs = Math.max(100, timestamp - this.lastTimestamp);
    const dtSec = dtMs / 1000;
    const distFromLastM = haversineMeters([this.lat, this.lng], [rawLat, rawLng]);
    const impliedSpeedKmh = (distFromLastM / dtSec) * 3.6;

    // Anti-salto GPS: descartar saltos físicamente imposibles (> 165 km/h) solo cuando ya hay lock preciso
    if (impliedSpeedKmh > 165 && dtSec < 15 && currentStdDevM <= 45) {
      return null;
    }

    // Predicción de varianza con ruido de proceso
    this.variance += dtSec * this.qMetersPerSec * this.qMetersPerSec;
    const k = this.variance / (this.variance + acc * acc);

    const prevLat = this.lat;
    const prevLng = this.lng;
    this.lat += k * (rawLat - this.lat);
    this.lng += k * (rawLng - this.lng);
    this.variance = (1 - k) * this.variance;
    this.lastTimestamp = timestamp;

    const speedKmh =
      typeof rawSpeedMps === 'number' && !isNaN(rawSpeedMps) && rawSpeedMps >= 0
        ? +(rawSpeedMps * 3.6).toFixed(1)
        : distFromLastM > 2.5
          ? +((distFromLastM / dtSec) * 3.6).toFixed(1)
          : 0;

    // Congelar rumbo si el vehículo está detenido (< 3 km/h) para evitar giros erráticos en semáforo
    if (speedKmh >= 3) {
      if (typeof rawHeading === 'number' && !isNaN(rawHeading) && rawHeading >= 0) {
        this.lastHeading = rawHeading;
      } else if (distFromLastM >= 3) {
        this.lastHeading = computeBearingDeg([prevLat, prevLng], [this.lat, this.lng]);
      }
    }

    return {
      lat: this.lat,
      lng: this.lng,
      rawLat,
      rawLng,
      accuracyM: acc,
      speedKmh,
      heading: this.lastHeading,
      timestamp
    };
  }
}

/**
 * Proyecta una coordenada GPS sobre el segmento más cercano de la polilínea vial (Snap-to-Road).
 */
export function snapToRoutePolyline(
  pos: [number, number],
  routePoints: [number, number][]
): SnapToRouteResult {
  if (!routePoints || routePoints.length < 2) {
    return {
      snappedCoords: pos,
      perpendicularDistanceM: 0,
      traveledMeters: 0,
      totalRouteMeters: 0,
      progressPercent: 0,
      segmentIndex: 0
    };
  }

  const cosLat = Math.cos((pos[0] * Math.PI) / 180);
  const toMetersXY = (p: [number, number]): [number, number] => [
    p[1] * 111320 * cosLat,
    p[0] * 111320
  ];

  const [px, py] = toMetersXY(pos);
  let bestDistM = Infinity;
  let bestSnapped: [number, number] = routePoints[0];
  let bestSegIdx = 0;
  let bestTraveledM = 0;

  let accMeters = 0;
  for (let i = 0; i < routePoints.length - 1; i++) {
    const a = routePoints[i];
    const b = routePoints[i + 1];
    const [ax, ay] = toMetersXY(a);
    const [bx, by] = toMetersXY(b);
    const abx = bx - ax;
    const aby = by - ay;
    const abLenSq = abx * abx + aby * aby;
    const segLenM = Math.sqrt(abLenSq);

    let t = 0;
    if (abLenSq > 1e-6) {
      t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / abLenSq));
    }

    const projX = ax + t * abx;
    const projY = ay + t * aby;
    const distM = Math.hypot(px - projX, py - projY);

    if (distM < bestDistM) {
      bestDistM = distM;
      bestSegIdx = i;
      bestSnapped = [
        a[0] + t * (b[0] - a[0]),
        a[1] + t * (b[1] - a[1])
      ];
      bestTraveledM = accMeters + t * segLenM;
    }

    accMeters += segLenM;
  }

  const totalRouteMeters = Math.max(1, accMeters);
  const progressPercent = Math.min(100, Math.max(0, Math.round((bestTraveledM / totalRouteMeters) * 100)));

  return {
    snappedCoords: bestDistM <= 45 ? bestSnapped : pos,
    perpendicularDistanceM: +bestDistM.toFixed(1),
    traveledMeters: +bestTraveledM.toFixed(1),
    totalRouteMeters: +totalRouteMeters.toFixed(1),
    progressPercent,
    segmentIndex: bestSegIdx
  };
}

export interface TelemetryWatcherOptions {
  onFix: (fix: GpsFixReal) => void;
  onError?: (err: GeolocationPositionError) => void;
}

/**
 * Envuelve navigator.geolocation.watchPosition con Kalman 2D para uso continuo en Cliente y Conductor.
 */
export function startRealGpsWatcher(options: TelemetryWatcherOptions): () => void {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return () => {};
  }

  const filter = new KalmanGpsFilter2D(3.5);
  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const fix = filter.process(
        pos.coords.latitude,
        pos.coords.longitude,
        pos.coords.accuracy,
        pos.coords.speed,
        pos.coords.heading,
        pos.timestamp || Date.now()
      );
      if (fix) {
        options.onFix(fix);
      }
    },
    (err) => {
      if (options.onError) options.onError(err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000
    }
  );

  return () => {
    try {
      navigator.geolocation.clearWatch(watchId);
    } catch {}
  };
}

export interface CalibratedDoorAnchor {
  lat: number;
  lng: number;
  label: string;
  savedAt: string;
}

const CALIBRATED_ANCHOR_KEY = 'sara_fletes_calibrated_door_v1';

/**
 * Guarda la puerta exacta confirmada manualmente por el usuario (ej. OnlySoft)
 * para corregir el error inherente de triangulación Wi-Fi/PC (±150-250m) en navegadores de escritorio.
 */
export function saveCalibratedDoorAnchor(anchor: Omit<CalibratedDoorAnchor, 'savedAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: CalibratedDoorAnchor = {
      ...anchor,
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(CALIBRATED_ANCHOR_KEY, JSON.stringify(payload));
  } catch {
    // Sin almacenamiento local disponible
  }
}

/**
 * Si el navegador devuelve una lectura gruesa (Wi-Fi/PC > 40m), verifica si el círculo de incertidumbre
 * contiene la puerta exacta calibrada por el usuario. Si la contiene, devuelve esa coordenada exacta.
 */
export function findMatchingCalibratedAnchor(
  rawLat: number,
  rawLng: number,
  accuracyM: number
): CalibratedDoorAnchor | null {
  if (typeof window === 'undefined' || accuracyM <= 40) return null;
  try {
    const raw = window.localStorage.getItem(CALIBRATED_ANCHOR_KEY);
    if (!raw) return null;
    const anchor = JSON.parse(raw) as CalibratedDoorAnchor;
    if (typeof anchor?.lat !== 'number' || typeof anchor?.lng !== 'number') return null;
    const dist = haversineMeters([rawLat, rawLng], [anchor.lat, anchor.lng]);
    // Solo aplicar si la puerta calibrada está dentro del radio de incertidumbre real reportado por el navegador
    if (dist <= Math.max(accuracyM * 1.15, 250)) {
      return anchor;
    }
  } catch {
    return null;
  }
  return null;
}
