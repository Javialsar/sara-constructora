import fs from 'fs';
import path from 'path';

export interface LearnedRule {
  id: string;
  domain: 'mandaditos_routing' | 'fletes_heavy_wear' | 'fletes_delays' | 'viajes_pricing' | 'renta_machinery' | string;
  trigger: {
    zone?: string;
    timeRange?: string;
    vehicleType?: string;
    material?: string;
    slopePctMin?: number;
    routeCorridor?: string;
    checkpoint?: string;
    durationDaysMin?: number;
  };
  insight: string;
  adjustmentMinutes?: number;
  adjustmentCostPct?: number;
  trafficMultiplier?: number;
  safetyFactor?: number;
  discountPct?: number;
  driverIncentiveBonusUSD?: number;
  confidence: number;
  occurrences: number;
  createdAt: string;
  lastValidatedAt: string;
}

export interface KnowledgeStoreFile {
  version: string;
  ecosystem: string;
  module: string;
  lastReflectiveDream: string;
  totalRulesLearned: number;
  rules: LearnedRule[];
}

export interface TelemetryData {
  orderId: string;
  modalidad: 'VIAJE' | 'MANDADITO' | 'FLETE' | 'RENTA';
  vehicleType: string;
  origenNombre: string;
  origenCoords: [number, number];
  destinoNombre: string;
  destinoCoords: [number, number];
  distanciaKm: number;
  tiempoEstimadoMinutos: number;
  tiempoRealMinutos: number;
  desvioRutaMetros?: number;
  clima?: string;
  nivelTrafico?: 'BAJO' | 'MODERADO' | 'ALTO' | 'CONGESTION_CRITICA';
  calificacionUsuario?: number; // 1 to 5
  timestamp?: string;
}

export interface ReflectiveDreamResult {
  discrepanciaDetectada: boolean;
  deltaMinutos: number;
  desvioMetros: number;
  causaIdentificada: string;
  nuevaReglaAprendida?: LearnedRule;
  mensajeEvolutivo: string;
}

export class SaraFletesReflectiveMemory {
  static readonly AGENT_ID = '@Agent-ReflectiveMemory';
  private static localMemoryPath = path.resolve(process.cwd(), '.agentMemory', 'knowledge_store.json');

  /**
   * Carga la memoria persistente desde el almacenamiento local
   */
  static getStore(): KnowledgeStoreFile {
    try {
      if (fs.existsSync(this.localMemoryPath)) {
        const raw = fs.readFileSync(this.localMemoryPath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[SaraFletesReflectiveMemory] Error leyendo .agentMemory/knowledge_store.json, usando memoria interna:', e);
    }

    return {
      version: '1.0.0',
      ecosystem: 'SARA Group / GRUPO SARANGO',
      module: 'SARA-FLETES',
      lastReflectiveDream: new Date().toISOString(),
      totalRulesLearned: 0,
      rules: []
    };
  }

  /**
   * Guarda las reglas aprendidas en .agentMemory/knowledge_store.json
   */
  static saveStore(store: KnowledgeStoreFile): void {
    try {
      const dir = path.dirname(this.localMemoryPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      store.lastReflectiveDream = new Date().toISOString();
      store.totalRulesLearned = store.rules.length;
      fs.writeFileSync(this.localMemoryPath, JSON.stringify(store, null, 2), 'utf-8');
    } catch (e) {
      console.error('[SaraFletesReflectiveMemory] Error guardando reglas en disco:', e);
    }
  }

  /**
   * RECALL CONTEXTUAL: Consulta la memoria histórica antes de sugerir precios o rutas
   */
  static recallContextual(params: {
    modalidad: 'VIAJE' | 'MANDADITO' | 'FLETE' | 'RENTA';
    vehicleType: string;
    zonaUrbana?: string;
    hora?: string; // e.g. "12:15"
    material?: string;
    corredor?: string;
  }): {
    reglasAplicables: LearnedRule[];
    ajusteTiempoMinutos: number;
    multiplicadorCosto: number;
    multiplicadorTrafico: number;
    insights: string[];
  } {
    const store = this.getStore();
    const aplicables: LearnedRule[] = [];
    let ajusteMinutos = 0;
    let factorCosto = 1.0;
    let factorTrafico = 1.0;
    const insights: string[] = [];

    const horaActual = params.hora || new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });

    for (const rule of store.rules) {
      let match = false;

      // 1. Mandaditos en hora pico / centro
      if (
        params.modalidad === 'MANDADITO' &&
        rule.domain === 'mandaditos_routing' &&
        (!rule.trigger.vehicleType || rule.trigger.vehicleType === params.vehicleType)
      ) {
        if (rule.trigger.timeRange) {
          const [inicio, fin] = rule.trigger.timeRange.split('-');
          if (horaActual >= inicio && horaActual <= fin) {
            match = true;
          }
        } else {
          match = true;
        }
      }

      // 2. Fletes de materiales pesados / pendientes
      if (
        params.modalidad === 'FLETE' &&
        rule.domain === 'fletes_heavy_wear' &&
        params.material &&
        rule.trigger.material &&
        params.material.toLowerCase().includes(rule.trigger.material.toLowerCase().split(' ')[0])
      ) {
        match = true;
      }

      // 3. Fletes demoras viales interprovinciales (ej. Molleturo)
      if (
        params.modalidad === 'FLETE' &&
        rule.domain === 'fletes_delays' &&
        params.corredor &&
        rule.trigger.routeCorridor &&
        params.corredor.toLowerCase().includes(rule.trigger.routeCorridor.toLowerCase())
      ) {
        match = true;
      }

      // 4. Viajes pasajeros hora pico
      if (
        params.modalidad === 'VIAJE' &&
        rule.domain === 'viajes_pricing' &&
        (!rule.trigger.vehicleType || rule.trigger.vehicleType === params.vehicleType)
      ) {
        match = true;
      }

      // 5. Renta de maquinaria
      if (
        params.modalidad === 'RENTA' &&
        rule.domain === 'renta_machinery' &&
        (!rule.trigger.vehicleType || rule.trigger.vehicleType === params.vehicleType)
      ) {
        match = true;
      }

      if (match) {
        aplicables.push(rule);
        if (rule.adjustmentMinutes) ajusteMinutos += rule.adjustmentMinutes;
        if (rule.adjustmentCostPct) factorCosto *= rule.adjustmentCostPct;
        if (rule.trafficMultiplier) factorTrafico *= rule.trafficMultiplier;
        insights.push(rule.insight);
      }
    }

    return {
      reglasAplicables: aplicables,
      ajusteTiempoMinutos: ajusteMinutos,
      multiplicadorCosto: +factorCosto.toFixed(3),
      multiplicadorTrafico: +factorTrafico.toFixed(3),
      insights
    };
  }

  /**
   * SUEÑO REFLEXIVO (REFLECTIVE DREAM):
   * Analiza telemetría post-viaje, detecta discrepancias de ruta o tiempo y auto-entrena la memoria.
   */
  static processReflectiveDream(telemetry: TelemetryData): ReflectiveDreamResult {
    const deltaMinutos = telemetry.tiempoRealMinutos - telemetry.tiempoEstimadoMinutos;
    const desvioMetros = telemetry.desvioRutaMetros || 0;
    const discrepancia = Math.abs(deltaMinutos) >= 4 || desvioMetros > 400;

    if (!discrepancia) {
      return {
        discrepanciaDetectada: false,
        deltaMinutos,
        desvioMetros,
        causaIdentificada: 'Ruta operada dentro de los umbrales nominales de eficiencia.',
        mensajeEvolutivo: `Viaje ${telemetry.orderId} cumplió estimación con precisión nominal (delta ${deltaMinutos > 0 ? '+' : ''}${deltaMinutos} min).`
      };
    }

    const store = this.getStore();
    let causa = 'Congestión o cuello de botella imprevisto en el corredor';
    let nuevaRegla: LearnedRule | undefined;

    // Caso 1: Se redujo el tiempo gracias a un atajo de motocicleta en Mandaditos
    if (deltaMinutos < -3 && telemetry.modalidad === 'MANDADITO' && telemetry.vehicleType.includes('MOTO')) {
      causa = 'Conductor experto empleó tramo alterno de alta fluidez para motocicletas.';
      nuevaRegla = {
        id: `rule_mandadito_shortcut_${Date.now()}`,
        domain: 'mandaditos_routing',
        trigger: {
          zone: telemetry.origenNombre,
          vehicleType: telemetry.vehicleType
        },
        insight: `Optimización detectada en ${telemetry.origenNombre}: motocicletas reducen ${Math.abs(deltaMinutos)} min utilizando arterias ágiles locales.`,
        adjustmentMinutes: deltaMinutos,
        trafficMultiplier: 0.75,
        confidence: 0.95,
        occurrences: 1,
        createdAt: new Date().toISOString(),
        lastValidatedAt: new Date().toISOString()
      };
    }
    // Caso 2: Demora excesiva en flete por pendiente pronunciada o tráfico pesado
    else if (deltaMinutos > 6 && telemetry.modalidad === 'FLETE') {
      causa = 'Sobrecarga de rampa o restricción vial en tramo de alta pendiente.';
      nuevaRegla = {
        id: `rule_flete_delay_${Date.now()}`,
        domain: 'fletes_heavy_wear',
        trigger: {
          routeCorridor: `${telemetry.origenNombre} -> ${telemetry.destinoNombre}`,
          vehicleType: telemetry.vehicleType
        },
        insight: `Alerta en corredor ${telemetry.origenNombre} a ${telemetry.destinoNombre}: vehículos pesados experimentan fricción (+${deltaMinutos} min). Calibrar sinuosidad y recargo por desgaste.`,
        adjustmentMinutes: deltaMinutos,
        adjustmentCostPct: 1.08,
        confidence: 0.93,
        occurrences: 1,
        createdAt: new Date().toISOString(),
        lastValidatedAt: new Date().toISOString()
      };
    }
    // Caso 3: Demora en delivery/viaje por congestión no mapeada
    else if (deltaMinutos > 4) {
      causa = 'Embotellamiento temporal o semaforización densa en zona de entrega.';
      nuevaRegla = {
        id: `rule_congestion_${Date.now()}`,
        domain: 'viajes_pricing',
        trigger: {
          zone: telemetry.origenNombre,
          timeRange: '12:00-14:00'
        },
        insight: `Pico de congestión registrado en ${telemetry.origenNombre}: ajustar tiempo de recogida en +${deltaMinutos} min durante horario pico.`,
        adjustmentMinutes: deltaMinutos,
        trafficMultiplier: 1.25,
        confidence: 0.91,
        occurrences: 1,
        createdAt: new Date().toISOString(),
        lastValidatedAt: new Date().toISOString()
      };
    }

    if (nuevaRegla) {
      // Verificar si ya existe una regla similar para acumular ocurrencias
      const existing = store.rules.find(r => r.domain === nuevaRegla?.domain && r.trigger.zone === nuevaRegla?.trigger.zone);
      if (existing) {
        existing.occurrences += 1;
        existing.confidence = Math.min(0.99, existing.confidence + 0.02);
        existing.lastValidatedAt = new Date().toISOString();
        if (nuevaRegla.adjustmentMinutes) existing.adjustmentMinutes = Math.round((existing.adjustmentMinutes || 0) * 0.7 + nuevaRegla.adjustmentMinutes * 0.3);
      } else {
        store.rules.push(nuevaRegla);
      }
      this.saveStore(store);
    }

    return {
      discrepanciaDetectada: true,
      deltaMinutos,
      desvioMetros,
      causaIdentificada: causa,
      nuevaReglaAprendida: nuevaRegla,
      mensajeEvolutivo: `Reflective Dream completado: ${causa} Se actualizó el repositorio de memoria reflectiva con ${store.rules.length} patrones consolidados.`
    };
  }
}
