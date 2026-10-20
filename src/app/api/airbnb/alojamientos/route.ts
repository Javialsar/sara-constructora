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

    if (error || !data || data.length === 0) {
      // Fallback a parametros_globales si hay error o tabla vacía
      try {
        const { data: globalParam } = await supabase
          .from("parametros_globales")
          .select("indirectos_default")
          .limit(1)
          .single()

        if (globalParam?.indirectos_default?.alojamientos_airbnb && Array.isArray(globalParam.indirectos_default.alojamientos_airbnb) && globalParam.indirectos_default.alojamientos_airbnb.length > 0) {
          return NextResponse.json({ alojamientos: globalParam.indirectos_default.alojamientos_airbnb, count: globalParam.indirectos_default.alojamientos_airbnb.length, origen: "database_backup" })
        }
      } catch (fallbackErr) {
        console.warn("Fallback lectura alojamientos:", fallbackErr)
      }
      if (error) {
        return NextResponse.json({ alojamientos: [], error: error.message, origen: "error_o_no_creada" })
      }
    }

    // Mapear campos de la BD a la interfaz del frontend
    const mapped = (data || []).map((row: any) => {
      const qrMatch = row.anfitrion_cuenta_bancaria?.match(/\[QR:(.*?)\]/)
      const qrCuenta = row.anfitrion_qr_cuenta || (qrMatch ? qrMatch[1] : "")
      const cleanCuentaBancaria = (row.anfitrion_cuenta_bancaria || "").replace(/\[QR:.*?\]/, "").trim()

      return {
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
          cuentaBancaria: cleanCuentaBancaria || `${row.anfitrion_banco || "Banco"} ${row.anfitrion_tipo_cuenta || "Ahorros"} ${row.anfitrion_numero_cuenta || ""}`,
          qrCuenta: qrCuenta
        },
        monetizacion: {
          modelo: row.monetizacion_modelo || "comision_reserva",
          porcentajeComision: Number(row.monetizacion_porcentaje_comision) || 15,
          cuotaFijaMensual: Number(row.monetizacion_cuota_fija_mensual) || 45,
          totalComisionesGeneradas: Number(row.monetizacion_total_comisiones) || 0
        }
      }
    })

    return NextResponse.json({ alojamientos: mapped, count: mapped.length, origen: "database" })
  } catch (err: any) {
    console.error("Error en GET /api/airbnb/alojamientos:", err)
    return NextResponse.json({ alojamientos: [], error: err.message }, { status: 500 })
  }
}

// POST: Registrar nuevo alojamiento en Supabase
export async function POST(request: Request) {
  try {
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado. Inicie sesión para gestionar alojamientos." }, { status: 401 })
    }

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

    const qrCuenta = anfitrion?.qrCuenta || anfitrion?.imagenQr || anfitrion?.qr || ""
    const rawCuenta = anfitrion?.cuentaBancaria || `${anfitrion?.banco || "Banco"} ${anfitrion?.tipoCuenta || "Ahorros"} ${anfitrion?.numeroCuenta || ""}`
    const formattedCuenta = qrCuenta ? `${rawCuenta} [QR:${qrCuenta}]` : rawCuenta

    const payload: any = {
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
      anfitrion_cuenta_bancaria: formattedCuenta,
      anfitrion_qr_cuenta: qrCuenta,
      monetizacion_modelo: monetizacion?.modelo || "comision_reserva",
      monetizacion_porcentaje_comision: Number(monetizacion?.porcentajeComision) || 15,
      monetizacion_cuota_fija_mensual: Number(monetizacion?.cuotaFijaMensual) || 45,
      monetizacion_total_comisiones: 0,
      updated_at: new Date().toISOString()
    }

      let { data, error } = await supabase
        .from("alojamientos_airbnb")
        .upsert(payload, { onConflict: "codigo" })
        .select()

      // Si la columna anfitrion_qr_cuenta no ha sido creada en la base de datos de Supabase, reintentar sin ella
      if (error && error.message?.includes("anfitrion_qr_cuenta")) {
        delete payload.anfitrion_qr_cuenta
        const retry = await supabase
          .from("alojamientos_airbnb")
          .upsert(payload, { onConflict: "codigo" })
          .select()
        data = retry.data
        error = retry.error
      }

      // Sincronizar también en parametros_globales para respaldo total
      try {
        const { data: globalParam } = await supabase
          .from("parametros_globales")
          .select("id, indirectos_default")
          .limit(1)
          .single()

        if (globalParam?.id) {
          const indirectos = globalParam.indirectos_default || {}
          const listaActual = Array.isArray(indirectos.alojamientos_airbnb) ? [...indirectos.alojamientos_airbnb] : []
          const itemFrontend = {
            id: data?.[0]?.id || payload.id || `stay-${Date.now()}`,
            codigo: payload.codigo,
            titulo: payload.titulo,
            tipo: payload.tipo,
            alcance: payload.alcance,
            pais: payload.pais,
            bandera: payload.bandera,
            ciudad: payload.ciudad,
            sector: payload.sector,
            lat: payload.lat,
            lng: payload.lng,
            precioNoche: payload.precio_noche,
            tarifaLimpieza: payload.tarifa_limpieza,
            rating: 5.0,
            isSuperhost: payload.is_superhost,
            maxHuespedes: payload.max_huespedes,
            habitaciones: payload.habitaciones,
            banos: payload.banos,
            camas: payload.camas,
            imagenUrl: payload.imagen_url,
            imagenes: payload.imagenes,
            videoUrl: payload.video_url,
            amenidades: payload.amenidades,
            descripcion: payload.descripcion,
            reglas: payload.reglas,
            publicado: payload.publicado,
            anfitrion: {
              nombre: payload.anfitrion_nombre,
              telefono: payload.anfitrion_telefono,
              email: payload.anfitrion_email,
              cedulaRuc: payload.anfitrion_cedula_ruc,
              banco: payload.anfitrion_banco,
              tipoCuenta: payload.anfitrion_tipo_cuenta,
              numeroCuenta: payload.anfitrion_numero_cuenta,
              titular: payload.anfitrion_titular,
              cuentaBancaria: payload.anfitrion_cuenta_bancaria,
              qrCuenta: payload.anfitrion_qr_cuenta
            },
            monetizacion: {
              modelo: payload.monetizacion_modelo,
              porcentajeComision: payload.monetizacion_porcentaje_comision,
              cuotaFijaMensual: payload.monetizacion_cuota_fija_mensual,
              totalComisionesGeneradas: 0
            }
          }

          const existingIdx = listaActual.findIndex((x: any) => x.codigo === payload.codigo || x.id === itemFrontend.id)
          if (existingIdx >= 0) {
            listaActual[existingIdx] = itemFrontend
          } else {
            listaActual.unshift(itemFrontend)
          }

          await supabase
            .from("parametros_globales")
            .update({
              indirectos_default: {
                ...indirectos,
                alojamientos_airbnb: listaActual
              },
              updated_at: new Date().toISOString()
            })
            .eq("id", globalParam.id)
        }
      } catch (backupErr) {
        console.warn("Aviso: No se pudo respaldar en parametros_globales:", backupErr)
      }

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
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado. Inicie sesión para eliminar alojamientos." }, { status: 401 })
    }

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

    // Eliminar también del respaldo en parametros_globales
    try {
      const { data: globalParam } = await supabase
        .from("parametros_globales")
        .select("id, indirectos_default")
        .limit(1)
        .single()

      if (globalParam?.id && globalParam.indirectos_default?.alojamientos_airbnb) {
        const filtrada = globalParam.indirectos_default.alojamientos_airbnb.filter(
          (x: any) => (id && x.id !== id) || (codigo && x.codigo !== codigo)
        )
        await supabase
          .from("parametros_globales")
          .update({
            indirectos_default: {
              ...globalParam.indirectos_default,
              alojamientos_airbnb: filtrada
            },
            updated_at: new Date().toISOString()
          })
          .eq("id", globalParam.id)
      }
    } catch (delBackupErr) {
      console.warn("Aviso: Error borrando respaldo en parametros_globales:", delBackupErr)
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Alojamiento eliminado" })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
