import { SaraSharedMemory } from '../shared-memory';
import { SaraEventBus } from '../event-bus';
import { AnalisisInmobiliarioCompletoPayload, ProyectoCreadoPayload, ApuConsolidadoPayload } from '../types';

export class SaraInmobiliariaAgent {
  static readonly AGENT_ID = 'SARA-INMOBILIARIA';

  /**
   * Ejecuta el estudio de plusvalía, tasación del activo, absorción de mercado y proyecciones de ROI
   */
  static async evaluarViabilidadInmobiliaria(
    proyecto: ProyectoCreadoPayload,
    correlationId: string
  ): Promise<AnalisisInmobiliarioCompletoPayload> {
    // APRENDIZAJE EVOLUTIVO: Consultar absorción histórica y precios m2 de la zona
    const zoneKey = `${proyecto.ciudad.toLowerCase()}_${proyecto.provincia.toLowerCase()}`;
    const absorptionData = await SaraSharedMemory.getKnowledge('real_estate_absorption', 'cuenca_paucarbamba');

    const valorM2ZonaUSD = absorptionData?.currentValue?.precio_m2_construccion || 1150;
    const valorM2TerrenoUSD = absorptionData?.currentValue?.precio_m2_terreno || 680;
    const mesesAbsorcion = absorptionData?.currentValue?.meses_absorcion || 4.2;

    // Obtener datos consolidados de APU si ya están listos en la memoria compartida
    const apu = await SaraSharedMemory.get<ApuConsolidadoPayload>(correlationId, 'apu', 'computo_metricas');
    const costoObraTotal = apu?.costoTotalObra || (proyecto.areaM2 * 520);
    const costoConstruccionM2USD = Math.round(costoObraTotal / proyecto.areaM2);

    // Tasación de terreno estimada (considerando área de desplante de 1.5x para retiros y parqueo)
    const areaTerrenoEstimada = Math.round(proyecto.areaM2 * 1.4);
    const tasacionTerrenoUSD = Math.round(areaTerrenoEstimada * valorM2TerrenoUSD);

    // Precio de venta sugerido al público (benchmark de mercado en Ecuador)
    const precioVentaSugeridoM2USD = Math.round(valorM2ZonaUSD * 1.12);
    const valorVentaTotalProyectado = Math.round(proyecto.areaM2 * precioVentaSugeridoM2USD);

    const inversionTotalEstimada = costoObraTotal + tasacionTerrenoUSD;
    const margenNetoProyectadoUSD = Math.round(valorVentaTotalProyectado - inversionTotalEstimada);
    const margenUtilidadBrutaPct = +(((valorVentaTotalProyectado - costoObraTotal) / valorVentaTotalProyectado) * 100).toFixed(1);
    const roiProyectadoPct = +((margenNetoProyectadoUSD / inversionTotalEstimada) * 100).toFixed(1);

    const viabilidadComercial: AnalisisInmobiliarioCompletoPayload['viabilidadComercial'] =
      roiProyectadoPct > 25 ? 'EXCELENTE' : roiProyectadoPct > 18 ? 'ALTA' : roiProyectadoPct > 10 ? 'MODERADA' : 'RIESGOSA';

    const payload: AnalisisInmobiliarioCompletoPayload = {
      proyectoId: proyecto.proyectoId,
      tasacionTerrenoUSD,
      valorM2ZonaUSD,
      costoConstruccionM2USD,
      precioVentaSugeridoM2USD,
      margenUtilidadBrutaPct,
      margenNetoProyectadoUSD,
      roiProyectadoPct,
      velocidadAbsorcionMeses: mesesAbsorcion,
      viabilidadComercial
    };

    // 1. Guardar en Memoria Colectiva
    await SaraSharedMemory.set(
      correlationId,
      'inmobiliaria',
      'viabilidad_comercial',
      payload,
      0.96,
      ['inmobiliaria', 'plusvalia', 'roi', proyecto.ciudad],
      proyecto.proyectoId
    );

    // 2. Disparar Evento Global que alimenta a SARA-ALOJAMIENTO
    await SaraEventBus.publish<AnalisisInmobiliarioCompletoPayload>(
      'ANALISIS_INMOBILIARIO_COMPLETO',
      this.AGENT_ID,
      ['SARA-ALOJAMIENTO', 'SARA-PAGOS'],
      payload,
      correlationId,
      proyecto.proyectoId
    );

    return payload;
  }
}
