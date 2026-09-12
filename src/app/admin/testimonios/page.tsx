"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Star, MessageSquareQuote, CheckCircle, XCircle, Trash2 } from "lucide-react"

export default function AdminTestimonios() {
  const supabase = createClient()
  const [testimonios, setTestimonios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("testimonios")
      .select(`*, clientes (nombre, apellido), proyectos (nombre)`)
      .order('created_at', { ascending: false })
      
    if (data) setTestimonios(data)
    setLoading(false)
  }

  const updateEstado = async (id: string, nuevoEstado: string) => {
    // Optimistic update
    setTestimonios(testimonios.map(t => t.id === id ? { ...t, estado: nuevoEstado } : t))

    const { error } = await supabase
      .from("testimonios")
      .update({ estado: nuevoEstado })
      .eq("id", id)

    if (error) {
      alert("Error al actualizar: " + error.message)
      fetchData() // revert on error
    }
  }

  const eliminarTestimonio = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este testimonio permanentemente?")) return;

    setTestimonios(testimonios.filter(t => t.id !== id))
    const { error } = await supabase.from("testimonios").delete().eq("id", id)
    if (error) {
      alert("Error al eliminar: " + error.message)
      fetchData()
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'aprobado': return 'bg-green-100 text-green-800 border-green-200'
      case 'rechazado': return 'bg-red-100 text-red-800 border-red-200'
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={16} 
            className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Aprobación de Testimonios</h2>
          <p className="text-gray-500 text-sm mt-1">Revisa las reseñas de tus clientes y decide cuáles publicar en la web.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-dark"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold">Cliente / Proyecto</th>
                  <th className="px-6 py-4 font-bold">Calificación</th>
                  <th className="px-6 py-4 font-bold w-1/3">Comentario</th>
                  <th className="px-6 py-4 font-bold">Estado</th>
                  <th className="px-6 py-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {testimonios.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      <MessageSquareQuote size={48} className="mx-auto mb-3 opacity-20" />
                      <p>Aún no has recibido testimonios ni calificaciones.</p>
                    </td>
                  </tr>
                ) : (
                  testimonios.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{t.clientes?.nombre} {t.clientes?.apellido}</p>
                        <p className="text-xs text-gray-400">{t.proyectos?.nombre || 'General'}</p>
                        <p className="text-[10px] text-gray-300 mt-1">
                          {new Date(t.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {renderStars(t.calificacion)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600 italic line-clamp-3">"{t.comentario}"</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(t.estado)}`}>
                          {t.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        {t.estado !== 'aprobado' && (
                          <button 
                            onClick={() => updateEstado(t.id, 'aprobado')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Aprobar y publicar"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {t.estado !== 'rechazado' && (
                          <button 
                            onClick={() => updateEstado(t.id, 'rechazado')}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Ocultar/Rechazar"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => eliminarTestimonio(t.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
