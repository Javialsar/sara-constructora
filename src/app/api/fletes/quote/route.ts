import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { GOBEE_CATEGORY_MAP, type GobeeCategoryId, type GobeeServerQuote } from '@/lib/gobee/gobeeTypes';

export const dynamic = 'force-dynamic';

const VALID_CATEGORIES = new Set<GobeeCategoryId>(['gobee_go', 'gobee_xl', 'gobee_express', 'gobee_cargo']);

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Number((2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(3));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Payload inválido.' }, { status: 400 });
    }

    const category = String(body.category || 'gobee_go') as GobeeCategoryId;
    if (!VALID_CATEGORIES.has(category)) {
      return NextResponse.json({ success: false, error: 'Categoría Gobee inválida.' }, { status: 400 });
    }

    const originLat = Number(body.originLat);
    const originLng = Number(body.originLng);
    const destLat = Number(body.destLat);
    const destLng = Number(body.destLng);

    if (
      !Number.isFinite(originLat) ||
      !Number.isFinite(originLng) ||
      !Number.isFinite(destLat) ||
      !Number.isFinite(destLng)
    ) {
      return NextResponse.json({ success: false, error: 'Coordenadas origen/destino inválidas.' }, { status: 400 });
    }

    const distanceKm = body.distanceKm !== undefined ? Number(body.distanceKm) : null;
    const weightTon = Number(body.weightTon) || 0;
    const backhaul = Boolean(body.backhaul);

    // 1. Cálculo atómico en PostgreSQL / PostGIS vía RPC calculate_gobee_fare
    const admin = createAdminClient();
    const { data: rpcData, error: rpcError } = await admin.rpc('calculate_gobee_fare', {
      p_category: category,
      p_origin_lat: originLat,
      p_origin_lng: originLng,
      p_dest_lat: destLat,
      p_dest_lng: destLng,
      p_distance_km: Number.isFinite(distanceKm) ? distanceKm : null,
      p_weight_ton: weightTon,
      p_backhaul: backhaul,
    });

    if (!rpcError && rpcData) {
      const quote: GobeeServerQuote = {
        category,
        distanceKm: Number(rpcData.distance_km),
        durationMin: Number(rpcData.duration_min),
        fixedFareUSD: Number(rpcData.fixed_fare_usd),
        minBidUSD: Number(rpcData.min_bid_usd),
        maxBidUSD: Number(rpcData.max_bid_usd),
        commissionRate: Number(rpcData.commission_rate),
        driverNetUSD: Number(rpcData.driver_net_usd),
        source: 'rpc_postgis',
      };
      return NextResponse.json({ success: true, quote });
    }

    // 2. Respaldo determinístico en servidor (misma fórmula exacta que el RPC)
    const geodesicKm = haversineKm(originLat, originLng, destLat, destLng);
    const effectiveKm = Math.max(
      Number.isFinite(distanceKm) && (distanceKm as number) > 0 ? (distanceKm as number) : geodesicKm * 1.25,
      Number((geodesicKm * 1.15).toFixed(2)),
      0.5
    );
    const cfg = GOBEE_CATEGORY_MAP[category];
    const weightSurcharge = category === 'gobee_cargo' ? Math.max(0, weightTon) * 1.25 : 0;
    let rawFare = cfg.baseFareUSD + effectiveKm * cfg.perKmUSD + weightSurcharge;
    if (backhaul) rawFare *= 0.8;

    const fixedFareUSD = Number(Math.max(cfg.minFareUSD, rawFare).toFixed(2));
    const quote: GobeeServerQuote = {
      category,
      distanceKm: Number(effectiveKm.toFixed(2)),
      durationMin: Math.max(4, Math.ceil(effectiveKm * 2.4)),
      fixedFareUSD,
      minBidUSD: Number(Math.max(cfg.minFareUSD, fixedFareUSD * 0.85).toFixed(2)),
      maxBidUSD: Number((fixedFareUSD * 1.35).toFixed(2)),
      commissionRate: cfg.commissionRate,
      driverNetUSD: Number((fixedFareUSD * (1 - cfg.commissionRate)).toFixed(2)),
      source: 'local_estimate',
    };

    return NextResponse.json({ success: true, quote });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error calculando tarifa Gobee';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
