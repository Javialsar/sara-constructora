'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  GpsKalmanFilter,
  enqueueTelemetryPoint,
  flushTelemetryQueue,
  isWithinGeofence,
  snapCoordinateToRoad,
  RideCheckMonitor,
  haversineDistanceMeters,
  type GeoPoint,
  type RideCheckAnomaly,
} from '@/lib/telemetry';

export type OrderTripState =
  | 'PENDING'
  | 'ACCEPTED'
  | 'EN_ROUTE_PICKUP'
  | 'ARRIVED_PICKUP'
  | 'LOADING_OR_BOARDING'
  | 'IN_TRANSIT'
  | 'ARRIVED_DROPOFF'
  | 'EPOD_VERIFIED'
  | 'COMPLETED';

export interface TelemetryBroadcastPayload {
  orderId: string;
  lat: number;
  lng: number;
  speedKmh: number;
  heading: number;
  accuracyM: number;
  roadName: string | null;
  isSnapped: boolean;
  timestamp: string;
}

interface UseSaraTelemetryOptions {
  orderId: string | null;
  tripState: OrderTripState;
  enabled: boolean;
  pickupCoords?: GeoPoint | null;
  dropoffCoords?: GeoPoint | null;
  plannedRoute?: GeoPoint[];
  onGeofenceTransition?: (nextState: 'ARRIVED_PICKUP' | 'ARRIVED_DROPOFF', distanceMeters: number) => void;
  onRideCheckAnomaly?: (anomaly: RideCheckAnomaly) => void;
}

export function useSaraTelemetry(options: UseSaraTelemetryOptions) {
  const {
    orderId,
    tripState,
    enabled,
    pickupCoords,
    dropoffCoords,
    plannedRoute,
    onGeofenceTransition,
    onRideCheckAnomaly,
  } = options;

  const [lastPosition, setLastPosition] = useState<TelemetryBroadcastPayload | null>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [offlinePendingCount, setOfflinePendingCount] = useState(0);
  const [lastAnomaly, setLastAnomaly] = useState<RideCheckAnomaly | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const kalmanRef = useRef(new GpsKalmanFilter(3.0));
  const rideCheckRef = useRef(new RideCheckMonitor());
  const lastBroadcastMsRef = useRef(0);
  const lastBroadcastPosRef = useRef<GeoPoint | null>(null);
  const lastDbPersistMsRef = useRef(0);
  const currentPosRef = useRef<GeoPoint | null>(null);
  const wakeLockSentinelRef = useRef<{ release: () => Promise<void> } | null>(null);
  const triggeredPickupRef = useRef(false);
  const triggeredDropoffRef = useRef(false);

  // Enviar lote a /api/fletes/telemetry (PostGIS)
  const persistToPostGis = useCallback(
    async (
      points: Array<{
        orderId: string;
        lat: number;
        lng: number;
        speedKmh: number;
        heading: number;
        accuracyM: number;
        isSnapped: boolean;
        eventType: 'HEARTBEAT' | 'ARRIVED_PICKUP' | 'ARRIVED_DROPOFF' | 'OFFLINE_SYNC' | 'RIDECHECK_ANOMALY';
        recordedAt: string;
      }>
    ): Promise<boolean> => {
      try {
        const res = await fetch('/api/fletes/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points }),
        });
        return res.ok;
      } catch {
        return false;
      }
    },
    []
  );

  // Wake Lock durante estados activos
  useEffect(() => {
    const activeWakeStates: OrderTripState[] = [
      'EN_ROUTE_PICKUP',
      'LOADING_OR_BOARDING',
      'IN_TRANSIT',
    ];
    const shouldLock = enabled && activeWakeStates.includes(tripState);

    let cancelled = false;
    async function acquireWakeLock() {
      if (!shouldLock || typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
        return;
      }
      try {
        const nav = navigator as Navigator & {
          wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> };
        };
        const sentinel = await nav.wakeLock?.request('screen');
        if (!cancelled && sentinel) {
          wakeLockSentinelRef.current = sentinel;
          setWakeLockActive(true);
        }
      } catch {
        setWakeLockActive(false);
      }
    }

    if (shouldLock) {
      acquireWakeLock();
    } else if (wakeLockSentinelRef.current) {
      wakeLockSentinelRef.current.release().catch(() => {});
      wakeLockSentinelRef.current = null;
      setWakeLockActive(false);
    }

    return () => {
      cancelled = true;
      if (wakeLockSentinelRef.current) {
        wakeLockSentinelRef.current.release().catch(() => {});
        wakeLockSentinelRef.current = null;
        setWakeLockActive(false);
      }
    };
  }, [enabled, tripState]);

  // Monitor de conectividad y vaciado automático de cola IndexedDB
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOnline(navigator.onLine);

    const handleOnline = async () => {
      setIsOnline(true);
      const { remaining } = await flushTelemetryQueue(async (batch) =>
        persistToPostGis(batch.map((b) => ({ ...b, eventType: 'OFFLINE_SYNC' })))
      );
      setOfflinePendingCount(remaining);
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [persistToPostGis]);

  // RideCheck DeviceMotionEvent (frenado brusco)
  useEffect(() => {
    if (!enabled || tripState !== 'IN_TRANSIT' || typeof window === 'undefined') return;

    const onMotion = (ev: DeviceMotionEvent) => {
      const anomaly = rideCheckRef.current.evaluateMotion(ev, currentPosRef.current);
      if (anomaly) {
        setLastAnomaly(anomaly);
        onRideCheckAnomaly?.(anomaly);
      }
    };

    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
  }, [enabled, tripState, onRideCheckAnomaly]);

  // Ciclo principal GPS + Kalman + OSRM Snap + Broadcast privado + PostGIS cada 30s
  useEffect(() => {
    if (!enabled || !orderId || typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      return;
    }

    const supabase = createClient();
    const channel = supabase.channel(`tracking:${orderId}`, {
      config: { broadcast: { self: false }, private: true },
    });
    channel.subscribe();

    kalmanRef.current.reset();
    rideCheckRef.current.reset();
    triggeredPickupRef.current = false;
    triggeredDropoffRef.current = false;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        setGpsError(null);
        const filtered = kalmanRef.current.process({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speedMps: pos.coords.speed,
          heading: pos.coords.heading,
          timestamp: pos.timestamp || Date.now(),
        });

        if (!filtered.accepted) return;

        const snapped = navigator.onLine
          ? await snapCoordinateToRoad(filtered.lat, filtered.lng)
          : { lat: filtered.lat, lng: filtered.lng, roadName: null, snapped: false, snapDistanceMeters: 0 };

        const currentPoint: GeoPoint = { lat: snapped.lat, lng: snapped.lng };
        currentPosRef.current = currentPoint;

        const now = Date.now();
        const isoNow = new Date(now).toISOString();

        // Geofencing <= 40m
        if (pickupCoords && tripState === 'EN_ROUTE_PICKUP' && !triggeredPickupRef.current) {
          const check = isWithinGeofence(currentPoint, pickupCoords, 40);
          if (check.inside) {
            triggeredPickupRef.current = true;
            onGeofenceTransition?.('ARRIVED_PICKUP', check.distanceMeters);
          }
        }
        if (dropoffCoords && tripState === 'IN_TRANSIT' && !triggeredDropoffRef.current) {
          const check = isWithinGeofence(currentPoint, dropoffCoords, 40);
          if (check.inside) {
            triggeredDropoffRef.current = true;
            onGeofenceTransition?.('ARRIVED_DROPOFF', check.distanceMeters);
          }
        }

        // RideCheck GPS (desvío > 400m / detención > 3 min)
        const gpsAnomaly = rideCheckRef.current.evaluateGps({
          currentPos: currentPoint,
          speedKmh: filtered.speedKmh,
          inTransit: tripState === 'IN_TRANSIT',
          plannedRoute,
        });
        if (gpsAnomaly) {
          setLastAnomaly(gpsAnomaly);
          onRideCheckAnomaly?.(gpsAnomaly);
        }

        // Frecuencia adaptativa de Broadcast: 15s detenido (<3 km/h), 3s o 25m en movimiento
        const elapsedSinceBroadcast = now - lastBroadcastMsRef.current;
        const distSinceBroadcast = lastBroadcastPosRef.current
          ? haversineDistanceMeters(lastBroadcastPosRef.current, currentPoint)
          : Infinity;
        const isStopped = filtered.speedKmh < 3;
        const shouldBroadcast = isStopped
          ? elapsedSinceBroadcast >= 15000
          : elapsedSinceBroadcast >= 3000 || distSinceBroadcast >= 25;

        const payload: TelemetryBroadcastPayload = {
          orderId,
          lat: snapped.lat,
          lng: snapped.lng,
          speedKmh: filtered.speedKmh,
          heading: filtered.heading,
          accuracyM: Number(filtered.accuracy.toFixed(1)),
          roadName: snapped.roadName,
          isSnapped: snapped.snapped,
          timestamp: isoNow,
        };

        setLastPosition(payload);

        if (shouldBroadcast && navigator.onLine) {
          lastBroadcastMsRef.current = now;
          lastBroadcastPosRef.current = currentPoint;
          channel.send({
            type: 'broadcast',
            event: 'driver_location',
            payload,
          });
        }

        // Persistencia histórica PostGIS cada 30 segundos (auditoría MTOP) o cola offline IndexedDB
        if (now - lastDbPersistMsRef.current >= 30000) {
          lastDbPersistMsRef.current = now;
          const record = {
            orderId,
            lat: snapped.lat,
            lng: snapped.lng,
            speedKmh: filtered.speedKmh,
            heading: filtered.heading,
            accuracyM: Number(filtered.accuracy.toFixed(1)),
            isSnapped: snapped.snapped,
            eventType: 'HEARTBEAT' as const,
            recordedAt: isoNow,
          };

          if (navigator.onLine) {
            const ok = await persistToPostGis([record]);
            if (!ok) {
              await enqueueTelemetryPoint(record).catch(() => {});
              setOfflinePendingCount((c) => c + 1);
            }
          } else {
            await enqueueTelemetryPoint(record).catch(() => {});
            setOfflinePendingCount((c) => c + 1);
          }
        }
      },
      (err) => {
        setGpsError(err.message || 'No se pudo obtener señal GPS real');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      supabase.removeChannel(channel);
    };
  }, [
    enabled,
    orderId,
    tripState,
    pickupCoords,
    dropoffCoords,
    plannedRoute,
    onGeofenceTransition,
    onRideCheckAnomaly,
    persistToPostGis,
  ]);

  return {
    lastPosition,
    wakeLockActive,
    isOnline,
    offlinePendingCount,
    lastAnomaly,
    gpsError,
  };
}
