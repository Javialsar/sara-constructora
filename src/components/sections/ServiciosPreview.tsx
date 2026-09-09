"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Compass, HardHat, Ruler, Building2, Map, Calculator, Wrench, Eye, Box, FileSignature } from "lucide-react"

const servicios = [
  { id: "01", icon: Compass, title: "Diseño Arquitectónico", desc: "Conceptualización y diseño de espacios funcionales y estéticos.", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop" },
  { id: "02", icon: Building2, title: "Construcción de Obras", desc: "Ejecución integral de proyectos residenciales, comerciales e institucionales.", image: "https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=800&auto=format&fit=crop" },
  { id: "03", icon: Ruler, title: "Ingeniería y Cálculo", desc: "Análisis y diseño para garantizar la seguridad y estabilidad.", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop" },
  { id: "04", icon: HardHat, title: "Estudios de Suelos", desc: "Análisis geotécnico para fundamentar correctamente cada proyecto.", image: "https://images.unsplash.com/photo-1578509378904-71648a04b19c?q=80&w=800&auto=format&fit=crop" },
  { id: "05", icon: Map, title: "Topografía y Planimetría", desc: "Levantamientos topográficos precisos para planificación y ejecución.", image: "https://images.unsplash.com/photo-1524815436321-db9b53177651?q=80&w=800&auto=format&fit=crop" },
  { id: "06", icon: Calculator, title: "Presupuestos y APU", desc: "Cálculo detallado de costos y análisis de precios unitarios.", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop" },
  { id: "07", icon: Wrench, title: "Remodelaciones", desc: "Transformación y mejora de espacios existentes.", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop" },
  { id: "08", icon: Eye, title: "Supervisión de Obras", desc: "Control técnico y administrativo durante la ejecución.", image: "https://images.unsplash.com/photo-1504307651254-35680f356f58?q=80&w=800&auto=format&fit=crop" },
  { id: "09", icon: Box, title: "Modelado 3D y Renders", desc: "Visualización fotorrealista para entender el proyecto.", image: "https://images.unsplash.com/photo-1600607687989-ce4d31d94f28?q=80&w=800&auto=format&fit=crop" },
  { id: "10", icon: FileSignature, title: "Consultoría Técnica", desc: "Asesoría especializada en todas las etapas del desarrollo.", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop" },
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
                className={`group relative bg-brand-dark overflow-hidden flex flex-col ${index === 0 || index === 1 ? 'xl:col-span-2' : ''}`}
              >
                <Link 
                  href={`/servicios#${s.id}`}
                  className="flex flex-col h-full hover:bg-white/[0.02] transition-colors duration-500"
                >
                  <div className="h-48 w-full relative overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      style={{ backgroundImage: `url(${s.image})` }}
                    />
                    <div className="absolute inset-0 bg-brand-dark/20 group-hover:bg-transparent transition-colors duration-500" />
                  </div>
                  
                  <div className="p-8 flex-1 flex flex-col relative z-10">
                    <div className="flex justify-between items-start mb-10">
                      <div className="text-brand-sage">
                        <Icon size={24} strokeWidth={1.5} />
                      </div>
                      <span className="text-white/20 font-mono text-xl font-light tracking-widest">{s.id}</span>
                    </div>
                    
                    <h4 className="text-xl font-bold mb-4 tracking-wide group-hover:text-brand-sage transition-colors duration-300">{s.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-2 font-light flex-1">
                      {s.desc}
                    </p>
                    <div className="flex items-center gap-3 text-brand-sage text-xs font-bold uppercase tracking-[0.2em] opacity-80 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
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
