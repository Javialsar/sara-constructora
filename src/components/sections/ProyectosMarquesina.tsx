"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { MapPin, ArrowRight, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const getStatusLabel = (estado: string) => {
  switch (estado) {
    case 'en_diseno': return 'Diseño'
    case 'en_construccion': return 'En Construcción'
    case 'finalizado': return 'Finalizado'
    default: return (estado || '').replace('_', ' ')
  }
}

export default function ProyectosMarquesina() {
  const supabase = createClient()
  const [proyectosDB, setProyectosDB] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProyectos() {
      const { data } = await supabase
        .from('proyectos')
        .select('id, nombre, ubicacion, estado, imagen_url')
        .order('created_at', { ascending: false })

      if (data && data.length > 0) {
        setProyectosDB(data)
      }
      setLoading(false)
    }
    fetchProyectos()
  }, [])

  if (loading) {
    return (
      <section className="bg-[#080d10] py-16 md:py-24 overflow-hidden border-t border-b border-white/10 relative">
        <div className="container mx-auto px-4 md:px-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="h-4 w-44 bg-white/10 rounded animate-pulse" />
            <div className="h-10 w-64 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex gap-6 px-4 md:px-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[300px] md:w-[420px] h-[360px] md:h-[460px] rounded-2xl bg-white/[0.03] border border-white/10 animate-pulse shrink-0" />
          ))}
        </div>
      </section>
    )
  }

  // Si no hay proyectos, no renderizar la sección
  if (proyectosDB.length === 0) {
    return null
  }

  // Duplicamos el array para el efecto infinito continuo
  const proyectos = [...proyectosDB, ...proyectosDB]

  return (
    <section className="bg-[#080d10] py-16 md:py-24 overflow-hidden border-t border-b border-white/10 relative">
      
      {/* Luz ambiental de fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(197,160,89,0.08),rgba(0,0,0,0))] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="text-brand-sage font-extrabold tracking-[0.25em] text-xs uppercase mb-2">
            Portafolio de Obras Civiles
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
            Nuestros <span className="text-brand-sage">Proyectos</span>
          </h2>
        </div>
        <Link 
          href="/proyectos" 
          className="inline-flex items-center gap-2 text-white hover:text-brand-sage text-xs font-black uppercase tracking-widest transition-all bg-white/5 hover:bg-white/10 px-5 py-3 rounded-xl border border-white/10 group"
        >
          <span>Explorar Catálogo Completo</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-brand-sage" />
        </Link>
      </div>

      <div className="relative w-full flex overflow-x-hidden">
        {/* Marquesina animada infinita */}
        <motion.div 
          className="flex gap-8 px-4 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: Math.max(25, proyectosDB.length * 9),
            repeat: Infinity,
          }}
        >
          {proyectos.map((proyecto, idx) => (
            <Link 
              href={`/proyectos/${proyecto.id}`}
              key={`${proyecto.id}-${idx}`} 
              className="relative w-[320px] md:w-[480px] aspect-[16/11] group overflow-hidden rounded-2xl border border-white/10 bg-[#0c1418] flex-shrink-0 cursor-pointer block hover:border-brand-sage/60 transition-all duration-500 shadow-2xl"
            >
              {proyecto.imagen_url ? (
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-out brightness-[1.10] contrast-[1.12] saturate-[1.18]"
                  style={{ backgroundImage: `url(${proyecto.imagen_url})` }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-dark to-[#0c1418] flex items-center justify-center">
                  <span className="text-white/20 text-6xl font-black uppercase">{proyecto.nombre?.charAt(0)}</span>
                </div>
              )}

              {/* Degradados cinemáticos ligeros: permiten apreciar la arquitectura con gran luminosidad */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
              
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <span className="bg-brand-sage text-brand-dark text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-md shadow-lg">
                    {getStatusLabel(proyecto.estado)}
                  </span>

                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-md text-white p-2 rounded-lg border border-white/20">
                    <Eye size={14} />
                  </span>
                </div>
                
                <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-white font-black text-xl md:text-2xl tracking-tight uppercase mb-2 group-hover:text-brand-sage transition-colors">
                    {proyecto.nombre}
                  </h3>
                  <p className="text-slate-300 text-xs font-semibold flex items-center gap-1.5 uppercase tracking-wider">
                    <MapPin size={13} className="text-brand-sage shrink-0" />
                    <span>{proyecto.ubicacion || 'Ecuador'}</span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
