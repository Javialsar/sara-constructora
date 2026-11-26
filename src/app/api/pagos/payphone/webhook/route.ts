import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

async function confirmPayphoneTransaction(id: number, clientTransactionId: string) {
  const token = process.env.PAYPHONE_TOKEN;
  if (!token) {
    throw new Error('PAYPHONE_TOKEN no configurado en servidor.');
  }

  // Confirmación server-to-server oficial contra PayPhone (evita falsificación de webhooks/redirects)
  const res = await fetch('https://pay.payphonetodoesposible.com/api/button/V2/Confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id, clientTxId: clientTransactionId }),
  });

  const data = await res.json().catch(() => null);
  return { ok: res.ok, data };
}

async function handlePayphoneVerification(id: number, clientTxId: string) {
  const { ok, data } = await confirmPayphoneTransaction(id, clientTxId);
  if (!ok || !data) {
    return { success: false, error: 'No se pudo confirmar la transacción con PayPhone.' };
  }

  const admin = createAdminClient();
  const { data: intent } = await admin
    .from('fletes_payment_intents')
    .select('*')
    .eq('gateway_ref', clientTxId)
    .maybeSingle();

  if (!intent) {
    return { success: false, error: 'Intención de pago PayPhone no encontrada.' };
  }

  const isApproved = data.statusCode === 3 || String(data.transactionStatus).toLowerCase() === 'approved';

  await admin
    .from('fletes_payment_intents')
    .update({
      status: isApproved ? 'PAID' : 'FAILED',
      raw_response: data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', intent.id);

  if (isApproved) {
    if (intent.intent_type === 'topup') {
      await admin.rpc('topup_driver_wallet', {
        p_driver_id: intent.user_id,
        p_amount_usd: Number(intent.amount_usd),
        p_gateway: 'payphone',
        p_gateway_ref: clientTxId,
        p_metadata: { payphoneId: id, authorizationCode: data.authorizationCode },
      });
    } else if (intent.order_id) {
      await admin
        .from('fletes_orders')
        .update({
          payment_method: 'payphone',
          payment_status: 'CAPTURED',
          gateway_ref: clientTxId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', intent.order_id);
    }
  }

  return { success: isApproved, data };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const id = Number(body?.id || body?.transactionId);
    const clientTxId = String(body?.clientTransactionId || body?.clientTxId || '');
    if (!id || !clientTxId) {
      return NextResponse.json({ success: false, error: 'Parámetros id y clientTransactionId requeridos.' }, { status: 400 });
    }
    const result = await handlePayphoneVerification(id, clientTxId);
    return NextResponse.json(result, { status: result.success ? 200 : 402 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error procesando webhook PayPhone';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const id = Number(req.nextUrl.searchParams.get('id'));
    const clientTxId = req.nextUrl.searchParams.get('clientTransactionId') || '';
    if (!id || !clientTxId) {
      return NextResponse.redirect(new URL('/fletes?payment=invalid', req.url));
    }
    const result = await handlePayphoneVerification(id, clientTxId);
    const target = result.success
      ? `/fletes?payment=approved&gateway=payphone&ref=${encodeURIComponent(clientTxId)}`
      : `/fletes?payment=declined&gateway=payphone`;
    return NextResponse.redirect(new URL(target, req.url));
  } catch {
    return NextResponse.redirect(new URL('/fletes?payment=error&gateway=payphone', req.url));
  }
}
