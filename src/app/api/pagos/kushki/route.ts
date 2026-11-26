import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/auth/serverAuthGuard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const ALLOWED_DEFERRED_MONTHS = new Set([0, 3, 6, 9, 12]);

export async function POST(req: NextRequest) {
  try {
    // 1. Verificación obligatoria de autenticación Zero-Trust
    const { user } = await requireServerAuth(req);

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Cuerpo de petición inválido.' }, { status: 400 });
    }

    const {
      token,
      cardNumber,
      plan,
      planId,
      ordenId,
      orderId,
      amount,
      intentType = 'charge',
      deferredMonths = 0,
      ticketNumber,
      description,
    } = body;

    // 2. PCI DSS Compliance: rechazo estricto de PAN en texto claro
    if (cardNumber) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Violación PCI DSS: nunca transmita números de tarjeta en texto claro al servidor. Utilice Kushki.js para tokenización 1-Clic en cliente.',
        },
        { status: 400 }
      );
    }

    const merchantId = process.env.KUSHKI_PRIVATE_MERCHANT_ID;
    if (!merchantId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Pasarela Kushki no configurada: falta KUSHKI_PRIVATE_MERCHANT_ID en las variables de entorno del servidor.',
        },
        { status: 503 }
      );
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = isProduction ? 'https://api.kushkipagos.com' : 'https://api-uat.kushkipagos.com';
    const supabaseAdmin = createAdminClient();
    const targetFleteOrderId: string | null = typeof orderId === 'string' && orderId ? orderId : null;

    // 2.1 Operaciones sobre pre-autorización existente (capture / void)
    if (intentType === 'capture' || intentType === 'void') {
      if (!ticketNumber || typeof ticketNumber !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Se requiere ticketNumber de pre-autorización Kushki.' },
          { status: 400 }
        );
      }

      const numAmount = Number(amount);
      if (intentType === 'capture' && (!Number.isFinite(numAmount) || numAmount <= 0)) {
        return NextResponse.json({ success: false, error: 'Monto de captura inválido.' }, { status: 400 });
      }

      const endpoint =
        intentType === 'capture'
          ? `${baseUrl}/card/v1/capture`
          : `${baseUrl}/card/v1/void/${encodeURIComponent(ticketNumber)}`;

      const gatewayRes = await fetch(endpoint, {
        method: intentType === 'capture' ? 'POST' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Private-Merchant-Id': merchantId,
        },
        body:
          intentType === 'capture'
            ? JSON.stringify({
                ticketNumber,
                amount: {
                  currency: 'USD',
                  subtotalIva: 0,
                  subtotalIva0: Number(numAmount.toFixed(2)),
                  iva: 0,
                  ice: 0,
                },
                fullResponse: true,
              })
            : undefined,
      });

      const raw = await gatewayRes.json().catch(() => null);
      if (!gatewayRes.ok) {
        return NextResponse.json(
          {
            success: false,
            error: raw?.message || `Error ejecutando ${intentType} en Kushki.`,
            code: raw?.code || 'KUSHKI_ERROR',
          },
          { status: 402 }
        );
      }

      await supabaseAdmin
        .from('fletes_payment_intents')
        .update({
          status: intentType === 'capture' ? 'CAPTURED' : 'VOIDED',
          raw_response: raw || {},
          updated_at: new Date().toISOString(),
        })
        .eq('kushki_ticket_number', ticketNumber);

      return NextResponse.json({
        success: true,
        status: intentType === 'capture' ? 'CAPTURED' : 'VOIDED',
        ticketNumber: raw?.ticketNumber || ticketNumber,
      });
    }

    // 3. Validación de token para charge / preauth / topup
    if (!token || typeof token !== 'string' || token.trim().length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token de pago Kushki inválido o ausente. Se requiere tokenización previa en cliente (Kushki.js).',
        },
        { status: 400 }
      );
    }

    const parsedDeferred = Number(deferredMonths) || 0;
    if (!ALLOWED_DEFERRED_MONTHS.has(parsedDeferred)) {
      return NextResponse.json(
        { success: false, error: 'Plazo diferido inválido. Solo se permiten 0, 3, 6, 9 o 12 meses.' },
        { status: 400 }
      );
    }

    // 4. Validación y recálculo de monto en servidor (Anti-Tampering)
    let verifiedAmount = 0;

    if (targetFleteOrderId && intentType !== 'topup') {
      const { data: fleteOrder } = await supabaseAdmin
        .from('fletes_orders')
        .select('id, customer_id, quoted_price_usd, guarantee_deposit_usd')
        .eq('id', targetFleteOrderId)
        .maybeSingle();

      if (fleteOrder) {
        if (fleteOrder.customer_id !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Acceso denegado: Orden de flete ajena.' },
            { status: 403 }
          );
        }
        verifiedAmount =
          intentType === 'preauth' && Number(fleteOrder.guarantee_deposit_usd) > 0
            ? Number(fleteOrder.guarantee_deposit_usd)
            : Number(fleteOrder.quoted_price_usd);
      }
    }

    if (!verifiedAmount && ordenId) {
      const { data: ordenDb } = await supabaseAdmin
        .from('ordenes_pago')
        .select('id, monto, user_id')
        .eq('id', ordenId)
        .maybeSingle();

      if (ordenDb && Number(ordenDb.monto) > 0) {
        if (ordenDb.user_id !== user.id) {
          return NextResponse.json({ success: false, error: 'Acceso denegado: Orden de pago ajena.' }, { status: 403 });
        }
        verifiedAmount = Number(ordenDb.monto);
      }
    }

    if (!verifiedAmount && planId) {
      const { data: planDb } = await supabaseAdmin
        .from('planes_suscripcion')
        .select('id, precio')
        .eq('id', planId)
        .maybeSingle();

      if (planDb && Number(planDb.precio) > 0) {
        verifiedAmount = Number(planDb.precio);
      }
    }

    if (verifiedAmount > 0) {
      if (amount && Math.abs(Number(amount) - verifiedAmount) > 0.05) {
        return NextResponse.json(
          {
            success: false,
            error: `Discrepancia de monto detectada. Valor oficial verificado: $${verifiedAmount.toFixed(2)} USD.`,
          },
          { status: 400 }
        );
      }
    } else {
      verifiedAmount = Number(amount);
      if (!Number.isFinite(verifiedAmount) || verifiedAmount <= 0) {
        return NextResponse.json({ success: false, error: 'Monto de pago inválido.' }, { status: 400 });
      }
    }

    const numAmount = Number(verifiedAmount.toFixed(2));
    const isPreauth = intentType === 'preauth';
    const kushkiEndpoint = isPreauth
      ? `${baseUrl}/card/v1/preAuthorization`
      : `${baseUrl}/card/v1/charges`;

    const payload: Record<string, unknown> = {
      token: token.trim(),
      amount: {
        subtotalIva: 0,
        subtotalIva0: numAmount,
        ice: 0,
        iva: 0,
        currency: 'USD',
      },
      fullResponse: true,
      metadata: {
        userId: user.id,
        userEmail: user.email,
        orderId: targetFleteOrderId || ordenId || null,
        intentType,
        plan: plan || description || 'SARA FLETES',
      },
    };

    if (!isPreauth && parsedDeferred > 0) {
      payload.deferred = {
        creditType: '02', // Diferido con intereses Ecuador
        months: parsedDeferred,
        graceMonths: '00',
      };
    }

    const gatewayRes = await fetch(kushkiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Private-Merchant-Id': merchantId,
      },
      body: JSON.stringify(payload),
    });

    const rawGatewayResponse = await gatewayRes.json().catch(() => null);

    if (!gatewayRes.ok || (rawGatewayResponse?.details?.responseCode && rawGatewayResponse.details.responseCode !== '000')) {
      const errorMsg =
        rawGatewayResponse?.message ||
        rawGatewayResponse?.details?.responseText ||
        'Transacción rechazada por Kushki / entidad bancaria.';
      return NextResponse.json(
        {
          success: false,
          error: errorMsg,
          code: rawGatewayResponse?.code || rawGatewayResponse?.details?.responseCode || 'GATEWAY_DECLINED',
        },
        { status: 402 }
      );
    }

    const resolvedTicket =
      rawGatewayResponse?.ticketNumber || rawGatewayResponse?.details?.ticketNumber || `KSH-${Date.now()}`;
    const preauthExpiresAt = isPreauth
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // 5. Registrar intención real en fletes_payment_intents
    await supabaseAdmin.from('fletes_payment_intents').insert({
      order_id: targetFleteOrderId,
      user_id: user.id,
      gateway: 'kushki',
      intent_type: isPreauth ? 'preauth' : intentType === 'topup' ? 'topup' : 'charge',
      amount_usd: numAmount,
      deferred_months: parsedDeferred,
      status: isPreauth ? 'AUTHORIZED' : 'PAID',
      gateway_ref: resolvedTicket,
      kushki_ticket_number: resolvedTicket,
      preauth_expires_at: preauthExpiresAt,
      raw_response: rawGatewayResponse || {},
    });

    if (targetFleteOrderId) {
      await supabaseAdmin
        .from('fletes_orders')
        .update({
          payment_method: 'kushki',
          payment_status: isPreauth ? 'PREAUTHORIZED' : 'CAPTURED',
          gateway_ref: resolvedTicket,
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetFleteOrderId);
    }

    // Si es recarga directa de billetera aprobada síncronamente, acreditar atómicamente vía RPC
    if (intentType === 'topup') {
      await supabaseAdmin.rpc('topup_driver_wallet', {
        p_driver_id: user.id,
        p_amount_usd: numAmount,
        p_gateway: 'kushki',
        p_gateway_ref: resolvedTicket,
        p_metadata: { source: 'kushki_direct_charge', deferredMonths: parsedDeferred },
      });
    }

    return NextResponse.json({
      success: true,
      transactionId: resolvedTicket,
      ticketNumber: resolvedTicket,
      preauthExpiresAt,
      status: isPreauth ? 'AUTHORIZED' : 'APPROVED',
      message: isPreauth
        ? 'Pre-autorización de garantía aprobada (vigente 7 días calendario).'
        : 'Pago procesado exitosamente vía Kushki.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error procesando el pago en Kushki';
    const status = message.includes('No autenticado') ? 401 : message.includes('Acceso denegado') ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
