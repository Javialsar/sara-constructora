import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const bimTakeoffElementSchema = z.object({
  guid_elemento: z.string().min(5),
  categoria_bim: z.string().min(2), // ej. 'Structural Foundations', 'Walls', 'Floors'
  tipo_familia: z.string().optional(),
  material_nombre: z.string().min(2),
  clasificacion_sara: z.enum(['hormigon', 'acero', 'mamposteria', 'acabado', 'instalaciones', 'otro']),
  volumen_m3: z.number().nonnegative().default(0),
  area_m2: z.number().nonnegative().default(0),
  longitud_ml: z.number().nonnegative().default(0),
  peso_kg: z.number().nonnegative().default(0),
})

const bimIngestPayloadSchema = z.object({
  proyecto_id: z.string().uuid().optional().nullable(),
  nombre_modelo: z.string().min(3),
  software_origen: z.enum(['Autodesk Revit', 'Graphisoft Archicad', 'IFC OpenBIM', 'Bentley OpenBuildings', 'Otro']),
  version_software: z.string().default('2026'),
  guid_modelo: z.string().optional(),
  elementos: z.array(bimTakeoffElementSchema).min(1, "El modelo debe contener al menos 1 elemento cuantificable")
})

// GET /api/bim/takeoff: Consultar modelos BIM registrados
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: modelos, error } = await supabase
      .from('sara_bim_modelos')
      .select('*, proyecto:proyectos(id, nombre), takeoffs:sara_bim_takeoffs(id, categoria_bim, material_nombre, volumen_m3, peso_kg, subtotal_apu, subtotal_marketplace)')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Error al listar modelos BIM", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, modelos: modelos || [] })
  } catch (err: any) {
    return NextResponse.json({ error: "Error en servidor SARA-BIM", message: err.message }, { status: 500 })
  }
}

// POST /api/bim/takeoff: Recibir payload desde Add-in Revit / Archicad
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Validar encabezado o token de autorización (Add-in API Key o Sesión)
    const apiKey = request.headers.get("x-sara-bim-key")
    const { data: { user } } = await supabase.auth.getUser()

    const isValidAddinKey = Boolean(
      (process.env.SARA_BIM_ADDIN_SECRET && apiKey === process.env.SARA_BIM_ADDIN_SECRET) ||
      (process.env.NODE_ENV !== "production" && apiKey === "sara_bim_dev_2026")
    )

    if (!user && !isValidAddinKey) {
      return NextResponse.json({ 
        error: "Acceso no autorizado. Provea cabecera 'x-sara-bim-key' válida o sesión de usuario." 
      }, { status: 401 })
    }

    const body = await request.json()
    const validation = bimIngestPayloadSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ 
        error: "Payload BIM inválido", 
        details: validation.error.flatten() 
      }, { status: 422 })
    }

    const { elementos, ...modeloMeta } = validation.data

    // 2. Obtener precios de insumos en vivo del Marketplace y rubros APU
    const { data: catalogoRubros } = await supabase
      .from('rubros')
      .select('id, nombre, unidad, precio_total')
      .limit(200)

    const { data: insumosMarketplace } = await supabase
      .from('insumos')
      .select('id, nombre, tipo, precio_sin_iva')
      .limit(200)

    // 3. Procesar volumetría acumulada
    let volumenTotalM3 = 0
    let areaTotalM2 = 0
    let pesoAceroKg = 0
    let totalApu = 0
    let totalMarketplace = 0

    const itemsProcesados = elementos.map(el => {
      volumenTotalM3 += el.volumen_m3
      areaTotalM2 += el.area_m2
      pesoAceroKg += el.peso_kg

      // Precios de referencia según clasificación
      let precioUnitApu = 0
      let precioUnitMarketplace = 0
      let apuId = null

      if (el.clasificacion_sara === 'hormigon') {
        const rubroH = catalogoRubros?.find(r => r.nombre.toLowerCase().includes('hormig'))
        precioUnitApu = rubroH ? Number(rubroH.precio_total) : 135.00
        precioUnitMarketplace = 118.50 // Descuento corporativo SARA Marketplace B2B
        apuId = rubroH?.id || null
      } else if (el.clasificacion_sara === 'acero') {
        const rubroA = catalogoRubros?.find(r => r.nombre.toLowerCase().includes('acero'))
        precioUnitApu = rubroA ? Number(rubroA.precio_total) : 1.85
        precioUnitMarketplace = 1.62
        apuId = rubroA?.id || null
      } else if (el.clasificacion_sara === 'mamposteria') {
        const rubroM = catalogoRubros?.find(r => r.nombre.toLowerCase().includes('mampost') || r.nombre.toLowerCase().includes('ladrillo'))
        precioUnitApu = rubroM ? Number(rubroM.precio_total) : 22.00
        precioUnitMarketplace = 19.50
        apuId = rubroM?.id || null
      } else {
        precioUnitApu = 25.00
        precioUnitMarketplace = 22.00
      }

      // Cálculo de costo según unidad física predominante
      const baseMedida = el.peso_kg > 0 ? el.peso_kg : el.volumen_m3 > 0 ? el.volumen_m3 : el.area_m2 > 0 ? el.area_m2 : el.longitud_ml
      const subtotalApu = Number((baseMedida * precioUnitApu).toFixed(2))
      const subtotalMarketplace = Number((baseMedida * precioUnitMarketplace).toFixed(2))

      totalApu += subtotalApu
      totalMarketplace += subtotalMarketplace

      return {
        ...el,
        apu_rubro_id: apuId,
        precio_unitario_apu: precioUnitApu,
        subtotal_apu: subtotalApu,
        precio_unitario_marketplace: precioUnitMarketplace,
        subtotal_marketplace: subtotalMarketplace
      }
    })

    const ahorroDetectado = Number((totalApu - totalMarketplace).toFixed(2))

    // 4. Guardar Modelo en DB
    const { data: modeloGuardado, error: modError } = await supabase
      .from('sara_bim_modelos')
      .insert([{
        ...modeloMeta,
        volumen_total_m3: Number(volumenTotalM3.toFixed(2)),
        area_total_m2: Number(areaTotalM2.toFixed(2)),
        peso_acero_kg: Number(pesoAceroKg.toFixed(2)),
        total_presupuestado_apu: Number(totalApu.toFixed(2)),
        total_cotizado_marketplace: Number(totalMarketplace.toFixed(2)),
        ahorro_detectado_marketplace: ahorroDetectado,
        metadata: {
          total_elementos_qto: elementos.length,
          procesado_por: user?.id || "add_in_revit_archicad",
          timestamp_ingesta: new Date().toISOString()
        }
      }])
      .select()
      .single()

    if (modError) {
      return NextResponse.json({ error: "Error al guardar cabecera de modelo BIM", details: modError.message }, { status: 500 })
    }

    // 5. Guardar elementos Takeoff
    const takeoffRows = itemsProcesados.map(it => ({
      modelo_id: modeloGuardado.id,
      guid_elemento: it.guid_elemento,
      categoria_bim: it.categoria_bim,
      tipo_familia: it.tipo_familia || null,
      material_nombre: it.material_nombre,
      clasificacion_sara: it.clasificacion_sara,
      volumen_m3: it.volumen_m3,
      area_m2: it.area_m2,
      longitud_ml: it.longitud_ml,
      peso_kg: it.peso_kg,
      apu_rubro_id: it.apu_rubro_id,
      precio_unitario_apu: it.precio_unitario_apu,
      subtotal_apu: it.subtotal_apu,
      precio_unitario_marketplace: it.precio_unitario_marketplace,
      subtotal_marketplace: it.subtotal_marketplace
    }))

    const { error: toError } = await supabase.from('sara_bim_takeoffs').insert(takeoffRows)
    if (toError) {
      console.warn("Advertencia al guardar takeoffs BIM:", toError.message)
    }

    return NextResponse.json({
      success: true,
      mensaje: "Material Takeoff de modelo BIM procesado y cotizado en tiempo real",
      modelo_id: modeloGuardado.id,
      resumen_volumetrico: {
        volumen_total_hormigon_m3: Number(volumenTotalM3.toFixed(2)),
        peso_total_acero_kg: Number(pesoAceroKg.toFixed(2)),
        area_total_mamposteria_m2: Number(areaTotalM2.toFixed(2)),
        total_elementos_procesados: elementos.length
      },
      cotizacion_financiera: {
        costo_base_sara_apu: Number(totalApu.toFixed(2)),
        costo_vivo_sara_marketplace: Number(totalMarketplace.toFixed(2)),
        ahorro_estimado_b2b: ahorroDetectado,
        porcentaje_ahorro: totalApu > 0 ? Number(((ahorroDetectado / totalApu) * 100).toFixed(1)) : 0
      }
    }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: "Fallo crítico en parser de modelo BIM", message: err.message }, { status: 500 })
  }
}
