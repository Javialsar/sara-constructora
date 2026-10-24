import { NextRequest, NextResponse } from 'next/server';
import { 
  SaraTalentoCoreService, 
  EstadoAsignacion 
} from '@/lib/services/saraTalentoCoreService';

/**
 * GET /api/v1/talento/asignaciones
 * Consulta asignaciones activas de obra por proyecto, empresa o talento.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const proyectoId = searchParams.get('proyecto_id');
    const talentoId = searchParams.get('talento_id');

    let asignaciones = [];
    if (proyectoId) {
      asignaciones = await SaraTalentoCoreService.listarAsignacionesPorProyecto(proyectoId);
    } else if (talentoId) {
      asignaciones = await SaraTalentoCoreService.listarAsignacionesPorTalento(talentoId);
    } else {
      // Si no se especifica proyecto o talento, listar todas las asignaciones disponibles
      asignaciones = await SaraTalentoCoreService.listarAsignacionesPorProyecto('');
    }

    return NextResponse.json({
      success: true,
      count: asignaciones.length,
      data: asignaciones
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al listar asignaciones de obra' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/talento/asignaciones
 * Formaliza la asignación y contratación técnica de un talento a un proyecto de obra.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.talento_id || !body.rol_asignado || !body.fecha_inicio) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campos requeridos faltantes: "talento_id", "rol_asignado" y "fecha_inicio" son obligatorios.'
        },
        { status: 400 }
      );
    }

    const empresaId = body.empresa_id || '11111111-1111-1111-1111-111111111111';

    const nuevaAsignacion = await SaraTalentoCoreService.crearAsignacionObra({
      postulacion_id: body.postulacion_id || null,
      talento_id: body.talento_id,
      proyecto_id: body.proyecto_id || null,
      empresa_id: empresaId,
      rol_asignado: body.rol_asignado.trim(),
      fecha_inicio: body.fecha_inicio,
      fecha_fin_prevista: body.fecha_fin_prevista || null,
      estado: (body.estado as EstadoAsignacion) || 'activa',
      tarifa_acordada_hora: body.tarifa_acordada_hora ? Number(body.tarifa_acordada_hora) : null,
      fondo_escrow_id: body.fondo_escrow_id || null
    });

    return NextResponse.json(
      {
        success: true,
        mensaje: `Asignación formalizada exitosamente para el rol "${nuevaAsignacion.rol_asignado}".`,
        data: nuevaAsignacion
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear la asignación en obra' },
      { status: 400 }
    );
  }
}

/**
 * PATCH /api/v1/talento/asignaciones
 * Finaliza o suspende una asignación laboral en obra civil.
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'El parámetro "id" de la asignación es obligatorio.' },
        { status: 400 }
      );
    }

    const asignacionFinalizada = await SaraTalentoCoreService.finalizarAsignacion(body.id);
    if (!asignacionFinalizada) {
      return NextResponse.json(
        { success: false, error: 'No se encontró la asignación especificada.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      mensaje: 'Asignación de obra finalizada satisfactoriamente.',
      data: asignacionFinalizada
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar asignación' },
      { status: 400 }
    );
  }
}
