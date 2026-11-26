import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/auth/serverAuthGuard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireServerAuth(req);

    const token = process.env.PAYPHONE_TOKEN;
    const storeId = process.env.PAYPHONE_STORE_ID;
    if (!token || !storeId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'PayPhone no está configurado en el servidor (faltan PAYPHONE_TOKEN y/o PAYPHONE_STORE_ID).',
        },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Payload inválido.' }, { status: 400 });
    }

    const { orderId, amountUsd, intentType = 'charge', email, phoneNumber, description } = body;
    const numAmount = Number(amountUsd);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Monto inválido para PayPhone.' }, { status: 400 });
    }

    const amountCents = Math.round(numAmount * 100);
    const clientTransactionId = `SARA-PP-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const appOrigin = req.nextUrl.origin;

    // API oficial PayPhone Button Prepare (Ecuador, monto en centavos USD)
    const payphoneRes = await fetch('https://pay.payphonetodoesposible.com/api/button/Prepare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: amountCents,
        amountWithoutTax: amountCents,
        amountWithTax: 0,
        tax: 0,
        service: 0,
        tip: 0,
        currency: 'USD',
        storeId,
        clientTransactionId,
        reference: String(description || `SARA FLETES ${orderId || ''}`).slice(0, 100),
        responseUrl: `${appOrigin}/api/pagos/payphone/webhook`,
        cancellationUrl: `${appOrigin}/fletes?payment=cancelled`,
        email: email || user.email || undefined,
        phoneNumber: phoneNumber || undefined,
      }),
    });

    const data = await payphoneRes.json().catch(() => null);
    if (!payphoneRes.ok || !data?.paymentId) {
      return NextResponse.json(
        {
          success: false,
          error: data?.message || 'Error preparando cajita de pagos PayPhone.',
        },
        { status: 502 }
      );
    }

    const admin = createAdminClient();
    await admin.from('fletes_payment_intents').insert({
      order_id: typeof orderId === 'string' && orderId ? orderId : null,
      user_id: user.id,
      gateway: 'payphone',
      intent_type: intentType === 'topup' ? 'topup' : 'charge',
      amount_usd: Number(numAmount.toFixed(2)),
      deferred_months: 0,
      status: 'PENDING',
      gateway_ref: clientTransactionId,
      raw_response: data,
    });

    return NextResponse.json({
      success: true,
      paymentId: data.paymentId,
      clientTransactionId,
      payWithCard: data.payWithCard,
      payWithPayPhone: data.payWithPayPhone,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno en PayPhone';
    const status = message.includes('No autenticado') ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
