import { NextResponse } from "next/server"
import { StaysPolicies, DEFAULT_STAYS_POLICIES } from "@/lib/services/staysPoliciesService"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { canAccessModule } from "@/lib/auth/moduleGuards"

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
      const { data, error } = await supabase
        .from("parametros_globales")
        .select("indirectos_default")
        .eq("id", 1)
        .single()

      if (!error && data?.indirectos_default?.politicas_stays) {
        const dbPolicies = data.indirectos_default.politicas_stays
        const merged: StaysPolicies = {
          ...DEFAULT_STAYS_POLICIES,
          ...dbPolicies,
          porcentajeAnticipo: typeof dbPolicies.porcentajeAnticipo === "number" ? dbPolicies.porcentajeAnticipo : DEFAULT_STAYS_POLICIES.porcentajeAnticipo,
          ivaPorcentaje: typeof dbPolicies.ivaPorcentaje === "number" ? dbPolicies.ivaPorcentaje : DEFAULT_STAYS_POLICIES.ivaPorcentaje,
          penalizacionMas10Dias: typeof dbPolicies.penalizacionMas10Dias === "number" ? dbPolicies.penalizacionMas10Dias : DEFAULT_STAYS_POLICIES.penalizacionMas10Dias,
          penalizacion5a10Dias: typeof dbPolicies.penalizacion5a10Dias === "number" ? dbPolicies.penalizacion5a10Dias : (dbPolicies.penalizacion2a10Dias ?? DEFAULT_STAYS_POLICIES.penalizacion5a10Dias),
          penalizacion2a5Dias: typeof dbPolicies.penalizacion2a5Dias === "number" ? dbPolicies.penalizacion2a5Dias : DEFAULT_STAYS_POLICIES.penalizacion2a5Dias,
          penalizacion24Horas: typeof dbPolicies.penalizacion24Horas === "number" ? dbPolicies.penalizacion24Horas : DEFAULT_STAYS_POLICIES.penalizacion24Horas,
          anfitrionSharePenalizacionMas10Dias: typeof dbPolicies.anfitrionSharePenalizacionMas10Dias === "number" ? dbPolicies.anfitrionSharePenalizacionMas10Dias : DEFAULT_STAYS_POLICIES.anfitrionSharePenalizacionMas10Dias,
          anfitrionSharePenalizacion5a10Dias: typeof dbPolicies.anfitrionSharePenalizacion5a10Dias === "number" ? dbPolicies.anfitrionSharePenalizacion5a10Dias : (dbPolicies.anfitrionSharePenalizacion2a10Dias ?? 50),
          anfitrionSharePenalizacion2a5Dias: typeof dbPolicies.anfitrionSharePenalizacion2a5Dias === "number" ? dbPolicies.anfitrionSharePenalizacion2a5Dias : 50,
          anfitrionSharePenalizacion24Horas: typeof dbPolicies.anfitrionSharePenalizacion24Horas === "number" ? dbPolicies.anfitrionSharePenalizacion24Horas : DEFAULT_STAYS_POLICIES.anfitrionSharePenalizacion24Horas,
        }
        return NextResponse.json({ success: true, policies: merged, origin: "supabase" })
      }
    }

    return NextResponse.json({ success: true, policies: DEFAULT_STAYS_POLICIES, origin: "default" })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, policies: DEFAULT_STAYS_POLICIES }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado. Inicie sesión para modificar políticas." }, { status: 401 })
    }

    const metadata = { ...(user.user_metadata || {}), ...(user.app_metadata || {}) }
    if (!canAccessModule(metadata, 'sara_master') && !canAccessModule(metadata, 'sara_stays')) {
      return NextResponse.json({ error: "Permisos insuficientes. Requiere rol administrativo." }, { status: 403 })
    }

    const body: StaysPolicies = await req.json()
    if (!body || typeof body.porcentajeAnticipo !== "number") {
      return NextResponse.json({ success: false, error: "Datos de políticas incompletos" }, { status: 400 })
    }

    const payload: StaysPolicies = {
      ...DEFAULT_STAYS_POLICIES,
      ...body,
      porcentajeAnticipo: Number(body.porcentajeAnticipo) || DEFAULT_STAYS_POLICIES.porcentajeAnticipo,
      penalizacionMas10Dias: Number(body.penalizacionMas10Dias) || 0,
      penalizacion5a10Dias: Number(body.penalizacion5a10Dias) || 0,
      penalizacion2a5Dias: Number(body.penalizacion2a5Dias) || 0,
      penalizacion24Horas: Number(body.penalizacion24Horas) || 0,
      anfitrionSharePenalizacionMas10Dias: typeof body.anfitrionSharePenalizacionMas10Dias === "number" ? body.anfitrionSharePenalizacionMas10Dias : 50,
      anfitrionSharePenalizacion5a10Dias: typeof body.anfitrionSharePenalizacion5a10Dias === "number" ? body.anfitrionSharePenalizacion5a10Dias : 50,
      anfitrionSharePenalizacion2a5Dias: typeof body.anfitrionSharePenalizacion2a5Dias === "number" ? body.anfitrionSharePenalizacion2a5Dias : 50,
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

    return NextResponse.json({ success: true, saved: true, dbSaved, policies: payload })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
