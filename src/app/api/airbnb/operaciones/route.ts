import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { canAccessModule } from "@/lib/auth/moduleGuards"

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
}

/**
 * GET /api/airbnb/operaciones?stayCode=SARA-EC-01
 * Consulta órdenes de trabajo operativas (Limpieza, Mantenimiento, Inspección)
 */
export async function GET(request: Request) {
  try {
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado. Inicie sesión para ver operaciones." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const stayCode = searchParams.get("stayCode")

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ tareas: [] })
    }

    let query = supabase
      .from("solicitudes_servicio")
      .select("id, nombre, email, telefono, mensaje, estado, created_at")
      .eq("tipo_servicio", "tarea_operaciones_stays")
      .order("created_at", { ascending: false })

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ tareas: [], error: error.message })
    }

    const tareas = (data || []).map((row: any) => {
      let det: any = {}
      try {
        det = typeof row.mensaje === "string" ? JSON.parse(row.mensaje) : (row.mensaje || {})
      } catch {}

      return {
        id: row.id,
        stayCode: det.stayCode || "",
        reservationCode: det.reservationCode || "",
        tipoTarea: det.tipoTarea || "limpieza_checkout",
        estado: row.estado || "pendiente",
        asignadoA: det.asignadoA || "Cuadrilla SARA Hospitality",
        fechaProgramada: det.fechaProgramada || row.created_at,
        checklist: det.checklist || [
          { item: "Cambio de sábanas y toallas (600 hilos)", completado: true },
          { item: "Desinfección de baños y cocina", completado: true },
          { item: "Reposición de cápsulas Nespresso y amenidades", completado: false },
          { item: "Inspección de Smart Lock y WiFi", completado: false }
        ]
      }
    })

    const filtradas = stayCode ? tareas.filter(t => t.stayCode === stayCode) : tareas
    return NextResponse.json({ success: true, tareas: filtradas, count: filtradas.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/**
 * POST /api/airbnb/operaciones
 * Crea o actualiza una tarea operativa (Limpieza tras salida, Inspección, Habilitación de unidad)
 */
export async function POST(request: Request) {
  try {
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 })
    }

    const body = await request.json()
    const {
      stayCode,
      reservationCode,
      tipoTarea = "limpieza_checkout",
      asignadoA,
      fechaProgramada,
      estado = "pendiente",
      checklist
    } = body

    if (!stayCode) {
      return NextResponse.json({ error: "stayCode es obligatorio" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: "Base de datos no configurada" }, { status: 500 })
    }

    const tareaPayload = {
      stayCode,
      reservationCode: reservationCode || "N/A",
      tipoTarea,
      asignadoA: asignadoA || "Personal de Limpieza y Fiscalización",
      fechaProgramada: fechaProgramada || new Date().toISOString(),
      checklist: checklist || [
        { item: "Cambio de ropa de cama", completado: estado === "lista_para_checkin" },
        { item: "Limpieza profunda de superficies", completado: estado === "lista_para_checkin" },
        { item: "Verificación de cerradura inteligente", completado: estado === "lista_para_checkin" }
      ],
      actualizadoPor: user.email,
      actualizadoEn: new Date().toISOString()
    }

    const { data, error } = await supabase.from("solicitudes_servicio").insert([
      {
        nombre: `Tarea ${tipoTarea} - ${stayCode}`,
        email: user.email,
        telefono: "+593 9",
        tipo_servicio: "tarea_operaciones_stays",
        mensaje: JSON.stringify(tareaPayload, null, 2),
        estado: estado
      }
    ]).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      tareaId: data?.[0]?.id,
      estado,
      message: `Tarea operativa ${tipoTarea} para ${stayCode} registrada.`
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
