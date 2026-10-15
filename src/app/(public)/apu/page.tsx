"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Calculator, 
  Layers, 
  Box, 
  FileSpreadsheet, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Download, 
  TrendingUp, 
  Sliders, 
  Database, 
  Building2,
  ChevronRight,
  HardHat,
  Cpu,
  Clock,
  FileCheck,
  Check,
  Flame,
  ArrowUpRight,
  Bot,
  Brain,
  Network,
  Zap,
  Shield,
  AlertCircle,
  X,
  Search,
  FileText,
  CheckCheck,
  Truck,
  Users,
  Home,
  Bed,
  CreditCard,
  Cuboid,
  RefreshCw,
  BarChart3,
  HelpCircle,
  Copy,
  Printer,
  ExternalLink,
  Activity
} from "lucide-react"
import ModuloIntroSplash from "@/components/ui/ModuloIntroSplash"
import { getLogosEmpresa, DEFAULT_LOGOS_EMPRESA } from "@/lib/services/logosService"

// Definición de Tipos para la Red Agéntica
interface AgenteSara {
  id: string
  nombre: string
  alias: string
  rol: string
  icono: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  mision: string
  flujoEventos: { evento: string; accion: string; tiempo: string }[]
  metricas: {
    precision: string
    tiempoRespuesta: string
    eventosCoordinados: number
    memoriaCompartida: string
    fuentePrimaria: string
  }
  capacidades: string[]
}

export default function SaraApuLandingPage() {
  const [logoApu, setLogoApu] = useState(DEFAULT_LOGOS_EMPRESA.apu)
  const [activeTabApu, setActiveTabApu] = useState<"estructura" | "acabados" | "vial">("estructura")

  // Estado para la Red Agéntica Colectiva
  const [selectedAgentId, setSelectedAgentId] = useState<string>("apu")
  const [activeAgentModal, setActiveAgentModal] = useState<AgenteSara | null>(null)

  // Estado para el Co-Piloto Asesor
  const [activeCopilotQueryIndex, setActiveCopilotQueryIndex] = useState<number>(0)
  const [copilotCustomQuery, setCopilotCustomQuery] = useState<string>("")
  const [copilotThinking, setCopilotThinking] = useState<boolean>(false)
  const [showProveedorModal, setShowProveedorModal] = useState<boolean>(false)
  const [showReporteModal, setShowReporteModal] = useState<boolean>(false)

  // Estado para SARA-AI-Rubros (NLP + Aislamiento)
  const [aiRubroPrompt, setAiRubroPrompt] = useState<string>(
    "Muro de contención de hormigón ciclópeo f'c=180 kg/cm² H=3.2m con piedra bola 60% y drenes PVC en Loja"
  )
  const [isGeneratingAiRubro, setIsGeneratingAiRubro] = useState<boolean>(false)
  const [aiRubroCopied, setAiRubroCopied] = useState<boolean>(false)

  // Estado para el Cotizador Paramétrico Rápido 2026
  const [cotizadorProvincia, setCotizadorProvincia] = useState<"Pichincha" | "Guayas" | "Azuay" | "Loja" | "Manabí">("Pichincha")
  const [cotizadorTipologia, setCotizadorTipologia] = useState<"unifamiliar" | "edificio" | "industrial" | "vial">("unifamiliar")
  const [cotizadorArea, setCotizadorArea] = useState<number>(160)
  const [cotizadorCalidad, setCotizadorCalidad] = useState<"economico" | "estandar" | "premium">("estandar")
  const [showCalibracionModal, setShowCalibracionModal] = useState<boolean>(false)
  const [calibracionStep, setCalibracionStep] = useState<number>(1)

  useEffect(() => {
    getLogosEmpresa().then((logos) => {
      if (logos?.apu) setLogoApu(logos.apu)
    })
  }, [])

  // Cerrar modales con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveAgentModal(null)
        setShowProveedorModal(false)
        setShowReporteModal(false)
        setShowCalibracionModal(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Lista oficial de los 8 Agentes Colectivos de SARA
  const agentesColectivos: AgenteSara[] = [
    {
      id: "constructora",
      nombre: "SARA-Constructora",
      alias: "Orquestador Maestro",
      rol: "Dirección Técnica de Obra & WBS",
      icono: HardHat,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      mision: "Sincroniza la estructura de desglose de trabajo (WBS), cronogramas valorados y control de avance físico con los presupuestos contractuales.",
      flujoEventos: [
        { evento: "PROYECTO_CREADO", accion: "Genera WBS y fases de obra", tiempo: "T+0s" },
        { evento: "AVANCE_REGISTRADO", accion: "Audita cumplimiento de rendimientos", tiempo: "T+2m" },
        { evento: "DESVIACION_DETECTADA", accion: "Notifica a SARA-APU y SARA-Pagos", tiempo: "T+5m" }
      ],
      metricas: {
        precision: "99.8%",
        tiempoRespuesta: "140ms",
        eventosCoordinados: 2450,
        memoriaCompartida: "14.2 MB",
        fuentePrimaria: "Planos IFC / Normativa NEC-15"
      },
      capacidades: [
        "Planificación automatizada de hitos y ruta crítica (CPM)",
        "Detección preventiva de cuellos de botella en obra",
        "Generación de reportes semanales de rendimiento de cuadrillas"
      ]
    },
    {
      id: "apu",
      nombre: "SARA-APU",
      alias: "Motor de Costos & Precios",
      rol: "Ingeniería de Costos & Fórmulas Polinómicas",
      icono: Calculator,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      mision: "Calcula y audita el costo directo, desglose de indirectos AIU, rendimientos y reajustes polinómicos en cumplimiento estricto con SERCOP y MTOP.",
      flujoEventos: [
        { evento: "APU_SOLICITADO", accion: "Analiza composición de insumos y cuadrillas", tiempo: "T+0s" },
        { evento: "INDIRECTOS_AIU_CALCULADOS", accion: "Integra costos fijos y contingencias", tiempo: "T+1s" },
        { evento: "POLINOMICA_GENERADA", accion: "Genera cuadrícula de coeficientes SERCOP", tiempo: "T+3s" }
      ],
      metricas: {
        precision: "99.9%",
        tiempoRespuesta: "115ms",
        eventosCoordinados: 5890,
        memoriaCompartida: "32.6 MB",
        fuentePrimaria: "Catálogo SERCOP / MTOP 2026"
      },
      capacidades: [
        "Desglose de 4 componentes: Materiales, Mano de Obra, Equipos y Transporte",
        "Reajuste de precios con índices oficiales INEC",
        "Aislamiento estricto de rubros creados por IA frente al Catálogo Maestro"
      ]
    },
    {
      id: "marketplace",
      nombre: "SARA-Marketplace",
      alias: "Radar de Suministros",
      rol: "Proveedores en Tiempo Real & Líneas de Crédito",
      icono: Box,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      mision: "Conecta con canteras, ferreterías mayoristas y fabricantes en Ecuador, cotizando insumos con plazos de crédito de 15 a 60 días.",
      flujoEventos: [
        { evento: "SUMINISTROS_REQUERIDOS", accion: "Dispara cotización multi-proveedor", tiempo: "T+0s" },
        { evento: "COMPARATIVO_LISTO", accion: "Evalúa precio, distancia y crédito", tiempo: "T+4s" },
        { evento: "ORDEN_ASIGNADA", accion: "Reserva lote con bloqueo de precio", tiempo: "T+8s" }
      ],
      metricas: {
        precision: "98.7%",
        tiempoRespuesta: "210ms",
        eventosCoordinados: 3120,
        memoriaCompartida: "18.4 MB",
        fuentePrimaria: "Red de 280+ Proveedores Calificados"
      },
      capacidades: [
        "Cuadro comparativo inteligente con algoritmo de puntuación ponderada",
        "Negociación simulada de descuentos por volumen de compras",
        "Monitoreo de stock crítico (cemento, acero corrugado, aditivos)"
      ]
    },
    {
      id: "fletes",
      nombre: "SARA-Fletes",
      alias: "Logística Pesada",
      rol: "Rutas Provinciales & Fletes Unificados",
      icono: Truck,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      mision: "Calcula matrices de distancia vial, peajes, capacidad de volquetas o mulas y consolida fletes para reducir el costo unitario de transporte.",
      flujoEventos: [
        { evento: "RUTA_SOLICITADA", accion: "Calcula km de transporte desde cantera", tiempo: "T+0s" },
        { evento: "CARGA_CONSOLIDADA", accion: "Agrupa viajes para evitar retornos vacíos", tiempo: "T+2s" },
        { evento: "TARIFA_FLETE_APLICADA", accion: "Inserta factor de acarreo en el APU", tiempo: "T+3s" }
      ],
      metricas: {
        precision: "99.1%",
        tiempoRespuesta: "160ms",
        eventosCoordinados: 1980,
        memoriaCompartida: "9.8 MB",
        fuentePrimaria: "Matriz Vial MTOP & Tarifario de Transporte"
      },
      capacidades: [
        "Cálculo automático de primer y segundo km de transporte de agregados",
        "Optimización de despacho para hormigoneras (plazo de fraguado inicial)",
        "Consolidación de carga pesada con geocercas activas"
      ]
    },
    {
      id: "talento",
      nombre: "SARA-TalentoHumano",
      alias: "Cuadrillas & Nómina",
      rol: "Jornales CCEC & Normativa Laboral IESS",
      icono: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      mision: "Estructura cuadrillas tipo de construcción (Maestro Mayor, Albañil, Fierrero, Peón) con salarios mínimos sectoriales CCEC y cargas patronales IESS.",
      flujoEventos: [
        { evento: "CUADRILLA_ESTRUCTURADA", accion: "Aplica tabla sectorial CCEC 2026", tiempo: "T+0s" },
        { evento: "CARGAS_IESS_LIQUIDADAS", accion: "Suma décimos, fondos y seguro de riesgos", tiempo: "T+1s" },
        { evento: "COSTO_HORA_HOMBRE_FIJADO", accion: "Exporta valor HH al calculador APU", tiempo: "T+2s" }
      ],
      metricas: {
        precision: "100%",
        tiempoRespuesta: "95ms",
        eventosCoordinados: 2840,
        memoriaCompartida: "8.1 MB",
        fuentePrimaria: "Ministerio del Trabajo & CCEC Ecuador"
      },
      capacidades: [
        "Cálculo exacto del factor de salario real (FASAR)",
        "Dimensionamiento de cuadrillas según volumen de vaciado de concreto",
        "Control de cumplimiento de seguridad y salud ocupacional"
      ]
    },
    {
      id: "inmobiliaria",
      nombre: "SARA-Inmobiliaria",
      alias: "Analista de Mercado",
      rol: "Viabilidad Comercial, Rentabilidad & Absorción",
      icono: Home,
      color: "text-rose-400",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/30",
      mision: "Evalúa el costo de construcción frente a los precios de venta por m² en la zona, determinando la rentabilidad neta (TIR/VAN) del proyecto.",
      flujoEventos: [
        { evento: "TIPOLOGIA_DEFINIDA", accion: "Compara con m² de mercado local", tiempo: "T+0s" },
        { evento: "MARGEN_PROYECTADO", accion: "Calcula margen promotor y punto de equilibrio", tiempo: "T+3s" },
        { evento: "RECOMENDACION_ACABADOS", accion: "Sugiere materiales para maximizar absorción", tiempo: "T+6s" }
      ],
      metricas: {
        precision: "97.5%",
        tiempoRespuesta: "230ms",
        eventosCoordinados: 1450,
        memoriaCompartida: "16.7 MB",
        fuentePrimaria: "Observatorio Inmobiliario Ecuador 2026"
      },
      capacidades: [
        "Sensibilidad de rentabilidad ante incremento de costos de insumos",
        "Benchmark de precios por m² en Quito, Guayaquil, Cuenca y Manta",
        "Recomendaciones paramétricas de valor percibido por comprador"
      ]
    },
    {
      id: "alojamiento",
      nombre: "SARA-Alojamiento",
      alias: "Logística In-Situ",
      rol: "Campamentos de Obra & Alojamiento de Cuadrillas",
      icono: Bed,
      color: "text-amber-300",
      bgColor: "bg-amber-400/10",
      borderColor: "border-amber-400/30",
      mision: "Organiza el hospedaje de personal técnico foráneo, comedores de obra y campamentos modulares para proyectos viales o remotos.",
      flujoEventos: [
        { evento: "OBRA_FORANEA_DETECTADA", accion: "Mapea disponibilidad de hospedaje y campamento", tiempo: "T+0s" },
        { evento: "LOGISTICA_PERSONAL_ASIGNADA", accion: "Cuantifica viáticos y alimentación diaria", tiempo: "T+2s" },
        { evento: "RUBRO_PRELIMINAR_CREADO", accion: "Incorpora campamento al presupuesto", tiempo: "T+4s" }
      ],
      metricas: {
        precision: "98.9%",
        tiempoRespuesta: "175ms",
        eventosCoordinados: 930,
        memoriaCompartida: "6.2 MB",
        fuentePrimaria: "Red de Infraestructura Habitacional SARA Stays"
      },
      capacidades: [
        "Estimación de costos indirectos de campamento por m² útil",
        "Planes de alimentación y transporte diario para cuadrillas",
        "Gestión modular para proyectos mineros, viales y de energía"
      ]
    },
    {
      id: "pagos",
      nombre: "SARA-Pagos",
      alias: "Tesorero Agéntico",
      rol: "Flujo de Caja, Anticipos & Planillas SERCOP",
      icono: CreditCard,
      color: "text-emerald-300",
      bgColor: "bg-emerald-400/10",
      borderColor: "border-emerald-400/30",
      mision: "Monitorea la amortización del anticipo contractual (30-50%), genera planillas de avance de obra y concilia desembolsos bancarios.",
      flujoEventos: [
        { evento: "CONTRATO_FIRMADO", accion: "Configura retenciones y pólizas de fiel cumplimiento", tiempo: "T+0s" },
        { evento: "PLANILLA_GENERADA", accion: "Descuenta amortización proporcional de anticipo", tiempo: "T+3s" },
        { evento: "DESEMBOLSO_VALIDADO", accion: "Emite orden de pago automatizada", tiempo: "T+5s" }
      ],
      metricas: {
        precision: "100%",
        tiempoRespuesta: "80ms",
        eventosCoordinados: 4120,
        memoriaCompartida: "22.3 MB",
        fuentePrimaria: "Normativa Tributaria SRI & SERCOP"
      },
      capacidades: [
        "Generación de planillas tipo SERCOP con memoria de cálculo",
        "Seguimiento de amortización de anticipo y fondo de garantía",
        "Integración con pasarelas de pago y conciliación bancaria nacional"
      ]
    }
  ]

  const agenteActivo = agentesColectivos.find(a => a.id === selectedAgentId) || agentesColectivos[1]

  // Ejemplos interactivos para la tarjeta showcase del Hero
  const demoRubros = {
    estructura: {
      nombre: "HORMIGÓN SIMPLE f'c=210 kg/cm²",
      unidad: "m³",
      codigo: "RUB-EST-042",
      materiales: 74.50,
      manoObra: 26.80,
      equipos: 11.10,
      directo: 112.40,
      aiu: 20.80,
      total: 133.20,
      detalle: "Incluye cemento Selva Alegre, ripio triturado, arena azul y vibrado mecánico.",
    },
    acabados: {
      nombre: "PORCELANATO ESPAÑOL RECTIFICADO 60x120",
      unidad: "m²",
      codigo: "RUB-ACA-108",
      materiales: 22.40,
      manoObra: 8.50,
      equipos: 1.20,
      directo: 32.10,
      aiu: 5.94,
      total: 38.04,
      detalle: "Incluye mortero adhesivo de alta adherencia Binda Fix y fragua anti-hongos.",
    },
    vial: {
      nombre: "SUB-BASE GRANULAR CLASE 3 COMPACTADA",
      unidad: "m³",
      codigo: "RUB-VIA-019",
      materiales: 11.80,
      manoObra: 2.10,
      equipos: 6.40,
      directo: 20.30,
      aiu: 3.75,
      total: 24.05,
      detalle: "Tendido con motoniveladora y rodillo liso vibratorio de 10 toneladas.",
    }
  }

  const rubroActual = demoRubros[activeTabApu]

  // Preguntas y respuestas técnicas del Co-Piloto Asesor
  const copilotPresetQueries = [
    {
      pregunta: "¿Cómo optimizar el flete de cemento a Loja?",
      respuesta: "Para Loja (distancia crítica desde plantas en Azuay/Chimborazo), la Red Agéntica recomienda consolidar pedidos con SARA-Fletes en mulas de 30 toneladas métricas (600 sacos) desde la cantera Guapán. Esto reduce el flete unitario de $1.45/saco a $0.88/saco, generando un ahorro directo del 39.3% en la partida de transporte.",
      tags: ["Logística Pesada", "Ahorro: 39.3%", "Loja"],
      datosClave: { ahorroTotal: "$3,420 por 6,000 sacos", ruta: "Azogues -> Loja (214 km)", proveedorRecomendado: "Distribuidora del Sur" }
    },
    {
      pregunta: "¿Cuál es el AIU y desglose de indirectos recomendado para SERCOP?",
      respuesta: "Para licitaciones públicas SERCOP en obras civiles, la fórmula paramétrica de SARA-APU establece un AIU referencial del 18.50%, desglosado en: Dirección Técnica y Residencia (8.20%), Administración Central y Oficina (3.80%), Pólizas y Garantías de Fiel Cumplimiento (2.10%), Imprevistos (1.40%) y Utilidad Neta (3.00%). Este porcentaje garantiza competitividad sin riesgo de descalificación por oferta temeraria.",
      tags: ["Norma SERCOP", "AIU: 18.50%", "Legal"],
      datosClave: { direccionTecnica: "8.20%", utilidad: "3.00%", riesgoRechazo: "0.2%" }
    },
    {
      pregunta: "¿Qué proveedores ofrecen 45 días de crédito en varilla corrugada?",
      respuesta: "SARA-Marketplace tiene registradas 3 distribuidoras con línea de crédito calificada a 45 días para acero corrugado grado 60 (Adelca / Novacero) en Pichincha y Guayas: 1) Aceros del Ecuador S.A. ($0.94/kg a 45 días, cupo $50k), 2) Disensa Matriz ($0.96/kg a 60 días), 3) Metal Hierro ($0.93/kg con pago a 30 días). Se sugiere Aceros del Ecuador para optimizar el flujo de caja.",
      tags: ["Crédito 45 días", "Acero Grado 60", "Pichincha / Guayas"],
      datosClave: { mejorPrecio: "$0.94 / kg", cupoDisponible: "$50,000", calificacionIA: "98/100" }
    },
    {
      pregunta: "¿Cómo impacta la lluvia en los rendimientos de excavación en Manabí?",
      respuesta: "En Manabí, durante época invernal (suelos arcillosos expansivos), el coeficiente de esponjamiento se incrementa a 1.35 y la velocidad de ciclo de la retroexcavadora de 120 HP disminuye un 28.5%. SARA-APU recomienda recalibrar el rendimiento de 35 m³/hora a 25 m³/hora y prever un 15% adicional de costo horario por bomba de achique.",
      tags: ["Climatología Obra", "Factor: -28.5%", "Manabí"],
      datosClave: { rendimientoSeco: "35 m³/h", rendimientoLluvias: "25 m³/h", achiqueRequerido: "Sí (2 pulgadas)" }
    }
  ]

  // Proveedores para el modal de Cuadro Comparativo
  const proveedoresDemo = [
    { insumo: "Cemento Selva Alegre 50kg", proveedor: "Unacem Distribución", ciudad: "Quito", precioBase: 8.10, flete: 0.35, credito: "45 días", score: 98, cert: "ISO 9001 / INEN 152" },
    { insumo: "Cemento Selva Alegre 50kg", proveedor: "Ferretería Continental", ciudad: "Loja", precioBase: 8.85, flete: 0.15, credito: "15 días", score: 86, cert: "Distribuidor Autorizado" },
    { insumo: "Acero Corrugado 12mm (Adelca)", proveedor: "Aceros del Ecuador S.A.", ciudad: "Guayaquil", precioBase: 0.94, flete: 0.04, credito: "45 días", score: 96, cert: "INEN 102 Grado 60" },
    { insumo: "Hormigón Premezclado 210kg/cm²", proveedor: "Hormigonera Loja & Cía", ciudad: "Loja", precioBase: 98.00, flete: 8.00, credito: "30 días", score: 92, cert: "Control Probetas 28d" },
    { insumo: "Arena Azul Triturada (m³)", proveedor: "Cantera San José", ciudad: "Cuenca", precioBase: 14.50, flete: 4.20, credito: "30 días", score: 90, cert: "Granulometría Aprobada" },
    { insumo: "Porcelanato Rectificado 60x120", proveedor: "Graiman Matriz", ciudad: "Cuenca", precioBase: 19.80, flete: 1.10, credito: "60 días", score: 99, cert: "Garantía de Fábrica" }
  ]

  // Rubro AI interactivo generado
  const aiRubroGenerado = {
    codigo: "RUB-IA-2026-089",
    nombre: aiRubroPrompt,
    unidad: "m³",
    materiales: [
      { descripcion: "Piedra bola de río seleccionada (40-60%)", unidad: "m³", cantidad: 0.55, precio: 16.50, total: 9.08 },
      { descripcion: "Cemento Portland Especial Tipo I (sacos 50kg)", unidad: "saco", cantidad: 4.80, precio: 8.40, total: 40.32 },
      { descripcion: "Arena azul de cantera lavada", unidad: "m³", cantidad: 0.42, precio: 18.00, total: 7.56 },
      { descripcion: "Tubo PVC de drenaje perforado D=3 pulg.", unidad: "m", cantidad: 0.80, precio: 4.20, total: 3.36 }
    ],
    manoObra: [
      { categoria: "Maestro Mayor de Obra", cuadrilla: 0.20, jornalHora: 4.85, rendimientoHora: 0.15, total: 1.46 },
      { categoria: "Albañil Calificado", cuadrilla: 1.00, jornalHora: 4.10, rendimientoHora: 1.80, total: 7.38 },
      { categoria: "Peón de Construcción (2 obreros)", cuadrilla: 2.00, jornalHora: 3.65, rendimientoHora: 3.20, total: 11.68 }
    ],
    equipos: [
      { descripcion: "Hormigonera de 1 saco (trompo 9 HP)", costoHora: 6.50, rendimientoHora: 0.45, total: 2.93 },
      { descripcion: "Vibrador mecánico de aguja 2 pulg.", costoHora: 4.20, rendimientoHora: 0.30, total: 1.26 },
      { descripcion: "Herramienta menor (5% Mano de Obra)", costoHora: 0.00, rendimientoHora: 0.00, total: 1.03 }
    ],
    costoDirecto: 86.06,
    aiuPorcentaje: 18.5,
    aiuMonto: 15.92,
    precioUnitario: 101.98
  }

  const handleSimularGeneracionAiRubro = () => {
    setIsGeneratingAiRubro(true)
    setTimeout(() => {
      setIsGeneratingAiRubro(false)
    }, 700)
  }

  // Precios paramétricos para el cotizador
  const factoresProvincia = {
    Pichincha: { factor: 1.00, flete: "Base Central", diasEntrega: "24h" },
    Guayas: { factor: 1.02, flete: "+2% Clima Costa", diasEntrega: "24h" },
    Azuay: { factor: 1.03, flete: "+3% Logística Cantera", diasEntrega: "48h" },
    Loja: { factor: 1.08, flete: "+8% Acarreo Distante", diasEntrega: "72h" },
    Manabí: { factor: 1.05, flete: "+5% Suelo Expansivo", diasEntrega: "48h" }
  }

  const costosBaseTipologia = {
    unifamiliar: { nombre: "Vivienda Unifamiliar VIP", baseM2: 420, icon: Home },
    edificio: { nombre: "Edificio Residencial Multifamiliar", baseM2: 680, icon: Building2 },
    industrial: { nombre: "Galpón Industrial / Bodega Logística", baseM2: 310, icon: Box },
    vial: { nombre: "Vialidad Urbana & Bordillos", baseM2: 95, icon: Truck }
  }

  const multiplicadorCalidad = {
    economico: 0.88,
    estandar: 1.00,
    premium: 1.28
  }

  const costM2Calculado = Math.round(
    costosBaseTipologia[cotizadorTipologia].baseM2 *
    factoresProvincia[cotizadorProvincia].factor *
    multiplicadorCalidad[cotizadorCalidad]
  )
  const costoTotalCalculado = Math.round(costM2Calculado * cotizadorArea)

  const handleAbrirCalibracion = () => {
    setCalibracionStep(1)
    setShowCalibracionModal(true)
    const timer1 = setTimeout(() => setCalibracionStep(2), 600)
    const timer2 = setTimeout(() => setCalibracionStep(3), 1200)
    const timer3 = setTimeout(() => setCalibracionStep(4), 1800)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }

  return (
    <div className="min-h-screen bg-[#070b0e] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Intro con logotipo 3D oficial de SARA APU */}
      <ModuloIntroSplash modulo="apu" />

      {/* Sub-header de navegación rápida APU */}
      <nav className="w-full bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-3 sm:px-6 md:px-8 py-2.5 z-30 sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 text-blue-400 font-bold uppercase tracking-wider text-[10px] sm:text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">SARA APU • Red Agéntica de Costos</span>
            </div>
            <span className="hidden sm:inline text-white/20">|</span>
            <span className="hidden sm:inline text-slate-400 text-[11px] font-mono">Ecuador 2026</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <a 
              href="#red-agentes" 
              className="hidden lg:inline text-slate-300 hover:text-white transition-colors font-medium text-[11px] uppercase tracking-wider"
            >
              8 Agentes
            </a>
            <a 
              href="#copiloto" 
              className="hidden md:inline text-slate-300 hover:text-white transition-colors font-medium text-[11px] uppercase tracking-wider"
            >
              Co-Piloto & Documentos
            </a>
            <a 
              href="#cotizador" 
              className="text-slate-300 hover:text-cyan-400 transition-colors font-bold text-[10px] sm:text-[11px] uppercase tracking-wider"
            >
              Cotizador
            </a>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] uppercase tracking-wider transition-all shadow-md active:scale-95 min-h-[36px]"
            >
              <span>Entrar al Software</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO PRINCIPAL */}
      <main className="flex-1">
        <section className="relative min-h-[90vh] flex items-center overflow-hidden py-12 md:py-20 px-4 md:px-8 lg:px-12 border-b border-white/10">
          {/* IMAGEN DE FONDO CINEMATOGRÁFICA DE INGENIERÍA */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none transform scale-105 transition-transform duration-1000 opacity-30"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=2160&auto=format&fit=crop')`,
            }}
          />

          {/* GRADIENTES DIRECCIONALES */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070b0e] via-[#070b0e]/95 via-50% to-[#070b0e]/50 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b0e] via-transparent to-[#070b0e]/70 pointer-events-none" />
          
          {/* Blueprint Grid */}
          <div 
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(#60a5fa 1px, transparent 1px), linear-gradient(90deg, #60a5fa 1px, transparent 1px)`,
              backgroundSize: "40px 40px"
            }}
          />

          {/* Luces radiales ambientales */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[520px] h-[520px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-[420px] h-[420px] bg-cyan-500/15 rounded-full blur-[130px] pointer-events-none" />

          {/* CONTENEDOR HERO SPLIT */}
          <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* COLUMNA IZQUIERDA: TEXTO, LLAMADAS A LA ACCIÓN Y MÉTRICAS */}
            <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
              
              {/* Badge oficial Ecosistema Agéntico */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-lg shadow-blue-950/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span>SARA-APU 2026 • Ecosistema Multi-Agente Inteligente</span>
              </div>

              {/* Título Principal */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight leading-[1.05]">
                Cálculo de Obra con <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                  Inteligencia Agéntica
                </span> <br />
                <span className="text-slate-300 text-2xl sm:text-4xl">& Precisión Absoluta</span>
              </h1>

              {/* Subtítulo Técnico */}
              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-light">
                Software profesional de análisis de precios unitarios impulsado por una <strong className="text-white font-semibold">Red de 8 Agentes Autónomos</strong> con memoria colectiva. Cotización paramétrica calibrada en tiempo real, cómputos BIM 3D y cumplimiento oficial SERCOP / MTOP para Ecuador.
              </p>

              {/* Botones de Acción */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 w-full sm:w-auto">
                <Link 
                  href="/dashboard" 
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 transition-all group min-h-[48px] active:scale-95"
                >
                  <Cpu size={18} className="text-cyan-300" />
                  <span>Acceder al Panel APU</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform text-cyan-300" />
                </Link>

                <a 
                  href="#cotizador" 
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-slate-900/90 hover:bg-slate-800 text-white border border-white/20 hover:border-cyan-400/50 font-black text-xs sm:text-sm uppercase tracking-wider px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl backdrop-blur-md transition-all group shadow-lg min-h-[48px] active:scale-95"
                >
                  <Calculator size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>Cotizador Paramétrico</span>
                </a>
              </div>

              {/* Micro-garantías normativas */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-slate-400 text-xs font-medium">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 size={15} />
                  <span>Norma SERCOP / MTOP 2026</span>
                </div>
                <span className="hidden sm:inline text-white/20">•</span>
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <Network size={15} />
                  <span>Memoria Agéntica Compartida</span>
                </div>
                <span className="hidden sm:inline text-white/20">•</span>
                <div className="flex items-center gap-1.5 text-indigo-400">
                  <ShieldCheck size={15} />
                  <span>Catálogo Maestro Aislado</span>
                </div>
              </div>

              {/* Grid de Métricas Técnicas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full pt-4 border-t border-white/10">
                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-sm">
                  <div className="text-lg sm:text-2xl font-black text-blue-400 font-mono">4,167+</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Insumos Calibrados</div>
                </div>
                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-sm">
                  <div className="text-lg sm:text-2xl font-black text-cyan-400 font-mono">8 Agentes</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Memoria Colectiva</div>
                </div>
                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-sm">
                  <div className="text-lg sm:text-2xl font-black text-emerald-400 font-mono">Matriz VAE</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Compras Públicas</div>
                </div>
                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-sm">
                  <div className="text-lg sm:text-2xl font-black text-purple-400 font-mono">BIM 3D</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Take-Off Directo</div>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: SHOWCASE INTERACTIVO DE APU EN VIVO */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-slate-900/85 backdrop-blur-xl border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-black/80 relative overflow-hidden group">
                {/* Acento de gradiente superior */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500" />
                
                {/* Header de la tarjeta simulador */}
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Simulador APU en Vivo
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold">
                    SERCOP • Loja / Quito
                  </span>
                </div>

                {/* Selector de Rubros */}
                <div className="flex gap-1.5 p-1 bg-slate-950/80 rounded-xl mb-4 border border-white/5">
                  <button
                    onClick={() => setActiveTabApu("estructura")}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all uppercase tracking-wider min-h-[38px] ${
                      activeTabApu === "estructura" 
                        ? "bg-blue-600 text-white shadow" 
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Estructura
                  </button>
                  <button
                    onClick={() => setActiveTabApu("acabados")}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all uppercase tracking-wider min-h-[38px] ${
                      activeTabApu === "acabados" 
                        ? "bg-blue-600 text-white shadow" 
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Acabados
                  </button>
                  <button
                    onClick={() => setActiveTabApu("vial")}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all uppercase tracking-wider min-h-[38px] ${
                      activeTabApu === "vial" 
                        ? "bg-blue-600 text-white shadow" 
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Vialidad
                  </button>
                </div>

                {/* Rubro Activo */}
                <div className="mb-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-mono text-cyan-400 font-semibold">{rubroActual.codigo}</span>
                    <span className="text-xs font-bold text-slate-400">Unidad: <strong className="text-white">{rubroActual.unidad}</strong></span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white mt-1 leading-snug">
                    {rubroActual.nombre}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 italic leading-relaxed">
                    {rubroActual.detalle}
                  </p>
                </div>

                {/* Desglose de Componentes */}
                <div className="space-y-2 py-3 border-y border-white/10 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Box size={13} className="text-blue-400 shrink-0" /> Materiales Puestos en Obra
                    </span>
                    <span className="font-mono font-bold text-white">${rubroActual.materiales.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <HardHat size={13} className="text-emerald-400 shrink-0" /> Mano de Obra (Jornal CCEC)
                    </span>
                    <span className="font-mono font-bold text-white">${rubroActual.manoObra.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Cpu size={13} className="text-amber-400 shrink-0" /> Equipos & Maquinaria
                    </span>
                    <span className="font-mono font-bold text-white">${rubroActual.equipos.toFixed(2)}</span>
                  </div>
                </div>

                {/* Fórmulas de Indirectos y P.U. */}
                <div className="mt-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Costo Directo (CD):</span>
                    <span className="font-mono font-semibold text-slate-200">${rubroActual.directo.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-blue-300">
                    <span>Indirectos AIU (18.5% SERCOP):</span>
                    <span className="font-mono font-semibold">+${rubroActual.aiu.toFixed(2)}</span>
                  </div>
                  
                  {/* P.U. Destacado */}
                  <div className="bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-500/40 p-3.5 rounded-2xl flex items-center justify-between mt-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block">
                        Precio Unitario (P.U.)
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-white font-mono">
                        ${rubroActual.total.toFixed(2)}{" "}
                        <span className="text-xs font-normal text-slate-300">/ {rubroActual.unidad}</span>
                      </span>
                    </div>

                    <Link 
                      href="/dashboard/presupuestos_reales"
                      className="inline-flex items-center gap-1 bg-white text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl hover:bg-cyan-50 transition-colors shadow min-h-[40px]"
                    >
                      <span>Usar Rubro</span>
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>

                <div className="mt-3.5 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Check size={12} /> Rendimiento de Obra Calibrado
                  </span>
                  <span className="text-slate-400">Base SARA Constructora</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* SECCIÓN 1: RED DE AGENTES COLECTIVOS (8 AGENTES CON MEMORIA) */}
        {/* ============================================================ */}
        <section id="red-agentes" className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-b border-white/10">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black uppercase tracking-wider">
              <Network size={14} />
              <span>Arquitectura Agéntica Colaborativa</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
              Red de 8 Agentes Autónomos con Memoria Colectiva
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
              Cada agente es un modelo especializado que colabora a través de un bus de eventos en memoria compartida. Ningún cálculo queda aislado: una variación de fletes en Manabí ajusta automáticamente los APUs y los flujos de pago.
            </p>
          </div>

          {/* Selector de Agentes Adaptable (Scroll horizontal en móvil, grid en escritorio) */}
          <div className="flex sm:grid sm:grid-cols-4 lg:grid-cols-8 gap-2 pb-4 sm:pb-0 overflow-x-auto no-scrollbar">
            {agentesColectivos.map((agente) => {
              const Icono = agente.icono
              const isSelected = agente.id === selectedAgentId
              return (
                <button
                  key={agente.id}
                  onClick={() => setSelectedAgentId(agente.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all shrink-0 w-[120px] sm:w-auto min-h-[90px] text-center ${
                    isSelected
                      ? `bg-slate-800 ${agente.borderColor} shadow-lg shadow-blue-950/60 ring-2 ring-cyan-400/50`
                      : "bg-slate-900/60 border-white/10 hover:border-white/20 hover:bg-slate-900"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 ${agente.bgColor} ${agente.color}`}>
                    <Icono size={18} />
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-tight truncate w-full ${isSelected ? "text-white" : "text-slate-300"}`}>
                    {agente.nombre.replace("SARA-", "")}
                  </span>
                  <span className="text-[9px] text-slate-400 truncate w-full">
                    {agente.alias}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Tarjeta del Agente Seleccionado con Flujo de Memoria */}
          <div className="mt-8 bg-slate-900/80 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
              
              {/* Información del Agente */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${agenteActivo.bgColor} ${agenteActivo.color} border ${agenteActivo.borderColor}`}>
                    {React.createElement(agenteActivo.icono, { size: 28 })}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-cyan-300 font-bold uppercase">
                      {agenteActivo.alias}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {agenteActivo.nombre}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">{agenteActivo.rol}</p>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed font-light">
                  {agenteActivo.mision}
                </p>

                {/* Métricas rápidas */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Precisión</span>
                    <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">{agenteActivo.metricas.precision}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Latencia</span>
                    <span className="text-sm sm:text-base font-black text-cyan-400 font-mono">{agenteActivo.metricas.tiempoRespuesta}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Memoria</span>
                    <span className="text-sm sm:text-base font-black text-purple-400 font-mono">{agenteActivo.metricas.memoriaCompartida}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveAgentModal(agenteActivo)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg transition-all min-h-[44px]"
                  >
                    <Activity size={16} />
                    <span>Ver Analítica Detallada del Agente</span>
                  </button>
                </div>
              </div>

              {/* Flujo de Eventos & Memoria Compartida en Tiempo Real */}
              <div className="lg:col-span-7 bg-slate-950/80 rounded-2xl border border-white/10 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Network size={15} className="text-cyan-400" />
                    <span>Flujo de Memoria Colectiva Activo</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Sync Bus: Activo (12ms)
                  </span>
                </div>

                {/* Pasos del evento */}
                <div className="space-y-3">
                  {agenteActivo.flujoEventos.map((paso, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-blue-600/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-blue-300">{paso.evento}</span>
                          <span className="text-[10px] font-mono text-slate-500">{paso.tiempo}</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{paso.accion}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Capacidades clave */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Especializaciones Clave en Obra:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {agenteActivo.capacidades.map((cap, i) => (
                      <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1.5">
                        <Check size={11} className="text-emerald-400" />
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECCIÓN 2: CO-PILOTO ASESOR IA & DOCUMENTOS OFICIALES EXPORT */}
        {/* ============================================================ */}
        <section id="copiloto" className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-b border-white/10">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-wider">
              <Bot size={14} />
              <span>Asistencia Especializada en Ingeniería Ecuatoriana</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
              Co-Piloto Asesor Interactivo & Documentos Oficiales
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
              Consulta en tiempo real sobre fletes provinciales, líneas de crédito mayoristas, AIU normativo y cubicación. Descarga entregables formales optimizados para la firma del Director de Obra.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* CHAT TÉCNICO INTERACTIVO CO-PILOTO */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-white/15 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-md">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        Co-Piloto Asesor SARA-AI
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      </h4>
                      <p className="text-[10px] text-slate-400">Terminología constructiva de Ecuador (MTOP, SERCOP, INEC)</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-cyan-400 font-bold">
                    v4.8 Calibrado
                  </span>
                </div>

                {/* Preguntas rápidas en formato Chips */}
                <div className="space-y-2 mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Selecciona una consulta técnica de ejemplo:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {copilotPresetQueries.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCopilotThinking(true)
                          setActiveCopilotQueryIndex(idx)
                          setTimeout(() => setCopilotThinking(false), 300)
                        }}
                        className={`text-left text-[11px] px-3 py-2 rounded-xl transition-all border min-h-[38px] ${
                          activeCopilotQueryIndex === idx
                            ? "bg-blue-600/30 border-blue-500/60 text-white font-semibold"
                            : "bg-slate-950/70 border-white/10 text-slate-300 hover:border-white/30"
                        }`}
                      >
                        {item.pregunta}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Respuesta del Co-Piloto */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-white/10 space-y-3 relative">
                  {copilotThinking ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-3">
                      <RefreshCw size={24} className="text-cyan-400 animate-spin" />
                      <span className="text-xs text-slate-400 font-mono">Consultando memoria de los 8 agentes...</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                          <CheckCheck size={14} className="text-emerald-400" />
                          Dictamen del Asesor Técnico:
                        </span>
                        <div className="flex items-center gap-1.5">
                          {copilotPresetQueries[activeCopilotQueryIndex].tags.map((tag, i) => (
                            <span key={i} className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                        {copilotPresetQueries[activeCopilotQueryIndex].respuesta}
                      </p>

                      {/* Datos clave destacados */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5">
                        {Object.entries(copilotPresetQueries[activeCopilotQueryIndex].datosClave).map(([k, v], i) => (
                          <div key={i} className="p-2 rounded-lg bg-white/5">
                            <span className="text-[9px] text-slate-400 uppercase block capitalize">
                              {k.replace(/([A-Z])/g, " $1")}
                            </span>
                            <span className="text-xs font-bold text-cyan-300 font-mono">{v}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Input simulado */}
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                <input 
                  type="text" 
                  value={copilotCustomQuery}
                  onChange={(e) => setCopilotCustomQuery(e.target.value)}
                  placeholder="Escribe tu duda técnica (ej: dosificación de aditivo para losa)..."
                  className="flex-1 bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button 
                  onClick={() => {
                    if (copilotCustomQuery.trim()) {
                      setCopilotThinking(true)
                      setTimeout(() => {
                        setCopilotThinking(false)
                        setCopilotCustomQuery("")
                      }, 500)
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] shrink-0"
                >
                  Consultar
                </button>
              </div>
            </div>

            {/* ENTREGABLES OFICIALES EXPORTABLES */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Documento A: Cuadro Comparativo de Proveedores */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/15 hover:border-cyan-400/40 transition-all shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                    <FileSpreadsheet size={24} />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Formato PDF / Excel
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Cuadro Comparativo de Proveedores</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Compara precios en planta vs. puesto en obra, fletes por km, plazos de crédito comercial y calificación de confiabilidad emitida por la IA.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Insumos cotejados:</span>
                    <span className="text-white">6 materiales clave</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Ahorro ponderado detectado:</span>
                    <span className="text-emerald-400 font-bold">$14,850.00 (12.4%)</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowProveedorModal(true)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl border border-white/20 transition-all min-h-[44px]"
                >
                  <Search size={15} className="text-cyan-400" />
                  <span>Previsualizar Cuadro Comparativo</span>
                </button>
              </div>

              {/* Documento B: Reporte Consolidado de Insumos & Logística */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/15 hover:border-emerald-400/40 transition-all shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Firma Director de Obra
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Reporte Consolidado de Insumos & Logística</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Documento formal de ingeniería con sello de validación agéntica, rutas de acarreo, impacto de ahorro presupuestario y casilla legal de firma.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Validación normativa:</span>
                    <span className="text-emerald-400">Aprobado SERCOP</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Sellos de aprobación:</span>
                    <span className="text-white">Dirección Técnica SARA</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowReporteModal(true)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-md min-h-[44px]"
                >
                  <Printer size={15} />
                  <span>Ver Reporte Consolidado Oficial</span>
                </button>
              </div>

            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* SECCIÓN 3: SARA-AI-RUBROS & AISLAMIENTO DE CATÁLOGO MAESTRO  */}
        {/* ============================================================ */}
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-b border-white/10">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-black uppercase tracking-wider">
              <Brain size={14} />
              <span>Generación Autónoma por Procesamiento de Lenguaje Natural</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
              SARA-AI-Rubros: Creación de APUs desde Texto
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
              Describe una partida de obra en lenguaje natural de ingeniería. El motor desglosa materiales con sus dosis, mano de obra con rendimientos de cuadrilla, maquinaria y factores indirectos en segundos.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LADO IZQUIERDO: GENERADOR INTERACTIVO */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-white/15 rounded-3xl p-5 sm:p-7 backdrop-blur-xl shadow-2xl space-y-5">
              
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Prompt de Ingeniería (Describe el Rubro a Crear):
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={aiRubroPrompt}
                    onChange={(e) => setAiRubroPrompt(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 rounded-2xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 resize-none font-sans leading-relaxed"
                  />
                  <button
                    onClick={handleSimularGeneracionAiRubro}
                    disabled={isGeneratingAiRubro}
                    className="mt-2 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-lg transition-all min-h-[44px]"
                  >
                    {isGeneratingAiRubro ? (
                      <>
                        <RefreshCw size={15} className="animate-spin text-purple-200" />
                        <span>Sintetizando Dosificaciones y Rendimientos...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} className="text-purple-300" />
                        <span>Generar Rubro con SARA AI</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Ejemplos de Prompt rápidos */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-[10px] text-slate-400 self-center">Ejemplos:</span>
                  <button
                    onClick={() => {
                      setAiRubroPrompt("Muro de contención de hormigón ciclópeo f'c=180 kg/cm² H=3.2m con piedra bola 60% y drenes PVC en Loja")
                      handleSimularGeneracionAiRubro()
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                  >
                    Muro Ciclópeo 3.2m
                  </button>
                  <button
                    onClick={() => {
                      setAiRubroPrompt("Cubierta metálica con perfiles tubulares estructurales 100x50x3mm y lámina Galvalume prepintada")
                      handleSimularGeneracionAiRubro()
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                  >
                    Cubierta Galvalume
                  </button>
                  <button
                    onClick={() => {
                      setAiRubroPrompt("Piso de hormigón pulido e=15cm con fibra sintética y sellado de juntas epóxicas")
                      handleSimularGeneracionAiRubro()
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                  >
                    Piso Industrial Pulido
                  </button>
                </div>
              </div>

              {/* Resultado del Rubro Sintetizado */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-purple-400 font-bold">{aiRubroGenerado.codigo}</span>
                    <h4 className="text-xs sm:text-sm font-black text-white mt-0.5 line-clamp-1">{aiRubroGenerado.nombre}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    Unidad: {aiRubroGenerado.unidad}
                  </span>
                </div>

                {/* Sub-tablas de Desglose */}
                <div className="space-y-3 text-xs">
                  {/* Materiales */}
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                      Materiales & Dosificación
                    </span>
                    <div className="space-y-1">
                      {aiRubroGenerado.materiales.map((mat, i) => (
                        <div key={i} className="flex justify-between items-center text-slate-300 py-0.5 border-b border-white/5">
                          <span className="truncate pr-2">{mat.descripcion} ({mat.cantidad} {mat.unidad})</span>
                          <span className="font-mono text-white shrink-0">${mat.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mano de Obra */}
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                      Mano de Obra (Jornales CCEC)
                    </span>
                    <div className="space-y-1">
                      {aiRubroGenerado.manoObra.map((mo, i) => (
                        <div key={i} className="flex justify-between items-center text-slate-300 py-0.5 border-b border-white/5">
                          <span className="truncate pr-2">{mo.categoria} (Cuadrilla {mo.cuadrilla})</span>
                          <span className="font-mono text-white shrink-0">${mo.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Equipos */}
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                      Equipos y Maquinaria
                    </span>
                    <div className="space-y-1">
                      {aiRubroGenerado.equipos.map((eq, i) => (
                        <div key={i} className="flex justify-between items-center text-slate-300 py-0.5 border-b border-white/5">
                          <span className="truncate pr-2">{eq.descripcion}</span>
                          <span className="font-mono text-white shrink-0">${eq.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Resumen Final de Costos */}
                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Costo Directo</span>
                      <span className="font-mono font-bold text-slate-200">${aiRubroGenerado.costoDirecto.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">AIU (18.5%)</span>
                      <span className="font-mono font-bold text-blue-400">+${aiRubroGenerado.aiuMonto.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">P.U. Total</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm sm:text-base">${aiRubroGenerado.precioUnitario.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setAiRubroCopied(true)
                      setTimeout(() => setAiRubroCopied(false), 2000)
                    }}
                    className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px]"
                  >
                    {aiRubroCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{aiRubroCopied ? "¡Copiado a Presupuesto!" : "Guardar en Proyecto"}</span>
                  </button>
                </div>

              </div>

            </div>

            {/* LADO DERECHO: ARQUITECTURA DE SEGURIDAD Y AISLAMIENTO DEL CATÁLOGO MAESTRO */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck size={26} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase">
                      Zero-Pollution Guarantee
                    </span>
                    <h3 className="text-lg font-black text-white mt-0.5">
                      Aislamiento de Catálogo Maestro
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light mb-5">
                  La arquitectura de SARA-APU garantiza que <strong className="text-white font-semibold">los rubros creados por IA pertenecen única y exclusivamente al proyecto o cliente activo</strong>. El Catálogo Maestro Oficial del Grupo SARA permanece inmutable y protegido contra modificaciones no supervisadas.
                </p>

                {/* Puntos de Seguridad */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-white/5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-bold block">Espacio Aislado por Proyecto (Scope Isolation)</strong>
                      <span className="text-slate-400">Los rubros sintéticos tienen identificadores UUID locales asignados a la base de datos de tu obra.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-white/5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-bold block">Inmutabilidad del Catálogo Maestro</strong>
                      <span className="text-slate-400">Los más de 4,167 rubros oficiales de SARA solo pueden ser editados por auditores humanos certificados.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-white/5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-bold block">Trazabilidad Criptográfica</strong>
                      <span className="text-slate-400">Cada APU generado registra el prompt original, el modelo emisor y la fecha para auditorías de fiscalización.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Shield size={14} className="text-emerald-400" />
                    Políticas RLS en Supabase
                  </span>
                  <span className="font-mono text-emerald-400">100% Protegido</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* SECCIÓN 4: COTIZADOR PARAMÉTRICO RÁPIDO 2026 + CALIBRACIÓN  */}
        {/* ============================================================ */}
        <section id="cotizador" className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-b border-white/10">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black uppercase tracking-wider">
              <Calculator size={14} />
              <span>Simulador Paramétrico Regional</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
              Cotizador Paramétrico Rápido 2026
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
              Obtén un presupuesto referencial de alta fidelidad según la ubicación geográfica, tipología constructiva y área total. Calíbralo en vivo con la Red de Agentes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/80 border border-white/15 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
            
            {/* CONTROLES DEL COTIZADOR */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Selector de Provincia */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  1. Provincia / Región de la Obra:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(["Pichincha", "Guayas", "Azuay", "Loja", "Manabí"] as const).map((prov) => (
                    <button
                      key={prov}
                      onClick={() => setCotizadorProvincia(prov)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider min-h-[44px] ${
                        cotizadorProvincia === prov
                          ? "bg-blue-600 text-white shadow-md ring-2 ring-cyan-400/50"
                          : "bg-slate-950 text-slate-400 hover:text-white border border-white/10"
                      }`}
                    >
                      {prov}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 px-1 font-mono">
                  <span>Factor logístico: {factoresProvincia[cotizadorProvincia].flete}</span>
                  <span>Despacho: {factoresProvincia[cotizadorProvincia].diasEntrega}</span>
                </div>
              </div>

              {/* Selector de Tipología */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  2. Tipología de Edificación:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(["unifamiliar", "edificio", "industrial", "vial"] as const).map((tipo) => {
                    const data = costosBaseTipologia[tipo]
                    const Icono = data.icon
                    const isSelected = cotizadorTipologia === tipo
                    return (
                      <button
                        key={tipo}
                        onClick={() => setCotizadorTipologia(tipo)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 min-h-[56px] ${
                          isSelected
                            ? "bg-slate-800 border-cyan-400 shadow-md ring-1 ring-cyan-400/40 text-white"
                            : "bg-slate-950/80 border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400"}`}>
                          <Icono size={16} />
                        </div>
                        <div className="overflow-hidden">
                          <span className="text-xs font-bold block truncate">{data.nombre}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Ref: ${data.baseM2} / m²</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Control de Área en m² */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    3. Área Construida Total:
                  </label>
                  <span className="text-base sm:text-lg font-black text-cyan-300 font-mono">
                    {cotizadorArea} m²
                  </span>
                </div>
                <input 
                  type="range" 
                  min={50} 
                  max={2500} 
                  step={10}
                  value={cotizadorArea}
                  onChange={(e) => setCotizadorArea(Number(e.target.value))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between gap-2 mt-2">
                  {[80, 160, 320, 650, 1200].map((area) => (
                    <button
                      key={area}
                      onClick={() => setCotizadorArea(area)}
                      className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition-all ${
                        cotizadorArea === area 
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" 
                          : "bg-slate-950 text-slate-400 border-white/5 hover:text-white"
                      }`}
                    >
                      {area} m²
                    </button>
                  ))}
                </div>
              </div>

              {/* Nivel de Acabados */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  4. Nivel de Especificaciones & Acabados:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["economico", "estandar", "premium"] as const).map((cal) => (
                    <button
                      key={cal}
                      onClick={() => setCotizadorCalidad(cal)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider min-h-[40px] ${
                        cotizadorCalidad === cal
                          ? "bg-slate-800 text-cyan-300 border border-cyan-400 shadow-sm"
                          : "bg-slate-950 text-slate-400 hover:text-white border border-white/10"
                      }`}
                    >
                      {cal === "economico" ? "Económico" : cal === "estandar" ? "Estándar SERCOP" : "Premium Lujo"}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* TARJETA DE RESULTADO Y BOTÓN DE CALIBRACIÓN */}
            <div className="lg:col-span-5 bg-gradient-to-b from-slate-950 to-slate-900 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                  Proyección 2026 • {cotizadorProvincia}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              {/* Costo Total */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Presupuesto Referencial Estimado
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white font-mono mt-1">
                  ${costoTotalCalculado.toLocaleString("en-US")}{" "}
                  <span className="text-xs font-normal text-slate-400">USD + IVA</span>
                </div>
                <div className="text-sm font-mono text-cyan-400 mt-1">
                  ${costM2Calculado.toLocaleString("en-US")} / m² construido
                </div>
              </div>

              {/* Desglose por Partidas Macroscópicas */}
              <div className="space-y-2 py-4 border-y border-white/10 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Estructura & Cimentación (38%):</span>
                  <span className="font-mono font-bold text-white">${Math.round(costoTotalCalculado * 0.38).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Albañilería & Mampostería (22%):</span>
                  <span className="font-mono font-bold text-white">${Math.round(costoTotalCalculado * 0.22).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Instalaciones Hidro-Eléctricas (18%):</span>
                  <span className="font-mono font-bold text-white">${Math.round(costoTotalCalculado * 0.18).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Acabados Arquitectónicos (22%):</span>
                  <span className="font-mono font-bold text-white">${Math.round(costoTotalCalculado * 0.22).toLocaleString()}</span>
                </div>
              </div>

              {/* BOTÓN CALIBRAR CON RED DE AGENTES */}
              <div className="space-y-3">
                <button
                  onClick={handleAbrirCalibracion}
                  className="w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider py-4 rounded-2xl shadow-xl shadow-cyan-600/25 transition-all min-h-[48px] active:scale-95"
                >
                  <Cpu size={18} />
                  <span>Calibrar con Red de Agentes</span>
                </button>

                <Link
                  href="/dashboard/cotizador"
                  className="w-full inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl border border-white/10 transition-all min-h-[44px]"
                >
                  <span>Abrir Cotizador Avanzado Completo</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                <span>Calibrado con base en 1,420 obras civiles ejecutadas en Ecuador.</span>
              </div>
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* SECCIÓN 5: SARA-BIM 3D TAKEOFF & SARA-TENDERS (SERCOP / VAE) */}
        {/* ============================================================ */}
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-b border-white/10">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-black uppercase tracking-wider">
              <Cuboid size={14} />
              <span>Tecnologías de Vanguardia Constructiva</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
              SARA-BIM 3D Takeoff & SARA-Tenders
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
              Integra tus modelos IFC/Revit para cubicación automática en 3D y gestiona licitaciones públicas con cálculo automatizado de la Matriz VAE (Valor Agregado Ecuatoriano).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* PILAR A: SARA-BIM 3D TAKEOFF */}
            <div className="bg-slate-900/80 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                      <Cuboid size={26} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">SARA-BIM 3D Takeoff</h3>
                      <p className="text-xs text-slate-400">Cómputos métricos desde modelos IFC & Revit</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20">
                    IFC 4.3 / 2x3
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 mt-4 leading-relaxed font-light">
                  Extrae volúmenes de hormigón, áreas de encofrado y peso de armadura directamente de los elementos 3D. Mapea propiedades geométricas a los rubros APU oficiales en un solo clic.
                </p>

                {/* Demostración interactiva de elementos 3D */}
                <div className="mt-5 p-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-white/5 pb-2">
                    <span>Elemento Estructural</span>
                    <span>Cubicación Extraída</span>
                    <span>Rubro APU Vinculado</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                    <span className="text-white font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400" /> Vigas V-101 a V-114
                    </span>
                    <span className="text-cyan-400 font-mono font-bold">48.60 m³</span>
                    <span className="text-slate-400 text-[11px]">Hormigón f&apos;c=240</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                    <span className="text-white font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> Columnas C-30x40
                    </span>
                    <span className="text-cyan-400 font-mono font-bold">32.40 m³</span>
                    <span className="text-slate-400 text-[11px]">Encofrado Metálico</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-white font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400" /> Losa Alivianada e=25cm
                    </span>
                    <span className="text-cyan-400 font-mono font-bold">380.00 m²</span>
                    <span className="text-slate-400 text-[11px]">Bloque Alivianamiento</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 size={15} /> 0% Error de trascripción manual
                </span>
                <Link 
                  href="/dashboard/presupuestos_reales"
                  className="text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider inline-flex items-center gap-1"
                >
                  <span>Ver en Presupuestos</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* PILAR B: SARA-TENDERS (SERCOP & MATRIZ VAE) */}
            <div className="bg-slate-900/80 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                      <FileCheck size={26} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">SARA-Tenders & Matriz VAE</h3>
                      <p className="text-xs text-slate-400">Licitaciones Públicas SERCOP & Umbrales de Ley</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                    Obligatorio SERCOP
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 mt-4 leading-relaxed font-light">
                  Generación automática de la <strong className="text-white font-semibold">Matriz de Valor Agregado Ecuatoriano (VAE)</strong> requerida para compras públicas. Evalúa componentes nacionales vs. importados y audita la elegibilidad de tu oferta frente al umbral legal.
                </p>

                {/* Demostración interactiva de Matriz VAE */}
                <div className="mt-5 p-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Valor Agregado Ecuatoriano (VAE):</span>
                    <span className="text-base font-black text-emerald-400 font-mono">78.40% VAE</span>
                  </div>

                  {/* Barra de progreso VAE */}
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: "78.4%" }} />
                    <div className="h-full bg-slate-600" style={{ width: "21.6%" }} />
                  </div>

                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Componente Nacional: <strong className="text-white">78.4%</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                      Importado: <strong className="text-white">21.6%</strong>
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300">
                    <span>Umbral SERCOP exigido: 40.0%</span>
                    <span className="font-bold flex items-center gap-1">
                      <CheckCircle2 size={14} /> Cumple con Holgura (+38.4%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <FileText size={15} /> Exporta anexos en formato oficial
                </span>
                <Link 
                  href="/dashboard/presupuestos_reales"
                  className="text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider inline-flex items-center gap-1"
                >
                  <span>Auditar Licitación</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* SECCIÓN 6: ACCESO DIRECTO A MÓDULOS DEL DASHBOARD            */}
        {/* ============================================================ */}
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-blue-400">
              Arquitectura de Software
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
              Módulos Operativos de SARA-APU
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
              Herramientas de ingeniería integradas bajo una sola sesión de trabajo en la nube para empresas constructoras y profesionales de Ecuador.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Tarjeta 1: Presupuestos Reales */}
            <Link 
              href="/dashboard/presupuestos_reales" 
              className="p-6 sm:p-7 rounded-3xl bg-slate-900/60 hover:bg-slate-900 border border-white/10 hover:border-purple-500/50 transition-all duration-300 group flex flex-col justify-between shadow-lg min-h-[260px]"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet size={24} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1 block">Presupuesto Ejecutivo</span>
                <h3 className="text-lg font-black text-white uppercase mb-2 group-hover:text-purple-400 transition-colors">Presupuestos Reales</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Crea presupuestos por capítulos y sub-partidas, gestiona cuadrillas y genera cronogramas valorados de obra.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center text-purple-400 font-black text-xs uppercase tracking-wider">
                <span>Gestionar Proyectos</span>
                <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Tarjeta 2: Cotizador Rápido */}
            <Link 
              href="/dashboard/cotizador" 
              className="p-6 sm:p-7 rounded-3xl bg-slate-900/60 hover:bg-slate-900 border border-white/10 hover:border-blue-500/50 transition-all duration-300 group flex flex-col justify-between shadow-lg min-h-[260px]"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Calculator size={24} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1 block">Costeo Paramétrico</span>
                <h3 className="text-lg font-black text-white uppercase mb-2 group-hover:text-blue-400 transition-colors">Cotizador Rápido</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Proyección instantánea de costos por m² según tipología estructural y acabados sin desgloses manuales extensos.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center text-blue-400 font-black text-xs uppercase tracking-wider">
                <span>Comenzar Cotización</span>
                <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Tarjeta 3: Recetas de Rubros */}
            <Link 
              href="/dashboard/apus/rubros" 
              className="p-6 sm:p-7 rounded-3xl bg-slate-900/60 hover:bg-slate-900 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 group flex flex-col justify-between shadow-lg min-h-[260px]"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Layers size={24} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1 block">Recetas & Rendimientos</span>
                <h3 className="text-lg font-black text-white uppercase mb-2 group-hover:text-indigo-400 transition-colors">Recetas de Rubros</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Catálogo con rendimientos de mano de obra, equipos, materiales y acarreo validados en obras reales de Ecuador.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center text-indigo-400 font-black text-xs uppercase tracking-wider">
                <span>Ver Catálogo</span>
                <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Tarjeta 4: Base de Insumos */}
            <Link 
              href="/dashboard/apus/insumos" 
              className="p-6 sm:p-7 rounded-3xl bg-slate-900/60 hover:bg-slate-900 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 group flex flex-col justify-between shadow-lg min-h-[260px]"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Box size={24} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1 block">Materiales & Cuadrillas</span>
                <h3 className="text-lg font-black text-white uppercase mb-2 group-hover:text-emerald-400 transition-colors">Base de Insumos</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Más de 4,167 materiales, jornales y maquinarias con precios de mercado y sincronización en tiempo real.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center text-emerald-400 font-black text-xs uppercase tracking-wider">
                <span>Ver Insumos</span>
                <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

          </div>
        </section>

        {/* ============================================================ */}
        {/* BANNER FINAL DE LLAMADA A LA ACCIÓN (CTA)                    */}
        {/* ============================================================ */}
        <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="relative z-10 max-w-xl text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-3">
                Comienza Hoy Mismo • Ecuador 2026
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3">
                Calcula tus Presupuestos con el Estándar Más Avanzado
              </h3>
              <p className="text-blue-100 text-xs sm:text-sm leading-relaxed font-light">
                Únete a los ingenieros y constructoras que ya optimizan sus costos de obra con los 8 agentes de SARA, fórmulas SERCOP y modelos BIM 3D.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
              <Link 
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-7 py-4 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-blue-50 transition-all shadow-xl min-h-[48px] active:scale-95"
              >
                <span>Acceder al Panel APU</span>
                <ArrowRight size={16} />
              </Link>
              <a 
                href="#cotizador"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider border border-white/20 transition-all min-h-[48px]"
              >
                <span>Probar Cotizador</span>
              </a>
            </div>

            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none transform translate-x-1/4">
              <Layers size={360} />
            </div>
          </div>
        </section>
      </main>

      {/* ============================================================ */}
      {/* MODAL 1: ANALÍTICA DETALLADA DEL AGENTE                      */}
      {/* ============================================================ */}
      {activeAgentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setActiveAgentModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${activeAgentModal.bgColor} ${activeAgentModal.color} border ${activeAgentModal.borderColor}`}>
                {React.createElement(activeAgentModal.icono, { size: 28 })}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-cyan-300 uppercase">
                  {activeAgentModal.alias}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {activeAgentModal.nombre}
                </h3>
                <p className="text-xs text-slate-400">{activeAgentModal.rol}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Métricas de Rendimiento & Memoria Colectiva
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Tasa de Precisión</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">{activeAgentModal.metricas.precision}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Latencia Media</span>
                  <span className="text-lg font-black text-cyan-400 font-mono">{activeAgentModal.metricas.tiempoRespuesta}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Eventos Coordinados</span>
                  <span className="text-lg font-black text-purple-400 font-mono">{activeAgentModal.metricas.eventosCoordinados}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Memoria Asignada</span>
                  <span className="text-lg font-black text-blue-400 font-mono">{activeAgentModal.metricas.memoriaCompartida}</span>
                </div>
                <div className="col-span-2 p-3 rounded-xl bg-slate-950 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Fuente Primaria de Calibración</span>
                  <span className="text-xs font-semibold text-white">{activeAgentModal.metricas.fuentePrimaria}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Registro de Actividad Reciente en Memoria (Event Log)
                </h4>
                <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-white/10 font-mono text-[11px]">
                  <div className="text-emerald-400">
                    [SYNC-EVENT:0942] Memoria compartida sincronizada con bus central (0.012s)
                  </div>
                  <div className="text-slate-300">
                    [CHECK-DATA] Consulta a tarifas provinciales MTOP completada sin advertencias.
                  </div>
                  <div className="text-cyan-400">
                    [AGENT-HANDSHAKE] Coordinación activa con SARA-APU y SARA-Constructora.
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Responsabilidades Operativas en el Presupuesto:
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {activeAgentModal.capacidades.map((cap, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check size={13} className="text-emerald-400 shrink-0" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setActiveAgentModal(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-colors"
              >
                Cerrar Analítica
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: CUADRO COMPARATIVO DE PROVEEDORES                   */}
      {/* ============================================================ */}
      {showProveedorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowProveedorModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 uppercase">
                  Entregable Oficial SARA-APU
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  Cuadro Comparativo de Proveedores de Obra
                </h3>
                <p className="text-xs text-slate-400">Optimización de compras mayoristas y plazos de crédito para construcción</p>
              </div>
            </div>

            {/* Tabla de Proveedores */}
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-3">Insumo Requerido</th>
                    <th className="p-3">Proveedor / Cantera</th>
                    <th className="p-3">Ciudad</th>
                    <th className="p-3">P. Base</th>
                    <th className="p-3">Flete</th>
                    <th className="p-3">Crédito</th>
                    <th className="p-3">Score IA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {proveedoresDemo.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-medium text-white">{item.insumo}</td>
                      <td className="p-3 text-slate-300">
                        <div>{item.proveedor}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{item.cert}</div>
                      </td>
                      <td className="p-3 text-cyan-400 font-mono">{item.ciudad}</td>
                      <td className="p-3 font-mono text-white font-bold">${item.precioBase.toFixed(2)}</td>
                      <td className="p-3 font-mono text-slate-300">+${item.flete.toFixed(2)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold text-[10px]">
                          {item.credito}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-mono font-bold text-cyan-300">{item.score}/100</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 size={16} />
                <span>Recomendación Agéntica: Compra consolidada de Cemento y Acero en Aceros del Ecuador S.A. genera ahorro proyectado de $14,850.</span>
              </div>
              <span className="font-mono font-bold text-white shrink-0">Ahorro: 12.4%</span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
              <span className="text-[11px] text-slate-400 font-mono">
                Documento ID: SARA-DOC-2026-COMP-0881
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowProveedorModal(false)}
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-colors min-h-[40px]"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => alert("Descarga simulada de archivo Excel formal de SARA APU.")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase px-5 py-2.5 rounded-xl shadow transition-colors min-h-[40px]"
                >
                  <Download size={15} />
                  <span>Descargar Cuadro (Excel)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: REPORTE CONSOLIDADO DE INSUMOS & LOGÍSTICA          */}
      {/* ============================================================ */}
      {showReporteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowReporteModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <FileText size={24} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase">
                  Documento Ejecutivo de Fiscalización
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  Reporte Consolidado de Insumos & Logística
                </h3>
                <p className="text-xs text-slate-400">Aprobación técnica de suministro con validación agéntica</p>
              </div>
            </div>

            {/* Cabecera del Documento Oficial */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3 text-xs font-mono">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">PROYECTO:</span>
                <span className="text-white font-bold">CONSTRUCCIÓN EDIFICIO RESIDENCIAL AZUAY 2026</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">UBICACIÓN:</span>
                <span className="text-white">Cuenca, Azuay (Ecuador)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">FECHA DE EMISIÓN:</span>
                <span className="text-cyan-400">15 de Octubre de 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ESTADO DE APROBACIÓN:</span>
                <span className="text-emerald-400 font-bold">DICTAMEN FAVORABLE (8 AGENTES CONCURRENTES)</span>
              </div>
            </div>

            {/* Resumen de Partidas */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Resumen de Suministros Auditados:
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/70 border border-white/5">
                  <span className="text-slate-300">Cemento Portland Tipo I (4,800 sacos)</span>
                  <span className="font-mono text-white font-bold">$40,320.00</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/70 border border-white/5">
                  <span className="text-slate-300">Acero de Refuerzo Grado 60 (28,500 kg)</span>
                  <span className="font-mono text-white font-bold">$26,790.00</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/70 border border-white/5">
                  <span className="text-slate-300">Agregados Pétreos & Acarreo Vial (1,250 m³)</span>
                  <span className="font-mono text-white font-bold">$22,500.00</span>
                </div>
              </div>
            </div>

            {/* Casilla de Firma Director de Obra */}
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="text-center p-4 border border-dashed border-white/20 rounded-xl">
                <div className="text-emerald-400 font-mono text-[10px] mb-2 uppercase tracking-wider">
                  Sello de Verificación Digital SARA-AI
                </div>
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                  <ShieldCheck size={32} />
                </div>
                <span className="text-[10px] font-mono text-slate-400 block">HASH: e89f-2026-cce-sercop</span>
                <span className="text-[10px] font-bold text-emerald-400">Verificado en Cadena</span>
              </div>

              <div className="text-center p-4 border border-dashed border-white/20 rounded-xl flex flex-col justify-end min-h-[140px]">
                <div className="h-12 border-b border-white/30 flex items-end justify-center pb-1">
                  <span className="text-xs font-mono italic text-slate-300">Ing. Andrés Serrano P. - Reg. SENESCYT 1002</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 mt-2 block">
                  Firma del Director de Obra / Residente
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
              <span className="text-[11px] text-slate-400 font-mono">
                Optimizado para exportación e impresión A4
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowReporteModal(false)}
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-colors min-h-[40px]"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => alert("Imprimiendo / Guardando Reporte Oficial en formato PDF")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase px-5 py-2.5 rounded-xl shadow transition-colors min-h-[40px]"
                >
                  <Printer size={15} />
                  <span>Imprimir PDF Oficial</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: CALIBRACIÓN AGÉNTICA EN VIVO DEL COTIZADOR          */}
      {/* ============================================================ */}
      {showCalibracionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-400/30 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowCalibracionModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Cpu size={24} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 uppercase">
                  Memoria Colectiva Activa
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  Calibración Agéntica en Vivo
                </h3>
                <p className="text-xs text-slate-400">Consultando 1,420 proyectos históricos en {cotizadorProvincia}</p>
              </div>
            </div>

            {/* Pasos en Vivo */}
            <div className="space-y-3">
              {/* Paso 1: Salarios */}
              <div className={`p-3.5 rounded-xl border transition-all ${calibracionStep >= 1 ? "bg-slate-950 border-cyan-500/40" : "bg-slate-950/40 border-white/5 opacity-50"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {calibracionStep > 1 ? (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    ) : (
                      <RefreshCw size={16} className="text-cyan-400 animate-spin" />
                    )}
                    <span className="text-xs font-bold text-white">SARA-TalentoHumano: Salarios CCEC 2026</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300">Jornales mínimos sincronizados</span>
                </div>
                {calibracionStep >= 1 && (
                  <p className="text-[11px] text-slate-400 mt-1 pl-6">
                    Ajustado jornal oficial para cuadrilla de albañilería con aportes IESS vigentes en {cotizadorProvincia}.
                  </p>
                )}
              </div>

              {/* Paso 2: Suministros */}
              <div className={`p-3.5 rounded-xl border transition-all ${calibracionStep >= 2 ? "bg-slate-950 border-cyan-500/40" : "bg-slate-950/40 border-white/5 opacity-50"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {calibracionStep > 2 ? (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    ) : (
                      <RefreshCw size={16} className="text-cyan-400 animate-spin" />
                    )}
                    <span className="text-xs font-bold text-white">SARA-Marketplace: Precios en Canteras Locales</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300">Cotejo de 4 distribuidores</span>
                </div>
                {calibracionStep >= 2 && (
                  <p className="text-[11px] text-slate-400 mt-1 pl-6">
                    Comprobado precio de hormigón premezclado y varilla Adelca en distribuidoras de {cotizadorProvincia}.
                  </p>
                )}
              </div>

              {/* Paso 3: Fletes */}
              <div className={`p-3.5 rounded-xl border transition-all ${calibracionStep >= 3 ? "bg-slate-950 border-cyan-500/40" : "bg-slate-950/40 border-white/5 opacity-50"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {calibracionStep > 3 ? (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    ) : (
                      <RefreshCw size={16} className="text-cyan-400 animate-spin" />
                    )}
                    <span className="text-xs font-bold text-white">SARA-Fletes: Factor de Acarreo y Peajes</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300">Distancia vial optimizada</span>
                </div>
                {calibracionStep >= 3 && (
                  <p className="text-[11px] text-slate-400 mt-1 pl-6">
                    Factor de flete: {factoresProvincia[cotizadorProvincia].flete}. Retorno en vacío minimizado.
                  </p>
                )}
              </div>

              {/* Paso 4: Síntesis */}
              <div className={`p-3.5 rounded-xl border transition-all ${calibracionStep >= 4 ? "bg-slate-950 border-emerald-500/40" : "bg-slate-950/40 border-white/5 opacity-50"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="text-xs font-bold text-white">SARA-APU: Presupuesto Calibrado con Éxito</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">100% Calibrado</span>
                </div>
                {calibracionStep >= 4 && (
                  <p className="text-[11px] text-slate-400 mt-1 pl-6">
                    Presupuesto final ajustado a <strong className="text-white font-mono">${costoTotalCalculado.toLocaleString()} USD</strong> (${costM2Calculado} / m²).
                  </p>
                )}
              </div>
            </div>

            {calibracionStep >= 4 && (
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200">
                Tu cotización ha sido calibrada con los parámetros reales de mercado para <strong>{cotizadorProvincia}</strong>. Puedes pasar este cálculo directamente al creador de presupuestos reales.
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
              <button
                onClick={() => setShowCalibracionModal(false)}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition-colors min-h-[40px]"
              >
                Cerrar
              </button>

              <Link
                href={`/dashboard/cotizador?provincia=${cotizadorProvincia}&tipologia=${cotizadorTipologia}&area=${cotizadorArea}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase px-6 py-2.5 rounded-xl shadow-lg transition-all min-h-[40px]"
              >
                <span>Crear Presupuesto con estos Parámetros</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* FOOTER OFICIAL SARA APU                                      */}
      {/* ============================================================ */}
      <footer className="border-t border-white/10 bg-slate-950 py-10 px-4 md:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="font-bold uppercase tracking-wider text-slate-300">
              SARA APU · Plataforma Tecnológica del Grupo SARA © {new Date().getFullYear()}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Ingeniería de Costos, Red Agéntica y Cumplimiento Normativo SERCOP / MTOP para Ecuador.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px]">
            <Link href="/constructora" className="hover:text-white transition-colors">SARA Constructora</Link>
            <Link href="/inmobiliaria" className="hover:text-white transition-colors">SARA Inmobiliaria</Link>
            <Link href="/stays" className="hover:text-white transition-colors">SARA Stays</Link>
            <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300 transition-colors font-bold">Dashboard SaaS</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
