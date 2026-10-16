import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/takeoff/mediciones: Volcar mediciones del Take-Off al presupuesto real
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { action, presupuesto_id, mediciones } = body

    if (!presupuesto_id) {
      return NextResponse.json({ error: "Falta presupuesto_id requerido" }, { status: 400 })
    }

    if (action === "apply_to_presupuesto") {
      if (!Array.isArray(mediciones) || mediciones.length === 0) {
        return NextResponse.json({ error: "No se proporcionaron mediciones válidas para volcar" }, { status: 400 })
      }

      // Filtrar mediciones que tengan un rubro_id asignado
      const medicionesAsignadas = mediciones.filter((m: any) => m.rubro_id && Number(m.resultado) > 0)

      if (medicionesAsignadas.length === 0) {
        return NextResponse.json({ 
          error: "Ninguna medición tiene un rubro de obra asignado. Asigna al menos una medición a un rubro." 
        }, { status: 422 })
      }

      let updatedCount = 0

      // 1. Actualizar cada rubro en la base de datos
      for (const med of medicionesAsignadas) {
        // Obtener rubro actual para conservar precio_unitario_snapshot
        const { data: rubroActual } = await supabase
          .from("presupuesto_rubros")
          .select("id, precio_unitario_snapshot")
          .eq("id", med.rubro_id)
          .single()

        if (rubroActual) {
          const nuevaCantidad = Number(med.resultado)
          const pu = Number(rubroActual.precio_unitario_snapshot) || 0
          const nuevoSubtotal = Number((nuevaCantidad * pu).toFixed(2))

          const { error: updErr } = await supabase
            .from("presupuesto_rubros")
            .update({
              cantidad_obra: nuevaCantidad,
              subtotal: nuevoSubtotal
            })
            .eq("id", med.rubro_id)

          if (!updErr) {
            updatedCount++
          }
        }
      }

      // 2. Recalcular Costo Directo Total y Gran Total del Presupuesto
      const { data: todosRubros } = await supabase
        .from("presupuesto_rubros")
        .select("subtotal")
        .eq("presupuesto_id", presupuesto_id)

      const nuevoCostoDirecto = (todosRubros || []).reduce((acc: number, curr: any) => acc + (Number(curr.subtotal) || 0), 0)

      // Obtener factores indirectos
      const { data: presActual } = await supabase
        .from("presupuestos_reales")
        .select("porcentaje_admin, porcentaje_imprevistos, porcentaje_utilidad, indirectos_config")
        .eq("id", presupuesto_id)
        .single()

      let factorAIU = 1.25 // 25% por defecto si no está definido
      if (presActual) {
        const admin = Number(presActual.porcentaje_admin) || 10
        const imprev = Number(presActual.porcentaje_imprevistos) || 5
        const util = Number(presActual.porcentaje_utilidad) || 10
        factorAIU = 1 + (admin + imprev + util) / 100
      }

      const nuevoGranTotal = Number((nuevoCostoDirecto * factorAIU).toFixed(2))

      await supabase
        .from("presupuestos_reales")
        .update({
          costo_directo_total: nuevoCostoDirecto,
          gran_total: nuevoGranTotal
        })
        .eq("id", presupuesto_id)

      return NextResponse.json({
        success: true,
        message: `Se actualizaron exitosamente ${updatedCount} rubros desde el Take-Off 2D.`,
        updatedCount,
        nuevoCostoDirecto,
        nuevoGranTotal
      })
    }

    return NextResponse.json({ error: "Acción no soportada" }, { status: 400 })
  } catch (err: any) {
    console.error("Error en API Take-Off:", err)
    return NextResponse.json({ error: "Error interno en servidor SARA Take-Off", message: err.message }, { status: 500 })
  }
}
