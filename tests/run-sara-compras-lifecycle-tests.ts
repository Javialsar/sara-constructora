/**
 * SUITE DE PRUEBAS AUTOMATIZADAS DEL CICLO DE COMPRAS Y CONTROL APU
 * GRUPO SARA - SARA-CONSTRUCTORA
 * 
 * Verifica los 15 pasos del flujo principal, casos negativos y consistencia matemática.
 */

import { ComprasService } from '../src/lib/services/comprasService';

async function runComprasLifecycleTests() {
  console.log('================================================================');
  console.log('🧪 INICIANDO SUITE DE PRUEBAS: MÓDULO DE COMPRAS (GRUPO SARA)');
  console.log('================================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASÓ: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ FALLÓ: ${testName} - ${detail || 'Condición no cumplida'}`);
      failedTests++;
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Validación de RUC Ecuatoriano
  // --------------------------------------------------------------------------
  console.log('[GRUPO 1] Verificación Tributaria SRI de RUCs Ecuatorianos');
  const rucValidoJuridica = ComprasService.validarRucEcuador('1790014389001');
  assert(rucValidoJuridica.valido && rucValidoJuridica.tipo === 'SOCIEDAD_PRIVADA', 'RUC ADELCA válido (Sociedad Privada)');

  const rucInvalidoLongitud = ComprasService.validarRucEcuador('1790014389');
  assert(!rucInvalidoLongitud.valido, 'Rechazo de RUC con menos de 13 dígitos');

  const rucInvalidoProvincia = ComprasService.validarRucEcuador('9990014389001');
  assert(!rucInvalidoProvincia.valido, 'Rechazo de RUC con provincia inexistente (>24)');

  // --------------------------------------------------------------------------
  // TEST 2: Casos Negativos en Creación de Requisiciones
  // --------------------------------------------------------------------------
  console.log('\n[GRUPO 2] Casos Negativos de Validación en Requisiciones');
  try {
    ComprasService.crearRequisicion({
      proyectoId: 'proy-uio-01',
      frenteTrabajo: 'Frente 1',
      solicitanteNombre: 'Tester',
      solicitanteCargo: 'Ingeniero',
      fechaRequeridaObra: '2026-11-01',
      prioridad: 'NORMAL_PROGRAMADA',
      justificacion: 'Test',
      items: []
    });
    assert(false, 'Rechazo de requisición sin partidas');
  } catch (e: any) {
    assert(true, 'Rechazo exitoso de requisición con 0 partidas', e.message);
  }

  try {
    ComprasService.crearRequisicion({
      proyectoId: 'proy-uio-01',
      frenteTrabajo: 'Frente 1',
      solicitanteNombre: 'Tester',
      solicitanteCargo: 'Ingeniero',
      fechaRequeridaObra: '2026-11-01',
      prioridad: 'NORMAL_PROGRAMADA',
      justificacion: 'Test',
      items: [
        {
          codigoInsumo: 'INS-MAT-001',
          descripcion: 'Cemento',
          categoria: 'CEMENTO_HORMIGON',
          unidad: 'saco',
          cantidadRequerida: -10, // Cantidad negativa
          costoUnitarioReferencialApuUSD: 8.50
        }
      ]
    });
    assert(false, 'Rechazo de cantidad negativa');
  } catch (e: any) {
    assert(true, 'Rechazo exitoso de partida con cantidad negativa', e.message);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Flujo Completo End-to-End (15 Pasos)
  // --------------------------------------------------------------------------
  console.log('\n[GRUPO 3] Ejecución del Flujo Principal End-to-End');

  // Paso 1 & 2: Crear Requisición con Desperdicio Normativo NEC-15
  const reqE2E = ComprasService.crearRequisicion({
    proyectoId: 'proy-uio-01',
    frenteTrabajo: 'Pisos 5 y 6 Vigas Principales',
    solicitanteNombre: 'Ing. Santiago Paredes',
    solicitanteCargo: 'Residente Obra',
    fechaRequeridaObra: '2026-11-15',
    prioridad: 'URGENTE_24H',
    justificacion: 'Acero de refuerzo y cemento para fundición programada',
    items: [
      {
        codigoInsumo: 'INS-MAT-012',
        descripcion: 'Varilla Corrugada fy=4200 Ø12mm x 12m',
        categoria: 'ACERO',
        unidad: 'quintal (qq)',
        cantidadRequerida: 100,
        desperdicioNormativoPct: 6.0,
        costoUnitarioReferencialApuUSD: 46.50,
        rubroApuCodigo: 'EST-HARM-004'
      },
      {
        codigoInsumo: 'INS-MAT-001',
        descripcion: 'Cemento Portland Tipo GU',
        categoria: 'CEMENTO_HORMIGON',
        unidad: 'saco',
        cantidadRequerida: 200,
        desperdicioNormativoPct: 4.0,
        costoUnitarioReferencialApuUSD: 8.60,
        rubroApuCodigo: 'EST-HOR-001'
      }
    ]
  });

  assert(reqE2E.estado === 'BORRADOR', 'Paso 3: Requisición guardada inicialmente en BORRADOR');
  assert(reqE2E.items[0].cantidadTotalConDesperdicio === 106.0, 'Cálculo de cantidad con desperdicio NEC-15 (100 + 6%)');
  assert(reqE2E.items[1].cantidadTotalConDesperdicio === 208.0, 'Cálculo de cantidad con desperdicio NEC-15 (200 + 4%)');

  // Paso 4: Enviar a Aprobación
  const reqEnviada = ComprasService.cambiarEstadoRequisicion(reqE2E.id, 'EN_REVISION');
  assert(reqEnviada.estado === 'EN_REVISION', 'Paso 4: Transición exitosa a EN_REVISION');

  // Paso 5: Aprobar por Fiscalizador
  const reqAprobada = ComprasService.cambiarEstadoRequisicion(reqE2E.id, 'APROBADA', {
    aprobador: 'Ing. Carlos Moncayo (Fiscalizador)'
  });
  assert(reqAprobada.estado === 'APROBADA' && !!reqAprobada.fechaAprobacion, 'Paso 5: Aprobación registrada con auditoría de Fiscalizador');

  // Paso 6: Registrar 2 Cotizaciones Competitivas
  const cot1 = ComprasService.registrarCotizacion({
    numeroCotizacion: `COT-E2E-ADELCA-${Date.now()}`,
    requisicionId: reqE2E.id,
    proveedorId: 'prov-adelca-01',
    razonSocial: 'Acería del Ecuador C.A. ADELCA',
    ruc: '1790014389001',
    ciudadDespacho: 'Lasso',
    fechaCotizacion: '2026-10-23',
    diasValidezOferta: 15,
    diasEntregaPrometidos: 2,
    condicionesPago: 'Crédito 30 días',
    subtotalMaterialesUSD: 4600.00,
    costoFleteEstimadoUSD: 150.00,
    ivaTotalUSD: 252.50,
    landedCostTotalUSD: 5002.50,
    items: [
      {
        itemRequisicionId: reqE2E.items[0].id,
        codigoInsumo: 'INS-MAT-012',
        descripcion: 'Varilla Corrugada fy=4200 Ø12mm x 12m',
        unidad: 'quintal (qq)',
        cantidadOfertada: 106.0,
        precioUnitarioBaseUSD: 46.50,
        descuentoPorcentaje: 5.38,
        precioUnitarioNetoUSD: 44.00,
        tarifaIvaPct: 5,
        subtotalNetoUSD: 4664.00,
        ivaUSD: 233.20,
        totalUSD: 4897.20
      }
    ]
  });

  const cot2 = ComprasService.registrarCotizacion({
    numeroCotizacion: `COT-E2E-NOVACERO-${Date.now()}`,
    requisicionId: reqE2E.id,
    proveedorId: 'prov-novacero-03',
    razonSocial: 'Novacero S.A.',
    ruc: '1790157891001',
    ciudadDespacho: 'Quito',
    fechaCotizacion: '2026-10-23',
    diasValidezOferta: 10,
    diasEntregaPrometidos: 4,
    condicionesPago: 'Contado',
    subtotalMaterialesUSD: 4850.00,
    costoFleteEstimadoUSD: 120.00,
    ivaTotalUSD: 260.50,
    landedCostTotalUSD: 5230.50,
    items: [
      {
        itemRequisicionId: reqE2E.items[0].id,
        codigoInsumo: 'INS-MAT-012',
        descripcion: 'Varilla Corrugada fy=4200 Ø12mm x 12m',
        unidad: 'quintal (qq)',
        cantidadOfertada: 106.0,
        precioUnitarioBaseUSD: 46.50,
        descuentoPorcentaje: 1.08,
        precioUnitarioNetoUSD: 46.00,
        tarifaIvaPct: 5,
        subtotalNetoUSD: 4876.00,
        ivaUSD: 243.80,
        totalUSD: 5119.80
      }
    ]
  });

  assert(cot1.landedCostTotalUSD < cot2.landedCostTotalUSD, 'Paso 7: Comparativa de Landed Cost (ADELCA $5002.50 < Novacero $5230.50)');

  // Paso 8: Seleccionar y Adjudicar Oferta de ADELCA
  const cotAdjudicada = ComprasService.adjudicarCotizacion(
    cot1.id,
    'Menor Landed Cost con flete incluido y entrega en 2 días hábiles.'
  );
  assert(cotAdjudicada.esSeleccionada, 'Paso 8: Oferta seleccionada y dictamen registrado');

  // Paso 9 & 10: Emitir Orden de Compra Congelada
  const nuevaOC = ComprasService.emitirOrdenCompraDesdeCotizacion({
    cotizacionId: cot1.id,
    responsableEmision: 'Ing. David Salazar (Jefe de Compras)',
    responsableAprobacion: 'Ing. Carlos Moncayo (Fiscalizador)'
  });

  assert(nuevaOC.estado === 'EMITIDA', 'Paso 10: Orden de Compra emitida oficialmente');
  assert(nuevaOC.items[0].precioUnitarioCongeladoUSD === 44.00, 'Precios unitarios congelados e inalterables ($44.00/qq)');
  assert(nuevaOC.items[0].tarifaIvaPct === 5, 'Aplicación de tarifa IVA 5% en materiales calificados SRI');

  // Paso 11: Registrar Recepción Parcial (60 qq de 106 qq)
  const recParcial = ComprasService.registrarRecepcionMaterial({
    ordenCompraId: nuevaOC.id,
    guiaRemisionNumero: '001-002-00088910',
    responsableBodeguero: 'Manuel Guachamín',
    observaciones: 'Despacho camión 1 de 2.',
    itemsRecepcion: [
      {
        itemOrdenId: nuevaOC.items[0].id,
        cantidadEntregada: 60,
        cantidadAceptadaConforme: 60,
        cantidadDanadaRechazada: 0,
        estadoInspeccion: 'CONFORME'
      }
    ]
  });

  const ocTrasRec1 = ComprasService.getOrdenesCompra().find(o => o.id === nuevaOC.id)!;
  assert(recParcial.tipoRecepcion === 'PARCIAL', 'Paso 11: Detección y registro de Recepción Parcial');
  assert(ocTrasRec1.items[0].cantidadRecibidaConforme === 60, 'Cantidad recibida conforme acumulada = 60');
  assert(ocTrasRec1.items[0].cantidadPendiente === 46, 'Saldo pendiente exacto = 46 qq');
  assert(ocTrasRec1.estado === 'RECIBIDA_PARCIAL', 'Estado de la OC actualizado a RECIBIDA_PARCIAL');

  // Caso Negativo: Intentar recibir más del saldo pendiente (ej: 50 cuando pendiente es 46)
  try {
    ComprasService.registrarRecepcionMaterial({
      ordenCompraId: nuevaOC.id,
      guiaRemisionNumero: '001-002-00088911',
      responsableBodeguero: 'Manuel Guachamín',
      observaciones: 'Sobredespacho no autorizado',
      itemsRecepcion: [
        {
          itemOrdenId: nuevaOC.items[0].id,
          cantidadEntregada: 50,
          cantidadAceptadaConforme: 50, // 50 > 46 pendiente
          cantidadDanadaRechazada: 0,
          estadoInspeccion: 'CONFORME'
        }
      ]
    });
    assert(false, 'Rechazo de sobredespacho no autorizado');
  } catch (e: any) {
    assert(true, 'Bloqueo exitoso de recepción que supera el saldo pendiente (50 > 46)', e.message);
  }

  // Paso 12 & 13: Registrar Recepción Restante (46 qq) y Cierre de Orden
  const recFinal = ComprasService.registrarRecepcionMaterial({
    ordenCompraId: nuevaOC.id,
    guiaRemisionNumero: '001-002-00088912',
    responsableBodeguero: 'Manuel Guachamín',
    observaciones: 'Despacho camión 2 de 2. Entrega completa.',
    itemsRecepcion: [
      {
        itemOrdenId: nuevaOC.items[0].id,
        cantidadEntregada: 46,
        cantidadAceptadaConforme: 46,
        cantidadDanadaRechazada: 0,
        estadoInspeccion: 'CONFORME'
      }
    ]
  });

  const ocCerrada = ComprasService.getOrdenesCompra().find(o => o.id === nuevaOC.id)!;
  assert(recFinal.tipoRecepcion === 'TOTAL', 'Paso 12: Detección y registro de Entrega Completa');
  assert(ocCerrada.items[0].cantidadPendiente === 0, 'Saldo pendiente remanente = 0');
  assert(ocCerrada.estado === 'RECIBIDA_TOTAL', 'Paso 13: Estado de la OC cerrado como RECIBIDA_TOTAL');

  // Paso 14: Trazabilidad Integral de Documentos
  assert(
    ocCerrada.requisicionId === reqE2E.id &&
    ocCerrada.cotizacionSeleccionadaId === cot1.id &&
    ocCerrada.recepcionesIds.length === 2,
    'Paso 14: Trazabilidad íntegra Requisición -> Cotización -> OC -> Recepciones Múltiples'
  );

  // Paso 15: Control de Varianza APU y KPIs
  const varianzas = ComprasService.getVarianzaPresupuestariaApu('proy-uio-01');
  const vAcero = varianzas.find(v => v.codigoInsumo === 'INS-MAT-012');
  assert(
    !!vAcero && vAcero.costoUnitarioRealCompradoUSD < vAcero.costoUnitarioApuTeoricoUSD,
    'Paso 15: Control de Varianza APU refleja ahorro de adquisición ($44.00 comprado vs $46.50 APU)'
  );

  console.log('\n================================================================');
  console.log(`🏁 RESULTADO DE PRUEBAS: ${passedTests} PASADAS, ${failedTests} FALLIDAS`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runComprasLifecycleTests();
