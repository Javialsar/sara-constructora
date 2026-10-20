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
    const absorptionData =
      (await SaraSharedMemory.getKnowledge('real_estate_absorption', zoneKey)) ||
      (await SaraSharedMemory.getKnowledge('real_estate_absorption', 'cuenca_paucarbamba'));

    const valorM2ZonaUSD = absorptionData?.currentValue?.precio_m2_construccion || 1150;
    const valorM2TerrenoUSD = absorptionData?.currentValue?.precio_m2_terreno || 680;
    const mesesAbsorcion = absorptionData?.currentValue?.meses_absorcion || 4.2;

    // Obtener datos consolidados de APU si ya están listos en la memoria compartida
    const apu = await SaraSharedMemory.get<ApuConsolidadoPayload>(correlationId, 'apu', 'computo_metricas');
    const costoObraTotal = apu?.costoTotalObra || (proyecto.areaM2 * 520);
    const costoConstruccionM2USD = Math.round(costoObraTotal / proyecto.areaM2);

    // Tasación de terreno estimada (considerando área de desplante de 1.4x para retiros y parqueo)
    const areaTerrenoEstimada = Math.round(proyecto.areaM2 * 1.4);
    const tasacionTerrenoUSD = Math.round(areaTerrenoEstimada * valorM2TerrenoUSD);

    // Precio de venta sugerido al público (benchmark de mercado en Ecuador bajo normas IVS 2025)
    const precioVentaSugeridoM2USD = Math.round(valorM2ZonaUSD * 1.12);
    const valorVentaTotalProyectado = Math.round(proyecto.areaM2 * precioVentaSugeridoM2USD);

    const inversionTotalEstimada = costoObraTotal + tasacionTerrenoUSD;
    const margenNetoProyectadoUSD = Math.round(valorVentaTotalProyectado - inversionTotalEstimada);
    const margenUtilidadBrutaPct = +(((valorVentaTotalProyectado - costoObraTotal) / valorVentaTotalProyectado) * 100).toFixed(1);
    const roiProyectadoPct = +((margenNetoProyectadoUSD / inversionTotalEstimada) * 100).toFixed(1);

    // Flujo de Caja Descontado (DCF): VAN (tasa descuento anual WACC 11.2%) y TIR anualizada
    const tasaDescuentoAnual = 0.112;
    const tasaMensual = Math.pow(1 + tasaDescuentoAnual, 1 / 12) - 1;
    const nMeses = Math.max(1, Math.round(mesesAbsorcion));
    const flujoMensualEntrada = valorVentaTotalProyectado / nMeses;
    let vpIngresos = 0;
    for (let t = 1; t <= nMeses; t++) {
      vpIngresos += flujoMensualEntrada / Math.pow(1 + tasaMensual, t);
    }
    const vanProyectadoUSD = Math.round(vpIngresos - inversionTotalEstimada);
    const tirAnualizadaPct = +(((Math.pow(valorVentaTotalProyectado / inversionTotalEstimada, 12 / Math.max(1, mesesAbsorcion)) - 1) * 100)).toFixed(2);

    // Clasificación hipotecaria BIESS / VIS-VIP según SBU 2026 ($482.00)
    const SBU_2026 = 482.0;
    const unidadesEstimadas = Math.max(1, Math.floor(proyecto.areaM2 / 95));
    const precioUnidadPromedioUSD = valorVentaTotalProyectado / unidadesEstimadas;
    const topeBiessPremierUSD = 111.72 * SBU_2026; // ~$53,849 USD (hasta $50k financiamiento preferencial 2.99%)
    const topeVisVipUSD = 229 * SBU_2026; // ~$110,378 USD (VIS/VIP 4.99%)

    let segmentoHipotecarioSugerido = 'Hipotecario Comercial (8.49%)';
    let tasaHipotecariaReferencialPct = 8.49;
    if (precioUnidadPromedioUSD <= topeBiessPremierUSD) {
      segmentoHipotecarioSugerido = 'BIESS Vivienda Premier (2.99%)';
      tasaHipotecariaReferencialPct = 2.99;
    } else if (precioUnidadPromedioUSD <= topeVisVipUSD) {
      segmentoHipotecarioSugerido = 'VIS/VIP (4.99%)';
      tasaHipotecariaReferencialPct = 4.99;
    }

    // Cuota mensual estimada (sistema francés a 20 años / 240 meses con 90% LTV)
    const montoFinanciado = precioUnidadPromedioUSD * 0.90;
    const rMes = (tasaHipotecariaReferencialPct / 100) / 12;
    const plazoMeses = 240;
    const cuotaMensualEstimadaUSD = +(
      (montoFinanciado * (rMes * Math.pow(1 + rMes, plazoMeses))) /
      (Math.pow(1 + rMes, plazoMeses) - 1)
    ).toFixed(2);

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
      viabilidadComercial,
      metricasIvsBiess: {
        vanProyectadoUSD,
        tirAnualizadaPct,
        segmentoHipotecarioSugerido,
        tasaHipotecariaReferencialPct,
        cuotaMensualEstimadaUSD
      }
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
