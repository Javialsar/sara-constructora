import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { AIRBNB_DATA } from "@/components/stays/AirbnbData"

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

/**
 * GET /api/airbnb/disponibilidad?stayCode=SARA-EC-01&checkIn=2026-11-01&checkOut=2026-11-05
 * Consulta disponibilidad en tiempo real verificando:
 * 1. Reservas activas y confirmadas
 * 2. Bloqueos de calendario (mantenimiento, uso de propietario, sincronización iCal)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const stayCode = searchParams.get("stayCode") || searchParams.get("codigo") || ""
    const checkIn = searchParams.get("checkIn") || ""
    const checkOut = searchParams.get("checkOut") || ""

    if (!stayCode) {
      return NextResponse.json({ error: "El parámetro stayCode es obligatorio" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const fechasOcupadas: Array<{ start: string; end: string; motivo: string }> = []

    if (supabase) {
      // 1. Consultar reservas activas en solicitudes_servicio
      const { data: solicitudes } = await supabase
        .from("solicitudes_servicio")
        .select("mensaje")
        .eq("tipo_servicio", "alojamiento_airbnb")
        .limit(100)

      if (Array.isArray(solicitudes)) {
        for (const sol of solicitudes) {
          try {
            const det = typeof sol.mensaje === "string" ? JSON.parse(sol.mensaje) : (sol.mensaje || {})
            const sCode = det.alojamiento?.codigo || det.alojamiento?.id
            if (sCode === stayCode && det.fechas?.check_in && det.fechas?.check_out) {
              if (det.estado_reserva !== "cancelada") {
                fechasOcupadas.push({
                  start: det.fechas.check_in,
                  end: det.fechas.check_out,
                  motivo: "reserva_confirmada"
                })
              }
            }
          } catch {}
        }
      }

      // 2. Consultar bloqueos de calendario en stays_availability_blocks si existe
      try {
        const { data: blocks } = await supabase
          .from("stays_availability_blocks")
          .select("start_date, end_date, reason")
          .eq("stay_code", stayCode)

        if (Array.isArray(blocks)) {
          blocks.forEach(b => {
            fechasOcupadas.push({
              start: b.start_date,
              end: b.end_date,
              motivo: b.reason || "mantenimiento"
            })
          })
        }
      } catch {}
    }

    // Si se especificó un rango checkIn / checkOut específico, evaluar si está libre
    let disponible = true
    let conflictoCon: any = null

    if (checkIn && checkOut) {
      const targetIn = new Date(checkIn).getTime()
      const targetOut = new Date(checkOut).getTime()

      if (isNaN(targetIn) || isNaN(targetOut) || targetOut <= targetIn) {
        return NextResponse.json({ error: "Rango de fechas inválido" }, { status: 400 })
      }

      for (const b of fechasOcupadas) {
        const bIn = new Date(b.start).getTime()
        const bOut = new Date(b.end).getTime()
        // Condición de colisión temporal
        if (Math.max(targetIn, bIn) < Math.min(targetOut, bOut)) {
          disponible = false
          conflictoCon = b
          break
        }
      }
    }

    return NextResponse.json({
      success: true,
      stayCode,
      disponible,
      conflictoCon,
      totalBloqueos: fechasOcupadas.length,
      bloqueos: fechasOcupadas
    })
  } catch (err: any) {
    console.error("Error en /api/airbnb/disponibilidad:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
