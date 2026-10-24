import { NextRequest, NextResponse } from 'next/server';
import { ComprasService } from '@/lib/services/comprasService';
import { authenticateProfessionalRequest } from '@/lib/auth/professionalAuthGuard';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const proyectoId = searchParams.get('proyectoId') || undefined;

    const ordenes = ComprasService.getOrdenesCompra(proyectoId);
    return NextResponse.json({ success: true, count: ordenes.length, data: ordenes });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error obteniendo órdenes de compra' },
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

    if (!body.cotizacionId) {
      return NextResponse.json(
        { success: false, error: 'Se requiere cotizacionId para emitir la Orden de Compra.' },
        { status: 400 }
      );
    }

    const nuevaOC = ComprasService.emitirOrdenCompraDesdeCotizacion({
      cotizacionId: body.cotizacionId,
      responsableEmision: body.responsableEmision || auth.user.email || 'Jefe de Compras SARA',
      responsableAprobacion: body.responsableAprobacion || 'Dirección de Fiscalización',
      direccionEntrega: body.direccionEntrega,
      notasTerminos: body.notasTerminos
    });

    return NextResponse.json({
      success: true,
      mensaje: `Orden de Compra ${nuevaOC.folio} emitida exitosamente con precios y cantidades congeladas.`,
      data: nuevaOC
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error emitiendo orden de compra' },
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
    { success: false, error: 'Método PUT no implementado para órdenes de compra.' },
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
    { success: false, error: 'Método DELETE no permitido para órdenes de compra auditadas.' },
    { status: 405 }
  );
}
