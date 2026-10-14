import { SaraAgentOrchestrator } from '../src/lib/agents/orchestrator';

async function main() {
  console.log('--- INICIANDO PRUEBA DE COREOGRAFÍA DE 8 AGENTES SARA ---');
  SaraAgentOrchestrator.init();

  const input = {
    nombre: 'Villa Ejecutiva Paucarbamba',
    provincia: 'Azuay',
    ciudad: 'Cuenca',
    tipologia: 'Residencial' as const,
    areaM2: 240,
    niveles: 2,
    coordenadas: { lat: -2.9001, lng: -79.0059 },
    cliente: {
      nombre: 'Javier Sarango Gona',
      contacto: '+593 98 180 4023',
      email: 'gerencia@saraconstructora.com'
    }
  };

  const res = await SaraAgentOrchestrator.ejecutarFlujoIntegral(input);

  console.log('\n--- RESULTADO DE LA COREOGRAFÍA ---');
  console.log('Status:', res.status);
  console.log('Correlation ID:', res.correlationId);
  console.log('Pasos Ejecutados:', res.executionTrace.length);
  res.executionTrace.forEach(t => {
    console.log(`[Paso ${t.step}] Agente: ${t.agent} | Acción: ${t.action} | Evento: ${t.eventEmitted} (${t.durationMs}ms)`);
  });

  console.log('\n--- MÉTRICAS CONSOLIDADAS ---');
  console.log('Presupuesto Obra APU:', `$${res.resultados.apu.costoTotalObra.toLocaleString()} USD`);
  console.log('Suministros Marketplace:', `$${res.resultados.marketplace.costoTotalSuministros.toLocaleString()} USD`);
  console.log('Logística Fletes:', `$${res.resultados.fletes.costoLogisticoTotalUSD.toLocaleString()} USD`);
  console.log('Candidatos Terna Talento:', res.resultados.talento.ternaCalificada.length);
  console.log('ROI Inmobiliario Proyectado:', `+${res.resultados.inmobiliaria.roiProyectadoPct}%`);
  console.log('Alojamiento PIN Stays:', res.resultados.alojamiento.checkInAutonomoPIN);
  console.log('Custodia Escrow Total:', `$${res.resultados.pagos.montoTotalEscrowUSD.toLocaleString()} USD`);

  console.log('\n--- PRUEBA DEL CICLO DE APRENDIZAJE EVOLUTIVO ---');
  const reporteCierre = {
    proyectoId: res.proyectoId,
    correlationId: res.correlationId,
    provincia: 'Azuay',
    duracionPlanificadaDias: 120,
    duracionRealDias: 128,
    costoPlanificadoUSD: res.resultados.apu.costoTotalObra,
    costoRealUSD: Math.round(res.resultados.apu.costoTotalObra * 1.025),
    retrasoFletesHoras: 1.5,
    desempenoCuadrillaRating: 4.95,
    precioRealMaterialesDeltaPct: 2.8
  };

  const learningRes = await SaraAgentOrchestrator.retroalimentarProyectoFinalizado(reporteCierre);
  console.log('Deltas detectados:', learningRes.deltasDetectados);
  console.log('Aprendizajes consolidados:', learningRes.aprendizajesConsolidados);
  console.log('\n=== PRUEBA DE RED AGÉNTICA EXITOSA ===');
}

main().catch(console.error);
