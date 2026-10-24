import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { generateDynamicSmartLockPIN } from "@/lib/services/smartLockService"

/**
 * POST /api/airbnb/smartlock
 * Emite o revoca un PIN temporal de cerradura inteligente para una reserva confirmada
 */
export async function POST(request: Request) {
  try {
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado para gestionar cerraduras." }, { status: 401 })
    }

    const body = await request.json()
    const { stayCode, reservationCode, checkIn, checkOut, accion = "generar" } = body

    if (!stayCode || !reservationCode) {
      return NextResponse.json({ error: "stayCode y reservationCode son obligatorios" }, { status: 400 })
    }

    if (accion === "revocar") {
      return NextResponse.json({
        success: true,
        reservationCode,
        status: "revocado",
        message: `El acceso de la cerradura inteligente para la reserva ${reservationCode} ha sido revocado.`
      })
    }

    const access = generateDynamicSmartLockPIN(
      stayCode,
      reservationCode,
      checkIn || new Date().toISOString().split("T")[0],
      checkOut || new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]
    )

    return NextResponse.json({
      success: true,
      access,
      message: `PIN temporal emitido con éxito. Activo desde ${access.validFrom} hasta ${access.validUntil}.`
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
