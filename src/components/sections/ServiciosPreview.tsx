import Link from "next/link"
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
    <section className="py-24 bg-brand-dark text-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-16 md:flex md:justify-between md:items-end">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold tracking-[0.2em] text-brand-sage uppercase mb-4">Nuestros Servicios</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold leading-tight">
              SOLUCIONES PARA CADA ETAPA <br className="hidden md:block"/>
              DE TU PROYECTO.
            </h3>
          </div>
          <Link href="/servicios" className="hidden md:inline-flex items-center gap-2 text-brand-sage font-bold hover:text-white transition-colors uppercase tracking-wider text-sm group">
            Ver todos los servicios
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {servicios.map((s, index) => {
            const Icon = s.icon
            return (
              <Link 
                key={s.id} 
                href={`/servicios#${s.id}`}
                className={`group relative bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-colors duration-300 ${index === 0 || index === 1 ? 'xl:col-span-2' : ''}`}
              >
                <div className="flex justify-between items-start mb-12">
                  <div className="p-3 bg-brand-sage/20 text-brand-sage rounded-sm group-hover:bg-brand-sage group-hover:text-brand-dark transition-colors">
                    <Icon size={24} />
                  </div>
                  <span className="text-brand-sage/50 font-mono text-xl font-light">{s.id}</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3">{s.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">
                    {s.desc}
                  </p>
                  <div className="flex items-center gap-2 text-brand-sage text-sm font-bold uppercase tracking-wider group-hover:text-white transition-colors">
                    Conocer más
                    <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
        
        <div className="mt-12 md:hidden">
          <Link href="/servicios" className="inline-flex items-center gap-2 text-brand-sage font-bold hover:text-white transition-colors uppercase tracking-wider text-sm">
            Ver todos los servicios
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}
