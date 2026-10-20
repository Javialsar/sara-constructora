import { SaraSharedMemory } from '../shared-memory';
import { SaraEventBus } from '../event-bus';
import { ApuConsolidadoPayload, ProyectoCreadoPayload } from '../types';
import { calcularFormulaPolinomicaINEC } from '../../calculadoras/presupuestos';

export class SaraApuAgent {
  static readonly AGENT_ID = 'SARA-APU';

  /**
   * Ejecuta el desglose analítico de APU con aprendizaje de rendimientos provinciales
   */
  static async computarApu(
    proyecto: ProyectoCreadoPayload,
    correlationId: string
  ): Promise<ApuConsolidadoPayload> {
    const provKey = proyecto.provincia.toLowerCase();

    // APRENDIZAJE EVOLUTIVO: Consultar el multiplicador de rendimiento aprendido para esta provincia
    const yieldKnowledge = await SaraSharedMemory.getKnowledge('apu_yields', `rendimiento_mano_obra_${provKey}`);
    const factorRendimiento = yieldKnowledge?.currentValue?.factor_rendimiento || 1.0;
    const ajusteClima = yieldKnowledge?.currentValue?.clima_ajuste || 1.0;
    const factorFinal = +(factorRendimiento * ajusteClima).toFixed(3);

    const m2 = proyecto.areaM2;

    // Métricas de materiales estimadas por m2 de construcción
    const cementoSacos = Math.round(m2 * 7.5);
    const aceroKg = Math.round(m2 * 45);
    const arenaM3 = +(m2 * 0.42).toFixed(1);
    const ripioM3 = +(m2 * 0.48).toFixed(1);
    const ladrillosUnidades = Math.round(m2 * 55);

    // Desalojo y movimiento de tierras
    const volumenExcavacionM3 = Math.round(m2 * (proyecto.niveles > 1 ? 0.75 : 0.55));
    const factorEsponjamiento = 1.25;
    const volumenTierraDesalojoM3 = +(volumenExcavacionM3 * factorEsponjamiento).toFixed(1);
    const materialCargaTon = +((aceroKg / 1000) + (cementoSacos * 0.05) + (ripioM3 * 1.5) + (arenaM3 * 1.4)).toFixed(1);

    // Cómputo de Horas / Hombre por cuadrilla con factor regional evolutivo
    const horasBaseIngeniero = Math.round((m2 * 0.8) / factorFinal);
    const horasBaseMaestro = Math.round((m2 * 2.2) / factorFinal);
    const horasBaseAlbaniles = Math.round((m2 * 6.5) / factorFinal);
    const horasBasePeon = Math.round((m2 * 9.0) / factorFinal);
    const horasBaseFierrero = Math.round((m2 * 1.8) / factorFinal);

    // Cómputo de Costos Unitarios
    const costoCemento = cementoSacos * 7.50;
    const costoAcero = aceroKg * 1.18;
    const costoAridos = arenaM3 * 18.0 + ripioM3 * 21.0;
    const costoOtrosMateriales = ladrillosUnidades * 0.35 + m2 * 65; // Acabados, tuberías, instalaciones

    const costoMateriales = Math.round(
      costoCemento +
      costoAcero +
      costoAridos +
      costoOtrosMateriales
    );

    const costoManoObra = Math.round(
      horasBaseIngeniero * 22.0 +
      horasBaseMaestro * 8.50 +
      horasBaseAlbaniles * 5.20 +
      horasBasePeon * 4.10 +
      horasBaseFierrero * 5.50
    );

    const costoEquiposDesalojo = Math.round(volumenTierraDesalojoM3 * 6.50 + m2 * 18);
    const costoDirectoTotal = costoMateriales + costoManoObra + costoEquiposDesalojo;
    const costoIndirectoTotal = Math.round(costoDirectoTotal * 0.18); // 18% Indirectos y Utilidad técnica
    const costoTotalObra = costoDirectoTotal + costoIndirectoTotal;

    // Fórmula Polinómica INEC / SERCOP (sum(p_i) === 1.000, px <= 0.200)
    const formulaPolinomicaInec = calcularFormulaPolinomicaINEC({
      manoObra: costoManoObra,
      cemento: costoCemento,
      acero: costoAcero,
      aridos: costoAridos,
      equipos: costoEquiposDesalojo,
      otros: costoOtrosMateriales,
    });

    // Valor Agregado Ecuatoriano (VAE) estimado según proporción de mano de obra nacional e insumos locales
    const vaePorcentajeEstimado = +(((costoManoObra + costoCemento + costoAridos + costoEquiposDesalojo * 0.7 + costoAcero * 0.65) / costoDirectoTotal) * 100).toFixed(2);

    const payload: ApuConsolidadoPayload = {
      proyectoId: proyecto.proyectoId,
      costoDirectoTotal,
      costoIndirectoTotal,
      costoTotalObra,
      materialesRequeridos: [
        { codigo: 'MAT-CEM-01', nombre: 'Cemento Portland Tipo GU (Sacos 50kg)', unidad: 'saco', cantidad: cementoSacos, pesoEstimadoKg: cementoSacos * 50, volumenM3: +(cementoSacos * 0.035).toFixed(2) },
        { codigo: 'MAT-ACE-02', nombre: 'Acero Corrugado Estructural fy=4200 kg/cm2', unidad: 'kg', cantidad: aceroKg, pesoEstimadoKg: aceroKg, volumenM3: +(aceroKg / 7850).toFixed(2) },
        { codigo: 'MAT-ARE-03', nombre: 'Arena Homogénea Lavada para Hormigón', unidad: 'm3', cantidad: arenaM3, pesoEstimadoKg: Math.round(arenaM3 * 1400), volumenM3: arenaM3 },
        { codigo: 'MAT-RIP-04', nombre: 'Ripio Triturado 3/4 para Estructuras', unidad: 'm3', cantidad: ripioM3, pesoEstimadoKg: Math.round(ripioM3 * 1500), volumenM3: ripioM3 },
        { codigo: 'MAT-LAD-05', nombre: 'Ladrillo Panel Quemado Artesanal / Cerámico', unidad: 'u', cantidad: ladrillosUnidades, pesoEstimadoKg: Math.round(ladrillosUnidades * 2.8), volumenM3: +(ladrillosUnidades * 0.003).toFixed(2) }
      ],
      horasHombreDesglose: [
        { categoriaLaboral: 'Ingeniero Civil', horasRequeridas: horasBaseIngeniero, cantidadTrabajadoresSugerida: 1, rendimientoAjustadoProvincia: factorFinal },
        { categoriaLaboral: 'Maestro Mayor', horasRequeridas: horasBaseMaestro, cantidadTrabajadoresSugerida: 1, rendimientoAjustadoProvincia: factorFinal },
        { categoriaLaboral: 'Albañil', horasRequeridas: horasBaseAlbaniles, cantidadTrabajadoresSugerida: Math.max(2, Math.round(m2 / 70)), rendimientoAjustadoProvincia: factorFinal },
        { categoriaLaboral: 'Fierrero', horasRequeridas: horasBaseFierrero, cantidadTrabajadoresSugerida: 1, rendimientoAjustadoProvincia: factorFinal },
        { categoriaLaboral: 'Peón', horasRequeridas: horasBasePeon, cantidadTrabajadoresSugerida: Math.max(2, Math.round(m2 / 50)), rendimientoAjustadoProvincia: factorFinal }
      ],
      desalojoCarga: {
        volumenTierraDesalojoM3,
        materialCargaTon
      },
      factorRendimientoAplicado: factorFinal,
      formulaPolinomicaInec,
      vaePorcentajeEstimado
    };

    // 1. Guardar en Memoria Colectiva
    await SaraSharedMemory.set(
      correlationId,
      'apu',
      'computo_metricas',
      payload,
      0.97,
      ['apu', 'presupuesto', provKey],
      proyecto.proyectoId
    );

    // 2. Disparar Evento Global que despierta a MARKETPLACE, FLETES y TALENTOHUMANO
    await SaraEventBus.publish<ApuConsolidadoPayload>(
      'APU_CONSOLIDADO',
      this.AGENT_ID,
      ['SARA-MARKETPLACE', 'SARA-FLETES', 'SARA-TALENTOHUMANO'],
      payload,
      correlationId,
      proyecto.proyectoId
    );

    return payload;
  }
}
