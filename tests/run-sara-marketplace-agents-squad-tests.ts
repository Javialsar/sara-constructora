/**
 * SUITE DE PRUEBAS AGÉNTICAS: ESCUADRÓN ESPECIALIZADO SARA-MARKETPLACE
 * Valida la coreografía de:
 * - SaraSellerOnboardingGuardAgent
 * - SaraCatalogIngestionEngineAgent
 * - SaraMarketplaceEscrowSettlerAgent
 * en el Bus de Eventos y Memoria Compartida de GRUPO SARA.
 */

import { SaraEventBus } from '../src/lib/agents/event-bus';
import { SaraSharedMemory } from '../src/lib/agents/shared-memory';
import { SaraSellerOnboardingGuardAgent } from '../src/lib/agents/workers/saraSellerOnboardingGuard';
import { SaraCatalogIngestionEngineAgent } from '../src/lib/agents/workers/saraCatalogIngestionEngine';
import { SaraMarketplaceEscrowSettlerAgent } from '../src/lib/agents/workers/saraMarketplaceEscrowSettler';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FALLÓ: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✅ PASÓ: ${message}`);
}

async function runSquadTests() {
  console.log('\n================================================================');
  console.log('🤖 SUITE: ESCUADRÓN AGÉNTICO SARA-MARKETPLACE (GRUPO SARA)');
  console.log('================================================================\n');

  const correlationId = `corr-test-mkt-${Date.now()}`;

  // --------------------------------------------------------------------------
  console.log('[AGENTE 1] SARA-SELLER-ONBOARDING-GUARD');
  // --------------------------------------------------------------------------
  let eventoRegistradoRecibido = false;
  SaraEventBus.subscribe('SELLER_EMPRESA_REGISTRADA', async (evt) => {
    if (evt.correlationId === correlationId) {
      eventoRegistradoRecibido = true;
    }
  });

  const resOnboarding = await SaraSellerOnboardingGuardAgent.auditarYRegistrarEmpresa({
    ruc: '0190048291001', // RUC válido Azuay Sociedad Privada Módulo 11
    razonSocial: 'ACEROS DEL AUSTRO INDUSTRIAL S.A.',
    nombreComercial: 'Aceros del Austro',
    email: 'ventas@acerosdelaustro.ec',
    telefono: '+593 7 284 9900',
    ciudad: 'Cuenca',
    direccionMatriz: 'Parque Industrial Cuenca Lote 22',
    plan: 'VIP_FABRICA'
  }, correlationId);

  assert(resOnboarding.verificadoSri === true, 'Auditoría tributaria SRI Módulo 11 aprobada');
  assert(resOnboarding.comisionSaraPct === 1.8, 'Asignación de Take Rate exacto del Plan VIP (1.8%)');
  assert(resOnboarding.apiKey.startsWith('sk_live_'), 'Generación de API Key autorizada');
  assert(eventoRegistradoRecibido, 'Evento SELLER_EMPRESA_REGISTRADA emitido en el Bus de Eventos');

  // --------------------------------------------------------------------------
  console.log('\n[AGENTE 2] SARA-CATALOG-INGESTION-ENGINE');
  // --------------------------------------------------------------------------
  let eventoCatalogoRecibido = false;
  SaraEventBus.subscribe('CATALOGO_MASIVO_INGESTADO', async (evt) => {
    if (evt.correlationId === correlationId) {
      eventoCatalogoRecibido = true;
    }
  });

  const loteInsumos = [
    {
      sku: 'ADV-VAR-10MM',
      nombre: 'Varilla de Acero Estructural 10mm x 12m',
      categoria: 'ACERO',
      unidad: 'quintal (qq)',
      precioSinIva: 43.50,
      tarifaIvaPct: 5,
      stockDisponible: 2000,
      normaInen: 'NTE INEN 2167'
    },
    {
      sku: 'ADV-ALAM-RECO',
      nombre: 'Alambre Recocido Negro Calibre 16',
      categoria: 'ACERO',
      unidad: 'rollo (25kg)',
      precioSinIva: 32.00,
      tarifaIvaPct: 5,
      stockDisponible: 500,
      normaInen: 'NTE INEN 1511'
    }
  ];

  const resIngesta = await SaraCatalogIngestionEngineAgent.procesarIngestaCatalogo(
    resOnboarding.sellerId,
    loteInsumos,
    'EXCEL_XLSX',
    correlationId
  );

  assert(resIngesta.totalProcesados === 2, 'Lote masivo de 2 SKUs normalizado e ingestado');
  assert(resIngesta.erroresDetectados.length === 0, 'Sin errores de validación técnica INEN');
  assert(eventoCatalogoRecibido, 'Evento CATALOGO_MASIVO_INGESTADO emitido y propagado');

  // --------------------------------------------------------------------------
  console.log('\n[AGENTE 3] SARA-MARKETPLACE-ESCROW-SETTLER');
  // --------------------------------------------------------------------------
  let eventoCompraRecibido = false;
  SaraEventBus.subscribe('COMPRA_MARKETPLACE_CONCRETADA', async (evt) => {
    if (evt.correlationId === correlationId) {
      eventoCompraRecibido = true;
    }
  });

  const subtotalUSD = 8700.00;
  const ivaUSD = 435.00; // 5% IVA
  const totalUSD = subtotalUSD + ivaUSD;

  const resEscrow = await SaraMarketplaceEscrowSettlerAgent.constituirCustodiaEscrow({
    ordenCompraFolio: 'OC-2026-MKT-001',
    sellerId: resOnboarding.sellerId,
    clienteRuc: '1792019482001',
    proyectoObra: 'Hospital del Día - Loja',
    subtotalUSD,
    ivaUSD,
    totalUSD
  }, correlationId);

  // Comisión VIP: 1.8% sobre subtotal = 8700 * 0.018 = 156.60
  assert(resEscrow.comisionSaraUSD === 156.60, 'Cálculo de comisión Grupo SARA exacto ($156.60 USD)');
  assert(resEscrow.netoVendedorUSD === +(totalUSD - 156.60).toFixed(2), 'Neto en custodia Escrow exacto para el vendedor');
  assert(resEscrow.estadoCustodia === 'EN_CUSTODIA_ESCROW', 'Fondos blindados en estado EN_CUSTODIA_ESCROW');
  assert(eventoCompraRecibido, 'Evento COMPRA_MARKETPLACE_CONCRETADA emitido');

  // Liberación tras recepción física en bodega
  let eventoLiquidacionRecibido = false;
  SaraEventBus.subscribe('LIQUIDACION_PROVEEDOR_EMITIDA', async (evt) => {
    if (evt.correlationId === correlationId) {
      eventoLiquidacionRecibido = true;
    }
  });

  const resLiquidacion = await SaraMarketplaceEscrowSettlerAgent.liberarLiquidacionProveedor(
    'OC-2026-MKT-001',
    'ACTA-BODEGA-0092',
    correlationId
  );

  assert(resLiquidacion.montoNetoTransferidoUSD === resEscrow.netoVendedorUSD, 'Monto neto transferido coincide con la custodia');
  assert(resLiquidacion.comisionSaraRetenidaUSD === 156.60, 'Comisión SARA retenida formalizada');
  assert(eventoLiquidacionRecibido, 'Evento LIQUIDACION_PROVEEDOR_EMITIDA emitido para dispersión bancaria SARA-PAGOS');

  console.log('\n================================================================');
  console.log('🏁 RESULTADO: 12 PRUEBAS AGÉNTICAS PASADAS / 0 FALLADAS (100% ÉXITO)');
  console.log('================================================================\n');
}

runSquadTests().catch(err => {
  console.error('Fallo en pruebas del escuadrón agéntico:', err);
  process.exit(1);
});
