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
  ChevronRight
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

  return (
    <div className="min-h-screen bg-[#070b0e] text-slate-100 flex flex-col selection:bg-brand-sage selection:text-slate-950">
      {/* Intro con logotipo 3D giratorio oficial de SARA APU */}
      <ModuloIntroSplash modulo="apu" />

      {/* Cabecera Superior SARA APU */}
      <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link href="/constructora" className="flex items-center gap-3 group">
            <img 
              src={logoApu} 
              alt="SARA APU" 
              className="h-9 md:h-10 w-auto object-contain drop-shadow group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-widest text-white group-hover:text-blue-400 transition-colors uppercase">
                SARA APU
              </span>
              <span className="text-[9px] font-bold tracking-widest text-blue-400 uppercase">
                Ingeniería de Costos & Software
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link 
              href="/constructora" 
              className="hidden sm:inline-flex text-xs font-bold text-slate-300 hover:text-white transition-colors uppercase tracking-wider px-3 py-2"
            >
              Constructora
            </Link>
            <Link 
              href="/dashboard/cotizador" 
              className="text-xs font-bold text-blue-300 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 px-3.5 py-2 rounded-xl border border-blue-500/20 transition-all uppercase tracking-wider"
            >
              Cotizador
            </Link>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-600/30 group"
            >
              <span>Abrir Software</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Principal SARA APU */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-16 md:py-24 px-4 md:px-8">
          {/* Luces y texturas de fondo */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
              backgroundSize: "48px 48px"
            }}
          />

          <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-[0.25em]">
              <Sparkles size={13} /> Plataforma Oficial de Precios Unitarios
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight max-w-4xl mx-auto leading-[1.05]">
              Cálculo de Obra con <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">Precisión Absoluta</span>
            </h1>

            <p className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Software profesional para ingenieros y arquitectos en Ecuador. Análisis de rubros, bases de insumos actualizadas (SERCOP / MTOP / Privado) y exportación de presupuestos ejecutivos.
            </p>

            {/* Botones de Acción */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider px-7 py-3.5 rounded-2xl shadow-xl shadow-blue-600/25 transition-all group"
              >
                <span>Acceder al Panel APU</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                href="/dashboard/cotizador" 
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/15 font-black text-sm uppercase tracking-wider px-6 py-3.5 rounded-2xl transition-all"
              >
                <Calculator size={18} className="text-blue-400" />
                <span>Cotizador Rápido</span>
              </Link>
            </div>

            {/* Métricas destacadas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-12">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-2xl md:text-3xl font-black text-blue-400 font-mono">4,167+</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Insumos Registrados</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">100%</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Norma MTOP / SERCOP</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-2xl md:text-3xl font-black text-amber-400 font-mono">Fórmulas AIU</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Indirectos Automatizados</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-2xl md:text-3xl font-black text-purple-400 font-mono">Excel & PDF</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Exportación Inmediata</div>
              </div>
            </div>
          </div>
        </section>

        {/* Módulos Principales del Software */}
        <section className="py-12 px-4 md:px-8 border-t border-white/10 max-w-6xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">Suite Profesional</span>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              Herramientas de Ingeniería Integradas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <Link 
              href="/dashboard/presupuestos_reales" 
              className="p-6 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-blue-500/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet size={24} />
                </div>
                <h3 className="text-lg font-black text-white uppercase mb-2">Presupuestos Reales</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Crea presupuestos detallados por capítulos y rubros, calcula indirectos (AIU) y genera reportes.
                </p>
              </div>
              <div className="mt-5 flex items-center text-purple-400 font-black text-xs uppercase tracking-wider">
                <span>Gestionar</span>
                <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link 
              href="/dashboard/cotizador" 
              className="p-6 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-blue-500/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calculator size={24} />
                </div>
                <h3 className="text-lg font-black text-white uppercase mb-2">Cotizador Rápido</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Proyección paramétrica por tipología de edificación y acabados sin necesidad de desglosar rubros.
                </p>
              </div>
              <div className="mt-5 flex items-center text-blue-400 font-black text-xs uppercase tracking-wider">
                <span>Comenzar</span>
                <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link 
              href="/dashboard/apus/rubros" 
              className="p-6 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-blue-500/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Layers size={24} />
                </div>
                <h3 className="text-lg font-black text-white uppercase mb-2">Recetas de Rubros</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Catálogo con rendimientos de mano de obra, equipo, materiales y transporte calibrados para Ecuador.
                </p>
              </div>
              <div className="mt-5 flex items-center text-indigo-400 font-black text-xs uppercase tracking-wider">
                <span>Ver Catálogo</span>
                <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link 
              href="/dashboard/apus/insumos" 
              className="p-6 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-blue-500/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Box size={24} />
                </div>
                <h3 className="text-lg font-black text-white uppercase mb-2">Base de Insumos</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Listado oficial de materiales, jornales y cuadrillas con actualización en tiempo real desde Supabase.
                </p>
              </div>
              <div className="mt-5 flex items-center text-emerald-400 font-black text-xs uppercase tracking-wider">
                <span>Ver Insumos</span>
                <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer SARA APU */}
      <footer className="border-t border-white/10 bg-slate-950 py-6 px-4 md:px-8 text-center text-xs text-slate-400">
        <p className="font-bold uppercase tracking-wider">
          SARA APU · Plataforma Tecnológica del Grupo SARA © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}
