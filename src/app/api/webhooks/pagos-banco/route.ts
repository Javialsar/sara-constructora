import { NextRequest, NextResponse } from 'next/server';
import { SaraBankReconciliationService } from '@/lib/services/bankReconciliationService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

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
