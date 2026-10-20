"use client"

import React, { useState } from "react"
import Link from "next/link"
import { 
  Calculator, 
  Box, 
  Layers, 
  ArrowRight, 
  FileSpreadsheet, 
  Building2, 
  Compass, 
  Ruler, 
  HardHat, 
  Map, 
  Wrench, 
  Eye, 
  FileSignature, 
  Sparkles, 
  Search, 
  PhoneCall, 
  X, 
  Truck, 
  Users, 
  CreditCard, 
  ShoppingCart, 
  CheckCircle2,
  ExternalLink
} from "lucide-react"
import ModuloIntroSplash from "@/components/ui/ModuloIntroSplash"

// Catálogo de Servicios de Grupo SARA
interface ServicioSara {
  id: string
  titulo: string
  categoria: "construccion" | "diseno_consultoria" | "ecosistema"
  categoriaLabel: string
  icono: React.ElementType
  descripcion: string
  highlights: string[]
  href?: string
  badge?: string
  color: {
    bgLight: string
    text: string
    border: string
    badgeBg: string
    badgeText: string
  }
}

const SERVICIOS_GRUPO_SARA: ServicioSara[] = [
  // INGENIERÍA Y CONSTRUCCIÓN
  {
    id: "obras-civiles",
    titulo: "Construcción de Obras Civiles",
    categoria: "construccion",
    categoriaLabel: "Ingeniería & Obra",
    icono: Building2,
    descripcion: "Ejecución integral de proyectos residenciales, comerciales e institucionales con estrictos controles de calidad de materiales y cronograma.",
    highlights: ["Llave en Mano", "Norma NEC-15", "Control de Ensayos", "Bitácora Digital"],
    badge: "Servicio Principal",
    href: "/constructora",
    color: {
      bgLight: "bg-blue-50 dark:bg-blue-950/40",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-100 dark:border-blue-900/50",
      badgeBg: "bg-blue-100 dark:bg-blue-900/60",
      badgeText: "text-blue-700 dark:text-blue-300",
    }
  },
  {
    id: "calculo-estructural",
    titulo: "Ingeniería y Cálculo Estructural",
    categoria: "construccion",
    categoriaLabel: "Ingeniería & Obra",
    icono: Ruler,
    descripcion: "Modelación sismorresistente avanzada, diseño estructural en hormigón armado, perfiles metálicos y optimización de acero de refuerzo.",
    highlights: ["Sismorresistencia NEC", "Memoria de Cálculo", "Modelado ETABS/SAP", "Planos de Armado"],
    href: "/servicios/ingenieria-y-calculo-estructural",
    color: {
      bgLight: "bg-indigo-50 dark:bg-indigo-950/40",
      text: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-100 dark:border-indigo-900/50",
      badgeBg: "bg-indigo-100 dark:bg-indigo-900/60",
      badgeText: "text-indigo-700 dark:text-indigo-300",
    }
  },
  {
    id: "estudios-suelos",
    titulo: "Estudios de Suelos y Geotecnia",
    categoria: "construccion",
    categoriaLabel: "Ingeniería & Obra",
    icono: HardHat,
    descripcion: "Sondeos mecánicos, perforación, ensayos SPT, capacidad portante admisible y recomendaciones técnicas de cimentación profunda y superficial.",
    highlights: ["Ensayos de Laboratorio", "Capacidad Admisible", "Análisis de Asentamientos", "Informe Firmado"],
    href: "/servicios/estudios-de-suelos",
    color: {
      bgLight: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-100 dark:border-amber-900/50",
      badgeBg: "bg-amber-100 dark:bg-amber-900/60",
      badgeText: "text-amber-700 dark:text-amber-300",
    }
  },
  {
    id: "topografia-drones",
    titulo: "Topografía y Planimetría con Drones",
    categoria: "construccion",
    categoriaLabel: "Ingeniería & Obra",
    icono: Map,
    descripcion: "Levantamientos de alta precisión con tecnología GNSS/RTK, estaciones totales y fotogrametría aérea con curvas de nivel georreferenciadas.",
    highlights: ["Drones RTK", "Nubes de Puntos", "Curvas de Nivel", "Replanteo en Obra"],
    href: "/servicios/topografia-y-planimetria",
    color: {
      bgLight: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-100 dark:border-emerald-900/50",
      badgeBg: "bg-emerald-100 dark:bg-emerald-900/60",
      badgeText: "text-emerald-700 dark:text-emerald-300",
    }
  },
  {
    id: "supervision-obras",
    titulo: "Dirección y Supervisión de Obras",
    categoria: "construccion",
    categoriaLabel: "Ingeniería & Obra",
    icono: Eye,
    descripcion: "Fiscalización técnica independiente, verificación de rendimientos, control presupuestario y recepción provisional y definitiva de proyectos.",
    highlights: ["Control de Calidad", "Planillas de Avance", "Seguridad Ocupacional", "Informes Periódicos"],
    href: "/servicios/direccion-y-supervision",
    color: {
      bgLight: "bg-cyan-50 dark:bg-cyan-950/40",
      text: "text-cyan-600 dark:text-cyan-400",
      border: "border-cyan-100 dark:border-cyan-900/50",
      badgeBg: "bg-cyan-100 dark:bg-cyan-900/60",
      badgeText: "text-cyan-700 dark:text-cyan-300",
    }
  },

  // DISEÑO, BIM Y CONSULTORÍA
  {
    id: "diseno-arquitectonico",
    titulo: "Diseño Arquitectónico y Urbano",
    categoria: "diseno_consultoria",
    categoriaLabel: "Diseño & BIM",
    icono: Compass,
    descripcion: "Conceptualización de vanguardia, distribución funcional bioclimática, optimización espacial y preparación de proyectos ejecutivos listos para aprobación.",
    highlights: ["Planos Municipales", "Diseño Bioclimático", "Espacios Eficientes", "Interiorismo"],
    badge: "Creatividad Premium",
    href: "/servicios/diseno-arquitectonico",
    color: {
      bgLight: "bg-purple-50 dark:bg-purple-950/40",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-100 dark:border-purple-900/50",
      badgeBg: "bg-purple-100 dark:bg-purple-900/60",
      badgeText: "text-purple-700 dark:text-purple-300",
    }
  },
  {
    id: "modelado-bim",
    titulo: "Modelado 3D, BIM y Renders 4K",
    categoria: "diseno_consultoria",
    categoriaLabel: "Diseño & BIM",
    icono: Box,
    descripcion: "Gemelos digitales, modelado BIM en Revit/Archicad, detección de colisiones de instalaciones y visualización fotorrealista hiperdetallada.",
    highlights: ["Revit / IFC", "Renders 4K", "Recorridos Virtuales", "Clash Detection"],
    href: "/servicios/modelado-3d-y-renders",
    color: {
      bgLight: "bg-teal-50 dark:bg-teal-950/40",
      text: "text-teal-600 dark:text-teal-400",
      border: "border-teal-100 dark:border-teal-900/50",
      badgeBg: "bg-teal-100 dark:bg-teal-900/60",
      badgeText: "text-teal-700 dark:text-teal-300",
    }
  },
  {
    id: "presupuestos-apu",
    titulo: "Presupuestos y Análisis APU Especializado",
    categoria: "diseno_consultoria",
    categoriaLabel: "Diseño & BIM",
    icono: Calculator,
    descripcion: "Estructuración de presupuestos oficiales por rubros, análisis de precios unitarios con cuadrillas y cálculo paramétrico de indirectos (AIU).",
    highlights: ["Base de Datos Actualizada", "Fórmulas AIU", "Explosión de Insumos", "Formatos SERCOP / Contraloría"],
    badge: "Core SaaS",
    href: "/dashboard/presupuestos_reales",
    color: {
      bgLight: "bg-rose-50 dark:bg-rose-950/40",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-100 dark:border-rose-900/50",
      badgeBg: "bg-rose-100 dark:bg-rose-900/60",
      badgeText: "text-rose-700 dark:text-rose-300",
    }
  },
  {
    id: "remodelaciones",
    titulo: "Remodelaciones y Acabados de Lujo",
    categoria: "diseno_consultoria",
    categoriaLabel: "Diseño & BIM",
    icono: Wrench,
    descripcion: "Reforma total y modernización de inmuebles comerciales y residenciales con carpintería a medida, porcelanatos finos e iluminación domótica.",
    highlights: ["Cero Imprevistos", "Acabados de Alta Gama", "Optimización Térmica", "Garantía de Obra"],
    href: "/servicios/remodelaciones-y-ampliaciones",
    color: {
      bgLight: "bg-orange-50 dark:bg-orange-950/40",
      text: "text-orange-600 dark:text-orange-400",
      border: "border-orange-100 dark:border-orange-900/50",
      badgeBg: "bg-orange-100 dark:bg-orange-900/60",
      badgeText: "text-orange-700 dark:text-orange-300",
    }
  },
  {
    id: "consultoria-tecnica",
    titulo: "Consultoría Técnica y Peritajes",
    categoria: "diseno_consultoria",
    categoriaLabel: "Diseño & BIM",
    icono: FileSignature,
    descripcion: "Asesoramiento legal-técnico en normativa urbana, peritajes estructurales para litigios, avalúos de inmuebles y gestión de permisos municipales.",
    highlights: ["Peritaje Certificado", "Avalúos Comerciales", "Gestión de Permisos", "Auditoría de Obra"],
    href: "/servicios/consultoria-tecnica",
    color: {
      bgLight: "bg-slate-100 dark:bg-slate-800/60",
      text: "text-slate-700 dark:text-slate-300",
      border: "border-slate-200 dark:border-slate-700",
      badgeBg: "bg-slate-200 dark:bg-slate-700",
      badgeText: "text-slate-800 dark:text-slate-200",
    }
  },

  // ECOSISTEMA DIGITAL SARA
  {
    id: "sara-constructora-suite",
    titulo: "SARA-CONSTRUCTORA (Suite Operativa Avanzada)",
    categoria: "ecosistema",
    categoriaLabel: "Ecosistema SARA",
    icono: Sparkles,
    descripcion: "Núcleo agéntico empresarial: 3-Way Match SRI con retenciones automáticas, Kardex Multibodega, Nómina IESS Construcción y Procuramiento Predictivo con landed cost.",
    highlights: ["3-Way Match SRI (≤1%)", "Kardex Multibodega CPP", "Nómina IESS & Décimos", "Procuramiento 24 Provincias"],
    badge: "Módulo Estrella",
    href: "/constructora/suite",
    color: {
      bgLight: "bg-amber-500/10 dark:bg-amber-500/20",
      text: "text-amber-500 dark:text-amber-400",
      border: "border-amber-500/30 dark:border-amber-500/40",
      badgeBg: "bg-amber-500/20 dark:bg-amber-500/30",
      badgeText: "text-amber-600 dark:text-amber-300",
    }
  },
  {
    id: "sara-inmobiliaria",
    titulo: "SARA Inmobiliaria (Portal & Asesoría)",
    categoria: "ecosistema",
    categoriaLabel: "Ecosistema SARA",
    icono: Building2,
    descripcion: "Compra, venta y arrendamiento de bienes raíces seleccionados con respaldo legal, técnico y arquitectónico garantizado por SARA Constructora.",
    highlights: ["Bienes Raíces Verificados", "Seguridad Jurídica", "Tours Virtuales", "Créditos Hipotecarios"],
    badge: "Plataforma Activa",
    href: "/inmobiliaria",
    color: {
      bgLight: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-100 dark:border-emerald-900/50",
      badgeBg: "bg-emerald-100 dark:bg-emerald-900/60",
      badgeText: "text-emerald-700 dark:text-emerald-300",
    }
  },
  {
    id: "sara-stays",
    titulo: "SARA Stays (Alojamientos Exclusivos)",
    categoria: "ecosistema",
    categoriaLabel: "Ecosistema SARA",
    icono: Compass,
    descripcion: "Gestión de hospedaje contemporáneo, suites corporativas y villas turísticas con experiencia tipo boutique en Loja y el sur del Ecuador.",
    highlights: ["Reservas Instantáneas", "Suites Amobladas", "Manejo Integral", "Altos Retornos"],
    badge: "Hospitality Tech",
    href: "/stays",
    color: {
      bgLight: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-100 dark:border-amber-900/50",
      badgeBg: "bg-amber-100 dark:bg-amber-900/60",
      badgeText: "text-amber-700 dark:text-amber-300",
    }
  },
  {
    id: "sara-compras",
    titulo: "SARA Compras (Marketplace B2B Insumos)",
    categoria: "ecosistema",
    categoriaLabel: "Ecosistema SARA",
    icono: ShoppingCart,
    descripcion: "Central de compras de insumos y materiales para constructores con precios mayoristas en vivo y despacho coordinado a pie de obra.",
    highlights: ["Precios en Vivo", "Cotización Masiva", "Proveedores Verificados", "Descuento por Volumen"],
    href: "/modulos/compras",
    color: {
      bgLight: "bg-cyan-50 dark:bg-cyan-950/40",
      text: "text-cyan-600 dark:text-cyan-400",
      border: "border-cyan-100 dark:border-cyan-900/50",
      badgeBg: "bg-cyan-100 dark:bg-cyan-900/60",
      badgeText: "text-cyan-700 dark:text-cyan-300",
    }
  },
  {
    id: "sara-fletes",
    titulo: "Red de Fletes & Maquinaria Pesada",
    categoria: "ecosistema",
    categoriaLabel: "Ecosistema SARA",
    icono: Truck,
    descripcion: "Asignación logística de volquetas, grúas, transporte pesado y alquiler de maquinaria con tracking satelital y tarifas transparentes.",
    highlights: ["Geolocalización GPS", "Tarifas Estándar", "Carga Segura", "Disponibilidad Inmediata"],
    href: "/modulos/fletes",
    color: {
      bgLight: "bg-blue-50 dark:bg-blue-950/40",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-100 dark:border-blue-900/50",
      badgeBg: "bg-blue-100 dark:bg-blue-900/60",
      badgeText: "text-blue-700 dark:text-blue-300",
    }
  },
  {
    id: "sara-talento",
    titulo: "SARA Talento (Bolsa Laboral Técnica)",
    categoria: "ecosistema",
    categoriaLabel: "Ecosistema SARA",
    icono: Users,
    descripcion: "Conexión directa y matching de ingenieros residentes, maestros mayores, topógrafos y cuadrillas especializadas con calificaciones de obra.",
    highlights: ["Perfiles Verificados", "Evaluación de Habilidades", "Contratación Ágil", "Historial de Obras"],
    href: "/modulos/talento",
    color: {
      bgLight: "bg-violet-50 dark:bg-violet-950/40",
      text: "text-violet-600 dark:text-violet-400",
      border: "border-violet-100 dark:border-violet-900/50",
      badgeBg: "bg-violet-100 dark:bg-violet-900/60",
      badgeText: "text-violet-700 dark:text-violet-300",
    }
  },
  {
    id: "sara-fintech",
    titulo: "SARA Fintech & Pagos Escrow",
    categoria: "ecosistema",
    categoriaLabel: "Ecosistema SARA",
    icono: CreditCard,
    descripcion: "Gestión de pagos condicionados a hitos verificados de obra, retenciones reglamentarias y anticipos seguros para proteger a clientes y contratistas.",
    highlights: ["Pagos por Hito", "Custodia Segura", "Comprobantes Fiscales", "Transparencia Total"],
    href: "/modulos/financiero",
    color: {
      bgLight: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-100 dark:border-emerald-900/50",
      badgeBg: "bg-emerald-100 dark:bg-emerald-900/60",
      badgeText: "text-emerald-700 dark:text-emerald-300",
    }
  }
]

export default function DashboardPage() {
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos")
  const [busqueda, setBusqueda] = useState<string>("")
  const [servicioSeleccionado, setServicioSeleccionado] = useState<ServicioSara | null>(null)
  const [modalContactoAbierto, setModalContactoAbierto] = useState<boolean>(false)

  // Filtrado de servicios
  const serviciosFiltrados = SERVICIOS_GRUPO_SARA.filter(servicio => {
    const coincideCategoria = filtroCategoria === "todos" || servicio.categoria === filtroCategoria
    const coincideBusqueda = 
      servicio.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      servicio.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      servicio.highlights.some(h => h.toLowerCase().includes(busqueda.toLowerCase()))
    return coincideCategoria && coincideBusqueda
  })

  const abrirModalContacto = (servicio: ServicioSara) => {
    setServicioSeleccionado(servicio)
    setModalContactoAbierto(true)
  }

  const generarEnlaceWhatsApp = (servicio: ServicioSara | null) => {
    const telefono = "593981804023" // Número oficial de atención corporativa
    const texto = encodeURIComponent(
      `Hola Grupo SARA, me interesa solicitar información técnica y cotización para el servicio: *${servicio?.titulo || "Servicios Generales"}*. Por favor, me gustaría coordinar una reunión técnica.`
    )
    return `https://wa.me/${telefono}?text=${texto}`
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-300 pb-16">
      {/* Intro con logotipo oficial 3D de SARA APU */}
      <ModuloIntroSplash modulo="apu" />

      {/* HEADER DE BIENVENIDA Y ESTADO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold mb-3 border border-blue-200/60 dark:border-blue-800/60">
            <Sparkles size={14} className="text-blue-600 animate-pulse" />
            Ecosistema Tecnológico de Construcción • Ecuador 2026
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Panel de Operaciones & Presupuestos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl text-sm md:text-base leading-relaxed">
            Plataforma integral para análisis de precios unitarios (APU), control financiero de obra y acceso directo al portafolio corporativo de <strong>Grupo SARA</strong>.
          </p>
        </div>

        {/* Indicadores en Vivo */}
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs flex items-center gap-3 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <div>
              <p className="font-bold text-gray-800 dark:text-white">Base APU Activa</p>
              <p className="text-gray-500 dark:text-gray-400 text-[11px]">Catálogo Loja / Nacional</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 ACCESOS CLAVE AL MÓDULO APU */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calculator size={20} className="text-blue-600" />
            Herramientas del Módulo APU
          </h2>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Cálculo & Presupuestos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Tarjeta 1: Presupuestos Reales */}
          <Link 
            href="/dashboard/presupuestos_reales" 
            className="group bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xs border border-gray-200/80 dark:border-slate-800 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-800 transition-all duration-300 relative overflow-hidden"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileSpreadsheet size={24} />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 mb-2 inline-block">
              Cálculo AIU & Gantt
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Presupuestos Reales
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs mb-4 leading-relaxed">
              Elabora presupuestos detallados por rubros, gestiona factores de indirectos y exporta reportes en PDF y Excel.
            </p>
            <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold text-xs mt-auto">
              Gestionar Proyectos <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Tarjeta 2: Cotizador Rápido */}
          <Link 
            href="/dashboard/cotizador" 
            className="group bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xs border border-gray-200/80 dark:border-slate-800 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-300 relative overflow-hidden"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calculator size={24} />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-2 inline-block">
              Estimación Paramétrica
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Cotizador Rápido
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs mb-4 leading-relaxed">
              Calcula costos proyectados de construcción por m² según pendiente, acabados y tipología estructural sin desglose manual.
            </p>
            <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold text-xs mt-auto">
              Cotizar Proyecto <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Tarjeta 3: Mis Rubros */}
          <Link 
            href="/dashboard/apus/rubros" 
            className="group bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xs border border-gray-200/80 dark:border-slate-800 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-800 transition-all duration-300 relative overflow-hidden"
          >
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Layers size={24} />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-2 inline-block">
              Recetas & Cuadrillas
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Mis Rubros (Recetas)
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs mb-4 leading-relaxed">
              Administra composiciones de análisis de precios unitarios, modifica rendimientos de mano de obra y crea recetas maestras.
            </p>
            <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-semibold text-xs mt-auto">
              Ver Catálogo <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Tarjeta 4: Mis Insumos */}
          <Link 
            href="/dashboard/apus/insumos" 
            className="group bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xs border border-gray-200/80 dark:border-slate-800 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-800 transition-all duration-300 relative overflow-hidden"
          >
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Box size={24} />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-2 inline-block">
              Materiales & Equipos
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Mis Insumos
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs mb-4 leading-relaxed">
              Actualiza precios unitarios sin IVA para materiales, salarios de categorías ocupacionales y tarifas horarias de maquinaria.
            </p>
            <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold text-xs mt-auto">
              Ver Insumos <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* BANNER INFORMATIVO CATÁLOGO MAESTRO */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-white/20">
            <CheckCircle2 size={14} className="text-emerald-400" />
            Base de Datos Certificada Sara Constructora
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            Catálogo Maestro a tu Disposición
          </h2>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed mb-5">
            Como usuario activo, dispones de miles de insumos y rubros pre-calibrados por Sara Constructora. Puedes importarlos como plantilla, clonarlos y personalizar tus rendimientos sin modificar la base pública comunitaria.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link 
              href="/dashboard/apus/importador"
              className="inline-flex items-center gap-2 bg-white text-slate-900 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-50 transition-colors shadow-md"
            >
              <FileSpreadsheet size={16} className="text-blue-700" />
              Importar Excel Masivo
            </Link>
            <Link 
              href="/dashboard/apus/rubros"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors border border-white/20"
            >
              Explorar Rubros Oficiales
            </Link>
          </div>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none transform translate-x-1/4">
          <Layers size={360} />
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL: PORTAFOLIO DE SERVICIOS GRUPO SARA */}
      <div className="pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
              <span className="w-6 h-0.5 bg-blue-600 dark:bg-blue-400"></span>
              Portafolio Corporativo
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Servicios que Ofrece el Grupo SARA
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Soluciones integrales de arquitectura, ingeniería, construcción y servicios tecnológicos para cada fase de tu proyecto.
            </p>
          </div>

          {/* BUSCADOR RÁPIDO */}
          <div className="relative min-w-[260px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar servicio o especialidad..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* PESTAÑAS DE FILTRO POR CATEGORÍA */}
        <div className="flex flex-wrap gap-2 pb-6 border-b border-gray-200/80 dark:border-slate-800">
          {[
            { id: "todos", label: "Todos los Servicios", count: SERVICIOS_GRUPO_SARA.length },
            { id: "construccion", label: "Ingeniería & Obra Civil", count: SERVICIOS_GRUPO_SARA.filter(s => s.categoria === "construccion").length },
            { id: "diseno_consultoria", label: "Diseño & BIM", count: SERVICIOS_GRUPO_SARA.filter(s => s.categoria === "diseno_consultoria").length },
            { id: "ecosistema", label: "Ecosistema SARA Tech", count: SERVICIOS_GRUPO_SARA.filter(s => s.categoria === "ecosistema").length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFiltroCategoria(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                filtroCategoria === tab.id
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                  : "bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200/80 dark:border-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                filtroCategoria === tab.id 
                  ? "bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900" 
                  : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* GRID DE SERVICIOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          {serviciosFiltrados.map((servicio) => {
            const Icono = servicio.icono
            return (
              <div
                key={servicio.id}
                className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden"
              >
                {/* Header de la tarjeta */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${servicio.color.bgLight} ${servicio.color.text} flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs`}>
                    <Icono size={24} />
                  </div>
                  {servicio.badge && (
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${servicio.color.badgeBg} ${servicio.color.badgeText}`}>
                      {servicio.badge}
                    </span>
                  )}
                </div>

                <div className="mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {servicio.categoriaLabel}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-0.5">
                    {servicio.titulo}
                  </h3>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed mb-5 flex-1">
                  {servicio.descripcion}
                </p>

                {/* Highlights técnicos */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {servicio.highlights.map((item, idx) => (
                    <span 
                      key={idx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-slate-700/50"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                {/* Acciones */}
                <div className="pt-4 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
                  <button
                    onClick={() => abrirModalContacto(servicio)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors py-1 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40"
                  >
                    <PhoneCall size={14} />
                    Cotizar Servicio
                  </button>

                  {servicio.href ? (
                    <Link
                      href={servicio.href}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group/link"
                    >
                      Ver Detalle
                      <ExternalLink size={13} className="group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  ) : (
                    <span className="text-[11px] text-gray-400 italic">Sara Constructora</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {serviciosFiltrados.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-8">
            <Search size={36} className="mx-auto text-gray-400 mb-3" />
            <h4 className="text-base font-bold text-gray-800 dark:text-white">No se encontraron servicios</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Prueba buscando con otro término o selecciona "Todos los Servicios".
            </p>
            <button
              onClick={() => { setBusqueda(""); setFiltroCategoria("todos"); }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              Restablecer Filtros
            </button>
          </div>
        )}
      </div>

      {/* CROSS-SELLING ECOSISTEMA SARA BANNER COMPLETO */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 text-white shadow-xl border border-slate-700/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-blue-500/30">
              <Sparkles size={14} /> Ecosistema Empresarial Unificado
            </div>
            <h3 className="text-2xl font-black mb-2">
              ¿Requieres un Proyecto Llave en Mano o Consultoría Completa?
            </h3>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              El equipo de ingenieros, arquitectos y calculistas de Grupo SARA coordina tu obra desde el levantamiento topográfico y el estudio de suelos hasta la entrega física y comercialización inmobiliaria.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a 
              href="https://wa.me/593981804023?text=Hola%20Grupo%20SARA%2C%20deseo%20agendar%20una%20reuni%C3%B3n%20para%20un%20proyecto%20integral"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold text-xs shadow-lg transition-all hover:scale-105"
            >
              <PhoneCall size={16} /> Contactar Asesor Corporativo
            </a>
            <Link 
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl font-bold text-xs border border-white/20 transition-colors"
            >
              Visitar Portal Institucional
            </Link>
          </div>
        </div>
      </div>

      {/* MODAL INTERACTIVO DE CONTACTO Y COTIZACIÓN RÁPIDA */}
      {modalContactoAbierto && servicioSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setModalContactoAbierto(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-2xl ${servicioSeleccionado.color.bgLight} ${servicioSeleccionado.color.text} flex items-center justify-center`}>
                {React.createElement(servicioSeleccionado.icono, { size: 24 })}
              </div>
              <div>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Cotización Directa Grupo SARA
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {servicioSeleccionado.titulo}
                </h3>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 mb-5 leading-relaxed bg-gray-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-gray-100 dark:border-slate-800">
              {servicioSeleccionado.descripcion}
            </p>

            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Incluye en la atención técnica:
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {servicioSeleccionado.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <a
                href={generarEnlaceWhatsApp(servicioSeleccionado)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all"
              >
                <PhoneCall size={16} /> Solicitar Cotización vía WhatsApp
              </a>

              {servicioSeleccionado.href && (
                <Link
                  href={servicioSeleccionado.href}
                  onClick={() => setModalContactoAbierto(false)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 py-2.5 rounded-xl font-semibold text-xs transition-colors"
                >
                  <ExternalLink size={14} /> Ir a la Sección Específica
                </Link>
              )}

              <button
                onClick={() => setModalContactoAbierto(false)}
                className="w-full py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
