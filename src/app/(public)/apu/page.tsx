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
  ArrowUpRight
} from "lucide-react"
import ModuloIntroSplash from "@/components/ui/ModuloIntroSplash"
import { getLogosEmpresa, DEFAULT_LOGOS_EMPRESA } from "@/lib/services/logosService"

export default function SaraApuLandingPage() {
  const [logoApu, setLogoApu] = useState(DEFAULT_LOGOS_EMPRESA.apu)
  const [activeTabApu, setActiveTabApu] = useState<"estructura" | "acabados" | "vial">("estructura")

  useEffect(() => {
    getLogosEmpresa().then((logos) => {
      if (logos?.apu) setLogoApu(logos.apu)
    })
  }, [])

  // Ejemplos interactivos para la tarjeta showcase
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

  return (
    <div className="min-h-screen bg-[#070b0e] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white relative">
      {/* Intro con logotipo 3D giratorio oficial de SARA APU */}
      <ModuloIntroSplash modulo="apu" />

      {/* Sub-header de navegación rápida APU */}
      <nav className="w-full bg-slate-950/70 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-2.5 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              SARA APU • Software de Ingeniería de Costos
            </div>
            <span className="hidden sm:inline text-white/20">|</span>
            <span className="hidden sm:inline text-slate-400 text-[11px]">Ecuador 2026</span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/cotizador" 
              className="text-slate-300 hover:text-white transition-colors font-medium text-[11px] uppercase tracking-wider"
            >
              Cotizador Rápido
            </Link>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-1.5 bg-blue-600/90 hover:bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-wider transition-all shadow-xs"
            >
              <span>Entrar al Software</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO PRINCIPAL CON IMAGEN DE FONDO Y TEXTO A LA IZQUIERDA */}
      <main className="flex-1">
        <section className="relative min-h-[85vh] flex items-center overflow-hidden py-16 md:py-24 px-4 md:px-8 lg:px-12 border-b border-white/10">
          {/* IMAGEN DE FONDO CINEMATOGRÁFICA DE INGENIERÍA Y CONSTRUCCIÓN */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none transform scale-105 transition-transform duration-1000"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=2160&auto=format&fit=crop')`,
            }}
          />

          {/* GRADIENTES DIRECCIONALES: Oscurece el lado izquierdo para legibilidad total del texto y deja respirar la imagen al lado derecho */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070b0e] via-[#070b0e]/95 via-50% to-[#070b0e]/40 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b0e] via-transparent to-[#070b0e]/70 pointer-events-none" />
          
          {/* Retícula técnica de plano / blueprint */}
          <div 
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(#60a5fa 1px, transparent 1px), linear-gradient(90deg, #60a5fa 1px, transparent 1px)`,
              backgroundSize: "40px 40px"
            }}
          />

          {/* Luz ambiental radial azul */}
          <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* CONTENEDOR SPLIT: Texto a la izquierda y tarjeta interactiva a la derecha */}
          <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* COLUMNA IZQUIERDA: TEXTO, LLAMADAS A LA ACCIÓN Y MÉTRICAS */}
            <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
              
              {/* Badge oficial */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-lg shadow-blue-950/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span>Plataforma Oficial de Precios Unitarios</span>
              </div>

              {/* Título Principal de Alto Impacto */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight leading-[1.04]">
                Cálculo de Obra con <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-sm">
                  Precisión Absoluta
                </span>
              </h1>

              {/* Subtítulo Técnico */}
              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-light">
                Software profesional de costos y presupuestos para ingenieros civiles, arquitectos y constructoras en Ecuador. Análisis de rubros, bases de insumos actualizadas (SERCOP, MTOP y Privado), desglose automatizado de indirectos (AIU) y exportación ejecutiva inmediata.
              </p>

              {/* Botones de Acción */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider px-7 py-4 rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all group"
                >
                  <span>Acceder al Panel APU</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform text-cyan-300" />
                </Link>

                <Link 
                  href="/dashboard/cotizador" 
                  className="inline-flex items-center gap-2.5 bg-slate-900/80 hover:bg-slate-800 text-white border border-white/20 hover:border-blue-400/50 font-black text-xs sm:text-sm uppercase tracking-wider px-6 py-4 rounded-2xl backdrop-blur-md transition-all group shadow-lg"
                >
                  <Calculator size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>Cotizador Rápido</span>
                </Link>
              </div>

              {/* Micro-garantía */}
              <div className="flex items-center gap-3 pt-1 text-slate-400 text-xs font-medium">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 size={15} />
                  <span>Sin instalación requerida</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5 text-blue-400">
                  <ShieldCheck size={15} />
                  <span>Fórmulas SERCOP / MTOP</span>
                </div>
                <span>•</span>
                <span>Actualizado a 2026</span>
              </div>

              {/* Grid de Métricas Técnicas (Alineadas a la izquierda) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full pt-4 border-t border-white/10">
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-sm">
                  <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono">4,167+</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Insumos Calibrados</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-sm">
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">100%</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Norma SERCOP / MTOP</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-sm">
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">AIU Auto</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Cálculo de Indirectos</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-sm">
                  <div className="text-xl sm:text-2xl font-black text-purple-400 font-mono">Excel & PDF</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Exportación Oficial</div>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: SHOWCASE INTERACTIVO DE UN APU EN TIEMPO REAL */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-slate-900/85 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl shadow-black/80 relative overflow-hidden group">
                {/* Acento superior de iluminación */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500" />
                
                {/* Header de la tarjeta simulador */}
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Simulador APU en Vivo
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold">
                    SERCOP • Loja
                  </span>
                </div>

                {/* Selector de Rubros de Muestra */}
                <div className="flex gap-1.5 p-1 bg-slate-950/80 rounded-xl mb-4 border border-white/5">
                  <button
                    onClick={() => setActiveTabApu("estructura")}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider ${
                      activeTabApu === "estructura" 
                        ? "bg-blue-600 text-white shadow" 
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Estructura
                  </button>
                  <button
                    onClick={() => setActiveTabApu("acabados")}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider ${
                      activeTabApu === "acabados" 
                        ? "bg-blue-600 text-white shadow" 
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Acabados
                  </button>
                  <button
                    onClick={() => setActiveTabApu("vial")}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider ${
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
                    <span className="text-[11px] font-mono text-blue-400 font-semibold">{rubroActual.codigo}</span>
                    <span className="text-xs font-bold text-slate-400">Unidad: <strong className="text-white">{rubroActual.unidad}</strong></span>
                  </div>
                  <h3 className="text-sm font-black text-white mt-1 leading-snug">
                    {rubroActual.nombre}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 italic">
                    {rubroActual.detalle}
                  </p>
                </div>

                {/* Desglose de Componentes */}
                <div className="space-y-2 py-3 border-y border-white/10 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Box size={13} className="text-blue-400" /> Materiales
                    </span>
                    <span className="font-mono font-bold text-white">${rubroActual.materiales.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <HardHat size={13} className="text-emerald-400" /> Mano de Obra (Cuadrilla)
                    </span>
                    <span className="font-mono font-bold text-white">${rubroActual.manoObra.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Cpu size={13} className="text-amber-400" /> Equipos y Maquinaria
                    </span>
                    <span className="font-mono font-bold text-white">${rubroActual.equipos.toFixed(2)}</span>
                  </div>
                </div>

                {/* Fórmulas de Indirectos y Total */}
                <div className="mt-4 pt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Costo Directo (CD):</span>
                    <span className="font-mono font-semibold text-slate-200">${rubroActual.directo.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-blue-300">
                    <span>Indirectos AIU (18.5%):</span>
                    <span className="font-mono font-semibold">+${rubroActual.aiu.toFixed(2)}</span>
                  </div>
                  
                  {/* P.U. Destacado */}
                  <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-500/30 p-3.5 rounded-2xl flex items-center justify-between mt-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">
                        Precio Unitario (P.U.)
                      </span>
                      <span className="text-xl font-black text-white font-mono">
                        ${rubroActual.total.toFixed(2)}{" "}
                        <span className="text-xs font-normal text-slate-300">/ {rubroActual.unidad}</span>
                      </span>
                    </div>

                    <Link 
                      href="/dashboard/presupuestos_reales"
                      className="inline-flex items-center gap-1 bg-white text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl hover:bg-blue-50 transition-colors shadow"
                    >
                      <span>Usar Rubro</span>
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Check size={12} className="text-emerald-400" /> Rendimiento Verificado
                  </span>
                  <span>Base SARA Constructora</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SECCIÓN: HERRAMIENTAS DE LA SUITE APU */}
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-blue-400">
              Ecosistema Integrado
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
              Herramientas de Ingeniería Integradas
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Diseñado específicamente para el ecosistema de contratación pública y privada de la construcción en el Ecuador.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tarjeta 1 */}
            <Link 
              href="/dashboard/presupuestos_reales" 
              className="p-7 rounded-3xl bg-slate-900/50 hover:bg-slate-900 border border-white/10 hover:border-purple-500/50 transition-all duration-300 group flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xs">
                  <FileSpreadsheet size={28} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1 block">Presupuesto Ejecutivo</span>
                <h3 className="text-xl font-black text-white uppercase mb-2 group-hover:text-purple-400 transition-colors">Presupuestos Reales</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Crea presupuestos detallados por capítulos y rubros, calcula factores de indirectos (AIU) y genera cronogramas de obra.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-purple-400 font-black text-xs uppercase tracking-wider">
                <span>Gestionar Proyectos</span>
                <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Tarjeta 2 */}
            <Link 
              href="/dashboard/cotizador" 
              className="p-7 rounded-3xl bg-slate-900/50 hover:bg-slate-900 border border-white/10 hover:border-blue-500/50 transition-all duration-300 group flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xs">
                  <Calculator size={28} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1 block">Costeo Paramétrico</span>
                <h3 className="text-xl font-black text-white uppercase mb-2 group-hover:text-blue-400 transition-colors">Cotizador Rápido</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Proyección instantánea de costos por m² según tipología de edificación, pendiente y acabados sin desglosar ítems manuales.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-blue-400 font-black text-xs uppercase tracking-wider">
                <span>Comenzar Cotización</span>
                <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Tarjeta 3 */}
            <Link 
              href="/dashboard/apus/rubros" 
              className="p-7 rounded-3xl bg-slate-900/50 hover:bg-slate-900 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 group flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xs">
                  <Layers size={28} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1 block">Recetas & Rendimientos</span>
                <h3 className="text-xl font-black text-white uppercase mb-2 group-hover:text-indigo-400 transition-colors">Recetas de Rubros</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Catálogo con rendimientos de mano de obra, equipo, materiales y transporte validados por experiencia de obra en Ecuador.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-indigo-400 font-black text-xs uppercase tracking-wider">
                <span>Ver Catálogo</span>
                <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Tarjeta 4 */}
            <Link 
              href="/dashboard/apus/insumos" 
              className="p-7 rounded-3xl bg-slate-900/50 hover:bg-slate-900 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 group flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xs">
                  <Box size={28} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1 block">Materiales & Cuadrillas</span>
                <h3 className="text-xl font-black text-white uppercase mb-2 group-hover:text-emerald-400 transition-colors">Base de Insumos</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Listado oficial de materiales, jornales y cuadrillas con precios de mercado y actualización en tiempo real desde Supabase.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-emerald-400 font-black text-xs uppercase tracking-wider">
                <span>Ver Insumos</span>
                <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* SECCIÓN: 4 PILARES TÉCNICOS SARA APU */}
        <section className="py-16 px-4 md:px-8 bg-slate-950/60 border-y border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <FileCheck size={20} />
                </div>
                <h4 className="text-base font-bold text-white">Cumplimiento SERCOP</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Formatos homologados para compras públicas y licitaciones del Estado ecuatoriano con memoria técnica.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Database size={20} />
                </div>
                <h4 className="text-base font-bold text-white">Importador Masivo Excel</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sube tus hojas de cálculo existentes y conviértelas en bases digitales inteligentes en menos de 2 minutos.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <h4 className="text-base font-bold text-white">Ahorro de Tiempo del 80%</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Olvida rehacer fórmulas de indirectos y reajustes polinómicos manualmente en cada proyecto.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <h4 className="text-base font-bold text-white">Respaldo Grupo SARA</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Desarrollado, probado y validado en obras civiles, edificaciones y urbanizaciones reales en Ecuador.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BANNER FINAL DE LLAMADA A LA ACCIÓN */}
        <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="relative z-10 max-w-xl text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-3">
                Comienza Hoy Mismo
              </span>
              <h3 className="text-2xl md:text-4xl font-black mb-3">
                Empieza a Presupuestar con Estándar Profesional
              </h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Accede al Catálogo Maestro con más de 4,167 insumos y rubros pre-calibrados. Diseñado para optimizar el rendimiento de tu constructora.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
              <Link 
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-7 py-4 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-blue-50 transition-all shadow-xl"
              >
                <span>Acceder al Panel APU</span>
                <ArrowRight size={16} />
              </Link>
              <Link 
                href="/dashboard/cotizador"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider border border-white/20 transition-all"
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

      {/* Footer SARA APU */}
      <footer className="border-t border-white/10 bg-slate-950 py-8 px-4 md:px-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-bold uppercase tracking-wider text-slate-300">
            SARA APU · Plataforma Tecnológica del Grupo SARA © {new Date().getFullYear()}
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
