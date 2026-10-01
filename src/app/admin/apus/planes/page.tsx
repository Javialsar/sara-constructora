"use client"

import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Edit, Trash2, CheckCircle, XCircle, Save, X, Loader2 } from "lucide-react"

export default function AdminPlanesPage() {
  const [planes, setPlanes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchPlanes()
  }, [])

  const fetchPlanes = async () => {
    setLoading(true)
    const { data } = await supabase.from('planes_suscripcion').select('*').order('orden', { ascending: true })
    if (data) setPlanes(data)
    setLoading(false)
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPlan) return

    if (editingPlan.id) {
      // Actualizar
      await supabase.from('planes_suscripcion').update(editingPlan).eq('id', editingPlan.id)
    } else {
      // Crear
      await supabase.from('planes_suscripcion').insert(editingPlan)
    }
    
    setEditingPlan(null)
    fetchPlanes()
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este plan?")) {
      await supabase.from('planes_suscripcion').delete().eq('id', id)
      fetchPlanes()
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Planes de Suscripción</h1>
          <p className="text-slate-500 text-sm">Gestiona los precios y beneficios de tu modelo SaaS.</p>
        </div>
        <button 
          onClick={() => setEditingPlan({ nombre: '', descripcion: '', precio: 0, beneficios: [], es_recomendado: false, activo: true, orden: planes.length + 1 })}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
        >
          <Plus size={18} /> Nuevo Plan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {planes.map((plan) => (
            <div key={plan.id} className={`bg-white border rounded-xl p-6 shadow-sm relative ${plan.es_recomendado ? 'border-blue-500' : 'border-slate-200'}`}>
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => setEditingPlan(plan)} className="text-slate-400 hover:text-blue-500 transition-colors"><Edit size={18} /></button>
                <button onClick={() => handleDelete(plan.id)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-slate-800">{plan.nombre}</h3>
                {plan.activo ? <CheckCircle size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-slate-300" />}
                {plan.es_recomendado && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">Recomendado</span>}
              </div>
              
              <div className="text-3xl font-black text-slate-900 mb-4">${plan.precio} <span className="text-sm font-medium text-slate-500">/{plan.frecuencia}</span></div>
              <p className="text-slate-500 text-sm mb-4">{plan.descripcion}</p>
              
              <ul className="space-y-2">
                {(plan.beneficios || []).map((ben: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-600">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" /> {ben}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edición */}
      {editingPlan && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">{editingPlan.id ? 'Editar Plan' : 'Nuevo Plan'}</h2>
              <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleGuardar} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Plan</label>
                  <input type="text" required value={editingPlan.nombre} onChange={(e) => setEditingPlan({...editingPlan, nombre: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Precio ($)</label>
                  <input type="number" step="0.01" required value={editingPlan.precio} onChange={(e) => setEditingPlan({...editingPlan, precio: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Frecuencia</label>
                  <select value={editingPlan.frecuencia} onChange={(e) => setEditingPlan({...editingPlan, frecuencia: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                    <option value="mes">Mensual</option>
                    <option value="año">Anual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción corta</label>
                <input type="text" value={editingPlan.descripcion || ''} onChange={(e) => setEditingPlan({...editingPlan, descripcion: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Beneficios (Uno por línea)</label>
                <textarea 
                  rows={4} 
                  value={(editingPlan.beneficios || []).join('\n')} 
                  onChange={(e) => setEditingPlan({...editingPlan, beneficios: e.target.value.split('\n').filter(b=>b.trim()!=='')})} 
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Acceso total&#10;Soporte 24/7"
                />
              </div>

              <div className="flex gap-4 border-t pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editingPlan.es_recomendado} onChange={(e) => setEditingPlan({...editingPlan, es_recomendado: e.target.checked})} className="rounded text-blue-600" />
                  <span className="text-sm text-slate-700">Etiqueta "Recomendado"</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editingPlan.activo} onChange={(e) => setEditingPlan({...editingPlan, activo: e.target.checked})} className="rounded text-emerald-600" />
                  <span className="text-sm text-slate-700">Plan Activo</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setEditingPlan(null)} className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"><Save size={18} /> Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
