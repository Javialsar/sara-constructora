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
 * Valida firma criptográfica, idempotencia, actualiza estado de la reserva y genera clave de acceso temporal
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get("x-signature") || request.headers.get("stripe-signature") || ""
    const webhookSecret = process.env.STAYS_PAYMENT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET

    // Validación Criptográfica Zero-Trust de Firma de Webhook
    if (process.env.NODE_ENV === "production" && !webhookSecret) {
      console.error("[CRITICAL] STAYS_PAYMENT_WEBHOOK_SECRET no está configurado en producción.")
      return NextResponse.json({ error: "Configuración de webhook inválida en producción" }, { status: 500 })
    }

    if (webhookSecret) {
      if (!signature) {
        return NextResponse.json({ error: "Firma criptográfica obligatoria ausente (x-signature)" }, { status: 401 })
      }

      const expectedHmac = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex")
      const sigClean = signature.replace(/^sha256=/i, "").trim()

      const isSignatureValid =
        sigClean.length === expectedHmac.length &&
        crypto.timingSafeEqual(Buffer.from(sigClean, "utf8"), Buffer.from(expectedHmac, "utf8"))

      if (!isSignatureValid) {
        return NextResponse.json({ error: "Firma criptográfica de webhook inválida" }, { status: 401 })
      }
    }

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

    // 2. Generar PIN de cerradura inteligente criptográficamente seguro si el pago fue aprobado
    let dynamicSmartLockPIN = ""
    if (status === "aprobado") {
      const pinNumero = crypto.randomInt(100000, 999999)
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
