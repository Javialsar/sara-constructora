import { NextRequest, NextResponse } from 'next/server';
import { SaraBankReconciliationService } from '@/lib/services/bankReconciliationService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      identificacion,
      monto,
      referencia,
      banco = 'BANCO_PICHINCHA',
      tipoModulo = 'firmas',
      tramiteId,
      comprobanteUrl,
      nombreTitular
    } = body;

    if (!monto || !referencia) {
      return NextResponse.json(
        { error: 'Monto y referencia bancaria son requeridos para la validación automática.' },
        { status: 400 }
      );
    }

    const resultado = await SaraBankReconciliationService.conciliarPagoAutomatico({
      identificacion,
      monto: Number(monto),
      referencia,
      banco,
      tipoModulo,
      tramiteId,
      comprobanteUrl,
      nombreTitular
    });

    return NextResponse.json({
      success: resultado.autoAprobado,
      data: resultado
    });
  } catch (error: any) {
    console.error('Error en API validar-comprobante-ia:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno al validar comprobante' },
      { status: 500 }
    );
  }
}
