"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useProject } from "@/contexts/ProjectContext"
import { 
  Building2, 
  ChevronDown, 
  Plus, 
  Check, 
  Search, 
  Globe, 
  MapPin, 
  Layers,
  Sparkles
} from "lucide-react"

export default function ProjectSwitcher() {
  const router = useRouter()
  const { 
    projects, 
    activeProject, 
    isGlobalMode, 
    setActiveProject, 
    openCreateModal, 
    isLoading 
  } = useProject()

  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredProjects = projects.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.ubicacion && p.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón Principal del Switcher */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-950/80 hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-all text-xs font-semibold text-gray-800 dark:text-gray-100 shadow-xs max-w-[280px] sm:max-w-[360px]"
        title="Espacio de Trabajo Activo por Obra / Proyecto"
      >
        <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
          {isGlobalMode ? <Globe size={13} /> : <Building2 size={13} />}
        </div>

        <div className="flex-1 text-left truncate">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-gray-400">Obra Activa:</span>
            {!isGlobalMode && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            )}
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="truncate font-bold text-gray-900 dark:text-white">
              {isGlobalMode ? "Todas las Obras (Global)" : activeProject?.nombre || "Seleccionar Obra"}
            </span>
            {!isGlobalMode && activeProject?.regimen === 'publico_sercop' && (
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shrink-0 animate-in fade-in">
                🏛️ SERCOP
              </span>
            )}
          </div>
        </div>

        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Menú Desplegable */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header del Dropdown */}
          <div className="p-3 bg-gray-50 dark:bg-slate-950/80 border-b border-gray-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1.5">
                <Layers size={14} className="text-blue-600" />
                Espacios de Trabajo por Obra
              </span>
              <span className="text-[10px] text-gray-400 font-normal">
                {projects.length} obra{projects.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Buscador */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar obra por nombre o provincia..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          {/* Lista de Proyectos */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
            
            {/* Opción Modo Global */}
            <div
              onClick={() => {
                setActiveProject(null)
                setIsOpen(false)
                router.push('/dashboard/presupuestos_reales')
              }}
              className={`p-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-between text-xs ${
                isGlobalMode 
                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold" 
                  : "hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 shrink-0">
                  <Globe size={15} />
                </div>
                <div>
                  <div className="font-bold">Vista Global (Todas las Obras)</div>
                  <div className="text-[10px] text-gray-400">Ver presupuestos y reportes sin filtrar por proyecto</div>
                </div>
              </div>
              {isGlobalMode && <Check size={16} className="text-blue-600" />}
            </div>

            <div className="h-px bg-gray-100 dark:bg-slate-800 my-1"></div>

            {/* Proyectos del Usuario */}
            {filteredProjects.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-xs">
                No se encontraron obras con ese criterio.
              </div>
            ) : (
              filteredProjects.map(proj => {
                const isSelected = !isGlobalMode && activeProject?.id === proj.id
                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      setActiveProject(proj)
                      setIsOpen(false)
                      router.push('/dashboard/presupuestos_reales')
                    }}
                    className={`p-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-between text-xs ${
                      isSelected 
                        ? "bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-900" 
                        : "hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? (proj.regimen === 'publico_sercop' ? "bg-amber-600 text-white" : "bg-blue-600 text-white")
                          : (proj.regimen === 'publico_sercop' ? "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400" : "bg-gray-100 dark:bg-slate-800 text-gray-500")
                      }`}>
                        <Building2 size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold truncate text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span className="truncate">{proj.nombre}</span>
                          {proj.regimen === 'publico_sercop' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                              🏛️ SERCOP
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <MapPin size={10} className="shrink-0" />
                          <span className="truncate">
                            {proj.codigo_proceso ? `${proj.codigo_proceso} • ` : ''}
                            {proj.ubicacion || proj.provincia || "Ecuador"}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 ml-2">
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Footer: Acción Crear Nueva Obra */}
          <div className="p-2 bg-gray-50 dark:bg-slate-950/80 border-t border-gray-100 dark:border-slate-800">
            <button
              onClick={() => {
                setIsOpen(false)
                openCreateModal()
              }}
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Plus size={14} />
              <span>Registrar Nueva Obra / Proyecto</span>
            </button>
          </div>

        </div>
      )}
    </div>
  )
}
