"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Briefcase, MapPin, Building, ChevronRight } from "lucide-react"
import dynamic from "next/dynamic"

// Importar mapa dinámicamente sin SSR
const ProjectsMap = dynamic(() => import("@/components/ui/ProjectsMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[500px] bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 border border-gray-200 rounded-2xl">Cargando mapa interactivo...</div>
})

export default function InteractivePortfolio({ proyectos, mapProjects }: { proyectos: any[], mapProjects: any[] }) {
  const router = useRouter()
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; id: string } | null>(null)
  const [flyingToId, setFlyingToId] = useState<string | null>(null)

  const handleProjectClick = (e: React.MouseEvent, p: any) => {
    // Si no tiene coordenadas, dejamos que funcione el link normalmente
    if (!p.latitud || !p.longitud) return

    e.preventDefault()
    
    // Activar animación en la UI (feedback visual)
    setFlyingToId(p.id)
    
    // Configurar coordenadas para volar el mapa
    setFlyTo({
      lat: p.latitud,
      lng: p.longitud,
      id: p.id
    })

    // Esperar a que termine la animación del mapa (aprox 2 segundos) antes de navegar
    setTimeout(() => {
      router.push(`/proyectos/${p.id}`)
    }, 2000)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Lista de Proyectos */}
      <div className="w-full lg:w-1/3 space-y-6">
        <h2 className="text-2xl font-bold text-brand-dark uppercase tracking-widest mb-6 flex items-center gap-3 border-b-2 border-brand-sage/30 pb-4">
          <Briefcase className="text-brand-sage" /> Portafolio
        </h2>
        
        {!proyectos || proyectos.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-500">
            Aún no hay proyectos registrados para este cliente.
          </div>
        ) : (
          proyectos.map((p) => {
            const isFlying = flyingToId === p.id
            return (
              <a 
                href={`/proyectos/${p.id}`} 
                key={p.id} 
                onClick={(e) => handleProjectClick(e, p)}
                className={`group block border p-6 rounded-2xl shadow-sm transition-all relative overflow-hidden ${
                  isFlying 
                    ? 'bg-brand-sage/10 border-brand-sage scale-[1.02] shadow-md' 
                    : 'bg-white border-gray-100 hover:shadow-xl hover:border-brand-sage/30'
                }`}
              >
                {isFlying && (
                  <div className="absolute inset-0 bg-brand-sage/5 animate-pulse" />
                )}
                <h3 className="font-bold text-brand-dark uppercase tracking-wide group-hover:text-brand-sage transition-colors mb-2 relative z-10">
                  {p.nombre}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 relative z-10">
                  <MapPin size={14} className={isFlying ? "text-brand-sage animate-bounce" : "text-gray-400"} />
                  <span className="truncate">{p.ubicacion || "Ubicación no especificada"}</span>
                </div>
                <div className="flex justify-between items-center relative z-10">
                  <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wider">
                    {p.estado === "completado" ? "Finalizado" : "En Progreso"}
                  </span>
                  <span className={`flex items-center gap-1 text-sm font-medium transition-all duration-300 ${isFlying ? 'text-brand-sage opacity-100 translate-x-0' : 'text-brand-sage opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0'}`}>
                    {isFlying ? 'Ubicando...' : 'Ver Proyecto'} <ChevronRight size={16} className={isFlying ? "animate-ping" : ""} />
                  </span>
                </div>
              </a>
            )
          })
        )}
      </div>

      {/* Mapa */}
      <div className="w-full lg:w-2/3">
        <h2 className="text-2xl font-bold text-brand-dark uppercase tracking-widest mb-6 flex items-center gap-3 border-b-2 border-brand-sage/30 pb-4">
          <Building className="text-brand-sage" /> Mapa de Obras
        </h2>
        
        <div className="bg-white p-2 rounded-3xl shadow-lg border border-gray-100 h-[500px] md:h-[600px] overflow-hidden relative">
          {mapProjects.length > 0 ? (
            <div className="w-full h-full rounded-2xl overflow-hidden relative z-0">
               <ProjectsMap projects={mapProjects} flyTo={flyTo} />
            </div>
          ) : (
            <div className="w-full h-full bg-gray-50 rounded-2xl flex flex-col items-center justify-center text-gray-400 border border-gray-100">
              <MapPin size={48} className="mb-4 opacity-20" />
              <p className="font-medium text-center px-6">
                Los proyectos de este cliente aún no tienen coordenadas geográficas configuradas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
