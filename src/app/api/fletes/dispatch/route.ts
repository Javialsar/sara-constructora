import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireServerAuth } from '@/lib/auth/serverAuthGuard';

export const dynamic = 'force-dynamic';

// Sin estado en memoria: toda telemetría y despacho se persiste en PostgreSQL + PostGIS
export async function GET(req: NextRequest) {
  try {
    const admin = createAdminClient();
    const { searchParams } = new URL(req.url);
    const codigoAcceso = searchParams.get('codigoAcceso')?.trim();

    if (codigoAcceso) {
      const { data: rows, error } = await admin
        .from('fletes_solicitudes')
        .select('*')
        .eq('codigo_acceso', codigoAcceso)
        .order('updated_at', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      const list = Array.isArray(rows) ? rows : [];
      const priorityOrder = ['completada', 'en_curso', 'aceptada', 'cancelada', 'pendiente'];
      const data =
        list.sort((a, b) => {
          const pa = priorityOrder.indexOf(String(a.status || 'pendiente'));
          const pb = priorityOrder.indexOf(String(b.status || 'pendiente'));
          const ra = pa === -1 ? 99 : pa;
          const rb = pb === -1 ? 99 : pb;
          if (ra !== rb) return ra - rb;
          return (
            new Date(b.updated_at || b.created_at || 0).getTime() -
            new Date(a.updated_at || a.created_at || 0).getTime()
          );
        })[0] || null;

      // Leer telemetría en vivo desde PostGIS (gobee_driver_presence) en lugar de Map en memoria
      let driverTelemetry: {
        lat: number;
        lng: number;
        heading?: number;
        speedKmh?: number;
        updatedAt: number;
      } | null = null;

      if (data?.conductor_placa) {
        const { data: presence } = await admin
          .from('gobee_driver_presence')
          .select('lat, lng, heading, speed_kmh, updated_at')
          .eq('plate', String(data.conductor_placa).toUpperCase())
          .maybeSingle();

        if (presence) {
          driverTelemetry = {
            lat: Number(presence.lat),
            lng: Number(presence.lng),
            heading: Number(presence.heading || 0),
            speedKmh: Number(presence.speed_kmh || 0),
            updatedAt: new Date(presence.updated_at).getTime(),
          };
        }
      }

      return NextResponse.json({
        success: true,
        request: data,
        driverTelemetry,
      });
    }

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
    const id = typeof body?.id === 'string' && body.id.length >= 8 ? body.id : null;
    const codigoAcceso = typeof body?.codigoAcceso === 'string' && body.codigoAcceso ? body.codigoAcceso : null;

    if (!id && !codigoAcceso) {
      return NextResponse.json({ success: false, error: 'Se requiere id o codigoAcceso.' }, { status: 400 });
    }

    // Persistencia de telemetría GPS del conductor en PostGIS (sin Map en memoria)
    if (
      typeof body?.driverLat === 'number' &&
      typeof body?.driverLng === 'number' &&
      Number.isFinite(body.driverLat) &&
      Number.isFinite(body.driverLng)
    ) {
      try {
        const { user } = await requireServerAuth(req);
        const plate = String(body.conductorPlaca || user.user_metadata?.placa || '').trim().toUpperCase();
        if (plate) {
          await admin.rpc('upsert_gobee_driver_presence', {
            p_driver_id: user.id,
            p_driver_name: String(body.conductorNombre || user.user_metadata?.full_name || 'Conductor Gobee'),
            p_plate: plate,
            p_category: String(body.category || 'gobee_go'),
            p_is_online: true,
            p_lat: body.driverLat,
            p_lng: body.driverLng,
            p_heading: typeof body.heading === 'number' ? body.heading : 0,
            p_speed_kmh: typeof body.speedKmh === 'number' ? body.speedKmh : 0,
            p_accuracy_m: typeof body.accuracyM === 'number' ? body.accuracyM : 15,
            p_active_order_id: null,
          });
        }
      } catch {
        // Si es actualización anónima de seguimiento, continuar solo con actualización de estado si existe
      }

      if (!body.status) {
        return NextResponse.json({ success: true, telemetryUpdated: true, storage: 'postgis' });
      }
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (typeof body?.status === 'string') {
      updatePayload.status = body.status;
      if (body.status === 'en_curso') updatePayload.started_at = new Date().toISOString();
      if (body.status === 'completada') updatePayload.completed_at = new Date().toISOString();
    }
    if (typeof body?.conductorNombre === 'string') updatePayload.conductor_nombre = body.conductorNombre;
    if (typeof body?.conductorPlaca === 'string') updatePayload.conductor_placa = body.conductorPlaca;
    if (typeof body?.conductorTelefono === 'string') updatePayload.conductor_telefono = body.conductorTelefono;
    if (typeof body?.vehiculoNombre === 'string') updatePayload.vehiculo_nombre = body.vehiculoNombre;
    if (typeof body?.tarifaAcordada === 'number') updatePayload.tarifa_acordada = body.tarifaAcordada;

    const runUpdate = async (payload: Record<string, unknown>) => {
      const q = admin.from('fletes_solicitudes').update(payload);
      return codigoAcceso
        ? q.eq('codigo_acceso', codigoAcceso).select()
        : q.eq('id', id!).select();
    };

    let { data, error } = await runUpdate(updatePayload);
    if (error && error.message?.includes('column') && typeof body?.status === 'string') {
      const retry = await runUpdate({ status: body.status });
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const updatedRow = Array.isArray(data) ? data[0] || null : data;
    return NextResponse.json({ success: true, request: updatedRow });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error actualizando estado de despacho';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
