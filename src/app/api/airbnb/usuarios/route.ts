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

// Usuarios de respaldo base
const USUARIOS_BASE = [
  {
    id: "usr-base-01",
    created_at: "2026-09-25T18:30:15.000Z",
    nombre: "Alexandra",
    apellido: "Malacatus",
    cedula: "1103711592",
    telefono: "+593 981804023",
    email: "alexandra.malacatus@gmail.com",
    clave: "SARA2026*Alex",
    estado: "activo",
    ciudadPais: "Cariamanga / Loja, Ecuador"
  },
  {
    id: "usr-base-02",
    created_at: "2026-09-25T21:45:10.000Z",
    nombre: "Clarissa Luciana",
    apellido: "Paredes Sarango",
    cedula: "1102978630",
    telefono: "+593 981804023",
    email: "clarisa.paredes@gmail.com",
    clave: "Paredes*2026",
    estado: "activo",
    ciudadPais: "Loja, Ecuador"
  },
  {
    id: "usr-base-03",
    created_at: "2026-09-24T14:20:00.000Z",
    nombre: "Juan Carlos",
    apellido: "Andrade Vintimilla",
    cedula: "0104829104",
    telefono: "+593 998765432",
    email: "juan.andrade@gmail.com",
    clave: "SaraGuest#78",
    estado: "activo",
    ciudadPais: "Cuenca, Ecuador"
  }
]

// GET: Listar todos los usuarios/huéspedes registrados
export async function GET() {
  const sanitizeUser = (u: any) => {
    const { clave, password, ...safeUser } = u
    return safeUser
  }

  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      const sanitizedBase = USUARIOS_BASE.map(sanitizeUser)
      return NextResponse.json({ usuarios: sanitizedBase, count: sanitizedBase.length })
    }

    const { data, error } = await supabase
      .from("solicitudes_servicio")
      .select("id, nombre, email, telefono, mensaje, estado, created_at")
      .eq("tipo_servicio", "usuario_airbnb")
      .order("created_at", { ascending: false })

    if (error) {
      console.warn("Aviso leyendo usuarios en Supabase:", error.message)
      const sanitizedBase = USUARIOS_BASE.map(sanitizeUser)
      return NextResponse.json({ usuarios: sanitizedBase, count: sanitizedBase.length })
    }

    const dbUsers = (data || []).map((row: any) => {
      let det: any = {}
      try {
        det = typeof row.mensaje === "string" ? JSON.parse(row.mensaje) : (row.mensaje || {})
      } catch {
        det = {}
      }

      return sanitizeUser({
        id: row.id,
        created_at: row.created_at,
        nombre: det.nombre || row.nombre || "Usuario",
        apellido: det.apellido || "",
        cedula: det.cedula || "",
        telefono: det.telefono || row.telefono || "+593",
        email: det.email || row.email || "",
        estado: (det.estado || (row.estado === "bloqueado" ? "bloqueado" : "activo")) as "activo" | "bloqueado",
        ciudadPais: det.ciudadPais || "Ecuador"
      })
    })

    // Unir sin duplicar correos electrónicos
    const emailsInDB = new Set(dbUsers.map(u => u.email.toLowerCase()))
    const baseRestantes = USUARIOS_BASE.filter(u => !emailsInDB.has(u.email.toLowerCase())).map(sanitizeUser)

    const listaCompleta = [...dbUsers, ...baseRestantes]

    return NextResponse.json({ usuarios: listaCompleta, count: listaCompleta.length })
  } catch (err: any) {
    console.error("Error en GET /api/airbnb/usuarios:", err)
    const sanitizedBase = USUARIOS_BASE.map(sanitizeUser)
    return NextResponse.json({ usuarios: sanitizedBase, error: err.message }, { status: 500 })
  }
}

// POST: Registrar un nuevo usuario/huésped
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, apellido, cedula, telefono, email, password, ciudadPais } = body

    if (!nombre || !email || !cedula) {
      return NextResponse.json({ error: "Nombre, email y cédula son requeridos" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const nowIso = new Date().toISOString()
    const detalleUsuario = {
      nombre: nombre.trim(),
      apellido: (apellido || "").trim(),
      cedula: cedula.trim(),
      telefono: telefono || "+593 9",
      email: email.trim().toLowerCase(),
      clave: password || "SARA2026*",
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

// PATCH: Bloquear, activar o generar nueva clave
export async function PATCH(request: Request) {
  try {
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado. Sesión activa requerida." }, { status: 401 })
    }

    const body = await request.json()
    const { id, accion, nuevaClave } = body

    if (!id || !accion) {
      return NextResponse.json({ error: "ID y acción son requeridos" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ success: true, message: "Acción simulada sin backend" })
    }

    // Leer registro actual
    const { data: record, error: fetchErr } = await supabase
      .from("solicitudes_servicio")
      .select("*")
      .eq("id", id)
      .eq("tipo_servicio", "usuario_airbnb")
      .single()

    if (fetchErr || !record) {
      return NextResponse.json({ success: true, message: "Registro procesado" })
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
    } else if (accion === "generar_clave") {
      const claveGen = nuevaClave || `SARA${Math.floor(1000 + Math.random() * 9000)}*Key`
      det.clave = claveGen
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

    const { clave, password, ...safeDet } = det
    return NextResponse.json({ success: true, det: safeDet, estado: nuevoEstado })
  } catch (err: any) {
    console.error("Error en PATCH /api/airbnb/usuarios:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE: Eliminar usuario
export async function DELETE(request: Request) {
  try {
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado. Sesión activa requerida." }, { status: 401 })
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
