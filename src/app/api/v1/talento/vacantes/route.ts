import { NextRequest, NextResponse } from 'next/server';
import { 
  SaraTalentoCoreService, 
  EstadoVacante, 
  ModalidadTrabajo, 
  TipoContratoTalento 
} from '@/lib/services/saraTalentoCoreService';

/**
 * GET /api/v1/talento/vacantes
 * Filtra vacantes de empleo en construcción según criterios de búsqueda.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const provincia = searchParams.get('provincia') || undefined;
    const canton = searchParams.get('canton') || undefined;
    const rol_oficio = searchParams.get('rol_oficio') || undefined;
    const estado = (searchParams.get('estado') as EstadoVacante) || undefined;
    const empresa_id = searchParams.get('empresa_id') || undefined;
    const proyecto_id = searchParams.get('proyecto_id') || undefined;
    const q = searchParams.get('q') || undefined;

    const vacantes = await SaraTalentoCoreService.listarVacantes({
      provincia,
      canton,
      rol_oficio,
      estado,
      empresa_id,
      proyecto_id,
      q
    });

    return NextResponse.json({
      success: true,
      count: vacantes.length,
      data: vacantes
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al consultar vacantes de talento' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/talento/vacantes
 * Publica una nueva vacante de talento en obra o gestión técnica.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validaciones de obligatoriedad
    if (!body.titulo || !body.rol_oficio || !body.descripcion || !body.ubicacion_provincia || !body.ubicacion_canton) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campos obligatorios faltantes: titulo, rol_oficio, descripcion, ubicacion_provincia, ubicacion_canton.'
        },
        { status: 400 }
      );
    }

    const empresaId = body.empresa_id || '11111111-1111-1111-1111-111111111111';

    const nuevaVacante = await SaraTalentoCoreService.crearVacante({
      empresa_id: empresaId,
      proyecto_id: body.proyecto_id || null,
      titulo: body.titulo.trim(),
      rol_oficio: body.rol_oficio.trim(),
      especialidad: body.especialidad ? body.especialidad.trim() : null,
      descripcion: body.descripcion.trim(),
      requisitos: body.requisitos ? body.requisitos.trim() : null,
      certificaciones_requeridas: Array.isArray(body.certificaciones_requeridas) ? body.certificaciones_requeridas : [],
      ubicacion_provincia: body.ubicacion_provincia.trim(),
      ubicacion_canton: body.ubicacion_canton.trim(),
      modalidad: (body.modalidad as ModalidadTrabajo) || 'presencial_obra',
      tipo_contrato: (body.tipo_contrato as TipoContratoTalento) || 'obra_cierta',
      salario_min: body.salario_min ? Number(body.salario_min) : null,
      salario_max: body.salario_max ? Number(body.salario_max) : null,
      estado: (body.estado as EstadoVacante) || 'publicada',
      vacantes_disponibles: Number(body.vacantes_disponibles) || 1
    });

    return NextResponse.json(
      {
        success: true,
        mensaje: `Vacante "${nuevaVacante.titulo}" publicada exitosamente en SARA Talento.`,
        data: nuevaVacante
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al publicar la vacante de talento' },
      { status: 400 }
    );
  }
}
