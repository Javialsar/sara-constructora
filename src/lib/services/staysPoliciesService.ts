import { createClient } from "@/lib/supabase/client"

export interface StaysPolicies {
  porcentajeAnticipo: number // Default 30% (o configurable ej. 40%)
  penalizacionMas10Dias: number // Default 10%
  penalizacion2a10Dias: number // Default 15% (o 20%)
  penalizacion24Horas: number // Default 20% (o 25%)
  
  // Porcentaje de la penalización que se le entrega al anfitrión como compensación:
  anfitrionSharePenalizacionMas10Dias: number // Default 50%
  anfitrionSharePenalizacion2a10Dias: number // Default 50%
  anfitrionSharePenalizacion24Horas: number // Default 50%

  diasReembolso: string // Default "48 a 72 horas laborables"
  metodoDevolucion: string // Default "Transferencia bancaria directa a la cuenta del huésped o reverso de tarjeta"
  ivaPorcentaje: number // Default 15% (Ecuador general: 15%, Feriados turísticos decretados por el Gobierno: 8%, o 12%)
  gastosAdministrativosDescripcion?: string
  actualizadoEn?: string
}

export const DEFAULT_STAYS_POLICIES: StaysPolicies = {
  porcentajeAnticipo: 45, // Según configuración establecida en Base de Datos
  penalizacionMas10Dias: 10,
  penalizacion2a10Dias: 15,
  penalizacion24Horas: 20,
  anfitrionSharePenalizacionMas10Dias: 50,
  anfitrionSharePenalizacion2a10Dias: 50,
  anfitrionSharePenalizacion24Horas: 50,
  diasReembolso: "48 a 72 horas laborables",
  metodoDevolucion: "Transferencia bancaria directa a la cuenta del huésped o reverso de tarjeta.",
  ivaPorcentaje: 15,
  gastosAdministrativosDescripcion: "Gastos Administrativos e IVA sobre comisión SARA Stays (modificable según feriados turísticos gubernamentales)"
}

const STORAGE_KEY = "sara_stays_policies_config"

export async function getStaysPolicies(): Promise<StaysPolicies> {
  // 1. Si estamos en el navegador, consultar la API (que lee de Supabase con permisos de administrador)
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/airbnb/politicas", { cache: "no-store" })
      if (res.ok) {
        const json = await res.json()
        if (json?.policies && typeof json.policies.porcentajeAnticipo === "number") {
          const merged: StaysPolicies = {
            ...DEFAULT_STAYS_POLICIES,
            ...json.policies
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
          return merged
        }
      }
    } catch (err) {
      console.warn("Aviso consultando /api/airbnb/politicas en cliente:", err)
    }

    // Fallback a localStorage en caso de falla de red
    try {
      const local = localStorage.getItem(STORAGE_KEY)
      if (local) {
        const parsed = JSON.parse(local)
        if (parsed && typeof parsed.porcentajeAnticipo === "number") {
          return {
            ...DEFAULT_STAYS_POLICIES,
            ...parsed
          }
        }
      }
    } catch {}
  }

  // 2. Si estamos en servidor, intentar leer de Supabase
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (supabaseUrl && serviceRoleKey) {
      const { createClient: createSupabaseClient } = await import("@supabase/supabase-js")
      const admin = createSupabaseClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
      const { data, error } = await admin
        .from("parametros_globales")
        .select("indirectos_default")
        .eq("id", 1)
        .single()

      if (!error && data?.indirectos_default?.politicas_stays) {
        return {
          ...DEFAULT_STAYS_POLICIES,
          ...data.indirectos_default.politicas_stays
        }
      }
    }
  } catch (err) {
    console.warn("Aviso en getStaysPolicies servidor:", err)
  }

  return DEFAULT_STAYS_POLICIES
}

export async function saveStaysPolicies(policies: StaysPolicies): Promise<boolean> {
  const payload: StaysPolicies = {
    ...policies,
    porcentajeAnticipo: Number(policies.porcentajeAnticipo) || DEFAULT_STAYS_POLICIES.porcentajeAnticipo,
    penalizacionMas10Dias: Number(policies.penalizacionMas10Dias) || 0,
    penalizacion2a10Dias: Number(policies.penalizacion2a10Dias) || 0,
    penalizacion24Horas: Number(policies.penalizacion24Horas) || 0,
    anfitrionSharePenalizacionMas10Dias: typeof policies.anfitrionSharePenalizacionMas10Dias === "number" ? policies.anfitrionSharePenalizacionMas10Dias : 50,
    anfitrionSharePenalizacion2a10Dias: typeof policies.anfitrionSharePenalizacion2a10Dias === "number" ? policies.anfitrionSharePenalizacion2a10Dias : 50,
    anfitrionSharePenalizacion24Horas: typeof policies.anfitrionSharePenalizacion24Horas === "number" ? policies.anfitrionSharePenalizacion24Horas : 50,
    ivaPorcentaje: Number(policies.ivaPorcentaje) || DEFAULT_STAYS_POLICIES.ivaPorcentaje,
    actualizadoEn: new Date().toISOString()
  }

  // 1. Guardar en localStorage inmediatamente
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      window.dispatchEvent(new CustomEvent("sara_stays_policies_updated", { detail: payload }))
    } catch {}
  }

  // 2. Si se ejecuta desde el navegador, llamar también al endpoint API para asegurar persistencia con permisos de servidor
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/airbnb/politicas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        return true
      }
    } catch (err) {
      console.warn("Aviso al invocar /api/airbnb/politicas:", err)
    }
  }

  // 3. Persistir en Supabase directamente (si corre en servidor o como respaldo directo)
  try {
    const supabase = createClient()
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

    if (error) {
      console.warn("Advertencia al guardar políticas en Supabase:", error.message)
      return false
    }

    return true
  } catch (err) {
    console.error("Error guardando políticas en base de datos:", err)
    return false
  }
}
