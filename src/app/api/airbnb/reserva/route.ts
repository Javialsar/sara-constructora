import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { canAccessModule } from "@/lib/auth/moduleGuards"
import { AIRBNB_DATA } from "@/components/stays/AirbnbData"
import { generateDynamicSmartLockPIN } from "@/lib/services/smartLockService"

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })
}

// POST: Registrar reserva con validación autoritativa en servidor y prevención de doble reserva
export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Credenciales de base de datos no configuradas" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const {
      codigoReserva,
      alojamiento,
      huesped,
      fechas,
      metodoPago,
      peticionesEspeciales,
      comprobanteUrl
    } = body

    if (!codigoReserva || !huesped?.nombre || !huesped?.email || !huesped?.telefono) {
      return NextResponse.json(
        { error: "Faltan datos requeridos (nombre, email y teléfono del huésped son obligatorios)" },
        { status: 400 }
      )
    }

    if (!fechas?.checkIn || !fechas?.checkOut) {
      return NextResponse.json(
        { error: "Las fechas de llegada (check-in) y salida (check-out) son obligatorias" },
        { status: 400 }
      )
    }

    const dIn = new Date(fechas.checkIn).getTime()
    const dOut = new Date(fechas.checkOut).getTime()
    if (isNaN(dIn) || isNaN(dOut) || dOut <= dIn) {
      return NextResponse.json(
        { error: "Rango de fechas inválido. La fecha de salida debe ser posterior a la de llegada." },
        { status: 400 }
      )
    }

    const nochesCalculadas = Math.max(1, Math.round((dOut - dIn) / (1000 * 60 * 60 * 24)))
    const stayCode = alojamiento?.codigo || alojamiento?.id || ""

    // 1. OBTENER PRECIO OFICIAL AUTORITATIVO DESDE BASE DE DATOS O CATÁLOGO
    let precioNocheOficial = 50
    let tarifaLimpiezaOficial = 15
    let tituloOficial = alojamiento?.titulo || "Alojamiento SARA"
    let ciudadOficial = alojamiento?.ciudad || "Ecuador"
    let paisOficial = alojamiento?.pais || "Ecuador"
    let sectorOficial = alojamiento?.sector || ""

    // Buscar en alojamientos_airbnb
    try {
      const { data: stayDB } = await supabaseAdmin
        .from("alojamientos_airbnb")
        .select("precio_noche, tarifa_limpieza, titulo, ciudad, pais, sector")
        .eq("codigo", stayCode)
        .maybeSingle()

      if (stayDB) {
        precioNocheOficial = Number(stayDB.precio_noche) || precioNocheOficial
        tarifaLimpiezaOficial = Number(stayDB.tarifa_limpieza) || tarifaLimpiezaOficial
        tituloOficial = stayDB.titulo || tituloOficial
        ciudadOficial = stayDB.ciudad || ciudadOficial
        paisOficial = stayDB.pais || paisOficial
        sectorOficial = stayDB.sector || sectorOficial
      } else {
        // Fallback al catálogo oficial
        const staticItem = AIRBNB_DATA.find(s => s.codigo === stayCode || s.id === alojamiento?.id)
        if (staticItem) {
          precioNocheOficial = staticItem.precioNoche
          tarifaLimpiezaOficial = staticItem.tarifaLimpieza
          tituloOficial = staticItem.titulo
          ciudadOficial = staticItem.ciudad
          paisOficial = staticItem.pais
          sectorOficial = staticItem.sector
        }
      }
    } catch (errDB) {
      console.warn("Aviso consultando precio oficial:", errDB)
    }

    // Cálculo autoritativo de importes en el servidor (descartando montos no verificados del cliente)
    const subtotalNoches = precioNocheOficial * nochesCalculadas
    const granTotalAutoritativo = subtotalNoches + tarifaLimpiezaOficial

    // 2. PREVENCIÓN DE DOBLE RESERVA (CONCURRENCY CHECK)
    // Verificar si existen reservas confirmadas que se solapen en fechas para esta misma propiedad
    try {
      const { data: solicitudesPrevias } = await supabaseAdmin
        .from("solicitudes_servicio")
        .select("id, mensaje")
        .eq("tipo_servicio", "alojamiento_airbnb")
        .limit(50)

      if (Array.isArray(solicitudesPrevias)) {
        for (const sol of solicitudesPrevias) {
          try {
            const parsed = typeof sol.mensaje === "string" ? JSON.parse(sol.mensaje) : (sol.mensaje || {})
            const prevCode = parsed.alojamiento?.codigo || parsed.alojamiento?.id
            if (prevCode === stayCode && parsed.fechas?.check_in && parsed.fechas?.check_out) {
              const prevIn = new Date(parsed.fechas.check_in).getTime()
              const prevOut = new Date(parsed.fechas.check_out).getTime()

              // Condición de solapamiento de intervalos: max(start1, start2) < min(end1, end2)
              const seSolapa = Math.max(dIn, prevIn) < Math.min(dOut, prevOut)
              if (seSolapa && parsed.estado_reserva !== "cancelada") {
                return NextResponse.json(
                  {
                    error: `Conflicto de disponibilidad: El alojamiento ya se encuentra reservado entre ${parsed.fechas.check_in} y ${parsed.fechas.check_out}. Por favor selecciona otras fechas.`,
                    codigoError: "DATE_CONFLICT"
                  },
                  { status: 409 }
                )
              }
            }
          } catch {
            // Ignorar parse error en registros corruptos
          }
        }
      }
    } catch (conflictErr) {
      console.warn("Aviso comprobando conflictos de fechas:", conflictErr)
    }

    // 3. ESTRUCTURAR RESERVA AUTORITATIVA Y GENERAR CERRADURA INTELIGENTE
    const smartLockAccess = generateDynamicSmartLockPIN(stayCode, codigoReserva, fechas.checkIn, fechas.checkOut)

    const reservaDetalle = {
      codigo_reserva: codigoReserva,
      alojamiento: {
        id: alojamiento?.id,
        codigo: stayCode,
        titulo: tituloOficial,
        ciudad: ciudadOficial,
        pais: paisOficial,
        sector: sectorOficial,
        precio_noche: precioNocheOficial
      },
      huesped: {
        nombre: huesped.nombre.trim(),
        apellido: (huesped.apellido || "").trim(),
        email: huesped.email.trim().toLowerCase(),
        telefono: huesped.telefono.trim(),
        identificacion: (huesped.identificacion || "").trim()
      },
      fechas: {
        check_in: fechas.checkIn,
        check_out: fechas.checkOut,
        noches: nochesCalculadas,
        huespedes: Number(fechas.huespedes) || 1
      },
      totales: {
        precio_noche: precioNocheOficial,
        tarifa_limpieza: tarifaLimpiezaOficial,
        subtotal_noches: subtotalNoches,
        gran_total: granTotalAutoritativo
      },
      metodo_pago: metodoPago || "transferencia",
      peticiones_especiales: peticionesEspeciales || "",
      comprobante_url: comprobanteUrl || null,
      smart_lock: smartLockAccess,
      estado_reserva: "confirmada_pendiente_verificacion",
      fecha_creacion: new Date().toISOString()
    }

    // 4. GUARDAR EN solicitudes_servicio (CRM / Inbox)
    const { data: solicitudData, error: solicitudError } = await supabaseAdmin
      .from("solicitudes_servicio")
      .insert([
        {
          nombre: `${huesped.nombre} ${huesped.apellido || ""}`.trim(),
          email: huesped.email.trim().toLowerCase(),
          telefono: huesped.telefono.trim(),
          tipo_servicio: "alojamiento_airbnb",
          mensaje: JSON.stringify(reservaDetalle, null, 2),
          estado: "nueva"
        }
      ])
      .select()

    if (solicitudError) {
      console.error("Error guardando en solicitudes_servicio:", solicitudError)
    }

    // 5. REGISTRAR EN TABLA DEDICADA stays_reservations SI ESTÁ CREADA
    try {
      await supabaseAdmin
        .from("stays_reservations")
        .insert([
          {
            reservation_code: codigoReserva,
            stay_code: stayCode,
            guest_name: `${huesped.nombre} ${huesped.apellido || ""}`.trim(),
            guest_email: huesped.email.trim().toLowerCase(),
            guest_phone: huesped.telefono.trim(),
            guest_identification: (huesped.identificacion || "").trim(),
            check_in: fechas.checkIn,
            check_out: fechas.checkOut,
            nights: nochesCalculadas,
            guests_count: Number(fechas.huespedes) || 1,
            night_price: precioNocheOficial,
            cleaning_fee: tarifaLimpiezaOficial,
            total_amount: granTotalAutoritativo,
            payment_method: metodoPago || "transferencia",
            reservation_status: "confirmada_pendiente_verificacion",
            metadata: reservaDetalle
          }
        ])
    } catch (staysTableErr) {
      // Si la tabla no está migrada aún, continúa con el respaldo en solicitudes_servicio
    }

    // 6. GUARDAR TAMBIÉN EN parametros_globales (RESPALDO HISTÓRICO)
    try {
      const { data: globalParam } = await supabaseAdmin
        .from("parametros_globales")
        .select("id, indirectos_default")
        .limit(1)
        .single()

      if (globalParam) {
        const indirectos = globalParam.indirectos_default || {}
        const reservasExistentes = Array.isArray(indirectos.reservas_airbnb)
          ? indirectos.reservas_airbnb
          : []

        const nuevasReservas = [reservaDetalle, ...reservasExistentes].slice(0, 100)

        await supabaseAdmin
          .from("parametros_globales")
          .update({
            indirectos_default: {
              ...indirectos,
              reservas_airbnb: nuevasReservas
            },
            updated_at: new Date().toISOString()
          })
          .eq("id", globalParam.id)
      }
    } catch (saveGlobalErr) {
      console.error("Error actualizando parametros_globales:", saveGlobalErr)
    }

    return NextResponse.json({
      success: true,
      codigo: codigoReserva,
      solicitud_id: solicitudData?.[0]?.id || null,
      totalesAutoritativos: reservaDetalle.totales,
      smartLock: smartLockAccess,
      message: "Reserva registrada y validada con éxito en la base de datos"
    })
  } catch (err: any) {
    console.error("Error general en POST /api/airbnb/reserva:", err)
    return NextResponse.json(
      { error: err?.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// GET: Obtener reservas con protección estricta contra fuga masiva de PII
export async function GET(request: Request) {
  try {
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()

    const { searchParams } = new URL(request.url)
    const emailParam = searchParams.get("email")?.toLowerCase().trim()

    // Si no hay sesión activa:
    if (!user) {
      // Si no hay usuario autenticado, NO permitir consulta pública sin filtro o de correos ajenos
      return NextResponse.json(
        { error: "No autorizado. Inicie sesión para consultar sus reservas." },
        { status: 401 }
      )
    }

    const userMetadata = { ...(user.user_metadata || {}), ...(user.app_metadata || {}) }
    const isAdmin = canAccessModule(userMetadata, 'sara_master') || canAccessModule(userMetadata, 'sara_stays')
    const callerEmail = user.email?.toLowerCase().trim()

    // Si NO es admin, forzar que SOLO consulte sus propias reservas
    const effectiveEmail = isAdmin ? (emailParam || null) : callerEmail

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Credenciales de base de datos no configuradas" },
        { status: 500 }
      )
    }

    // 1. Obtener de solicitudes_servicio (tipo_servicio: alojamiento_airbnb)
    let query = supabaseAdmin
      .from("solicitudes_servicio")
      .select("*")
      .eq("tipo_servicio", "alojamiento_airbnb")
      .order("created_at", { ascending: false })

    if (effectiveEmail) {
      query = query.ilike("email", `%${effectiveEmail}%`)
    }

    const { data: solicitudes, error: errSol } = await query
    if (errSol) {
      console.warn("Aviso consultando solicitudes_servicio:", errSol.message)
    }

    // 2. Si es admin, también puede obtener de parametros_globales (reservas_airbnb)
    let reservasGlobales: any[] = []
    if (isAdmin) {
      const { data: globalParam } = await supabaseAdmin
        .from("parametros_globales")
        .select("indirectos_default")
        .limit(1)
        .single()

      reservasGlobales = globalParam?.indirectos_default?.reservas_airbnb || []
      if (effectiveEmail) {
        reservasGlobales = reservasGlobales.filter((r: any) =>
          (r.huesped?.email || "").toLowerCase().includes(effectiveEmail) ||
          (r.emailHuesped || "").toLowerCase().includes(effectiveEmail)
        )
      }
    }

    return NextResponse.json({
      success: true,
      reservas: reservasGlobales,
      solicitudes: solicitudes || []
    })
  } catch (err: any) {
    console.error("Error al obtener reservas en GET /api/airbnb/reserva:", err)
    return NextResponse.json(
      { error: err?.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}
