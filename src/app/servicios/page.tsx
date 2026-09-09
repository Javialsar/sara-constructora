import { ArrowRight, Compass, HardHat, Ruler, Building2, Map, Calculator, Wrench, Eye, Box, FileSignature } from "lucide-react"

const servicios = [
  { id: "01", icon: Compass, title: "Diseño Arquitectónico", desc: "Conceptualización y diseño de espacios funcionales y estéticos, priorizando la habitabilidad y el entorno." },
  { id: "02", icon: Building2, title: "Construcción de Obras", desc: "Ejecución integral de proyectos residenciales, comerciales e institucionales con estrictos estándares de calidad." },
  { id: "03", icon: Ruler, title: "Ingeniería y Cálculo Estructural", desc: "Análisis y diseño estructural garantizando la máxima seguridad sísmica y estabilidad de las edificaciones." },
  { id: "04", icon: HardHat, title: "Estudios de Suelos", desc: "Análisis geotécnico fundamental para cimentar correctamente cada proyecto." },
  { id: "05", icon: Map, title: "Topografía y Planimetría", desc: "Levantamientos topográficos precisos necesarios para una correcta planificación espacial." },
  { id: "06", icon: Calculator, title: "Presupuestos y APU", desc: "Cálculo detallado de costos, cantidades de obra y análisis de precios unitarios (APU)." },
  { id: "07", icon: Wrench, title: "Remodelaciones y Ampliaciones", desc: "Intervención, transformación y mejora técnica de espacios e infraestructuras existentes." },
  { id: "08", icon: Eye, title: "Dirección y Supervisión de Obras", desc: "Fiscalización, control técnico y administrativo permanente durante toda la ejecución del proyecto." },
  { id: "09", icon: Box, title: "Modelado 3D y Renders", desc: "Visualización fotorrealista para entender y comercializar el proyecto antes de construirlo." },
  { id: "10", icon: FileSignature, title: "Consultoría Técnica", desc: "Asesoría especializada, revisión de planos y gestión técnica integral en desarrollo inmobiliario." },
]

export default function ServiciosPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <header className="mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-brand-dark tracking-tight mb-4 uppercase">
            Nuestros Servicios
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl">
            SOLUCIONES INTEGRALES PARA CADA ETAPA DE TU PROYECTO.
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicios.map((s) => {
            const Icon = s.icon
            return (
              <div 
                key={s.id} 
                id={s.id}
                className="bg-white border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="p-4 bg-brand-dark text-white">
                    <Icon size={28} />
                  </div>
                  <span className="text-gray-300 font-mono text-2xl font-light">{s.id}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-dark mb-4">{s.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
