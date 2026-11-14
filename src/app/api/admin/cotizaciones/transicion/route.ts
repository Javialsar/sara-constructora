import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { 
  trackConversionEvent, 
  type FunnelStage 
} from '@/lib/services/conversionTrackingService'

export const dynamic = 'force-dynamic'

// Estados oficiales del embudo de ventas de GRUPO SARA
export const FUNNEL_STAGES: readonly FunnelStage[] = [
  'nuevo',
  'contactado',
  'calificado',
  'cotizacion_enviada',
  'negociacion',
  'ganado',
  'perdido',
] as const

const transitionSchema = z.object({
  id: z.string().min(1, 'El identificador de la cotización es obligatorio'),
  nuevoEstado: z.enum([
    'nuevo',
    'contactado',
    'calificado',
    'cotizacion_enviada',
    'negociacion',
    'ganado',
    'perdido',
  ]),
  motivo_perdida: z.string().optional().nullable(),
  notas: z.string().optional().nullable(),
}).refine(data => {
  if (data.nuevoEstado === 'perdido') {
    return !!data.motivo_perdida && data.motivo_perdida.trim().length >= 3
  }
  return true
}, {
  message: 'Para marcar una cotización como "perdido" es obligatorio ingresar un motivo de pérdida de al menos 3 caracteres.',
  path: ['motivo_perdida']
})

import { requireServerAuth } from '@/lib/auth/serverAuthGuard'

/**
 * Autenticación estricta Zero-Trust: verifica sesión o token JWT y roles administrativos.
 */
async function authenticateUser(request: Request) {
  try {
    const auth = await requireServerAuth(request)
    return { 
      authenticated: true, 
      user: auth.user, 
      isAdmin: auth.isAdmin, 
      role: auth.role 
    }
  } catch {
    return { authenticated: false, user: null, isAdmin: false, role: '' }
  }
}

/**
 * GET /api/admin/cotizaciones/transicion
 * Retorna las etapas válidas del embudo y la configuración de transiciones.
 */
export async function GET(request: Request) {
  try {
    const { authenticated } = await authenticateUser(request)
    if (!authenticated) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere inicio de sesión administrativo para consultar el embudo.' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      funnelStages: FUNNEL_STAGES,
      diagram: 'nuevo -> contactado -> calificado -> cotizacion_enviada -> negociacion -> ganado | perdido',
      requirements: {
        perdido: 'Requiere campo motivo_perdida obligatorio',
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error interno al consultar etapas del embudo', details: error?.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/cotizaciones/transicion
 * Transiciona una cotización de etapa dentro del embudo oficial de ventas.
 */
export async function POST(request: Request) {
  try {
    // 1. Verificación de Seguridad Zero-Trust
    const { authenticated, user } = await authenticateUser(request)
    if (!authenticated || !user) {
      return NextResponse.json(
        { error: 'Acceso denegado (Zero-Trust). Debe iniciar sesión con credenciales válidas.' },
        { status: 401 }
      )
    }

    // 2. Validación de Payload
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Cuerpo de petición JSON inválido.' }, { status: 400 })
    }

    const validation = transitionSchema.safeParse(body)
    if (!validation.success) {
      const issue = validation.error.issues[0]
      return NextResponse.json(
        { 
          error: issue?.message || 'Datos de transición inválidos.',
          details: validation.error.flatten() 
        }, 
        { status: 422 }
      )
    }

    const { id, nuevoEstado, motivo_perdida, notas } = validation.data

    // 3. Obtener cotización actual
    const adminSupabase = createAdminClient()
    const { data: cotizacionActual, error: fetchError } = await adminSupabase
      .from('cotizaciones')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchError || !cotizacionActual) {
      return NextResponse.json(
        { error: `No se encontró ninguna cotización con el identificador ${id}.` },
        { status: 404 }
      )
    }

    const estadoAnterior = cotizacionActual.estado

    // 4. Preparar campos a actualizar
    const timestamp = new Date().toISOString()
    const updatePayload: Record<string, any> = {
      estado: nuevoEstado,
      updated_at: timestamp,
    }

    if (nuevoEstado === 'perdido') {
      updatePayload.motivo_perdida = motivo_perdida ? motivo_perdida.trim() : null
    } else if (motivo_perdida === null) {
      updatePayload.motivo_perdida = null
    }

    // Si se enviaron notas del asesor comercial, concatenar al historial de descripción
    if (notas && notas.trim().length > 0) {
      const notaFormateada = `\n[Nota ${new Date().toLocaleDateString('es-EC')} - ${user.email}]: ${notas.trim()}`
      updatePayload.descripcion = (cotizacionActual.descripcion || '') + notaFormateada
    }

    // 5. Ejecutar actualización en Supabase
    let { data: updatedRecord, error: updateError } = await adminSupabase
      .from('cotizaciones')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    // Manejo de compatibilidad en caso de que la columna motivo_perdida o updated_at no existan todavía en BD
    if (updateError && (updateError.message?.includes('column') || updateError.code === '42703')) {
      console.warn('[CRM-FUNNEL] Reintentando actualización omitiendo columnas auxiliares:', updateError.message)
      const fallbackPayload: Record<string, any> = { estado: nuevoEstado }
      if (motivo_perdida) {
        fallbackPayload.descripcion = `${cotizacionActual.descripcion || ''}\n[Motivo Pérdida]: ${motivo_perdida}`
      }
      const retry = await adminSupabase
        .from('cotizaciones')
        .update(fallbackPayload)
        .eq('id', id)
        .select()
        .single()

      updatedRecord = retry.data
      updateError = retry.error
    }

    if (updateError) {
      return NextResponse.json(
        { error: 'Error al actualizar el estado de la cotización en la base de datos.', details: updateError.message },
        { status: 500 }
      )
    }

    // 6. Registro de Telemetría y Conversión Comercial
    const eventType = nuevoEstado === 'ganado' 
      ? 'cierre_ganado' 
      : nuevoEstado === 'perdido' 
        ? 'cierre_perdido' 
        : 'transicion_embudo'

    let montoEstimado: number | undefined
    if (cotizacionActual.presupuesto_estimado) {
      const parsed = parseFloat(String(cotizacionActual.presupuesto_estimado).replace(/[^\d.]/g, ''))
      if (!isNaN(parsed) && parsed > 0) montoEstimado = parsed
    }

    // Extraer tracking code si existe en la descripción
    let trackingCode: string | undefined
    const matchCode = cotizacionActual.descripcion?.match(/\[Código:\s*([^\]]+)\]/)
    if (matchCode && matchCode[1]) {
      trackingCode = matchCode[1].trim()
    }

    await trackConversionEvent({
      eventType,
      funnelStage: nuevoEstado,
      trackingCode,
      montoEstimado,
      metadata: {
        cotizacionId: id,
        estadoAnterior,
        nuevoEstado,
        motivo_perdida: nuevoEstado === 'perdido' ? motivo_perdida : undefined,
        clienteNombre: cotizacionActual.nombre,
        tipoProyecto: cotizacionActual.tipo_proyecto,
        operadorEmail: user.email,
        operadorId: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Cotización actualizada exitosamente al estado "${nuevoEstado}".`,
      data: {
        id,
        estadoAnterior,
        nuevoEstado,
        motivo_perdida: nuevoEstado === 'perdido' ? motivo_perdida : null,
        actualizadoPor: user.email,
        cotizacion: updatedRecord || { id, estado: nuevoEstado },
      }
    })
  } catch (error: any) {
    console.error('[CRM-FUNNEL-ERROR] Error en transición de cotización:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar la transición.', details: error?.message },
      { status: 500 }
    )
  }
}

// Permitir también PATCH para máxima compatibilidad con clientes REST
export const PATCH = POST
