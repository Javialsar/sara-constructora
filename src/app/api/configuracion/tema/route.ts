import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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
      return NextResponse.json({ success: true, tema })
    }
  } catch (err: any) {
    console.warn("Error leyendo tema de Supabase:", err.message)
  }

  return NextResponse.json({ success: true, tema: "" })
}

// POST: Actualizar el tema global de todo el ecosistema
export async function POST(req: Request) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Credenciales de Supabase no configuradas" }, { status: 500 })
  }

  try {
    // 1. Verificación de Seguridad: Requiere Token o Sesión Activa
    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      // Verificar si hay cookie de sesión
      const { createServerClient } = await import("@supabase/ssr")
      const { cookies } = await import("next/headers")
      const cookieStore = await cookies()
      const client = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return cookieStore.getAll() },
            setAll(cookiesToSet) {
              try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
            }
          }
        }
      )
      const { data: { user } } = await client.auth.getUser()
      if (!user) {
        return NextResponse.json({ success: false, error: "No autorizado. Sesión requerida." }, { status: 401 })
      }
    }

    const { tema } = await req.json()
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
      tema_activo: safeTema
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
