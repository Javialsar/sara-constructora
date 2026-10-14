import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const reporteDiarioSchema = z.object({
  proyecto_id: z.string().uuid(),
  fecha_reporte: z.string().default(() => new Date().toISOString().split('T')[0]),
  clima: z.enum(['soleado', 'nublado', 'lluvioso', 'temporal_extremo']).default('soleado'),
  temperatura_aprox: z.number().optional(),
  horas_trabajadas: z.number().min(0).max(24).default(8.0),
  personal_cuadrilla_count: z.number().min(0).default(1),
  equipo_activo_descripcion: z.string().optional(),
  observaciones: z.string().optional(),
  incidentes_sst: z.string().optional(),
  sincronizado_offline: z.boolean().default(false),
  offline_client_uuid: z.string().optional(),
  items: z.array(z.object({
    rubro_id: z.string().uuid().optional().nullable(),
    codigo_rubro: z.string().optional(),
    descripcion_rubro: z.string().min(2),
    unidad: z.string().min(1),
    cantidad_presupuestada: z.number().nonnegative().default(0),
    cantidad_ejecutada_dia: z.number().nonnegative(),
    precio_unitario: z.number().nonnegative().default(0),
    ubicacion_especifica: z.string().optional(),
    estado_control: z.enum(['conforme', 'observado', 'no_conforme']).default('conforme')
  })).min(1, "Debe registrar al menos un rubro ejecutado en el día")
})

// GET /api/fiscaliza/reporte-diario?proyecto_id=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const proyectoId = searchParams.get('proyecto_id')

    if (!proyectoId) {
      return NextResponse.json({ error: "Parámetro proyecto_id requerido" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: reportes, error } = await supabase
      .from('sara_fiscalizacion_diaria')
      .select('*, items:sara_fiscalizacion_items(*), evidencias:sara_fiscalizacion_evidencias(*)')
      .eq('proyecto_id', proyectoId)
      .order('fecha_reporte', { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Error al consultar reportes de fiscalización", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: reportes || [] })
  } catch (err: any) {
    return NextResponse.json({ error: "Error en servidor SARA-FISCALIZA", message: err.message }, { status: 500 })
  }
}

// POST /api/fiscaliza/reporte-diario
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Autenticación requerida para residentes de obra." }, { status: 401 })
    }

    const body = await request.json()
    const validation = reporteDiarioSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Datos de fiscalización inválidos", details: validation.error.flatten() }, { status: 422 })
    }

    const { items, ...reporteData } = validation.data

    // 1. Obtener proyecto y presupuesto base
    const { data: proyecto, error: pError } = await supabase
      .from('proyectos')
      .select('id, nombre, avance, datos_financieros')
      .eq('id', reporteData.proyecto_id)
      .single()

    if (pError || !proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado en la base maestra" }, { status: 404 })
    }

    // 2. Calcular montos ejecutados en el día
    const montoDia = items.reduce((acc, it) => acc + (it.cantidad_ejecutada_dia * it.precio_unitario), 0)

    // 3. Obtener monto total de presupuesto para calcular delta de avance %
    let df = proyecto.datos_financieros || {}
    if (typeof df === 'string') {
      try { df = JSON.parse(df) } catch (e) { df = {} }
    }
    const presupuestoTotal = Number(df.presupuesto_total) || 50000
    const deltaAvancePct = presupuestoTotal > 0 ? (montoDia / presupuestoTotal) * 100 : 1.0

    const avanceAnterior = Number(proyecto.avance) || 0
    const nuevoAvancePct = Math.min(100, Number((avanceAnterior + deltaAvancePct).toFixed(2)))

    // 4. Insertar reporte de fiscalización diario
    const { data: reporteGuardado, error: rError } = await supabase
      .from('sara_fiscalizacion_diaria')
      .upsert([{
        ...reporteData,
        residente_id: user.id,
        porcentaje_avance_dia: Number(deltaAvancePct.toFixed(3)),
        porcentaje_avance_acumulado: nuevoAvancePct,
        monto_ejecutado_dia: Number(montoDia.toFixed(2))
      }], { onConflict: 'proyecto_id, fecha_reporte' })
      .select()
      .single()

    if (rError) {
      return NextResponse.json({ error: "Error al registrar reporte de fiscalización", details: rError.message }, { status: 500 })
    }

    // 5. Insertar items del reporte
    const itemsRows = items.map(it => ({
      reporte_id: reporteGuardado.id,
      rubro_id: it.rubro_id || null,
      codigo_rubro: it.codigo_rubro || null,
      descripcion_rubro: it.descripcion_rubro,
      unidad: it.unidad,
      cantidad_presupuestada: it.cantidad_presupuestada,
      cantidad_ejecutada_dia: it.cantidad_ejecutada_dia,
      precio_unitario: it.precio_unitario,
      ubicacion_especifica: it.ubicacion_especifica || null,
      estado_control: it.estado_control
    }))

    // Limpiar items existentes para esa fecha si fue actualización
    await supabase.from('sara_fiscalizacion_items').delete().eq('reporte_id', reporteGuardado.id)
    const { error: itemsError } = await supabase.from('sara_fiscalizacion_items').insert(itemsRows)

    if (itemsError) {
      console.warn("Advertencia al guardar items fiscalizados:", itemsError.message)
    }

    // 6. Actualizar avance global del proyecto y alimentar SARA-PAGOS
    const nuevoMontoEjecutado = Number(((Number(df.monto_ejecutado) || 0) + montoDia).toFixed(2))
    const nuevosDatosFinancieros = {
      ...df,
      presupuesto_total: presupuestoTotal,
      monto_ejecutado: nuevoMontoEjecutado,
      ultima_fiscalizacion: reporteGuardado.fecha_reporte
    }

    await supabase
      .from('proyectos')
      .update({
        avance: nuevoAvancePct,
        datos_financieros: nuevosDatosFinancieros
      })
      .eq('id', proyecto.id)

    return NextResponse.json({
      success: true,
      mensaje: "Avance diario de obra fiscalizado exitosamente",
      reporte_id: reporteGuardado.id,
      resumen_fisico_financiero: {
        monto_ejecutado_dia: montoDia,
        avance_anterior_pct: avanceAnterior,
        nuevo_avance_acumulado_pct: nuevoAvancePct,
        sincronizado_con_sara_pagos: true
      }
    }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: "Fallo crítico en fiscalización diaria", message: err.message }, { status: 500 })
  }
}
