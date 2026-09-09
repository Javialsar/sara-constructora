import { ArrowRight, Compass, HardHat, Ruler, Building2, Map, Calculator, Wrench, Eye, Box, FileSignature } from "lucide-react"

const servicios = [
  { id: "01", icon: Compass, title: "Diseño Arquitectónico", desc: "Conceptualización y diseño de espacios funcionales y estéticos, priorizando la habitabilidad y el entorno.", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop" },
  { id: "02", icon: Building2, title: "Construcción de Obras", desc: "Ejecución integral de proyectos residenciales, comerciales e institucionales con estrictos estándares de calidad.", image: "https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=800&auto=format&fit=crop" },
  { id: "03", icon: Ruler, title: "Ingeniería y Cálculo Estructural", desc: "Análisis y diseño estructural garantizando la máxima seguridad sísmica y estabilidad de las edificaciones.", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop" },
  { id: "04", icon: HardHat, title: "Estudios de Suelos", desc: "Análisis geotécnico fundamental para cimentar correctamente cada proyecto.", image: "https://images.unsplash.com/photo-1578509378904-71648a04b19c?q=80&w=800&auto=format&fit=crop" },
  { id: "05", icon: Map, title: "Topografía y Planimetría", desc: "Levantamientos topográficos precisos necesarios para una correcta planificación espacial.", image: "https://images.unsplash.com/photo-1524815436321-db9b53177651?q=80&w=800&auto=format&fit=crop" },
  { id: "06", icon: Calculator, title: "Presupuestos y APU", desc: "Cálculo detallado de costos, cantidades de obra y análisis de precios unitarios (APU).", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop" },
  { id: "07", icon: Wrench, title: "Remodelaciones y Ampliaciones", desc: "Intervención, transformación y mejora técnica de espacios e infraestructuras existentes.", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop" },
  { id: "08", icon: Eye, title: "Dirección y Supervisión de Obras", desc: "Fiscalización, control técnico y administrativo permanente durante toda la ejecución del proyecto.", image: "https://images.unsplash.com/photo-1504307651254-35680f356f58?q=80&w=800&auto=format&fit=crop" },
  { id: "09", icon: Box, title: "Modelado 3D y Renders", desc: "Visualización fotorrealista para entender y comercializar el proyecto antes de construirlo.", image: "https://images.unsplash.com/photo-1600607687989-ce4d31d94f28?q=80&w=800&auto=format&fit=crop" },
  { id: "10", icon: FileSignature, title: "Consultoría Técnica", desc: "Asesoría especializada, revisión de planos y gestión técnica integral en desarrollo inmobiliario.", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop" },
]

export default function ServiciosPage() {
  return (
    <div className="pt-28 pb-24 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-dark tracking-tighter mb-4 uppercase">
            Nuestros Servicios
          </h1>
          <h2 className="text-xl md:text-2xl text-brand-sage font-bold tracking-widest max-w-3xl">
            SOLUCIONES INTEGRALES PARA CADA ETAPA DE TU PROYECTO.
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {servicios.map((s) => {
            return (
              <div 
                key={s.id} 
                id={s.id}
                className="bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col"
              >
                {/* Imagen del Servicio */}
                <div className="aspect-[4/3] w-full overflow-hidden relative">
                  <div 
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    style={{ backgroundImage: `url(${s.image})` }}
                  />
                  <div className="absolute inset-0 bg-brand-dark/20 group-hover:bg-transparent transition-colors duration-500" />
                  
                  {/* Badge con Número */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-brand-dark px-3 py-1 font-mono font-bold text-sm">
                    {s.id}
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-brand-dark mb-4 tracking-tight group-hover:text-brand-sage transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-light text-sm flex-1">
                    {s.desc}
                  </p>
                  <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-brand-dark font-bold text-xs uppercase tracking-widest group-hover:text-brand-sage transition-colors">Solicitar</span>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-brand-sage group-hover:bg-brand-sage group-hover:text-white transition-colors">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
