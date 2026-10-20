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

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")
    let safeReturnUrl = `${siteUrl}/dashboard`

    if (typeof returnUrl === "string" && returnUrl.trim() !== "") {
      const trimmedUrl = returnUrl.trim()
      if (trimmedUrl.startsWith("/") && !trimmedUrl.startsWith("//")) {
        safeReturnUrl = `${siteUrl}${trimmedUrl}`
      } else if (process.env.NEXT_PUBLIC_SITE_URL && trimmedUrl.startsWith(process.env.NEXT_PUBLIC_SITE_URL)) {
        safeReturnUrl = trimmedUrl
      } else {
        return NextResponse.json({ error: "returnUrl inválida. Solo se permiten rutas internas o del dominio oficial." }, { status: 400 })
      }
    }

    // 1. Fetch dynamic plan details from DB
    const { data: plan, error: planError } = await supabase
      .from('planes_suscripcion')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 })
    }

    if (plan.precio <= 0) {
      return NextResponse.json({ error: "No se puede pagar un plan gratuito" }, { status: 400 })
    }

    const price = plan.precio;
    const interval = plan.frecuencia === 'año' ? 'year' : 'month';

    // 2. Crear Orden de Pago en Supabase
    const { data: orden, error: ordenError } = await supabase
      .from('ordenes_pago')
      .insert({
        user_id: user.id,
        modulo: 'saas',
        referencia_id: planId, // Ahora es el UUID real del plan
        concepto: `Suscripción SaaS APU - Plan ${plan.nombre}`,
        monto: price,
        estado: 'pendiente'
      })
      .select('id')
      .single()

    if (ordenError) {
      console.error("Error creando orden:", ordenError)
      return NextResponse.json({ error: "Error interno BD" }, { status: 500 })
    }

    // 3. Crear sesión de Stripe dinámica
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      client_reference_id: orden.id,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `SaaS APU Constructora - ${plan.nombre}`,
              description: plan.descripcion || "Suscripción al sistema APU.",
            },
            unit_amount: Math.round(price * 100), // Stripe expects cents
            recurring: {
              interval: interval,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${safeReturnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${safeReturnUrl}?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Error en Stripe Checkout:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
