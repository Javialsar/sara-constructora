/**
 * Motor de Geofencing Haversine (<= 40m) y detección de desvíos (> 400m).
 */

export interface GeoPoint {
  lat: number;
  lng: number;
}

export const GEOFENCE_RADIUS_METERS = 40;
export const ROUTE_DEVIATION_THRESHOLD_METERS = 400;

export function haversineDistanceMeters(a: GeoPoint, b: GeoPoint): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinLng * sinLng;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function isWithinGeofence(
  current: GeoPoint,
  target: GeoPoint,
  radiusMeters = GEOFENCE_RADIUS_METERS
): { inside: boolean; distanceMeters: number } {
  const distanceMeters = haversineDistanceMeters(current, target);
  return {
    inside: distanceMeters <= radiusMeters,
    distanceMeters: Number(distanceMeters.toFixed(2)),
  };
}

/**
 * Calcula la distancia mínima de un punto GPS respecto a la polilínea de ruta planificada.
 */
export function minDistanceToPolylineMeters(point: GeoPoint, polyline: GeoPoint[]): number {
  if (!polyline || polyline.length === 0) return 0;
  let minDist = Infinity;
  for (let i = 0; i < polyline.length; i++) {
    const d = haversineDistanceMeters(point, polyline[i]);
    if (d < minDist) minDist = d;
  }
  return Number(minDist.toFixed(2));
}
