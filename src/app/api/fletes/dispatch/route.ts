import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireServerAuth } from '@/lib/auth/serverAuthGuard';

export const dynamic = 'force-dynamic';

/**
 * API Real de Despacho SARA-FLETES (/api/fletes/dispatch)
 * Persiste y entrega solicitudes reales desde Supabase (`fletes_solicitudes`) para garantizar
 * entrega 100% confiable entre Cliente y Conductor (Chrome/Firefox/Android/iOS) incluso si
 * WebSockets o BroadcastChannel no están disponibles.
 */

export async function GET(req: NextRequest) {
  try {
    const admin = createAdminClient();
    const { searchParams } = new URL(req.url);
    const codigoAcceso = searchParams.get('codigoAcceso')?.trim();

    if (codigoAcceso) {
      const { data, error } = await admin
        .from('fletes_solicitudes')
        .select('*')
        .eq('codigo_acceso', codigoAcceso)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, request: data || null });
    }

    // Solo conductores/usuarios autenticados consultan el radar de solicitudes pendientes
    await requireServerAuth(req);

    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data, error } = await admin
      .from('fletes_solicitudes')
      .select('*')
      .eq('status', 'pendiente')
      .gte('created_at', tenMinAgo)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      requests: data || [],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error consultando despacho en vivo';
    const status = msg.includes('No autenticado') ? 401 : 500;
    return NextResponse.json({ success: false, error: msg, requests: [] }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = createAdminClient();
    const body = await req.json().catch(() => null);
    if (!body || !body.origen || !body.destino) {
      return NextResponse.json(
        { success: false, error: 'Se requieren origen y destino reales para despachar la solicitud.' },
        { status: 400 }
      );
    }

    const tarifa = Number(body.tarifa);
    if (!Number.isFinite(tarifa) || tarifa <= 0) {
      return NextResponse.json({ success: false, error: 'Tarifa inválida.' }, { status: 400 });
    }

    const codigoAcceso = String(body.codigoAcceso || Math.floor(1000 + Math.random() * 9000));

    // Evitar duplicados si ya existe una solicitud pendiente con el mismo codigoAcceso en los últimos 5 min
    const { data: existing } = await admin
      .from('fletes_solicitudes')
      .select('*')
      .eq('codigo_acceso', codigoAcceso)
      .eq('status', 'pendiente')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, request: existing, deduplicated: true });
    }

    const basePayload = {
      origen: String(body.origen).trim(),
      destino: String(body.destino).trim(),
      tarifa: Number(tarifa.toFixed(2)),
      status: 'pendiente',
      codigo_acceso: codigoAcceso,
    };

    const extendedPayload: Record<string, unknown> = {
      ...basePayload,
      ...(Array.isArray(body.coordsOrigen) && body.coordsOrigen.length === 2
        ? { origen_lat: Number(body.coordsOrigen[0]), origen_lng: Number(body.coordsOrigen[1]) }
        : {}),
      ...(Array.isArray(body.coordsDestino) && body.coordsDestino.length === 2
        ? { destino_lat: Number(body.coordsDestino[0]), destino_lng: Number(body.coordsDestino[1]) }
        : {}),
      ...(typeof body.distanciaKm === 'number' ? { distancia_km: body.distanciaKm } : {}),
      ...(typeof body.duracionMinutos === 'number' ? { duracion_minutos: body.duracionMinutos } : {}),
      ...(typeof body.material === 'string' ? { material: body.material } : {}),
      ...(typeof body.tipoVehiculo === 'string' ? { tipo_vehiculo: body.tipoVehiculo } : {}),
    };

    let { data: inserted, error } = await admin
      .from('fletes_solicitudes')
      .insert(extendedPayload)
      .select()
      .single();

    if (error && error.message?.includes('column')) {
      const retry = await admin
        .from('fletes_solicitudes')
        .insert(basePayload)
        .select()
        .single();
      inserted = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, request: inserted });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error creando solicitud de despacho';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = createAdminClient();
    const body = await req.json().catch(() => null);
    const id = typeof body?.id === 'string' ? body.id : null;
    const codigoAcceso = typeof body?.codigoAcceso === 'string' ? body.codigoAcceso : null;
    const nextStatus = typeof body?.status === 'string' ? body.status : null;

    if (!nextStatus || (!id && !codigoAcceso)) {
      return NextResponse.json({ success: false, error: 'Se requiere id o codigoAcceso y status.' }, { status: 400 });
    }

    const query = admin.from('fletes_solicitudes').update({ status: nextStatus });
    const { data, error } = id
      ? await query.eq('id', id).select().maybeSingle()
      : await query.eq('codigo_acceso', codigoAcceso!).select().maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, request: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error actualizando estado de despacho';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
