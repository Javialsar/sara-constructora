import { NextRequest, NextResponse } from 'next/server';
import { SriEmissionService, FacturaEmisionInput } from '@/lib/services/sriEmissionService';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { requireServerAuth } from '@/lib/auth/serverAuthGuard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Verificación obligatoria Zero-Trust de sesión autenticada
    const { user, isAdmin, role } = await requireServerAuth(req);

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Cuerpo de petición inválido' }, { status: 400 });
    }

    const emisor = body.emisor;
    const comprador = body.comprador;
    const items = body.items;

    if (!emisor || !emisor.ruc || emisor.ruc.length !== 13) {
      return NextResponse.json(
        { success: false, error: 'El RUC del emisor es inválido o no tiene 13 dígitos.' },
        { status: 400 }
      );
    }

    // 1.1 Validación Estricta de Propiedad de Tenant / RUC Emisor (Anti-Impersonation):
    // A menos que sea Master Admin, el usuario autenticado debe ser el propietario del RUC emisor registrado
    if (!isAdmin) {
      const adminDb = createAdminClient();
      const { data: tenantCheck } = await adminDb
        .from('sri_tenants')
        .select('id, user_id, ruc, activo')
        .eq('ruc', emisor.ruc.trim())
        .maybeSingle();

      if (tenantCheck && tenantCheck.user_id && tenantCheck.user_id !== user.id) {
        console.warn(`[AUDIT SECURITY ALERT] Intento de emisión con RUC ajeno: Usuario ${user.id} intentó emitir con RUC ${emisor.ruc} perteneciente a ${tenantCheck.user_id}`);
        return NextResponse.json(
          { success: false, error: 'Acceso denegado: No está autorizado para emitir comprobantes a nombre de este RUC emisor.' },
          { status: 403 }
        );
      }
    }

    if (!comprador || !comprador.identificacion || !comprador.razonSocial) {
      return NextResponse.json(
        { success: false, error: 'Los datos del comprador (identificación y razón social) son requeridos.' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Debe incluir al menos un ítem o servicio en la factura.' },
        { status: 400 }
      );
    }

    const establecimiento = emisor.establecimiento || '001';
    const puntoEmision = emisor.puntoEmision || '001';

    // 2. Determinación Correlativa y Estricta del Secuencial SRI (9 dígitos)
    let secuencial = body.secuencial;
    if (secuencial && /^\d{9}$/.test(String(secuencial).trim())) {
      secuencial = String(secuencial).trim();
    } else {
      // Consultar último secuencial emitido para este emisor
      try {
        const adminDb = createAdminClient();
        const { data: ultimos } = await adminDb
          .from('comprobantes_electronicos_sri')
          .select('numero_comprobante')
          .eq('ruc_emisor', emisor.ruc.trim())
          .order('fecha_emision', { ascending: false })
          .limit(1);

        if (ultimos && ultimos.length > 0 && ultimos[0].numero_comprobante) {
          const partes = ultimos[0].numero_comprobante.split('-');
          const ultimoSec = parseInt(partes[2] || '0', 10);
          secuencial = String(ultimoSec + 1).padStart(9, '0');
        } else {
          secuencial = '000000001';
        }
      } catch {
        secuencial = '000000001';
      }
    }

    const payload: FacturaEmisionInput = {
      emisor: {
        ruc: emisor.ruc.trim(),
        razonSocial: emisor.razonSocial.trim(),
        nombreComercial: emisor.nombreComercial?.trim() || emisor.razonSocial.trim(),
        dirMatriz: emisor.dirMatriz || emisor.direccion || 'Ecuador',
        dirEstablecimiento: emisor.dirEstablecimiento || emisor.dirMatriz || 'Ecuador',
        establecimiento,
        puntoEmision,
        obligadoContabilidad: emisor.obligadoContabilidad || 'NO',
        regimen: emisor.regimen || 'Régimen RIMPE - Negocio Emprendedor',
        ambiente: emisor.ambiente === '1' ? '1' : '2' // 2: Producción por defecto
      },
      comprador: {
        tipoIdentificacion: comprador.tipoIdentificacion || (comprador.identificacion.length === 13 ? '04' : '05'),
        identificacion: comprador.identificacion.trim(),
        razonSocial: comprador.razonSocial.trim(),
        direccion: comprador.direccion?.trim() || 'Ecuador',
        email: comprador.email?.trim() || 'facturacion@gruposara.com',
        telefono: comprador.telefono?.trim() || '0999999999'
      },
      secuencial,
      fechaEmision: body.fechaEmision ? new Date(body.fechaEmision) : new Date(),
      items: items.map(item => ({
        codigo: item.codigo || 'ITM-01',
        descripcion: item.descripcion || 'Servicio / Bien',
        cantidad: Number(item.cantidad) || 1,
        precioUnitario: Number(item.precioUnitario) || 0,
        descuento: Number(item.descuento) || 0,
        ivaTarifa: item.ivaTarifa === 5 ? 5 : item.ivaTarifa === 0 ? 0 : 15
      })),
      formaPago: body.formaPago || '20'
    };

    // Procesamiento inmediato en línea (Cumplimiento Art. 314 Código Tributario)
    const emisionResult = await SriEmissionService.procesarEmisionInmediata(payload);

    // Intentar persistir en Supabase
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.from('comprobantes_electronicos_sri').insert({
        clave_acceso: emisionResult.claveAcceso,
        numero_comprobante: emisionResult.numeroComprobante,
        ruc_emisor: payload.emisor.ruc,
        razon_social_emisor: payload.emisor.razonSocial,
        identificacion_comprador: payload.comprador.identificacion,
        razon_social_comprador: payload.comprador.razonSocial,
        fecha_emision: new Date().toISOString(),
        total: emisionResult.totalFactura,
        estado: emisionResult.estado,
        ambiente: emisionResult.ambiente,
        xml_autorizado: emisionResult.xmlAutorizado,
        emitido_por_user_id: user.id
      });
    } catch (dbErr) {
      console.warn('Aviso persistencia Supabase comprobante:', dbErr);
    }

    return NextResponse.json({
      success: true,
      mensaje: '¡Factura procesada y AUTORIZADA inmediatamente por el SRI!',
      comprobante: emisionResult
    });
  } catch (error: any) {
    console.error('Error al emitir factura SRI:', error);
    const status = error.message?.includes('No autenticado') ? 401 : error.message?.includes('Acceso denegado') ? 403 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Error en la transmisión inmediata al SRI.' },
      { status }
    );
  }
}
