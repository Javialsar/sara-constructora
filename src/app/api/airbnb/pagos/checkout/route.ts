import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
}

/**
 * POST /api/airbnb/pagos/checkout
 * Genera una orden de cobro con clave de idempotencia para la pasarela de pagos
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      reservationCode,
      amountUSD,
      paymentMethod = "tarjeta",
      guestEmail,
      guestName,
      idempotencyKey
    } = body

    if (!reservationCode || !amountUSD || !guestEmail) {
      return NextResponse.json({ error: "reservationCode, amountUSD y guestEmail son obligatorios" }, { status: 400 })
    }

    const orderId = `PAY-${reservationCode}-${Date.now()}`
    const idempotency = idempotencyKey || `IDEM-${orderId}`

    // Si es tarjeta de crédito: Generar orden de pago lista para pasarela (Kushki / Stripe / Datafast)
    const paymentOrder = {
      orderId,
      idempotencyKey: idempotency,
      reservationCode,
      amountUSD: Number(amountUSD),
      currency: "USD",
      customer: {
        name: guestName || "Huésped SARA",
        email: guestEmail
      },
      status: "creada_pendiente_pago",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutos para completar pago
    }

    const supabase = getSupabaseAdmin()
    if (supabase) {
      try {
        await supabase.from("solicitudes_servicio").insert([
          {
            nombre: `Pago Reserva ${reservationCode}`,
            email: guestEmail,
            tipo_servicio: "pago_stays_checkout",
            mensaje: JSON.stringify(paymentOrder, null, 2),
            estado: "pendiente"
          }
        ])
      } catch {}
    }

    return NextResponse.json({
      success: true,
      order: paymentOrder,
      message: "Orden de pago generada exitosamente. Lista para procesar transacción."
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
