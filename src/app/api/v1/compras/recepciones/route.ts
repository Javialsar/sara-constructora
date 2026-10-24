import { NextRequest, NextResponse } from 'next/server';
import { ComprasService } from '@/lib/services/comprasService';
import { authenticateProfessionalRequest } from '@/lib/auth/professionalAuthGuard';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ordenCompraId = searchParams.get('ordenCompraId') || undefined;

    const recepciones = ComprasService.getRecepciones(ordenCompraId);
    return NextResponse.json({ success: true, count: recepciones.length, data: recepciones });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error obteniendo recepciones de bodega' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verificación de Seguridad Zero-Trust: Sesión y Rol Profesional Requerido
    const auth = await authenticateProfessionalRequest(req);
    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: auth.error || 'No autorizado' },
        { status: auth.status || 401 }
      );
    }

    const body = await req.json();

    if (!body.ordenCompraId || !body.itemsRecepcion || !Array.isArray(body.itemsRecepcion)) {
      return NextResponse.json(
        { success: false, error: 'Se requiere ordenCompraId y lista de itemsRecepcion.' },
        { status: 400 }
      );
    }

    const recepcion = ComprasService.registrarRecepcionMaterial({
      ordenCompraId: body.ordenCompraId,
      guiaRemisionNumero: body.guiaRemisionNumero || 'S/N',
      responsableBodeguero: body.responsableBodeguero || auth.user.email || 'Bodeguero de Turno',
      observaciones: body.observaciones || 'Ingreso conforme a pie de obra',
      itemsRecepcion: body.itemsRecepcion
    });

    return NextResponse.json({
      success: true,
      mensaje: `Recepción ${recepcion.folioRecepcion} registrada en bodega. Kardex y saldos pendientes actualizados.`,
      data: recepcion
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error registrando recepción' },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const auth = await authenticateProfessionalRequest(req);
  if (!auth.user) {
    return NextResponse.json(
      { success: false, error: auth.error || 'No autorizado' },
      { status: auth.status || 401 }
    );
  }
  return NextResponse.json(
    { success: false, error: 'Método PUT no implementado.' },
    { status: 405 }
  );
}

export async function DELETE(req: NextRequest) {
  const auth = await authenticateProfessionalRequest(req);
  if (!auth.user) {
    return NextResponse.json(
      { success: false, error: auth.error || 'No autorizado' },
      { status: auth.status || 401 }
    );
  }
  return NextResponse.json(
    { success: false, error: 'Método DELETE no permitido para actas de recepción.' },
    { status: 405 }
  );
}
