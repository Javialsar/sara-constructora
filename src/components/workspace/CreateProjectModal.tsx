"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useProject } from "@/contexts/ProjectContext"
import { Building2, X, Plus, MapPin, Loader2, Sparkles } from "lucide-react"

const PROVINCIAS_ECUADOR = [
  "Loja", "Azuay", "Pichincha", "Guayas", "El Oro", "Manabí", "Tungurahua", 
  "Chimborazo", "Imbabura", "Santo Domingo", "Zamora Chinchipe", "Cañar", 
  "Cotopaxi", "Esmeraldas", "Los Ríos", "Carchi", "Bolívar", "Pastaza", 
  "Morona Santiago", "Napo", "Sucumbíos", "Orellana", "Santa Elena", "Galápagos"
]

export default function CreateProjectModal() {
  const router = useRouter()
  const { isCreateModalOpen, closeCreateModal, createProject } = useProject()
  
  const [nombre, setNombre] = useState("")
  const [ubicacion, setUbicacion] = useState("")
  const [provincia, setProvincia] = useState("Loja")
  const [descripcion, setDescripcion] = useState("")
  const [regimen, setRegimen] = useState<'particular' | 'privado' | 'publico_sercop'>('particular')
  const [codigoProceso, setCodigoProceso] = useState("")
  const [entidadContratante, setEntidadContratante] = useState("")
  const [presupuestoReferencial, setPresupuestoReferencial] = useState("")
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
        descripcion: descripcion.trim(),
        regimen,
        codigo_proceso: regimen === 'publico_sercop' ? codigoProceso.trim() : undefined,
        entidad_contratante: regimen === 'publico_sercop' ? entidadContratante.trim() : undefined,
        presupuesto_referencial: regimen === 'publico_sercop' && presupuestoReferencial ? parseFloat(presupuestoReferencial) : undefined,
        etapa_sercop: regimen === 'publico_sercop' ? 'oferta' : undefined
      })

      if (res) {
        setNombre("")
        setUbicacion("")
        setDescripcion("")
        setCodigoProceso("")
        setEntidadContratante("")
        setPresupuestoReferencial("")
        if (regimen === 'publico_sercop') {
          router.push('/dashboard/sercop/proyectos')
        } else {
          router.push('/dashboard/presupuestos_reales')
        }
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 max-w-lg w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
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
          {/* Selector de Régimen de la Obra */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
              Régimen de la Obra *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRegimen('particular')}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  regimen === 'particular'
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20"
                    : "border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <span>🟢 Particular</span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                  Residencial, villas, clientes finales
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRegimen('privado')}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  regimen === 'privado'
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20"
                    : "border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <span>🔵 Privado</span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                  Inmobiliarias, locales, corporativo
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRegimen('publico_sercop')}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  regimen === 'publico_sercop'
                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20"
                    : "border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <span>🏛️ SERCOP</span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                  GADs, Ministerios, Licitaciones
                </p>
              </button>
            </div>
          </div>

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
              placeholder={regimen === 'publico_sercop' ? "Ej: 'Regeneración Urbana Punzara Alto - Fase 1'" : "Ej: 'Edificio Residencial Punzara Alto'"}
              className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-gray-100 font-medium outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Campos especiales si es Público SERCOP */}
          {regimen === 'publico_sercop' && (
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                <Sparkles size={14} className="text-amber-600" />
                <span>Datos Oficiales del Proceso SERCOP</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-amber-900 dark:text-amber-200 mb-1 uppercase">
                    Código de Proceso
                  </label>
                  <input
                    type="text"
                    value={codigoProceso}
                    onChange={e => setCodigoProceso(e.target.value)}
                    placeholder="Ej: MCO-GADML-012-2026"
                    className="w-full bg-white dark:bg-slate-900 border border-amber-300/80 dark:border-amber-800/60 rounded-xl px-3 py-2 text-xs font-mono font-medium outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-amber-900 dark:text-amber-200 mb-1 uppercase">
                    Presupuesto Referencial ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={presupuestoReferencial}
                    onChange={e => setPresupuestoReferencial(e.target.value)}
                    placeholder="Ej: 184520.45"
                    className="w-full bg-white dark:bg-slate-900 border border-amber-300/80 dark:border-amber-800/60 rounded-xl px-3 py-2 text-xs font-mono font-medium outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-amber-900 dark:text-amber-200 mb-1 uppercase">
                  Entidad Contratante
                </label>
                <input
                  type="text"
                  value={entidadContratante}
                  onChange={e => setEntidadContratante(e.target.value)}
                  placeholder="Ej: GAD Municipal del Cantón Loja"
                  className="w-full bg-white dark:bg-slate-900 border border-amber-300/80 dark:border-amber-800/60 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

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
