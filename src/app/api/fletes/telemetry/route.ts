import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/auth/serverAuthGuard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireServerAuth(req);
    const admin = createAdminClient();

    const body = await req.json().catch(() => null);
    const points = Array.isArray(body?.points) ? body.points : [];

    if (points.length === 0 || points.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Se requiere entre 1 y 100 puntos de telemetría.' },
        { status: 400 }
      );
    }

    const rows = points
      .filter(
        (p: Record<string, unknown>) =>
          typeof p.orderId === 'string' &&
          typeof p.lat === 'number' &&
          typeof p.lng === 'number' &&
          Number.isFinite(p.lat) &&
          Number.isFinite(p.lng)
      )
      .map((p: Record<string, unknown>) => ({
        order_id: String(p.orderId),
        driver_id: user.id,
        location: `SRID=4326;POINT(${p.lng} ${p.lat})`,
        lat: Number(p.lat),
        lng: Number(p.lng),
        speed_kmh: Number(p.speedKmh) || 0,
        heading: Number(p.heading) || 0,
        accuracy_m: Number(p.accuracyM) || 0,
        is_snapped: Boolean(p.isSnapped),
        event_type:
          typeof p.eventType === 'string' &&
          ['HEARTBEAT', 'ARRIVED_PICKUP', 'ARRIVED_DROPOFF', 'OFFLINE_SYNC', 'RIDECHECK_ANOMALY'].includes(
            p.eventType
          )
            ? p.eventType
            : 'HEARTBEAT',
        recorded_at: typeof p.recordedAt === 'string' ? p.recordedAt : new Date().toISOString(),
      }));

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Ningún punto GPS válido en el lote.' }, { status: 400 });
    }

    const { error } = await admin.from('fletes_telemetry_logs').insert(rows);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, inserted: rows.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error guardando telemetría PostGIS';
    const status = message.includes('No autenticado') ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
