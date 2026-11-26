import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/auth/serverAuthGuard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireServerAuth(req);

    const apiKey = process.env.DEUNA_API_KEY;
    const apiSecret = process.env.DEUNA_API_SECRET;
    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Deuna! Empresas no está configurado en el servidor (faltan DEUNA_API_KEY y/o DEUNA_API_SECRET).',
        },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Payload inválido.' }, { status: 400 });
    }

    const { orderId, amountUsd, intentType = 'charge', description } = body;
    const numAmount = Number(amountUsd);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Monto inválido para cobro QR Deuna!.' }, { status: 400 });
    }

    const internalTxRef = `DEUNA-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const deunaBaseUrl =
      process.env.DEUNA_API_BASE_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://merchants.deuna.app/merchant/v1'
        : 'https://merchants-sandbox.deuna.app/merchant/v1');

    const payload = {
      idTransaction: internalTxRef,
      amount: Number(numAmount.toFixed(2)),
      detail: String(description || `SARA FLETES ${orderId || ''}`).slice(0, 80),
      internalTransactionReference: internalTxRef,
      format: '2', // QR dinámico + string EMVCo
    };

    const deunaRes = await fetch(`${deunaBaseUrl}/payment/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-api-secret': apiSecret,
      },
      body: JSON.stringify(payload),
    });

    const data = await deunaRes.json().catch(() => null);
    if (!deunaRes.ok || !data) {
      return NextResponse.json(
        {
          success: false,
          error: data?.message || 'Error generando QR dinámico en Deuna! Empresas.',
        },
        { status: 502 }
      );
    }

    const gatewayRef = data.transactionId || internalTxRef;
    const admin = createAdminClient();
    await admin.from('fletes_payment_intents').insert({
      order_id: typeof orderId === 'string' && orderId ? orderId : null,
      user_id: user.id,
      gateway: 'deuna',
      intent_type: intentType === 'topup' ? 'topup' : 'charge',
      amount_usd: Number(numAmount.toFixed(2)),
      deferred_months: 0,
      status: 'PENDING',
      gateway_ref: gatewayRef,
      raw_response: data,
    });

    return NextResponse.json({
      success: true,
      transactionId: gatewayRef,
      qrPayload: data.qr || data.qrString || data.deeplink || null,
      qrImageUrl: data.qrImage || null,
      status: 'PENDING_QR',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno en Deuna! Empresas';
    const status = message.includes('No autenticado') ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
