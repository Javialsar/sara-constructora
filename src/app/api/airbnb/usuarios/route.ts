import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { canAccessModule } from "@/lib/auth/moduleGuards"

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

// GET: Listar usuarios/huéspedes registrados (Protegido para administradores)
export async function GET() {
  try {
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "No autorizado. Inicie sesión para ver la lista de usuarios." }, { status: 401 })
    }

    const metadata = { ...(user.user_metadata || {}), ...(user.app_metadata || {}) }
    if (!canAccessModule(metadata, 'sara_master') && !canAccessModule(metadata, 'sara_stays')) {
      return NextResponse.json({ error: "Permisos insuficientes. Requiere rol administrativo." }, { status: 403 })
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ usuarios: [], count: 0, origen: "sin_credenciales" })
    }

    const { data, error } = await supabase
      .from("solicitudes_servicio")
      .select("id, nombre, email, telefono, mensaje, estado, created_at")
      .eq("tipo_servicio", "usuario_airbnb")
      .order("created_at", { ascending: false })

    if (error) {
      console.warn("Aviso leyendo usuarios en Supabase:", error.message)
      return NextResponse.json({ usuarios: [], error: error.message }, { status: 500 })
    }

    const dbUsers = (data || []).map((row: any) => {
      let det: any = {}
      try {
        det = typeof row.mensaje === "string" ? JSON.parse(row.mensaje) : (row.mensaje || {})
      } catch {
        det = {}
      }

      // NUNCA exponer campos de contraseñas
      const { clave, password, token, ...safeDet } = det

      return {
        id: row.id,
        created_at: row.created_at,
        nombre: safeDet.nombre || row.nombre || "Usuario",
        apellido: safeDet.apellido || "",
        cedula: safeDet.cedula || "",
        telefono: safeDet.telefono || row.telefono || "+593",
        email: safeDet.email || row.email || "",
        estado: (safeDet.estado || (row.estado === "bloqueado" ? "bloqueado" : "activo")) as "activo" | "bloqueado",
        ciudadPais: safeDet.ciudadPais || "Ecuador"
      }
    })

    return NextResponse.json({ usuarios: dbUsers, count: dbUsers.length })
  } catch (err: any) {
    console.error("Error en GET /api/airbnb/usuarios:", err)
    return NextResponse.json({ usuarios: [], error: err.message }, { status: 500 })
  }
}

// POST: Registrar un nuevo usuario/huésped
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, apellido, cedula, telefono, email, ciudadPais } = body

    if (!nombre || !email || !cedula) {
      return NextResponse.json({ error: "Nombre, email y cédula son requeridos" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const nowIso = new Date().toISOString()
    
    // NUNCA almacenar contraseñas en texto plano dentro de la columna mensaje
    const detalleUsuario = {
      nombre: nombre.trim(),
      apellido: (apellido || "").trim(),
      cedula: cedula.trim(),
      telefono: telefono || "+593 9",
      email: email.trim().toLowerCase(),
      estado: "activo",
      ciudadPais: ciudadPais || "Ecuador",
      created_at: nowIso
    }

    if (!supabase) {
      return NextResponse.json({ success: true, usuario: { id: `local-${Date.now()}`, ...detalleUsuario } })
    }

    const { data, error } = await supabase
      .from("solicitudes_servicio")
      .insert([
        {
          nombre: `${nombre.trim()} ${(apellido || "").trim()}`.trim(),
          email: email.trim().toLowerCase(),
          telefono: telefono || "+593 9",
          tipo_servicio: "usuario_airbnb",
          mensaje: JSON.stringify(detalleUsuario, null, 2),
          estado: "activo"
        }
      ])
      .select()

    if (error) {
      console.error("Error guardando usuario en Supabase:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      usuario: { id: data?.[0]?.id || `usr-${Date.now()}`, ...detalleUsuario }
    })
  } catch (err: any) {
    console.error("Error en POST /api/airbnb/usuarios:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH: Bloquear o activar usuario (Requiere rol administrador)
export async function PATCH(request: Request) {
  try {
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado. Sesión activa requerida." }, { status: 401 })
    }

    const metadata = { ...(user.user_metadata || {}), ...(user.app_metadata || {}) }
    if (!canAccessModule(metadata, 'sara_master') && !canAccessModule(metadata, 'sara_stays')) {
      return NextResponse.json({ error: "Permisos insuficientes." }, { status: 403 })
    }

    const body = await request.json()
    const { id, accion } = body

    if (!id || !accion) {
      return NextResponse.json({ error: "ID y acción son requeridos" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ success: true, message: "Acción simulada sin backend" })
    }

    const { data: record, error: fetchErr } = await supabase
      .from("solicitudes_servicio")
      .select("*")
      .eq("id", id)
      .eq("tipo_servicio", "usuario_airbnb")
      .single()

    if (fetchErr || !record) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    let det: any = {}
    try {
      det = typeof record.mensaje === "string" ? JSON.parse(record.mensaje) : (record.mensaje || {})
    } catch {
      det = {}
    }

    let nuevoEstado = record.estado || "activo"
    if (accion === "bloquear") {
      nuevoEstado = "bloqueado"
      det.estado = "bloqueado"
    } else if (accion === "activar") {
      nuevoEstado = "activo"
      det.estado = "activo"
    }

    const { error: updateErr } = await supabase
      .from("solicitudes_servicio")
      .update({
        estado: nuevoEstado,
        mensaje: JSON.stringify(det, null, 2)
      })
      .eq("id", id)
      .eq("tipo_servicio", "usuario_airbnb")

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, estado: nuevoEstado })
  } catch (err: any) {
    console.error("Error en PATCH /api/airbnb/usuarios:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE: Eliminar usuario (Requiere rol administrador)
export async function DELETE(request: Request) {
  try {
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado. Sesión activa requerida." }, { status: 401 })
    }

    const metadata = { ...(user.user_metadata || {}), ...(user.app_metadata || {}) }
    if (!canAccessModule(metadata, 'sara_master')) {
      return NextResponse.json({ error: "Permisos insuficientes." }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID es requerido" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ success: true, message: "Eliminado local" })
    }

    const { error } = await supabase
      .from("solicitudes_servicio")
      .delete()
      .eq("id", id)
      .eq("tipo_servicio", "usuario_airbnb")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Usuario eliminado con éxito" })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
