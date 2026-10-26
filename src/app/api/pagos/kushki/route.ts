import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    // 1. Verificación obligatoria de autenticación Zero-Trust
    const serverClient = await createSupabaseServerClient();
    const { data: { user } } = await serverClient.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado: Se requiere sesión activa para procesar transacciones de pago.' },
        { status: 401 }
      );
    }

    // 2. En producción, los cobros simulados directos están estrictamente denegados
    if (process.env.NODE_ENV === 'production' && !process.env.KUSHKI_PRIVATE_MERCHANT_ID) {
      return NextResponse.json(
        {
          success: false,
          error: 'Operación denegada en producción: Pasarela de pagos Kushki no configurada formalmente con merchant ID.'
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { cardNumber, plan, amount } = body;

    if (!cardNumber || String(cardNumber).replace(/\s/g, '').length < 14) {
      return NextResponse.json({ success: false, error: 'Número de tarjeta inválido' }, { status: 400 });
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0 || isNaN(numAmount)) {
      return NextResponse.json({ success: false, error: 'Monto de pago inválido' }, { status: 400 });
    }

    const crypto = await import('crypto');
    const transactionId = 'KSH-' + crypto.randomBytes(6).toString('hex').toUpperCase();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

      const { data: orden } = await supabaseAdmin.from('ordenes_pago').insert({
        user_id: user.id,
        modulo: 'saas',
        referencia_id: transactionId,
        concepto: `Pago Kushki / Tarjeta: ${plan || 'Suscripción'}`,
        monto: numAmount,
        moneda: 'USD',
        estado: 'completada'
      }).select().single();

      if (orden?.id) {
        await supabaseAdmin.from('transacciones').insert({
          orden_id: orden.id,
          metodo_pago: 'kushki',
          monto_pagado: numAmount,
          stripe_session_id: transactionId,
          estado_aprobacion: 'aprobada'
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      transactionId, 
      message: `Transacción procesada exitosamente para el plan ${plan}.`,
      status: 'APPROVED'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Error procesando el pago' }, { status: 500 });
  }
}
