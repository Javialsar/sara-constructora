import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { MapPin, ArrowLeft, Calendar, Activity, Info } from "lucide-react"
import ProjectsMapClient from "@/components/ui/ProjectsMapClient"

export const revalidate = 0;

export default async function ProyectoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient()
  
  const { data: proyecto, error } = await supabase
    .from('proyectos')
    .select('*')
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
      {/* Hero Section */}
      <div className="relative min-h-[85vh] lg:min-h-screen bg-brand-dark w-full overflow-hidden">
        {proyecto.imagen_url ? (
          <div 
            className="absolute inset-0 bg-cover bg-center md:bg-fixed"
            style={{ backgroundImage: `url(${proyecto.imagen_url})` }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-dark to-brand-black">
            <span className="text-white/10 text-9xl font-extrabold uppercase">{proyecto.nombre?.charAt(0)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/95 via-brand-dark/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container mx-auto px-4 md:px-8 pb-20">
            <Link href="/proyectos" className="inline-flex items-center gap-2 text-white/70 hover:text-brand-sage mb-6 transition-colors text-sm font-bold tracking-widest uppercase">
              <ArrowLeft size={16} /> Volver a Proyectos
            </Link>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-brand-sage text-brand-dark px-3 py-1 text-xs font-bold uppercase tracking-wider">
                {getStatusLabel(proyecto.estado)}
              </span>
              <span className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-white/10">
                Avance: {proyecto.avance}%
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tighter mb-4 drop-shadow-lg">
              {proyecto.nombre}
            </h1>
            <div className="flex items-center gap-2 text-white/80 text-lg md:text-xl">
              <MapPin className="text-brand-sage" size={24} />
              <span>{proyecto.ubicacion}</span>
            </div>
          </div>
        </div>
      </div>

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
