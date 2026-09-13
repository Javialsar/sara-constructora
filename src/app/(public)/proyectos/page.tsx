"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import ProjectsMapClient from "@/components/ui/ProjectsMapClient"

const getStatusLabel = (estado: string) => {
  switch (estado) {
    case 'en_diseno': return 'Diseño'
    case 'en_construccion': return 'Construcción'
    case 'finalizado': return 'Finalizado'
    default: return estado.replace('_', ' ')
  }
}

export default function ProyectosPage() {
  const router = useRouter()
  const supabase = createClient()
  const [proyectos, setProyectos] = useState<any[]>([])
  const [filtro, setFiltro] = useState("TODOS")
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; id: string } | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("proyectos")
        .select("*")
        .order("created_at", { ascending: false })

      if (data) setProyectos(data)
    }
    load()
  }, [])

  const proyectosConMapa = proyectos.filter(p => p.latitud && p.longitud).map(p => ({
    id: p.id,
    title: p.nombre,
    category: getStatusLabel(p.estado),
    status: getStatusLabel(p.estado),
    lat: p.latitud,
    lng: p.longitud
  }))

  const filteredProyectos = proyectos.filter(p => {
    if (filtro === "TODOS") return true
    if (filtro === "DISEÑO") return p.estado === 'en_diseno'
    if (filtro === "CONSTRUCCIÓN") return p.estado === 'en_construccion'
    if (filtro === "FINALIZADOS") return p.estado === 'finalizado'
    return true
  })

  const handleCardClick = (project: any) => {
    router.push(`/proyectos/${project.id}`)
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container mx-auto px-4 md:px-8">
        <header className="mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-brand-dark tracking-tight mb-4 uppercase">
            Nuestros Proyectos
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-500 font-medium">
            IDEAS QUE SE CONVIERTEN EN REALIDAD.
          </h2>
        </header>

        {/* Map Section */}
        <section className="mb-20" ref={mapRef}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-brand-black">Mapa de Proyectos</h3>
            <span className="text-sm font-bold bg-brand-sage text-brand-dark px-3 py-1 rounded">Visualización Global</span>
          </div>
          <div className="border border-gray-200 shadow-sm overflow-hidden bg-white">
            <ProjectsMapClient projects={proyectosConMapa} flyTo={flyTo} />
          </div>
        </section>

        {/* Projects Grid */}
        <section>
          <div className="flex gap-4 mb-8 overflow-x-auto pb-4 hide-scrollbar">
            {["TODOS", "DISEÑO", "CONSTRUCCIÓN", "FINALIZADOS"].map(filter => (
              <button 
                key={filter} 
                onClick={() => setFiltro(filter)}
                className={`whitespace-nowrap px-4 py-2 border text-sm font-bold uppercase tracking-wider transition-colors ${
                  filtro === filter 
                    ? 'bg-brand-dark text-white border-brand-dark' 
                    : 'border-gray-200 text-gray-600 hover:bg-brand-dark hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProyectos.length > 0 ? (
              filteredProyectos.map(project => (
                <div 
                  key={project.id} 
                  onClick={() => handleCardClick(project)}
                  className={`group border border-gray-200 overflow-hidden bg-white hover:shadow-lg transition-all cursor-pointer`}
                >
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                     <div className="absolute inset-0 bg-brand-dark/5 group-hover:bg-transparent transition-colors z-10" />
                     {project.imagen_url ? (
                       <img src={project.imagen_url} alt={project.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                     ) : (
                       <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium">Sin imagen</div>
                     )}
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-bold text-brand-sage uppercase tracking-wider mb-2 block">{getStatusLabel(project.estado)}</span>
                    <h4 className="text-xl font-bold text-brand-dark mb-4">{project.nombre}</h4>
                    <div className="flex items-center justify-between text-sm font-medium text-gray-500">
                      <span className="truncate">{project.ubicacion}</span>
                      <span>{new Date(project.created_at).getFullYear()}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-400">
                Aún no hay proyectos públicos cargados.
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
