/**
 * TEST SUITE: SARA-PAGOS & MONETIZACIÓN SAAS B2B FINTECH
 * Valida los modelos matemáticos de Factoring y Pronto Pago 24h,
 * emisión de Dossier Bancario y Certificación UAFE,
 * y los planes SaaS de Gobernanza Tributaria SRI.
 */

import { 
  SaraFactoringService, 
  SOLICITUDES_FACTORING_SEMILLA 
} from '../src/lib/services/saraFactoringService';

import { 
  SaraDossierBancarioService 
} from '../src/lib/services/saraDossierBancarioService';

import { 
  SaraSaaSPlansService, 
  PLANES_SAAS_FINTECH 
} from '../src/lib/services/saraSaaSPlansService';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    if (details) console.error(`     Detalles: ${details}`);
    throw new Error(`Test fallido: ${testName}`);
  }
}

async function runTests() {
  console.log('\n========================================================================');
  console.log('🧪 SARA-PAGOS: PRUEBAS AUTOMATIZADAS DE MONETIZACIÓN SAAS Y FACTORING');
  console.log('========================================================================\n');

  // Test 1: Simulación de Factoring y Descuento Financiero
  console.log('--- 1. Motor de Factoring Digital y Pronto Pago en 24h ---');
  
  // Caso A: Contratista descuenta planilla de $50,000 USD a 30 días
  const sim1 = SaraFactoringService.simularFactoring(50000, 30, 'CONTRATISTA_OBRA');
  assert(sim1.montoNominalUSD === 50000, 'Monto nominal de $50,000 USD correcto');
  assert(sim1.tasaMensual === 1.80, 'Tasa mensual del 1.80% para contratistas de obra');
  assert(sim1.descuentoFinancieroUSD === 900, `Descuento financiero a 30 días ($50,000 * 1.80% = $900): $${sim1.descuentoFinancieroUSD}`);
  assert(sim1.comisionSaraUSD === 250, `Fee tecnológico de originación SARA (0.5% = $250): $${sim1.comisionSaraUSD}`);
  assert(sim1.montoNetoDesembolsoUSD === 48850, `Neto desembolsado en 24h ($50,000 - $900 - $250 = $48,850): $${sim1.montoNetoDesembolsoUSD}`);

  // Caso B: Proveedor de Materiales con Three-Way Match a 45 días
  const sim2 = SaraFactoringService.simularFactoring(30000, 45, 'PROVEEDOR_MATERIALES');
  assert(sim2.tasaMensual === 1.70, 'Tasa preferencial del 1.70% para insumos con Three-Way Match');
  assert(sim2.descuentoFinancieroUSD === 765, `Descuento a 45 días ($30,000 * 1.70% * 1.5 = $765): $${sim2.descuentoFinancieroUSD}`);
  assert(sim2.montoNetoDesembolsoUSD === 29085, `Neto proveedor ($30,000 - $765 - $150 = $29,085): $${sim2.montoNetoDesembolsoUSD}`);

  // Test 2: Invariantes Normativas del Banco Central del Ecuador (Tasa Máxima Legal)
  console.log('\n--- 2. Cumplimiento de Techos de Tasa Efectiva BCE ---');
  assert(sim1.tasaEfectivaAnualizada <= 25.0, `Tasa anualizada (${sim1.tasaEfectivaAnualizada}%) dentro de límites legales de microcrédito/comercial`);
  assert(sim2.tasaEfectivaAnualizada <= 25.0, `Tasa anualizada proveedor (${sim2.tasaEfectivaAnualizada}%) dentro de límites legales`);

  // Test 3: Registro y Flujo de Estados de Factoring
  console.log('\n--- 3. Trazabilidad Transaccional de Factoring ---');
  const nuevaSol = SaraFactoringService.solicitarFactoring({
    codigoFactura: 'FAC-TEST-001',
    razonSocialEmisor: 'CONSTRUCTORA DE PRUEBA CIA. LTDA.',
    rucEmisor: '1799999999001',
    tipoBeneficiario: 'CONTRATISTA_OBRA',
    empresaDeudora: 'MUNICIPIO DE QUITO',
    obraDestino: 'Pavimentación Av. Simón Bolívar',
    montoNominalUSD: 20000,
    plazoDiasAnticipo: 30,
    tasaDescuentoMensual: 1.80,
    descuentoFinancieroUSD: 360,
    comisionServicioSaraUSD: 100,
    montoNetoDesembolsoUSD: 19540,
    cuentaBancariaDestino: {
      banco: 'Banco Pichincha',
      tipoCuenta: 'Corriente',
      numeroCuenta: '2100888888',
      titular: 'Constructora de Prueba'
    }
  });

  assert(nuevaSol.id.startsWith('FCT-'), 'ID de solicitud generado con prefijo FCT');
  assert(nuevaSol.estado === 'PENDIENTE_ANALISIS', 'Estado inicial es PENDIENTE_ANALISIS');

  // Actualizar estado a Aprobado y luego Liquidado
  const aprobada = SaraFactoringService.actualizarEstado(nuevaSol.id, 'APROBADA_EN_CUSTODIA');
  assert(aprobada?.estado === 'APROBADA_EN_CUSTODIA', 'Estado actualizado a APROBADA_EN_CUSTODIA');

  const liquidada = SaraFactoringService.actualizarEstado(nuevaSol.id, 'LIQUIDADA_EN_24H');
  assert(liquidada?.estado === 'LIQUIDADA_EN_24H', 'Estado actualizado a LIQUIDADA_EN_24H');

  // Test 4: Emisión de Dossier Bancario y Certificación UAFE
  console.log('\n--- 4. Dossier Bancario, SRI y Cumplimiento UAFE ---');
  const dossier = SaraDossierBancarioService.emitirCertificado(
    'Torre Corporativa Amazonas',
    'CONSTRUCTORA ANDINA S.A.',
    '1791234567001',
    500000
  );

  assert(dossier.idExpediente.startsWith('DOSSIER-'), 'Expediente emitido con nomenclatura DOSSIER');
  assert(dossier.firmaDigitalSARA.length > 20, 'Firma criptográfica de integridad generada');
  assert(dossier.estadoCertificacion === 'AUDITADO_CONFORME', 'Estado de certificación AUDITADO_CONFORME');

  // Validar los 4 pilares en el Dossier
  assert(dossier.fideicomiso.montoTotalPresupuestadoUSD === 500000, 'Fideicomiso: Monto de $500,000 USD correcto');
  assert(dossier.fideicomiso.hitosValidados.length === 4, 'Fideicomiso: Contiene los 4 hitos constructivos');
  assert(dossier.auditoriaTributaria.certificadoCumplimientoSRI === true, 'Auditoría SRI: Certificado de cumplimiento vigente');
  assert(dossier.cumplimientoUAFE.aplicaProtocoloRESU === true, 'UAFE: Aplica protocolo RESU por monto >= $10,000 USD');
  assert(dossier.cumplimientoUAFE.nivelRiesgoLA_FT === 'BAJO', 'UAFE: Nivel de riesgo LA/FT calificado como BAJO');
  assert(dossier.viabilidadFinanciera.cfcr30Dias >= 1.20, 'Viabilidad: Ratio de Cobertura CFCR saludable (> 1.20)');
  assert(dossier.viabilidadFinanciera.calificacionBancariaSugerida === 'AAA', 'Viabilidad: Calificación bancaria AAA');

  // Test 5: Catálogo de Planes SaaS FinTech B2B
  console.log('\n--- 5. Planes de Suscripción SaaS para Constructoras ---');
  const planesSaaS = SaraSaaSPlansService.getPlanes();
  assert(planesSaaS.length === 3, 'Existen los 3 planes SaaS oficiales (Starter, Pro, Enterprise)');

  const starter = planesSaaS.find(p => p.slug === 'starter');
  const pro = planesSaaS.find(p => p.slug === 'pro');
  const enterprise = planesSaaS.find(p => p.slug === 'enterprise');

  assert(starter!.precioMensualUSD === 49.00, 'Plan Starter: $49/mes');
  assert(pro!.precioMensualUSD === 149.00, 'Plan Pro: $149/mes');
  assert(enterprise!.precioMensualUSD === 399.00, 'Plan Enterprise: $399/mes');

  // Ahorro Anual de 2 Meses
  assert(starter!.precioAnualUSD === 490.00, 'Starter Anual ($49 * 10 = $490, 2 meses gratis)');
  assert(pro!.precioAnualUSD === 1490.00, 'Pro Anual ($149 * 10 = $1490, 2 meses gratis)');
  assert(enterprise!.precioAnualUSD === 3990.00, 'Enterprise Anual ($399 * 10 = $3990, 2 meses gratis)');

  console.log('\n========================================================================');
  console.log(`🎉 RESULTADO FINAL: ${passedTests}/${totalTests} pruebas pasaron exitosamente.`);
  console.log('========================================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ ERROR DURANTE LA EJECUCIÓN DE PRUEBAS:', err);
  process.exit(1);
});
