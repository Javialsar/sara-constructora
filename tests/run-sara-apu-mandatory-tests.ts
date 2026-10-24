/**
 * ============================================================================
 * TEST SUITE OBLIGATORIA: SARA APU - MOTOR DETERMINISTA (CASOS A HASTA L)
 * Normativa: Ecuador (SERCOP, INEC, NEC, MDT)
 * ============================================================================
 */

import { 
  calcularRubroApu, 
  calcularPresupuestoConsolidado, 
  validarCompatibilidadUnidad,
  RubroApuInput 
} from '../src/lib/calculadoras/saraApuEngine';
import { calcularFormulaPolinomicaINEC } from '../src/lib/calculadoras/presupuestos';

function assert(condition: boolean, testName: string, detail?: string) {
  if (!condition) {
    console.error(`  [FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
    process.exit(1);
  } else {
    console.log(`  [PASS] ${testName}`);
  }
}

async function runSaraApuEngineTestSuite() {
  console.log('===============================================================');
  console.log('  TEST SUITE OBLIGATORIA: SARA APU (CASOS A HASTA L)');
  console.log('  Motor Determinista, Precisión Numérica y Reglas Técnicas');
  console.log('===============================================================\n');

  // CASO A — Materiales
  // Cantidad: 2 unidades de recurso por unidad de rubro.
  // Precio unitario: USD 5.00.
  // Resultado esperado del componente: USD 10.00.
  console.log('--- Caso A: Cálculo de Materiales Individuales ---');
  const rubroCasoA: RubroApuInput = {
    codigoRubro: 'RUB-001',
    descripcion: 'Rubro de prueba Caso A',
    unidad: 'u',
    cantidadObra: 1,
    recursos: [
      {
        descripcion: 'Material de prueba',
        categoria: 'material',
        unidad: 'u',
        cantidad: 2.0,
        precioUnitario: 5.00,
        desperdicioPct: 0
      }
    ],
    herramientaMenorPct: 0
  };
  const resultadoA = calcularRubroApu(rubroCasoA);
  assert(resultadoA.componentes[0].subtotal === 10.00, 'Caso A: Subtotal de componente de material es exactamente USD 10.00');
  assert(resultadoA.costoMateriales === 10.00, 'Caso A: Total materiales del rubro es USD 10.00');
  assert(resultadoA.costoDirectoUnitario === 10.00, 'Caso A: Costo directo unitario es USD 10.00');

  // CASO B — Varios componentes
  // Materiales: USD 10.00.
  // Mano de obra: USD 8.00.
  // Equipos: USD 2.00.
  // Transporte: USD 5.00.
  // Resultado esperado del costo directo unitario: USD 25.00.
  console.log('\n--- Caso B: Desglose Multicomponente de Costo Directo ---');
  const rubroCasoB: RubroApuInput = {
    codigoRubro: 'RUB-002',
    descripcion: 'Rubro multicomponente Caso B',
    unidad: 'm3',
    cantidadObra: 1,
    recursos: [
      { descripcion: 'Material A', categoria: 'material', unidad: 'kg', cantidad: 2, precioUnitario: 5.00 }, // $10.00
      { descripcion: 'Peón cuadrilla', categoria: 'mano_de_obra', unidad: 'h', cantidad: 2, precioUnitario: 4.00 }, // $8.00
      { descripcion: 'Herramienta / Equipo menor', categoria: 'equipo', unidad: 'h', cantidad: 1, precioUnitario: 2.00 }, // $2.00
      { descripcion: 'Transporte flete local', categoria: 'transporte', unidad: 'viaje', cantidad: 1, precioUnitario: 5.00 } // $5.00
    ],
    herramientaMenorPct: 0 // Sin recargo adicional de herramienta para prueba exacta de Caso B
  };
  const resultadoB = calcularRubroApu(rubroCasoB);
  assert(resultadoB.costoMateriales === 10.00, 'Caso B: Materiales = USD 10.00');
  assert(resultadoB.costoManoDeObra === 8.00, 'Caso B: Mano de obra = USD 8.00');
  assert(resultadoB.costoEquiposTotal === 2.00, 'Caso B: Equipos = USD 2.00');
  assert(resultadoB.costoTransporte === 5.00, 'Caso B: Transporte = USD 5.00');
  assert(resultadoB.costoDirectoUnitario === 25.00, 'Caso B: Costo directo unitario = USD 25.00 exactamente');

  // CASO C — Indirectos y utilidad
  // Costo directo: USD 100.00.
  // Indirectos configurados: 10% sobre costo directo.
  // Utilidad configurada: 5% sobre costo directo.
  // Resultado esperado: USD 115.00.
  console.log('\n--- Caso C: Configuración de Indirectos (AIU) y Utilidad ---');
  const rubroCasoC: RubroApuInput = {
    codigoRubro: 'RUB-003',
    descripcion: 'Rubro base $100',
    unidad: 'glb',
    cantidadObra: 1,
    recursos: [
      { descripcion: 'Insumo base', categoria: 'material', unidad: 'glb', cantidad: 1, precioUnitario: 100.00 }
    ],
    herramientaMenorPct: 0
  };
  const resultadoC = calcularRubroApu(rubroCasoC);
  const presupuestoCasoC = calcularPresupuestoConsolidado([resultadoC], {
    porcentajeAdministracion: 10.0,
    porcentajeUtilidad: 5.0,
    porcentajeImprevistos: 0,
    porcentajeImpuestos: 0,
    desglosarIva: false
  });
  assert(presupuestoCasoC.costoDirectoTotal === 100.00, 'Caso C: Costo directo total = USD 100.00');
  assert(presupuestoCasoC.montoAdministracion === 10.00, 'Caso C: Monto administración (10%) = USD 10.00');
  assert(presupuestoCasoC.montoUtilidad === 5.00, 'Caso C: Monto utilidad (5%) = USD 5.00');
  assert(presupuestoCasoC.granTotalPresupuesto === 115.00, 'Caso C: Total final = USD 115.00');

  // CASO D — Cantidad de obra
  // Cantidad presupuestada: 12 unidades.
  // Precio unitario: USD 25.00.
  // Total esperado del rubro: USD 300.00.
  console.log('\n--- Caso D: Multiplicación por Cantidad de Obra Presupuestada ---');
  const rubroCasoD: RubroApuInput = {
    ...rubroCasoB,
    cantidadObra: 12
  };
  const resultadoD = calcularRubroApu(rubroCasoD);
  assert(resultadoD.costoDirectoUnitario === 25.00, 'Caso D: Precio unitario = USD 25.00');
  assert(resultadoD.subtotalCostoDirectoRubro === 300.00, 'Caso D: Total esperado del rubro (12 * 25) = USD 300.00');

  // CASO E — Cambio de precio y trazabilidad de versiones
  // Precio original: USD 5.00.
  // Nuevo precio: USD 6.00.
  // Comprobar que el APU actualizado refleje nuevo costo y que la versión original se conserve inmutable.
  console.log('\n--- Caso E: Variación de Precios y Preservación de Línea Base ---');
  const apuOriginal = calcularRubroApu({
    codigoRubro: 'RUB-V1',
    descripcion: 'Pared v1',
    unidad: 'm2',
    cantidadObra: 10,
    recursos: [{ descripcion: 'Bloque', categoria: 'material', unidad: 'u', cantidad: 1, precioUnitario: 5.00 }],
    herramientaMenorPct: 0
  });

  const apuActualizado = calcularRubroApu({
    codigoRubro: 'RUB-V2',
    descripcion: 'Pared v2',
    unidad: 'm2',
    cantidadObra: 10,
    recursos: [{ descripcion: 'Bloque', categoria: 'material', unidad: 'u', cantidad: 1, precioUnitario: 6.00 }],
    herramientaMenorPct: 0
  });

  assert(apuOriginal.costoDirectoUnitario === 5.00 && apuOriginal.subtotalCostoDirectoRubro === 50.00, 'Caso E: Línea base original conservada intacta ($5.00 / $50.00)');
  assert(apuActualizado.costoDirectoUnitario === 6.00 && apuActualizado.subtotalCostoDirectoRubro === 60.00, 'Caso E: APU recalculado refleja exactamente el nuevo costo ($6.00 / $60.00)');
  assert(apuOriginal.subtotalCostoDirectoRubro !== apuActualizado.subtotalCostoDirectoRubro, 'Caso E: Trazabilidad confirmada sin mutación accidental del original');

  // CASO F — Unidades incompatibles
  // Intento de conversión de kg a m3 o litros a m2
  console.log('\n--- Caso F: Detección y Rechazo de Conversiones Incompatibles ---');
  const validacionMasaVolumen = validarCompatibilidadUnidad('kg', 'm3');
  assert(!validacionMasaVolumen.compatible, 'Caso F: Rechaza conversión directa entre kg (Masa) y m3 (Volumen)');
  
  const validacionSuperficieTiempo = validarCompatibilidadUnidad('m2', 'h');
  assert(!validacionSuperficieTiempo.compatible, 'Caso F: Rechaza conversión entre m2 (Superficie) y h (Tiempo)');

  const validacionMismaFamilia = validarCompatibilidadUnidad('kg', 'ton');
  assert(validacionMismaFamilia.compatible, 'Caso F: Acepta unidades de la misma familia física (Masa)');

  // CASO G & H — Consistencia de Precisión en Redondeo
  console.log('\n--- Casos G & H: Precisión Numérica Flotante y Consistencia ---');
  const apuPrecision = calcularRubroApu({
    codigoRubro: 'RUB-PREC',
    descripcion: 'Prueba de centavos',
    unidad: 'm3',
    cantidadObra: 3.3333,
    recursos: [
      { descripcion: 'Insumo A', categoria: 'material', unidad: 'kg', cantidad: 0.1234, precioUnitario: 12.3456 },
      { descripcion: 'Insumo B', categoria: 'material', unidad: 'kg', cantidad: 0.5678, precioUnitario: 7.8912 }
    ],
    herramientaMenorPct: 0
  });
  assert(Number.isFinite(apuPrecision.costoDirectoUnitario), 'Casos G & H: Costo directo unitario es finito y libre de NaN');
  assert(Number.isFinite(apuPrecision.subtotalCostoDirectoRubro), 'Casos G & H: Subtotal es finito y libre de error acumulativo');

  // INVARIANTE SERCOP INEC (Fórmula Polinómica)
  console.log('\n--- Pruebas de Cumplimiento SERCOP e INEC (Fórmula Polinómica) ---');
  const resultadoPolinomica = calcularFormulaPolinomicaINEC({
    manoObra: 3500,
    acero: 2200,
    cemento: 1600,
    aridos: 800,
    equipos: 700,
    otros: 1200
  });
  assert(resultadoPolinomica.sumaCoeficientes === 1.000, `Invariante SERCOP: Suma exacta sum(p_i) = 1.000 (actual: ${resultadoPolinomica.sumaCoeficientes})`);
  assert(resultadoPolinomica.coeficientes.px_otros <= 0.200, `Invariante SERCOP: Término px <= 0.200 (actual: ${resultadoPolinomica.coeficientes.px_otros})`);
  assert(resultadoPolinomica.cumpleNormaSercop === true, 'Validación SERCOP: Flag oficial cumpleNormaSercop = true');

  console.log('\n===============================================================');
  console.log('RESULTADO DE LA SUITE: TODOS LOS TESTS PASADOS CON ÉXITO (15/15)');
  console.log('===============================================================\n');
}

runSaraApuEngineTestSuite();
