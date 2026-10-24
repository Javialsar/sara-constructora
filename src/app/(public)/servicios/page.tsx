"use client"
import React from 'react'
import { ArrowRight, Compass, HardHat, Ruler, Building2, Map, Calculator, Wrench, Eye, Box, FileSignature, Sparkles } from "lucide-react"
import Link from "next/link"

const servicios = [
  { id: "01", slug: "diseno-arquitectonico", icon: Compass, title: "Diseño Arquitectónico", desc: "Conceptualización y diseño de espacios funcionales y estéticos, priorizando la habitabilidad, bioclimática y el entorno.", image: "/images/servicios/01-diseno.png", tag: "Arquitectura & Espacios" },
  { id: "02", slug: "construccion-de-obras", icon: Building2, title: "Construcción de Obras", desc: "Ejecución integral de proyectos residenciales, comerciales e industriales con estrictos estándares de calidad e ingeniería de precisión.", image: "/images/servicios/02-construccion.png", tag: "Obras Llave en Mano" },
  { id: "03", slug: "ingenieria-y-calculo-estructural", icon: Ruler, title: "Ingeniería y Cálculo Estructural", desc: "Análisis y modelado sismorresistente bajo norma ecuatoriana NEC-15, garantizando seguridad y optimización de materiales.", image: "/images/servicios/03-calculo.png", tag: "Cálculo NEC-15" },
  { id: "04", slug: "estudios-de-suelos", icon: HardHat, title: "Estudios de Suelos", desc: "Análisis geotécnico, sondeos y ensayos de laboratorio para dimensionar cimentaciones estables y prevenir riesgos.", image: "/images/servicios/04-suelos.png", tag: "Geotecnia & Suelos" },
  { id: "05", slug: "topografia-y-planimetria", icon: Map, title: "Topografía y Planimetría", desc: "Levantamientos topográficos milimétricos con drones y estaciones totales para planificación y replanteo de obra.", image: "/images/servicios/05-topografia.png", tag: "Geodesia Satelital" },
  { id: "06", slug: "presupuestos-y-apu", icon: Calculator, title: "Presupuestos y APU", desc: "Cómputo métrico detallado, análisis de precios unitarios con rendimientos calibrados y fórmulas polinómicas SERCOP/INEC.", image: "/images/servicios/06-presupuestos.png", tag: "Costos & Licitación" },
  { id: "07", slug: "remodelaciones-y-ampliaciones", icon: Wrench, title: "Remodelaciones y Ampliaciones", desc: "Transformación técnica de edificaciones existentes, reforzamiento estructural y modernización integral de acabados.", image: "/images/servicios/07-remodelaciones.png", tag: "Rehabilitación Edilicia" },
  { id: "08", slug: "direccion-y-supervision", icon: Eye, title: "Dirección y Supervisión de Obras", desc: "Fiscalización técnica independiente, libro de obra digital y control presupuestario para garantizar cumplimiento contractual.", image: "/images/servicios/08-supervision.png", tag: "Fiscalización & CDE" },
  { id: "09", slug: "modelado-3d-y-renders", icon: Box, title: "Modelado 3D y Renders", desc: "Visualización fotorrealista hiperdetallada, recorridos virtuales interactivos y modelado BIM para comercialización y control.", image: "/images/servicios/09-renders.png", tag: "BIM & Fotorrealismo" },
  { id: "10", slug: "consultoria-tecnica", icon: FileSignature, title: "Consultoría Técnica", desc: "Asesoría pericial, gestión de permisos municipales, regularizaciones y acompañamiento integral a promotores inmobiliarios.", image: "/images/servicios/10-consultoria.png", tag: "Peritaje & Asesoría" },
]

export default function ServiciosPage() {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Luz ambiental técnica */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-sage/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-7xl">
        <header className="mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-brand-sage/40 text-brand-sage text-xs font-bold uppercase tracking-widest mb-4 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-brand-sage" />
            <span>Portafolio de Servicios de Ingeniería & Construcción</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase mb-4 drop-shadow-xl">
            Nuestros <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-sage via-amber-400 to-white">Servicios</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal border-l-2 border-brand-sage/60 pl-4">
            Soluciones integrales de ingeniería, diseño arquitectónico, análisis de costos y fiscalización para cada etapa de tu proyecto en el Ecuador.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicios.map((s) => {
            const Icon = s.icon
            return (
              <div 
                key={s.id} 
                id={s.id}
                className="group rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-white/[0.08] hover:border-amber-400/40 ring-1 ring-black/[0.05] overflow-hidden flex flex-col justify-between transition-all duration-300 ease-out hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-1.5"
              >
                <div>
                  {/* Imagen de Cabecera con Relieve */}
                  <div className="aspect-[16/10] w-full overflow-hidden relative bg-slate-950">
                    <div 
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      style={{ backgroundImage: `url(${s.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
                    
                    {/* Badge de Número e Icono Flotante */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <span className="font-mono text-xs font-bold tabular-nums px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/10 text-amber-400">
                        {s.id}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/10 text-slate-300">
                        {s.tag}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 w-10 h-10 rounded-xl bg-slate-950/90 border border-white/10 flex items-center justify-center text-amber-400 shadow-md">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Contenido Técnico */}
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors uppercase">
                      {s.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                      {s.desc}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="p-6 pt-0 border-t border-white/[0.06] flex items-center justify-between gap-3 mt-4">
                  <Link
                    href={`/servicios/${s.slug}`}
                    className="flex-1 min-h-[42px] px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between transition-all group-hover:border-amber-400/40 active:scale-[0.98]"
                  >
                    <span>Detalles Técnicos</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href={`/contacto?servicio=${s.slug}`}
                    className="min-h-[42px] px-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-[0.98]"
                    title="Cotizar este servicio directamente"
                  >
                    <span>Cotizar</span>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
