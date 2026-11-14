import { NextRequest, NextResponse } from 'next/server';
import { SaraBankReconciliationService } from '@/lib/services/bankReconciliationService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Verificación de Seguridad y Firma de Webhook Bancario
    const webhookSecret = process.env.BANK_WEBHOOK_SECRET || process.env.DEUNA_WEBHOOK_SECRET;
    const isProduction = process.env.NODE_ENV === 'production';

    const authHeader = req.headers.get('authorization') || '';
    const signatureHeader = req.headers.get('x-bank-signature') || req.headers.get('x-webhook-token') || req.headers.get('x-signature') || '';
    const urlToken = req.nextUrl.searchParams.get('token') || '';

    if (webhookSecret) {
      const providedSecret = signatureHeader || urlToken || (authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '');
      if (providedSecret !== webhookSecret) {
        return NextResponse.json(
          { error: 'Firma o secreto de webhook bancario inválido' },
          { status: 401 }
        );
      }
    } else if (isProduction) {
      // En producción es obligatorio tener configurado el secreto del webhook
      console.error('[BANK WEBHOOK CRITICAL]: BANK_WEBHOOK_SECRET no está configurado en producción');
      return NextResponse.json(
        { error: 'Configuración de seguridad del webhook bancario incompleta' },
        { status: 503 }
      );
    }

    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ error: 'Payload de webhook inválido' }, { status: 400 });
    }

    // Detección automática del origen del Webhook bancario
    // Formato 1: DeUna / Banco Pichincha QR
    // Formato 2: Kushki / Pasarela de Pagos
    // Formato 3: Notificación de depósito bancario (Email Inbound / Cash Management)
    let banco = 'BANCO_PICHINCHA';
    let referencia = rawBody.reference || rawBody.idTransaccion || rawBody.comprobante || rawBody.ticketNumber || '';
    let monto = Number(rawBody.amount || rawBody.monto || rawBody.value || 0);
    let identificacion = rawBody.cedula || rawBody.clientDocument || rawBody.metadata?.cedula || '';
    let nombreTitular = rawBody.clientName || rawBody.metadata?.nombre || '';

    // Si viene de DeUna
    if (rawBody.qrId || rawBody.deunaTransactionId || rawBody.channel === 'DEUNA') {
      banco = 'DEUNA_BANCO_PICHINCHA';
      referencia = rawBody.deunaTransactionId || rawBody.reference || `DEUNA-${Date.now().toString().slice(-6)}`;
    }

    // Si es un webhook de email bancario entrante (Resend Inbound / SendGrid / Postmark)
    if (rawBody.from && rawBody.subject && rawBody.text) {
      const emailText = `${rawBody.subject} ${rawBody.text}`;
      
      // Banco Pichincha matcher
      if (emailText.includes('Pichincha') || rawBody.from.includes('pichincha.com')) {
        banco = 'BANCO_PICHINCHA';
        const montoMatch = emailText.match(/\$\s*([0-9]+(?:\.[0-9]{2})?)/);
        if (montoMatch) monto = parseFloat(montoMatch[1]);
        const refMatch = emailText.match(/(?:documento|comprobante|referencia)\s*(?:no\.?|nro\.?|#)?\s*([0-9A-Za-z-]+)/i);
        if (refMatch) referencia = refMatch[1];
      }
      // Banco Guayaquil matcher
      else if (emailText.includes('Guayaquil') || rawBody.from.includes('bancoguayaquil.com')) {
        banco = 'BANCO_GUAYAQUIL';
        const montoMatch = emailText.match(/\$\s*([0-9]+(?:\.[0-9]{2})?)/);
        if (montoMatch) monto = parseFloat(montoMatch[1]);
        const refMatch = emailText.match(/(?:control|transacci[oó]n|referencia)\s*(?:no\.?|nro\.?|#)?\s*([0-9A-Za-z-]+)/i);
        if (refMatch) referencia = refMatch[1];
      }
    }

    if (!monto || !referencia) {
      return NextResponse.json({
        received: true,
        message: 'Payload bancario recibido, pero no contiene monto y referencia suficientes para conciliación.'
      });
    }

    const conciliacion = await SaraBankReconciliationService.conciliarPagoAutomatico({
      identificacion,
      monto,
      referencia,
      banco,
      nombreTitular
    });

    return NextResponse.json({
      success: true,
      conciliado: conciliacion.autoAprobado,
      mensaje: conciliacion.mensaje,
      detalle: conciliacion.detalle
    });

  } catch (error: any) {
    console.error('Error procesando Webhook bancario:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno procesando webhook bancario' },
      { status: 500 }
    );
  }
}
