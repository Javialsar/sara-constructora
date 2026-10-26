import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { SOLICITUDES_INICIALES, SolicitudInmobiliaria } from "@/lib/services/solicitudesInmobiliariaService"

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function GET() {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ success: true, solicitudes: SOLICITUDES_INICIALES, source: "default" })
  }

  try {
    const { data, error } = await supabase
      .from("parametros_globales")
      .select("indirectos_default")
      .limit(1)
      .single()

    if (!error && data?.indirectos_default?.solicitudes_inmobiliaria) {
      return NextResponse.json({
        success: true,
        solicitudes: data.indirectos_default.solicitudes_inmobiliaria,
        source: "supabase"
      })
    }
  } catch (err: any) {
    console.warn("Error leyendo solicitudes de Supabase:", err.message)
  }

  return NextResponse.json({ success: true, solicitudes: SOLICITUDES_INICIALES, source: "default" })
}

export async function POST(req: Request) {
  const supabase = getSupabaseAdmin()
  let body: { solicitudes: SolicitudInmobiliaria[] }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: "Cuerpo JSON inválido" }, { status: 400 })
  }

  if (!supabase) {
    return NextResponse.json({ success: true, source: "memory_only" })
  }

  try {
    const { data: existing } = await supabase
      .from("parametros_globales")
      .select("id, indirectos_default")
      .limit(1)
      .single()

    if (existing?.id) {
      const mergedIndirectos = {
        ...(existing.indirectos_default || {}),
        solicitudes_inmobiliaria: body.solicitudes
      }

      const { error: updateError } = await supabase
        .from("parametros_globales")
        .update({
          indirectos_default: mergedIndirectos,
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id)

      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, source: "supabase" })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
