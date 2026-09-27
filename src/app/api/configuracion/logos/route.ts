import { NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { LogosEmpresa, DEFAULT_LOGOS_EMPRESA } from "@/lib/services/logosService"

export const dynamic = "force-dynamic"
export const revalidate = 0

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    if (supabase) {
      // 1. Obtener logos desde indirectos_default en parametros_globales
      const { data: paramData } = await supabase
        .from("parametros_globales")
        .select("indirectos_default")
        .eq("id", 1)
        .single()

      // 2. Obtener logo_url desde configuracion_empresa por compatibilidad
      const { data: configData } = await supabase
        .from("configuracion_empresa")
        .select("logo_url")
        .limit(1)
        .single()

      const dbLogos = paramData?.indirectos_default?.logos_servicios || {}

      const merged: LogosEmpresa = {
        constructora: dbLogos.constructora || configData?.logo_url || DEFAULT_LOGOS_EMPRESA.constructora,
        inmobiliaria: dbLogos.inmobiliaria || DEFAULT_LOGOS_EMPRESA.inmobiliaria,
        stays: dbLogos.stays || DEFAULT_LOGOS_EMPRESA.stays,
      }

      return NextResponse.json({ success: true, logos: merged, origin: "supabase" })
    }

    return NextResponse.json({ success: true, logos: DEFAULT_LOGOS_EMPRESA, origin: "default" })
  } catch (error: any) {
    console.error("Error en GET /api/configuracion/logos:", error)
    return NextResponse.json(
      { success: false, error: error.message, logos: DEFAULT_LOGOS_EMPRESA },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body: Partial<LogosEmpresa> = await req.json()
    if (!body) {
      return NextResponse.json({ success: false, error: "Datos de logos no proporcionados" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Conexión a base de datos no disponible" }, { status: 500 })
    }

    // 1. Leer estado actual de indirectos_default
    const { data: current } = await supabase
      .from("parametros_globales")
      .select("indirectos_default")
      .eq("id", 1)
      .single()

    const currentIndirectos = current?.indirectos_default || {}
    const currentLogos: LogosEmpresa = currentIndirectos.logos_servicios || DEFAULT_LOGOS_EMPRESA

    const updatedLogos: LogosEmpresa = {
      constructora: body.constructora?.trim() || currentLogos.constructora || DEFAULT_LOGOS_EMPRESA.constructora,
      inmobiliaria: body.inmobiliaria?.trim() || currentLogos.inmobiliaria || DEFAULT_LOGOS_EMPRESA.inmobiliaria,
      stays: body.stays?.trim() || currentLogos.stays || DEFAULT_LOGOS_EMPRESA.stays,
    }

    // 2. Guardar en parametros_globales (indirectos_default.logos_servicios)
    const { error: paramError } = await supabase
      .from("parametros_globales")
      .update({
        indirectos_default: {
          ...currentIndirectos,
          logos_servicios: updatedLogos
        }
      })
      .eq("id", 1)

    if (paramError) {
      console.error("Error guardando logos en parametros_globales:", paramError)
      return NextResponse.json({ success: false, error: paramError.message }, { status: 500 })
    }

    // 3. Sincronizar configuracion_empresa.logo_url con el logo de constructora
    const { data: configRecord } = await supabase
      .from("configuracion_empresa")
      .select("id")
      .limit(1)
      .single()

    if (configRecord?.id) {
      await supabase
        .from("configuracion_empresa")
        .update({
          logo_url: updatedLogos.constructora,
          updated_at: new Date().toISOString()
        })
        .eq("id", configRecord.id)
    }

    return NextResponse.json({ success: true, logos: updatedLogos })
  } catch (error: any) {
    console.error("Error en POST /api/configuracion/logos:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
