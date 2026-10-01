"use client"
import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Users, Mail, Phone, Edit, Trash2, X, Plus, Loader2 } from "lucide-react"

export default function MisClientes() {
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({ id: "", nombre: "", apellido: "", email: "", telefono: "" })
  const [isEditing, setIsEditing] = useState(false)

  const supabase = createClient()

  const fetchClientes = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from("clientes").select("*").eq("user_id", user.id).order('created_at', { ascending: false })
      if (data) setClientes(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (isEditing) {
      const { error } = await supabase.from("clientes").update({
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono
      }).eq("id", formData.id)
      
      if (error) alert("Error: " + error.message)
      else { setIsModalOpen(false); fetchClientes(); }
    } else {
      const { error } = await supabase.from("clientes").insert({
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono,
        user_id: user?.id,
        estado: 'activo'
      })
      
      if (error) alert("Error: " + error.message)
      else { setIsModalOpen(false); fetchClientes(); }
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este cliente?")) {
      await supabase.from("clientes").delete().eq("id", id)
      fetchClientes()
    }
  }

  const openEdit = (c: any) => {
    setFormData({ id: c.id, nombre: c.nombre, apellido: c.apellido || "", email: c.email || "", telefono: c.telefono || "" })
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const openCreate = () => {
    setFormData({ id: "", nombre: "", apellido: "", email: "", telefono: "" })
    setIsEditing(false)
    setIsModalOpen(true)
  }

  return (
    <div className="p-4 sm:p-8 w-full w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="text-emerald-500" />
            Directorio de Clientes
          </h1>
          <p className="text-slate-500 mt-1">Gestiona los clientes para tus presupuestos de APU.</p>
        </div>
        <button onClick={openCreate} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all">
          <Plus size={20} /> Nuevo Cliente
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Contacto</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientes.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-500">No tienes clientes registrados aún.</td></tr>
                ) : clientes.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{c.nombre} {c.apellido}</div>
                      <div className="text-xs text-slate-500 mt-0.5">ID: {c.id.substring(0,8)}...</div>
                    </td>
                    <td className="p-4 space-y-1">
                      {c.email && <div className="flex items-center gap-2 text-sm text-slate-600"><Mail size={14} className="text-slate-400" /> {c.email}</div>}
                      {c.telefono && <div className="flex items-center gap-2 text-sm text-slate-600"><Phone size={14} className="text-slate-400" /> {c.telefono}</div>}
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full capitalize">{c.estado || 'activo'}</span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => openEdit(c)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-black text-slate-900">{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre *</label>
                  <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full border-slate-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Apellido</label>
                  <input type="text" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} className="w-full border-slate-300 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono</label>
                <input type="text" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className="w-full border-slate-300 rounded-lg text-sm" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
