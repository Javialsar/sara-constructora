"use server"

import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { Resend } from 'resend'
import { trackConversionEvent } from '@/lib/services/conversionTrackingService'

export interface SubmitCotizacionResponse {
  success?: boolean
  trackingCode?: string
  message?: string
  error?: string
}

export async function submitCotizacion(formData: FormData): Promise<SubmitCotizacionResponse> {
  // 1. Anti-spam honeypot detection
  const honeypot = formData.get('sara_hp_check') as string
  if (honeypot && honeypot.trim().length > 0) {
    // Bot detectado silenciosamente
    return { error: 'Verificación de seguridad fallida. Por favor intenta de nuevo.' }
  }

  const nombre = (formData.get('nombre') as string || '').trim()
  const email = (formData.get('email') as string || '').trim().toLowerCase()
  const telefono = (formData.get('telefono') as string || '').trim()
  const empresa = (formData.get('empresa') as string || '').trim()
  const tipo_proyecto = (formData.get('tipo_proyecto') as string || '').trim()
  const presupuesto_estimado = (formData.get('presupuesto_estimado') as string || '').trim()
  const descripcion = (formData.get('descripcion') as string || '').trim()

  // 2. Validaciones estrictas de cliente y servidor
  if (!nombre || nombre.length < 3) {
    return { error: 'El nombre completo debe tener al menos 3 caracteres.' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    return { error: 'Por favor ingresa un correo electrónico corporativo o personal válido.' }
  }

  const cleanPhone = telefono.replace(/[^\d+]/g, '')
  if (!cleanPhone || cleanPhone.length < 7) {
    return { error: 'Por favor ingresa un número de teléfono o celular válido.' }
  }

  if (!tipo_proyecto) {
    return { error: 'Por favor selecciona la división o servicio de interés.' }
  }

  if (!descripcion || descripcion.length < 10) {
    return { error: 'Por favor proporciona una descripción técnica de al menos 10 caracteres.' }
  }

  // 3. Generación de Identificador de Seguimiento Único
  const trackingCode = `SARA-COT-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`

  try {
    const supabase = await createSupabaseAdminClient()

    const fullDescription = empresa 
      ? `[Empresa: ${empresa}] [Código: ${trackingCode}] ${descripcion}`
      : `[Código: ${trackingCode}] ${descripcion}`

    // Intentar inserción con el nuevo estado del embudo comercial ('nuevo')
    let insertPayload: Record<string, any> = {
      nombre,
      email,
      telefono: cleanPhone,
      tipo_proyecto,
      descripcion: fullDescription,
      presupuesto_estimado: presupuesto_estimado || null,
      estado: 'nuevo',
    }

    let { error } = await supabase.from('cotizaciones').insert([insertPayload])

    // Compatibilidad retroactiva: si la BD tiene el check constraint heredado ('pendiente', ...)
    if (error && (error.code === '23514' || error.message?.toLowerCase().includes('check constraint') || error.message?.toLowerCase().includes('estado'))) {
      console.warn('[CRM-COTIZACIONES] Reintentando con estado de compatibilidad "pendiente":', error.message)
      insertPayload.estado = 'pendiente'
      const retry = await supabase.from('cotizaciones').insert([insertPayload])
      error = retry.error
    }

    if (error) {
      console.error('Error al insertar cotizacion:', error)
      return { error: 'No se pudo guardar la solicitud en este momento. Por favor contáctanos directamente vía WhatsApp.' }
    }

    // 4. Registro seguro de telemetría de conversión comercial
    let parsedMonto: number | undefined
    if (presupuesto_estimado) {
      const num = parseFloat(presupuesto_estimado.replace(/[^\d.]/g, ''))
      if (!isNaN(num) && num > 0) parsedMonto = num
    }

    try {
      await trackConversionEvent({
        eventType: 'solicitud_cotizacion',
        funnelStage: 'nuevo',
        trackingCode,
        montoEstimado: parsedMonto,
        metadata: {
          nombre,
          empresa: empresa || null,
          tipo_proyecto,
          origen: 'formulario_web_publico',
        },
      })
    } catch (trackErr) {
      console.warn('[CONVERSION-TELEMETRY] Registro no bloqueante fallido:', trackErr)
    }

    // 5. Envío de Notificación Transaccional vía Resend al equipo técnico de GRUPO SARA
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'GRUPO SARA <onboarding@resend.dev>'
        const adminDashboardUrl = process.env.NEXT_PUBLIC_SITE_URL 
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/admin/cotizaciones`
          : 'https://gruposara.com.ec/admin/cotizaciones'

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
            <div style="background-color: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 1px;">GRUPO SARA &mdash; CRM COMERCIAL</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #94a3b8;">Nueva Solicitud de Cotización Ingresada al Embudo</p>
            </div>
            <div style="padding: 24px; color: #334155; line-height: 1.6;">
              <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 12px 16px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
                <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Folio de Seguimiento</span>
                <div style="font-size: 18px; font-weight: bold; color: #0f172a; font-family: monospace;">${trackingCode}</div>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; width: 140px;"><strong>Cliente:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 600;">${nombre}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Empresa:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${empresa || 'Particular'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Correo Electrónico:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Teléfono / WhatsApp:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;"><a href="https://wa.me/${cleanPhone.replace('+', '')}" style="color: #10b981; text-decoration: none; font-weight: 600;">${cleanPhone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>División / Proyecto:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 600;">${tipo_proyecto}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Presupuesto Referencial:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 600;">${presupuesto_estimado || 'Por Definir / Asesoría Requerida'}</td>
                </tr>
              </table>

              <div style="margin-bottom: 24px;">
                <strong style="color: #0f172a; font-size: 13px; text-transform: uppercase;">Requerimiento Técnico:</strong>
                <p style="background-color: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 8px; font-size: 13px; color: #334155;">
                  ${descripcion}
                </p>
              </div>

              <div style="text-align: center; margin-top: 24px;">
                <a href="${adminDashboardUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                  Gestionar en Bandeja de Cotizaciones &rarr;
                </a>
              </div>
            </div>
            <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              Notificación automática generada por GRUPO SARA CRM &bull; Quito, Ecuador &bull; ${new Date().toLocaleDateString('es-EC')}
            </div>
          </div>
        `

        const sendResult = await resend.emails.send({
          from: fromEmail,
          to: ['sara.constructora593@gmail.com'],
          subject: `Nueva Cotización [${trackingCode}]: ${tipo_proyecto} - ${nombre}`,
          html: emailHtml,
        })

        if (sendResult.error) {
          console.warn('[RESEND] Advertencia al enviar correo a sara.constructora593@gmail.com:', sendResult.error)
        } else {
          console.info('[RESEND] Notificación enviada con ID:', sendResult.data?.id)
        }
      } catch (emailErr: any) {
        console.warn('[RESEND] Excepción controlada en servicio de mensajería (no bloqueante):', emailErr?.message || emailErr)
      }
    } else {
      console.info(`[COTIZACION-REGISTRADA] RESEND_API_KEY no detectada en entorno. Evento registrado localmente con folio: ${trackingCode}`)
    }

    return { 
      success: true, 
      trackingCode,
      message: `Solicitud registrada exitosamente con código de seguimiento ${trackingCode}. Un especialista técnico de GRUPO SARA te contactará en menos de 24 horas.`
    }
  } catch (err: any) {
    console.error('submitCotizacion exception:', err)
    return { error: 'Error del servidor al procesar la cotización. Inténtalo nuevamente.' }
  }
}

export async function submitSolicitudServicio(formData: FormData) {
  const honeypot = formData.get('sara_hp_check') as string
  if (honeypot && honeypot.trim().length > 0) {
    return { error: 'Verificación de seguridad fallida.' }
  }

  const nombre = (formData.get('nombre') as string || '').trim()
  const email = (formData.get('email') as string || '').trim().toLowerCase()
  const telefono = (formData.get('telefono') as string || '').trim()
  const tipo_servicio = (formData.get('tipo_servicio') as string || '').trim()
  const mensaje = (formData.get('mensaje') as string || '').trim()

  if (!nombre || !email || !telefono || !tipo_servicio) {
    return { error: 'Todos los campos marcados son obligatorios.' }
  }

  const supabase = await createSupabaseAdminClient()

  const { error } = await supabase.from('solicitudes_servicio').insert([{
    nombre,
    email,
    telefono,
    tipo_servicio,
    mensaje,
    estado: 'nueva',
  }])

  if (error) {
    return { error: 'Error al enviar la solicitud.' }
  }

  return { success: true }
}
