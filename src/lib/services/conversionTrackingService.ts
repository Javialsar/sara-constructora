import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

// ============================================================================
// SERVICIO DE TELEMETRÍA Y CONVERSIÓN COMERCIAL - GRUPO SARA
// Arquitectura Ética y Segura (Zero-PII Prohibido, Sin Cookies de Terceros)
// ============================================================================

export type FunnelStage =
  | 'nuevo'
  | 'contactado'
  | 'calificado'
  | 'cotizacion_enviada'
  | 'negociacion'
  | 'ganado'
  | 'perdido'

export type ConversionEventType =
  | 'visita_landing'
  | 'interaccion_calculadora_apu'
  | 'solicitud_cotizacion'
  | 'solicitud_servicio'
  | 'transicion_embudo'
  | 'lead_calificado'
  | 'cotizacion_enviada'
  | 'negociacion_iniciada'
  | 'cierre_ganado'
  | 'cierre_perdido'
  | 'contacto_whatsapp'
  | 'descarga_brochure'

export interface UtmParams {
  source?: string
  medium?: string
  campaign?: string
  term?: string
  content?: string
}

export interface ConversionEventInput {
  eventType: ConversionEventType | string
  funnelStage?: FunnelStage
  trackingCode?: string
  montoEstimado?: number
  moneda?: string
  metadata?: Record<string, unknown>
  utm?: UtmParams
  referrer?: string
  path?: string
  ip?: string // Se convertirá automáticamente a hash criptográfico SHA-256
  userAgent?: string
}

export interface ConversionEventRecord {
  id: string
  eventType: string
  funnelStage?: FunnelStage
  trackingCode?: string
  montoEstimado?: number
  moneda: string
  metadata: Record<string, unknown>
  utm: UtmParams
  referrer?: string
  path?: string
  ipHash?: string
  userAgent?: string
  timestamp: string
  storageSource: 'supabase' | 'memory'
}

export interface FunnelMetrics {
  totalEventos: number
  etapas: Record<FunnelStage, number>
  tasaConversionGanado: number
  tasaPerdida: number
  valorPipelineEstimadoUSD: number
  timestampReporte: string
}

// Búfer en memoria auditada para alta disponibilidad y resiliencia offline/local
const MAX_MEMORY_EVENTS = 1000
const memoryAuditBuffer: ConversionEventRecord[] = []

/**
 * Sanitiza metadatos para evitar almacenamiento accidental de PII prohibido
 * (contraseñas, tokens, tarjetas de crédito, números de cuenta completos).
 */
function sanitizeMetadata(rawMeta?: Record<string, unknown>): Record<string, unknown> {
  if (!rawMeta || typeof rawMeta !== 'object') return {}

  const sanitized: Record<string, unknown> = {}
  const forbiddenKeys = ['password', 'contrasena', 'pin', 'token', 'secret', 'cvv', 'credit_card', 'tarjeta']

  for (const [key, value] of Object.entries(rawMeta)) {
    const lowerKey = key.toLowerCase()
    const isForbidden = forbiddenKeys.some(f => lowerKey.includes(f))

    if (!isForbidden) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = sanitizeMetadata(value as Record<string, unknown>)
      } else {
        sanitized[key] = value
      }
    }
  }

  return sanitized
}

/**
 * Genera un hash criptográfico de la dirección IP para proteger la privacidad del usuario
 * según normativas de protección de datos (cero PII en texto claro).
 */
function hashIp(rawIp?: string): string | undefined {
  if (!rawIp || rawIp.trim().length === 0) return undefined
  try {
    return crypto.createHash('sha256').update(rawIp.trim()).digest('hex').substring(0, 32)
  } catch {
    return undefined
  }
}

/**
 * Registra un evento de telemetría de conversión comercial de forma segura.
 * Intenta almacenar en Supabase; si la tabla no existe o la BD está temporalmente inaccesible,
 * preserva el evento en la memoria auditada con trazabilidad completa.
 */
export async function trackConversionEvent(
  input: ConversionEventInput
): Promise<{ success: boolean; eventId: string; storage: 'supabase' | 'memory'; error?: string }> {
  const eventId = `EVT-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
  const timestamp = new Date().toISOString()
  const ipHash = hashIp(input.ip)
  const cleanMetadata = sanitizeMetadata(input.metadata)

  const eventRecord: ConversionEventRecord = {
    id: eventId,
    eventType: input.eventType,
    funnelStage: input.funnelStage,
    trackingCode: input.trackingCode,
    montoEstimado: input.montoEstimado !== undefined && !isNaN(input.montoEstimado) ? Number(input.montoEstimado) : undefined,
    moneda: input.moneda || 'USD',
    metadata: cleanMetadata,
    utm: input.utm || {},
    referrer: input.referrer,
    path: input.path,
    ipHash,
    userAgent: input.userAgent ? input.userAgent.substring(0, 255) : undefined,
    timestamp,
    storageSource: 'memory',
  }

  // Guardar siempre en memoria auditada para resiliencia inmediata
  memoryAuditBuffer.unshift(eventRecord)
  if (memoryAuditBuffer.length > MAX_MEMORY_EVENTS) {
    memoryAuditBuffer.pop()
  }

  // Intentar persistencia en Supabase
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('eventos_conversion').insert([{
      event_type: input.eventType,
      funnel_stage: input.funnelStage || null,
      tracking_code: input.trackingCode || null,
      monto_estimado: eventRecord.montoEstimado || null,
      moneda: eventRecord.moneda,
      metadata: cleanMetadata,
      utm: input.utm || {},
      referrer: input.referrer || null,
      path: input.path || null,
      ip_hash: ipHash || null,
      created_at: timestamp,
    }])

    if (!error) {
      eventRecord.storageSource = 'supabase'
      return { success: true, eventId, storage: 'supabase' }
    } else {
      console.warn('[CONVERSION-TELEMETRY] Registro persistido en memoria auditada (Supabase:', error.message, ')')
      return { success: true, eventId, storage: 'memory', error: error.message }
    }
  } catch (err: any) {
    console.warn('[CONVERSION-TELEMETRY] Excepción de conexión a BD, preservado en memoria:', err?.message || err)
    return { success: true, eventId, storage: 'memory', error: err?.message || 'Error de conexión' }
  }
}

/**
 * Obtiene los eventos auditados de conversión desde Supabase o el búfer en memoria.
 */
export async function getAuditedConversionEvents(filter?: {
  eventType?: string
  funnelStage?: FunnelStage
  trackingCode?: string
  limit?: number
}): Promise<ConversionEventRecord[]> {
  const limit = filter?.limit || 100

  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('eventos_conversion')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (filter?.eventType) {
      query = query.eq('event_type', filter.eventType)
    }
    if (filter?.funnelStage) {
      query = query.eq('funnel_stage', filter.funnelStage)
    }
    if (filter?.trackingCode) {
      query = query.eq('tracking_code', filter.trackingCode)
    }

    const { data, error } = await query

    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        eventType: d.event_type,
        funnelStage: d.funnel_stage,
        trackingCode: d.tracking_code,
        montoEstimado: d.monto_estimado ? Number(d.monto_estimado) : undefined,
        moneda: d.moneda || 'USD',
        metadata: d.metadata || {},
        utm: d.utm || {},
        referrer: d.referrer,
        path: d.path,
        ipHash: d.ip_hash,
        timestamp: d.created_at,
        storageSource: 'supabase',
      }))
    }
  } catch (err) {
    console.warn('[CONVERSION-TELEMETRY] Lectura fallback a memoria:', err)
  }

  // Fallback a memoria auditada
  let results = [...memoryAuditBuffer]
  if (filter?.eventType) {
    results = results.filter(e => e.eventType === filter.eventType)
  }
  if (filter?.funnelStage) {
    results = results.filter(e => e.funnelStage === filter.funnelStage)
  }
  if (filter?.trackingCode) {
    results = results.filter(e => e.trackingCode === filter.trackingCode)
  }

  return results.slice(0, limit)
}

/**
 * Calcula métricas agregadas del embudo de ventas y telemetría comercial.
 */
export async function getFunnelMetrics(): Promise<FunnelMetrics> {
  const stages: Record<FunnelStage, number> = {
    nuevo: 0,
    contactado: 0,
    calificado: 0,
    cotizacion_enviada: 0,
    negociacion: 0,
    ganado: 0,
    perdido: 0,
  }

  let totalValorEstimado = 0
  let totalCotizaciones = 0

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('cotizaciones').select('estado, presupuesto_estimado')

    if (!error && data) {
      data.forEach((row: any) => {
        totalCotizaciones++
        const st = (row.estado as FunnelStage) || 'nuevo'
        if (st in stages) {
          stages[st]++
        } else if (st === 'pendiente' as any) {
          stages.nuevo++
        } else if (st === 'cotizada' as any) {
          stages.cotizacion_enviada++
        } else if (st === 'aprobada' as any) {
          stages.ganado++
        } else if (st === 'rechazada' as any) {
          stages.perdido++
        }

        if (row.presupuesto_estimado) {
          const num = parseFloat(String(row.presupuesto_estimado).replace(/[^\d.]/g, ''))
          if (!isNaN(num) && num > 0) {
            totalValorEstimado += num
          }
        }
      })
    }
  } catch {
    // Si falla Supabase, computar desde eventos en memoria
    memoryAuditBuffer.forEach(evt => {
      if (evt.funnelStage && evt.funnelStage in stages) {
        stages[evt.funnelStage]++
      }
      if (evt.montoEstimado) {
        totalValorEstimado += evt.montoEstimado
      }
    })
    totalCotizaciones = memoryAuditBuffer.length
  }

  const cerrados = stages.ganado + stages.perdido
  const tasaConversionGanado = cerrados > 0 ? Number(((stages.ganado / cerrados) * 100).toFixed(2)) : 0
  const tasaPerdida = cerrados > 0 ? Number(((stages.perdido / cerrados) * 100).toFixed(2)) : 0

  return {
    totalEventos: totalCotizaciones,
    etapas: stages,
    tasaConversionGanado,
    tasaPerdida,
    valorPipelineEstimadoUSD: totalValorEstimado,
    timestampReporte: new Date().toISOString(),
  }
}

/**
 * Limpia el búfer en memoria (utilizado principalmente para pruebas unitarias).
 */
export function clearAuditedConversionMemory(): void {
  memoryAuditBuffer.length = 0
}
