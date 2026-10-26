import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // 1. Verificación obligatoria de sesión Zero-Trust
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "No autorizado: Se requiere sesión activa para consultar el balance financiero del proyecto." },
        { status: 401 }
      )
    }

    // 2. Obtener el proyecto
    const { data: proyecto, error: pError } = await supabase
      .from('proyectos')
      .select('*, clientes (id, nombre, apellido, email, telefono)')
      .eq('id', id)
      .single()

    if (pError || !proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    // 3. Mitigación de IDOR / BOLA: Validar tenencia del proyecto o rol técnico
    const appMeta = user.app_metadata || {}
    const userRole = String(appMeta.role || '')
    const isMasterAdmin = Boolean(
      appMeta.es_admin ||
      appMeta.sara_master ||
      userRole === 'admin' ||
      userRole === 'superadmin' ||
      userRole === 'tecnico' ||
      userRole === 'ingeniero_residente' ||
      userRole === 'contador_constructora'
    )

    const isOwner = proyecto.cliente_id === user.id || proyecto.clientes?.id === user.id
    if (!isMasterAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Acceso denegado: No posee permisos para consultar la información financiera de este proyecto." },
        { status: 403 }
      )
    }

    // 4. Parsear datos financieros
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

    // 5. Obtener avances asociados
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
