import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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

// GET: Listar todos los alojamientos de la base de datos
export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ alojamientos: [], origen: "local_no_credenciales" })
    }

    const { data, error } = await supabase
      .from("alojamientos_airbnb")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.warn("Tabla alojamientos_airbnb aún no creada en Supabase o error de lectura:", error.message)
      return NextResponse.json({ alojamientos: [], error: error.message, origen: "error_o_no_creada" })
    }

    // Mapear campos de la BD a la interfaz del frontend
    const mapped = (data || []).map((row: any) => ({
      id: row.id,
      codigo: row.codigo,
      titulo: row.titulo,
      tipo: row.tipo,
      alcance: row.alcance,
      pais: row.pais,
      bandera: row.bandera,
      ciudad: row.ciudad,
      sector: row.sector,
      lat: Number(row.lat) || -2.9001,
      lng: Number(row.lng) || -79.0059,
      precioNoche: Number(row.precio_noche) || 50,
      tarifaLimpieza: Number(row.tarifa_limpieza) || 15,
      rating: Number(row.rating) || 5.0,
      isSuperhost: Boolean(row.is_superhost),
      maxHuespedes: Number(row.max_huespedes) || 2,
      habitaciones: Number(row.habitaciones) || 1,
      banos: Number(row.banos) || 1,
      camas: Number(row.camas) || 1,
      imagenUrl: row.imagen_url,
      imagenes: Array.isArray(row.imagenes) && row.imagenes.length > 0 ? row.imagenes : [row.imagen_url],
      videoUrl: row.video_url || "",
      amenidades: Array.isArray(row.amenidades) ? row.amenidades : [],
      descripcion: row.descripcion || "",
      reglas: Array.isArray(row.reglas) ? row.reglas : [],
      publicado: Boolean(row.publicado),
      anfitrion: {
        nombre: row.anfitrion_nombre,
        telefono: row.anfitrion_telefono,
        email: row.anfitrion_email || "",
        cedulaRuc: row.anfitrion_cedula_ruc || "",
        banco: row.anfitrion_banco || "Banco Pichincha",
        tipoCuenta: row.anfitrion_tipo_cuenta || "Ahorros",
        numeroCuenta: row.anfitrion_numero_cuenta || "",
        titular: row.anfitrion_titular || row.anfitrion_nombre,
        cuentaBancaria: row.anfitrion_cuenta_bancaria || `${row.anfitrion_banco || "Banco"} ${row.anfitrion_tipo_cuenta || "Ahorros"} ${row.anfitrion_numero_cuenta || ""}`
      },
      monetizacion: {
        modelo: row.monetizacion_modelo || "comision_reserva",
        porcentajeComision: Number(row.monetizacion_porcentaje_comision) || 15,
        cuotaFijaMensual: Number(row.monetizacion_cuota_fija_mensual) || 45,
        totalComisionesGeneradas: Number(row.monetizacion_total_comisiones) || 0
      }
    }))

    return NextResponse.json({ alojamientos: mapped, count: mapped.length, origen: "database" })
  } catch (err: any) {
    console.error("Error en GET /api/airbnb/alojamientos:", err)
    return NextResponse.json({ alojamientos: [], error: err.message }, { status: 500 })
  }
}

// POST: Registrar nuevo alojamiento en Supabase
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: "Credenciales de Supabase no configuradas" }, { status: 500 })
    }

    const body = await request.json()
    const {
      codigo,
      titulo,
      tipo,
      alcance,
      pais,
      bandera,
      ciudad,
      sector,
      lat,
      lng,
      precioNoche,
      tarifaLimpieza,
      isSuperhost,
      maxHuespedes,
      habitaciones,
      banos,
      camas,
      imagenUrl,
      imagenes,
      videoUrl,
      amenidades,
      descripcion,
      reglas,
      publicado,
      anfitrion,
      monetizacion
    } = body

    if (!codigo || !titulo) {
      return NextResponse.json({ error: "Código y título son obligatorios" }, { status: 400 })
    }

    const payload = {
      codigo,
      titulo,
      tipo: tipo || "suite",
      alcance: alcance || "nacional",
      pais: pais || "Ecuador",
      bandera: bandera || "🇪🇨",
      ciudad: ciudad || "Cuenca",
      sector: sector || "",
      lat: Number(lat) || -2.9001,
      lng: Number(lng) || -79.0059,
      precio_noche: Number(precioNoche) || 50,
      tarifa_limpieza: Number(tarifaLimpieza) || 15,
      is_superhost: isSuperhost !== undefined ? isSuperhost : true,
      max_huespedes: Number(maxHuespedes) || 2,
      habitaciones: Number(habitaciones) || 1,
      banos: Number(banos) || 1,
      camas: Number(camas) || 1,
      imagen_url: imagenUrl || (Array.isArray(imagenes) && imagenes[0]) || "",
      imagenes: Array.isArray(imagenes) ? imagenes : [imagenUrl].filter(Boolean),
      video_url: videoUrl || "",
      amenidades: Array.isArray(amenidades) ? amenidades : [],
      descripcion: descripcion || "",
      reglas: Array.isArray(reglas) ? reglas : [],
      publicado: publicado !== undefined ? publicado : true,
      anfitrion_nombre: anfitrion?.nombre || "Anfitrión SARA",
      anfitrion_telefono: anfitrion?.telefono || "+593 9",
      anfitrion_email: anfitrion?.email || "",
      anfitrion_cedula_ruc: anfitrion?.cedulaRuc || "",
      anfitrion_banco: anfitrion?.banco || "Banco Pichincha",
      anfitrion_tipo_cuenta: anfitrion?.tipoCuenta || "Ahorros",
      anfitrion_numero_cuenta: anfitrion?.numeroCuenta || "",
      anfitrion_titular: anfitrion?.titular || anfitrion?.nombre || "",
      anfitrion_cuenta_bancaria: anfitrion?.cuentaBancaria || `${anfitrion?.banco || "Banco"} ${anfitrion?.tipoCuenta || "Ahorros"} ${anfitrion?.numeroCuenta || ""}`,
      monetizacion_modelo: monetizacion?.modelo || "comision_reserva",
      monetizacion_porcentaje_comision: Number(monetizacion?.porcentajeComision) || 15,
      monetizacion_cuota_fija_mensual: Number(monetizacion?.cuotaFijaMensual) || 45,
      monetizacion_total_comisiones: 0,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from("alojamientos_airbnb")
      .upsert(payload, { onConflict: "codigo" })
      .select()

    if (error) {
      console.error("Error guardando alojamiento en Supabase:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, alojamiento: data?.[0] })
  } catch (err: any) {
    console.error("Error en POST /api/airbnb/alojamientos:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE: Eliminar alojamiento por código o ID
export async function DELETE(request: Request) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: "Credenciales de Supabase no configuradas" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const codigo = searchParams.get("codigo")
    const id = searchParams.get("id")

    if (!codigo && !id) {
      return NextResponse.json({ error: "Se requiere 'codigo' o 'id' para eliminar" }, { status: 400 })
    }

    let query = supabase.from("alojamientos_airbnb").delete()
    if (id) {
      query = query.eq("id", id)
    } else if (codigo) {
      query = query.eq("codigo", codigo)
    }

    const { error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Alojamiento eliminado" })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
