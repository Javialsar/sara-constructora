import { NextRequest, NextResponse } from 'next/server';
import { ComprasService } from '@/lib/services/comprasService';
import { authenticateProfessionalRequest } from '@/lib/auth/professionalAuthGuard';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const proyectoId = searchParams.get('proyectoId') || undefined;

    const requisiciones = ComprasService.getRequisiciones(proyectoId);
    return NextResponse.json({ success: true, count: requisiciones.length, data: requisiciones });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error consultando requisiciones' },
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

    if (!body.proyectoId || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'La requisición requiere proyectoId y al menos una partida válida.' },
        { status: 400 }
      );
    }

    const nueva = ComprasService.crearRequisicion({
      proyectoId: body.proyectoId,
      frenteTrabajo: body.frenteTrabajo || 'Frente Principal',
      solicitanteNombre: body.solicitanteNombre || auth.user.email || 'Residente de Obra',
      solicitanteCargo: body.solicitanteCargo || auth.user.role || 'Ingeniero Residente',
      fechaRequeridaObra: body.fechaRequeridaObra || new Date().toISOString().split('T')[0],
      prioridad: body.prioridad || 'NORMAL_PROGRAMADA',
      justificacion: body.justificacion || 'Requerimiento de materiales para avance de obra',
      items: body.items
    });

    return NextResponse.json({
      success: true,
      mensaje: `Requisición ${nueva.folio} creada exitosamente.`,
      data: nueva
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error creando requisición' },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
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
    const { id, estado, aprobador, motivo } = body;

    if (!id || !estado) {
      return NextResponse.json(
        { success: false, error: 'Se requiere id y nuevo estado' },
        { status: 400 }
      );
    }

    const actualizada = ComprasService.cambiarEstadoRequisicion(id, estado, {
      aprobador: aprobador || auth.user.email,
      motivo
    });

    return NextResponse.json({
      success: true,
      mensaje: `Estado de la requisición ${actualizada.folio} actualizado a ${estado}`,
      data: actualizada
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error actualizando requisición' },
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
    { success: false, error: 'Método PUT no implementado. Utilice PATCH para actualizar estados.' },
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
    { success: false, error: 'Método DELETE no permitido para requisiciones con trazabilidad.' },
    { status: 405 }
  );
}
