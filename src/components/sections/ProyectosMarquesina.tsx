"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

const getStatusLabel = (estado: string) => {
  switch (estado) {
    case 'en_diseno': return 'Diseño'
    case 'en_construccion': return 'En Construcción'
    case 'finalizado': return 'Finalizado'
    default: return estado.replace('_', ' ')
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

  // Si aún está cargando o no hay proyectos, no renderizar la sección
  if (loading || proyectosDB.length === 0) {
    return null
  }

  // Duplicamos el array para el efecto infinito
  const proyectos = [...proyectosDB, ...proyectosDB]

  return (
    <section className="bg-white py-12 md:py-20 overflow-hidden border-t border-b border-gray-100">
      <div className="container mx-auto px-4 md:px-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-brand-dark tracking-tighter uppercase mb-2">
            Portafolio Destacado
          </h2>
          <p className="text-brand-sage font-bold tracking-widest text-xs uppercase">
            Proyectos en desarrollo y ejecutados
          </p>
        </div>
        <Link href="/proyectos" className="text-brand-dark hover:text-brand-sage text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
          Ver todos los proyectos →
        </Link>
      </div>

      <div className="relative w-full flex overflow-x-hidden">
        {/* Marquesina animada */}
        <motion.div 
          className="flex gap-6 px-3 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: Math.max(20, proyectosDB.length * 8),
            repeat: Infinity,
          }}
        >
          {proyectos.map((proyecto, idx) => (
            <Link 
              href={`/proyectos/${proyecto.id}`}
              key={`${proyecto.id}-${idx}`} 
              className="relative w-[300px] md:w-[450px] aspect-[4/3] group overflow-hidden bg-brand-black flex-shrink-0 cursor-pointer block"
            >
              {proyecto.imagen_url ? (
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                  style={{ backgroundImage: `url(${proyecto.imagen_url})` }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-dark to-brand-black flex items-center justify-center">
                  <span className="text-white/20 text-6xl font-extrabold uppercase">{proyecto.nombre?.charAt(0)}</span>
                </div>
              )}
              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
              
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="bg-brand-sage text-brand-dark text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                    {getStatusLabel(proyecto.estado)}
                  </span>
                </div>
                
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-white font-bold text-xl md:text-2xl tracking-tight mb-1">
                    {proyecto.nombre}
                  </h3>
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-brand-sage inline-block" />
                    {proyecto.ubicacion}
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
