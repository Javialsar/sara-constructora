import { NextRequest, NextResponse } from 'next/server';
import { SaraLearningEngine, ProyectoFinalizadoReport } from '@/lib/agents/learning-engine';
import { SaraSharedMemory } from '@/lib/agents/shared-memory';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const knowledgeBase = SaraSharedMemory.getAllKnowledge();
    return NextResponse.json({
      status: 'active',
      mensaje: 'Knowledge Base Evolutivo de la Red Agéntica Grupo SARA',
      totalReglas: knowledgeBase.length,
      reglas: knowledgeBase
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const reporte: ProyectoFinalizadoReport = {
      proyectoId: body.proyectoId || `proy_finalizado_${Date.now()}`,
      correlationId: body.correlationId || `corr_${Date.now()}`,
      provincia: body.provincia || 'Azuay',
      duracionPlanificadaDias: Number(body.duracionPlanificadaDias) || 120,
      duracionRealDias: Number(body.duracionRealDias) || 128,
      costoPlanificadoUSD: Number(body.costoPlanificadoUSD) || 115000,
      costoRealUSD: Number(body.costoRealUSD) || 118400,
      retrasoFletesHoras: Number(body.retrasoFletesHoras) || 1.5,
      desempenoCuadrillaRating: Number(body.desempenoCuadrillaRating) || 4.9,
      precioRealMaterialesDeltaPct: Number(body.precioRealMaterialesDeltaPct) || 2.4
    };

    const resultadoAprendizaje = await SaraLearningEngine.consolidarAprendizajeProyecto(reporte);

    return NextResponse.json({
      success: true,
      mensaje: 'Ciclo de auto-mejora evolutiva ejecutado. Heurísticas y pesos actualizados.',
      resultado: resultadoAprendizaje,
      knowledgeBaseActualizado: SaraSharedMemory.getAllKnowledge()
    });
  } catch (error: any) {
    console.error('[API Learning Engine Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
