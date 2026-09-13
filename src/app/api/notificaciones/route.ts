import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verificar que quien llama a esta API sea un usuario autenticado (Admin)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { cliente_id, proyecto_nombre, tipo_notificacion, titulo_avance, enlace_portal } = body

    if (!cliente_id || !proyecto_nombre) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    // 1. Obtener los datos del cliente (Teléfono y Email)
    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('nombre, apellido, email, telefono')
      .eq('id', cliente_id)
      .single()

    if (error || !cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    const mensaje = `Hola ${cliente.nombre},\n\nTenemos una actualización en tu proyecto "${proyecto_nombre}".\n\n${tipo_notificacion}: ${titulo_avance}\n\nPuedes revisarlo ingresando a tu portal de clientes:\n${enlace_portal}\n\nSARA Constructora.`

    const resultados: any = {
      cliente: `${cliente.nombre} ${cliente.apellido}`,
      whatsapp: null,
      email: null
    }

    // 2. Simulación / Integración de envío de WhatsApp
    // Aquí puedes conectar servicios como Twilio, Meta Cloud API, o UltraMsg
    if (cliente.telefono) {
      console.log(`[WHATSAPP ENVIADO A ${cliente.telefono}]:\n${mensaje}`)
      // Ejemplo de código real (comentado):
      /*
      await fetch('https://api.ultramsg.com/INSTANCE_ID/messages/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: process.env.WHATSAPP_TOKEN,
          to: cliente.telefono,
          body: mensaje
        })
      })
      */
      resultados.whatsapp = "Enviado correctamente (Simulado)"
    } else {
      resultados.whatsapp = "El cliente no tiene teléfono registrado"
    }

    // 3. Simulación / Integración de envío de Email
    // Aquí puedes usar Resend (Next.js estándar), SendGrid o Nodemailer
    if (cliente.email) {
      console.log(`[EMAIL ENVIADO A ${cliente.email}]:\nAsunto: Actualización de Proyecto - SARA Constructora\nCuerpo:\n${mensaje}`)
      // Ejemplo de código real usando Resend:
      /*
      import { Resend } from 'resend';
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'notificaciones@sara-constructora.com',
        to: cliente.email,
        subject: `Actualización de Obra: ${proyecto_nombre}`,
        text: mensaje
      });
      */
      resultados.email = "Enviado correctamente (Simulado)"
    } else {
      resultados.email = "El cliente no tiene email registrado"
    }

    return NextResponse.json({ 
      success: true, 
      message: "Notificaciones procesadas", 
      resultados 
    })

  } catch (error: any) {
    console.error("Error en notificaciones:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
