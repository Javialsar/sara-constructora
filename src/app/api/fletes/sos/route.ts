import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/auth/serverAuthGuard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireServerAuth(req);
    const admin = createAdminClient();

    const body = await req.json().catch(() => null);
    if (!body || typeof body.lat !== 'number' || typeof body.lng !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Se requieren coordenadas GPS reales (lat, lng) para la alerta SOS.' },
        { status: 400 }
      );
    }

    const alertType = ['manual_sos', 'harsh_braking', 'route_deviation', 'prolonged_stop'].includes(body.alertType)
      ? body.alertType
      : 'manual_sos';
    const role = body.role === 'driver' ? 'driver' : 'customer';

    const { data, error } = await admin
      .from('fletes_sos_alerts')
      .insert({
        order_id: typeof body.orderId === 'string' && body.orderId ? body.orderId : null,
        user_id: user.id,
        role,
        alert_type: alertType,
        location: `SRID=4326;POINT(${body.lng} ${body.lat})`,
        lat: body.lat,
        lng: body.lng,
        details: typeof body.details === 'object' && body.details ? body.details : {},
        status: 'OPEN',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      alert: data,
      emergencyPhone: '911',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error registrando alerta SOS';
    const status = message.includes('No autenticado') ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
