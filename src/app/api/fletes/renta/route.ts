import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase-server';
import { CATALOGO_VEHICULOS_SARA, CategoriaVehiculo } from '@/lib/services/saraFreightPricingService';

export const dynamic = 'force-dynamic';

const CITY_COORDS: Record<string, { lat: number; lng: number; provincia: string }> = {
  quito: { lat: -0.1807, lng: -78.4678, provincia: 'Pichincha' },
  guayaquil: { lat: -2.1894, lng: -79.8891, provincia: 'Guayas' },
  cuenca: { lat: -2.9001, lng: -79.0059, provincia: 'Azuay' },
  loja: { lat: -3.9931, lng: -79.2042, provincia: 'Loja' },
  cariamanga: { lat: -4.3285, lng: -79.5560, provincia: 'Loja' },
  manta: { lat: -0.9677, lng: -80.7089, provincia: 'Manabí' },
  ambato: { lat: -1.2491, lng: -78.6167, provincia: 'Tungurahua' },
  machala: { lat: -3.2581, lng: -79.9554, provincia: 'El Oro' },
};

function normalizeText(v?: string | null): string {
  return (v || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function mapToCategoria(raw?: string | null): CategoriaVehiculo {
  const u = (raw || '').toUpperCase();
  if (u in CATALOGO_VEHICULOS_SARA) return u as CategoriaVehiculo;
  if (u.includes('FURGON') || u.includes('VAN')) return 'FURGON_3T';
  if (u.includes('CAMION_5') || u.includes('LIVIANO')) return 'CAMION_5T';
  if (u.includes('VOLQUETA')) return 'VOLQUETA_V3A';
  if (u.includes('CAMION_10')) return 'CAMION_10T';
  if (u.includes('TRACTO') || u.includes('MULA')) return 'TRACTO_3S3';
  return 'PICKUP_1T';
}

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

function inferCityFromCoords(lat?: number | null, lng?: number | null): string {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return 'Loja';
  }
  let bestCity = 'Loja';
  let bestDist = Infinity;
  for (const [key, info] of Object.entries(CITY_COORDS)) {
    const d = haversineKm(lat, lng, info.lat, info.lng);
    if (d < bestDist) {
      bestDist = d;
      bestCity = key.charAt(0).toUpperCase() + key.slice(1);
    }
  }
  return bestCity;
}

/**
 * GET /api/fletes/renta
 * - Si llega ?ownerPlate=... o ?ownerId=... -> devuelve reservas activas/programadas del propietario.
 * - Caso contrario -> devuelve vehículos reales habilitados para 'renta' disponibles en la ciudad y rango de fechas.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerPlate = searchParams.get('ownerPlate')?.trim().toUpperCase();
    const ownerId = searchParams.get('ownerId')?.trim();
    const ciudadParam = searchParams.get('ciudad')?.trim() || '';
    const fechaInicioStr = searchParams.get('fechaInicio') || new Date().toISOString();
    const fechaFinStr =
      searchParams.get('fechaFin') || new Date(Date.now() + 24 * 3600 * 1000).toISOString();

    const admin = await createSupabaseAdminClient();

    // MODO PROPIETARIO: consultar reservas de renta activas para su cabina
    if (ownerPlate || ownerId) {
      let vehQuery = admin.from('fletes_vehiculos').select('id, placa, marca, modelo, conductor_id, estado');
      if (ownerPlate) vehQuery = vehQuery.eq('placa', ownerPlate);
      else if (ownerId) vehQuery = vehQuery.eq('conductor_id', ownerId);

      const { data: myVehicles } = await vehQuery;
      const vehicleIds = (myVehicles || []).map((v: any) => v.id);

      if (vehicleIds.length === 0) {
        return NextResponse.json({ reservations: [] });
      }

      const { data: reservas } = await admin
        .from('fletes_reservas_renta')
        .select('*')
        .in('vehiculo_id', vehicleIds)
        .in('estado', ['SOLICITADA', 'CONFIRMADA', 'EN_CURSO'])
        .order('fecha_inicio', { ascending: true });

      const enriched = (reservas || []).map((r: any) => {
        const veh = (myVehicles || []).find((v: any) => v.id === r.vehiculo_id);
        return {
          ...r,
          placa: veh?.placa || ownerPlate || '',
          vehiculo_nombre: veh ? `${veh.marca} ${veh.modelo}`.trim() : 'Vehículo GoBee',
        };
      });

      return NextResponse.json({ reservations: enriched });
    }

    // MODO CLIENTE: consultar vehículos reales habilitados para renta libres en esas fechas
    const reqStart = new Date(fechaInicioStr).getTime();
    const reqEnd = new Date(fechaFinStr).getTime();
    const validStart = Number.isFinite(reqStart) ? new Date(reqStart).toISOString() : new Date().toISOString();
    const validEnd =
      Number.isFinite(reqEnd) && reqEnd > reqStart
        ? new Date(reqEnd).toISOString()
        : new Date(Date.now() + 24 * 3600 * 1000).toISOString();

    // 1. Reservas que se cruzan con el rango de fechas solicitado (bloqueo por calendario)
    const { data: overlapping } = await admin
      .from('fletes_reservas_renta')
      .select('vehiculo_id, fecha_inicio, fecha_fin, estado')
      .in('estado', ['SOLICITADA', 'CONFIRMADA', 'EN_CURSO'])
      .lt('fecha_inicio', validEnd)
      .gt('fecha_fin', validStart);

    const blockedVehicleIds = new Set<string>(
      (overlapping || []).map((r: any) => String(r.vehiculo_id))
    );

    // 2. Vehículos registrados en fletes_vehiculos habilitados para Renta
    const { data: dbVehicles } = await admin
      .from('fletes_vehiculos')
      .select('*')
      .in('modalidad', ['RENTA_TEMPORAL', 'HIBRIDO'])
      .neq('estado', 'MANTENIMIENTO')
      .neq('estado', 'INACTIVO');

    // 3. Ubicaciones GPS recientes y usuarios con servicios_habilitados incluyendo 'renta'
    const [{ data: liveLocs }, { data: authUsersData }] = await Promise.all([
      admin.from('fletes_ubicaciones').select('*'),
      admin.auth.admin.listUsers({ perPage: 200 }),
    ]);

    const locByPlate = new Map<string, any>();
    for (const loc of liveLocs || []) {
      if (loc.placa) locByPlate.set(String(loc.placa).toUpperCase(), loc);
    }

    const vehiclesMap = new Map<string, any>();

    // Agregar vehículos reales de fletes_vehiculos
    for (const v of dbVehicles || []) {
      const placa = String(v.placa || '').toUpperCase();
      if (!placa || placa === 'PBA-1234') continue;
      if (blockedVehicleIds.has(String(v.id))) continue;
      // Si la reserva es para hoy/ahora y el vehículo está EN_RENTA actualmente, excluirlo
      const isStartingSoon = new Date(validStart).getTime() <= Date.now() + 6 * 3600 * 1000;
      if (isStartingSoon && v.estado === 'EN_RENTA') continue;

      const loc = locByPlate.get(placa);
      const lat = Number(loc?.lat ?? v.latitud ?? -3.9931);
      const lng = Number(loc?.lng ?? v.longitud ?? -79.2042);
      const inferredCity = inferCityFromCoords(lat, lng);
      const cat = mapToCategoria(v.categoria);
      const spec = CATALOGO_VEHICULOS_SARA[cat];

      vehiclesMap.set(placa, {
        id: v.id,
        placa,
        conductorId: v.conductor_id || null,
        nombrePropietario: v.nombre_chofer || 'Propietario Verificado GoBee',
        telefonoPropietario: v.telefono_chofer || '',
        marca: v.marca || spec.nombre,
        modelo: v.modelo || spec.subtitulo,
        anio: v.anio || 2023,
        categoria: cat,
        tipoVehiculoLabel: `${v.marca || spec.nombre} ${v.modelo || ''}`.trim(),
        icono: spec.icono,
        tarifaHora: Number(v.tarifa_hora || spec.tarifaHoraRentaUSD),
        tarifaDia: Number(v.tarifa_dia || spec.tarifaDiaRentaUSD),
        depositoGarantia: Number(v.deposito_garantia || spec.depositoGarantiaUSD),
        permiteSinChofer: Boolean(v.permite_sin_chofer ?? true),
        calificacion: Number(v.calificacion_promedio || 4.9),
        ciudad: inferredCity,
        sectorAproximado: `Zona urbana · ${inferredCity}`,
        lat,
        lng,
      });
    }

    // Agregar dueños/conductores registrados en Auth que habilitaron 'renta' en su perfil
    const authUsers = authUsersData?.users || [];
    for (const u of authUsers) {
      const meta = (u.user_metadata || {}) as Record<string, any>;
      const servicios: string[] = Array.isArray(meta.servicios_habilitados)
        ? meta.servicios_habilitados.map((s: unknown) => String(s).toLowerCase())
        : [];

      if (!servicios.includes('renta')) continue;

      const placa = String(meta.placa || '').trim().toUpperCase();
      if (!placa || placa === 'PBA-1234' || vehiclesMap.has(placa)) continue;

      const loc = locByPlate.get(placa);
      const cityKey = normalizeText(meta.ciudad_renta || meta.ciudad);
      const fallbackCityCoord = CITY_COORDS[cityKey] || CITY_COORDS.cariamanga;
      const lat = Number(loc?.lat ?? meta.lat_renta ?? fallbackCityCoord.lat);
      const lng = Number(loc?.lng ?? meta.lng_renta ?? fallbackCityCoord.lng);
      const ciudad =
        (meta.ciudad_renta || meta.ciudad || '').trim() || inferCityFromCoords(lat, lng);
      const cat = mapToCategoria(meta.tipo_vehiculo || loc?.tipo_vehiculo);
      const spec = CATALOGO_VEHICULOS_SARA[cat];

      vehiclesMap.set(placa, {
        id: `AUTH-${u.id}`,
        placa,
        conductorId: u.id,
        nombrePropietario: String(meta.full_name || meta.nombre || 'Propietario GoBee'),
        telefonoPropietario: String(meta.telefono || meta.phone || ''),
        marca: spec.nombre,
        modelo: String(meta.tipo_vehiculo || spec.subtitulo),
        anio: 2023,
        categoria: cat,
        tipoVehiculoLabel: spec.nombre,
        icono: spec.icono,
        tarifaHora: spec.tarifaHoraRentaUSD,
        tarifaDia: spec.tarifaDiaRentaUSD,
        depositoGarantia: spec.depositoGarantiaUSD,
        permiteSinChofer: true,
        calificacion: Number(loc?.rating || 4.9),
        ciudad,
        sectorAproximado: String(meta.direccion_renta || `Centro / Zona urbana · ${ciudad}`),
        lat,
        lng,
      });
    }

    let vehicles = Array.from(vehiclesMap.values());

    // Filtrar por ciudad destino si el cliente especificó una
    const normalizedQueryCity = normalizeText(ciudadParam);
    if (normalizedQueryCity && normalizedQueryCity !== 'todas') {
      const targetCoords = CITY_COORDS[normalizedQueryCity];
      vehicles = vehicles.filter((v) => {
        const vCity = normalizeText(v.ciudad);
        if (vCity.includes(normalizedQueryCity) || normalizedQueryCity.includes(vCity)) {
          return true;
        }
        if (targetCoords && typeof v.lat === 'number' && typeof v.lng === 'number') {
          return haversineKm(targetCoords.lat, targetCoords.lng, v.lat, v.lng) <= 55;
        }
        return false;
      });
    }

    return NextResponse.json({
      vehicles,
      ciudad: ciudadParam || 'Todas',
      fechaInicio: validStart,
      fechaFin: validEnd,
    });
  } catch (err: any) {
    console.error('[GET /api/fletes/renta error]:', err);
    return NextResponse.json(
      { vehicles: [], error: err?.message || 'Error consultando vehículos de renta' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/fletes/renta
 * Crea una reserva real con código único, valida que no haya cruce de fechas
 * y bloquea el vehículo en Supabase para evitar sobreventa.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Payload inválido' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    const admin = await createSupabaseAdminClient();

    const placa = String(body.placa || '').trim().toUpperCase();
    const ciudad = String(body.ciudad || 'Loja').trim();
    const modalidadRenta: 'CON_CHOFER' | 'SIN_CHOFER' =
      body.modalidadRenta === 'SIN_CHOFER' ? 'SIN_CHOFER' : 'CON_CHOFER';
    const duracionTipo: 'HORAS' | 'DIAS' = body.duracionTipo === 'HORAS' ? 'HORAS' : 'DIAS';
    const duracionValor = Math.max(1, Number(body.duracionValor) || 1);
    const fechaInicio = new Date(body.fechaInicio || Date.now()).toISOString();
    const fechaFin = new Date(
      body.fechaFin ||
        Date.now() + (duracionTipo === 'HORAS' ? duracionValor * 3600000 : duracionValor * 86400000)
    ).toISOString();
    const tarifaTotal = Math.max(1, Number(body.tarifaTotal) || 65);
    const abonoPorcentaje = 0.2;
    const abonoReservaUSD = +(tarifaTotal * abonoPorcentaje).toFixed(2);
    const saldoRetiroUSD = +(tarifaTotal - abonoReservaUSD).toFixed(2);
    const depositoGarantia = Math.max(0, Number(body.depositoGarantia) || 0);

    if (!placa) {
      return NextResponse.json(
        { success: false, error: 'Debes seleccionar un vehículo válido para reservar.' },
        { status: 400 }
      );
    }

    // 1. Asegurar registro real en fletes_vehiculos para integridad referencial y bloqueo
    let vehicleId: string | null = null;
    const { data: existingVeh } = await admin
      .from('fletes_vehiculos')
      .select('id, latitud, longitud, nombre_chofer, telefono_chofer, marca, modelo')
      .eq('placa', placa)
      .maybeSingle();

    const cityFallback = CITY_COORDS[normalizeText(ciudad)] || CITY_COORDS.cariamanga;
    let pickupLat = Number(existingVeh?.latitud ?? body.lat ?? cityFallback.lat);
    let pickupLng = Number(existingVeh?.longitud ?? body.lng ?? cityFallback.lng);
    const ownerName = String(
      existingVeh?.nombre_chofer || body.nombrePropietario || 'Propietario Verificado GoBee'
    );
    const ownerPhone = String(existingVeh?.telefono_chofer || body.telefonoPropietario || '');
    const cat = mapToCategoria(body.categoria);
    const spec = CATALOGO_VEHICULOS_SARA[cat];

    if (existingVeh?.id) {
      vehicleId = existingVeh.id;
    } else {
      const { data: createdVeh, error: createVehErr } = await admin
        .from('fletes_vehiculos')
        .insert({
          placa,
          conductor_id: body.conductorId || null,
          nombre_chofer: ownerName,
          telefono_chofer: ownerPhone || '0990000000',
          marca: String(body.marca || spec.nombre).slice(0, 60),
          modelo: String(body.modelo || spec.subtitulo).slice(0, 60),
          anio: Number(body.anio) || 2023,
          categoria: cat,
          modalidad: 'HIBRIDO',
          permite_sin_chofer: true,
          tarifa_hora: Number(body.tarifaHora || spec.tarifaHoraRentaUSD),
          tarifa_dia: Number(body.tarifaDia || spec.tarifaDiaRentaUSD),
          deposito_garantia: depositoGarantia || spec.depositoGarantiaUSD,
          capacidad_ton: spec.capacidadTon,
          volumen_m3: spec.capacidadM3,
          latitud: pickupLat,
          longitud: pickupLng,
          estado: 'DISPONIBLE',
        })
        .select('id')
        .single();

      if (createVehErr || !createdVeh?.id) {
        return NextResponse.json(
          { success: false, error: createVehErr?.message || 'No se pudo registrar la unidad para reserva.' },
          { status: 500 }
        );
      }
      vehicleId = createdVeh.id;
    }

    // 2. Verificación anti-sobreventa: comprobar si ya existe reserva activa cruzada en esas fechas
    const { data: conflicts } = await admin
      .from('fletes_reservas_renta')
      .select('id, fecha_inicio, fecha_fin')
      .eq('vehiculo_id', vehicleId)
      .in('estado', ['SOLICITADA', 'CONFIRMADA', 'EN_CURSO'])
      .lt('fecha_inicio', fechaFin)
      .gt('fecha_fin', fechaInicio);

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Este vehículo ya fue reservado para las fechas seleccionadas. Por favor elige otra unidad o fechas.',
        },
        { status: 409 }
      );
    }

    // 3. Generar código único de retiro (GB-XXXX) y guardar reserva
    const pinDesbloqueo = `GB-${Math.floor(1000 + Math.random() * 9000)}`;
    const lugarEntrega = String(
      body.lugarEntrega || `Punto de Retiro GoBee · ${ciudad} (${ownerName})`
    ).slice(0, 250);

    const clienteNombre = String(
      body.clienteNombre || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Cliente GoBee'
    ).slice(0, 120);
    const clienteTelefono = String(
      body.clienteTelefono || user?.user_metadata?.telefono || '0990000000'
    ).slice(0, 30);

    const { data: reserva, error: insertErr } = await admin
      .from('fletes_reservas_renta')
      .insert({
        vehiculo_id: vehicleId,
        usuario_id: user?.id || null,
        cliente_nombre: clienteNombre,
        cliente_telefono: clienteTelefono,
        cliente_cedula: String(body.clienteCedula || '9999999999').slice(0, 20),
        modalidad_renta: modalidadRenta,
        duracion_tipo: duracionTipo,
        duracion_valor: duracionValor,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        lugar_entrega: lugarEntrega,
        latitud_entrega: pickupLat,
        longitud_entrega: pickupLng,
        tarifa_base: tarifaTotal,
        tarifa_total: tarifaTotal,
        deposito_garantia: depositoGarantia,
        estado_pago: 'PAGADO',
        pin_desbloqueo: pinDesbloqueo,
        estado: 'CONFIRMADA',
      })
      .select('*')
      .single();

    if (insertErr) {
      return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
    }

    // 4. Si la reserva inicia hoy (dentro de las próximas 6h), bloquear unidad de inmediato en vivo
    const startsNow = new Date(fechaInicio).getTime() <= Date.now() + 6 * 3600 * 1000;
    if (startsNow) {
      await Promise.all([
        admin
          .from('fletes_vehiculos')
          .update({ estado: 'EN_RENTA', updated_at: new Date().toISOString() })
          .eq('id', vehicleId),
        admin
          .from('fletes_ubicaciones')
          .update({ disponible: false, updated_at: new Date().toISOString() })
          .eq('placa', placa),
      ]);
    }

    return NextResponse.json({
      success: true,
      reservation: {
        id: reserva.id,
        codigoReserva: pinDesbloqueo,
        vehiculoId: vehicleId,
        placa,
        vehiculoNombre: String(body.vehiculoNombre || `${existingVeh?.marca || spec.nombre} ${existingVeh?.modelo || ''}`).trim(),
        propietarioNombre: ownerName,
        propietarioTelefono: ownerPhone,
        ciudad,
        lugarEntrega,
        lat: pickupLat,
        lng: pickupLng,
        fechaInicio,
        fechaFin,
        duracionTexto: `${duracionValor} ${duracionTipo === 'HORAS' ? (duracionValor === 1 ? 'hora' : 'horas') : (duracionValor === 1 ? 'día' : 'días')}`,
        conChofer: modalidadRenta === 'CON_CHOFER',
        tarifaTotal,
        abonoPagadoUSD: abonoReservaUSD,
        saldoRetiroUSD,
        depositoGarantia,
        referenciaAbono: String(body.referenciaAbono || ''),
      },
    });
  } catch (err: any) {
    console.error('[POST /api/fletes/renta error]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Error creando reserva de renta' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/fletes/renta
 * Acciones del dueño/conductor:
 * - action: 'sync_vehicle' -> sincroniza vehículo del dueño en fletes_vehiculos cuando habilita 'renta'
 * - action: 'entregar' -> valida código del cliente y marca renta EN_CURSO + vehículo EN_RENTA
 * - action: 'finalizar' -> finaliza renta y libera el vehículo a DISPONIBLE para nuevos clientes
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body?.action) {
      return NextResponse.json({ success: false, error: 'Acción requerida' }, { status: 400 });
    }

    const admin = await createSupabaseAdminClient();

    if (body.action === 'sync_vehicle') {
      const placa = String(body.placa || '').trim().toUpperCase();
      if (!placa) {
        return NextResponse.json({ success: false, error: 'Placa requerida' }, { status: 400 });
      }
      const cat = mapToCategoria(body.tipoVehiculo);
      const spec = CATALOGO_VEHICULOS_SARA[cat];
      const rentaHabilitada = Boolean(body.rentaHabilitada);
      const lat = Number(body.lat) || -4.3285;
      const lng = Number(body.lng) || -79.5560;

      const { error } = await admin.from('fletes_vehiculos').upsert(
        {
          placa,
          conductor_id: body.conductorId || null,
          nombre_chofer: String(body.nombre || 'Propietario GoBee').slice(0, 120),
          telefono_chofer: String(body.telefono || '0990000000').slice(0, 30),
          marca: spec.nombre,
          modelo: String(body.tipoVehiculo || spec.subtitulo).slice(0, 60),
          anio: 2023,
          categoria: cat,
          modalidad: rentaHabilitada ? 'HIBRIDO' : 'FLETE_CARGA',
          permite_sin_chofer: true,
          tarifa_hora: spec.tarifaHoraRentaUSD,
          tarifa_dia: spec.tarifaDiaRentaUSD,
          deposito_garantia: spec.depositoGarantiaUSD,
          capacidad_ton: spec.capacidadTon,
          volumen_m3: spec.capacidadM3,
          latitud: lat,
          longitud: lng,
          estado: 'DISPONIBLE',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'placa' }
      );

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (body.action === 'entregar') {
      const reservaId = String(body.reservaId || '');
      const codigoIngresado = String(body.codigo || '').trim().toUpperCase();

      const { data: reserva } = await admin
        .from('fletes_reservas_renta')
        .select('*')
        .eq('id', reservaId)
        .single();

      if (!reserva) {
        return NextResponse.json({ success: false, error: 'Reserva no encontrada.' }, { status: 404 });
      }

      if (
        codigoIngresado &&
        String(reserva.pin_desbloqueo || '').trim().toUpperCase() !== codigoIngresado
      ) {
        return NextResponse.json(
          { success: false, error: 'El código ingresado no coincide con el Pase de Reserva del cliente.' },
          { status: 400 }
        );
      }

      await Promise.all([
        admin
          .from('fletes_reservas_renta')
          .update({ estado: 'EN_CURSO', updated_at: new Date().toISOString() })
          .eq('id', reservaId),
        admin
          .from('fletes_vehiculos')
          .update({ estado: 'EN_RENTA', updated_at: new Date().toISOString() })
          .eq('id', reserva.vehiculo_id),
      ]);

      return NextResponse.json({ success: true, estado: 'EN_CURSO' });
    }

    if (body.action === 'finalizar') {
      const reservaId = String(body.reservaId || '');
      const { data: reserva } = await admin
        .from('fletes_reservas_renta')
        .select('id, vehiculo_id')
        .eq('id', reservaId)
        .single();

      if (!reserva) {
        return NextResponse.json({ success: false, error: 'Reserva no encontrada.' }, { status: 404 });
      }

      const { data: veh } = await admin
        .from('fletes_vehiculos')
        .select('placa')
        .eq('id', reserva.vehiculo_id)
        .maybeSingle();

      await Promise.all([
        admin
          .from('fletes_reservas_renta')
          .update({ estado: 'COMPLETADA', updated_at: new Date().toISOString() })
          .eq('id', reservaId),
        admin
          .from('fletes_vehiculos')
          .update({ estado: 'DISPONIBLE', updated_at: new Date().toISOString() })
          .eq('id', reserva.vehiculo_id),
        veh?.placa
          ? admin
              .from('fletes_ubicaciones')
              .update({ disponible: true, updated_at: new Date().toISOString() })
              .eq('placa', veh.placa)
          : Promise.resolve(),
      ]);

      return NextResponse.json({ success: true, estado: 'COMPLETADA' });
    }

    return NextResponse.json({ success: false, error: 'Acción no reconocida' }, { status: 400 });
  } catch (err: any) {
    console.error('[PATCH /api/fletes/renta error]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Error actualizando renta' },
      { status: 500 }
    );
  }
}
