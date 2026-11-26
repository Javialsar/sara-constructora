/**
 * Snap-to-Roads en tiempo real usando OSRM (nearest/v1/driving).
 * Ajusta coordenadas GPS filtradas a la calzada vial real.
 */

export interface SnappedCoordinate {
  lat: number;
  lng: number;
  roadName: string | null;
  snapped: boolean;
  snapDistanceMeters: number;
}

const OSRM_BASE_URL =
  process.env.NEXT_PUBLIC_OSRM_BASE_URL || 'https://router.project-osrm.org';

export async function snapCoordinateToRoad(
  lat: number,
  lng: number,
  timeoutMs = 2500
): Promise<SnappedCoordinate> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${OSRM_BASE_URL}/nearest/v1/driving/${lng.toFixed(6)},${lat.toFixed(6)}?number=1`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      return { lat, lng, roadName: null, snapped: false, snapDistanceMeters: 0 };
    }
    const data = await res.json();
    const wp = data?.waypoints?.[0];
    if (wp?.location && Array.isArray(wp.location) && wp.location.length === 2) {
      const [snappedLng, snappedLat] = wp.location;
      const dist = typeof wp.distance === 'number' ? wp.distance : 0;
      // Solo ajustar si el punto vial está a menos de 50 metros (evita saltar a otra avenida paralela)
      if (dist <= 50) {
        return {
          lat: snappedLat,
          lng: snappedLng,
          roadName: typeof wp.name === 'string' && wp.name.length > 0 ? wp.name : null,
          snapped: true,
          snapDistanceMeters: Number(dist.toFixed(2)),
        };
      }
    }
  } catch {
    // Fallback silencioso a coordenada filtrada por Kalman en caso de latencia/offline
  } finally {
    clearTimeout(timer);
  }

  return { lat, lng, roadName: null, snapped: false, snapDistanceMeters: 0 };
}
