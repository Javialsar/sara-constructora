import { 
  trackConversionEvent, 
  getAuditedConversionEvents, 
  getFunnelMetrics,
  clearAuditedConversionMemory,
  type FunnelStage 
} from '../src/lib/services/conversionTrackingService'
import { FUNNEL_STAGES } from '../src/app/api/admin/cotizaciones/transicion/route'

async function runTests() {
  console.log('--- INICIANDO SUITE DE PRUEBAS: CRM Y EMBUDO DE CONVERSIÓN GRUPO SARA ---')
  clearAuditedConversionMemory()

  // 1. Validar catálogo de etapas del embudo
  console.log('[TEST 1] Verificando etapas oficiales del embudo comercial...')
  const expectedStages: FunnelStage[] = [
    'nuevo',
    'contactado',
    'calificado',
    'cotizacion_enviada',
    'negociacion',
    'ganado',
    'perdido',
  ]
  for (const stage of expectedStages) {
    if (!FUNNEL_STAGES.includes(stage)) {
      throw new Error(`Etapa esperada ${stage} no encontrada en FUNNEL_STAGES`)
    }
  }
  console.log('✓ Todas las 7 etapas oficiales del embudo están correctamente configuradas.')

  // 2. Registro de evento de conversión con sanitización de PII y Hashing de IP
  console.log('\n[TEST 2] Verificando registro de evento con protección Zero-PII...')
  const rawIp = '190.152.204.45'
  const res1 = await trackConversionEvent({
    eventType: 'solicitud_cotizacion',
    funnelStage: 'nuevo',
    trackingCode: 'SARA-COT-TEST-001',
    montoEstimado: 45000,
    ip: rawIp,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    metadata: {
      nombre: 'Empresa Constructora Quito S.A.',
      tipo_proyecto: 'Estructura Metálica',
      password: 'sensible-secreto-que-debe-ser-eliminado', // PII prohibido que debe ser eliminado
      token: 'bearer-fake-token-debe-eliminarse',
    },
    utm: {
      source: 'google',
      medium: 'cpc',
      campaign: 'construccion_uio_2026',
    }
  })

  if (!res1.success) {
    throw new Error('Fallo al registrar evento de conversión')
  }

  const events = await getAuditedConversionEvents({ trackingCode: 'SARA-COT-TEST-001' })
  if (events.length === 0) {
    throw new Error('No se pudo recuperar el evento de telemetría')
  }

  const saved = events[0]
  if (saved.ipHash === rawIp) {
    throw new Error('FALLO DE PRIVACIDAD: La IP no fue hasheada!')
  }
  if (!saved.ipHash || saved.ipHash.length < 10) {
    throw new Error('FALLO DE PRIVACIDAD: ipHash inválido')
  }
  if ('password' in saved.metadata || 'token' in saved.metadata) {
    throw new Error('FALLO DE PRIVACIDAD: Metadatos sensibles no fueron sanitizados!')
  }
  console.log(`✓ Evento registrado (${res1.storage}). Hash IP: ${saved.ipHash}. PII filtrado correctamente.`)

  // 3. Simulación de avance en el embudo hacia ganado
  console.log('\n[TEST 3] Verificando transición de embudo a "ganado"...')
  await trackConversionEvent({
    eventType: 'cierre_ganado',
    funnelStage: 'ganado',
    trackingCode: 'SARA-COT-TEST-001',
    montoEstimado: 45000,
    metadata: { motivo: 'Propuesta técnica adjudicada' }
  })

  // 4. Simulación de cotización perdida con motivo de pérdida
  console.log('\n[TEST 4] Verificando transición de embudo a "perdido" con motivo...')
  await trackConversionEvent({
    eventType: 'cierre_perdido',
    funnelStage: 'perdido',
    trackingCode: 'SARA-COT-TEST-002',
    montoEstimado: 12000,
    metadata: { motivo_perdida: 'Presupuesto del cliente fuera de rango APU' }
  })

  // 5. Cálculo de métricas del embudo
  console.log('\n[TEST 5] Verificando métricas agregadas del embudo...')
  const metrics = await getFunnelMetrics()
  console.log('Métricas computadas:', {
    totalEventos: metrics.totalEventos,
    etapas: metrics.etapas,
    tasaConversionGanado: `${metrics.tasaConversionGanado}%`,
    tasaPerdida: `${metrics.tasaPerdida}%`,
    valorPipelineEstimadoUSD: `$${metrics.valorPipelineEstimadoUSD}`,
  })

  if (metrics.etapas.ganado < 1 || metrics.etapas.perdido < 1) {
    throw new Error('Inconsistencia en conteo de etapas ganada/perdida')
  }

  console.log('\n>>> TODAS LAS PRUEBAS DE LA FASE 2 PASARON EXITOSAMENTE (100% VERIFICADO) <<<')
}

runTests().catch(err => {
  console.error('Error en pruebas de CRM:', err)
  process.exit(1)
})
