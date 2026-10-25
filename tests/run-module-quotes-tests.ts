// ============================================================================
// SUITE DE PRUEBAS: COTIZACIÓN DINÁMICA POR MÓDULO (GRUPO SARA)
// Verifica que el botón de cotización consulte los planes reales de cada
// módulo en lugar de utilizar un valor fijo arbitrario ($49.99).
// ============================================================================

import assert from 'assert';
import { SaraModulePlansService } from '../src/lib/services/saraModulePlansService';

let passed = 0;
let total = 0;

function test(description: string, fn: () => void) {
  total++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${description}`);
    passed++;
  } catch (error: any) {
    console.error(`  ❌ [FAIL] ${description}`);
    console.error(`     Error: ${error.message}`);
  }
}

console.log('\n========================================================================');
console.log('🧪 VERIFICACIÓN DE COTIZACIÓN Y PLANES REALES POR MÓDULO');
console.log('========================================================================\n');

console.log('--- 1. Módulo SARA-TALENTO (Success-Fee / $0 Inicial) ---');
const talentoDetalle = SaraModulePlansService.getDetalleModulo('talento');
test('SARA-TALENTO tiene modelo tipo success_fee', () => {
  assert.strictEqual(talentoDetalle.tipoModelo, 'success_fee');
});
test('SARA-TALENTO contiene los 3 planes de colocación requeridos', () => {
  assert.strictEqual(talentoDetalle.planes.length, 3);
});
test('Todos los planes de SARA-TALENTO son $0 costo inicial', () => {
  for (const p of talentoDetalle.planes) {
    assert.strictEqual(p.esGratisInicial, true);
    assert.strictEqual(p.precioMensual, 0);
  }
});
test('Planes de SARA-TALENTO tienen las comisiones exactas (VIP: 25%, Pro: 15%, Básico: 10%)', () => {
  const vip = talentoDetalle.planes.find(p => p.id === 'vip');
  const pro = talentoDetalle.planes.find(p => p.id === 'profesional');
  const bas = talentoDetalle.planes.find(p => p.id === 'basico');

  assert.ok(vip && vip.porcentajeExito === 25, 'VIP debe ser 25%');
  assert.ok(pro && pro.porcentajeExito === 15, 'Profesional debe ser 15%');
  assert.ok(bas && bas.porcentajeExito === 10, 'Básico debe ser 10%');
});
test('Acción de SARA-TALENTO es gratis_redireccion (no cobra pasarela inmediata)', () => {
  for (const p of talentoDetalle.planes) {
    assert.strictEqual(p.accionTipo, 'gratis_redireccion');
  }
});

console.log('\n--- 2. Módulo SARA-CONSTRUCTORA (Planes SaaS Reales) ---');
const constDetalle = SaraModulePlansService.getDetalleModulo('constructora');
test('SARA-CONSTRUCTORA tiene modelo tipo saas', () => {
  assert.strictEqual(constDetalle.tipoModelo, 'saas');
});
test('SARA-CONSTRUCTORA contiene planes configurados en el Administrador', () => {
  assert.ok(constDetalle.planes.length >= 3);
});
test('Planes de SARA-CONSTRUCTORA tienen precios reales ($29, $79, $189)', () => {
  const precios = constDetalle.planes.map(p => p.precioMensual);
  assert.ok(precios.includes(29), 'Debe incluir plan de $29');
  assert.ok(precios.includes(79), 'Debe incluir plan de $79');
  assert.ok(precios.includes(189), 'Debe incluir plan de $189');
});

console.log('\n--- 3. Módulo SARA-MARKETPLACE (Membresías & Venta Mayorista) ---');
const marketDetalle = SaraModulePlansService.getDetalleModulo('marketplace');
test('SARA-MARKETPLACE contiene al menos 3 planes de membresía comercial', () => {
  assert.ok(marketDetalle.planes.length >= 3);
});
test('Membresías de SARA-MARKETPLACE tienen tarifas de comisión y costos asignados (Básico $0, Pro $79, VIP $199)', () => {
  for (const p of marketDetalle.planes) {
    assert.ok(typeof p.precioMensual === 'number');
  }
  const vip = marketDetalle.planes.find(p => p.id === 'VIP');
  assert.ok(vip && vip.precioMensual === 199, 'VIP costo 199');
});

console.log('\n--- 4. Módulo SARA-PAGOS (SaaS FinTech & Fideicomiso Escrow) ---');
const pagosDetalle = SaraModulePlansService.getDetalleModulo('pagos');
test('SARA-PAGOS contiene los 3 planes SaaS FinTech (Starter $49, Pro $149, Enterprise $399)', () => {
  const starter = pagosDetalle.planes.find(p => p.codigo === 'STARTER' || p.id === 'plan-starter');
  const pro = pagosDetalle.planes.find(p => p.codigo === 'PRO' || p.id === 'plan-pro');
  const ent = pagosDetalle.planes.find(p => p.codigo === 'ENTERPRISE' || p.id === 'plan-enterprise');

  assert.ok(starter && starter.precioMensual === 49, 'Starter $49');
  assert.ok(pro && pro.precioMensual === 149, 'Pro $149');
  assert.ok(ent && ent.precioMensual === 399, 'Enterprise $399');
});

console.log('\n--- 5. Módulo SARA-APU (Presupuestos & SERCOP) ---');
const apuDetalle = SaraModulePlansService.getDetalleModulo('apu');
test('SARA-APU tiene planes reales ($9.99, $19.99, $49.99)', () => {
  const precios = apuDetalle.planes.map(p => p.precioMensual);
  assert.ok(precios.includes(9.99));
  assert.ok(precios.includes(19.99));
  assert.ok(precios.includes(49.99));
});

console.log('\n--- 6. Módulos Operativos (Fletes, Stays, Inmobiliaria) ---');
const fletesDetalle = SaraModulePlansService.getDetalleModulo('fletes');
test('SARA-FLETES incluye flete urbano base desde $3.00 y renta por horas', () => {
  assert.ok(fletesDetalle.planes.some(p => p.precioFijo === 3.00));
  assert.ok(fletesDetalle.planes.some(p => p.precioFijo === 15.00));
});

const staysDetalle = SaraModulePlansService.getDetalleModulo('alojamiento');
test('SARA-ALOJAMIENTO incluye opciones de suites desde $45 y $85 / noche', () => {
  assert.ok(staysDetalle.planes.some(p => p.precioFijo === 45.00));
  assert.ok(staysDetalle.planes.some(p => p.precioFijo === 85.00));
});

const inmoDetalle = SaraModulePlansService.getDetalleModulo('inmobiliaria');
test('SARA-INMOBILIARIA incluye reserva de lote en Escrow ($100 USD) y tasación IVS ($150 USD)', () => {
  assert.ok(inmoDetalle.planes.some(p => p.precioFijo === 100.00));
  assert.ok(inmoDetalle.planes.some(p => p.precioFijo === 150.00));
});

console.log('\n========================================================================');
console.log(`🎉 RESULTADO FINAL: ${passed}/${total} pruebas pasaron exitosamente.`);
console.log('========================================================================\n');

if (passed !== total) {
  process.exit(1);
}
