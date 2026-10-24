import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
}

/**
 * POST /api/airbnb/pagos/webhook
 * Webhook de confirmación de pagos (Stripe, Kushki, Datafast, Payphone)
 * Valida idempotencia, actualiza estado de la reserva y genera clave de acceso temporal
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get("x-signature") || request.headers.get("stripe-signature") || ""

    let event: any = {}
    try {
      event = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: "Payload JSON inválido" }, { status: 400 })
    }

    const {
      transactionId,
      reservationCode,
      amountUSD,
      status, // 'aprobado' | 'rechazado' | 'reembolsado'
      idempotencyKey
    } = event

    if (!reservationCode || !status) {
      return NextResponse.json({ error: "reservationCode y status son obligatorios" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 })
    }

    // 1. Verificar idempotencia: evitar procesar la misma transacción dos veces
    const { data: yaProcesado } = await supabase
      .from("solicitudes_servicio")
      .select("id")
      .eq("tipo_servicio", "webhook_pago_procesado")
      .ilike("mensaje", `%${transactionId || idempotencyKey || reservationCode}%`)
      .limit(1)

    if (yaProcesado && yaProcesado.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Evento de pago ya procesado previamente (Idempotencia respetada).",
        idempotent: true
      })
    }

    // 2. Generar PIN de cerradura inteligente dinámico si el pago fue aprobado
    let dynamicSmartLockPIN = ""
    if (status === "aprobado") {
      const pinNumero = Math.floor(1000 + Math.random() * 9000)
      dynamicSmartLockPIN = `#${pinNumero}#`
    }

    // 3. Registrar evento conciliado en auditoría
    await supabase.from("solicitudes_servicio").insert([
      {
        nombre: `Conciliación Pago ${reservationCode}`,
        email: "finanzas@gruposara.ec",
        tipo_servicio: "webhook_pago_procesado",
        mensaje: JSON.stringify({
          transactionId: transactionId || `TX-${Date.now()}`,
          reservationCode,
          amountUSD,
          status,
          smartLockPIN: dynamicSmartLockPIN,
          reconciledAt: new Date().toISOString()
        }, null, 2),
        estado: status === "aprobado" ? "aprobado" : "rechazado"
      }
    ])

    // 4. Actualizar estado de la reserva en stays_reservations si existe
    try {
      await supabase
        .from("stays_reservations")
        .update({
          payment_status: status === "aprobado" ? "aprobado" : "rechazado",
          reservation_status: status === "aprobado" ? "confirmada" : "pendiente_pago",
          smart_lock_pin: dynamicSmartLockPIN,
          updated_at: new Date().toISOString()
        })
        .eq("reservation_code", reservationCode)
    } catch {}

    return NextResponse.json({
      success: true,
      reservationCode,
      paymentStatus: status,
      smartLockAssigned: Boolean(dynamicSmartLockPIN),
      smartLockPIN: dynamicSmartLockPIN || undefined,
      message: `Pago de la reserva ${reservationCode} conciliado exitosamente.`
    })
  } catch (err: any) {
    console.error("Error en webhook de pagos:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
