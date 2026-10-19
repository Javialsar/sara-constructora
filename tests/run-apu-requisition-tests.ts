import { 
  PROYECTOS_OBRA_MOCK, 
  ApuRequisitionWorkflowService 
} from '../src/lib/services/apuRequisitionWorkflowService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  [FAIL] ${message}`);
    process.exit(1);
  } else {
    console.log(`  [PASS] ${message}`);
  }
}

async function runApuRequisitionTestSuite() {
  console.log('===============================================================');
  console.log('  TEST SUITE: REQUISICIONES APU & COMPRAS AGÉNTICAS (GRUPO SARA)');
  console.log('===============================================================\n');

  // Test 1: Explosión Automática de APU y Creación de Requisición
  console.log('--- 1. Pruebas de Explosión Matemática de APU ---');
  const proyecto = PROYECTOS_OBRA_MOCK[0]; // Edificio El Mirador (Loja)
  const fase = proyecto.fasesCronograma[1]; // Fase 2: Estructura Vertical y Losa +3.00m
  
  const req = ApuRequisitionWorkflowService.generarRequisicionDesdeFase(proyecto, fase);
  
  assert(req.numeroRequisicion.startsWith('RQ-LOJ-'), 'Código de requisición georreferenciado generado');
  assert(req.materiales.length >= 6, 'Explosión de insumos de materiales completa');
  assert(req.equipos.length >= 2, 'Equipos y maquinaria requerida calculada');
  assert(req.cuadrilla.length >= 3, 'Cuadrillas con certificación SECAP requeridas');
  assert(req.pesoTotalCargaToneladas > 50, `Cálculo de peso total de carga (${req.pesoTotalCargaToneladas} T)`);

  // Test 2: Validación de Desperdicio Normativo NEC
  console.log('\n--- 2. Pruebas de Desperdicio Normativo NEC ---');
  const acero = req.materiales.find(m => m.codigo === 'AC-ADEL-12MM');
  assert(!!acero && acero.desperdicioNormativoPct === 6.0, 'Factor de desperdicio normativo 6% aplicado en acero');
  assert(!!acero && acero.cantidadRequerida > acero.cantidadNeta, 'Cantidad requerida incluye desperdicio normativo');

  // Test 3: Análisis Multicriterio del Agente SARA_PREDICTIVE_PURCHASE
  console.log('\n--- 3. Pruebas del Agente SARA_PREDICTIVE_PURCHASE ---');
  const analisis = ApuRequisitionWorkflowService.analizarRequisicionConAgente(req);

  assert(!!analisis.opcionA && !!analisis.opcionB, 'Generación de las 2 Opciones Estratégicas');
  assert(analisis.opcionA.enfoque === 'FABRICA_MAYORISTA_AHORRO', 'Opción A orientada a fábrica con descuento por volumen');
  assert(analisis.opcionB.enfoque === 'DISTRIBUIDOR_LOCAL_VELOCIDAD', 'Opción B orientada a distribuidor local para inmediatez');
  assert(analisis.opcionA.costoTotalLandedUSD < analisis.opcionB.costoTotalLandedUSD, 'Opción A demuestra ahorro económico frente a precio de mostrador');
  assert(analisis.opcionB.tiempoEstimadoHoras < analisis.opcionA.tiempoEstimadoHoras, 'Opción B demuestra velocidad de entrega inmediata (3h vs 24h)');

  // Test 4: Fragmentación Automática en Órdenes de Compra por Proveedor
  console.log('\n--- 4. Pruebas de Fragmentación de Órdenes de Compra ---');
  const ocs = ApuRequisitionWorkflowService.generarOrdenesDeCompraFragmentadas(req, analisis.opcionA);

  assert(ocs.length >= 2, `Fragmentación exitosa en ${ocs.length} Órdenes de Compra por fabricante`);
  
  const ocAdelca = ocs.find(o => o.razonSocial.toLowerCase().includes('adelca'));
  assert(!!ocAdelca && ocAdelca.numeroOC.includes('ADEL'), 'Orden de Compra ADELCA para aceros generada');
  assert(!!ocAdelca && ocAdelca.notificacionBodegaEnviada, 'Notificación digital a Bodega confirmada');
  assert(!!ocAdelca && ocAdelca.notificacionContabilidadEnviada, 'Provisión contable para 3-Way Match activada');

  const ocHolcim = ocs.find(o => o.razonSocial.toLowerCase().includes('holcim'));
  assert(!!ocHolcim && ocHolcim.numeroOC.includes('HOLC'), 'Orden de Compra HOLCIM para cementos generada');

  console.log('\n===============================================================');
  console.log('RESULTADO DE LA SUITE: TODOS LOS TESTS PASADOS CON ÉXITO (13/13)');
  console.log('===============================================================\n');
}

runApuRequisitionTestSuite();
