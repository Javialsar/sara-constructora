/**
 * MASTER TEST RUNNER • GRUPO SARA
 * Ejecuta la batería completa de 17 suites de pruebas del ecosistema empresarial
 */

const { execSync } = require('child_process');
const path = require('path');

const testSuites = [
  './tests/run-zero-trust-api-guard-tests.ts',
  './tests/run-enterprise-hardening-and-negative-auth-tests.ts',
  './tests/run-ecosystem-security-tests.ts',
  './tests/run-sara-financiero-tests.ts',
  './tests/run-sara-fletes-mandatory-10-tests.ts',
  './tests/run-sara-fletes-audit-suite.ts',
  './tests/run-sara-stays-e2e-audit-tests.ts',
  './tests/run-sara-talento-lifecycle-tests.ts',
  './tests/run-sara-talento-planes-tests.ts',
  './tests/run-sara-marketplace-seller-tests.ts',
  './tests/run-sara-marketplace-agents-squad-tests.ts',
  './tests/run-sara-apu-mandatory-tests.ts',
  './tests/run-sara-compras-lifecycle-tests.ts',
  './tests/run-sara-crm-funnel-tests.ts',
  './tests/run-sara-pagos-monetization-tests.ts',
  './tests/run-apu-requisition-tests.ts',
  './tests/run-module-quotes-tests.ts'
];

console.log('========================================================================');
console.log('🚀 GRUPO SARA: EJECUCIÓN MAESTRA DE TODAS LAS SUITES DE PRUEBAS');
console.log(`Total de suites a ejecutar: ${testSuites.length}`);
console.log('========================================================================\n');

let passed = 0;
let failed = 0;
const results = [];

const cwd = process.cwd();

for (const suite of testSuites) {
  const suiteName = path.basename(suite);
  console.log(`\n▶️  Ejecutando suite: ${suiteName}...`);
  const t0 = Date.now();
  try {
    const cmd = `node -e "require('jiti')(process.cwd(), { alias: { '@': require('path').resolve(process.cwd(), 'src') } })('${suite}')"`;
    execSync(cmd, { stdio: 'inherit', cwd });
    const duration = ((Date.now() - t0) / 1000).toFixed(2);
    results.push({ suite: suiteName, status: 'PASSED', duration: `${duration}s` });
    passed++;
  } catch (error) {
    const duration = ((Date.now() - t0) / 1000).toFixed(2);
    results.push({ suite: suiteName, status: 'FAILED', duration: `${duration}s` });
    failed++;
  }
}

console.log('\n========================================================================');
console.log('📊 RESUMEN EJECUTIVO DE QA Y AUDITORÍA AUTOMATIZADA:');
console.log('========================================================================');
for (const r of results) {
  const icon = r.status === 'PASSED' ? '✅' : '❌';
  console.log(`${icon} [${r.status}] ${r.suite} (${r.duration})`);
}

console.log('------------------------------------------------------------------------');
console.log(`TOTAL: ${passed}/${testSuites.length} SUITES APROBADAS (${failed} FALLIDAS)`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 TODAS LAS SUITES DEL ECOSISTEMA GRUPO SARA PASARON EXITOSAMENTE AL 100%.');
  process.exit(0);
}
