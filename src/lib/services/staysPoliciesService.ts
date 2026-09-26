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
  porcentajeAnticipo: 30,
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
        const merged: StaysPolicies = {
          ...DEFAULT_STAYS_POLICIES,
          ...dbPolicies,
          ivaPorcentaje: typeof dbPolicies.ivaPorcentaje === "number" ? dbPolicies.ivaPorcentaje : DEFAULT_STAYS_POLICIES.ivaPorcentaje,
          anfitrionSharePenalizacionMas10Dias: typeof dbPolicies.anfitrionSharePenalizacionMas10Dias === "number" ? dbPolicies.anfitrionSharePenalizacionMas10Dias : DEFAULT_STAYS_POLICIES.anfitrionSharePenalizacionMas10Dias,
          anfitrionSharePenalizacion2a10Dias: typeof dbPolicies.anfitrionSharePenalizacion2a10Dias === "number" ? dbPolicies.anfitrionSharePenalizacion2a10Dias : DEFAULT_STAYS_POLICIES.anfitrionSharePenalizacion2a10Dias,
          anfitrionSharePenalizacion24Horas: typeof dbPolicies.anfitrionSharePenalizacion24Horas === "number" ? dbPolicies.anfitrionSharePenalizacion24Horas : DEFAULT_STAYS_POLICIES.anfitrionSharePenalizacion24Horas,
        }
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
        }
        return merged
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
          return {
            ...DEFAULT_STAYS_POLICIES,
            ...parsed,
            ivaPorcentaje: typeof parsed.ivaPorcentaje === "number" ? parsed.ivaPorcentaje : DEFAULT_STAYS_POLICIES.ivaPorcentaje,
            anfitrionSharePenalizacionMas10Dias: typeof parsed.anfitrionSharePenalizacionMas10Dias === "number" ? parsed.anfitrionSharePenalizacionMas10Dias : DEFAULT_STAYS_POLICIES.anfitrionSharePenalizacionMas10Dias,
            anfitrionSharePenalizacion2a10Dias: typeof parsed.anfitrionSharePenalizacion2a10Dias === "number" ? parsed.anfitrionSharePenalizacion2a10Dias : DEFAULT_STAYS_POLICIES.anfitrionSharePenalizacion2a10Dias,
            anfitrionSharePenalizacion24Horas: typeof parsed.anfitrionSharePenalizacion24Horas === "number" ? parsed.anfitrionSharePenalizacion24Horas : DEFAULT_STAYS_POLICIES.anfitrionSharePenalizacion24Horas,
          }
        }
      }
    } catch {}
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
