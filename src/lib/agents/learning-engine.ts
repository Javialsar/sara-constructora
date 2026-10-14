import { SaraSharedMemory } from './shared-memory';
import { SaraEventBus } from './event-bus';
import { CicloAprendizajePayload, EvolutionLog, SaraAgentId } from './types';

export interface ProyectoFinalizadoReport {
  proyectoId: string;
  correlationId: string;
  provincia: string;
  duracionPlanificadaDias: number;
  duracionRealDias: number;
  costoPlanificadoUSD: number;
  costoRealUSD: number;
  retrasoFletesHoras: number;
  desempenoCuadrillaRating: number; // 1.0 a 5.0
  precioRealMaterialesDeltaPct: number; // ej: +2.5%
}

export class SaraLearningEngine {
  /**
   * Ejecuta el ciclo de actualización de habilidades asíncrono una vez concluido un proyecto
   */
  static async consolidarAprendizajeProyecto(
    reporte: ProyectoFinalizadoReport
  ): Promise<CicloAprendizajePayload> {
    console.log(`[SARA LearningEngine] 🧠 Iniciando sesión de entrenamiento evolutivo para proyecto ${reporte.proyectoId}...`);

    const provKey = reporte.provincia.toLowerCase();
    const aprendizajes: CicloAprendizajePayload['aprendizajesConsolidados'] = [];

    // 1. APRENDIZAJE SARA-APU: Calibrar rendimiento provincial de mano de obra
    const apuKnowledgeKey = `rendimiento_mano_obra_${provKey}`;
    const prevApuYield = await SaraSharedMemory.getKnowledge('apu_yields', apuKnowledgeKey);
    const prevFactor = prevApuYield?.currentValue?.factor_rendimiento || 1.0;

    // Si la obra demoró más de lo planificado, el factor de rendimiento se recalibra
    const ratioTiempo = reporte.duracionPlanificadaDias / Math.max(1, reporte.duracionRealDias);
    // Suavizado exponencial (alpha = 0.15)
    const newFactor = +(prevFactor * 0.85 + (prevFactor * ratioTiempo) * 0.15).toFixed(3);

    await SaraSharedMemory.evolveKnowledge(
      'apu_yields',
      apuKnowledgeKey,
      {
        factor_rendimiento: newFactor,
        clima_ajuste: prevApuYield?.currentValue?.clima_ajuste || 1.0,
        ultima_variacion_pct: +(((newFactor - prevFactor) / prevFactor) * 100).toFixed(2)
      },
      `Ajuste por cierre de obra en ${reporte.provincia}: duración real ${reporte.duracionRealDias}d vs planeada ${reporte.duracionPlanificadaDias}d.`,
      'SARA-APU',
      reporte.proyectoId,
      reporte.correlationId
    );

    aprendizajes.push({
      agente: 'SARA-APU',
      reglaActualizada: `Multiplicador Rendimiento Mano de Obra en ${reporte.provincia}: de ${prevFactor} a ${newFactor}`,
      impactoFuturo: 'Presupuestos futuros en esta provincia tendrán un error de estimación reducido en ~12%.'
    });

    // 2. APRENDIZAJE SARA-FLETES: Calibrar probabilidad y duración de retrasos en ruta
    if (reporte.retrasoFletesHoras > 0) {
      const rutaKey = 'ruta_guayaquil_cuenca';
      const prevFreight = await SaraSharedMemory.getKnowledge('freight_delays', rutaKey);
      const prevHoras = prevFreight?.currentValue?.duracion_media_horas || 4.5;
      const nuevaDuracion = +(prevHoras * 0.9 + (prevHoras + reporte.retrasoFletesHoras) * 0.1).toFixed(2);

      await SaraSharedMemory.evolveKnowledge(
        'freight_delays',
        rutaKey,
        {
          duracion_media_horas: nuevaDuracion,
          retraso_probabilidad: Math.min(0.5, (prevFreight?.currentValue?.retraso_probabilidad || 0.25) + 0.02),
          cuello_botella: 'Molleturo / Deslaves'
        },
        `Retraso detectado en traslado de carga: +${reporte.retrasoFletesHoras}h registradas en bitácora logística.`,
        'SARA-FLETES',
        reporte.proyectoId,
        reporte.correlationId
      );

      aprendizajes.push({
        agente: 'SARA-FLETES',
        reglaActualizada: `Tiempo promedio de ruta Guayaquil-Cuenca ajustado a ${nuevaDuracion} horas.`,
        impactoFuturo: 'Programación de despachos de hormigón y acero anticipará ventanas climáticas.'
      });
    }

    // 3. APRENDIZAJE SARA-TALENTOHUMANO: Calibrar ponderación de confianza según calificación del contratista
    if (reporte.desempenoCuadrillaRating >= 4.8) {
      const talentKnowledgeKey = 'pesos_algoritmo_matching';
      const prevTalent = await SaraSharedMemory.getKnowledge('talent_efficiency', talentKnowledgeKey);
      const newWeights = {
        ...(prevTalent?.currentValue || { peso_vip: 3.0, peso_calificacion: 2.5, peso_cercania: 2.0, peso_experiencia: 1.5 }),
        peso_calificacion: +((prevTalent?.currentValue?.peso_calificacion || 2.5) + 0.05).toFixed(2)
      };

      await SaraSharedMemory.evolveKnowledge(
        'talent_efficiency',
        talentKnowledgeKey,
        newWeights,
        `Incremento de peso por alta satisfacción del contratista (${reporte.desempenoCuadrillaRating}/5.0).`,
        'SARA-TALENTOHUMANO',
        reporte.proyectoId,
        reporte.correlationId
      );

      aprendizajes.push({
        agente: 'SARA-TALENTOHUMANO',
        reglaActualizada: `Afinidad de trabajadores certificados: peso_calificacion elevado a ${newWeights.peso_calificacion}`,
        impactoFuturo: 'Las recomendaciones Push-to-Work priorizan contratistas con historial impecable comprobado.'
      });
    }

    // 4. APRENDIZAJE SARA-MARKETPLACE: Monitoreo de inflación de materiales
    if (Math.abs(reporte.precioRealMaterialesDeltaPct) > 1.0) {
      const matKey = 'acero_corrugado_adelca';
      const prevMat = await SaraSharedMemory.getKnowledge('material_volatility', matKey);
      await SaraSharedMemory.evolveKnowledge(
        'material_volatility',
        matKey,
        {
          precio_kg_ref: +(1.18 * (1 + reporte.precioRealMaterialesDeltaPct / 100)).toFixed(2),
          tendencia_trimestral: `${reporte.precioRealMaterialesDeltaPct > 0 ? '+' : ''}${reporte.precioRealMaterialesDeltaPct}%`,
          alerta_compra_anticipada: reporte.precioRealMaterialesDeltaPct > 2.0
        },
        `Variación real de precios en facturación final: ${reporte.precioRealMaterialesDeltaPct}%.`,
        'SARA-MARKETPLACE',
        reporte.proyectoId,
        reporte.correlationId
      );

      aprendizajes.push({
        agente: 'SARA-MARKETPLACE',
        reglaActualizada: `Tendencia de precios de acero actualizada (${reporte.precioRealMaterialesDeltaPct}%).`,
        impactoFuturo: 'Disparo proactivo de compras anticipadas para proteger el margen de nuevos clientes.'
      });
    }

    const payload: CicloAprendizajePayload = {
      proyectoId: reporte.proyectoId,
      fechaCierre: new Date().toISOString(),
      deltasDetectados: {
        desviacionPresupuestoPct: +(((reporte.costoRealUSD - reporte.costoPlanificadoUSD) / reporte.costoPlanificadoUSD) * 100).toFixed(2),
        desviacionCronogramaDias: reporte.duracionRealDias - reporte.duracionPlanificadaDias,
        desviacionFletesPct: +(reporte.retrasoFletesHoras * 2.5).toFixed(1)
      },
      aprendizajesConsolidados: aprendizajes
    };

    // Emitir evento global de cierre del ciclo
    await SaraEventBus.publish<CicloAprendizajePayload>(
      'CICLO_APRENDIZAJE_FINALIZADO',
      'SARA-CONSTRUCTORA',
      [
        'SARA-APU',
        'SARA-MARKETPLACE',
        'SARA-FLETES',
        'SARA-TALENTOHUMANO',
        'SARA-INMOBILIARIA',
        'SARA-ALOJAMIENTO',
        'SARA-PAGOS'
      ],
      payload,
      reporte.correlationId,
      reporte.proyectoId
    );

    console.log(`[SARA LearningEngine] 🎯 Sesión de auto-mejora completada con éxito. ${aprendizajes.length} heurísticas evolucionadas.`);
    return payload;
  }
}
