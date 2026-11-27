export type PwaAppId = 
  | "constructora" 
  | "apu" 
  | "marketplace" 
  | "compras" 
  | "fletes" 
  | "fletes-conductor" 
  | "talento" 
  | "inmobiliaria" 
  | "stays" 
  | "financiero";

export interface PwaApp {
  id: PwaAppId;
  name: string;
  shortName: string;
  description: string;
  startUrl: string;
  scope: string;
  themeColor: string;
  backgroundColor: string;
}

export const PWA_APPS: Record<PwaAppId, PwaApp> = {
  constructora: {
    id: "constructora",
    name: "SARA Constructora",
    shortName: "Constructora",
    description: "Gestión técnica, BIM y fiscalización de obras civiles bajo norma NEC-15.",
    startUrl: "/constructora",
    scope: "/constructora/",
    themeColor: "#2563eb",
    backgroundColor: "#020617",
  },
  apu: {
    id: "apu",
    name: "SARA APU & Costos",
    shortName: "SARA APU",
    description: "Análisis de precios unitarios, presupuestos y licitaciones SERCOP.",
    startUrl: "/apu",
    scope: "/apu/",
    themeColor: "#06b6d4",
    backgroundColor: "#020617",
  },
  marketplace: {
    id: "marketplace",
    name: "SARA Marketplace B2B",
    shortName: "SARA Compras",
    description: "Abastecimiento de materiales de construcción con precios de fábrica y 5% IVA.",
    startUrl: "/modulos/compras",
    scope: "/modulos/compras/",
    themeColor: "#f59e0b",
    backgroundColor: "#020617",
  },
  compras: {
    id: "compras",
    name: "SARA Marketplace B2B",
    shortName: "SARA Compras",
    description: "Abastecimiento de materiales de construcción con precios de fábrica y 5% IVA.",
    startUrl: "/modulos/compras",
    scope: "/modulos/compras/",
    themeColor: "#f59e0b",
    backgroundColor: "#020617",
  },
  /**
   * NOTA SOBRE SEPARACIÓN DE PWAs EN SARA-FLETES (Cliente vs Conductor):
   * Debido a que el panel del conductor (/modulos/fletes/conductores) reside bajo el prefijo
   * de ruta de cliente (/modulos/fletes), existe anidamiento de rutas URL. Para garantizar
   * que ambas aplicaciones se instalen y operen de forma independiente (estilo Uber / Uber Driver):
   *   1. Cada PWA declara un `id` de manifiesto único (`/pwa/fletes` vs `/pwa/fletes-conductor`).
   *   2. "SARA Conductor" define el scope más específico `/modulos/fletes/conductores`, el cual
   *      tiene precedencia por coincidencia de prefijo más largo sobre `/modulos/fletes`.
   *   3. Cada ruta enlaza su propio manifiesto mediante su respectivo `layout.tsx`.
   */
  fletes: {
    id: "fletes",
    name: "GoBee",
    shortName: "GoBee",
    description: "GoBee · Un servicio de Grupo Sara. Movilidad urbana (GoBee Go, XL), envíos Express y fletes Cargo con GPS en vivo.",
    startUrl: "/modulos/fletes?source=pwa",
    scope: "/modulos/fletes",
    themeColor: "#FDBE3B",
    backgroundColor: "#FAFAFA",
  },
  "fletes-conductor": {
    id: "fletes-conductor",
    name: "GoBee Conductor",
    shortName: "GoBee Driver",
    description: "App para conductores GoBee (Grupo Sara): radar PostGIS, Backhaul, cierre e-POD y billetera.",
    startUrl: "/modulos/fletes/conductores?source=pwa",
    scope: "/modulos/fletes/conductores",
    themeColor: "#0F172A",
    backgroundColor: "#0F172A",
  },
  talento: {
    id: "talento",
    name: "SARA Talento Humano",
    shortName: "SARA Talento",
    description: "Reclutamiento de cuadrillas, certificaciones SECAP y nómina IESS.",
    startUrl: "/modulos/talento",
    scope: "/modulos/talento/",
    themeColor: "#10b981",
    backgroundColor: "#020617",
  },
  inmobiliaria: {
    id: "inmobiliaria",
    name: "SARA Inmobiliaria",
    shortName: "Inmobiliaria",
    description: "Tasación econométrica IVS, plusvalía y precalificación hipotecaria BIESS.",
    startUrl: "/inmobiliaria",
    scope: "/inmobiliaria/",
    themeColor: "#a855f7",
    backgroundColor: "#020617",
  },
  stays: {
    id: "stays",
    name: "SARA Stays",
    shortName: "SARA Stays",
    description: "Campamentos técnicos, corporate housing y revenue management USALI.",
    startUrl: "/stays",
    scope: "/stays/",
    themeColor: "#f43f5e",
    backgroundColor: "#020617",
  },
  financiero: {
    id: "financiero",
    name: "SARA Pagos & Escrow",
    shortName: "SARA Pagos",
    description: "Fideicomiso Escrow, gobernanza tributaria SRI y monitoreo antilavado UAFE.",
    startUrl: "/modulos/financiero",
    scope: "/modulos/financiero/",
    themeColor: "#14b8a6",
    backgroundColor: "#020617",
  },
};

export function manifestPath(id: PwaAppId) {
  return `/manifests/${id}`;
}
