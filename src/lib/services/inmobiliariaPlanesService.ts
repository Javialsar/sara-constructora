export interface PlanInmobiliariaConfig {
  id: "basico" | "destacado" | "premium"
  nombre: string
  precioMensual: number
  diasDuracion: number
  descripcion: string
  color: string
  beneficios: string[]
}

export interface ComisionesInmobiliariaConfig {
  comisionVentaMin: number
  comisionVentaMax: number
  comisionVentaDefault: number
  comisionVentaExclusiva: number
  descripcionVenta: string

  tipoComisionArriendo: "primer_canon" | "porcentaje"
  porcentajePrimerMes: number
  comisionArriendoPorcentaje: number
  descripcionArriendo: string

  porcentajeCompartidoSara: number
  porcentajeCompartidoExterno: number

  diasVigenciaContrato: number
  ivaComisionPorcentaje: number
}

export interface InmobiliariaConfigCompleta {
  planes: {
    basico: PlanInmobiliariaConfig
    destacado: PlanInmobiliariaConfig
    premium: PlanInmobiliariaConfig
  }
  comisiones: ComisionesInmobiliariaConfig
  actualizadoEn?: string
}

export const DEFAULT_INMOBILIARIA_CONFIG: InmobiliariaConfigCompleta = {
  planes: {
    basico: {
      id: "basico",
      nombre: "Plan Básico",
      precioMensual: 35,
      diasDuracion: 30,
      descripcion: "Presencia estándar en portal web SARA y ficha técnica pública.",
      color: "gray",
      beneficios: [
        "Publicación activa por 30 días",
        "Ficha técnica con fotos y georreferenciación",
        "Contacto directo por WhatsApp",
        "Filtros de búsqueda estándar"
      ]
    },
    destacado: {
      id: "destacado",
      nombre: "Plan Destacado",
      precioMensual: 65,
      diasDuracion: 30,
      descripcion: "Posicionamiento prioritario en catálogo y difusión en redes sociales.",
      color: "amber",
      beneficios: [
        "Posicionamiento prioritario en resultados",
        "Insignia destacada en catálogo y mapa",
        "Difusión en redes sociales SARA (Meta / Instagram)",
        "Envío a base de datos de compradores calificados",
        "Soporte comercial para coordinar visitas"
      ]
    },
    premium: {
      id: "premium",
      nombre: "Plan Premium Exclusiva",
      precioMensual: 120,
      diasDuracion: 30,
      descripcion: "Máxima visibilidad, pauta digital segmentada y producción audiovisual.",
      color: "emerald",
      beneficios: [
        "Aparición en Showcase Cinemático superior de portada",
        "Campaña de pauta digital pagada en Meta Ads",
        "Reportaje fotográfico profesional y video drone",
        "Asignación de asesor inmobiliario exclusivo",
        "Gestión legal y fiduciaria con promesa de compraventa"
      ]
    }
  },
  comisiones: {
    comisionVentaMin: 3.0,
    comisionVentaMax: 4.0,
    comisionVentaDefault: 3.0,
    comisionVentaExclusiva: 3.5,
    descripcionVenta: "Porcentaje sobre el valor final de cierre de la compraventa formalizada ante Notaría y Registro de la Propiedad.",

    tipoComisionArriendo: "primer_canon",
    porcentajePrimerMes: 100,
    comisionArriendoPorcentaje: 10,
    descripcionArriendo: "Equivalente al 100% del primer canon de arriendo mensual pactado en el contrato de arrendamiento.",

    porcentajeCompartidoSara: 50,
    porcentajeCompartidoExterno: 50,

    diasVigenciaContrato: 180,
    ivaComisionPorcentaje: 15
  },
  actualizadoEn: new Date().toISOString()
}

const STORAGE_KEY = "sara_inmobiliaria_config_planes"

export async function getInmobiliariaConfig(): Promise<InmobiliariaConfigCompleta> {
  // 1. Intentar cargar desde API / Base de datos Supabase
  try {
    const res = await fetch(`/api/inmobiliaria/planes?t=${Date.now()}`, {
      cache: "no-store"
    })
    if (res.ok) {
      const data = await res.json()
      if (data.success && data.config) {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.config))
        }
        return data.config
      }
    }
  } catch (err) {
    console.warn("Aviso: no se pudo cargar planes de inmobiliaria desde API:", err)
  }

  // 2. Intentar localStorage
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          planes: {
            basico: { ...DEFAULT_INMOBILIARIA_CONFIG.planes.basico, ...parsed.planes?.basico },
            destacado: { ...DEFAULT_INMOBILIARIA_CONFIG.planes.destacado, ...parsed.planes?.destacado },
            premium: { ...DEFAULT_INMOBILIARIA_CONFIG.planes.premium, ...parsed.planes?.premium }
          },
          comisiones: { ...DEFAULT_INMOBILIARIA_CONFIG.comisiones, ...parsed.comisiones },
          actualizadoEn: parsed.actualizadoEn
        }
      }
    } catch {
      // Ignorar fallback
    }
  }

  return DEFAULT_INMOBILIARIA_CONFIG
}

export async function saveInmobiliariaConfig(config: InmobiliariaConfigCompleta): Promise<{ success: boolean; error?: string }> {
  const payload: InmobiliariaConfigCompleta = {
    ...config,
    actualizadoEn: new Date().toISOString()
  }

  // Guardar en localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    window.dispatchEvent(new CustomEvent("sara_inmobiliaria_config_updated", { detail: payload }))
  }

  // Guardar en base de datos vía API Route
  try {
    const res = await fetch("/api/inmobiliaria/planes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    return { success: data.success ?? true, error: data.error }
  } catch (err: any) {
    console.warn("Aviso guardando configuración vía API:", err)
    return { success: true }
  }
}
