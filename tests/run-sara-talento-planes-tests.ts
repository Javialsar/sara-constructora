/**
 * TEST SUITE: SARA Talento Humano - Sistema de Planes de Éxito y Colocación Laboral ($0 Inicial)
 * Valida los modelos, cálculos matemáticos de comisión por colocación, invariantes de negocio y persistencia.
 */

import { 
  TalentoPlanesService, 
  PLANES_TALENTO_DEFAULT, 
  TalentoPlan 
} from '../src/lib/services/talentoPlanesService';

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
  console.log('🧪 SARA-TALENTOHUMANO: PRUEBAS AUTOMATIZADAS DE PLANES DE COLOCACIÓN');
  console.log('========================================================================\n');

  // Test 1: Planes por defecto
  console.log('--- 1. Validación de Planes Iniciales ---');
  const planes = TalentoPlanesService.getPlanes();
  assert(planes.length >= 3, 'Existen al menos 3 planes de colocación configurados');
  
  const vip = planes.find(p => p.id === 'vip');
  const profesional = planes.find(p => p.id === 'profesional');
  const basico = planes.find(p => p.id === 'basico');

  assert(!!vip && !!profesional && !!basico, 'Los 3 planes requeridos (VIP, Profesional, Básico) existen');

  // Test 2: Invariante $0 Costo Inicial
  console.log('\n--- 2. Invariante de Modelo Success-Fee ($0 Inicial) ---');
  assert(vip!.costoInicial === 0, 'Plan VIP tiene costo inicial $0 USD');
  assert(profesional!.costoInicial === 0, 'Plan Profesional tiene costo inicial $0 USD');
  assert(basico!.costoInicial === 0, 'Plan Básico tiene costo inicial $0 USD');

  // Test 3: Porcentajes de Comisión de Éxito Oficiales
  console.log('\n--- 3. Verificación de Porcentajes de Éxito Solicitados ---');
  assert(vip!.porcentajePrimerMes === 25, 'Plan VIP tiene comisión del 25% del primer mes');
  assert(profesional!.porcentajePrimerMes === 15, 'Plan Profesional tiene comisión del 15% del primer mes');
  assert(basico!.porcentajePrimerMes === 10, 'Plan Básico tiene comisión del 10% del primer mes');

  // Test 4: Jerarquía de Prioridad en Búsqueda y Radar
  console.log('\n--- 4. Jerarquía de Prioridad en Radar y Bolsa ---');
  assert(vip!.prioridadMultiplicador > profesional!.prioridadMultiplicador, 'VIP tiene mayor prioridad que Profesional');
  assert(profesional!.prioridadMultiplicador > basico!.prioridadMultiplicador, 'Profesional tiene mayor prioridad que Básico');
  assert(vip!.prioridadMultiplicador === 5.0, 'Multiplicador VIP es 5.0x');

  // Test 5: Cálculo Matemático de Comisión del Primer Mes
  console.log('\n--- 5. Simulación de Liquidación de Honorarios de Intermediación ---');
  // Caso A: Ingeniero Residente gana $1,800/mes en Plan VIP
  const calculoVip = TalentoPlanesService.calcularComisionPrimerMes(1800, 'vip');
  assert(calculoVip.comisionSara === 450, `Comisión VIP ($1,800 * 25% = $450) calculada correctamente: $${calculoVip.comisionSara}`);
  assert(calculoVip.netoProfesional === 1350, `Neto del Profesional VIP ($1,800 - $450 = $1,350): $${calculoVip.netoProfesional}`);

  // Caso B: Maestro Mayor gana $1,600/mes en Plan Profesional
  const calculoProf = TalentoPlanesService.calcularComisionPrimerMes(1600, 'profesional');
  assert(calculoProf.comisionSara === 240, `Comisión Profesional ($1,600 * 15% = $240) calculada correctamente: $${calculoProf.comisionSara}`);
  assert(calculoProf.netoProfesional === 1360, `Neto Profesional ($1,600 - $240 = $1,360): $${calculoProf.netoProfesional}`);

  // Caso C: Albañil / Fierrero gana $950/mes en Plan Básico
  const calculoBasico = TalentoPlanesService.calcularComisionPrimerMes(950, 'basico');
  assert(calculoBasico.comisionSara === 95, `Comisión Básico ($950 * 10% = $95) calculada correctamente: $${calculoBasico.comisionSara}`);
  assert(calculoBasico.netoProfesional === 855, `Neto Profesional Básico ($950 - $95 = $855): $${calculoBasico.netoProfesional}`);

  // Test 6: Invariantes Normativos del Trabajo (SBU 2026 $482)
  console.log('\n--- 6. Protección frente a Salarios sobre SBU 2026 ($482) ---');
  const calculoSBU = TalentoPlanesService.calcularComisionPrimerMes(482, 'basico');
  assert(calculoSBU.comisionSara === 48.2, `Comisión Básico sobre SBU 2026 ($482 * 10% = $48.20): $${calculoSBU.comisionSara}`);
  assert(calculoSBU.netoProfesional === 433.8, `Neto sobre SBU ($482 - $48.20 = $433.80): $${calculoSBU.netoProfesional}`);

  // Test 7: Modificación y Actualización de Planes
  console.log('\n--- 7. Operaciones de Actualización de Planes ---');
  const planesModificados = [...planes];
  planesModificados[0] = { ...planesModificados[0], nombre: 'VIP Platinum Constructor' };
  TalentoPlanesService.savePlanes(planesModificados);

  // Reset a valores por defecto para dejar el ambiente limpio
  TalentoPlanesService.resetToDefault();
  const planesReset = TalentoPlanesService.getPlanes();
  assert(planesReset[0].nombre === 'Plan VIP Obra & Fábrica', 'Planes restaurados a valores por defecto');

  console.log('\n========================================================================');
  console.log(`🎉 RESULTADO FINAL: ${passedTests}/${totalTests} pruebas pasaron exitosamente.`);
  console.log('========================================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ ERROR DURANTE LA EJECUCIÓN DE PRUEBAS:', err);
  process.exit(1);
});
