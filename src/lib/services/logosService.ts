import { createClient } from "@/lib/supabase/client"

export interface LogosEmpresa {
  constructora: string
  inmobiliaria: string
  stays: string
  apu: string
  compras: string
  fletes: string
  talento: string
  fintech: string
}

export const DEFAULT_LOGOS_EMPRESA: LogosEmpresa = {
  constructora: "/logo-hero.png",
  inmobiliaria: "/sara-inmobiliaria.png",
  stays: "/sara-stays.png",
  apu: "/logo-hero.png",
  compras: "/logo-hero.png",
  fletes: "/logo-hero.png",
  talento: "/logo-hero.png",
  fintech: "/logo-hero.png",
}

export async function getLogosEmpresa(): Promise<LogosEmpresa> {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/configuracion/logos", { cache: "no-store" })
      if (res.ok) {
        const json = await res.json()
        if (json?.success && json?.logos) {
          return {
            constructora: json.logos.constructora || DEFAULT_LOGOS_EMPRESA.constructora,
            inmobiliaria: json.logos.inmobiliaria || DEFAULT_LOGOS_EMPRESA.inmobiliaria,
            stays: json.logos.stays || DEFAULT_LOGOS_EMPRESA.stays,
            apu: json.logos.apu || DEFAULT_LOGOS_EMPRESA.apu,
            compras: json.logos.compras || DEFAULT_LOGOS_EMPRESA.compras,
            fletes: json.logos.fletes || DEFAULT_LOGOS_EMPRESA.fletes,
            talento: json.logos.talento || DEFAULT_LOGOS_EMPRESA.talento,
            fintech: json.logos.fintech || DEFAULT_LOGOS_EMPRESA.fintech,
          }
        }
      }
    }
  } catch (err) {
    console.warn("Fallo fetch logos via API, reintentando via Supabase client:", err)
  }

  // Fallback con cliente Supabase
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from("parametros_globales")
      .select("indirectos_default")
      .eq("id", 1)
      .single()

    const dbLogos = data?.indirectos_default?.logos_servicios
    if (dbLogos) {
      return {
        constructora: dbLogos.constructora || DEFAULT_LOGOS_EMPRESA.constructora,
        inmobiliaria: dbLogos.inmobiliaria || DEFAULT_LOGOS_EMPRESA.inmobiliaria,
        stays: dbLogos.stays || DEFAULT_LOGOS_EMPRESA.stays,
        apu: dbLogos.apu || DEFAULT_LOGOS_EMPRESA.apu,
        compras: dbLogos.compras || DEFAULT_LOGOS_EMPRESA.compras,
        fletes: dbLogos.fletes || DEFAULT_LOGOS_EMPRESA.fletes,
        talento: dbLogos.talento || DEFAULT_LOGOS_EMPRESA.talento,
        fintech: dbLogos.fintech || DEFAULT_LOGOS_EMPRESA.fintech,
      }
    }

    const { data: configData } = await supabase
      .from("configuracion_empresa")
      .select("logo_url")
      .limit(1)
      .single()

    if (configData?.logo_url) {
      return {
        ...DEFAULT_LOGOS_EMPRESA,
        constructora: configData.logo_url,
      }
    }
  } catch (err) {
    console.error("Error al obtener logos:", err)
  }

  return DEFAULT_LOGOS_EMPRESA
}

export async function saveLogosEmpresa(logos: Partial<LogosEmpresa>): Promise<boolean> {
  try {
    const res = await fetch("/api/configuracion/logos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logos),
    })
    const json = await res.json()
    return !!json.success
  } catch (err) {
    console.error("Error al guardar logos via API:", err)
    return false
  }
}
