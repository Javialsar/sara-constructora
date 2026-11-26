import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/auth/serverAuthGuard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireServerAuth(req);
    const admin = createAdminClient();

    const { data, error } = await admin
      .from('fletes_backhaul_offers')
      .select('id, source_order_id, driver_id, vehicle_type, origin_label, dest_label, discount_pct, expires_at, status, created_at')
      .eq('status', 'ACTIVE')
      .gt('expires_at', new Date().toISOString())
      .order('discount_pct', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, offers: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error consultando ofertas Backhaul';
    const status = message.includes('No autenticado') ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireServerAuth(req);
    const admin = createAdminClient();

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Payload inválido.' }, { status: 400 });
    }

    const {
      sourceOrderId,
      vehicleType,
      originLabel,
      destLabel,
      originLat,
      originLng,
      destLat,
      destLng,
      discountPct = 25,
    } = body;

    if (!originLabel || !destLabel || typeof originLat !== 'number' || typeof originLng !== 'number' || typeof destLat !== 'number' || typeof destLng !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Se requieren etiquetas y coordenadas reales de origen y destino de retorno.' },
        { status: 400 }
      );
    }

    const clampedDiscount = Math.min(30, Math.max(5, Number(discountPct) || 25));
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    const { data, error } = await admin
      .from('fletes_backhaul_offers')
      .insert({
        source_order_id: sourceOrderId || null,
        driver_id: user.id,
        vehicle_type: vehicleType || 'camion_3_5t',
        origin_label: String(originLabel).trim(),
        dest_label: String(destLabel).trim(),
        origin_geog: `SRID=4326;POINT(${originLng} ${originLat})`,
        dest_geog: `SRID=4326;POINT(${destLng} ${destLat})`,
        discount_pct: clampedDiscount,
        expires_at: expiresAt,
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, offer: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error creando ventana Backhaul';
    const status = message.includes('No autenticado') ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
