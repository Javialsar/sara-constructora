"use client"

import React, { useState } from "react"
import { useProject } from "@/contexts/ProjectContext"
import { Building2, X, Plus, MapPin, Loader2, Sparkles } from "lucide-react"

const PROVINCIAS_ECUADOR = [
  "Loja", "Azuay", "Pichincha", "Guayas", "El Oro", "Manabí", "Tungurahua", 
  "Chimborazo", "Imbabura", "Santo Domingo", "Zamora Chinchipe", "Cañar", 
  "Cotopaxi", "Esmeraldas", "Los Ríos", "Carchi", "Bolívar", "Pastaza", 
  "Morona Santiago", "Napo", "Sucumbíos", "Orellana", "Santa Elena", "Galápagos"
]

export default function CreateProjectModal() {
  const { isCreateModalOpen, closeCreateModal, createProject } = useProject()
  
  const [nombre, setNombre] = useState("")
  const [ubicacion, setUbicacion] = useState("")
  const [provincia, setProvincia] = useState("Loja")
  const [descripcion, setDescripcion] = useState("")
  const [guardando, setGuardando] = useState(false)

  if (!isCreateModalOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return
    setGuardando(true)

    try {
      const res = await createProject({
        nombre: nombre.trim(),
        ubicacion: ubicacion.trim() || `${provincia}, Ecuador`,
        provincia,
        descripcion: descripcion.trim()
      })

      if (res) {
        setNombre("")
        setUbicacion("")
        setDescripcion("")
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 max-w-md w-full shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Registrar Nueva Obra</h3>
              <p className="text-[11px] text-gray-400">Crea un espacio de trabajo aislado para tu proyecto</p>
            </div>
          </div>
          <button 
            onClick={closeCreateModal} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
              Nombre de la Obra o Contrato *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: 'Edificio Residencial Punzara Alto'"
              className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-gray-100 font-medium outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                Provincia *
              </label>
              <select
                value={provincia}
                onChange={e => setProvincia(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-100 font-medium outline-none focus:ring-2 focus:ring-blue-600"
              >
                {PROVINCIAS_ECUADOR.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                Cantón / Sector
              </label>
              <input
                type="text"
                value={ubicacion}
                onChange={e => setUbicacion(e.target.value)}
                placeholder="Ej: Loja / San Sebastián"
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-gray-100 font-medium outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
              Descripción o Alcance (Opcional)
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Ej: Obra civil de 4 plantas con estructura de hormigón armado y acabados de primera..."
              className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeCreateModal}
              disabled={guardando}
              className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || !nombre.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              {guardando ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Creando Espacio de Trabajo...</span>
                </>
              ) : (
                <>
                  <Plus size={15} />
                  <span>Crear Obra & Activar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
