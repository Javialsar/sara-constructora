import { NextRequest, NextResponse } from 'next/server';
import { SaraAdvisoryService } from '@/lib/agents/advisory-service';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tipoDocumento, proyectoId, nombreProyecto, ubicacion, customItems } = body;

    let dataCompilada: any = null;

    if (tipoDocumento === 'cuadro_comparativo_proveedores') {
      dataCompilada = SaraAdvisoryService.compilarCuadroComparativo(
        nombreProyecto || 'Proyecto de Construcción SARA',
        ubicacion || 'Cuenca, Ecuador',
        customItems
      );
    } else if (tipoDocumento === 'reporte_consolidado_insumos_logistica') {
      dataCompilada = SaraAdvisoryService.compilarReporteConsolidado(
        nombreProyecto || 'Proyecto de Construcción SARA',
        ubicacion || 'Cuenca, Ecuador'
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Tipo de documento no válido' },
        { status: 400 }
      );
    }

    // Persistir registro de generación documental en sara_ai_advisory_logs
    try {
      const supabase = await createClient();
      await supabase.from('sara_ai_advisory_logs').insert({
        proyecto_id: proyectoId || null,
        agent_id: tipoDocumento === 'cuadro_comparativo_proveedores' ? 'SARA-APU + SARA-MARKETPLACE' : 'SARA-FLETES',
        tipo_asesoria: tipoDocumento === 'cuadro_comparativo_proveedores' ? 'compras_suministros' : 'coordinacion_carga',
        mensaje_sugerencia: `Documento exportable oficial generado: ${dataCompilada.titulo} (${dataCompilada.codigoDocumento})`,
        datos_contexto: {
          codigoDocumento: dataCompilada.codigoDocumento,
          titulo: dataCompilada.titulo,
          fecha: dataCompilada.fechaEmision
        },
        decision_tecnico: 'aceptada',
        ahorro_estimado_usd: tipoDocumento === 'cuadro_comparativo_proveedores' ? 768.00 : 928.00,
        documento_generado_tipo: tipoDocumento,
        documento_url_o_datos: dataCompilada,
        decided_at: new Date().toISOString()
      });
    } catch (dbErr) {
      console.warn('[Advisory Documents] Fallback registro de documento en DB:', dbErr);
    }

    return NextResponse.json({
      success: true,
      tipoDocumento,
      documento: dataCompilada
    });
  } catch (error: any) {
    console.error('[API Advisory Documents Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al compilar documento' },
      { status: 500 }
    );
  }
}
