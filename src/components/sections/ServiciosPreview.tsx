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
                className={`group relative bg-brand-dark overflow-hidden ${index === 0 || index === 1 ? 'xl:col-span-2' : ''}`}
              >
                <Link 
                  href={`/servicios#${s.id}`}
                  className="block p-10 h-full relative z-10 transition-colors duration-500"
                >
                  {/* Background Image on Hover */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-40 transition-opacity duration-700 ease-in-out z-0"
                    style={{ backgroundImage: `url(${s.image})` }}
                  />
                  {/* Dark overlay to ensure text is readable when image appears */}
                  <div className="absolute inset-0 bg-brand-dark/80 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0" />
                  
                  {/* Default gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-sage/5 to-transparent opacity-0 group-hover:opacity-0 transition-opacity duration-500 z-0" />
                  
                  <div className="relative z-20 flex justify-between items-start mb-16">
                    <div className="text-brand-sage group-hover:text-white transition-colors duration-500">
                      <Icon size={32} strokeWidth={1.5} />
                    </div>
                    <span className="text-white/20 group-hover:text-white/60 font-mono text-xl font-light tracking-widest transition-colors duration-500">{s.id}</span>
                  </div>
                  
                  <div className="relative z-20">
                    <h4 className="text-xl font-bold mb-4 tracking-wide group-hover:text-white transition-colors duration-500">{s.title}</h4>
                    <p className="text-gray-400 group-hover:text-gray-200 text-sm leading-relaxed mb-8 line-clamp-2 font-light transition-colors duration-500">
                      {s.desc}
                    </p>
                    <div className="flex items-center gap-3 text-brand-sage group-hover:text-white text-xs font-bold uppercase tracking-[0.2em] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
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
