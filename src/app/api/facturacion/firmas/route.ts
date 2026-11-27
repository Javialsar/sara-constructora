import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SaraBankReconciliationService } from '@/lib/services/bankReconciliationService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function verifyHmacSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const provided = signatureHeader.replace(/^sha256=/i, '').trim();
  if (expected.length !== provided.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(provided, 'utf8'));
}

async function resolveAuthenticatedUser(req: NextRequest) {
  // 1. Verificar JWT Bearer si fue enviado por cliente API
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token && token !== 'null' && token !== 'undefined') {
      const admin = createAdminClient();
      const { data, error } = await admin.auth.getUser(token);
      if (data?.user && !error) {
        return data.user;
      }
    }
    return null;
  }

  // 2. Verificar sesión autenticada mediante supabase.auth.getUser() (cookies HttpOnly)
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

function isUserAdmin(user: { app_metadata?: Record<string, unknown> }): boolean {
  const role = String(user.app_metadata?.role || 'cliente');
  return Boolean(
    user.app_metadata?.es_admin === true ||
    user.app_metadata?.sara_master === true ||
    role === 'admin' ||
    role === 'superadmin'
  );
}

export async function GET(req: NextRequest) {
  try {
    const user = await resolveAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado: Se requiere sesión activa válida.' },
        { status: 401 }
      );
    }

    const isAdmin = isUserAdmin(user);
    const supabaseAdmin = createAdminClient();

    let query = supabaseAdmin.from('sri_solicitudes_firmas').select('*');
    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    const { data: dbSolicitudes, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.warn('Error al consultar sri_solicitudes_firmas:', error.message);
      return NextResponse.json({ success: false, error: 'Error consultando solicitudes de firma.' }, { status: 500 });
    }

    const solicitudes = (dbSolicitudes || []).map((row: Record<string, unknown>) => {
      const refStr = String(row.transaccion_pago_ref || '');
      let metodoPago: 'TRANSFERENCIA' | 'TARJETA_STRIPE' | 'DEUNA' = 'TRANSFERENCIA';
      if (refStr.toUpperCase().includes('DEUNA')) {
        metodoPago = 'DEUNA';
      } else if (refStr.toUpperCase().includes('STRIPE') || refStr.toUpperCase().includes('TARJETA')) {
        metodoPago = 'TARJETA_STRIPE';
      }

      const numComprobante = refStr.includes(':') ? refStr.split(':')[1]?.trim() : refStr;
      const estadoRaw = String(row.estado_solicitud || 'PENDIENTE_VALIDACION');
      const isAprobado = estadoRaw !== 'PENDIENTE_VALIDACION' && estadoRaw !== 'PAGO_PENDIENTE';
      const estadoTramite = estadoRaw === 'PAGO_PENDIENTE' ? 'PENDIENTE_VALIDACION' : estadoRaw;

      const createdAt = row.created_at ? String(row.created_at) : new Date().toISOString();
      const updatedAt = row.updated_at ? String(row.updated_at) : createdAt;
      const fechaSol = new Date(createdAt).toISOString().split('T')[0];
      const isActivo = estadoTramite === 'EMITIDO_ACTIVO';
      const fechaEmision = isActivo ? new Date(updatedAt).toISOString().split('T')[0] : undefined;

      let fechaCaducidad: string | undefined;
      if (isActivo) {
        const d = new Date(updatedAt);
        d.setFullYear(d.getFullYear() + Number(row.vigencia_anios || 1));
        fechaCaducidad = d.toISOString().split('T')[0];
      }

      const vigenciaAnios = Number(row.vigencia_anios || 1);
      const tipoPersona = (row.tipo_persona || 'NATURAL') as 'NATURAL' | 'JURIDICA';

      return {
        id: row.id,
        cedula_ruc: row.identificacion,
        nombres: row.nombres,
        tipo_persona: tipoPersona,
        email: row.correo,
        telefono: row.telefono,
        plan_nombre:
          vigenciaAnios === 1
            ? 'Firma P. Natural (1 Año)'
            : tipoPersona === 'JURIDICA'
            ? 'Firma Representante Legal (2 Años)'
            : `Firma P. Natural (${vigenciaAnios} Años)`,
        vigencia_anios: vigenciaAnios,
        precio_usd: Number(row.monto_cobrado_usd || 18.0),
        metodo_pago: metodoPago,
        numero_comprobante: numComprobante || 'PENDIENTE',
        pago_validado: isAprobado,
        estado_tramite: estadoTramite,
        fecha_solicitud: fechaSol,
        fecha_emision: fechaEmision,
        fecha_caducidad: fechaCaducidad,
        archivo_p12_disponible: isActivo,
        documento_cedula_url: row.documento_cedula_url,
        video_selfie_url: row.video_selfie_url,
      };
    });

    return NextResponse.json({
      success: true,
      solicitudes,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener solicitudes';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await resolveAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado: Se requiere sesión activa válida.' },
        { status: 401 }
      );
    }

    if (!isUserAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado: Se requieren privilegios de Administrador para gestionar trámites de firma.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Cuerpo inválido.' }, { status: 400 });
    }

    const { id, accion } = body;

    if (!accion) {
      return NextResponse.json({ success: false, error: 'accion es obligatoria' }, { status: 400 });
    }

    if (accion === 'AUTO_VALIDAR_IA_MASIVO') {
      const resAuto = await SaraBankReconciliationService.autoValidarPendientes();
      return NextResponse.json({
        success: true,
        accion: 'AUTO_VALIDAR_IA_MASIVO',
        totalAprobadas: resAuto.totalAprobadas,
        detalles: resAuto.detalles,
        mensaje: `Agente Autónomo SARA-PAGOS validó ${resAuto.totalAprobadas} solicitudes pendientes sin intervención humana.`,
      });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'id es obligatorio para esta acción' }, { status: 400 });
    }

    let nuevoEstado = 'EN_TRAMITE_ARCOTEL';
    if (accion === 'VALIDAR_PAGO') {
      nuevoEstado = 'EN_TRAMITE_ARCOTEL';
    } else if (accion === 'EMITIR_P12') {
      nuevoEstado = 'EMITIDO_ACTIVO';
    } else if (accion === 'SUSPENDER') {
      nuevoEstado = 'SUSPENDIDO';
    } else if (accion === 'REACTIVAR') {
      nuevoEstado = 'EMITIDO_ACTIVO';
    }

    const supabaseAdmin = createAdminClient();
    const { data: updated, error } = await supabaseAdmin
      .from('sri_solicitudes_firmas')
      .update({
        estado_solicitud: nuevoEstado,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id,
      estado_solicitud: nuevoEstado,
      updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar firma';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * Webhook firmado con HMAC-SHA256 para notificaciones de entidad certificadora (ARCOTEL / SRI)
 */
export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.SRI_FIRMAS_WEBHOOK_SECRET || process.env.KUSHKI_PRIVATE_MERCHANT_ID;
    if (!webhookSecret) {
      return NextResponse.json(
        { success: false, error: 'Secreto HMAC de webhooks no configurado en servidor.' },
        { status: 503 }
      );
    }

    const rawBody = await req.text();
    const signature = req.headers.get('x-sara-signature') || req.headers.get('x-webhook-signature');

    if (!verifyHmacSignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json(
        { success: false, error: 'Firma HMAC inválida o ausente.' },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);
    const solicitudId = String(event?.solicitudId || '');
    const estado = String(event?.estado || '').toUpperCase();

    if (!solicitudId || !['EN_TRAMITE_ARCOTEL', 'EMITIDO_ACTIVO', 'SUSPENDIDO'].includes(estado)) {
      return NextResponse.json({ success: false, error: 'Payload de webhook inválido.' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
      .from('sri_solicitudes_firmas')
      .update({
        estado_solicitud: estado,
        updated_at: new Date().toISOString(),
      })
      .eq('id', solicitudId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, solicitudId, estado });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error procesando webhook de firmas';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
