import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
      apiVersion: "2026-09-30.endive", 
    })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { planId, returnUrl } = body

    if (planId !== 'pro') {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 })
    }

    const price = 15.00; // Precio mensual

    // 1. Crear Orden de Pago en Supabase
    const { data: orden, error: ordenError } = await supabase
      .from('ordenes_pago')
      .insert({
        user_id: user.id,
        modulo: 'saas',
        referencia_id: planId,
        concepto: 'Suscripción Mensual SaaS APU Pro',
        monto: price,
        estado: 'pendiente'
      })
      .select('id')
      .single()

    if (ordenError) {
      console.error("Error creando orden:", ordenError)
      return NextResponse.json({ error: "Error interno BD" }, { status: 500 })
    }

    // 2. Crear sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      client_reference_id: orden.id, // Conectamos Stripe con Supabase a través del ID de orden
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "SaaS APU Constructora - Plan Pro",
              description: "Acceso completo a Presupuestos Reales, Cotizador y Exportaciones.",
            },
            unit_amount: price * 100, // En centavos
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Error en Stripe Checkout:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
