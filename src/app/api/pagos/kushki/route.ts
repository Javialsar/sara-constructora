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

    const { token, cardNumber, plan, planId, ordenId, amount } = body;

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

    // 2.1 Validación y Recálculo del Monto en Servidor (Anti-Tampering OWASP API6)
    let verifiedAmount: number = 0;
    const supabaseAdmin = createAdminClient();

    if (ordenId) {
      const { data: ordenDb } = await supabaseAdmin
        .from('ordenes_pago')
        .select('id, monto, user_id, estado')
        .eq('id', ordenId)
        .maybeSingle();

      if (ordenDb && ordenDb.monto > 0) {
        if (ordenDb.user_id !== user.id) {
          return NextResponse.json({ success: false, error: 'Acceso denegado: Orden de pago ajena.' }, { status: 403 });
        }
        verifiedAmount = Number(ordenDb.monto);
      }
    }

    if (!verifiedAmount && planId) {
      const { data: planDb } = await supabaseAdmin
        .from('planes_suscripcion')
        .select('id, precio, nombre')
        .eq('id', planId)
        .maybeSingle();

      if (planDb && planDb.precio > 0) {
        verifiedAmount = Number(planDb.precio);
      }
    }

    // Catálogo fallback oficial de planes SaaS del ecosistema
    const OFFICIAL_PLANS: Record<string, number> = {
      'PLAN_PRO_ANUAL': 18.00,
      'FIRMA_NATURAL_1A': 18.00,
      'FIRMA_JURIDICA_2A': 38.00,
      'BOLSA_15_DOCS': 3.99,
      'PASE_MENSUAL_30D': 7.99,
      'COMBO_ANUAL_VIP': 59.99,
      'STARTER': 49.00,
      'PRO': 149.00,
      'ENTERPRISE': 399.00,
      'APU_BASICO': 9.99,
      'APU_PRO': 19.99,
      'APU_ENTERPRISE': 49.99,
      'CONSTRUCTORA_BASICO': 29.00,
      'CONSTRUCTORA_PRO': 79.00,
      'CONSTRUCTORA_VIP': 189.00
    };

    if (!verifiedAmount && plan && typeof plan === 'string') {
      const cleanPlanKey = plan.toUpperCase().replace(/\s+/g, '_');
      if (OFFICIAL_PLANS[cleanPlanKey]) {
        verifiedAmount = OFFICIAL_PLANS[cleanPlanKey];
      }
    }

    // Si se verificó precio en servidor, validar contra amount del cliente para evitar manipulación
    if (verifiedAmount > 0) {
      if (amount && Math.abs(Number(amount) - verifiedAmount) > 0.05) {
        return NextResponse.json({
          success: false,
          error: `Discrepancia de monto detectada. El valor oficial del plan es $${verifiedAmount.toFixed(2)} USD.`
        }, { status: 400 });
      }
    } else {
      verifiedAmount = Number(amount);
      if (!verifiedAmount || verifiedAmount <= 0 || isNaN(verifiedAmount)) {
        return NextResponse.json({ success: false, error: 'Monto de pago inválido o plan no identificado' }, { status: 400 });
      }
    }

    const numAmount = verifiedAmount;

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

    // 5. Persistencia Transaccional Idempotente en Supabase (Con fallo estricto)
    try {
      const { data: orden, error: ordenErr } = await supabaseAdmin.from('ordenes_pago').insert({
        user_id: user.id,
        modulo: 'saas',
        referencia_id: transactionId,
        concepto: `Pago Kushki Tokenizado: ${plan || 'Suscripción'}`,
        monto: numAmount,
        moneda: 'USD',
        estado: 'completada'
      }).select().single();

      if (ordenErr || !orden) {
        console.error('[Kushki Route DB Critical Error]:', ordenErr);
        return NextResponse.json({
          success: false,
          error: 'Error crítico de registro contable en base de datos. Transacción retenida para conciliación manual.',
          transactionId
        }, { status: 500 });
      }

      const { error: txErr } = await supabaseAdmin.from('transacciones').insert({
        orden_id: orden.id,
        metodo_pago: 'kushki',
        monto_pagado: numAmount,
        stripe_session_id: transactionId,
        estado_aprobacion: statusApproval,
        observaciones_admin: merchantId ? 'Validado contra API Kushki en vivo' : 'Transacción simulada en entorno de desarrollo/pruebas'
      });

      if (txErr) {
        console.error('[Kushki Route DB Tx Error]:', txErr);
        return NextResponse.json({
          success: false,
          error: 'Error registrando transacción contable en base de datos.',
          transactionId
        }, { status: 500 });
      }
    } catch (dbErr: any) {
      console.error('[Kushki Route DB Fatal Exception]:', dbErr);
      return NextResponse.json({
        success: false,
        error: 'Excepción de base de datos durante el registro contable de la transacción.',
        transactionId
      }, { status: 500 });
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
