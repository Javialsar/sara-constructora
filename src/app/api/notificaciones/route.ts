import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"

// La instancia de Resend se crea dentro de la función para evitar errores en el build de Vercel

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

    const resultados: any = {
      cliente: `${cliente.nombre} ${cliente.apellido}`,
      whatsapp: null,
      email: null
    }

    // 2. Notificación Email Real (vía Resend)
    if (cliente.email) {
      // Instanciamos aquí para que lea la variable de entorno correctamente
      const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy')
      const escapeHtml = (val: unknown) =>
        String(val ?? '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      const safeClienteNombre = escapeHtml(cliente.nombre);
      const safeProyectoNombre = escapeHtml(proyecto_nombre);
      const safeTipoNotificacion = escapeHtml(tipo_notificacion);
      const safeTituloAvance = escapeHtml(titulo_avance || 'Nuevo archivo disponible');
      const safeEnlacePortal =
        typeof enlace_portal === 'string' && /^https?:\/\//i.test(enlace_portal)
          ? escapeHtml(enlace_portal)
          : 'https://sara-constructora.vercel.app/portal';
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #2F3630; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">SARA Constructora</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">Hola <strong>${safeClienteNombre}</strong>,</p>
            <p style="font-size: 16px; color: #333;">Tenemos una nueva actualización importante en tu proyecto: <strong>${safeProyectoNombre}</strong>.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #8B9D8B; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #555;"><strong>${safeTipoNotificacion}:</strong> ${safeTituloAvance}</p>
            </div>
            
            <p style="font-size: 16px; color: #333;">Puedes revisar los detalles, fotografías y documentos ingresando a tu portal privado:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${safeEnlacePortal}" style="background-color: #8B9D8B; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Acceder al Portal</a>
            </div>
            
            <p style="font-size: 14px; color: #777; border-top: 1px solid #eee; padding-top: 20px;">
              Si tienes dudas, por favor responde a este correo.<br>
              Atentamente, el equipo de SARA Constructora.
            </p>
          </div>
        </div>
      `;

      try {
        const data = await resend.emails.send({
          from: 'SARA Constructora <onboarding@resend.dev>', // Usa onboarding@resend.dev para pruebas gratuitas
          to: cliente.email,
          subject: `Actualización de Obra: ${proyecto_nombre}`,
          html: emailHtml
        });
        
        console.log(`[EMAIL ENVIADO A ${cliente.email}]`, data);
        resultados.email = "Email enviado exitosamente";
      } catch (err: any) {
        console.error("Error enviando email:", err);
        resultados.email = `Error de envío: ${err.message}`;
      }
    } else {
      resultados.email = "El cliente no tiene email registrado";
    }

    // 3. Preparar enlace de WhatsApp para contacto directo
    if (cliente.telefono) {
      const cleanPhone = cliente.telefono.replace(/[^0-9]/g, "");
      const mensajeWA = encodeURIComponent(`Hola ${cliente.nombre}, se ha registrado un nuevo avance en tu proyecto "${proyecto_nombre}": ${titulo_avance || 'Nuevo avance'}. Revisa los detalles en: ${enlace_portal || 'https://sara-constructora.vercel.app/portal'}`);
      resultados.whatsapp = `https://wa.me/${cleanPhone}?text=${mensajeWA}`;
    }

    // 4. Registro inmutable en audit_logs de Supabase
    try {
      await supabase.from('audit_logs').insert([{
        user_id: user.id,
        modulo: 'SARA_CONSTRUCTORA',
        accion: 'NOTIFICAR_CLIENTE',
        entidad: 'clientes',
        entidad_id: cliente_id,
        detalles: {
          cliente_nombre: `${cliente.nombre} ${cliente.apellido}`,
          proyecto: proyecto_nombre,
          tipo: tipo_notificacion,
          titulo: titulo_avance,
          resultados
        },
        ip_address: '127.0.0.1',
        pais: 'EC'
      }]);
    } catch (auditErr) {
      console.error("Error registrando log de notificación:", auditErr);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Notificaciones procesadas y auditadas", 
      resultados 
    })

  } catch (error: any) {
    console.error("Error en notificaciones:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
