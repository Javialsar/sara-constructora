import { NextRequest, NextResponse } from 'next/server';
import { SaraAgentOrchestrator } from '@/lib/agents/orchestrator';
import { SaraEventBus } from '@/lib/agents/event-bus';
import { SaraSharedMemory } from '@/lib/agents/shared-memory';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    SaraAgentOrchestrator.init();
    const recentEvents = SaraEventBus.getRecentEvents();
    const knowledgeBase = SaraSharedMemory.getAllKnowledge();

    return NextResponse.json({
      status: 'online',
      ecosistema: 'GRUPO SARA - EVENT-DRIVEN AGENTIC NETWORK',
      agentesActivos: [
        'SARA-CONSTRUCTORA',
        'SARA-APU',
        'SARA-MARKETPLACE',
        'SARA-FLETES',
        'SARA-TALENTOHUMANO',
        'SARA-INMOBILIARIA',
        'SARA-ALOJAMIENTO',
        'SARA-PAGOS'
      ],
      totalEventosEnBuffer: recentEvents.length,
      reglasEvolutivasCargadas: knowledgeBase.length,
      knowledgeBase,
      recentEvents: recentEvents.slice(0, 15)
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    SaraAgentOrchestrator.init();
    const body = await req.json();

    const input = {
      nombre: body.nombre || 'Residencia Campestre Paucarbamba',
      provincia: body.provincia || 'Azuay',
      ciudad: body.ciudad || 'Cuenca',
      tipologia: body.tipologia || 'Residencial',
      areaM2: Number(body.areaM2) || 240,
      niveles: Number(body.niveles) || 2,
      coordenadas: body.coordenadas || { lat: -2.9001, lng: -79.0059 },
      cliente: {
        nombre: body.cliente?.nombre || 'Javier Sarango Gona',
        contacto: body.cliente?.contacto || '+593 98 180 4023',
        email: body.cliente?.email || 'gerencia@saraconstructora.com'
      }
    };

    const resultado = await SaraAgentOrchestrator.ejecutarFlujoIntegral(input);

    return NextResponse.json({
      success: true,
      mensaje: 'Coreografía agéntica ejecutada y sincronizada con éxito en tiempo real.',
      ...resultado
    });
  } catch (error: any) {
    console.error('[API Agent Orchestrator Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error en la red agéntica' },
      { status: 500 }
    );
  }
}
