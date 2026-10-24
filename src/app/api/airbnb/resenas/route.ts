import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/lib/supabase-server"

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })
}

function formatAuthorName(rawName?: string, fallback = "Huésped"): string {
  if (!rawName) return fallback
  const clean = rawName.replace(/[._-]+/g, " ").trim()
  if (!clean || clean.toLowerCase() === "huesped verificado" || clean.toLowerCase() === "huesped") {
    return fallback
  }
  return clean
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

// GET: Obtener reseñas de un alojamiento o todas las reseñas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const alojamientoId = searchParams.get("alojamientoId")
    const supabase = getSupabaseAdmin()

    if (!supabase) {
      return NextResponse.json({ resenas: [] })
    }

    let query = supabase
      .from("solicitudes_servicio")
      .select("id, nombre, email, telefono, mensaje, created_at")
      .eq("tipo_servicio", "resena_airbnb")
      .order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) {
      console.warn("Error leyendo reseñas de Supabase:", error.message)
      return NextResponse.json({ resenas: [] })
    }

    const resenas = (data || []).map((row: any) => {
      let detalle: any = {}
      try {
        detalle = typeof row.mensaje === "string" ? JSON.parse(row.mensaje) : (row.mensaje || {})
      } catch {
        detalle = {}
      }

      const rawAuthor = detalle.autor || detalle.huespedNombre || row.nombre || (row.email ? row.email.split("@")[0] : "")
      const formattedAuthor = formatAuthorName(rawAuthor, "Huésped SARA")

      return {
        id: row.id,
        alojamientoId: detalle.alojamientoId || detalle.alojamiento_id || "",
        alojamientoCodigo: detalle.alojamientoCodigo || detalle.codigo || "",
        codigoReserva: detalle.codigoReserva || detalle.codigo_reserva || "",
        autor: formattedAuthor,
        huespedNombre: formattedAuthor,
        ciudadOrigen: detalle.ciudadOrigen || detalle.ciudad || "Ecuador",
        pais: detalle.pais || "Ecuador",
        bandera: detalle.bandera || "🇪🇨",
        fecha: detalle.fecha || new Date(row.created_at).toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric" }),
        rating: Number(detalle.rating) || 5,
        comentario: detalle.comentario || "",
        verificado: Boolean(detalle.verificado)
      }
    })

    const filtradas = alojamientoId 
      ? resenas.filter(r => r.alojamientoId === alojamientoId || r.alojamientoCodigo === alojamientoId)
      : resenas

    return NextResponse.json({ resenas: filtradas, count: filtradas.length })
  } catch (err: any) {
    console.error("Error en GET /api/airbnb/resenas:", err)
    return NextResponse.json({ resenas: [], error: err.message }, { status: 500 })
  }
}

// POST: Registrar una nueva reseña con validación de verificación
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: "Credenciales de Supabase no configuradas" }, { status: 500 })
    }

    const body = await request.json()
    const {
      alojamientoId,
      alojamientoCodigo,
      codigoReserva,
      autor,
      huespedNombre,
      email,
      telefono,
      ciudadOrigen,
      rating,
      comentario
    } = body

    if (!alojamientoId || !rating || !comentario) {
      return NextResponse.json({ error: "alojamientoId, rating y comentario son requeridos" }, { status: 400 })
    }

    let isVerified = false

    // Verificar si el código de reserva realmente existe en la base de datos
    if (codigoReserva) {
      try {
        const { data: solRsv } = await supabase
          .from("solicitudes_servicio")
          .select("id")
          .eq("tipo_servicio", "alojamiento_airbnb")
          .ilike("mensaje", `%${codigoReserva}%`)
          .limit(1)

        if (solRsv && solRsv.length > 0) {
          isVerified = true
        }
      } catch {}
    }

    const rawAuthor = autor || huespedNombre || (email ? email.split("@")[0] : "") || "Huésped"
    const formattedAuthor = formatAuthorName(rawAuthor, "Huésped")

    const resenaDetalle = {
      alojamientoId,
      alojamientoCodigo: alojamientoCodigo || alojamientoId,
      codigoReserva: codigoReserva || "",
      autor: formattedAuthor,
      huespedNombre: formattedAuthor,
      ciudadOrigen: ciudadOrigen || "Cuenca, Ecuador",
      pais: "Ecuador",
      bandera: "🇪🇨",
      rating: Math.min(5, Math.max(1, Number(rating))),
      comentario: comentario.trim(),
      fecha: new Date().toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric" }),
      verificado: isVerified
    }

    const { data, error } = await supabase
      .from("solicitudes_servicio")
      .insert([
        {
          nombre: formattedAuthor,
          email: email || "huesped@sara.ec",
          telefono: telefono || "+593",
          tipo_servicio: "resena_airbnb",
          mensaje: JSON.stringify(resenaDetalle, null, 2),
          estado: isVerified ? "aprobada" : "pendiente_moderacion"
        }
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      resena: resenaDetalle,
      verificado: isVerified,
      message: isVerified
        ? "Reseña verificada publicada exitosamente."
        : "Reseña recibida y enviada a moderación."
    })
  } catch (err: any) {
    console.error("Error en POST /api/airbnb/resenas:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
