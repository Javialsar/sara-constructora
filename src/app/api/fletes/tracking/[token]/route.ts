import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

function maskPhone(phone?: string | null): string {
  if (!phone) return '+593 *** ** **';
  const digits = phone.replace(/\s+/g, '');
  if (digits.length <= 4) return '***';
  return `${digits.slice(0, 4)} *** **${digits.slice(-2)}`;
}

/**
 * GET /api/fletes/tracking/[token]
 * Fuente autoritativa de rastreo público Zero-Login desde PostgreSQL.
 * Devuelve estado del viaje, coordenadas reales, polilínea y última posición GPS del conductor.
 * Nunca expone el teléfono real sin verificación de PIN.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const cleanToken = (token || '').trim();
    if (!cleanToken || cleanToken.length > 100) {
      return NextResponse.json({ error: 'Token de rastreo inválido' }, { status: 400 });
    }

    const admin = await createSupabaseAdminClient();

    // Buscar por token_rastreo o por UUID si el enlace usó el id directamente
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanToken);
    let query = admin
      .from('fletes_solicitudes')
      .select(
        'id, token_rastreo, origen, destino, origen_lat, origen_lng, destino_lat, destino_lng, coordenadas_ruta, distancia_km, duracion_minutos, material, peso_ton, status, conductor_nombre, conductor_placa, conductor_telefono, vehiculo_nombre, tarifa, tarifa_acordada, started_at, completed_at, updated_at'
      );

    query = isUuid ? query.or(`token_rastreo.eq.${cleanToken},id.eq.${cleanToken}`) : query.eq('token_rastreo', cleanToken);

    const { data: solicitud, error } = await query.maybeSingle();

    if (error) {
      return NextResponse.json({ found: false, error: 'Error consultando telemetría' }, { status: 500 });
    }

    if (!solicitud) {
      return NextResponse.json({ found: false }, { status: 404 });
    }

    // Consultar última telemetría GPS real del conductor asignado
    let liveLocation: {
      lat: number;
      lng: number;
      accuracy_m: number;
      speed_kmh: number;
      heading: number;
      updated_at: string;
    } | null = null;

    if (solicitud.conductor_placa) {
      const { data: loc } = await admin
        .from('fletes_ubicaciones')
        .select('lat, lng, accuracy_m, speed_kmh, heading, updated_at')
        .eq('placa', solicitud.conductor_placa)
        .maybeSingle();

      if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
        liveLocation = loc;
      }
    }

    const normalizedStatus =
      solicitud.status === 'completado' || solicitud.status === 'completed'
        ? 'completed'
        : solicitud.status === 'en_transito' || solicitud.status === 'in_transit'
          ? 'in_transit'
          : 'heading_to_pickup';

    return NextResponse.json({
      found: true,
      tracking: {
        id: solicitud.id,
        token: solicitud.token_rastreo || cleanToken,
        status: normalizedStatus,
        origin: solicitud.origen,
        destination: solicitud.destino,
        originCoords:
          typeof solicitud.origen_lat === 'number' && typeof solicitud.origen_lng === 'number'
            ? [solicitud.origen_lat, solicitud.origen_lng]
            : null,
        destinationCoords:
          typeof solicitud.destino_lat === 'number' && typeof solicitud.destino_lng === 'number'
            ? [solicitud.destino_lat, solicitud.destino_lng]
            : null,
        coordenadasRuta: Array.isArray(solicitud.coordenadas_ruta) ? solicitud.coordenadas_ruta : null,
        distanceKm: solicitud.distancia_km ? Number(solicitud.distancia_km) : null,
        duracionMinutos: solicitud.duracion_minutos ? Number(solicitud.duracion_minutos) : null,
        material: solicitud.material || 'Servicio SARA-FLETES',
        driverName: solicitud.conductor_nombre || 'Conductor SARA',
        plate: solicitud.conductor_placa || '',
        vehicleName: solicitud.vehiculo_nombre || 'Vehículo Asignado SARA',
        maskedPhone: maskPhone(solicitud.conductor_telefono),
        liveLocation,
        startedAt: solicitud.started_at,
        completedAt: solicitud.completed_at,
        updatedAt: solicitud.updated_at
      }
    });
  } catch (err: any) {
    return NextResponse.json({ found: false, error: err?.message || 'Error interno' }, { status: 500 });
  }
}

/**
 * POST /api/fletes/tracking/[token]
 * Valida en servidor el PIN de 4 dígitos (codigo_acceso) antes de revelar el teléfono del conductor.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const cleanToken = (token || '').trim();
    const body = await request.json().catch(() => ({}));
    const pin = String(body?.pin || '').trim();

    if (!cleanToken || !/^\d{4,6}$/.test(pin)) {
      return NextResponse.json({ valid: false, error: 'PIN inválido (debe ser de 4 dígitos)' }, { status: 400 });
    }

    const admin = await createSupabaseAdminClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanToken);
    let query = admin
      .from('fletes_solicitudes')
      .select('codigo_acceso, conductor_telefono');

    query = isUuid ? query.or(`token_rastreo.eq.${cleanToken},id.eq.${cleanToken}`) : query.eq('token_rastreo', cleanToken);

    const { data: solicitud, error } = await query.maybeSingle();
    if (error || !solicitud) {
      return NextResponse.json({ valid: false, error: 'Viaje no encontrado' }, { status: 404 });
    }

    if (String(solicitud.codigo_acceso || '').trim() !== pin) {
      return NextResponse.json({ valid: false, error: 'Código PIN incorrecto' }, { status: 403 });
    }

    return NextResponse.json({
      valid: true,
      phone: solicitud.conductor_telefono || '+593995544332'
    });
  } catch (err: any) {
    return NextResponse.json({ valid: false, error: err?.message || 'Error validando PIN' }, { status: 500 });
  }
}
