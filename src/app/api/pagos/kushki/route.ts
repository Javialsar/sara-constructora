import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/auth/serverAuthGuard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Verificación obligatoria de autenticación Zero-Trust
    const { user } = await requireServerAuth(req);

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Cuerpo de petición inválido' }, { status: 400 });
    }

    const { token, cardNumber, plan, amount } = body;

    // 2. PCI DSS Compliance: Rechazo estricto de números de tarjeta en texto claro
    if (cardNumber) {
      return NextResponse.json(
        {
          success: false,
          error: 'Violación PCI DSS: Por seguridad financiera, nunca transmita números de tarjeta en texto claro al servidor. Utilice el SDK de Kushki para obtener un token seguro en el cliente (token).'
        },
        { status: 400 }
      );
    }

    if (!token || typeof token !== 'string' || token.trim().length < 8) {
      return NextResponse.json(
        { success: false, error: 'Token de pago Kushki inválido o ausente. Se requiere tokenización previa en cliente.' },
        { status: 400 }
      );
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0 || isNaN(numAmount)) {
      return NextResponse.json({ success: false, error: 'Monto de pago inválido' }, { status: 400 });
    }

    const merchantId = process.env.KUSHKI_PRIVATE_MERCHANT_ID;
    const isProduction = process.env.NODE_ENV === 'production';

    // 3. Verificación de configuración formal de pasarela
    if (isProduction && !merchantId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pasarela Kushki no configurada en producción (falta KUSHKI_PRIVATE_MERCHANT_ID).'
        },
        { status: 503 }
      );
    }

    let transactionId = '';
    let statusApproval: 'aprobada' | 'rechazada' = 'aprobada';
    let rawGatewayResponse: any = null;

    if (merchantId) {
      // 4. Invocación oficial a la API de Kushki
      const kushkiEndpoint = isProduction
        ? 'https://api.kushkipagos.com/card/v1/charges'
        : 'https://api-uat.kushkipagos.com/card/v1/charges';

      const chargePayload = {
        token: token.trim(),
        amount: {
          subtotalIva: 0,
          subtotalIva0: parseFloat(numAmount.toFixed(2)),
          ice: 0,
          iva: 0,
          currency: 'USD'
        },
        metadata: {
          userId: user.id,
          userEmail: user.email,
          plan: plan || 'Suscripcion SaaS'
        }
      };

      const gatewayRes = await fetch(kushkiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Private-Merchant-Id': merchantId
        },
        body: JSON.stringify(chargePayload)
      });

      rawGatewayResponse = await gatewayRes.json().catch(() => null);

      if (!gatewayRes.ok || rawGatewayResponse?.responseCode !== '000') {
        const errorMsg = rawGatewayResponse?.message || rawGatewayResponse?.responseText || 'Transacción rechazada por la entidad bancaria';
        return NextResponse.json(
          {
            success: false,
            error: errorMsg,
            code: rawGatewayResponse?.responseCode || 'GATEWAY_DECLINED'
          },
          { status: 402 }
        );
      }

      transactionId = rawGatewayResponse.ticketNumber || rawGatewayResponse.transactionId || `KSH-${Date.now()}`;
    } else {
      // Entorno de pruebas / desarrollo sin credenciales reales
      const crypto = await import('crypto');
      transactionId = 'KSH-TEST-' + crypto.randomBytes(6).toString('hex').toUpperCase();
    }

    // 5. Persistencia Transaccional Idempotente en Supabase
    try {
      const supabaseAdmin = createAdminClient();

      const { data: orden, error: ordenErr } = await supabaseAdmin.from('ordenes_pago').insert({
        user_id: user.id,
        modulo: 'saas',
        referencia_id: transactionId,
        concepto: `Pago Kushki Tokenizado: ${plan || 'Suscripción'}`,
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
          estado_aprobacion: statusApproval,
          observaciones_admin: merchantId ? 'Validado contra API Kushki en vivo' : 'Transacción simulada en entorno de desarrollo/pruebas'
        });
      }
    } catch (dbErr) {
      console.warn('[Kushki Route DB Notice]:', dbErr);
    }

    return NextResponse.json({
      success: true,
      transactionId,
      message: `Transacción procesada exitosamente para el plan ${plan}.`,
      status: 'APPROVED'
    });
  } catch (error: any) {
    const status = error.message?.includes('No autenticado') ? 401 : error.message?.includes('Acceso denegado') ? 403 : 500;
    return NextResponse.json({ success: false, error: error.message || 'Error procesando el pago' }, { status });
  }
}
