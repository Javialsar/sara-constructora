import { NextRequest, NextResponse } from 'next/server';
import { SaraBankReconciliationService } from '@/lib/services/bankReconciliationService';
import { requireServerAuth } from '@/lib/auth/serverAuthGuard';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Verificación obligatoria Zero-Trust de autenticación
    const { user, isAdmin } = await requireServerAuth(req);

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Cuerpo de petición inválido' }, { status: 400 });
    }

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

    // 2. Control de Acceso: usuarios no administradores solo pueden conciliar trámites propios
    const resultado = await SaraBankReconciliationService.conciliarPagoAutomatico({
      identificacion: identificacion || (user.user_metadata?.cedula || ''),
      monto: Number(monto),
      referencia: String(referencia).trim(),
      banco,
      tipoModulo,
      tramiteId,
      comprobanteUrl,
      nombreTitular: nombreTitular || (user.user_metadata?.nombre || user.email)
    });

    return NextResponse.json({
      success: resultado.autoAprobado,
      data: resultado
    });
  } catch (error: any) {
    const status = error.message?.includes('No autenticado') ? 401 : error.message?.includes('Acceso denegado') ? 403 : 500;
    return NextResponse.json(
      { error: error.message || 'Error interno al validar comprobante' },
      { status }
    );
  }
}
