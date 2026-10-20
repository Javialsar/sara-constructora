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
  Database, 
  Building2,
  ChevronRight,
  HardHat,
  Cpu,
  Clock,
  FileCheck,
  Bot,
  Brain,
  Network,
  Zap,
  Shield,
  Truck,
  Users,
  Home,
  Bed,
  CreditCard,
  Cuboid,
  FileText,
  BarChart3,
  ExternalLink,
  Lock,
  ArrowUpRight,
  Check
} from "lucide-react"
import ModuloIntroSplash from "@/components/ui/ModuloIntroSplash"
import { getLogosEmpresa, DEFAULT_LOGOS_EMPRESA } from "@/lib/services/logosService"

export default function SaraApuLandingPage() {
  const [logoApu, setLogoApu] = useState(DEFAULT_LOGOS_EMPRESA.apu)

  useEffect(() => {
    getLogosEmpresa().then((logos) => {
      if (logos?.apu) setLogoApu(logos.apu)
    })
  }, [])

  // 1. LOS 8 AGENTES COLECTIVOS - DESCRIPCIÓN CONCISA DE QUÉ HACE CADA UNO
  const agentes = [
    {
      id: "constructora",
      nombre: "SARA-Constructora",
      rol: "Iniciador Técnico & Georreferenciación",
      icono: Building2,
      color: "text-blue-400",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      borderHover: "hover:border-blue-500/50",
      queHace: "Captura los requerimientos de tu proyecto civil o vial, geolocaliza la obra en Ecuador y define la tipología estructural inicial.",
      beneficio: "Estructura la base técnica del proyecto en segundos para que no empieces desde cero.",
      evento: "Dispara: PROYECTO_CREADO"
    },
    {
      id: "apu",
      nombre: "SARA-APU",
      rol: "Motor de Costos & Rendimientos",
      icono: Calculator,
      color: "text-cyan-400",
      badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      borderHover: "hover:border-cyan-500/50",
      queHace: "Desglosa cada rubro de obra en materiales, mano de obra, maquinaria y transporte, calculando el costo directo y los indirectos (AIU).",
      beneficio: "Garantiza presupuestos exactos calibrados con rendimientos reales de obra en Ecuador.",
      evento: "Dispara: APU_CONSOLIDADO"
    },
    {
      id: "marketplace",
      nombre: "SARA-Marketplace",
      rol: "Optimizador de Suministros",
      icono: Box,
      color: "text-amber-400",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      borderHover: "hover:border-amber-500/50",
      queHace: "Cruza la lista de materiales de tu presupuesto con los inventarios y precios en vivo de canteras y proveedores mayoristas aliados.",
      beneficio: "Encuentra la combinación más económica de compra cerca de tu obra para bajar costos.",
      evento: "Dispara: SUMINISTROS_ASIGNADOS"
    },
    {
      id: "fletes",
      nombre: "SARA-Fletes",
      rol: "Logística Pesada & Cubicación",
      icono: Truck,
      color: "text-orange-400",
      badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      borderHover: "hover:border-orange-500/50",
      queHace: "Calcula el peso, volumen y tipo de transporte pesado requerido (volquetas, mulas, plataformas) y traza la ruta de acarreo más eficiente.",
      beneficio: "Elimina sobrecostos de acarreo y fletes sorpresa en tu presupuesto.",
      evento: "Dispara: LOGISTICA_PROCESADA"
    },
    {
      id: "talento",
      nombre: "SARA-TalentoHumano",
      rol: "Cuadrillas & Reclutamiento Obrero",
      icono: Users,
      color: "text-emerald-400",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      borderHover: "hover:border-emerald-500/50",
      queHace: "Traduce las horas/hombre del presupuesto en cuadrillas tipo (maestros, albañiles, peones) aplicando las tablas salariales del sector (CCEC).",
      beneficio: "Te dice cuántos trabajadores necesitas contratar para cumplir el cronograma.",
      evento: "Dispara: PERSONAL_ESTRUCTURADO"
    },
    {
      id: "inmobiliaria",
      nombre: "SARA-Inmobiliaria",
      rol: "Modelador de Rentabilidad & Ventas",
      icono: Home,
      color: "text-purple-400",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      borderHover: "hover:border-purple-500/50",
      queHace: "Evalúa el valor por metro cuadrado terminado y calcula la plusvalía proyectada y el tiempo estimado de retorno de inversión.",
      beneficio: "Le da al constructor o inversionista la rentabilidad real de su proyecto.",
      evento: "Dispara: VIABILIDAD_CALCULADA"
    },
    {
      id: "alojamiento",
      nombre: "SARA-Alojamiento",
      rol: "Campamentos & Hospedaje Técnico",
      icono: Bed,
      color: "text-rose-400",
      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      borderHover: "hover:border-rose-500/50",
      queHace: "Gestiona el hospedaje del equipo técnico o campamentos temporales para cuadrillas cerca de la zona de obra.",
      beneficio: "Asegura el bienestar y la puntualidad del personal sin pagar hoteles costosos.",
      evento: "Dispara: LOGISTICA_PERSONAL_LISTA"
    },
    {
      id: "pagos",
      nombre: "SARA-Pagos",
      rol: "Anticipos, Pólizas & Transacciones",
      icono: CreditCard,
      color: "text-teal-400",
      badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      borderHover: "hover:border-teal-500/50",
      queHace: "Gestiona las cuentas de custodia, garantías de fiel cumplimiento, pólizas de buen uso del anticipo y pasarelas de pago seguras.",
      beneficio: "Protege el flujo financiero de la obra y blinda las transacciones entre partes.",
      evento: "Dispara: FINANCIAMIENTO_BLINDADO"
    }
  ]

  // 2. CAPACIDADES DE INTELIGENCIA ARTIFICIAL Y ASESORÍA
  const caracteristicasIA = [
    {
      titulo: "SARA-AI-Rubros (Creación con Lenguaje Natural)",
      subtitulo: "Generador Autónomo de Matrices de Costo",
      icono: Sparkles,
      color: "text-cyan-400",
      borderHover: "hover:border-cyan-500/40",
      badge: "Inteligencia Artificial",
      queHace: "Solo escribe qué deseas construir (ej: 'Muro de contención de hormigón ciclópeo de 3m en Loja') y la IA genera la matriz completa de insumos, cuadrillas y equipos con precios de mercado.",
      paraQueSirve: "Crea rubros nuevos en 10 segundos sin tener que buscar cada material o rendimiento a mano.",
      enlace: "/dashboard/apus/ai-rubros",
      textoEnlace: "Ver Generador IA"
    },
    {
      titulo: "Aislamiento Seguro de Catálogo Maestro",
      subtitulo: "Tus Rubros Pertenecen Exclusivamente a Tu Obra",
      icono: ShieldCheck,
      color: "text-emerald-400",
      borderHover: "hover:border-emerald-500/40",
      badge: "Seguridad y Privacidad",
      queHace: "Garantiza que todos los rubros, insumos y modificaciones que crees con IA o manualmente dentro de tu proyecto queden estrictamente privados en tu cuenta.",
      paraQueSirve: "Protege tus secretos de precios y evita que el Catálogo Maestro Oficial del Grupo SARA sea alterado o corrompido.",
      enlace: "/dashboard/presupuestos_reales",
      textoEnlace: "Gestión Segura"
    },
    {
      titulo: "Co-Piloto Asesor Interactivo de Obra",
      subtitulo: "Recomendaciones Técnicas y Financieras en Pantalla",
      icono: Bot,
      color: "text-blue-400",
      borderHover: "hover:border-blue-500/40",
      badge: "Asesor en Tiempo Real",
      queHace: "Analiza tu presupuesto mientras lo editas y te sugiere proactivamente mejores opciones de compra, días de crédito de proveedores y optimización de fletes.",
      paraQueSirve: "Actúa como un director de costos senior que te ayuda a tomar decisiones que maximizan tu utilidad.",
      enlace: "/dashboard/agentes",
      textoEnlace: "Conocer el Co-Piloto"
    },
    {
      titulo: "Reportes y Documentos Oficiales Exportables",
      subtitulo: "Cuadros Comparativos y Resumen Ejecutivo",
      icono: FileText,
      color: "text-purple-400",
      borderHover: "hover:border-purple-500/40",
      badge: "Exportables PDF y Excel",
      queHace: "Genera automáticamente dos documentos: el 'Cuadro Comparativo de Proveedores' y el 'Reporte Consolidado de Insumos y Logística' listos para firma.",
      paraQueSirve: "Entrega informes impecables a la fiscalización, entidades públicas o inversionistas con un solo clic.",
      enlace: "/dashboard/docs",
      textoEnlace: "Explorar Documentos"
    }
  ]

  // 3. SUITE COMPLETA DE MÓDULOS DE INGENIERÍA
  const modulosIngenieria = [
    {
      titulo: "Cotizador Paramétrico Rápido 2026",
      categoria: "Presupuestos en 30 Segundos",
      icono: Calculator,
      color: "text-blue-400",
      borderHover: "hover:border-blue-500/40",
      queHace: "Calcula el costo total referencial de una obra ingresando el metraje cuadrado, la provincia (Pichincha, Guayas, Azuay, Loja, etc.) y la tipología.",
      beneficio: "Presenta una propuesta económica inmediata a tu cliente en la primera reunión.",
      enlace: "/dashboard/cotizador",
      textoEnlace: "Abrir Cotizador"
    },
    {
      titulo: "Presupuestos Reales & Factor AIU",
      categoria: "Gestión Detallada por Capítulos",
      icono: FileSpreadsheet,
      color: "text-purple-400",
      borderHover: "hover:border-purple-500/40",
      queHace: "Permite estructurar presupuestos completos organizados por capítulos, con cálculo automático de indirectos (Administración, Imprevistos y Utilidad).",
      beneficio: "Control milimétrico de cada centavo y cronogramas de obra valorados.",
      enlace: "/dashboard/presupuestos_reales",
      textoEnlace: "Ver Presupuestos"
    },
    {
      titulo: "SARA-BIM (Cómputos 3D y Take-Off)",
      categoria: "Extracción Directa de Planos",
      icono: Cuboid,
      color: "text-indigo-400",
      borderHover: "hover:border-indigo-500/40",
      queHace: "Extrae de forma automática las volumetrías y cantidades de obra desde tus modelos 3D en formato IFC o Revit directamente a los rubros del APU.",
      beneficio: "Ahorra semanas de medición manual y elimina errores de cálculo en planos.",
      enlace: "/dashboard/apus/bim",
      textoEnlace: "Módulo BIM"
    },
    {
      titulo: "SARA-Tenders & Matriz VAE (SERCOP)",
      categoria: "Compras Públicas y Licitaciones",
      icono: FileCheck,
      color: "text-emerald-400",
      borderHover: "hover:border-emerald-500/40",
      queHace: "Audita pliegos de licitación del SERCOP y calcula automáticamente la Matriz de Valor Agregado Ecuatoriano (VAE) requerida por ley.",
      beneficio: "Evita descalificaciones técnicas en portales de compras públicas del Estado.",
      enlace: "/dashboard/sercop/radar",
      textoEnlace: "Ver Licitaciones"
    },
    {
      titulo: "Catálogo Maestro de Insumos Calibrados",
      categoria: "+4,167 Materiales y Cuadrillas",
      icono: Database,
      color: "text-amber-400",
      borderHover: "hover:border-amber-500/40",
      queHace: "Base de datos viva con precios actualizados de materiales, cuadrillas de mano de obra según la CCEC y costos de hora-máquina en Ecuador.",
      beneficio: "No pierdes tiempo cotizando por teléfono cada clavo o saco de cemento.",
      enlace: "/dashboard/apus/insumos",
      textoEnlace: "Explorar Insumos"
    },
    {
      titulo: "Recetas de Rubros Homologadas",
      categoria: "Rendimientos Comprobados en Obra",
      icono: Layers,
      color: "text-teal-400",
      borderHover: "hover:border-teal-500/40",
      queHace: "Biblioteca de análisis de precios unitarios aprobados y utilizados por constructoras líderes en obras viales, civiles y residenciales.",
      beneficio: "Rendimientos reales validados en campo para no subestimar ni inflar precios.",
      enlace: "/dashboard/apus/rubros",
      textoEnlace: "Ver Rubros"
    }
  ]

  return (
    <div className="min-h-screen bg-[#070b0e] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white relative">
      {/* Intro con logotipo 3D oficial de SARA APU */}
      <ModuloIntroSplash modulo="apu" />

      {/* Sub-header de navegación rápida APU */}
      <nav className="w-full bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="min-h-[44px] inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors font-semibold"
            >
              <span>← Grupo SARA</span>
            </Link>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              SARA APU • Software de Costos & Red Agéntica
            </div>
            <span className="hidden sm:inline text-white/20">|</span>
            <span className="hidden sm:inline text-slate-400 text-xs">Ecuador 2026</span>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard/cotizador" 
              className="text-slate-300 hover:text-white transition-colors font-bold text-xs uppercase tracking-wider hidden sm:inline-block"
            >
              Cotizador Rápido
            </Link>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-600/30 min-h-[44px]"
            >
              <span>Acceder al Sistema</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO PRINCIPAL: PROPUESTA DE VALOR CLARA Y DIRECTA */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-16 md:py-24 px-4 md:px-8 lg:px-12 border-b border-white/10">
          {/* Fondo estético */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-20"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=2160&auto=format&fit=crop')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070b0e] via-[#070b0e]/95 to-[#070b0e] pointer-events-none" />
          
          <div className="max-w-5xl mx-auto w-full relative z-10 text-center space-y-6">
            
            {/* Badge oficial */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-wider backdrop-blur-md">
              <Sparkles size={14} className="text-cyan-400 animate-pulse" />
              <span>Plataforma Inteligente de Precios Unitarios & Red de Agentes</span>
            </div>

            {/* Título de Alto Impacto con Escala Tipográfica Equilibrada */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-extrabold text-white tracking-tight leading-snug md:leading-tight max-w-4xl mx-auto">
              Todo lo que necesitas para presupuestar{" "}
              <span className="block mt-1 bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                obras en Ecuador en un solo lugar
              </span>
            </h1>

            {/* Subtítulo Claro y Conciso */}
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
              Desde el cálculo de un rubro individual hasta licitaciones completas del SERCOP. SARA APU combina bases de datos actualizadas con una <strong>Red de 8 Agentes Autónomos</strong> y un <strong>Co-Piloto Asesor</strong> que optimizan tus costos, compras y logística de obra.
            </p>

            {/* Botones de Acción */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/30 hover:scale-[1.02] transition-all min-h-[48px]"
              >
                <span>Entrar al Panel de Control</span>
                <ChevronRight size={18} className="text-cyan-300" />
              </Link>

              <Link 
                href="/dashboard/cotizador" 
                className="inline-flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-white border border-white/20 hover:border-blue-400/50 font-bold text-xs sm:text-sm uppercase tracking-wider px-7 py-4 rounded-2xl backdrop-blur-md transition-all shadow-lg min-h-[48px]"
              >
                <Calculator size={18} className="text-cyan-400" />
                <span>Probar Cotizador Rápido</span>
              </Link>
            </div>

            {/* 4 Métricas Clave */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto pt-8 border-t border-white/10">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-sm text-center">
                <div className="text-2xl font-black text-blue-400 font-mono">8 Agentes</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Red Coordinada</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-sm text-center">
                <div className="text-2xl font-black text-cyan-400 font-mono">4,167+</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Insumos Calibrados</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-sm text-center">
                <div className="text-2xl font-black text-emerald-400 font-mono">100% SERCOP</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Normativa Vigente</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-sm text-center">
                <div className="text-2xl font-black text-purple-400 font-mono">10 Segundos</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Rubros con IA</div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            SECCIÓN 1: RED DE AGENTES COLECTIVOS (8 TARJETAS CLARAS Y DESCRIPTIVAS)
            ========================================================================= */}
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-wider">
              <Network size={14} />
              <span>Memoria Compartida y Aprendizaje Continuo</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Red de 8 Agentes Autónomos
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              No son simples chats de texto. Son procesos autónomos sincronizados que trabajan en cadena para resolver cada aspecto técnico, logístico y financiero de tu obra.
            </p>
          </div>

          {/* Grid de 8 Tarjetas de Agentes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {agentes.map((agente) => {
              const Icono = agente.icono
              return (
                <div 
                  key={agente.id}
                  className={`bg-slate-900/70 hover:bg-slate-900/95 border border-white/10 ${agente.borderHover} rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between shadow-lg group relative overflow-hidden`}
                >
                  {/* Luz de acento sutil */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />

                  <div>
                    {/* Header de la Tarjeta */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center ${agente.color} group-hover:scale-105 transition-transform shadow-inner`}>
                        <Icono size={24} />
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${agente.badgeColor} uppercase tracking-wider font-mono`}>
                        {agente.nombre.split("-")[1]}
                      </span>
                    </div>

                    {/* Nombre y Rol */}
                    <h3 className="text-base font-bold text-white tracking-tight mb-1 group-hover:text-blue-300 transition-colors">
                      {agente.nombre}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mb-3">
                      {agente.rol}
                    </p>

                    {/* Qué hace */}
                    <div className="bg-slate-950/60 rounded-xl p-3 border border-white/5 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        ¿Qué hace este agente?
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {agente.queHace}
                      </p>
                    </div>

                    {/* Beneficio para el cliente */}
                    <div className="flex items-start gap-2 text-xs text-emerald-400">
                      <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-[11px] leading-snug">
                        <strong className="text-emerald-400">Beneficio:</strong> {agente.beneficio}
                      </span>
                    </div>
                  </div>

                  {/* Footer con el evento coordinado */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="truncate">{agente.evento}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Banner explicativo del flujo de agentes */}
          <div className="mt-8 bg-gradient-to-r from-blue-950/50 via-slate-900 to-indigo-950/50 border border-blue-500/20 rounded-3xl p-6 text-center max-w-4xl mx-auto">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong className="text-cyan-400">¿Cómo trabajan juntos?</strong> Cuando creas un proyecto, <strong>SARA-Constructora</strong> notifica a <strong>SARA-APU</strong>, este calcula insumos y despierta a <strong>SARA-Marketplace</strong> y <strong>SARA-Fletes</strong> para cotizar materiales y fletes, mientras <strong>SARA-TalentoHumano</strong> recluta cuadrillas y <strong>SARA-Pagos</strong> asegura las pólizas. <span className="text-white font-bold">Todo sucede de forma automática sin papeleos.</span>
            </p>
          </div>
        </section>

        {/* =========================================================================
            SECCIÓN 2: INTELIGENCIA ARTIFICIAL APLICADA A COSTOS (TARJETAS CLARAS)
            ========================================================================= */}
        <section className="py-20 px-4 md:px-8 bg-slate-950/70 border-y border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-wider">
                <Brain size={14} />
                <span>Inteligencia Artificial Práctica para Obra</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Potenciado por Inteligencia Artificial
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Herramientas de IA diseñadas con criterios de ingeniería civil para resolver problemas cotidianos de tiempo, privacidad y compras.
              </p>
            </div>

            {/* Grid de 4 Tarjetas de IA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {caracteristicasIA.map((item, idx) => {
                const Icono = item.icono
                return (
                  <div 
                    key={idx}
                    className={`bg-slate-900/80 hover:bg-slate-900 border border-white/10 ${item.borderHover} rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between shadow-xl group`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-14 h-14 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform shadow-inner`}>
                          <Icono size={28} />
                        </div>
                        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 uppercase tracking-wider">
                          {item.badge}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mb-1 group-hover:text-blue-300 transition-colors">
                        {item.titulo}
                      </h3>
                      <p className="text-xs font-bold text-slate-400 mb-4">
                        {item.subtitulo}
                      </p>

                      {/* Explicación de Qué Hace */}
                      <div className="bg-slate-950/70 rounded-2xl p-4 border border-white/5 mb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                          ¿Qué hace exactamente?
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {item.queHace}
                        </p>
                      </div>

                      {/* Para qué le sirve al cliente */}
                      <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-200">
                        <strong className="text-cyan-400 block text-[11px] uppercase tracking-wider mb-0.5">
                          ¿Para qué te sirve?
                        </strong>
                        <p className="text-slate-300 leading-snug">
                          {item.paraQueSirve}
                        </p>
                      </div>
                    </div>

                    {/* Botón hacia la función */}
                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                      <Link 
                        href={item.enlace}
                        className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <span>{item.textoEnlace}</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <span className="text-[10px] text-slate-400 font-mono">Grupo SARA AI</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECCIÓN 3: MÓDULOS DEL NÚCLEO DE INGENIERÍA (6 TARJETAS DESCRIPTIVAS)
            ========================================================================= */}
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-wider">
              <Layers size={14} />
              <span>Herramientas Profesionales</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Módulos del Sistema SARA APU
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Cada módulo está pensado para una etapa específica del proyecto, desde la idea inicial en plano hasta la entrega definitiva de obra.
            </p>
          </div>

          {/* Grid de 6 Módulos de Ingeniería */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modulosIngenieria.map((mod, idx) => {
              const Icono = mod.icono
              return (
                <div 
                  key={idx}
                  className={`bg-slate-900/70 hover:bg-slate-900/95 border border-white/10 ${mod.borderHover} rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between shadow-lg group`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center ${mod.color} group-hover:scale-105 transition-transform shadow-inner`}>
                        <Icono size={24} />
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 uppercase tracking-wider">
                        {mod.categoria}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white tracking-tight mb-2 group-hover:text-blue-300 transition-colors">
                      {mod.titulo}
                    </h3>

                    <div className="bg-slate-950/60 rounded-xl p-3 border border-white/5 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        ¿Qué hace este módulo?
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {mod.queHace}
                      </p>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-emerald-400">
                      <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-[11px] leading-snug">
                        <strong className="text-emerald-400">Beneficio:</strong> {mod.beneficio}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                    <Link 
                      href={mod.enlace}
                      className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <span>{mod.textoEnlace}</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <ArrowUpRight size={14} className="text-slate-400" />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* =========================================================================
            SECCIÓN 4: 4 PILARES DE SEGURIDAD Y CONFIANZA
            ========================================================================= */}
        <section className="py-16 px-4 md:px-8 bg-slate-950/80 border-y border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <FileCheck size={20} />
                </div>
                <h4 className="text-base font-bold text-white">Normativa Ecuatoriana 100%</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Formatos homologados para compras públicas SERCOP, MTOP y Cámara de la Construcción (CCEC).
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Lock size={20} />
                </div>
                <h4 className="text-base font-bold text-white">Tus Datos Son Privados</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tus presupuestos y rubros creados con IA quedan blindados bajo tu cuenta y nunca se comparten.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <h4 className="text-base font-bold text-white">Ahorro del 80% en Tiempo</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Olvídate de rehacer fórmulas de indirectos, matrices de transporte y búsquedas manuales de proveedores.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <h4 className="text-base font-bold text-white">Respaldo Grupo SARA</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Diseñado y validado en proyectos reales de ingeniería civil, edificación y vialidad en Ecuador.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BANNER FINAL DE LLAMADA A LA ACCIÓN
            ========================================================================= */}
        <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="relative z-10 max-w-xl text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-3">
                Comienza a Presupuestar Hoy
              </span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-2 tracking-tight">
                Tu Próximo Proyecto con Estándar Profesional
              </h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Accede a las recetas de rubros, el cotizador paramétrico y la red de agentes inteligentes del Grupo SARA.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
              <Link 
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-blue-50 transition-all shadow-xl min-h-[48px]"
              >
                <span>Acceder al Panel APU</span>
                <ArrowRight size={16} />
              </Link>
              <Link 
                href="/dashboard/cotizador"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider border border-white/20 transition-all min-h-[48px]"
              >
                <span>Cotizador Rápido</span>
              </Link>
            </div>

            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none transform translate-x-1/4">
              <Layers size={360} />
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER OFICIAL SARA APU */}
      <footer className="border-t border-white/10 bg-slate-950 py-8 px-4 md:px-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-bold uppercase tracking-wider text-slate-300">
            SARA APU · Software de Ingeniería de Costos del Grupo SARA © {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-6 text-[11px]">
            <Link href="/constructora" className="hover:text-white transition-colors">SARA Constructora</Link>
            <Link href="/inmobiliaria" className="hover:text-white transition-colors">SARA Inmobiliaria</Link>
            <Link href="/stays" className="hover:text-white transition-colors">SARA Stays</Link>
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors font-bold">Dashboard SaaS</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
