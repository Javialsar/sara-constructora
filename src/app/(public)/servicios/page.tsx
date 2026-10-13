"use client"
import ModuloIntroSplash from '@/components/ui/ModuloIntroSplash';
import { ArrowRight, Compass, HardHat, Ruler, Building2, Map, Calculator, Wrench, Eye, Box, FileSignature } from "lucide-react"
import Link from "next/link"

const servicios = [
  { id: "01", slug: "diseno-arquitectonico", icon: Compass, title: "Diseño Arquitectónico", desc: "Conceptualización y diseño de espacios funcionales y estéticos, priorizando la habitabilidad y el entorno.", image: "/images/servicios/01-diseno.png" },
  { id: "02", slug: "construccion-de-obras", icon: Building2, title: "Construcción de Obras", desc: "Ejecución integral de proyectos residenciales, comerciales e institucionales con estrictos estándares de calidad.", image: "/images/servicios/02-construccion.png" },
  { id: "03", slug: "ingenieria-y-calculo-estructural", icon: Ruler, title: "Ingeniería y Cálculo Estructural", desc: "Análisis y diseño estructural garantizando la máxima seguridad sísmica y estabilidad de las edificaciones.", image: "/images/servicios/03-calculo.png" },
  { id: "04", slug: "estudios-de-suelos", icon: HardHat, title: "Estudios de Suelos", desc: "Análisis geotécnico fundamental para cimentar correctamente cada proyecto.", image: "/images/servicios/04-suelos.png" },
  { id: "05", slug: "topografia-y-planimetria", icon: Map, title: "Topografía y Planimetría", desc: "Levantamientos topográficos precisos necesarios para una correcta planificación espacial.", image: "/images/servicios/05-topografia.png" },
  { id: "06", slug: "presupuestos-y-apu", icon: Calculator, title: "Presupuestos y APU", desc: "Cálculo detallado de costos, cantidades de obra y análisis de precios unitarios (APU).", image: "/images/servicios/06-presupuestos.png" },
  { id: "07", slug: "remodelaciones-y-ampliaciones", icon: Wrench, title: "Remodelaciones y Ampliaciones", desc: "Intervención, transformación y mejora técnica de espacios e infraestructuras existentes.", image: "/images/servicios/07-remodelaciones.png" },
  { id: "08", slug: "direccion-y-supervision", icon: Eye, title: "Dirección y Supervisión de Obras", desc: "Fiscalización, control técnico y administrativo permanente durante toda la ejecución del proyecto.", image: "/images/servicios/08-supervision.png" },
  { id: "09", slug: "modelado-3d-y-renders", icon: Box, title: "Modelado 3D y Renders", desc: "Visualización fotorrealista para entender y comercializar el proyecto antes de construirlo.", image: "/images/servicios/09-renders.png" },
  { id: "10", slug: "consultoria-tecnica", icon: FileSignature, title: "Consultoría Técnica", desc: "Asesoría especializada, revisión de planos y gestión técnica integral en desarrollo inmobiliario.", image: "/images/servicios/10-consultoria.png" },
]

export default function ServiciosPage() {
  return (
    <div className="pt-36 pb-24 min-h-screen bg-gray-50">
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
              <Link 
                href={`/servicios/${s.slug}`}
                key={s.id} 
                id={s.id}
                className="bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col block"
              >
                {/* Imagen del Servicio */}
                <div className="aspect-square w-full overflow-hidden relative bg-gray-100">
                  <div 
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    style={{ backgroundImage: `url(${s.image})` }}
                  />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
