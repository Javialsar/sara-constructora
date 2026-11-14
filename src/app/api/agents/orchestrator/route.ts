import { NextRequest, NextResponse } from 'next/server';
import { SaraAgentOrchestrator } from '@/lib/agents/orchestrator';
import { SaraEventBus } from '@/lib/agents/event-bus';
import { SaraSharedMemory } from '@/lib/agents/shared-memory';
import { requireServerAuth } from '@/lib/auth/serverAuthGuard';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const orchestratorInputSchema = z.object({
  nombre: z.string().min(3, 'El nombre del proyecto es requerido'),
  provincia: z.string().min(2, 'La provincia es requerida'),
  ciudad: z.string().min(2, 'La ciudad es requerida'),
  tipologia: z.enum(['Residencial', 'Vial', 'Comercial', 'Estructura Metálica']).default('Residencial'),
  areaM2: z.number().positive('El área en m2 debe ser mayor a 0'),
  niveles: z.number().int().positive().optional().default(1),
  coordenadas: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional().default({ lat: -2.9001, lng: -79.0059 }),
  cliente: z.object({
    nombre: z.string().min(2, 'El nombre del cliente es requerido'),
    contacto: z.string().min(6, 'El contacto del cliente es requerido'),
    email: z.string().email('Email de contacto inválido')
  })
});

export async function GET(req: NextRequest) {
  try {
    // Verificación Zero-Trust de sesión activa
    await requireServerAuth(req);

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
    const status = error.message?.includes('No autenticado') ? 401 : error.message?.includes('Acceso denegado') ? 403 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verificación Zero-Trust de sesión activa
    const { user } = await requireServerAuth(req);

    SaraAgentOrchestrator.init();
    const rawBody = await req.json().catch(() => null);

    if (!rawBody) {
      return NextResponse.json({ success: false, error: 'Cuerpo de petición JSON inválido' }, { status: 400 });
    }

    const validation = orchestratorInputSchema.safeParse(rawBody);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Datos de proyecto inválidos para orquestación agéntica',
        details: validation.error.flatten()
      }, { status: 422 });
    }

    const input = validation.data;
    const resultado = await SaraAgentOrchestrator.ejecutarFlujoIntegral(input);

    return NextResponse.json({
      success: true,
      mensaje: 'Coreografía agéntica ejecutada y sincronizada con éxito en tiempo real.',
      iniciadoPor: user.email,
      ...resultado
    });
  } catch (error: any) {
    console.error('[API Agent Orchestrator Error]:', error);
    const status = error.message?.includes('No autenticado') ? 401 : error.message?.includes('Acceso denegado') ? 403 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Error en la red agéntica' },
      { status }
    );
  }
}
