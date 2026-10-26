import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      solicitudId,
      archivoP12Base64,
      nombreArchivo = 'firma_digital.p12',
      claveP12,
      eciProveedor = 'UANATACA',
      vigenciaAnios = 1,
      notificarEmail = true
    } = body;

    if (!solicitudId || !claveP12) {
      return NextResponse.json(
        { error: 'solicitudId y claveP12 son obligatorios para la entrega.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 1. Obtener la solicitud
    const { data: solicitud, error: solError } = await supabaseAdmin
      .from('sri_solicitudes_firmas')
      .select('*')
      .eq('id', solicitudId)
      .single();

    if (solError || !solicitud) {
      return NextResponse.json({ error: 'Solicitud no encontrada en el sistema.' }, { status: 404 });
    }

    // 2. Asegurar o crear el Tenant Emisor en sri_tenants
    let tenantId = solicitud.tenant_id;
    const cleanCedula = (solicitud.identificacion || '').replace(/\D/g, '');
    const cleanRuc = cleanCedula.length === 10 ? `${cleanCedula}001` : cleanCedula;
    const nombreCompleto = solicitud.nombres || 'CLIENTE SARA';

    if (!tenantId) {
      const { data: tenant } = await supabaseAdmin
        .from('sri_tenants')
        .upsert({
          ruc: cleanRuc,
          razon_social: nombreCompleto.toUpperCase(),
          nombre_comercial: nombreCompleto.toUpperCase(),
          direccion_matriz: solicitud.direccion || 'Ecuador',
          correo_notificaciones: solicitud.correo,
          telefono_contacto: solicitud.telefono,
          user_id: solicitud.user_id,
          regimen_tributario: 'GENERAL',
          activo: true
        }, { onConflict: 'ruc' })
        .select('id')
        .single();

      tenantId = tenant?.id || null;
    }

    // 3. Convertir el contenido del archivo .p12 a formato BYTEA (hex)
    let hexContent = '\\x5031325f4345525449464943415445'; // dummy base
    if (archivoP12Base64) {
      const cleanBase64 = archivoP12Base64.replace(/^data:.*?;base64,/, '');
      const buf = Buffer.from(cleanBase64, 'base64');
      hexContent = '\\x' + buf.toString('hex');
    }

    const ahora = new Date();
    const fechaCaducidad = new Date();
    fechaCaducidad.setFullYear(ahora.getFullYear() + Number(vigenciaAnios || solicitud.vigencia_anios || 1));

    // 4. Registrar en la Bóveda Cifrada sri_certificados
    let certificadoId: string | null = null;
    if (tenantId) {
      const { data: cert, error: certError } = await supabaseAdmin
        .from('sri_certificados')
        .insert({
          tenant_id: tenantId,
          archivo_p12_cifrado: hexContent,
          clave_p12_cifrada: claveP12,
          emisor_cert: eciProveedor,
          sujeto_cert: `CN=${nombreCompleto}, ID=${cleanCedula}`,
          valido_desde: ahora.toISOString(),
          valido_hasta: fechaCaducidad.toISOString(),
          activo: true
        })
        .select('id')
        .single();

      if (!certError && cert) {
        certificadoId = cert.id;
      }
    }

    // 5. Actualizar la Solicitud a EMITIDO_ACTIVO
    await supabaseAdmin
      .from('sri_solicitudes_firmas')
      .update({
        estado_solicitud: 'EMITIDO_ACTIVO',
        eci_proveedor: eciProveedor,
        certificado_id: certificadoId,
        tenant_id: tenantId,
        updated_at: ahora.toISOString()
      })
      .eq('id', solicitudId);

    // 6. Generar Enlaces Oficiales de Entrega
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sara-constructora.vercel.app';
    const downloadPageUrl = `${baseUrl}/portal/descargar-firma?id=${solicitudId}&cedula=${cleanCedula}`;
    const directDownloadUrl = `${baseUrl}/api/facturacion/firmas/descargar?id=${solicitudId}`;

    // Mensaje formateado para WhatsApp
    const cleanPhone = (solicitud.telefono || '').replace(/\D/g, '');
    const mensajeWhatsApp = `Hola *${nombreCompleto}*, te saludamos de *GRUPO SARA*. 
🔐 Tu Certificado de *Firma Electrónica (.p12)* emitido bajo la entidad acreditada *${eciProveedor}* ya está listo y aprobado ante ARCOTEL.

📥 *Descarga tu archivo .p12 y consulta instrucciones aquí:*
${downloadPageUrl}

🔑 *Contraseña de tu certificado:* \`${claveP12}\`
📅 *Vigencia:* Hasta el ${fechaCaducidad.toISOString().split('T')[0]}

✅ Además, tu cuenta de *Facturación Electrónica SRI* en Grupo SARA ya tiene cargada tu firma en la bóveda, por lo que puedes emitir facturas inmediatamente desde tu celular o computador sin instalar Java.`;

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensajeWhatsApp)}`;

    // 7. Envío de Correo vía Resend si está disponible
    if (notificarEmail && process.env.RESEND_API_KEY && solicitud.correo) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: 'Grupo SARA Firmas <notificaciones@gruposara.com>',
            to: [solicitud.correo],
            subject: `🔐 Tu Firma Electrónica (.p12) ha sido emitida con éxito - Grupo SARA`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 16px;">
                <h2 style="color: #0f172a;">¡Firma Electrónica Emitida con Éxito!</h2>
                <p>Estimado/a <strong>${nombreCompleto}</strong>,</p>
                <p>Nos complace informarte que tu certificado digital oficial <strong>PKCS#12 (.p12)</strong> ha sido validado y emitido por <strong>${eciProveedor}</strong> conforme a la normativa de ARCOTEL y el SRI.</p>
                
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 12px; margin: 20px 0; border: 1px solid #cbd5e1;">
                  <p style="margin: 0 0 8px 0;"><strong>Titular:</strong> ${nombreCompleto}</p>
                  <p style="margin: 0 0 8px 0;"><strong>Identificación:</strong> ${cleanCedula}</p>
                  <p style="margin: 0 0 8px 0;"><strong>Contraseña del Certificado:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${claveP12}</code></p>
                  <p style="margin: 0;"><strong>Vigencia:</strong> Hasta ${fechaCaducidad.toISOString().split('T')[0]}</p>
                </div>

                <a href="${downloadPageUrl}" style="display: inline-block; background-color: #f59e0b; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px;">
                  Descargar Certificado y Ver Instrucciones
                </a>

                <p style="margin-top: 25px; font-size: 12px; color: #64748b;">
                  Tu firma ya se encuentra además precargada en tu bóveda de <strong>SARA Facturación Electrónica</strong> para emitir facturas y retenciones sin necesidad de instalar controladores.
                </p>
              </div>
            `
          })
        });
      } catch (e) {
        console.warn('Error enviando email Resend:', e);
      }
    }

    return NextResponse.json({
      success: true,
      mensaje: `Firma .p12 entregada exitosamente al cliente ${nombreCompleto}.`,
      certificadoId,
      downloadPageUrl,
      directDownloadUrl,
      whatsappUrl,
      claveP12,
      fechaCaducidad: fechaCaducidad.toISOString().split('T')[0]
    });

  } catch (error: any) {
    console.error('Error en entrega de firma:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno al procesar la entrega de la firma' },
      { status: 500 }
    );
  }
}
