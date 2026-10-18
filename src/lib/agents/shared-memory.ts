import { createAdminClient } from '@/lib/supabase/admin';
import { SharedMemoryEntry, EvolutionaryKnowledge, EvolutionLog, SaraAgentId } from './types';

// Cache en memoria rápida para invocaciones serverless y edge
const memoryCache = new Map<string, SharedMemoryEntry>();

// Base de conocimiento evolutiva inicial en memoria
const knowledgeCache = new Map<string, EvolutionaryKnowledge>([
  [
    'apu_yields:rendimiento_mano_obra_azuay',
    {
      domain: 'apu_yields',
      entityKey: 'rendimiento_mano_obra_azuay',
      currentValue: { factor_rendimiento: 1.05, clima_ajuste: 1.02, altitud_m: 2550 },
      sampleCount: 15,
      confidenceLevel: 0.94,
      metadata: { provincia: 'Azuay', fuente: 'Histórico Obras Cuenca' }
    }
  ],
  [
    'apu_yields:rendimiento_mano_obra_pichincha',
    {
      domain: 'apu_yields',
      entityKey: 'rendimiento_mano_obra_pichincha',
      currentValue: { factor_rendimiento: 1.02, clima_ajuste: 1.00, altitud_m: 2850 },
      sampleCount: 22,
      confidenceLevel: 0.96,
      metadata: { provincia: 'Pichincha', fuente: 'Obras Valle y Quito' }
    }
  ],
  [
    'apu_yields:rendimiento_mano_obra_guayas',
    {
      domain: 'apu_yields',
      entityKey: 'rendimiento_mano_obra_guayas',
      currentValue: { factor_rendimiento: 0.92, clima_ajuste: 1.15, altitud_m: 4 },
      sampleCount: 18,
      confidenceLevel: 0.91,
      metadata: { provincia: 'Guayas', fuente: 'Costa Alta Temperatura' }
    }
  ],
  [
    'freight_delays:ruta_guayaquil_cuenca',
    {
      domain: 'freight_delays',
      entityKey: 'ruta_guayaquil_cuenca',
      currentValue: { duracion_media_horas: 4.5, retraso_probabilidad: 0.28, cuello_botella: 'Molleturo / Deslaves' },
      sampleCount: 35,
      confidenceLevel: 0.92
    }
  ],
  [
    'freight_delays:ruta_quito_cuenca',
    {
      domain: 'freight_delays',
      entityKey: 'ruta_quito_cuenca',
      currentValue: { duracion_media_horas: 8.0, retraso_probabilidad: 0.15, cuello_botella: 'Panamericana Sur' },
      sampleCount: 27,
      confidenceLevel: 0.89
    }
  ],
  [
    'material_volatility:acero_corrugado_adelca',
    {
      domain: 'material_volatility',
      entityKey: 'acero_corrugado_adelca',
      currentValue: { precio_kg_ref: 1.18, tendencia_trimestral: '+3.4%', alerta_compra_anticipada: true },
      sampleCount: 40,
      confidenceLevel: 0.95
    }
  ],
  [
    'talent_efficiency:pesos_algoritmo_matching',
    {
      domain: 'talent_efficiency',
      entityKey: 'pesos_algoritmo_matching',
      currentValue: { peso_vip: 3.0, peso_calificacion: 2.5, peso_cercania: 2.0, peso_experiencia: 1.5 },
      sampleCount: 85,
      confidenceLevel: 0.97
    }
  ],
  [
    'real_estate_absorption:cuenca_paucarbamba',
    {
      domain: 'real_estate_absorption',
      entityKey: 'cuenca_paucarbamba',
      currentValue: { precio_m2_construccion: 1150, precio_m2_terreno: 680, meses_absorcion: 4.2 },
      sampleCount: 12,
      confidenceLevel: 0.90
    }
  ]
]);

export class SaraSharedMemory {
  /**
   * Guarda un fragmento en la memoria colectiva del ecosistema
   */
  static async set(
    correlationId: string,
    namespace: string,
    memoryKey: string,
    value: any,
    confidenceScore: number = 1.0,
    tags: string[] = [],
    proyectoId?: string
  ): Promise<SharedMemoryEntry> {
    const entry: SharedMemoryEntry = {
      correlationId,
      proyectoId,
      namespace,
      memoryKey,
      memoryValue: value,
      confidenceScore,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const cacheKey = `${correlationId}:${namespace}:${memoryKey}`;
    memoryCache.set(cacheKey, entry);

    // Persistencia asíncrona no bloqueante en Supabase
    try {
      const supabase = createAdminClient();
      await supabase.from('sara_agent_memory').upsert(
        {
          correlation_id: correlationId,
          proyecto_id: proyectoId,
          namespace,
          memory_key: memoryKey,
          memory_value: value,
          confidence_score: confidenceScore,
          tags,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'correlation_id,namespace,memory_key' }
      );
    } catch (e) {
      // Degrada grácilmente a memoria local en caso de desconexión
      console.warn(`[SaraSharedMemory] Almacenado localmente en caché: ${cacheKey}`);
    }

    return entry;
  }

  /**
   * Obtiene un fragmento específico de la memoria
   */
  static async get<T = any>(correlationId: string, namespace: string, memoryKey: string): Promise<T | null> {
    const cacheKey = `${correlationId}:${namespace}:${memoryKey}`;
    if (memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey)!.memoryValue as T;
    }

    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('sara_agent_memory')
        .select('memory_value')
        .eq('correlation_id', correlationId)
        .eq('namespace', namespace)
        .eq('memory_key', memoryKey)
        .maybeSingle();

      if (data && !error) {
        return data.memory_value as T;
      }
    } catch (e) {
      // Ignorar fallback
    }

    return null;
  }

  /**
   * Recupera toda la memoria compartida ligada a un flujo/proyecto
   */
  static async getAllForCorrelation(correlationId: string): Promise<Record<string, any>> {
    const result: Record<string, any> = {};

    // 1. Cargar desde la caché local
    for (const [key, entry] of memoryCache.entries()) {
      if (entry.correlationId === correlationId) {
        if (!result[entry.namespace]) result[entry.namespace] = {};
        result[entry.namespace][entry.memoryKey] = entry.memoryValue;
      }
    }

    // 2. Complementar con Supabase
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('sara_agent_memory')
        .select('*')
        .eq('correlation_id', correlationId);

      if (data && !error && data.length > 0) {
        for (const row of data) {
          if (!result[row.namespace]) result[row.namespace] = {};
          result[row.namespace][row.memory_key] = row.memory_value;
        }
      }
    } catch (e) {
      // Usar solo caché local
    }

    return result;
  }

  /**
   * Consulta una heurística o ponderador del Knowledge Base evolutivo
   */
  static async getKnowledge(domain: string, entityKey: string): Promise<EvolutionaryKnowledge | null> {
    const key = `${domain}:${entityKey}`;
    if (knowledgeCache.has(key)) {
      return knowledgeCache.get(key)!;
    }

    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('sara_agent_knowledge_base')
        .select('*')
        .eq('domain', domain)
        .eq('entity_key', entityKey)
        .maybeSingle();

      if (data && !error) {
        const item: EvolutionaryKnowledge = {
          id: data.id,
          domain: data.domain,
          entityKey: data.entity_key,
          currentValue: data.current_value,
          sampleCount: data.sample_count,
          confidenceLevel: data.confidence_level,
          lastEvolvedAt: data.last_evolved_at,
          metadata: data.metadata
        };
        knowledgeCache.set(key, item);
        return item;
      }
    } catch (e) {
      // Ignorar
    }

    return null;
  }

  /**
   * Registra una evolución de conocimiento aprendida por los agentes
   */
  static async evolveKnowledge(
    domain: EvolutionaryKnowledge['domain'],
    entityKey: string,
    newValue: Record<string, any>,
    rationale: string,
    agentId: SaraAgentId,
    proyectoId?: string,
    correlationId?: string
  ): Promise<EvolutionaryKnowledge> {
    const key = `${domain}:${entityKey}`;
    const previous = knowledgeCache.get(key);
    const prevVal = previous?.currentValue || {};
    const sampleCount = (previous?.sampleCount || 0) + 1;
    const confidence = Math.min(0.99, (previous?.confidenceLevel || 0.8) + 0.01);

    const evolved: EvolutionaryKnowledge = {
      domain,
      entityKey,
      currentValue: newValue,
      sampleCount,
      confidenceLevel: confidence,
      lastEvolvedAt: new Date().toISOString(),
      metadata: {
        lastAgent: agentId,
        rationale
      }
    };

    knowledgeCache.set(key, evolved);

    // Registro asíncrono en DB
    try {
      const supabase = createAdminClient();
      await supabase.from('sara_agent_knowledge_base').upsert(
        {
          domain,
          entity_key: entityKey,
          current_value: newValue,
          sample_count: sampleCount,
          confidence_level: confidence,
          last_evolved_at: new Date().toISOString(),
          metadata: evolved.metadata
        },
        { onConflict: 'domain,entity_key' }
      );

      await supabase.from('sara_agent_evolution_logs').insert({
        proyecto_id: proyectoId,
        correlation_id: correlationId,
        agent_id: agentId,
        metric_name: `${domain}.${entityKey}`,
        previous_value: prevVal,
        new_value: newValue,
        variance_percentage: 0.05,
        rationale,
        applied_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn(`[SaraSharedMemory] Conocimiento evolutivo actualizado en memoria: ${key}`);
    }

    return evolved;
  }

  /**
   * Lista todas las reglas evolutivas activas
   */
  static getAllKnowledge(): EvolutionaryKnowledge[] {
    return Array.from(knowledgeCache.values());
  }
}
