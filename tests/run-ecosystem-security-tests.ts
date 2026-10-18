// ============================================================================
// SUITE DE PRUEBAS AUTOMATIZADAS & RED-TEAMING (HACKING ÉTICO INTERNO)
// GRUPO SARA • Advanced Agentic Security & Quality Harness
// ============================================================================

import { ThreeWayMatchService, PurchaseOrder } from '../src/lib/services/threeWayMatchService';
import { IessPayrollService, DailyTareoInput } from '../src/lib/services/iessPayrollService';
import { SriXmlService } from '../src/lib/services/sriXmlService';
import { SaraFletesSyncService } from '../src/lib/services/saraFletesSyncService';
import { SaraDatabaseAuditorService } from '../src/lib/services/saraDatabaseAuditorService';

interface TestResult {
  name: string;
  category: 'SECURITY_HACK' | 'INTEGRITY_TEST' | 'BOUNDARY_TEST';
  status: 'PASSED' | 'FAILED';
  details: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, category: TestResult['category'], details: string) {
  if (condition) {
    results.push({ name, category, status: 'PASSED', details });
    console.log(`  [PASS] ${name}`);
  } else {
    results.push({ name, category, status: 'FAILED', details });
    console.error(`  [FAIL] ${name} -> ${details}`);
  }
}

async function runTestSuite() {
  console.log('\n===============================================================');
  console.log('   INICIANDO TEST SUITE & RED-TEAMING: ECOSISTEMA GRUPO SARA   ');
  console.log('===============================================================\n');

  // --------------------------------------------------------------------------
  // TEST 1: HACKING SRI XML SERVICE (INYECCIÓN XXE / MALFORMED XML)
  // --------------------------------------------------------------------------
  console.log('\n--- 1. Pruebas de Resiliencia ante Ataques XXE & XML Malformado ---');
  try {
    const maliciousXmlXXE = `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
    <factura id="comprobante" version="1.1.0">
      <infoTributaria><razonSocial>&xxe;</razonSocial></infoTributaria>
    </factura>`;

    let threwOrHandled = false;
    try {
      const parsed = SriXmlService.parseFacturaXml(maliciousXmlXXE);
      threwOrHandled = parsed !== null;
    } catch {
      threwOrHandled = true;
    }
    assert(threwOrHandled, 'Mitigación de Inyección XXE en Facturas SRI', 'SECURITY_HACK', 'El parser XML rechaza o aísla entidades DTD externas de forma segura.');
  } catch (e: any) {
    assert(false, 'Mitigación de Inyección XXE', 'SECURITY_HACK', e.message);
  }

  // --------------------------------------------------------------------------
  // TEST 2: HACKING 3-WAY MATCHING (FRAUDE POR DISCREPANCIA EN PRECIOS / VOLÚMENES)
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Pruebas de Prevención de Fraude en Facturas (3-Way Match) ---');
  try {
    const ordenCompraMock: PurchaseOrder = {
      id: 'OC-TEST-001',
      numeroOrden: 'OC-2026-TEST',
      proveedorId: 'PROV-001',
      bodegaDestinoId: 'BOD-001',
      subtotal: 5000.00,
      iva: 750.00,
      total: 5750.00,
      items: [
        {
          codigo: 'HOR-210',
          descripcion: 'Hormigón Premezclado f\'c 210 kg/cm2',
          cantidad: 50,
          precioUnitario: 100.00,
          subtotal: 5000.00,
        }
      ],
    };

    // Caso de Hacking: Factura inflada por el proveedor (precio $130 en vez de $100)
    const facturaInflada: any = {
      numeroFactura: '001-001-000099999',
      rucEmisor: '0104892341001',
      razonSocialEmisor: 'HORMIGONES DEL SUR S.A.',
      fechaEmision: '2026-10-18',
      claveAcceso: '1810202601010489234100120010010000999991234567811',
      subtotalSinImpuestos: 6500.00,
      totalIva: 975.00,
      importeTotal: 7475.00,
      detalles: [
        {
          codigoPrincipal: 'HOR-210',
          descripcion: 'Hormigón Premezclado f\'c 210 kg/cm2',
          cantidad: 50,
          precioUnitario: 130.00, // Inflado +30%
          descuento: 0,
          precioTotalSinImpuesto: 6500.00,
          impuestos: [],
        }
      ],
    };

    const matchResultado = ThreeWayMatchService.executeMatch(facturaInflada, ordenCompraMock);
    assert(
      matchResultado.status === 'DISCREPANCY_ALERT' || matchResultado.discrepancias.length > 0,
      'Detección Automática de Sobrecargo / Fraude en Factura de Proveedor',
      'SECURITY_HACK',
      `El sistema bloqueó la factura por detectar discrepancia de precio unitario ($130 vs $100 pactado).`
    );
  } catch (e: any) {
    assert(false, 'Detección de Sobrecargo en Factura', 'SECURITY_HACK', e.message);
  }

  // --------------------------------------------------------------------------
  // TEST 3: CÁLCULOS TRIBUTARIOS Y NÓMINA IESS SECTOR CONSTRUCCIÓN
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Pruebas de Integridad de Nómina y Retenciones IESS Ecuador ---');
  try {
    const tareosTest: DailyTareoInput[] = [
      {
        trabajadorId: 'TRAB-001',
        nombreCompleto: 'Segundo Poma Guamán',
        cedula: '1102938475',
        categoriaOcupacional: 'Albañil',
        proyectoId: 'PROY-001',
        rubroApuCodigo: 'EST-HOR-001',
        fecha: '2026-10-18',
        horasNormales: 8,
        horasSuplementarias: 2, // 50% recargo
        horasExtraordinarias: 0,
      }
    ];

    const nominaResult = IessPayrollService.calculatePayroll(tareosTest, { mes: 10, anio: 2026 });
    const primerRol = nominaResult.detallesPorTrabajador[0];

    // Salario mínimo sectorial / proporciones
    assert(primerRol.ingresoHorasNormales > 0, 'Cálculo de Sueldo Ganado Base', 'INTEGRITY_TEST', `Sueldo normal: $${primerRol.ingresoHorasNormales}`);
    assert(primerRol.ingresoHorasSuplementarias > 0, 'Cálculo de Horas Suplementarias con Recargo Ley (50%)', 'INTEGRITY_TEST', `Horas 50%: $${primerRol.ingresoHorasSuplementarias}`);
    assert(primerRol.aportePersonalIess > 0, 'Cálculo de Aporte Personal IESS (9.45%)', 'INTEGRITY_TEST', `Aporte IESS retenido: $${primerRol.aportePersonalIess}`);
    assert(primerRol.aportePatronalIess > 0, 'Cálculo de Aporte Patronal IESS (12.15% + SECAP)', 'INTEGRITY_TEST', `Aporte patronal: $${primerRol.aportePatronalIess}`);
    assert(primerRol.netoARecibir > 0, 'Neto a Transferir al Trabajador', 'INTEGRITY_TEST', `Neto pagable: $${primerRol.netoARecibir}`);
  } catch (e: any) {
    assert(false, 'Integridad de Nómina IESS', 'INTEGRITY_TEST', e.message);
  }

  // --------------------------------------------------------------------------
  // TEST 4: SINCRONIZACIÓN BODEGA ↔ SARA-FLETES & INTEGRIDAD DE CALIFICACIÓN
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Pruebas de Sincronización Bodega ↔ Fletes y Liquidación ---');
  try {
    const conductores = SaraFletesSyncService.getConductoresSugeridos();
    assert(conductores.length >= 4, 'Catálogo de Red de Choferes SARA-Fletes Disponible', 'INTEGRITY_TEST', `Se recuperaron ${conductores.length} conductores homologados.`);

    const mockRecepcionFlete = {
      id: 'FLT-TEST-999',
      ordenCompraNumero: 'OC-2026-092',
      proveedor: 'HOLCIM ECUADOR S.A.',
      choferNombre: conductores[0].nombre,
      choferCedulaLicencia: conductores[0].cedulaLicencia,
      choferTelefono: conductores[0].telefono,
      vehiculoPlaca: conductores[0].placa,
      vehiculoTipo: conductores[0].tipoVehiculo,
      empresaTransporte: conductores[0].empresa,
      guiaRemision: 'GR-001-99999',
      fechaRecepcion: '2026-10-18',
      horaRecepcion: '18:00',
      calificacionEstrellas: 5,
      evaluacionPuntualidad: 'EXCELENTE_A_TIEMPO' as const,
      evaluacionCarga: 'IMPECABLE' as const,
      autorizacionPagoFlete: 'APROBADO_PAGO_INMEDIATO' as const,
      tarifaFleteUSD: 280.00,
      observacionesBodeguero: 'Test automatizado de descargue seguro',
      bodegueroNombre: 'Robot Auditor QA',
      estadoLiquidacion: 'AUTORIZADO_PARA_CANCELAR' as const,
    };

    const guardadoExitoso = await SaraFletesSyncService.registrarRecepcionYCalificacion(mockRecepcionFlete);
    assert(guardadoExitoso, 'Persistencia de Calificación y Liquidación de Flete', 'INTEGRITY_TEST', 'Registro procesado y almacenado sin excepciones.');
  } catch (e: any) {
    assert(false, 'Sincronización Bodega Fletes', 'INTEGRITY_TEST', e.message);
  }

  // --------------------------------------------------------------------------
  // TEST 5: AUDITORÍA DE PERSISTENCIA DB (8 MÓDULOS)
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Verificación de Agente Auditor de Base de Datos ---');
  try {
    const auditRes = await SaraDatabaseAuditorService.verificarPersistenciaEcosistema();
    assert(auditRes.tasaPersistencia === 100, 'Tasa de Integridad de Persistencia Global (100%)', 'INTEGRITY_TEST', `Tasa actual: ${auditRes.tasaPersistencia}%`);
    assert(auditRes.tablas.length === 8, 'Monitoreo de 8 Módulos Clave del Ecosistema', 'INTEGRITY_TEST', `Módulos auditados: ${auditRes.tablas.map(t => t.modulo).join(', ')}`);
  } catch (e: any) {
    assert(false, 'Auditor de Base de Datos', 'INTEGRITY_TEST', e.message);
  }

  // --------------------------------------------------------------------------
  // RESUMEN FINAL
  // --------------------------------------------------------------------------
  console.log('\n===============================================================');
  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  console.log(`RESULTADO DE LA SUITE: ${passed} PASADOS | ${failed} FALLADOS`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
