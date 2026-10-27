import { NextResponse } from 'next/server';
import { PLANES_FACTURACION_DEFAULT } from '@/lib/constants/planesFacturacion';

export const dynamic = 'force-dynamic';

/**
 * GET /api/facturacion/planes
 * Retorna todos los planes configurados para el módulo de facturación electrónica
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      planes: PLANES_FACTURACION_DEFAULT,
      total: PLANES_FACTURACION_DEFAULT.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener planes' },
      { status: 500 }
    );
  }
}
