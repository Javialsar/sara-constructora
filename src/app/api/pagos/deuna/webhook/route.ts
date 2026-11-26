import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function verifyDeunaSignature(rawBody: string, headerSig: string | null, apiSecret: string): boolean {
  if (!headerSig) return false;
  const expected = crypto.createHmac('sha256', apiSecret).update(rawBody).digest('hex');
  const provided = headerSig.replace(/^sha256=/i, '').trim();
  if (expected.length !== provided.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(provided, 'utf8'));
}

export async function POST(req: NextRequest) {
  try {
    const apiSecret = process.env.DEUNA_API_SECRET;
    if (!apiSecret) {
      return NextResponse.json(
        { success: false, error: 'DEUNA_API_SECRET no configurado en servidor.' },
        { status: 503 }
      );
    }

    const rawBody = await req.text();
    const sig = req.headers.get('x-deuna-signature') || req.headers.get('x-signature');

    if (!verifyDeunaSignature(rawBody, sig, apiSecret)) {
      return NextResponse.json(
        { success: false, error: 'Firma HMAC de webhook Deuna! inválida o ausente.' },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);
    const txRef = String(event?.idTransaction || event?.transactionId || event?.internalTransactionReference || '');
    const status = String(event?.status || '').toUpperCase();

    if (!txRef) {
      return NextResponse.json({ success: false, error: 'Referencia de transacción Deuna! ausente.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: intent } = await admin
      .from('fletes_payment_intents')
      .select('*')
      .eq('gateway_ref', txRef)
      .maybeSingle();

    if (!intent) {
      return NextResponse.json({ success: true, ignored: true, reason: 'Intent Deuna! no encontrado' });
    }

    if (status === 'APPROVED' || status === 'PAID' || status === 'COMPLETED') {
      await admin
        .from('fletes_payment_intents')
        .update({ status: 'PAID', raw_response: event, updated_at: new Date().toISOString() })
        .eq('id', intent.id);

      if (intent.intent_type === 'topup') {
        await admin.rpc('topup_driver_wallet', {
          p_driver_id: intent.user_id,
          p_amount_usd: Number(intent.amount_usd),
          p_gateway: 'deuna',
          p_gateway_ref: txRef,
          p_metadata: { deunaWebhook: true, transferNumber: event?.transferNumber || null },
        });
      } else if (intent.order_id) {
        await admin
          .from('fletes_orders')
          .update({
            payment_method: 'deuna',
            payment_status: 'CAPTURED',
            gateway_ref: txRef,
            updated_at: new Date().toISOString(),
          })
          .eq('id', intent.order_id);
      }
    } else if (status === 'CANCELLED' || status === 'EXPIRED' || status === 'REJECTED') {
      await admin
        .from('fletes_payment_intents')
        .update({
          status: status === 'EXPIRED' ? 'EXPIRED' : 'FAILED',
          raw_response: event,
          updated_at: new Date().toISOString(),
        })
        .eq('id', intent.id);
    }

    return NextResponse.json({ success: true, processed: true, txRef });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error procesando webhook Deuna!';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
