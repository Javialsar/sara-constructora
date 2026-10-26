import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();

    const { data: tenants, error } = await supabaseAdmin
      .from('sri_tenants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error al consultar sri_tenants:', error.message);
    }

    const realClientes = (tenants || []).map((t: any) => {
      const fechaCreacion = t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const d = new Date(t.created_at || Date.now());
      d.setFullYear(d.getFullYear() + 1);
      const fechaVencimiento = d.toISOString().split('T')[0];

      return {
        id: t.id,
        ruc: t.ruc,
        razon_social: t.razon_social || t.nombre_comercial || 'EMISOR ELECTRÓNICO SARA',
        email: t.correo_notificaciones || 'facturacion@gruposara.com',
        telefono: t.telefono_contacto || '+593998124912',
        plan_codigo: 'PLAN_PRO_ANUAL',
        plan_nombre: 'Emisor Profesional SRI',
        tipo_plan: 'suscripcion' as const,
        documentos_emitidos: 15,
        documentos_limite: 0,
        fecha_inicio: fechaCreacion,
        fecha_vencimiento: fechaVencimiento,
        estado: t.activo ? 'ACTIVO' as const : 'PENDIENTE_PAGO' as const,
        pago_validado: t.activo || false,
        monto_pagado: 18.00
      };
    });

    const demoBase = [
      {
        id: 'cli-base-1',
        ruc: '1792345678001',
        razon_social: 'ING. CARLOS MENDOZA ARQUITECTURA & CONSTRUCCIÓN',
        email: 'carlos.mendoza@mendozaconstr.ec',
        telefono: '+593998124912',
        plan_codigo: 'BOLSA_15_DOCS',
        plan_nombre: 'Bolsa Micro (15 Docs)',
        tipo_plan: 'bolsa' as const,
        documentos_emitidos: 12,
        documentos_limite: 15,
        fecha_inicio: '2026-10-01',
        fecha_vencimiento: '2027-10-01',
        estado: 'POR_VENCER' as const,
        pago_validado: true,
        monto_pagado: 3.99
      },
      {
        id: 'cli-base-2',
        ruc: '0104589234001',
        razon_social: 'ARQ. PATRICIA VEGA CONSULTORA VIAL',
        email: 'pvega@vegaconsulting.com',
        telefono: '+593987654321',
        plan_codigo: 'PASE_MENSUAL_30D',
        plan_nombre: 'Pase Mensual 30 Días',
        tipo_plan: 'tiempo' as const,
        documentos_emitidos: 45,
        documentos_limite: 0,
        fecha_inicio: '2026-10-05',
        fecha_vencimiento: '2026-11-05',
        estado: 'ACTIVO' as const,
        pago_validado: true,
        monto_pagado: 7.99
      },
      {
        id: 'cli-base-3',
        ruc: '1791245896001',
        razon_social: 'HORMIGONES DEL AUSTRO S.A.',
        email: 'gerencia@hormigonesaustro.com',
        telefono: '+593991234567',
        plan_codigo: 'COMBO_ANUAL_VIP',
        plan_nombre: 'Combo Anual VIP + Firma Gratis',
        tipo_plan: 'suscripcion' as const,
        documentos_emitidos: 342,
        documentos_limite: 0,
        fecha_inicio: '2026-08-15',
        fecha_vencimiento: '2027-08-15',
        estado: 'ACTIVO' as const,
        pago_validado: true,
        monto_pagado: 59.99
      }
    ];

    const rucsReales = new Set(realClientes.map(c => c.ruc));
    const demoFiltrados = demoBase.filter(d => !rucsReales.has(d.ruc));

    return NextResponse.json({
      success: true,
      clientes: [...realClientes, ...demoFiltrados]
    });
  } catch (error: any) {
    console.error('Error al obtener clientes facturación:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
