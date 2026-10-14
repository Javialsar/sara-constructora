import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const tenderQuerySchema = z.object({
  provincia: z.string().optional(),
  tipo: z.string().optional(),
  estado: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
})

const tenderCreateSchema = z.object({
  codigo_proceso: z.string().min(3),
  entidad_contratante: z.string().min(2),
  objeto_proceso: z.string().min(5),
  tipo_contratacion: z.enum([
    'Subasta Inversa Electrónica',
    'Menor Cuantía Obra',
    'Cotización',
    'Licitación',
    'Consultoría',
    'Ínfima Cuantía'
  ]),
  provincia: z.enum(['Loja', 'Azuay', 'El Oro', 'Pichincha', 'Guayas', 'Zamora Chinchipe', 'Otra']),
  canton: z.string().default('Loja'),
  presupuesto_referencial: z.number().positive(),
  fecha_publicacion: z.string(),
  fecha_limite_ofertas: z.string(),
  url_pliego: z.string().url().optional(),
  url_sercop: z.string().url().optional(),
  proyecto_id: z.string().uuid().optional().nullable(),
  items: z.array(z.object({
    codigo_cpc: z.string().optional(),
    descripcion: z.string().min(2),
    unidad: z.string().min(1),
    cantidad: z.number().positive(),
    precio_unitario_referencial: z.number().nonnegative().default(0),
  })).optional()
})

// GET /api/tenders: Listar procesos SERCOP con filtros
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const validated = tenderQuerySchema.safeParse(params)

    if (!validated.success) {
      return NextResponse.json({ error: "Parámetros inválidos", details: validated.error.flatten() }, { status: 400 })
    }

    const supabase = await createClient()
    let query = supabase
      .from('sara_tenders_procesos')
      .select('*, proyecto:proyectos(id, nombre, ubicacion), items:sara_tenders_items(id, descripcion, unidad, cantidad, subtotal_referencial, match_confianza)')
      .order('fecha_publicacion', { ascending: false })
      .limit(validated.data.limit)

    if (validated.data.provincia && validated.data.provincia !== 'todas') {
      query = query.eq('provincia', validated.data.provincia)
    }
    if (validated.data.tipo && validated.data.tipo !== 'todos') {
      query = query.eq('tipo_contratacion', validated.data.tipo)
    }
    if (validated.data.estado && validated.data.estado !== 'todos') {
      query = query.eq('estado', validated.data.estado)
    }
    if (validated.data.search) {
      query = query.or(`codigo_proceso.ilike.%${validated.data.search}%,objeto_proceso.ilike.%${validated.data.search}%,entidad_contratante.ilike.%${validated.data.search}%`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: "Error al consultar procesos SERCOP", details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      total: data?.length || 0,
      data: data || []
    })
  } catch (err: any) {
    return NextResponse.json({ error: "Error de servidor en SARA-TENDERS", message: err.message }, { status: 500 })
  }
}

// POST /api/tenders: Registrar proceso SERCOP (vía Web Scraper o Manual)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado. Token JWT requerido." }, { status: 401 })
    }

    const json = await request.json()
    const validation = tenderCreateSchema.safeParse(json)

    if (!validation.success) {
      return NextResponse.json({ error: "Cuerpo de petición inválido", details: validation.error.flatten() }, { status: 422 })
    }

    const { items, ...procesoData } = validation.data

    // Insertar proceso
    const { data: proceso, error: procError } = await supabase
      .from('sara_tenders_procesos')
      .insert([{
        ...procesoData,
        rubros_extraidos_total: items?.length || 0,
        metadata: { creado_por: user.id, email: user.email }
      }])
      .select()
      .single()

    if (procError) {
      return NextResponse.json({ error: "Error al insertar proceso SERCOP", details: procError.message }, { status: 500 })
    }

    // Insertar items desglosados si vienen provistos
    if (items && items.length > 0) {
      const itemsPayload = items.map((it, idx) => ({
        proceso_id: proceso.id,
        orden: idx + 1,
        codigo_cpc: it.codigo_cpc || null,
        descripcion: it.descripcion,
        unidad: it.unidad,
        cantidad: it.cantidad,
        precio_unitario_referencial: it.precio_unitario_referencial,
        subtotal_referencial: Number((it.cantidad * it.precio_unitario_referencial).toFixed(2))
      }))

      const { error: itemsError } = await supabase.from('sara_tenders_items').insert(itemsPayload)
      if (itemsError) {
        console.warn("Advertencia al insertar items de pliego:", itemsError.message)
      }
    }

    return NextResponse.json({
      success: true,
      mensaje: "Proceso SERCOP registrado exitosamente en SARA-TENDERS",
      proceso
    }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: "Fallo crítico en controlador de Tenders", message: err.message }, { status: 500 })
  }
}
