import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { MapPin, ArrowLeft, Calendar, Activity, Info, Camera, User } from "lucide-react"
import ProjectsMapClient from "@/components/ui/ProjectsMapClient"

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient()
  
  const { data: proyecto } = await supabase
    .from('proyectos')
    .select('nombre, descripcion')
    .eq('id', id)
    .single()

  const { data: config } = await supabase.from('configuracion_empresa').select('logo_url').limit(1).single()
  
  const title = proyecto?.nombre ? `${proyecto.nombre} | SARA Constructora` : 'SARA Constructora'
  const description = proyecto?.descripcion?.substring(0, 160) || 'Detalles del proyecto.'
  // El usuario solicitó específicamente que aparezca el logotipo actual al compartir el proyecto
  const ogImage = config?.logo_url || '/images/logo-sara-transparent.png'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    }
  }
}

export default async function ProyectoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient()
  
  const { data: proyecto, error } = await supabase
    .from('proyectos')
    .select('*, clientes (nombre, apellido)')
    .eq('id', id)
    .single()

  if (error || !proyecto) {
    notFound()
  }

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'en_diseno': return 'Fase de Diseño'
      case 'en_construccion': return 'En Construcción'
      case 'finalizado': return 'Obra Finalizada'
      default: return estado.replace('_', ' ')
    }
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Hero Section Split Layout */}
      <div className="relative min-h-[85vh] lg:min-h-screen flex items-center pt-20 overflow-hidden bg-brand-dark">
        {proyecto.imagen_url ? (
          <div 
            className="absolute inset-0 lg:left-[45%] lg:w-auto w-full h-full z-0 bg-cover bg-center lg:bg-left"
            style={{ backgroundImage: `url(${proyecto.imagen_url})` }}
          >
            <div className="hidden lg:block absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-brand-dark to-transparent z-10" />
            <div className="lg:hidden absolute inset-0 bg-brand-dark/70 z-10" />
          </div>
        ) : (
          <div className="absolute inset-0 lg:left-[45%] lg:w-auto w-full h-full z-0 flex items-center justify-center bg-brand-black">
            <span className="text-white/10 text-9xl font-extrabold uppercase">{proyecto.nombre?.charAt(0)}</span>
          </div>
        )}
        
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-brand-dark/90 via-brand-dark/40 to-transparent w-full md:w-[120%]" />
        <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_left,_var(--color-brand-sage)_0%,_transparent_60%)] opacity-20 pointer-events-none" />
        
        <div className="container relative z-20 mx-auto px-6 md:px-12 flex flex-col justify-center min-h-[80vh]">
          <div className="max-w-3xl space-y-6 md:pl-8">
            <Link href="/proyectos" className="inline-flex items-center gap-2 text-white/70 hover:text-brand-sage mb-2 transition-colors text-sm font-bold tracking-widest uppercase">
              <ArrowLeft size={16} /> Volver a Proyectos
            </Link>
            
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-brand-sage text-brand-dark px-3 py-1 text-xs font-bold uppercase tracking-wider">
                {getStatusLabel(proyecto.estado)}
              </span>
              <span className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-white/10">
                Avance: {proyecto.avance}%
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight drop-shadow-2xl">
              {proyecto.nombre}
            </h1>
            
            <div className="flex flex-col gap-3 mt-6">
              <div className="flex items-center gap-3 text-white/80 text-lg md:text-xl border-l-2 border-brand-sage/50 pl-4">
                <MapPin className="text-brand-sage" size={24} />
                <span className="font-light">{proyecto.ubicacion}</span>
              </div>
              
              {proyecto.clientes && (
                <div className="flex items-center gap-3 text-white/70 text-base md:text-lg border-l-2 border-brand-sage/30 pl-4">
                  <User className="text-brand-sage/80" size={22} />
                  <span className="font-light">
                    Cliente: <span className="font-medium">{proyecto.clientes.nombre} {proyecto.clientes.apellido}</span>
                  </span>
                </div>
              )}
            </div>

            {proyecto.descripcion && (
              <p className="text-white/60 font-light text-lg max-w-xl leading-relaxed mt-8 border-t border-white/10 pt-6">
                {proyecto.descripcion.length > 160 
                  ? proyecto.descripcion.substring(0, 160) + '...' 
                  : proyecto.descripcion}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Galería Tipo Marquesina (Carousel) */}
      {proyecto.galeria && proyecto.galeria.length > 0 && (
        <div className="w-full bg-brand-dark py-6 border-t border-white/5 relative overflow-hidden group">
          {/* Se duplica el arreglo para que el scroll sea infinito */}
          <div className="flex gap-4 px-4 w-max animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused]">
            {[...proyecto.galeria, ...proyecto.galeria, ...proyecto.galeria].map((url: string, index: number) => (
              <div 
                key={index} 
                className="relative flex-none w-[280px] md:w-[400px] aspect-[4/3] overflow-hidden rounded-lg bg-black/50"
              >
                <img 
                  src={url} 
                  alt={`${proyecto.nombre} - Perspectiva ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-sm font-bold tracking-[0.2em] text-brand-sage uppercase mb-4 flex items-center gap-2">
                <Info size={16} /> Sobre el Proyecto
              </h2>
              <div className="prose prose-lg max-w-none text-gray-600">
                {proyecto.descripcion ? (
                  <p className="whitespace-pre-line leading-relaxed text-lg">
                    {proyecto.descripcion}
                  </p>
                ) : (
                  <p className="italic text-gray-400">La descripción detallada de este proyecto se actualizará próximamente.</p>
                )}
              </div>
            </div>

            {/* Avance Visual */}
            <div className="bg-gray-50 border border-gray-100 p-8">
              <h3 className="font-bold text-brand-dark text-xl mb-4 flex items-center gap-2">
                <Activity className="text-brand-sage" /> Progreso de la Obra
              </h3>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-gray-500 uppercase tracking-widest">Ejecución</span>
                <span className="text-brand-dark">{proyecto.avance}%</span>
              </div>
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-sage transition-all duration-1000 ease-out"
                  style={{ width: `${proyecto.avance}%` }}
                />
              </div>
            </div>

            {/* Mapa de Ubicación */}
            {proyecto.latitud && proyecto.longitud && (
              <div className="bg-gray-50 border border-gray-100 p-8">
                <h3 className="font-bold text-brand-dark text-xl mb-4 flex items-center gap-2">
                  <MapPin className="text-brand-sage" /> Ubicación del Proyecto
                </h3>
                <div className="w-full h-[350px] bg-white border border-gray-200 z-0 relative rounded overflow-hidden">
                  <ProjectsMapClient 
                    projects={[{
                      id: proyecto.id,
                      title: proyecto.nombre,
                      category: getStatusLabel(proyecto.estado),
                      status: getStatusLabel(proyecto.estado),
                      lat: proyecto.latitud,
                      lng: proyecto.longitud
                    }]} 
                    flyTo={{ lat: proyecto.latitud, lng: proyecto.longitud, id: proyecto.id }}
                  />
                </div>
              </div>
            )}

          </div>

          {/* Sidebar / Info */}
          <div className="lg:col-span-1">
            <div className="bg-brand-dark text-white p-8 sticky top-24">
              <h3 className="font-bold text-2xl mb-6 border-b border-white/10 pb-4">Detalles Técnicos</h3>
              
              <ul className="space-y-6">
                <li>
                  <span className="block text-brand-sage font-bold text-xs uppercase tracking-widest mb-1">Ubicación Estratégica</span>
                  <div className="flex items-start gap-2 text-gray-300">
                    <MapPin size={18} className="shrink-0 mt-0.5 text-white/50" />
                    <span>{proyecto.ubicacion}</span>
                  </div>
                </li>
                <li>
                  <span className="block text-brand-sage font-bold text-xs uppercase tracking-widest mb-1">Estado Actual</span>
                  <div className="flex items-start gap-2 text-gray-300">
                    <Activity size={18} className="shrink-0 mt-0.5 text-white/50" />
                    <span>{getStatusLabel(proyecto.estado)}</span>
                  </div>
                </li>
                <li>
                  <span className="block text-brand-sage font-bold text-xs uppercase tracking-widest mb-1">Inicio de Obra</span>
                  <div className="flex items-start gap-2 text-gray-300">
                    <Calendar size={18} className="shrink-0 mt-0.5 text-white/50" />
                    <span>{new Date(proyecto.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </li>
              </ul>

              <div className="mt-10 pt-6 border-t border-white/10">
                <p className="text-sm text-gray-400 mb-4">¿Te interesa desarrollar un proyecto con especificaciones similares?</p>
                <Link href="/contacto" className="block text-center bg-brand-sage text-brand-dark font-bold py-3 uppercase tracking-wider hover:bg-white transition-colors">
                  Contactar Asesor
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
