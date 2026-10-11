import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cardNumber, plan, amount } = body;

    // Simulación de validación de Kushki Pagos (Ecuador) o Stripe
    if (!cardNumber || cardNumber.length < 14) {
      return NextResponse.json({ success: false, error: 'Tarjeta inválida' }, { status: 400 });
    }

    // Simulamos el retraso de la pasarela bancaria
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Generamos un token de transacción simulado
    const transactionId = 'KSH-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    // Registrar en Supabase ordenes_pago y transacciones
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (supabaseUrl && serviceRoleKey) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
      
      const { data: orden } = await supabaseAdmin.from('ordenes_pago').insert({
        modulo: 'saas',
        referencia_id: transactionId,
        concepto: `Pago Kushki / Tarjeta: ${plan || 'Suscripción'}`,
        monto: Number(amount) || 0,
        moneda: 'USD',
        estado: 'completada'
      }).select().single()

      if (orden?.id) {
        await supabaseAdmin.from('transacciones').insert({
          orden_id: orden.id,
          metodo_pago: 'stripe', // pasarela electrónica
          monto_pagado: Number(amount) || 0,
          stripe_session_id: transactionId,
          estado_aprobacion: 'aprobada'
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      transactionId, 
      message: `Tokenización y cobro de $${amount} para el plan ${plan} exitoso y registrado en Supabase.`,
      status: 'APPROVED'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error procesando el pago' }, { status: 500 });
  }
}
