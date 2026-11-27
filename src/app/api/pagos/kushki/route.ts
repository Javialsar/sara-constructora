import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const ALLOWED_DEFERRED_MONTHS = new Set([0, 3, 6, 9, 12]);

function verifyHmacSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const provided = signatureHeader.replace(/^sha256=/i, '').trim();
  if (expected.length !== provided.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(provided, 'utf8'));
}

async function resolveAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token && token !== 'null' && token !== 'undefined') {
      const admin = createAdminClient();
      const { data, error } = await admin.auth.getUser(token);
      if (data?.user && !error) return data.user;
    }
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const merchantId = process.env.KUSHKI_PRIVATE_MERCHANT_ID;
    const webhookSecret = process.env.KUSHKI_WEBHOOK_SECRET || merchantId || '';

    // 0. Soporte para Webhook firmado con HMAC-SHA256 si viene encabezado de firma Kushki
    const webhookSig = req.headers.get('x-kushki-signature') || req.headers.get('x-signature');
    if (webhookSig) {
      if (!webhookSecret || !verifyHmacSignature(rawBody, webhookSig, webhookSecret)) {
        return NextResponse.json(
          { success: false, error: 'Firma HMAC de webhook Kushki inválida.' },
          { status: 401 }
        );
      }
      const event = JSON.parse(rawBody);
      const ticket = String(event?.ticketNumber || event?.transactionReference || '');
      const txStatus = String(event?.transactionStatus || event?.status || '').toUpperCase();
      if (!ticket) {
        return NextResponse.json({ success: false, error: 'ticketNumber ausente en webhook.' }, { status: 400 });
      }
      const admin = createAdminClient();
      const { data: intent } = await admin
        .from('fletes_payment_intents')
        .select('*')
        .eq('gateway_ref', ticket)
        .maybeSingle();

      if (intent && (txStatus === 'APPROVAL' || txStatus === 'APPROVED' || txStatus === 'CAPTURED')) {
        await admin
          .from('fletes_payment_intents')
          .update({ status: 'PAID', raw_response: event, updated_at: new Date().toISOString() })
          .eq('id', intent.id);

        if (intent.intent_type === 'topup') {
          await admin.rpc('topup_driver_wallet', {
            p_driver_id: intent.user_id,
            p_amount_usd: Number(intent.amount_usd),
            p_gateway: 'kushki',
            p_gateway_ref: ticket,
            p_metadata: { webhook: true },
          });
        }
      }
      return NextResponse.json({ success: true, webhookVerified: true, ticketNumber: ticket });
    }

    // 1. Verificación obligatoria de autenticación Zero-Trust vía supabase.auth.getUser()
    const user = await resolveAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado: Se requiere una sesión activa válida.' },
        { status: 401 }
      );
    }

    let body: Record<string, unknown> | null = null;
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = null;
    }
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
      fareParams,
    } = body as {
      token?: string;
      cardNumber?: string;
      plan?: string;
      planId?: string;
      ordenId?: string;
      orderId?: string;
      amount?: number;
      intentType?: string;
      deferredMonths?: number;
      ticketNumber?: string;
      description?: string;
      fareParams?: {
        category: string;
        originLat: number;
        originLng: number;
        destLat: number;
        destLng: number;
        distanceKm?: number;
        weightTon?: number;
        backhaul?: boolean;
      };
    };

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

    // 4. Validación y cálculo de tarifa en servidor mediante RPC atómica PostGIS (Anti-Tampering)
    let verifiedAmount = 0;

    if (fareParams && intentType !== 'topup') {
      const { data: rpcFare, error: rpcErr } = await supabaseAdmin.rpc('calculate_gobee_fare', {
        p_category: fareParams.category,
        p_origin_lat: fareParams.originLat,
        p_origin_lng: fareParams.originLng,
        p_dest_lat: fareParams.destLat,
        p_dest_lng: fareParams.destLng,
        p_distance_km: fareParams.distanceKm ?? null,
        p_weight_ton: fareParams.weightTon ?? 0,
        p_backhaul: Boolean(fareParams.backhaul),
      });

      if (!rpcErr && rpcFare?.fixed_fare_usd) {
        const minBid = Number(rpcFare.min_bid_usd);
        const maxBid = Number(rpcFare.max_bid_usd);
        const requested = Number(amount);
        if (Number.isFinite(requested) && requested >= minBid && requested <= maxBid) {
          verifiedAmount = requested;
        } else {
          verifiedAmount = Number(rpcFare.fixed_fare_usd);
        }
      }
    }

    if (!verifiedAmount && targetFleteOrderId && intentType !== 'topup') {
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
            error: `Discrepancia de monto detectada. Valor oficial verificado en servidor: $${verifiedAmount.toFixed(2)} USD.`,
          },
          { status: 400 }
        );
      }
    } else if (intentType === 'topup') {
      verifiedAmount = Number(amount);
      if (!Number.isFinite(verifiedAmount) || verifiedAmount < 5 || verifiedAmount > 5000) {
        return NextResponse.json(
          { success: false, error: 'Monto de recarga inválido (rango permitido: $5.00 – $5,000.00 USD).' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Se requiere orderId, ordenId, planId o fareParams para validar la tarifa en servidor.' },
        { status: 400 }
      );
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
        plan: plan || description || 'Gobee · Grupo Sara',
      },
    };

    if (!isPreauth && parsedDeferred > 0) {
      payload.deferred = {
        creditType: '02',
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
      verifiedAmountUSD: numAmount,
      status: isPreauth ? 'AUTHORIZED' : 'APPROVED',
      message: isPreauth
        ? 'Pre-autorización de garantía aprobada (vigente 7 días calendario).'
        : 'Pago procesado exitosamente vía Kushki.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error procesando el pago en Kushki';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
