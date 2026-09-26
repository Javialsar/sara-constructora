import { NextResponse } from "next/server"
import { getStaysPolicies, saveStaysPolicies, StaysPolicies, DEFAULT_STAYS_POLICIES } from "@/lib/services/staysPoliciesService"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

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
    const policies = await getStaysPolicies()
    return NextResponse.json({ success: true, policies })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body: StaysPolicies = await req.json()
    if (!body || typeof body.porcentajeAnticipo !== "number") {
      return NextResponse.json({ success: false, error: "Datos de políticas incompletos" }, { status: 400 })
    }

    const payload: StaysPolicies = {
      ...DEFAULT_STAYS_POLICIES,
      ...body,
      porcentajeAnticipo: Number(body.porcentajeAnticipo) || DEFAULT_STAYS_POLICIES.porcentajeAnticipo,
      penalizacionMas10Dias: Number(body.penalizacionMas10Dias) || 0,
      penalizacion2a10Dias: Number(body.penalizacion2a10Dias) || 0,
      penalizacion24Horas: Number(body.penalizacion24Horas) || 0,
      anfitrionSharePenalizacionMas10Dias: typeof body.anfitrionSharePenalizacionMas10Dias === "number" ? body.anfitrionSharePenalizacionMas10Dias : 50,
      anfitrionSharePenalizacion2a10Dias: typeof body.anfitrionSharePenalizacion2a10Dias === "number" ? body.anfitrionSharePenalizacion2a10Dias : 50,
      anfitrionSharePenalizacion24Horas: typeof body.anfitrionSharePenalizacion24Horas === "number" ? body.anfitrionSharePenalizacion24Horas : 50,
      ivaPorcentaje: Number(body.ivaPorcentaje) || DEFAULT_STAYS_POLICIES.ivaPorcentaje,
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
          politicas_stays: payload
        }

        const { error } = await supabase
          .from("parametros_globales")
          .update({ indirectos_default: updatedIndirectos })
          .eq("id", 1)

        if (!error) {
          dbSaved = true
        } else {
          console.warn("Aviso guardando en Supabase via API route:", error.message)
        }
      } catch (dbErr) {
        console.warn("Error en Supabase via API route:", dbErr)
      }
    }

    // Guardar también con el servicio local
    await saveStaysPolicies(payload)

    return NextResponse.json({ success: true, saved: true, dbSaved, policies: payload })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
