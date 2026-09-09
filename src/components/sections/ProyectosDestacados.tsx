"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, MapPin } from "lucide-react"

const proyectosDestacados = [
  {
    id: "1",
    title: "TORRE ESMERALDA",
    location: "Loja - Departamentos de 2 y 3 dormitorios.",
    desc: "Un referente de diseño contemporáneo. Integra tecnología, innovación y espacios diseñados para el bienestar integral de las familias.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "2",
    title: "VILLA VERDE",
    location: "Cariamanga - Residencias exclusivas.",
    desc: "Redefine la vida residencial con un enfoque en comodidad, elegancia y vistas impresionantes. Arquitectura que respeta el entorno.",
    image: "https://images.unsplash.com/photo-1600607687989-ce4d31d94f28?q=80&w=1000&auto=format&fit=crop"
  }
]

export default function ProyectosDestacados() {
  return (
    <section className="py-32 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <h2 className="flex items-center justify-center gap-4 text-xs font-bold tracking-[0.3em] text-brand-sage uppercase mb-6">
            <span className="w-12 h-px bg-brand-sage" /> Portafolio <span className="w-12 h-px bg-brand-sage" />
          </h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-brand-dark leading-tight mb-6">
            NUESTROS PROYECTOS <br/> DISPONIBLES
          </h3>
          <p className="text-gray-500 text-lg">
            Desarrollos inmobiliarios y obras arquitectónicas que marcan un antes y un después en la ciudad.
          </p>
        </div>

        <div className="space-y-16 lg:space-y-32">
          {proyectosDestacados.map((proyecto, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              key={proyecto.id} 
              className={`flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-16 items-center`}
            >
              {/* Image side */}
              <div className="w-full lg:w-3/5">
                <div className="aspect-[4/3] lg:aspect-[16/10] relative overflow-hidden group">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${proyecto.image})` }}
                  />
                  <div className="absolute inset-0 bg-brand-dark/10 group-hover:bg-transparent transition-colors duration-500" />
                </div>
              </div>

              {/* Text side */}
              <div className="w-full lg:w-2/5 space-y-6">
                <h4 className="text-3xl lg:text-5xl font-extrabold text-brand-dark tracking-tighter">
                  {proyecto.title}
                </h4>
                <div className="flex items-center gap-2 text-brand-sage font-bold uppercase tracking-wider text-xs">
                  <MapPin size={16} />
                  <span>{proyecto.location}</span>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {proyecto.desc}
                </p>
                <div className="pt-4">
                  <Link 
                    href={`/proyectos/${proyecto.id}`}
                    className="inline-flex items-center gap-3 text-brand-dark font-bold uppercase tracking-[0.2em] text-sm group hover:text-brand-sage transition-colors"
                  >
                    Ver detalles del proyecto
                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <Link 
            href="/proyectos"
            className="inline-block border border-brand-dark px-8 py-4 text-brand-dark font-bold uppercase tracking-[0.2em] text-sm hover:bg-brand-dark hover:text-white transition-colors"
          >
            Explorar todos los proyectos
          </Link>
        </div>
      </div>
    </section>
  )
}
