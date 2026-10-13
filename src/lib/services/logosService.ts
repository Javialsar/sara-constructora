import { createClient } from "@/lib/supabase/client"

export interface LogosEmpresa {
  grupo_sara: string
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
  grupo_sara: "/logo-hero.png",
  constructora: "/images/sara-constructora.png",
  inmobiliaria: "/images/sara-inmobiliaria.png",
  stays: "/images/sara-stays.png",
  apu: "/images/sara-apu.png",
  compras: "/images/sara-grupo.png",
  fletes: "/images/sara-fletes.png",
  talento: "/images/sara-talento.png",
  fintech: "/logo-hero.png",
}

function sanitizeLogoUrl(url: string | undefined | null, fallback: string): string {
  if (!url || typeof url !== "string" || url.trim() === "" || url === "null") return fallback
  return url.trim()
}

export async function getLogosEmpresa(): Promise<LogosEmpresa> {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/configuracion/logos", { cache: "no-store" })
      if (res.ok) {
        const json = await res.json()
        if (json?.success && json?.logos) {
          return {
            grupo_sara: sanitizeLogoUrl(json.logos.grupo_sara, DEFAULT_LOGOS_EMPRESA.grupo_sara),
            constructora: sanitizeLogoUrl(json.logos.constructora, DEFAULT_LOGOS_EMPRESA.constructora),
            inmobiliaria: sanitizeLogoUrl(json.logos.inmobiliaria, DEFAULT_LOGOS_EMPRESA.inmobiliaria),
            stays: sanitizeLogoUrl(json.logos.stays, DEFAULT_LOGOS_EMPRESA.stays),
            apu: sanitizeLogoUrl(json.logos.apu, DEFAULT_LOGOS_EMPRESA.apu),
            compras: sanitizeLogoUrl(json.logos.compras, DEFAULT_LOGOS_EMPRESA.compras),
            fletes: sanitizeLogoUrl(json.logos.fletes, DEFAULT_LOGOS_EMPRESA.fletes),
            talento: sanitizeLogoUrl(json.logos.talento, DEFAULT_LOGOS_EMPRESA.talento),
            fintech: sanitizeLogoUrl(json.logos.fintech, DEFAULT_LOGOS_EMPRESA.fintech),
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
    const { data: configData } = await supabase
      .from("configuracion_empresa")
      .select("logo_url")
      .limit(1)
      .single()

    const corporateLogo = configData?.logo_url || DEFAULT_LOGOS_EMPRESA.grupo_sara

    if (dbLogos) {
      return {
        grupo_sara: dbLogos.grupo_sara || corporateLogo,
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

    if (configData?.logo_url) {
      return {
        ...DEFAULT_LOGOS_EMPRESA,
        grupo_sara: configData.logo_url,
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
