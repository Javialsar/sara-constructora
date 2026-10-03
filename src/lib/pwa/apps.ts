export type PwaAppId = "constructora" | "apu" | "inmobiliaria" | "stays"

export interface PwaApp {
  id: PwaAppId
  name: string
  shortName: string
  description: string
  startUrl: string
  scope: string
  themeColor: string
  backgroundColor: string
}

export const PWA_APPS: Record<PwaAppId, PwaApp> = {
  constructora: {
    id: "constructora",
    name: "SARA Constructora",
    shortName: "Constructora",
    description: "Gestión técnica y presupuestaria de obras.",
    startUrl: "/dashboard",
    scope: "/dashboard/",
    themeColor: "#1e3a8a",
    backgroundColor: "#ffffff",
  },
  apu: {
    id: "apu",
    name: "SARA APU",
    shortName: "SARA APU",
    description: "Análisis de precios unitarios, rubros e insumos.",
    startUrl: "/dashboard/apus/rubros",
    scope: "/dashboard/apus/",
    themeColor: "#059669",
    backgroundColor: "#ffffff",
  },
  inmobiliaria: {
    id: "inmobiliaria",
    name: "SARA Inmobiliaria",
    shortName: "Inmobiliaria",
    description: "Catálogo de propiedades en venta y arriendo.",
    startUrl: "/inmobiliaria",
    scope: "/inmobiliaria/",
    themeColor: "#d97706",
    backgroundColor: "#020617",
  },
  stays: {
    id: "stays",
    name: "SARA Stays",
    shortName: "SARA Stays",
    description: "Reserva de alojamientos y estancias cortas.",
    startUrl: "/stays",
    scope: "/stays/",
    themeColor: "#f59e0b",
    backgroundColor: "#0f172a",
  },
}

export function manifestPath(id: PwaAppId) {
  return `/manifests/${id}`
}
