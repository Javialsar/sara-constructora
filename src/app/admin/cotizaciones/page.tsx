"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Calculator, Mail, Phone, Calendar, DollarSign, CheckCircle2, Clock, Ban } from "lucide-react"

export default function AdminCotizaciones() {
  const supabase = createClient()
  const [cotizaciones, setCotizaciones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("cotizaciones")
      .select("*")
      .order('created_at', { ascending: false })
      
    if (data) setCotizaciones(data)
    setLoading(false)
  }

  const updateEstado = async (id: string, nuevoEstado: string) => {
    // Optimistic update
    setCotizaciones(cotizaciones.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c))

    const { error } = await supabase
      .from("cotizaciones")
      .update({ estado: nuevoEstado })
      .eq("id", id)

    if (error) {
      alert("Error al actualizar el estado: " + error.message)
      fetchData() // revert
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'aprobada': return 'bg-green-100 text-green-800 border-green-200'
      case 'cotizada': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'rechazada': return 'bg-red-100 text-red-800 border-red-200'
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bandeja de Cotizaciones</h2>
          <p className="text-gray-500 text-sm mt-1">Revisa los prospectos y solicitudes de presupuesto que llegan desde tu sitio web.</p>
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
                  <th className="px-6 py-4 font-bold">Cliente / Contacto</th>
                  <th className="px-6 py-4 font-bold">Proyecto Solicitado</th>
                  <th className="px-6 py-4 font-bold">Detalles / Presupuesto</th>
                  <th className="px-6 py-4 font-bold">Estado</th>
                  <th className="px-6 py-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cotizaciones.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      <Calculator size={48} className="mx-auto mb-3 opacity-20" />
                      <p>No hay cotizaciones pendientes.</p>
                    </td>
                  </tr>
                ) : (
                  cotizaciones.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 mb-1">{c.nombre}</p>
                        <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                          <Mail size={12} className="text-brand-sage" />
                          <a href={`mailto:${c.email}`} className="hover:text-brand-dark">{c.email}</a>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-xs">
                          <Phone size={12} className="text-brand-sage" />
                          <a href={`tel:${c.telefono}`} className="hover:text-brand-dark">{c.telefono}</a>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold uppercase mb-1">
                          {c.tipo_proyecto}
                        </span>
                        <div className="flex items-center gap-1 text-gray-400 text-[10px] mt-2">
                          <Calendar size={10} />
                          {new Date(c.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600 italic line-clamp-2 text-xs mb-2">"{c.descripcion}"</p>
                        {c.presupuesto_estimado && (
                          <div className="flex items-center gap-1 text-brand-dark font-bold text-xs">
                            <DollarSign size={12} className="text-brand-sage" />
                            {c.presupuesto_estimado}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(c.estado)}`}>
                          {c.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <button 
                          onClick={() => updateEstado(c.id, 'cotizada')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Marcar como Cotizada (ya se envió precio)"
                        >
                          <Calculator size={18} />
                        </button>
                        <button 
                          onClick={() => updateEstado(c.id, 'aprobada')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Marcar como Aprobada (se cerró el trato)"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button 
                          onClick={() => updateEstado(c.id, 'rechazada')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Marcar como Rechazada"
                        >
                          <Ban size={18} />
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
