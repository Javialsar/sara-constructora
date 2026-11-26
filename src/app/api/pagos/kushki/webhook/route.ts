import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function verifyHmacSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const provided = signatureHeader.replace(/^sha256=/i, '').trim();
  if (expected.length !== provided.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(provided, 'utf8'));
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.KUSHKI_PRIVATE_MERCHANT_ID;
    if (!secret) {
      return NextResponse.json(
        { success: false, error: 'KUSHKI_PRIVATE_MERCHANT_ID no configurado en servidor.' },
        { status: 503 }
      );
    }

    const rawBody = await req.text();
    const signature = req.headers.get('x-kushki-signature') || req.headers.get('x-signature');

    if (!verifyHmacSignature(rawBody, signature, secret)) {
      return NextResponse.json(
        { success: false, error: 'Firma de webhook Kushki inválida o ausente.' },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);
    const ticketNumber: string = event?.ticketNumber || event?.transactionReference || '';
    const status: string = String(event?.transactionStatus || event?.status || '').toUpperCase();

    if (!ticketNumber) {
      return NextResponse.json({ success: false, error: 'ticketNumber ausente en webhook Kushki.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: intent } = await admin
      .from('fletes_payment_intents')
      .select('*')
      .eq('gateway_ref', ticketNumber)
      .maybeSingle();

    if (!intent) {
      return NextResponse.json({ success: true, ignored: true, reason: 'Intent no registrado localmente' });
    }

    if (status === 'APPROVAL' || status === 'APPROVED' || status === 'CAPTURED') {
      await admin
        .from('fletes_payment_intents')
        .update({ status: 'PAID', raw_response: event, updated_at: new Date().toISOString() })
        .eq('id', intent.id);

      if (intent.intent_type === 'topup') {
        await admin.rpc('topup_driver_wallet', {
          p_driver_id: intent.user_id,
          p_amount_usd: Number(intent.amount_usd),
          p_gateway: 'kushki',
          p_gateway_ref: ticketNumber,
          p_metadata: { webhook: true },
        });
      }
    } else if (status === 'DECLINED' || status === 'FAILED' || status === 'VOIDED') {
      await admin
        .from('fletes_payment_intents')
        .update({
          status: status === 'VOIDED' ? 'VOIDED' : 'FAILED',
          raw_response: event,
          updated_at: new Date().toISOString(),
        })
        .eq('id', intent.id);
    }

    return NextResponse.json({ success: true, processed: true, ticketNumber });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error procesando webhook Kushki';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
