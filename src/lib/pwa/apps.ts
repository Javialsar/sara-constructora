export type PwaAppId = 
  | "constructora" 
  | "apu" 
  | "marketplace" 
  | "compras" 
  | "fletes" 
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
  fletes: {
    id: "fletes",
    name: "SARA Fletes Pesados",
    shortName: "SARA Fletes",
    description: "Logística pesada MTOP, cubicación de carga y optimización Backhaul.",
    startUrl: "/modulos/fletes",
    scope: "/modulos/fletes/",
    themeColor: "#f97316",
    backgroundColor: "#020617",
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
