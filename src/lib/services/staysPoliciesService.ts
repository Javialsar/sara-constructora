import { createClient } from "@/lib/supabase/client"

export interface StaysPolicies {
  porcentajeAnticipo: number // Default 30
  penalizacionMas10Dias: number // Default 10
  penalizacion2a10Dias: number // Default 15
  penalizacion24Horas: number // Default 20
  diasReembolso: string // Default "48 a 72 horas laborables"
  metodoDevolucion: string // Default "Transferencia bancaria directa a la cuenta del huésped o reverso de tarjeta"
  actualizadoEn?: string
}

export const DEFAULT_STAYS_POLICIES: StaysPolicies = {
  porcentajeAnticipo: 30,
  penalizacionMas10Dias: 10,
  penalizacion2a10Dias: 15,
  penalizacion24Horas: 20,
  diasReembolso: "48 a 72 horas laborables",
  metodoDevolucion: "Transferencia bancaria directa a la cuenta del huésped o reverso de tarjeta."
}

const STORAGE_KEY = "sara_stays_policies_config"

export async function getStaysPolicies(): Promise<StaysPolicies> {
  // 1. Intentar desde Supabase (parametros_globales -> indirectos_default.politicas_stays)
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("parametros_globales")
      .select("indirectos_default")
      .eq("id", 1)
      .single()

    if (!error && data?.indirectos_default?.politicas_stays) {
      const dbPolicies = data.indirectos_default.politicas_stays
      if (typeof dbPolicies.porcentajeAnticipo === "number") {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dbPolicies))
        }
        return {
          ...DEFAULT_STAYS_POLICIES,
          ...dbPolicies
        }
      }
    }
  } catch (err) {
    console.warn("Aviso consultando políticas de Supabase, evaluando fallback:", err)
  }

  // 2. Fallback a localStorage en cliente
  if (typeof window !== "undefined") {
    try {
      const local = localStorage.getItem(STORAGE_KEY)
      if (local) {
        const parsed = JSON.parse(local)
        if (parsed && typeof parsed.porcentajeAnticipo === "number") {
          return { ...DEFAULT_STAYS_POLICIES, ...parsed }
        }
      }
    } catch {}
  }

  return DEFAULT_STAYS_POLICIES
}

export async function saveStaysPolicies(policies: StaysPolicies): Promise<boolean> {
  const payload: StaysPolicies = {
    ...policies,
    actualizadoEn: new Date().toISOString()
  }

  // 1. Guardar en localStorage inmediatamente
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      window.dispatchEvent(new CustomEvent("sara_stays_policies_updated", { detail: payload }))
    } catch {}
  }

  // 2. Persistir en Supabase
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
