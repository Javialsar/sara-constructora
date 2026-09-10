"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Users, Mail, Phone, ShieldCheck, ShieldAlert, MoreVertical } from "lucide-react"

export default function AdminClientes() {
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order('created_at', { ascending: false })
      
    if (data) setClientes(data)
    setLoading(false)
  }

  const toggleEstado = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo'
    
    // Optimistic update
    setClientes(clientes.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c))

    const { error } = await supabase
      .from("clientes")
      .update({ estado: nuevoEstado })
      .eq("id", id)

    if (error) {
      alert("Error al actualizar el estado: " + error.message)
      fetchData() // revert on error
    }
  }

  const getStatusStyle = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactivo': return 'bg-red-100 text-red-800 border-red-200'
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Directorio de Clientes</h2>
          <p className="text-gray-500 text-sm mt-1">Administra los usuarios registrados en el portal privado.</p>
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
                  <th className="px-6 py-4 font-bold">Cliente</th>
                  <th className="px-6 py-4 font-bold">Contacto</th>
                  <th className="px-6 py-4 font-bold">Fecha de Registro</th>
                  <th className="px-6 py-4 font-bold">Estado</th>
                  <th className="px-6 py-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clientes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      <Users size={48} className="mx-auto mb-3 opacity-20" />
                      <p>No hay clientes registrados aún.</p>
                    </td>
                  </tr>
                ) : (
                  clientes.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-sage flex items-center justify-center font-bold text-brand-dark shrink-0">
                            {c.nombre.charAt(0)}{c.apellido.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{c.nombre} {c.apellido}</p>
                            <p className="text-xs text-gray-400">Usuario: {c.usuario}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={14} className="text-brand-sage" />
                          <a href={`mailto:${c.email}`} className="hover:text-brand-dark">{c.email}</a>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={14} className="text-brand-sage" />
                          <a href={`tel:${c.telefono}`} className="hover:text-brand-dark">{c.telefono}</a>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-500">
                        {new Date(c.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleEstado(c.id, c.estado)}
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors hover:opacity-80 ${getStatusStyle(c.estado)}`}
                          title="Clic para cambiar estado"
                        >
                          {c.estado}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {/* Botón de acciones adicionales (placeholder) */}
                        <button className="p-2 text-gray-400 hover:text-brand-dark rounded-lg transition-colors">
                          <MoreVertical size={18} />
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
