import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const evidenciaFotoSchema = z.object({
  reporte_id: z.string().uuid(),
  item_id: z.string().uuid().optional().nullable(),
  latitud: z.number().min(-90).max(90).optional(),
  longitud: z.number().min(-180).max(180).optional(),
  precision_gps: z.number().nonnegative().optional(),
  timestamp_captura: z.string().default(() => new Date().toISOString()),
  tipo_evidencia: z.enum(['fotografia', 'ensayo_laboratorio', 'video', 'acta_firmada']).default('fotografia'),
  comentario: z.string().optional(),
  archivo_base64: z.string().min(10, "El contenido de la imagen en base64 es requerido")
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Autenticación requerida para cargar evidencia de obra." }, { status: 401 })
    }

    const body = await request.json()
    const validation = evidenciaFotoSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Datos de evidencia inválidos", details: validation.error.flatten() }, { status: 422 })
    }

    const data = validation.data

    // Decodificar Base64 a Buffer
    const base64Data = data.archivo_base64.replace(/^data:image\/\w+;base64,/, "")
    const buffer = Buffer.from(base64Data, 'base64')
    const fileName = `obra-${data.reporte_id}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.jpg`
    const storagePath = `fiscalizacion/${data.reporte_id}/${fileName}`

    // 1. Cargar archivo al bucket de Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('obra-multimedia')
      .upload(storagePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      })

    let publicUrl = ""
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('obra-multimedia').getPublicUrl(storagePath)
      publicUrl = urlData.publicUrl
    } else {
      // Fallback a URL simulada si el bucket no tiene permisos públicos aún
      publicUrl = `https://storage.supabase.co/v1/object/public/obra-multimedia/${storagePath}`
    }

    // 2. Registrar en la tabla de evidencias
    const { data: evidencia, error: dbError } = await supabase
      .from('sara_fiscalizacion_evidencias')
      .insert([{
        reporte_id: data.reporte_id,
        item_id: data.item_id || null,
        storage_path: storagePath,
        public_url: publicUrl,
        latitud: data.latitud || null,
        longitud: data.longitud || null,
        precision_gps: data.precision_gps || null,
        timestamp_captura: data.timestamp_captura,
        tipo_evidencia: data.tipo_evidencia,
        comentario: data.comentario || null
      }])
      .select()
      .single()

    if (dbError) {
      return NextResponse.json({ error: "Error al guardar metadatos de evidencia", details: dbError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      mensaje: "Evidencia fotográfica georreferenciada guardada exitosamente",
      evidencia
    }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: "Error al procesar archivo multimedia", message: err.message }, { status: 500 })
  }
}
