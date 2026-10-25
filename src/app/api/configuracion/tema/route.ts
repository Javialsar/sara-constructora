import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/lib/supabase-server"

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export const dynamic = "force-dynamic"
export const revalidate = 0

// GET: Obtener el tema global activo del ecosistema
export async function GET() {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ success: true, tema: "" })
  }

  try {
    const { data, error } = await supabase
      .from("parametros_globales")
      .select("id, indirectos_default")
      .limit(1)
      .single()

    if (!error && data?.indirectos_default) {
      const tema = data.indirectos_default.tema_activo || ""
      const modulos = data.indirectos_default.temas_modulos || null
      return NextResponse.json({ success: true, tema, modulos })
    }
  } catch (err: any) {
    console.warn("Error leyendo tema de Supabase:", err.message)
  }

  return NextResponse.json({ success: true, tema: "", modulos: null })
}

// POST: Actualizar el tema global de todo el ecosistema
export async function POST(req: Request) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Credenciales de Supabase no configuradas" }, { status: 500 })
  }

  try {
    // 1. Verificación de Seguridad Zero-Trust: Requiere Sesión Activa de Administrador
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "No autorizado. Sesión de administrador requerida." }, { status: 401 })
    }
    const role = user.app_metadata?.role || user.user_metadata?.role || ""
    const isAdmin = Boolean(user.app_metadata?.es_admin || user.user_metadata?.es_admin || role === "admin" || role === "superadmin" || role === "tecnico")
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: "Acceso denegado. Se requieren privilegios de administrador." }, { status: 403 })
    }

    const { tema, modulos } = await req.json()
    const safeTema = typeof tema === "string" ? tema.trim() : ""

    const { data: globalParam, error: fetchErr } = await supabase
      .from("parametros_globales")
      .select("id, indirectos_default")
      .limit(1)
      .single()

    if (fetchErr || !globalParam?.id) {
      return NextResponse.json({ success: false, error: "Registro parametros_globales no encontrado" }, { status: 404 })
    }

    const indirectos = globalParam.indirectos_default || {}
    const updatedIndirectos = {
      ...indirectos,
      ...(safeTema ? { tema_activo: safeTema } : {}),
      ...(modulos && typeof modulos === "object" ? { temas_modulos: modulos } : {})
    }

    const { error: updateErr } = await supabase
      .from("parametros_globales")
      .update({
        indirectos_default: updatedIndirectos,
        updated_at: new Date().toISOString()
      })
      .eq("id", globalParam.id)

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      tema: safeTema,
      message: "Tema global del ecosistema actualizado y persistido en Supabase"
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
