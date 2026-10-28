"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import ProjectsMapClient from "@/components/ui/ProjectsMapClient"
import Image from "next/image"

const PROYECTOS_INSTITUCIONALES_SEMILLA = [
  {
    id: "proy-ciclope-sara",
    nombre: "Proyecto Arquitectónico & Estructural Cíclope",
    ubicacion: "Cuenca / Loja, Ecuador",
    estado: "finalizado",
    imagen_url: "/proyectos/ciclope/ciclope1.png",
    latitud: -2.9001,
    longitud: -79.0059,
    descripcion: "Obra ejecutada por SARA Constructora con hormigón armado visto, voladizos estructurales NEC-15 e iluminación arquitectónica integrada.",
    avance: 100,
    created_at: "2026-01-15T10:00:00Z"
  },
  {
    id: "proy-rincon-campestre",
    nombre: "Conjunto Residencial Rincón Campestre",
    ubicacion: "Valle de Yunguilla / Azuay, Ecuador",
    estado: "finalizado",
    imagen_url: "/proyectos/rincon-campestre/foto01.png",
    latitud: -3.2145,
    longitud: -79.2610,
    descripcion: "Desarrollo campestre exclusivo con diseño bioclimático, áreas sociales de lujo y acabados de primera calidad.",
    avance: 100,
    created_at: "2025-11-20T10:00:00Z"
  },
  {
    id: "proy-ciclope-interiores",
    nombre: "Residencial Cíclope Fase II — Acabados & Estructura",
    ubicacion: "Cuenca, Azuay",
    estado: "en_construccion",
    imagen_url: "/proyectos/ciclope/ciclope4.png",
    latitud: -2.8974,
    longitud: -79.0125,
    descripcion: "Segunda etapa constructiva con control presupuestario SARA-APU y fiscalización digital en tiempo real.",
    avance: 88,
    created_at: "2026-03-10T10:00:00Z"
  },
  {
    id: "proy-rincon-villas",
    nombre: "Villas Patrimoniales Rincón Campestre Etapa II",
    ubicacion: "Azuay / Loja, Ecuador",
    estado: "en_construccion",
    imagen_url: "/proyectos/rincon-campestre/foto03.png",
    latitud: -3.9931,
    longitud: -79.2042,
    descripcion: "Villas vacacionales y residenciales diseñadas bajo estándares sismorresistentes y alta plusvalía inmobiliaria.",
    avance: 76,
    created_at: "2026-04-12T10:00:00Z"
  },
  {
    id: "proy-quito-carolina",
    nombre: "Torre Corporativa & Residencial Aura Carolina",
    ubicacion: "Quito, Pichincha (Av. República del Salvador)",
    estado: "en_construccion",
    imagen_url: "/proyectos/ciclope/ciclope7.png",
    latitud: -0.1807,
    longitud: -78.4810,
    descripcion: "Edificio sismorresistente NEC-15 con modelado BIM LOD 400 y cimentación profunda.",
    avance: 78,
    created_at: "2026-02-15T10:00:00Z"
  },
  {
    id: "proy-ciclope-nocturno",
    nombre: "Complejo Residencial Cíclope — Ingeniería & Diseño",
    ubicacion: "Ecuador (Región Sur)",
    estado: "en_diseno",
    imagen_url: "/proyectos/ciclope/ciclope9.png",
    latitud: -2.1448,
    longitud: -79.8654,
    descripcion: "Modelado integral 3D BIM, cómputo métrico automatizado y planificación de obra llave en mano.",
    avance: 45,
    created_at: "2026-05-01T10:00:00Z"
  }
]

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
  const [proyectos, setProyectos] = useState<any[]>(PROYECTOS_INSTITUCIONALES_SEMILLA)
  const [filtro, setFiltro] = useState("TODOS")
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; id: string } | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("proyectos")
        .select("id, nombre, ubicacion, estado, imagen_url, latitud, longitud, descripcion, avance, created_at")
        .order("created_at", { ascending: false })

      if (data && data.length > 0) {
        const idsDb = new Set(data.map((d: any) => d.id))
        const combined = [
          ...data,
          ...PROYECTOS_INSTITUCIONALES_SEMILLA.filter(p => !idsDb.has(p.id))
        ]
        setProyectos(combined)
      }
    }
    load()
  }, [supabase])

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
    if (project.latitud && project.longitud) {
      setFlyTo({ lat: project.latitud, lng: project.longitud, id: project.id })
      
      if (mapRef.current) {
        const y = mapRef.current.getBoundingClientRect().top + window.scrollY - 100
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    } else {
      router.push(`/contacto?proyecto=${encodeURIComponent(project.nombre)}`)
    }
  }

  return (
    <div className="pt-36 pb-16 min-h-screen">
      <div className="container mx-auto px-4 md:px-8">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-dark tracking-tighter mb-4 uppercase">
            Nuestros Proyectos
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-500 font-medium">
            PORTAFOLIO DE INGENIERÍA CIVIL, ARQUITECTURA Y OBRAS EJECUTADAS EN ECUADOR.
          </h2>
        </header>

        {/* Map Section */}
        <section className="mb-20" ref={mapRef}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-brand-black">Mapa Georreferenciado de Obras</h3>
            <span className="text-sm font-bold bg-brand-sage text-brand-dark px-3 py-1 rounded">
              {proyectos.length} Obras Activas & Ejecutadas
            </span>
          </div>
          <div className="border border-gray-200 shadow-sm bg-white rounded z-0 relative h-[400px] md:h-[520px]">
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
                className={`whitespace-nowrap px-4 py-2 border text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${
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
            {filteredProyectos.map(project => (
              <div 
                key={project.id} 
                onClick={() => handleCardClick(project)}
                className="group border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/3] bg-slate-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-brand-dark/10 group-hover:bg-transparent transition-colors z-10" />
                    {project.imagen_url ? (
                      <Image src={project.imagen_url} alt={project.nombre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium">Vista Técnica</div>
                    )}
                    <div className="absolute top-3 left-3 z-20 bg-slate-950/85 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {getStatusLabel(project.estado)}
                    </div>
                    {typeof project.avance === 'number' && (
                      <div className="absolute bottom-3 right-3 z-20 bg-emerald-500 text-slate-950 text-[11px] font-mono font-black px-2.5 py-1 rounded-lg">
                        Avance: {project.avance}%
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-brand-dark mb-2 group-hover:text-brand-sage transition-colors">
                      {project.nombre}
                    </h4>
                    {project.descripcion && (
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        {project.descripcion}
                      </p>
                    )}
                  </div>
                </div>
                <div className="px-6 pb-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-mono font-semibold text-gray-500">
                  <span className="truncate">{project.ubicacion}</span>
                  <span>{new Date(project.created_at).getFullYear()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
