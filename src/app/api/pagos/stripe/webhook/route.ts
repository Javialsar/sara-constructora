import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production" && !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Webhook Error: STRIPE_WEBHOOK_SECRET no está configurado en producción")
    return NextResponse.json({ error: "Configuración de webhook inválida en producción" }, { status: 500 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
    apiVersion: "2026-09-30.endive",
  })
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_dummy"

  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Si el evento es checkout session completed (El usuario pagó)
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const ordenId = session.client_reference_id

    if (ordenId) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // CONTROL DE IDEMPOTENCIA ZERO-TRUST:
      // Verificar si la sesión de Stripe ya fue procesada para evitar transacciones duplicadas
      const { data: existingTx } = await supabaseAdmin
        .from('transacciones')
        .select('id')
        .eq('stripe_session_id', session.id)
        .maybeSingle()

      if (existingTx) {
        console.log(`[Stripe Webhook] Idempotencia activada: Sesión ${session.id} ya fue registrada y procesada previamente.`)
        return NextResponse.json({ received: true, deduplicated: true })
      }

      // 1. Obtener la orden de pago, ahora necesitamos referencia_id que es el planId
      const { data: orden } = await supabaseAdmin.from('ordenes_pago').select('user_id, monto, referencia_id, estado').eq('id', ordenId).single()
      
      if (orden) {
        // 2. Marcar la orden como completada
        await supabaseAdmin.from('ordenes_pago').update({ estado: 'completada' }).eq('id', ordenId)

        // 3. Registrar la Transacción con deduplicación garantizada
        await supabaseAdmin.from('transacciones').insert({
          orden_id: ordenId,
          metodo_pago: 'stripe',
          monto_pagado: orden.monto,
          stripe_session_id: session.id,
          estado_aprobacion: 'aprobada'
        })

        // 4. Activar o renovar la Suscripción SaaS
        const hoy = new Date()
        const mesSiguiente = new Date(hoy)
        mesSiguiente.setDate(mesSiguiente.getDate() + 30)

        const { data: subExistente } = await supabaseAdmin.from('suscripciones_saas').select('id').eq('user_id', orden.user_id).single()

        if (subExistente) {
            await supabaseAdmin.from('suscripciones_saas').update({
                plan_id: orden.referencia_id, // Usamos el ID de la base de datos
                estado: 'activa',
                ultima_orden_id: ordenId,
                fecha_fin: mesSiguiente.toISOString()
            }).eq('user_id', orden.user_id)
        } else {
            await supabaseAdmin.from('suscripciones_saas').insert({
                user_id: orden.user_id,
                plan_id: orden.referencia_id, // Usamos el ID de la base de datos
                estado: 'activa',
                ultima_orden_id: ordenId,
                fecha_inicio: hoy.toISOString(),
                fecha_fin: mesSiguiente.toISOString()
            })
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
