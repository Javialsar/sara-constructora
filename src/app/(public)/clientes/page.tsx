"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [testimonios, setTestimonios] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      // 1. Cargar Clientes (solo los aprobados/activos si tienen estado, sino todos)
      const { data: clientesData } = await supabase
        .from('clientes')
        .select('*')
        .eq('estado', 'activo')
        .order('created_at', { ascending: false })
      
      if (clientesData) setClientes(clientesData)

      // Si no usas 'estado' en clientes, puedes quitar ese .eq() 
      // y si los testimonios tienen estado 'aprobado' sí usalo ahí:
      const { data: testimoniosData } = await supabase
        .from('testimonios')
        .select(`*, clientes(nombre, apellido), proyectos(nombre)`)
        .eq('estado', 'aprobado')
        .order('created_at', { ascending: false })
        .limit(3)
        
      if (testimoniosData) setTestimonios(testimoniosData)
    }

    loadData()
  }, [])

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container mx-auto px-4 md:px-8">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-brand-dark tracking-tight mb-4 uppercase">
            Nuestros Clientes
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-500 font-medium">
            LA CONFIANZA DETRÁS DE CADA PROYECTO.
          </h2>
        </header>

        <section className="mb-24">
          {clientes.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl">
              Cargando clientes...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {clientes.map((c) => (
                <div key={c.id} className="aspect-video bg-white border border-gray-100 flex flex-col items-center justify-center grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100 p-4 text-center overflow-hidden relative shadow-sm">
                  {c.imagen_url ? (
                    <img src={c.imagen_url} alt={`${c.nombre} ${c.apellido}`} className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="font-bold text-gray-400 text-sm md:text-base uppercase tracking-wider">
                      {c.nombre} {c.apellido}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-brand-dark text-white py-16 -mx-4 md:-mx-8 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
             <header className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 uppercase text-brand-sage">
                Testimonios
              </h2>
              <p className="text-gray-300">Lo que nuestros clientes dicen de nosotros.</p>
            </header>

            {testimonios.length === 0 ? (
              <div className="text-center text-gray-400 italic">
                No hay testimonios públicos disponibles por el momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonios.map((t) => (
                  <div key={t.id} className="bg-white/5 border border-white/10 p-6 relative flex flex-col h-full">
                    <div className="text-brand-sage text-4xl font-serif absolute top-4 right-4 opacity-50">"</div>
                    <p className="text-gray-300 italic mb-6 relative z-10 text-sm leading-relaxed flex-1">
                      "{t.comentario}"
                    </p>
                    <div className="flex items-center gap-4 mt-auto">
                      <div className="w-10 h-10 bg-brand-sage/20 rounded-full flex items-center justify-center text-brand-sage font-bold">
                        {t.clientes?.nombre?.charAt(0)}{t.clientes?.apellido?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{t.clientes?.nombre} {t.clientes?.apellido}</h4>
                        <p className="text-xs text-gray-400 truncate max-w-[150px]">{t.proyectos?.nombre || 'Proyecto SARA'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
