import { createAdminClient } from '@/lib/supabase/admin';
import { SaraAgentEvent, SaraEventType, SaraAgentId } from './types';

type EventHandler = (event: SaraAgentEvent) => Promise<void> | void;

export class SaraEventBus {
  private static subscribers = new Map<SaraEventType, Set<EventHandler>>();
  private static eventHistory: SaraAgentEvent[] = [];

  /**
   * Suscribe un handler asíncrono a un tipo de evento global
   */
  static subscribe(eventType: SaraEventType, handler: EventHandler): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(handler);

    return () => {
      this.subscribers.get(eventType)?.delete(handler);
    };
  }

  /**
   * Publica un evento en la red agéntica asíncrona
   */
  static async publish<T = any>(
    eventType: SaraEventType,
    originAgent: SaraAgentId,
    targetAgents: SaraAgentId[],
    payload: T,
    correlationId: string,
    proyectoId?: string
  ): Promise<SaraAgentEvent<T>> {
    const startTime = Date.now();
    const event: SaraAgentEvent<T> = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      correlationId,
      proyectoId,
      eventType,
      originAgent,
      targetAgents,
      payload,
      status: 'emitted',
      createdAt: new Date().toISOString()
    };

    // Guardar en buffer en memoria (últimos 100 eventos)
    this.eventHistory.unshift(event);
    if (this.eventHistory.length > 100) {
      this.eventHistory.pop();
    }

    console.log(`[SARA EventBus] 🚀 Evento emitido: ${eventType} desde [${originAgent}] hacia [${targetAgents.join(', ')}] (Corr: ${correlationId})`);

    // Despacho no bloqueante a los agentes suscriptores
    const handlers = this.subscribers.get(eventType);
    if (handlers && handlers.size > 0) {
      // Disparar en micro-tarea para no retener la respuesta HTTP
      queueMicrotask(async () => {
        for (const handler of Array.from(handlers)) {
          try {
            await handler(event);
          } catch (err) {
            console.error(`[SARA EventBus Error] Fallo al procesar evento ${eventType}:`, err);
          }
        }
      });
    }

    // Persistencia asíncrona en Supabase (Auditoría y Realtime)
    try {
      const supabase = createAdminClient();
      await supabase.from('sara_agent_events').insert({
        id: event.id,
        correlation_id: correlationId,
        proyecto_id: proyectoId,
        event_type: eventType,
        origin_agent: originAgent,
        target_agents: targetAgents,
        payload,
        status: 'completed',
        execution_time_ms: Date.now() - startTime,
        created_at: event.createdAt,
        processed_at: new Date().toISOString()
      });
    } catch (dbErr) {
      // Degradar grácilmente
      // console.warn('[SARA EventBus] Supabase event insert skipped:', dbErr);
    }

    event.status = 'completed';
    event.executionTimeMs = Date.now() - startTime;
    return event;
  }

  /**
   * Obtiene la traza de eventos recientes
   */
  static getRecentEvents(): SaraAgentEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Obtiene eventos por correlationId
   */
  static getEventsForCorrelation(correlationId: string): SaraAgentEvent[] {
    return this.eventHistory.filter(e => e.correlationId === correlationId);
  }
}
