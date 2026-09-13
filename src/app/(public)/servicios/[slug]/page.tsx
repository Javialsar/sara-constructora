import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, ChevronRight, Phone } from "lucide-react"

// Hardcoded info for services for the landing details
const serviciosData: Record<string, any> = {
  "diseno-arquitectonico": {
    titulo: "Diseño Arquitectónico",
    descripcion: "Conceptualización y diseño de espacios funcionales y estéticos, priorizando la habitabilidad y el entorno.",
    detalles: "Creamos diseños personalizados que se adaptan a tu estilo de vida y necesidades, combinando la estética moderna con la funcionalidad. Nuestro proceso incluye modelado 3D, desarrollo de planos arquitectónicos completos y asesoría en la selección de materiales.",
    beneficios: ["Planos aprobados", "Diseño personalizado", "Visualización 3D", "Asesoramiento continuo"],
    imagenHeader: "/images/servicios/01-diseno.png"
  },
  "construccion-de-obras": {
    titulo: "Construcción de Obras",
    descripcion: "Ejecución integral de proyectos residenciales, comerciales e institucionales con estrictos estándares de calidad.",
    detalles: "Nos encargamos de la construcción de principio a fin, asegurando la calidad de los materiales, el cumplimiento de los tiempos y normativas técnicas. Construimos con altos estándares de seguridad para garantizar obras duraderas.",
    beneficios: ["Materiales de alta calidad", "Tiempos de entrega garantizados", "Supervisión técnica permanente", "Seguridad industrial"],
    imagenHeader: "/images/servicios/02-construccion.png"
  },
  "ingenieria-y-calculo-estructural": {
    titulo: "Ingeniería y Cálculo Estructural",
    descripcion: "Análisis y diseño estructural garantizando la máxima seguridad sísmica y estabilidad de las edificaciones.",
    detalles: "Garantizamos que tu proyecto sea seguro, sismorresistente y económicamente viable. Aplicamos las normativas vigentes NEC para realizar cálculos precisos y optimizar la cantidad de material estructural.",
    beneficios: ["Cálculo sismorresistente", "Optimización de materiales", "Cumplimiento normativo NEC", "Memorias de cálculo detalladas"],
    imagenHeader: "/images/servicios/03-calculo.png"
  },
  "estudios-de-suelos": {
    titulo: "Estudios de Suelos",
    descripcion: "Análisis geotécnico fundamental para cimentar correctamente cada proyecto.",
    detalles: "Antes de construir, analizamos las propiedades físicas y mecánicas del terreno. Este paso es vital para diseñar una cimentación adecuada que evite hundimientos, grietas y garantice la estabilidad a largo plazo.",
    beneficios: ["Capacidad portante", "Nivel freático", "Recomendaciones de cimentación", "Prevención de riesgos"],
    imagenHeader: "/images/servicios/04-suelos.png"
  },
  "topografia-y-planimetria": {
    titulo: "Topografía y Planimetría",
    descripcion: "Levantamientos topográficos precisos necesarios para una correcta planificación espacial.",
    detalles: "Realizamos la medición exacta de terrenos utilizando equipos de última tecnología como estaciones totales y drones. Es un paso esencial para la subdivisión, implantación de obra y diseño vial.",
    beneficios: ["Curvas de nivel", "Exactitud milimétrica", "Subdivisiones", "Implantación precisa"],
    imagenHeader: "/images/servicios/05-topografia.png"
  },
  "presupuestos-y-apu": {
    titulo: "Presupuestos y APU",
    descripcion: "Cálculo detallado de costos, cantidades de obra y análisis de precios unitarios (APU).",
    detalles: "Planifica financieramente tu proyecto. Entregamos desgloses exactos de materiales, mano de obra y equipos para que conozcas la inversión real sin sorpresas durante la ejecución.",
    beneficios: ["Cálculo exacto de materiales", "Precios del mercado actualizados", "Cronograma valorado", "Control de inversión"],
    imagenHeader: "/images/servicios/06-presupuestos.png"
  },
  "remodelaciones-y-ampliaciones": {
    titulo: "Remodelaciones y Ampliaciones",
    descripcion: "Intervención, transformación y mejora técnica de espacios e infraestructuras existentes.",
    detalles: "Dale una nueva vida a tu propiedad. Hacemos que tus espacios antiguos se vean modernos, optimizando su distribución y renovando sus instalaciones eléctricas y sanitarias.",
    beneficios: ["Renovación estética", "Optimización de espacios", "Mejora del valor comercial", "Modernización de instalaciones"],
    imagenHeader: "/images/servicios/07-remodelaciones.png"
  },
  "direccion-y-supervision": {
    titulo: "Dirección y Supervisión de Obras",
    descripcion: "Fiscalización, control técnico y administrativo permanente durante toda la ejecución del proyecto.",
    detalles: "Si ya tienes quien construya, nosotros fiscalizamos. Verificamos que los constructores cumplan a cabalidad con los planos, las especificaciones técnicas y los rubros contratados.",
    beneficios: ["Control de calidad", "Control financiero", "Avances de obra documentados", "Defensa del cliente"],
    imagenHeader: "/images/servicios/08-supervision.png"
  },
  "modelado-3d-y-renders": {
    titulo: "Modelado 3D y Renders",
    descripcion: "Visualización fotorrealista para entender y comercializar el proyecto antes de construirlo.",
    detalles: "Visualiza el resultado final antes de poner un solo ladrillo. Generamos recorridos virtuales y renders fotorrealistas con iluminación natural, texturas reales y mobiliario que ayudan a tomar decisiones seguras.",
    beneficios: ["Fotorrealismo", "Recorridos virtuales", "Aprobación visual de acabados", "Marketing inmobiliario"],
    imagenHeader: "/images/servicios/09-renders.png"
  },
  "consultoria-tecnica": {
    titulo: "Consultoría Técnica",
    descripcion: "Asesoría especializada, revisión de planos y gestión técnica integral en desarrollo inmobiliario.",
    detalles: "Si tienes dudas legales, problemas técnicos en obra o necesitas tramitar permisos, nuestro equipo multidisciplinario te brinda la asesoría necesaria para proteger tu inversión inmobiliaria.",
    beneficios: ["Revisión de normativas", "Resolución de patologías estructurales", "Asesoría de permisos", "Auditorías de obra"],
    imagenHeader: "/images/servicios/10-consultoria.png"
  }
}

export default async function ServicioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const { slug } = resolvedParams
  const data = serviciosData[slug]

  if (!data) {
    notFound()
  }

  const supabase = await createClient()

  // Fetch projects related to this service
  const { data: proyectos, error } = await supabase
    .from('proyectos')
    .select('*')
    .eq('servicio_id', slug)
    .order('created_at', { ascending: false })

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      
      {/* Header del Servicio */}
      <header className="relative bg-brand-dark text-white pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image src={data.imagenHeader} alt="Background" fill className="object-cover" />
          <div className="absolute inset-0 bg-brand-dark/80 mix-blend-multiply"></div>
        </div>
        <div className="container relative z-10 mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 font-medium uppercase tracking-wider">
            <Link href="/servicios" className="hover:text-white transition-colors">Servicios</Link>
            <ChevronRight size={14} />
            <span className="text-brand-sage">{data.titulo}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-6">
            {data.titulo}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl leading-relaxed">
            {data.descripcion}
          </p>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 md:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Detalles del Servicio */}
          <div className="lg:col-span-8 bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-brand-dark mb-6 border-b pb-4">Acerca de este servicio</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-10">
              {data.detalles}
            </p>
            
            <h3 className="text-xl font-bold text-brand-dark mb-6">Beneficios Clave</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {data.beneficios.map((ben: string, i: number) => (
                <div key={i} className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <CheckCircle2 className="text-brand-sage shrink-0" size={20} />
                  <span className="text-gray-700 font-medium">{ben}</span>
                </div>
              ))}
            </div>
            
            <div className="bg-brand-sage/10 p-8 rounded-xl border border-brand-sage/20 text-center flex flex-col items-center">
              <h4 className="text-xl font-bold text-brand-dark mb-3">¿Listo para cotizar tu proyecto?</h4>
              <p className="text-gray-600 mb-6">Ponte en contacto con nuestro equipo técnico para recibir asesoría inmediata.</p>
              <Link href="/contacto" className="bg-brand-dark text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-sage hover:text-brand-dark transition-all inline-flex items-center gap-2">
                <Phone size={18} />
                Solicitar Asesoría
              </Link>
            </div>
          </div>

          {/* Galería de Trabajos Realizados */}
          <div className="lg:col-span-4">
            <div className="bg-brand-dark p-8 rounded-2xl shadow-xl text-white sticky top-24">
              <h3 className="text-xl font-bold uppercase tracking-wider mb-6 border-b border-white/20 pb-4">Trabajos Realizados</h3>
              
              {!proyectos || proyectos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm mb-4">Aún no hemos publicado proyectos específicos en esta categoría.</p>
                  <Link href="/proyectos" className="text-brand-sage hover:text-white transition-colors text-sm font-bold flex items-center justify-center gap-2">
                    Ver Portafolio Completo <ArrowLeft size={16} className="rotate-180" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {proyectos.slice(0, 4).map((p) => (
                    <Link href={`/proyectos/${p.id}`} key={p.id} className="group block">
                      <div className="flex gap-4 items-center">
                        <div className="w-20 h-20 bg-gray-800 rounded-lg overflow-hidden shrink-0 relative">
                          {p.imagen_url ? (
                            <Image src={p.imagen_url} alt={p.nombre} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-xs text-gray-500">Sin img</div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm group-hover:text-brand-sage transition-colors line-clamp-2">{p.nombre}</p>
                          <p className="text-xs text-gray-400 mt-1">{p.ubicacion}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  {proyectos.length > 4 && (
                    <div className="pt-4 mt-4 border-t border-white/20 text-center">
                      <Link href="/proyectos" className="text-brand-sage hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
                        Ver todos los proyectos
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
