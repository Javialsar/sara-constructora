import { NextRequest, NextResponse } from 'next/server';
import { NominaController } from '@/lib/controllers/saraAdvancedControllers';
import { authenticateProfessionalRequest } from '@/lib/auth/professionalAuthGuard';

export async function POST(req: NextRequest) {
  try {
    // 1. Verificación de Seguridad y Sesión Profesional
    const auth = await authenticateProfessionalRequest(req);
    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: auth.error || 'No autorizado' },
        { status: auth.status || 401 }
      );
    }
    const body = await req.json();
    const result = await NominaController.calcular(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('[/api/v1/nominas/calcular Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error procesando el cálculo de nómina y tareo IESS',
      },
      { status: 400 }
    );
  }
}
