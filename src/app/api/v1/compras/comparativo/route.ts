import { NextRequest, NextResponse } from 'next/server';
import { ComprasService } from '@/lib/services/comprasService';
import { authenticateProfessionalRequest } from '@/lib/auth/professionalAuthGuard';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requisicionId = searchParams.get('requisicionId') || undefined;

    const cotizaciones = ComprasService.getCotizaciones(requisicionId);
    return NextResponse.json({ success: true, count: cotizaciones.length, data: cotizaciones });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error obteniendo cotizaciones' },
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

    if (body.action === 'adjudicar') {
      if (!body.cotizacionId || !body.justificacion) {
        return NextResponse.json(
          { success: false, error: 'Se requiere cotizacionId y justificacion para adjudicar.' },
          { status: 400 }
        );
      }
      const adjudicada = ComprasService.adjudicarCotizacion(body.cotizacionId, body.justificacion);
      return NextResponse.json({
        success: true,
        mensaje: `Cotización ${adjudicada.numeroCotizacion} adjudicada con éxito.`,
        data: adjudicada
      });
    }

    // Registrar nueva cotización
    if (!body.requisicionId || !body.proveedorId || !body.items) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos para registrar cotización.' },
        { status: 400 }
      );
    }

    const nuevaCot = ComprasService.registrarCotizacion(body);
    return NextResponse.json({
      success: true,
      mensaje: `Cotización ${nuevaCot.numeroCotizacion} registrada para evaluación.`,
      data: nuevaCot
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error en comparativo de cotizaciones' },
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
    { success: false, error: 'Método DELETE no permitido.' },
    { status: 405 }
  );
}
