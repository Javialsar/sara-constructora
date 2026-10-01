"use client"
import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { HardHat, Phone, Edit, Trash2, X, Plus, Loader2 } from "lucide-react"

export default function MisTrabajadores() {
  const [trabajadores, setTrabajadores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({ id: "", nombre_completo: "", tipo_obrero: "", tarifa_hora: 0, telefono: "" })
  const [isEditing, setIsEditing] = useState(false)

  const supabase = createClient()

  const fetchTrabajadores = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from("trabajadores").select("*").eq("user_id", user.id).order('created_at', { ascending: false })
      if (data) setTrabajadores(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTrabajadores()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (isEditing) {
      const { error } = await supabase.from("trabajadores").update({
        nombre_completo: formData.nombre_completo,
        tipo_obrero: formData.tipo_obrero,
        tarifa_hora: formData.tarifa_hora,
        telefono: formData.telefono
      }).eq("id", formData.id)
      
      if (error) alert("Error: " + error.message)
      else { setIsModalOpen(false); fetchTrabajadores(); }
    } else {
      const { error } = await supabase.from("trabajadores").insert({
        nombre_completo: formData.nombre_completo,
        tipo_obrero: formData.tipo_obrero,
        tarifa_hora: formData.tarifa_hora,
        telefono: formData.telefono,
        user_id: user?.id,
        estado: 'activo'
      })
      
      if (error) alert("Error: " + error.message)
      else { setIsModalOpen(false); fetchTrabajadores(); }
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este obrero?")) {
      await supabase.from("trabajadores").delete().eq("id", id)
      fetchTrabajadores()
    }
  }

  const openEdit = (c: any) => {
    setFormData({ id: c.id, nombre_completo: c.nombre_completo, tipo_obrero: c.tipo_obrero || "", tarifa_hora: c.tarifa_hora || 0, telefono: c.telefono || "" })
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const openCreate = () => {
    setFormData({ id: "", nombre_completo: "", tipo_obrero: "", tarifa_hora: 0, telefono: "" })
    setIsEditing(false)
    setIsModalOpen(true)
  }

  return (
    <div className="p-4 sm:p-8 w-full w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <HardHat className="text-emerald-500" />
            Mano de Obra
          </h1>
          <p className="text-slate-500 mt-1">Gestiona tus maestros de obra, peones y ayudantes.</p>
        </div>
        <button onClick={openCreate} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all">
          <Plus size={20} /> Nuevo Obrero
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
                  <th className="p-4">Obrero</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Tarifa / Hr</th>
                  <th className="p-4">Contacto</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trabajadores.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">No tienes mano de obra registrada.</td></tr>
                ) : trabajadores.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{t.nombre_completo}</td>
                    <td className="p-4 text-sm text-slate-600 capitalize">{t.tipo_obrero}</td>
                    <td className="p-4 font-bold text-emerald-600">${t.tarifa_hora.toFixed(2)}</td>
                    <td className="p-4 text-sm text-slate-600">
                      {t.telefono && <span className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {t.telefono}</span>}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => openEdit(t)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
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
              <h3 className="font-black text-slate-900">{isEditing ? 'Editar Obrero' : 'Nuevo Obrero'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo *</label>
                <input required type="text" value={formData.nombre_completo} onChange={e => setFormData({...formData, nombre_completo: e.target.value})} className="w-full border-slate-300 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Obrero</label>
                  <select value={formData.tipo_obrero} onChange={e => setFormData({...formData, tipo_obrero: e.target.value})} className="w-full border-slate-300 rounded-lg text-sm bg-white">
                    <option value="">Seleccionar...</option>
                    <option value="Maestro">Maestro</option>
                    <option value="Albañil">Albañil</option>
                    <option value="Ayudante">Ayudante</option>
                    <option value="Peón">Peón</option>
                    <option value="Especialista">Especialista</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tarifa por Hora ($)</label>
                  <input required type="number" step="0.01" value={formData.tarifa_hora} onChange={e => setFormData({...formData, tarifa_hora: parseFloat(e.target.value)})} className="w-full border-slate-300 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono</label>
                <input type="text" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className="w-full border-slate-300 rounded-lg text-sm" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Guardando...' : 'Guardar Obrero'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
