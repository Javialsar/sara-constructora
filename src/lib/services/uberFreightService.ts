// ============================================================================
// GOBEE ("by Grupo Sara") — SERVICIO DE DESPACHO REALTIME + POSTGIS
// Reemplaza todo estado en memoria por:
//   1. Supabase Realtime Broadcast (canales gobee:dispatch y tracking:<orderId>)
//   2. Tablas y RPCs PostGIS (gobee_driver_presence, fletes_orders, calculate_gobee_fare)
// ============================================================================

import type { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { GobeeCategoryId, GobeeServerQuote } from '@/lib/gobee/gobeeTypes';
import { GOBEE_CATEGORY_MAP } from '@/lib/gobee/gobeeTypes';

export interface GobeeBroadcastEvent {
  type:
    | 'TRIP_REQUESTED'
    | 'TRIP_CANCELLED'
    | 'DRIVER_OFFER'
    | 'TRIP_ACCEPTED'
    | 'TRIP_STARTED'
    | 'TRIP_COMPLETED'
    | 'DRIVER_GPS'
    | 'CHAT_MESSAGE'
    | 'SOS_TRIGGERED';
  orderId: string;
  payload: Record<string, unknown>;
  sentAt: number;
}

export interface NearbyGobeeDriver {
  driverId: string;
  driverName: string;
  plate: string;
  category: GobeeCategoryId;
  lat: number;
  lng: number;
  heading: number;
  speedKmh: number;
  rating: number;
  distanceM: number;
}

const DISPATCH_CHANNEL_NAME = 'gobee:dispatch';

export class UberFreightService {
  /**
   * Suscribe a eventos de despacho global en Supabase Realtime Broadcast.
   * Sin estado en memoria: el canal vive únicamente durante el ciclo de vida del suscriptor.
   */
  static subscribeDispatch(
    onEvent: (event: GobeeBroadcastEvent) => void
  ): () => void {
    if (typeof window === 'undefined') return () => {};
    const supabase = createClient();
    const channel: RealtimeChannel = supabase
      .channel(DISPATCH_CHANNEL_NAME, {
        config: { broadcast: { self: false, ack: false } },
      })
      .on('broadcast', { event: 'gobee_event' }, (msg) => {
        const evt = (msg?.payload || msg) as GobeeBroadcastEvent;
        if (evt && evt.type) {
          onEvent(evt);
        }
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }

  /**
   * Suscribe al canal privado de rastreo de un viaje específico (tracking:<orderId>).
   */
  static subscribeTripTracking(
    orderId: string,
    onEvent: (event: GobeeBroadcastEvent) => void
  ): () => void {
    if (typeof window === 'undefined' || !orderId) return () => {};
    const supabase = createClient();
    const channel: RealtimeChannel = supabase
      .channel(`tracking:${orderId}`, {
        config: { broadcast: { self: false, ack: false } },
      })
      .on('broadcast', { event: 'gobee_event' }, (msg) => {
        const evt = (msg?.payload || msg) as GobeeBroadcastEvent;
        if (evt && evt.type) {
          onEvent(evt);
        }
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }

  /**
   * Publica un evento en Supabase Realtime Broadcast (despacho global o canal del viaje).
   */
  static async broadcastEvent(
    event: Omit<GobeeBroadcastEvent, 'sentAt'>,
    scope: 'dispatch' | 'tracking' = 'dispatch'
  ): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      const supabase = createClient();
      const topic = scope === 'tracking' ? `tracking:${event.orderId}` : DISPATCH_CHANNEL_NAME;
      const channel = supabase.channel(topic, {
        config: { broadcast: { self: false, ack: true } },
      });

      await new Promise<void>((resolve) => {
        const timeout = setTimeout(resolve, 1500);
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            clearTimeout(timeout);
            resolve();
          }
        });
      });

      const res = await channel.send({
        type: 'broadcast',
        event: 'gobee_event',
        payload: { ...event, sentAt: Date.now() },
      });

      void supabase.removeChannel(channel);
      return res === 'ok';
    } catch {
      return false;
    }
  }

  /**
   * Calcula tarifa oficial en el servidor mediante RPC PostGIS `calculate_gobee_fare`.
   */
  static async quoteFareServer(params: {
    category: GobeeCategoryId;
    originLat: number;
    originLng: number;
    destLat: number;
    destLng: number;
    distanceKm?: number;
    weightTon?: number;
    backhaul?: boolean;
  }): Promise<GobeeServerQuote> {
    try {
      const res = await fetch('/api/fletes/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.quote) {
          return data.quote as GobeeServerQuote;
        }
      }
    } catch {
      // Fallback determinístico si hay intermitencia de red
    }

    const cfg = GOBEE_CATEGORY_MAP[params.category];
    const dist = Math.max(0.5, Number(params.distanceKm) || 2.0);
    const weightExtra = params.category === 'gobee_cargo' ? Math.max(0, Number(params.weightTon) || 0) * 1.25 : 0;
    let raw = cfg.baseFareUSD + dist * cfg.perKmUSD + weightExtra;
    if (params.backhaul) raw *= 0.8;
    const fixed = Number(Math.max(cfg.minFareUSD, raw).toFixed(2));
    return {
      category: params.category,
      distanceKm: Number(dist.toFixed(2)),
      durationMin: Math.max(4, Math.ceil(dist * 2.4)),
      fixedFareUSD: fixed,
      minBidUSD: Number(Math.max(cfg.minFareUSD, fixed * 0.85).toFixed(2)),
      maxBidUSD: Number((fixed * 1.35).toFixed(2)),
      commissionRate: cfg.commissionRate,
      driverNetUSD: Number((fixed * (1 - cfg.commissionRate)).toFixed(2)),
      source: 'local_estimate',
    };
  }

  /**
   * Consulta conductores Gobee cercanos en PostGIS (ST_DWithin).
   */
  static async findNearbyDrivers(
    lat: number,
    lng: number,
    radiusMeters = 5000,
    category?: GobeeCategoryId
  ): Promise<NearbyGobeeDriver[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc('find_nearby_gobee_drivers', {
        p_lat: lat,
        p_lng: lng,
        p_radius_m: radiusMeters,
        p_category: category || null,
      });

      if (error || !Array.isArray(data)) return [];

      return data.map((row: Record<string, unknown>) => ({
        driverId: String(row.driver_id || ''),
        driverName: String(row.driver_name || 'Conductor Gobee'),
        plate: String(row.plate || ''),
        category: (row.category as GobeeCategoryId) || 'gobee_go',
        lat: Number(row.lat || 0),
        lng: Number(row.lng || 0),
        heading: Number(row.heading || 0),
        speedKmh: Number(row.speed_kmh || 0),
        rating: Number(row.rating || 4.9),
        distanceM: Number(row.distance_m || 0),
      }));
    } catch {
      return [];
    }
  }

  /**
   * Actualiza presencia y ubicación GPS del conductor en PostGIS.
   */
  static async upsertDriverPresence(params: {
    driverId: string;
    driverName: string;
    plate: string;
    category: GobeeCategoryId;
    isOnline: boolean;
    lat: number;
    lng: number;
    heading?: number;
    speedKmh?: number;
    accuracyM?: number;
    activeOrderId?: string | null;
  }): Promise<boolean> {
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc('upsert_gobee_driver_presence', {
        p_driver_id: params.driverId,
        p_driver_name: params.driverName,
        p_plate: params.plate,
        p_category: params.category,
        p_is_online: params.isOnline,
        p_lat: params.lat,
        p_lng: params.lng,
        p_heading: params.heading ?? 0,
        p_speed_kmh: params.speedKmh ?? 0,
        p_accuracy_m: params.accuracyM ?? 15,
        p_active_order_id: params.activeOrderId ?? null,
      });
      return !error;
    } catch {
      return false;
    }
  }
}

export default UberFreightService;
