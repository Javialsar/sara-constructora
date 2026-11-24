import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * GET /api/fletes/ubicaciones?lat=...&lng=...&radiusKm=25
 * Devuelve ÚNICAMENTE conductores reales que hayan reportado telemetría GPS en los últimos 5 minutos.
 * Cero datos ficticios ni vehículos inventados.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const radiusKm = Math.min(200, Math.max(1, parseFloat(searchParams.get('radiusKm') || '25')));
    const plate = searchParams.get('plate')?.trim();

    const admin = await createSupabaseAdminClient();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    let query = admin
      .from('fletes_ubicaciones')
      .select('placa, conductor_id, driver_name, tipo_vehiculo, solicitud_id, token_rastreo, disponible, lat, lng, accuracy_m, speed_kmh, heading, rating, billetera, updated_at')
      .gte('updated_at', fiveMinutesAgo);

    if (plate) {
      query = query.eq('placa', plate);
    } else {
      query = query.eq('disponible', true);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ drivers: [], error: error.message }, { status: 200 });
    }

    let drivers = (data || []).filter(
      (d: any) => typeof d.lat === 'number' && typeof d.lng === 'number'
    );

    if (!isNaN(lat) && !isNaN(lng) && !plate) {
      drivers = drivers
        .map((d: any) => ({
          ...d,
          distanceKm: +haversineKm(lat, lng, d.lat, d.lng).toFixed(2)
        }))
        .filter((d: any) => d.distanceKm <= radiusKm)
        .sort((a: any, b: any) => a.distanceKm - b.distanceKm);
    }

    return NextResponse.json({ drivers });
  } catch (err: any) {
    return NextResponse.json({ drivers: [], error: err?.message || 'Error consultando ubicaciones' }, { status: 500 });
  }
}

/**
 * POST /api/fletes/ubicaciones
 * Persiste una lectura GPS real del conductor en public.fletes_ubicaciones.
 * Valida rangos geográficos de Ecuador y precisión GPS razonable.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    const placa = String(body.plate || body.placa || '').trim().toUpperCase();
    const lat = Number(body.lat);
    const lng = Number(body.lng);

    if (!placa || placa.length < 3 || placa.length > 20 || isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: 'Placa y coordenadas válidas son obligatorias' }, { status: 400 });
    }

    // Validación de caja geográfica de Ecuador (continental + Galápagos)
    if (lat < -5.5 || lat > 2.0 || lng < -92.0 || lng > -74.5) {
      return NextResponse.json({ error: 'Coordenadas fuera de rango geográfico de Ecuador' }, { status: 400 });
    }

    const admin = await createSupabaseAdminClient();
    const { error } = await admin.from('fletes_ubicaciones').upsert(
      {
        placa,
        conductor_id: user?.id || null,
        driver_name: String(body.driverName || body.driver_name || user?.user_metadata?.full_name || 'Conductor SARA').slice(0, 120),
        tipo_vehiculo: String(body.tipoVehiculo || body.tipo_vehiculo || 'PICKUP_1T').slice(0, 40),
        token_rastreo: body.tokenRastreo ? String(body.tokenRastreo).slice(0, 80) : null,
        disponible: body.disponible !== false,
        lat,
        lng,
        accuracy_m: Number.isFinite(Number(body.accuracy)) ? Math.min(500, Math.max(1, Number(body.accuracy))) : 15,
        speed_kmh: Number.isFinite(Number(body.speed)) ? Math.min(200, Math.max(0, Number(body.speed))) : 0,
        heading: Number.isFinite(Number(body.heading)) ? ((Number(body.heading) % 360) + 360) % 360 : 0,
        rating: Number.isFinite(Number(body.rating)) ? Math.min(5, Math.max(1, Number(body.rating))) : 5.0,
        billetera: Number.isFinite(Number(body.billetera)) ? Math.max(0, Number(body.billetera)) : 0,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'placa' }
    );

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Error guardando ubicación' }, { status: 500 });
  }
}
