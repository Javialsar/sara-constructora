import { NextResponse } from "next/server"
import { InmobiliariaConfigCompleta, DEFAULT_INMOBILIARIA_CONFIG } from "@/lib/services/inmobiliariaPlanesService"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const revalidate = 0

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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
      const { data, error } = await supabase
        .from("parametros_globales")
        .select("indirectos_default")
        .eq("id", 1)
        .single()

      if (!error && data?.indirectos_default?.planes_inmobiliaria) {
        const dbConfig = data.indirectos_default.planes_inmobiliaria
        const merged: InmobiliariaConfigCompleta = {
          planes: {
            basico: { ...DEFAULT_INMOBILIARIA_CONFIG.planes.basico, ...dbConfig.planes?.basico },
            destacado: { ...DEFAULT_INMOBILIARIA_CONFIG.planes.destacado, ...dbConfig.planes?.destacado },
            premium: { ...DEFAULT_INMOBILIARIA_CONFIG.planes.premium, ...dbConfig.planes?.premium }
          },
          comisiones: { ...DEFAULT_INMOBILIARIA_CONFIG.comisiones, ...dbConfig.comisiones },
          actualizadoEn: dbConfig.actualizadoEn || new Date().toISOString()
        }
        return NextResponse.json({ success: true, config: merged, origin: "supabase" })
      }
    }

    return NextResponse.json({ success: true, config: DEFAULT_INMOBILIARIA_CONFIG, origin: "default" })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, config: DEFAULT_INMOBILIARIA_CONFIG }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body: InmobiliariaConfigCompleta = await req.json()
    if (!body || !body.planes || !body.comisiones) {
      return NextResponse.json({ success: false, error: "Datos de configuración incompletos" }, { status: 400 })
    }

    const payload: InmobiliariaConfigCompleta = {
      planes: {
        basico: {
          ...DEFAULT_INMOBILIARIA_CONFIG.planes.basico,
          ...body.planes.basico,
          precioMensual: Number(body.planes.basico.precioMensual) || 35
        },
        destacado: {
          ...DEFAULT_INMOBILIARIA_CONFIG.planes.destacado,
          ...body.planes.destacado,
          precioMensual: Number(body.planes.destacado.precioMensual) || 65
        },
        premium: {
          ...DEFAULT_INMOBILIARIA_CONFIG.planes.premium,
          ...body.planes.premium,
          precioMensual: Number(body.planes.premium.precioMensual) || 120
        }
      },
      comisiones: {
        ...DEFAULT_INMOBILIARIA_CONFIG.comisiones,
        ...body.comisiones,
        comisionVentaMin: Number(body.comisiones.comisionVentaMin) || 3.0,
        comisionVentaMax: Number(body.comisiones.comisionVentaMax) || 4.0,
        comisionVentaDefault: Number(body.comisiones.comisionVentaDefault) || 3.0,
        porcentajePrimerMes: Number(body.comisiones.porcentajePrimerMes) || 100
      },
      actualizadoEn: new Date().toISOString()
    }

    // Persistir directamente a Supabase con Service Role
    const supabase = getSupabaseAdmin()
    let dbSaved = false
    if (supabase) {
      try {
        const { data: current } = await supabase
          .from("parametros_globales")
          .select("indirectos_default")
          .eq("id", 1)
          .single()

        const currentIndirectos = current?.indirectos_default || {}
        const updatedIndirectos = {
          ...currentIndirectos,
          planes_inmobiliaria: payload
        }

        const { error } = await supabase
          .from("parametros_globales")
          .update({ indirectos_default: updatedIndirectos })
          .eq("id", 1)

        if (!error) {
          dbSaved = true
        } else {
          console.warn("Aviso guardando planes de inmobiliaria en Supabase:", error.message)
        }
      } catch (dbErr) {
        console.warn("Error en Supabase planes inmobiliaria:", dbErr)
      }
    }

    return NextResponse.json({
      success: true,
      config: payload,
      dbSaved
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
