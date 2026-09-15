"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function ClientesPage() {
  const supabase = createClient()
  const [clientes, setClientes] = useState<any[]>([])
  const [testimonios, setTestimonios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: clientesData } = await supabase
        .from('clientes')
        .select('*')
        .eq('estado', 'activo')
        .order('created_at', { ascending: false })
      
      if (clientesData) setClientes(clientesData)

      const { data: testimoniosData } = await supabase
        .from('testimonios')
        .select(`*, clientes(nombre, apellido), proyectos(nombre)`)
        .eq('estado', 'aprobado')
        .order('created_at', { ascending: false })
        .limit(3)
        
      if (testimoniosData) setTestimonios(testimoniosData)
      setLoading(false)
    }

    loadData()

    // Suscripción en tiempo real a la tabla clientes
    const subscription = supabase
      .channel('clientes-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, () => {
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [supabase])

  return (
    <div className="pt-36 pb-16 min-h-screen">
      <div className="container mx-auto px-4 md:px-8">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-dark tracking-tighter mb-4 uppercase">
            Nuestros Clientes
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-500 font-medium">
            LA CONFIANZA DETRÁS DE CADA PROYECTO.
          </h2>
        </header>

        <section className="mb-24">
          {loading ? (
            <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl">
              Cargando clientes...
            </div>
          ) : clientes.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl">
              No hay clientes públicos para mostrar por el momento.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {clientes.map((c) => (
                <div key={c.id} className="group bg-white border border-gray-100 flex flex-col items-center justify-center transition-all p-6 text-center shadow-sm hover:shadow-xl hover:border-brand-sage/30 rounded-2xl relative overflow-hidden">
                  {/* Cuadrícula suave de fondo */}
                  <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                  
                  <div className="relative z-10 w-24 h-24 md:w-32 md:h-32 mb-4 flex-shrink-0">
                    {c.imagen_url ? (
                      <div className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-105">
                        <img src={c.imagen_url} alt={`${c.nombre} ${c.apellido}`} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm group-hover:bg-brand-sage/10 transition-colors">
                        <span className="text-2xl md:text-3xl font-bold text-gray-300 group-hover:text-brand-sage/50 uppercase tracking-widest">
                          {c.nombre?.charAt(0)}{c.apellido?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="relative z-10 font-bold text-brand-dark uppercase tracking-wide text-sm md:text-base group-hover:text-brand-sage transition-colors">
                    {c.nombre} {c.apellido}
                  </h3>
                  {c.usuario && (
                    <p className="relative z-10 text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mt-1 opacity-60">
                      Cliente Registrado
                    </p>
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
