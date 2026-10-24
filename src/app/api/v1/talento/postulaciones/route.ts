import { NextRequest, NextResponse } from 'next/server';
import { 
  SaraTalentoCoreService, 
  EstadoPostulacion,
  TalentoPostulacion 
} from '@/lib/services/saraTalentoCoreService';

/**
 * GET /api/v1/talento/postulaciones
 * Consulta postulaciones filtrando por vacante o por perfil de talento.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vacanteId = searchParams.get('vacante_id');
    const talentoId = searchParams.get('talento_id');

    if (!vacanteId && !talentoId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Debe especificar al menos un parámetro de filtro: "vacante_id" o "talento_id".'
        },
        { status: 400 }
      );
    }

    let postulaciones: TalentoPostulacion[] = [];
    if (vacanteId) {
      postulaciones = await SaraTalentoCoreService.listarPostulacionesPorVacante(vacanteId);
    } else if (talentoId) {
      postulaciones = await SaraTalentoCoreService.listarPostulacionesPorTalento(talentoId);
    }

    return NextResponse.json({
      success: true,
      count: postulaciones.length,
      data: postulaciones
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al listar las postulaciones' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/talento/postulaciones
 * Registra una nueva postulación de un profesional a una vacante activa.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.vacante_id || !body.talento_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campos requeridos faltantes: "vacante_id" y "talento_id" son obligatorios.'
        },
        { status: 400 }
      );
    }

    // Verificar si la vacante existe y está activa
    const vacante = await SaraTalentoCoreService.obtenerVacantePorId(body.vacante_id);
    if (!vacante) {
      return NextResponse.json(
        { success: false, error: 'La vacante especificada no existe.' },
        { status: 404 }
      );
    }

    if (vacante.estado !== 'publicada') {
      return NextResponse.json(
        {
          success: false,
          error: `No es posible postularse a esta vacante porque su estado actual es "${vacante.estado}".`
        },
        { status: 409 }
      );
    }

    const nuevaPostulacion = await SaraTalentoCoreService.crearPostulacion({
      vacante_id: body.vacante_id,
      talento_id: body.talento_id,
      mensaje_presentacion: body.mensaje_presentacion ? body.mensaje_presentacion.trim() : null,
      tarifa_ofertada: body.tarifa_ofertada ? Number(body.tarifa_ofertada) : null,
      estado: 'recibida'
    });

    return NextResponse.json(
      {
        success: true,
        mensaje: 'Postulación enviada exitosamente. Se notificará al equipo de contratación.',
        data: nuevaPostulacion
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al procesar la postulación' },
      { status: 400 }
    );
  }
}

/**
 * PATCH /api/v1/talento/postulaciones
 * Actualiza el estado de la postulación (en_revision, preseleccionada, entrevista, aceptada, rechazada).
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id || !body.estado) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parámetros obligatorios faltantes: "id" y "estado".'
        },
        { status: 400 }
      );
    }

    const postulacionActualizada = await SaraTalentoCoreService.actualizarEstadoPostulacion(
      body.id,
      body.estado as EstadoPostulacion,
      body.notas_privadas_empresa,
      body.fecha_entrevista
    );

    if (!postulacionActualizada) {
      return NextResponse.json(
        { success: false, error: 'No se encontró la postulación solicitada para actualizar.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      mensaje: `Postulación actualizada al estado "${body.estado}".`,
      data: postulacionActualizada
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar postulación' },
      { status: 400 }
    );
  }
}
