"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Compass, HardHat, Ruler, Building2, Map, Calculator, Wrench, Eye, Box, FileSignature } from "lucide-react"

const servicios = [
  { id: "01", icon: Compass, title: "Diseño Arquitectónico", desc: "Conceptualización y diseño de espacios funcionales y estéticos." },
  { id: "02", icon: Building2, title: "Construcción de Obras", desc: "Ejecución integral de proyectos residenciales, comerciales e institucionales." },
  { id: "03", icon: Ruler, title: "Ingeniería y Cálculo Estructural", desc: "Análisis y diseño para garantizar la seguridad y estabilidad de las edificaciones." },
  { id: "04", icon: HardHat, title: "Estudios de Suelos", desc: "Análisis geotécnico para fundamentar correctamente cada proyecto." },
  { id: "05", icon: Map, title: "Topografía y Planimetría", desc: "Levantamientos topográficos precisos para planificación y ejecución." },
  { id: "06", icon: Calculator, title: "Presupuestos y APU", desc: "Cálculo detallado de costos y análisis de precios unitarios." },
  { id: "07", icon: Wrench, title: "Remodelaciones y Ampliaciones", desc: "Transformación y mejora de espacios existentes." },
  { id: "08", icon: Eye, title: "Dirección y Supervisión de Obras", desc: "Control técnico y administrativo durante la ejecución del proyecto." },
  { id: "09", icon: Box, title: "Modelado 3D y Renders", desc: "Visualización fotorrealista para entender el proyecto antes de construirlo." },
  { id: "10", icon: FileSignature, title: "Consultoría Técnica", desc: "Asesoría especializada en todas las etapas del desarrollo inmobiliario." },
]

export default function ServiciosPreview() {
  return (
    <section className="py-32 bg-brand-dark text-white relative">
      {/* Subtle grid background */}
      <div className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '2rem 2rem'
        }}
      />
      
      <div className="container relative z-10 mx-auto px-4 md:px-8">
        <div className="mb-20 md:flex md:justify-between md:items-end">
          <div className="max-w-3xl">
            <h2 className="flex items-center gap-4 text-xs font-bold tracking-[0.3em] text-brand-sage uppercase mb-6">
              <span className="w-12 h-px bg-brand-sage" /> Nuestros Servicios
            </h2>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tighter">
              SOLUCIONES TÉCNICAS PARA <br className="hidden md:block"/>
              CADA ETAPA DE TU PROYECTO.
            </h3>
          </div>
          <Link href="/servicios" className="hidden md:inline-flex items-center gap-3 text-brand-sage font-bold hover:text-white transition-colors uppercase tracking-[0.2em] text-xs group pb-4">
            Ver portafolio de servicios
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[1px] bg-white/10 border border-white/10">
          {servicios.map((s, index) => {
            const Icon = s.icon
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                key={s.id}
                className={`group relative bg-brand-dark overflow-hidden ${index === 0 || index === 1 ? 'xl:col-span-2' : ''}`}
              >
                <Link 
                  href={`/servicios#${s.id}`}
                  className="block p-10 h-full hover:bg-white/[0.02] transition-colors duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-sage/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10 flex justify-between items-start mb-16">
                    <div className="text-brand-sage">
                      <Icon size={32} strokeWidth={1.5} />
                    </div>
                    <span className="text-white/20 font-mono text-xl font-light tracking-widest">{s.id}</span>
                  </div>
                  
                  <div className="relative z-10">
                    <h4 className="text-xl font-bold mb-4 tracking-wide">{s.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-2 font-light">
                      {s.desc}
                    </p>
                    <div className="flex items-center gap-3 text-brand-sage text-xs font-bold uppercase tracking-[0.2em] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      Conocer más
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
        
        <div className="mt-16 md:hidden">
          <Link href="/servicios" className="inline-flex items-center gap-3 text-brand-sage font-bold hover:text-white transition-colors uppercase tracking-[0.2em] text-xs">
            Ver portafolio de servicios
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
