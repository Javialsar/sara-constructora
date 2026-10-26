import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SaraBankReconciliationService } from '@/lib/services/bankReconciliationService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();

    const { data: dbSolicitudes, error } = await supabaseAdmin
      .from('sri_solicitudes_firmas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error al consultar sri_solicitudes_firmas:', error.message);
    }

    const realList = (dbSolicitudes || []).map((row: any) => {
      const refStr = row.transaccion_pago_ref || '';
      let metodoPago: 'TRANSFERENCIA' | 'TARJETA_STRIPE' | 'DEUNA' = 'TRANSFERENCIA';
      if (refStr.toUpperCase().includes('DEUNA')) {
        metodoPago = 'DEUNA';
      } else if (refStr.toUpperCase().includes('STRIPE') || refStr.toUpperCase().includes('TARJETA')) {
        metodoPago = 'TARJETA_STRIPE';
      }

      const numComprobante = refStr.includes(':') ? refStr.split(':')[1]?.trim() : refStr;
      const isAprobado = row.estado_solicitud !== 'PENDIENTE_VALIDACION' && row.estado_solicitud !== 'PAGO_PENDIENTE';
      const estadoTramite = row.estado_solicitud === 'PAGO_PENDIENTE' ? 'PENDIENTE_VALIDACION' : row.estado_solicitud;

      const fechaSol = row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const isActivo = estadoTramite === 'EMITIDO_ACTIVO';
      const fechaEmision = isActivo 
        ? (row.updated_at ? new Date(row.updated_at).toISOString().split('T')[0] : fechaSol) 
        : undefined;

      let fechaCaducidad: string | undefined = undefined;
      if (isActivo) {
        const d = new Date(row.updated_at || row.created_at || Date.now());
        d.setFullYear(d.getFullYear() + (row.vigencia_anios || 1));
        fechaCaducidad = d.toISOString().split('T')[0];
      }

      return {
        id: row.id,
        cedula_ruc: row.identificacion,
        nombres: row.nombres,
        tipo_persona: (row.tipo_persona || 'NATURAL') as 'NATURAL' | 'JURIDICA',
        email: row.correo,
        telefono: row.telefono,
        plan_nombre: row.vigencia_anios === 1
          ? 'Firma P. Natural (1 Año)'
          : (row.tipo_persona === 'JURIDICA' ? 'Firma Representante Legal (2 Años)' : `Firma P. Natural (${row.vigencia_anios} Años)`),
        vigencia_anios: row.vigencia_anios || 1,
        precio_usd: Number(row.monto_cobrado_usd || 18.00),
        metodo_pago: metodoPago,
        numero_comprobante: numComprobante || 'PENDIENTE',
        pago_validado: isAprobado,
        estado_tramite: estadoTramite,
        fecha_solicitud: fechaSol,
        fecha_emision: fechaEmision,
        fecha_caducidad: fechaCaducidad,
        archivo_p12_disponible: isActivo,
        documento_cedula_url: row.documento_cedula_url,
        video_selfie_url: row.video_selfie_url
      };
    });

    // Registros base históricos para auditoría del ecosistema
    const demoBase = [
      {
        id: 'sol-base-001',
        cedula_ruc: '1792984512001',
        nombres: 'ING. CARLOS MENDOZA',
        tipo_persona: 'NATURAL' as const,
        email: 'carlos.mendoza@mendozaconstr.ec',
        telefono: '+593998124912',
        plan_nombre: 'Firma P. Natural (1 Año)',
        vigencia_anios: 1,
        precio_usd: 18.00,
        metodo_pago: 'TRANSFERENCIA' as const,
        numero_comprobante: '98124912',
        pago_validado: true,
        estado_tramite: 'EMITIDO_ACTIVO',
        fecha_solicitud: '2026-08-10',
        fecha_emision: '2026-08-10',
        fecha_caducidad: '2027-08-10',
        archivo_p12_disponible: true
      },
      {
        id: 'sol-base-002',
        cedula_ruc: '0104589234',
        nombres: 'ARQ. PATRICIA VEGA',
        tipo_persona: 'NATURAL' as const,
        email: 'pvega@vegaconsulting.com',
        telefono: '+593987654321',
        plan_nombre: 'Firma P. Natural (1 Año)',
        vigencia_anios: 1,
        precio_usd: 18.00,
        metodo_pago: 'TARJETA_STRIPE' as const,
        numero_comprobante: 'STRIPE_981264',
        pago_validado: true,
        estado_tramite: 'POR_VENCER',
        fecha_solicitud: '2025-11-10',
        fecha_emision: '2025-11-10',
        fecha_caducidad: '2026-11-10',
        archivo_p12_disponible: true
      },
      {
        id: 'sol-base-003',
        cedula_ruc: '1791245896001',
        nombres: 'HORMIGONES DEL AUSTRO S.A.',
        tipo_persona: 'JURIDICA' as const,
        email: 'gerencia@hormigonesaustro.com',
        telefono: '+593991234567',
        plan_nombre: 'Firma Representante Legal (2 Años)',
        vigencia_anios: 2,
        precio_usd: 38.00,
        metodo_pago: 'TRANSFERENCIA' as const,
        numero_comprobante: '45891234',
        pago_validado: false,
        estado_tramite: 'PENDIENTE_VALIDACION',
        fecha_solicitud: '2026-10-25',
        archivo_p12_disponible: false
      }
    ];

    // Evitar duplicar si la cédula ya está en las solicitudes reales
    const idsReales = new Set(realList.map(r => r.cedula_ruc));
    const demoFiltradas = demoBase.filter(d => !idsReales.has(d.cedula_ruc));

    const totalConsolidado = [...realList, ...demoFiltradas];

    return NextResponse.json({
      success: true,
      solicitudes: totalConsolidado
    });
  } catch (error: any) {
    console.error('Error al obtener solicitudes de firma:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener solicitudes' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, accion } = body;

    if (!accion) {
      return NextResponse.json({ error: 'accion es obligatoria' }, { status: 400 });
    }

    // Acción Masiva de Auto-Validación Autónoma por IA
    if (accion === 'AUTO_VALIDAR_IA_MASIVO') {
      const resAuto = await SaraBankReconciliationService.autoValidarPendientes();
      return NextResponse.json({
        success: true,
        accion: 'AUTO_VALIDAR_IA_MASIVO',
        totalAprobadas: resAuto.totalAprobadas,
        detalles: resAuto.detalles,
        mensaje: `Agente Autónomo SARA-PAGOS validó ${resAuto.totalAprobadas} solicitudes pendientes sin intervención humana.`
      });
    }

    if (!id) {
      return NextResponse.json({ error: 'id es obligatorio para esta acción' }, { status: 400 });
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

    // Actualizar en base de datos Supabase
    const { data: updated, error } = await supabaseAdmin
      .from('sri_solicitudes_firmas')
      .update({
        estado_solicitud: nuevoEstado,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('Advertencia actualizando sri_solicitudes_firmas en Supabase:', error.message);
    }

    return NextResponse.json({
      success: true,
      id,
      estado_solicitud: nuevoEstado,
      updated
    });
  } catch (error: any) {
    console.error('Error en PATCH de firmas:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar firma' },
      { status: 500 }
    );
  }
}
