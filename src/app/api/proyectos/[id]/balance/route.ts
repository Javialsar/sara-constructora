import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // 1. Obtener el proyecto
    const { data: proyecto, error: pError } = await supabase
      .from('proyectos')
      .select('*, clientes (id, nombre, apellido, email, telefono)')
      .eq('id', id)
      .single()

    if (pError || !proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    // 2. Parsear datos financieros
    let df = proyecto.datos_financieros || {}
    if (typeof df === 'string') {
      try { df = JSON.parse(df) } catch (e) { df = {} }
    }

    const presupuestoTotal = Number(df.presupuesto_total) || 40000
    const avanceFisicoPct = Number(proyecto.avance) || 0
    const montoEjecutado = Number(df.monto_ejecutado) || Number((presupuestoTotal * (avanceFisicoPct / 100)).toFixed(2))
    const avanceFinancieroPct = presupuestoTotal > 0 ? Number(((montoEjecutado / presupuestoTotal) * 100).toFixed(1)) : 0
    const desfasePct = Number((avanceFinancieroPct - avanceFisicoPct).toFixed(1))
    const alertaSobrecosto = desfasePct > 10

    // 3. Obtener avances asociados
    const { data: avances } = await supabase
      .from('avances')
      .select('*')
      .eq('proyecto_id', id)
      .order('fecha', { ascending: false })

    return NextResponse.json({
      success: true,
      proyecto: {
        id: proyecto.id,
        nombre: proyecto.nombre,
        estado: proyecto.estado,
        ubicacion: proyecto.ubicacion,
        avance_fisico_pct: avanceFisicoPct,
        avance_financiero_pct: avanceFinancieroPct,
        presupuesto_total: presupuestoTotal,
        monto_ejecutado: montoEjecutado,
        saldo_disponible: Number((presupuestoTotal - montoEjecutado).toFixed(2)),
        desfase_pct: desfasePct,
        alerta_sobrecosto: alertaSobrecosto,
        cliente: proyecto.clientes,
        total_hitos_documentados: avances?.length || 0,
        avances: avances || []
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error al calcular balance" }, { status: 500 })
  }
}
