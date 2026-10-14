import { NextRequest, NextResponse } from 'next/server';
import { SaraAdvisoryService } from '@/lib/agents/advisory-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const proyectoId = searchParams.get('proyectoId') || undefined;

    const logs = await SaraAdvisoryService.obtenerLogs(proyectoId);

    // Calcular ahorro acumulado de recomendaciones aceptadas
    const ahorroAceptadoUSD = logs
      .filter((l) => l.decision_tecnico === 'aceptada')
      .reduce((acc, curr) => acc + (curr.ahorro_estimado_usd || 0), 0);

    const ahorroPendienteUSD = logs
      .filter((l) => l.decision_tecnico === 'pendiente')
      .reduce((acc, curr) => acc + (curr.ahorro_estimado_usd || 0), 0);

    return NextResponse.json({
      success: true,
      logs,
      resumen: {
        totalSugerencias: logs.length,
        aceptadas: logs.filter((l) => l.decision_tecnico === 'aceptada').length,
        pendientes: logs.filter((l) => l.decision_tecnico === 'pendiente').length,
        rechazadas: logs.filter((l) => l.decision_tecnico === 'rechazada').length,
        ahorroAceptadoUSD,
        ahorroPendienteUSD
      }
    });
  } catch (error: any) {
    console.error('[API Advisory GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener asesorías' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, mensaje, contexto, proyectoId, nombreProyecto, ubicacion } = body;

    // Caso 1: Generar recomendaciones automáticas para un proyecto o presupuesto
    if (action === 'generar_recomendaciones') {
      const logs = await SaraAdvisoryService.generarRecomendacionesContextuales({
        proyectoId: proyectoId || contexto?.proyectoId,
        nombreProyecto: nombreProyecto || contexto?.nombreProyecto,
        ubicacion: ubicacion || contexto?.ubicacion,
        costoDirectoTotal: contexto?.costoDirectoTotal,
        volumenDesalojoM3: contexto?.volumenDesalojoM3,
        rubrosCount: contexto?.rubrosCount
      });

      return NextResponse.json({
        success: true,
        mensaje: 'Recomendaciones contextuales generadas con éxito.',
        logs
      });
    }

    // Caso 2: Interacción conversacional libre con el Consultor Senior de GRUPO SARA
    const consulta = await SaraAdvisoryService.responderConsultaTecnico(mensaje || '', {
      proyectoId: proyectoId || contexto?.proyectoId,
      nombreProyecto: nombreProyecto || contexto?.nombreProyecto,
      ubicacion: ubicacion || contexto?.ubicacion,
      presupuestoTotal: contexto?.costoDirectoTotal
    });

    return NextResponse.json({
      success: true,
      ...consulta
    });
  } catch (error: any) {
    console.error('[API Advisory POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error en consulta de asesoría' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { logId, decision, proyectoId } = body;

    if (!logId || !decision) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros logId o decision' },
        { status: 400 }
      );
    }

    const updatedLog = await SaraAdvisoryService.actualizarDecisionTecnico(
      logId,
      decision,
      proyectoId
    );

    return NextResponse.json({
      success: true,
      mensaje: `Decisión "${decision}" registrada correctamente en sara_ai_advisory_logs.`,
      log: updatedLog
    });
  } catch (error: any) {
    console.error('[API Advisory PATCH Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar decisión' },
      { status: 500 }
    );
  }
}
