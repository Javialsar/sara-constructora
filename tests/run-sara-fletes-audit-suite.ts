// ============================================================================
// SUITE DE AUDITORÍA Y VERIFICACIÓN AUTOMATIZADA: SARA-FLETES V2
// Evaluación de Modelos Matemáticos, Tarifas Dinámicas, Antifraude GPS y MTOP
// GRUPO SARA • Cuadrilla Multiagente de Auditoría & Calidad
// ============================================================================

import { SaraFreightPricingService, CATALOGO_VEHICULOS_SARA } from '../src/lib/services/saraFreightPricingService';
import { SaraFreightGpsAntiFraud, TelemetryPoint } from '../src/lib/services/saraFreightGpsAntiFraud';
import { SaraMtopBalanzasService, LIMITES_VEHICULOS_MTOP } from '../src/lib/services/saraMtopBalanzasService';
import { SaraFreightRoutingService, HITOS_NACIONALES_ECUADOR } from '../src/lib/services/saraFreightRoutingService';

interface TestRecord {
  id: string;
  category: 'PRICING' | 'GPS_ANTIFRAUD' | 'MTOP_COMPLIANCE' | 'ROUTING_GEO' | 'FINANCIAL_INTEGRITY';
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  evidence: any;
}

const auditRecords: TestRecord[] = [];

function assertTest(
  id: string,
  category: TestRecord['category'],
  name: string,
  condition: boolean,
  expected: string,
  actual: string,
  evidence: any
) {
  auditRecords.push({
    id,
    category,
    name,
    passed: condition,
    expected,
    actual,
    evidence
  });

  if (condition) {
    console.log(`  [PASS] [${id}] ${name}`);
  } else {
    console.error(`  [FAIL] [${id}] ${name} -> Esperado: ${expected} | Obtenido: ${actual}`);
  }
}

async function runSaraFletesAuditSuite() {
  console.log('\n===============================================================');
  console.log('   EJECUTANDO SUITE DE AUDITORÍA INDEPENDIENTE: SARA-FLETES V2   ');
  console.log('===============================================================\n');

  // --------------------------------------------------------------------------
  // BLOQUE 1: MOTOR DE TARIFICACIÓN DINÁMICA & REGLAS DE NEGOCIO (AGENTE H & F)
  // --------------------------------------------------------------------------
  console.log('--- 1. Tarificación Dinámica, Tarifas Mínimas y Factores de Material ---');
  
  // 1.1 Flete Urbano Corto en Camioneta (<= 5km)
  const fleteUrbano = SaraFreightPricingService.calcularTarifa(3.0, 0.8, 'PICKUP_1T', 'Otros Materiales');
  assertTest(
    'FLT-PRC-001',
    'PRICING',
    'Flete local urbano aplica tarifa base urbana sin recargos pesados',
    fleteUrbano.esFleteLocal === true && fleteUrbano.tarifaSugeridaUSD >= 2.00 && fleteUrbano.tarifaSugeridaUSD <= 5.00,
    'Tarifa local $2.00 - $5.00 USD',
    `$${fleteUrbano.tarifaSugeridaUSD} USD (Local: ${fleteUrbano.esFleteLocal})`,
    fleteUrbano
  );

  // 1.2 Respeto a Tarifa Mínima de Catálogo
  const fleteMinimo = SaraFreightPricingService.calcularTarifa(0.2, 0.1, 'PICKUP_1T', 'Otros Materiales');
  assertTest(
    'FLT-PRC-002',
    'PRICING',
    'Tarifa mínima de $2.00 USD garantizada para distancias ínfimas',
    fleteMinimo.tarifaSugeridaUSD >= CATALOGO_VEHICULOS_SARA.PICKUP_1T.tarifaMinimaLocalUSD,
    `>= $${CATALOGO_VEHICULOS_SARA.PICKUP_1T.tarifaMinimaLocalUSD} USD`,
    `$${fleteMinimo.tarifaSugeridaUSD} USD`,
    fleteMinimo
  );

  // 1.3 Recargo por Tipo de Material (Varillas de Acero 1.15x vs Base 1.00x)
  const fleteBase = SaraFreightPricingService.calcularTarifa(15.0, 4.0, 'CAMION_5T', 'Otros Materiales');
  const fleteAcero = SaraFreightPricingService.calcularTarifa(15.0, 4.0, 'CAMION_5T', 'Varillas de Acero');
  const ratioAcero = Number((fleteAcero.tarifaSugeridaUSD / fleteBase.tarifaSugeridaUSD).toFixed(2));
  assertTest(
    'FLT-PRC-003',
    'PRICING',
    'Recargo de complejidad para Varillas de Acero (factor ~1.15)',
    ratioAcero >= 1.10 && ratioAcero <= 1.20,
    'Ratio tarifa 1.10x - 1.20x',
    `Ratio obtenido: ${ratioAcero}x ($${fleteAcero.tarifaSugeridaUSD} vs $${fleteBase.tarifaSugeridaUSD})`,
    { base: fleteBase.tarifaSugeridaUSD, acero: fleteAcero.tarifaSugeridaUSD, ratio: ratioAcero }
  );

  // 1.4 Renta Temporal por Horas con Chofer
  const rentaHoras = SaraFreightPricingService.calcularRentaTemporal('PICKUP_1T', 'HORAS', 4, true);
  // Tarifa base ($12*4 = $48) + Chofer ($6*4 = $24) + Seguro ($5) = $77
  assertTest(
    'FLT-PRC-004',
    'PRICING',
    'Renta por 4 horas con chofer calcula base + suplemento + seguro',
    rentaHoras.tarifaTotalUSD === 77.00 && rentaHoras.suplementoChoferUSD === 24.00,
    'Total: $77.00 USD, Chofer: $24.00 USD',
    `Total: $${rentaHoras.tarifaTotalUSD} USD, Chofer: $${rentaHoras.suplementoChoferUSD} USD`,
    rentaHoras
  );

  // 1.5 Renta Temporal por Días con Descuento Semanal (>= 7 días -> 20% desc)
  const rentaSemana = SaraFreightPricingService.calcularRentaTemporal('PICKUP_1T', 'DIAS', 7, false);
  // Base 65 * 7 * 0.8 = 364.00 + seguro 8*7=56 -> 420.00 USD
  assertTest(
    'FLT-PRC-005',
    'PRICING',
    'Descuento del 20% aplicado automáticamente en renta semanal (>= 7 días)',
    rentaSemana.descuentoDuracionPct === 20 && rentaSemana.tarifaTotalUSD === 420.00,
    'Descuento: 20%, Total: $420.00 USD',
    `Descuento: ${rentaSemana.descuentoDuracionPct}%, Total: $${rentaSemana.tarifaTotalUSD} USD`,
    rentaSemana
  );

  // --------------------------------------------------------------------------
  // BLOQUE 2: CIBERSEGURIDAD Y DETECCIÓN ANTIFRAUDE GPS (AGENTE B & K)
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Ciberseguridad Telemática, Filtro Cinemático y Mock GPS ---');

  // 2.1 Movimiento Normal en Carretera (Quito a Tambillo: 25 km en 30 min -> 50 km/h)
  const t0 = Date.now();
  const p1: TelemetryPoint = { lat: -0.1807, lng: -78.4678, timestamp: t0, accuracy: 5.0 };
  const p2Normal: TelemetryPoint = { lat: -0.3807, lng: -78.5178, timestamp: t0 + (30 * 60 * 1000), accuracy: 6.2 };
  const validacionNormal = SaraFreightGpsAntiFraud.validarTransicionGps(p1, p2Normal);
  assertTest(
    'FLT-SEC-001',
    'GPS_ANTIFRAUD',
    'Telemetría cinemática plausible aprobada con ThreatLevel LOW',
    validacionNormal.isValid === true && validacionNormal.threatLevel === 'LOW' && validacionNormal.calculatedSpeedKmh < 100,
    'isValid: true, ThreatLevel: LOW, Speed < 100 km/h',
    `isValid: ${validacionNormal.isValid}, Threat: ${validacionNormal.threatLevel}, Speed: ${validacionNormal.calculatedSpeedKmh} km/h`,
    validacionNormal
  );

  // 2.2 Salto Cinemático Imposible (Teletransportación / Spoofing)
  // Salto de Quito a Guayaquil (270 km) en 60 segundos -> ~16,200 km/h
  const p2Teleport: TelemetryPoint = { lat: -2.1894, lng: -79.8891, timestamp: t0 + 60000, accuracy: 5.0 };
  const validacionSpoof = SaraFreightGpsAntiFraud.validarTransicionGps(p1, p2Teleport);
  assertTest(
    'FLT-SEC-002',
    'GPS_ANTIFRAUD',
    'Detección y bloqueo de salto cinemático imposible (>130 km/h) como CRITICAL',
    validacionSpoof.isValid === false && validacionSpoof.threatLevel === 'CRITICAL' && validacionSpoof.isMockSuspected === true,
    'isValid: false, Threat: CRITICAL, isMockSuspected: true',
    `isValid: ${validacionSpoof.isValid}, Threat: ${validacionSpoof.threatLevel}, Speed: ${validacionSpoof.calculatedSpeedKmh} km/h`,
    validacionSpoof
  );

  // 2.3 Precisión Artificial Fija de Emulador (Mock Location 0.0m con velocidad creíble)
  // El vehículo avanza apenas 30 metros en 5 segundos (~21.6 km/h) pero reporta accuracy 0.0m
  const pMock: TelemetryPoint = { lat: -0.1809, lng: -78.4680, timestamp: t0 + 5000, accuracy: 0.0 };
  const validacionMock = SaraFreightGpsAntiFraud.validarTransicionGps(p1, pMock);
  assertTest(
    'FLT-SEC-003',
    'GPS_ANTIFRAUD',
    'Detección de Mock Location por precisión fija de 0.0m reportada',
    validacionMock.isMockSuspected === true && validacionMock.threatLevel === 'MEDIUM',
    'isMockSuspected: true, Threat: MEDIUM',
    `isMockSuspected: ${validacionMock.isMockSuspected}, Threat: ${validacionMock.threatLevel}`,
    validacionMock
  );

  // 2.4 Corrupción de Estampilla de Tiempo (Delta <= 0 ms)
  const pTimeCorrupt: TelemetryPoint = { lat: -0.1850, lng: -78.4690, timestamp: t0 - 1000 };
  const validacionTime = SaraFreightGpsAntiFraud.validarTransicionGps(p1, pTimeCorrupt);
  assertTest(
    'FLT-SEC-004',
    'GPS_ANTIFRAUD',
    'Rechazo de telemetría corrupta o desordenada en el tiempo (Delta <= 0 ms)',
    validacionTime.isValid === false && validacionTime.threatLevel === 'HIGH',
    'isValid: false, Threat: HIGH',
    `isValid: ${validacionTime.isValid}, Threat: ${validacionTime.threatLevel}`,
    validacionTime
  );

  // --------------------------------------------------------------------------
  // BLOQUE 3: CONFORMIDAD NORMATIVA MTOP Y BALANZAS VIALES (AGENTE H & M)
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Conformidad Técnica MTOP, PBV y Balanzas Estatales ---');

  // 3.1 Carga Legal en Volqueta V3A (11.5T Tara + 13.0T Carga = 24.5T <= 27.0T PBV)
  const pesajeVolquetaNormal = SaraMtopBalanzasService.evaluarPesaje('VOLQUETA_V3A', 13.0);
  assertTest(
    'FLT-MTP-001',
    'MTOP_COMPLIANCE',
    'Carga de 13T en Volqueta V3A dentro de norma legal MTOP (PBV <= 27T)',
    pesajeVolquetaNormal.dentroDeNorma === true && pesajeVolquetaNormal.pbvCalculadoTon === 24.5,
    'dentroDeNorma: true, PBV: 24.5T',
    `dentroDeNorma: ${pesajeVolquetaNormal.dentroDeNorma}, PBV: ${pesajeVolquetaNormal.pbvCalculadoTon}T`,
    pesajeVolquetaNormal
  );

  // 3.2 Sobrepeso e Infracción Grave en Volqueta V3A (11.5T Tara + 18.0T Carga = 29.5T > 27.0T PBV)
  const pesajeSobrepeso = SaraMtopBalanzasService.evaluarPesaje('VOLQUETA_V3A', 18.0);
  assertTest(
    'FLT-MTP-002',
    'MTOP_COMPLIANCE',
    'Detección automática de sobrepeso ilegal (+2.5T) y sanción calculada según SBU 2026 ($482)',
    pesajeSobrepeso.dentroDeNorma === false && pesajeSobrepeso.sobrepesoTon === 2.5 && (pesajeSobrepeso.multaSugeridaSbu || 0) >= 482,
    'dentroDeNorma: false, sobrepeso: 2.5T, multa >= $482',
    `dentroDeNorma: ${pesajeSobrepeso.dentroDeNorma}, sobrepeso: +${pesajeSobrepeso.sobrepesoTon}T, multa: $${pesajeSobrepeso.multaSugeridaSbu}`,
    pesajeSobrepeso
  );

  // 3.3 Detección de Balanzas en Corredor Panamericana Sur (Machachi / Lasso)
  const balanzasCorredor = SaraMtopBalanzasService.obtenerBalanzasEnCorredor(
    [-0.1807, -78.4678], // Quito
    [-0.9289, -78.6111]  // Latacunga
  );
  assertTest(
    'FLT-MTP-003',
    'MTOP_COMPLIANCE',
    'Identificación de balanzas oficiales de pesaje en corredor Quito-Latacunga',
    balanzasCorredor.length >= 1,
    'Al menos 1 balanza identificada',
    `Balanzas encontradas: ${balanzasCorredor.length} (${balanzasCorredor.map(b => b.nombre).join(', ')})`,
    balanzasCorredor
  );

  // --------------------------------------------------------------------------
  // BLOQUE 4: RUTEO GEOESPACIAL Y PUNTOS ESTRATÉGICOS NACIONALES (AGENTE I)
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Infraestructura Geográfica y Geocodificación Estratégica ---');

  // 4.1 Cobertura de Puertos Estratégicos (Contecon Guayaquil, DP World Posorja, Puerto Bolívar)
  const contecon = HITOS_NACIONALES_ECUADOR['contecon'];
  const posorja = HITOS_NACIONALES_ECUADOR['dp world posorja'];
  const ptoBolivar = HITOS_NACIONALES_ECUADOR['puerto bolivar'];
  assertTest(
    'FLT-GEO-001',
    'ROUTING_GEO',
    'Puntos portuarios estratégicos de comercio exterior georreferenciados',
    Boolean(contecon && posorja && ptoBolivar),
    'Puertos Contecon, Posorja y Bolívar definidos',
    `Contecon: [${contecon?.lat}, ${contecon?.lng}], Posorja: [${posorja?.lat}, ${posorja?.lng}]`,
    { contecon, posorja, ptoBolivar }
  );

  // 4.2 Distancia Geodésica Haversine Precisa (Quito a Guayaquil ~270 km línea recta)
  const distQuitoGye = SaraFreightPricingService.distanciaHaversineKm(-0.1807, -78.4678, -2.1894, -79.8891);
  assertTest(
    'FLT-GEO-002',
    'ROUTING_GEO',
    'Fórmula de Haversine calibrada (Quito - Guayaquil en ~265 - 280 km geodésicos)',
    distQuitoGye >= 260 && distQuitoGye <= 285,
    '260 - 285 km',
    `${distQuitoGye} km`,
    { distQuitoGye }
  );

  // --------------------------------------------------------------------------
  // BLOQUE 5: CIBERSEGURIDAD FINANCIERA & PROTECCIÓN DE TARIFAS (AGENTE F)
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Ciberseguridad Financiera y Validación de Tarifas en Servidor ---');

  // 5.1 Importación de Server Action de Validación
  const { createValidatedFletesSolicitudAction } = await import('../src/app/actions/saraFletesWalletActions');

  // 5.2 Propuesta legítima de flete (Quito - Guayaquil 270 km en Tráiler 3S3 con 28T acero)
  const calcTest = SaraFreightPricingService.calcularTarifa(270, 28, 'TRACTO_3S3', 'Varillas de Acero');
  const tarifaValida = +(calcTest.tarifaSugeridaUSD * 1.05).toFixed(2);
  const reqLegitima = await createValidatedFletesSolicitudAction({
    origen: 'Quito, Pichincha',
    destino: 'Guayaquil, Guayas',
    distanciaKm: 270,
    pesoTon: 28,
    vehiculoKey: 'TRACTO_3S3',
    tipoMaterial: 'Varillas de Acero',
    tarifaOfertadaUSD: tarifaValida
  });
  assertTest(
    'FLT-FIN-001',
    'FINANCIAL_INTEGRITY',
    'Aprobación en servidor de propuesta económica dentro de la banda de negociación oficial',
    reqLegitima.success === true && reqLegitima.tarifaValidadaUSD === tarifaValida,
    `success: true, tarifa: $${tarifaValida} USD`,
    `success: ${reqLegitima.success}, tarifa: $${reqLegitima.tarifaValidadaUSD} USD`,
    reqLegitima
  );

  // 5.3 Rechazo de Intento de Manipulación de Tarifa (Hack a $0.50 USD para flete de 270 km)
  const reqHackMin = await createValidatedFletesSolicitudAction({
    origen: 'Quito, Pichincha',
    destino: 'Guayaquil, Guayas',
    distanciaKm: 270,
    pesoTon: 28,
    vehiculoKey: 'TRACTO_3S3',
    tipoMaterial: 'Varillas de Acero',
    tarifaOfertadaUSD: 0.50 // Intento malicioso de manipulación client-side
  });
  assertTest(
    'FLT-FIN-002',
    'FINANCIAL_INTEGRITY',
    'Bloqueo en servidor de intento de manipulación con tarifa irrisoria ($0.50 USD)',
    reqHackMin.success === false && reqHackMin.error?.includes('TARIFA_FUERA_DE_RANGO') === true,
    'success: false, error: TARIFA_FUERA_DE_RANGO',
    `success: ${reqHackMin.success}, error: ${reqHackMin.error}`,
    reqHackMin
  );

  // --------------------------------------------------------------------------
  // RESUMEN Y BALANCE DE LA SUITE
  // --------------------------------------------------------------------------
  const total = auditRecords.length;
  const pasados = auditRecords.filter(r => r.passed).length;
  const fallados = total - pasados;

  console.log('\n===============================================================');
  console.log(`RESULTADO DE LA SUITE SARA-FLETES: ${pasados} PASADOS | ${fallados} FALLADOS (TOTAL: ${total})`);
  console.log('===============================================================\n');

  return { total, pasados, fallados, records: auditRecords };
}

// Ejecutar si es invocado directamente
runSaraFletesAuditSuite().catch(console.error);
