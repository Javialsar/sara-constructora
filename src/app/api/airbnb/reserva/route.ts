import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Credenciales de base de datos no configuradas" },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    })

    const body = await request.json()
    const {
      codigoReserva,
      alojamiento,
      huesped,
      fechas,
      totales,
      metodoPago,
      peticionesEspeciales
    } = body

    if (!codigoReserva || !huesped?.nombre || !huesped?.email || !huesped?.telefono) {
      return NextResponse.json(
        { error: "Faltan datos requeridos para registrar la reserva" },
        { status: 400 }
      )
    }

    const reservaDetalle = {
      codigo_reserva: codigoReserva,
      alojamiento: {
        id: alojamiento?.id,
        codigo: alojamiento?.codigo,
        titulo: alojamiento?.titulo,
        ciudad: alojamiento?.ciudad,
        pais: alojamiento?.pais,
        sector: alojamiento?.sector,
        precio_noche: alojamiento?.precioNoche
      },
      huesped: {
        nombre: huesped.nombre,
        apellido: huesped.apellido || "",
        email: huesped.email,
        telefono: huesped.telefono,
        identificacion: huesped.identificacion || ""
      },
      fechas: {
        check_in: fechas?.checkIn,
        check_out: fechas?.checkOut,
        noches: fechas?.noches || 1,
        huespedes: fechas?.huespedes || 1
      },
      totales: {
        precio_noche: totales?.precioNoche || 0,
        tarifa_limpieza: totales?.tarifaLimpieza || 0,
        gran_total: totales?.granTotal || 0
      },
      metodo_pago: metodoPago || "transferencia",
      peticiones_especiales: peticionesEspeciales || "",
      estado_reserva: "confirmada_pendiente_verificacion",
      fecha_creacion: new Date().toISOString()
    }

    // 1. Guardar en solicitudes_servicio para el CRM / Inbox de solicitudes
    const { data: solicitudData, error: solicitudError } = await supabaseAdmin
      .from("solicitudes_servicio")
      .insert([
        {
          nombre: `${huesped.nombre} ${huesped.apellido || ""}`.trim(),
          email: huesped.email,
          telefono: huesped.telefono,
          tipo_servicio: "alojamiento_airbnb",
          mensaje: JSON.stringify(reservaDetalle, null, 2),
          estado: "nueva"
        }
      ])
      .select()

    if (solicitudError) {
      console.error("Error guardando en solicitudes_servicio:", solicitudError)
    }

    // 2. Guardar también en el registro histórico de reservas de parametros_globales
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
      message: "Reserva registrada y respaldada con éxito en la base de datos"
    })
  } catch (err: any) {
    console.error("Error general en /api/airbnb/reserva:", err)
    return NextResponse.json(
      { error: err?.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const emailParam = searchParams.get("email")?.toLowerCase().trim()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Credenciales de base de datos no configuradas" },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    })

    // 1. Obtener de parametros_globales (reservas_airbnb)
    const { data: globalParam } = await supabaseAdmin
      .from("parametros_globales")
      .select("indirectos_default")
      .limit(1)
      .single()

    let reservasGlobales: any[] = globalParam?.indirectos_default?.reservas_airbnb || []

    // 2. Obtener de solicitudes_servicio (tipo_servicio: alojamiento_airbnb)
    let query = supabaseAdmin
      .from("solicitudes_servicio")
      .select("*")
      .eq("tipo_servicio", "alojamiento_airbnb")
      .order("created_at", { ascending: false })

    if (emailParam) {
      query = query.ilike("email", `%${emailParam}%`)
    }

    const { data: solicitudes } = await query

    // Si viene emailParam, filtrar también en reservasGlobales
    if (emailParam) {
      reservasGlobales = reservasGlobales.filter((r: any) => 
        (r.huesped?.email || "").toLowerCase().includes(emailParam) ||
        (r.emailHuesped || "").toLowerCase().includes(emailParam)
      )
    }

    return NextResponse.json({
      success: true,
      reservas: reservasGlobales,
      solicitudes: solicitudes || []
    })
  } catch (err: any) {
    console.error("Error al obtener reservas:", err)
    return NextResponse.json(
      { error: err?.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}
