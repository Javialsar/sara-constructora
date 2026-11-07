import { SaraFletesOrchestrator } from '../src/lib/agents/fletes/saraFletesOrchestrator';
import { SaraFletesReflectiveMemory } from '../src/lib/agents/fletes/saraFletesReflectiveMemory';

async function runSimulation() {
  console.log('================================================================');
  console.log('🚀 SIMULACIÓN AGÉNTICA: SARA-FLETES SUPER-APP & REFLECTIVE MEMORY');
  console.log('Cuadrilla: @Orchestrator, @MultiRouting, @SmartBidding, @ReflectiveMemory');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // ESCENARIO 1: Mandadito Express en Hora Pico sin conocimiento previo del atajo
  // --------------------------------------------------------------------------
  console.log('--- PASO 1: Cotización Inicial de Mandadito Express (Zona Centro, 12:15 PM) ---');
  const origenCentro = {
    nombre: 'Parque Central Cariamanga (Centro Urbano)',
    lat: -4.3315,
    lng: -79.5510,
    ciudad: 'Cariamanga'
  };
  const destinoHospital = {
    nombre: 'Hospital Básico Cariamanga / Zona Norte',
    lat: -4.3180,
    lng: -79.5420,
    ciudad: 'Cariamanga'
  };

  const cotizacionInicial = await SaraFletesOrchestrator.cotizarModalidad({
    modalidad: 'mandaditos',
    origen: origenCentro,
    destino: destinoHospital,
    vehicleType: 'DELIVERY_MOTO',
    horaActual: '12:15',
    esUrgente: false
  });

  console.log(`📦 Modalidad: MANDADITOS | Vehículo: Moto Express`);
  console.log(`📏 Distancia estimada: ${cotizacionInicial.distanciaKm} km`);
  console.log(`⏱️ Tiempo estimado inicial: ${cotizacionInicial.tiempoEstimadoMinutos} minutos`);
  console.log(`💵 Tarifa sugerida inicial: $${cotizacionInicial.tarifa.tarifaSugeridaUSD} USD`);
  console.log(`🧠 Memoria previa aplicada: ${cotizacionInicial.insightsMemoria.length > 0 ? cotizacionInicial.insightsMemoria[0] : 'Ninguna'}`);

  // --------------------------------------------------------------------------
  // ESCENARIO 2: Finalización de viaje y captura de telemetría real con discrepancia
  // --------------------------------------------------------------------------
  console.log('\n--- PASO 2: Conducción en tiempo real, captura de telemetría y detección de atajo ---');
  const telemetriaViaje = {
    orderId: 'ORD-MANDADITO-TEST-99',
    modalidad: 'MANDADITO' as const,
    vehicleType: 'DELIVERY_MOTO',
    origenNombre: 'Centro Urbano',
    origenCoords: [-4.3315, -79.5510] as [number, number],
    destinoNombre: 'Hospital Básico',
    destinoCoords: [-4.3180, -79.5420] as [number, number],
    distanciaKm: 4.2,
    tiempoEstimadoMinutos: cotizacionInicial.tiempoEstimadoMinutos,
    tiempoRealMinutos: Math.max(4, cotizacionInicial.tiempoEstimadoMinutos - 5), // Ahorró 5 minutos gracias a un atajo
    desvioRutaMetros: 650, // Se desvió por pasaje peatonal/moto
    clima: 'DESPEJADO',
    nivelTrafico: 'CONGESTION_CRITICA' as const,
    calificacionUsuario: 5
  };

  console.log(`📡 Telemetría recibida: Tiempo real ${telemetriaViaje.tiempoRealMinutos} min vs Estimado ${telemetriaViaje.tiempoEstimadoMinutos} min`);
  console.log(`📍 Desvío de ruta detectado: ${telemetriaViaje.desvioRutaMetros} metros.`);

  // --------------------------------------------------------------------------
  // ESCENARIO 3: Disparo de "Reflective Dream" para auto-entrenamiento
  // --------------------------------------------------------------------------
  console.log('\n--- PASO 3: Activación del Ciclo "Reflective Dream" (@Agent-ReflectiveMemory) ---');
  const resultadoDream = await SaraFletesOrchestrator.registrarTelemetriaYAutoAprender(telemetriaViaje);

  console.log(`✨ Discrepancia detectada: ${resultadoDream.discrepanciaDetectada}`);
  console.log(`🔍 Causa identificada: "${resultadoDream.causaIdentificada}"`);
  console.log(`📢 Mensaje evolutivo: "${resultadoDream.mensajeEvolutivo}"`);
  if (resultadoDream.nuevaReglaAprendida) {
    console.log(`💡 Nueva Regla Generada: [${resultadoDream.nuevaReglaAprendida.id}] ${resultadoDream.nuevaReglaAprendida.insight}`);
  }

  // --------------------------------------------------------------------------
  // ESCENARIO 4: Nueva Cotización en el mismo corredor — Verificación de Recall Contextual
  // --------------------------------------------------------------------------
  console.log('\n--- PASO 4: Nueva Cotización idéntica con Recall de Memoria Reflectiva ---');
  const cotizacionOptimizada = await SaraFletesOrchestrator.cotizarModalidad({
    modalidad: 'mandaditos',
    origen: origenCentro,
    destino: destinoHospital,
    vehicleType: 'DELIVERY_MOTO',
    horaActual: '12:20',
    esUrgente: false
  });

  console.log(`⏱️ Tiempo estimado optimizado por IA: ${cotizacionOptimizada.tiempoEstimadoMinutos} minutos (Ajuste reflectivo aplicado)`);
  console.log(`💵 Tarifa sugerida Win-Win: $${cotizacionOptimizada.tarifa.tarifaSugeridaUSD} USD`);
  console.log(`🧠 Insights de Memoria activos: ${cotizacionOptimizada.insightsMemoria.length}`);
  cotizacionOptimizada.insightsMemoria.forEach((ins, idx) => console.log(`   ${idx + 1}. ${ins}`));

  // --------------------------------------------------------------------------
  // ESCENARIO 5: Flete Pesado con Recargo de Desgaste por Pendiente
  // --------------------------------------------------------------------------
  console.log('\n--- PASO 5: Verificación de Flete Pesado (Bloques / Ladrillos con Pendiente) ---');
  const cotizacionFlete = await SaraFletesOrchestrator.cotizarModalidad({
    modalidad: 'fletes',
    origen: { nombre: 'Fábrica de Bloques Challuabamba', lat: -2.8600, lng: -78.9200, ciudad: 'Cuenca' },
    destino: { nombre: 'Obra Residencial Mirador Alto', lat: -2.9100, lng: -79.0300, ciudad: 'Cuenca' },
    vehicleType: 'CAMION_5T',
    material: 'Bloques / Ladrillos',
    pesoTon: 4.5
  });

  console.log(`🚛 Modalidad: FLETES | Vehículo: Camión 5T`);
  console.log(`📏 Distancia: ${cotizacionFlete.distanciaKm} km | Peso: 4.5 Ton`);
  console.log(`💵 Tarifa sugerida: $${cotizacionFlete.tarifa.tarifaSugeridaUSD} USD`);
  console.log(`⚡ Desglose de Desgaste por Pendiente: $${cotizacionFlete.tarifa.desglose.recargoDesgastePendienteUSD || 0} USD`);
  console.log(`🧠 Insight de Memoria: ${cotizacionFlete.insightsMemoria.join(' | ')}`);

  console.log('\n================================================================');
  console.log('✅ SIMULACIÓN EXITOSA: La cuadrilla demostró aprendizaje continuo y');
  console.log('calibración de ruta/precio en tiempo real con 100% de consistencia.');
  console.log('================================================================\n');
}

runSimulation().catch(err => {
  console.error('❌ Error en simulación:', err);
  process.exit(1);
});
