/**
 * TEST SUITE: SARA Talento Humano - Sistema de Planes de Éxito y Colocación Laboral ($0 Inicial)
 * Valida los modelos, cálculos matemáticos de comisión por colocación, invariantes de negocio,
 * persistencia y el catálogo oficial de las 24 provincias y todos los cantones del Ecuador.
 */

import { 
  TalentoPlanesService, 
  PLANES_TALENTO_DEFAULT, 
  TalentoPlan 
} from '../src/lib/services/talentoPlanesService';

import { 
  PROVINCIAS_CANTONES_ECUADOR, 
  LISTA_PROVINCIAS_ECUADOR, 
  getCantonesPorProvincia 
} from '../src/lib/constants/ecuadorGeo';

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
  console.log('🧪 SARA-TALENTOHUMANO: PRUEBAS AUTOMATIZADAS DE PLANES Y COBERTURA ECUADOR');
  console.log('========================================================================\n');

  // Test 1: Catálogo de Provincias del Ecuador
  console.log('--- 1. Validación de Cobertura Geográfica Nacional (24 Provincias) ---');
  assert(LISTA_PROVINCIAS_ECUADOR.length === 24, `Están presentes las 24 provincias del Ecuador (encontradas: ${LISTA_PROVINCIAS_ECUADOR.length})`);
  
  const provinciasEsperadas = [
    'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro',
    'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja', 'Los Ríos',
    'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza', 'Pichincha',
    'Santa Elena', 'Santo Domingo', 'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe'
  ];

  for (const prov of provinciasEsperadas) {
    const cantones = getCantonesPorProvincia(prov);
    assert(cantones.length > 0, `Provincia '${prov}' contiene cantones válidos (${cantones.length} cantones)`);
  }

  // Test 2: Validación de Cantones Específicos
  console.log('\n--- 2. Verificación de Cantones en Provincias Clave ---');
  const cantonesPichincha = getCantonesPorProvincia('Pichincha');
  assert(cantonesPichincha.some(c => c.includes('La Carolina')), 'Pichincha incluye sector La Carolina');
  assert(cantonesPichincha.some(c => c.includes('Sangolquí')), 'Pichincha incluye Rumiñahui (Sangolquí)');

  const cantonesGuayas = getCantonesPorProvincia('Guayas');
  assert(cantonesGuayas.some(c => c.includes('Samborondón')), 'Guayas incluye Samborondón');
  assert(cantonesGuayas.some(c => c.includes('Daule')), 'Guayas incluye Daule');

  const cantonesLoja = getCantonesPorProvincia('Loja');
  assert(cantonesLoja.some(c => c.includes('Catamayo')), 'Loja incluye Catamayo');
  assert(cantonesLoja.some(c => c.includes('Cariamanga')), 'Loja incluye Calvas (Cariamanga)');

  // Test 3: Planes por defecto
  console.log('\n--- 3. Validación de Planes Iniciales ---');
  const planes = TalentoPlanesService.getPlanes();
  assert(planes.length >= 3, 'Existen al menos 3 planes de colocación configurados');
  
  const vip = planes.find(p => p.id === 'vip');
  const profesional = planes.find(p => p.id === 'profesional');
  const basico = planes.find(p => p.id === 'basico');

  assert(!!vip && !!profesional && !!basico, 'Los 3 planes requeridos (VIP, Profesional, Básico) existen');

  // Test 4: Invariante $0 Costo Inicial
  console.log('\n--- 4. Invariante de Modelo Success-Fee ($0 Inicial) ---');
  assert(vip!.costoInicial === 0, 'Plan VIP tiene costo inicial $0 USD');
  assert(profesional!.costoInicial === 0, 'Plan Profesional tiene costo inicial $0 USD');
  assert(basico!.costoInicial === 0, 'Plan Básico tiene costo inicial $0 USD');

  // Test 5: Porcentajes de Comisión de Éxito Oficiales
  console.log('\n--- 5. Verificación de Porcentajes de Éxito Solicitados ---');
  assert(vip!.porcentajePrimerMes === 25, 'Plan VIP tiene comisión del 25% del primer mes');
  assert(profesional!.porcentajePrimerMes === 15, 'Plan Profesional tiene comisión del 15% del primer mes');
  assert(basico!.porcentajePrimerMes === 10, 'Plan Básico tiene comisión del 10% del primer mes');

  // Test 6: Jerarquía de Prioridad en Búsqueda y Radar
  console.log('\n--- 6. Jerarquía de Prioridad en Radar y Bolsa ---');
  assert(vip!.prioridadMultiplicador > profesional!.prioridadMultiplicador, 'VIP tiene mayor prioridad que Profesional');
  assert(profesional!.prioridadMultiplicador > basico!.prioridadMultiplicador, 'Profesional tiene mayor prioridad que Básico');
  assert(vip!.prioridadMultiplicador === 5.0, 'Multiplicador VIP es 5.0x');

  // Test 7: Cálculo Matemático de Comisión del Primer Mes
  console.log('\n--- 7. Simulación de Liquidación de Honorarios de Intermediación ---');
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

  // Test 8: Invariantes Normativos del Trabajo (SBU 2026 $482)
  console.log('\n--- 8. Protección frente a Salarios sobre SBU 2026 ($482) ---');
  const calculoSBU = TalentoPlanesService.calcularComisionPrimerMes(482, 'basico');
  assert(calculoSBU.comisionSara === 48.2, `Comisión Básico sobre SBU 2026 ($482 * 10% = $48.20): $${calculoSBU.comisionSara}`);
  assert(calculoSBU.netoProfesional === 433.8, `Neto sobre SBU ($482 - $48.20 = $433.80): $${calculoSBU.netoProfesional}`);

  // Test 9: Operaciones de Actualización de Planes
  console.log('\n--- 9. Operaciones de Actualización de Planes ---');
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
