"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useProject, ProjectItem } from "@/contexts/ProjectContext"
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet, 
  FileCheck, 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  HelpCircle
} from "lucide-react"

type EtapaSercop = 'convocatoria' | 'preguntas' | 'oferta' | 'convalidacion' | 'adjudicado' | 'contrato'

const ETAPAS_CONFIG: Record<string, { label: string; badge: string; color: string; desc: string }> = {
  convocatoria: {
    label: "1. Convocatoria & Pliego",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    color: "border-blue-500",
    desc: "Revisión inicial de pliegos y condiciones específicas"
  },
  preguntas: {
    label: "2. Preguntas & Aclaraciones",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    color: "border-purple-500",
    desc: "Plazo para formular preguntas técnicas en el portal SERCOP"
  },
  oferta: {
    label: "3. Preparación de Oferta APU",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    color: "border-amber-500",
    desc: "Cálculo de costos directos, indirectos, fórmulas y VAE"
  },
  convalidacion: {
    label: "4. Convalidación & Calificación",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    color: "border-orange-500",
    desc: "Subsanación de errores de forma (Art. 23 RGLOSNCP)"
  },
  adjudicado: {
    label: "5. Adjudicado (Ganado)",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    color: "border-emerald-500",
    desc: "Resolución de adjudicación firme emitida por la entidad"
  },
  contrato: {
    label: "6. Contrato & En Ejecución",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-950/70 dark:text-teal-300 border-teal-200 dark:border-teal-800",
    color: "border-teal-500",
    desc: "Garantías rendidas y suscripción de contrato"
  }
}

export default function ProyectosSERCOPPage() {
  const router = useRouter()
  const { 
    projects, 
    activeProject, 
    setActiveProject, 
    openCreateModal 
  } = useProject()

  const [etapaFiltro, setEtapaFiltro] = useState<string>("todas")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [etapasLocales, setEtapasLocales] = useState<Record<string, EtapaSercop>>({})

  // Filtrar solo proyectos SERCOP o con etiquetas de compras públicas
  const proyectosSercop = useMemo(() => {
    return projects.filter(p => {
      const isSercop = p.regimen === 'publico_sercop' ||
                       p.codigo_proceso ||
                       p.nombre?.toLowerCase().includes("sercop") ||
                       p.nombre?.includes("MCO-") ||
                       p.nombre?.includes("SIE-") ||
                       p.nombre?.includes("LICO-") ||
                       p.nombre?.includes("COT-") ||
                       p.descripcion?.includes("[SERCOP:")
      return isSercop
    })
  }, [projects])

  // Obtener etapa actual de un proyecto
  const getEtapa = (proj: ProjectItem): EtapaSercop => {
    if (etapasLocales[proj.id]) return etapasLocales[proj.id]
    if (proj.etapa_sercop) return proj.etapa_sercop
    if (proj.estado === 'adjudicado') return 'adjudicado'
    if (proj.estado === 'contrato') return 'contrato'
    return 'oferta'
  }

  // Filtrado final
  const filteredProyectos = useMemo(() => {
    return proyectosSercop.filter(p => {
      const et = getEtapa(p)
      if (etapaFiltro !== "todas" && et !== etapaFiltro) return false
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const match = p.nombre.toLowerCase().includes(q) ||
                      (p.codigo_proceso && p.codigo_proceso.toLowerCase().includes(q)) ||
                      (p.entidad_contratante && p.entidad_contratante.toLowerCase().includes(q)) ||
                      (p.ubicacion && p.ubicacion.toLowerCase().includes(q))
        if (!match) return false
      }
      return true
    })
  }, [proyectosSercop, etapaFiltro, searchTerm, etapasLocales])

  // Cambiar etapa localmente
  const handleChangeEtapa = (projectId: string, nuevaEtapa: EtapaSercop) => {
    setEtapasLocales(prev => ({
      ...prev,
      [projectId]: nuevaEtapa
    }))
  }

  // Activar obra y navegar a presupuesto
  const handleIrAPresupuesto = (proj: ProjectItem) => {
    setActiveProject(proj)
    router.push('/dashboard/presupuestos_reales')
  }

  // Activar obra y navegar a VAE
  const handleIrAVAE = (proj: ProjectItem) => {
    setActiveProject(proj)
    router.push('/dashboard/sercop/vae')
  }

  // Activar obra y consultar al Agente SERCOP
  const handleConsultarAgente = (proj: ProjectItem) => {
    setActiveProject(proj)
    router.push('/dashboard/sercop/agente')
  }

  // Métricas
  const totalMontoReferencial = useMemo(() => {
    return proyectosSercop.reduce((acc, p) => acc + (p.presupuesto_referencial || 180000), 0)
  }, [proyectosSercop])

  const adjudicadosCount = useMemo(() => {
    return proyectosSercop.filter(p => getEtapa(p) === 'adjudicado' || getEtapa(p) === 'contrato').length
  }, [proyectosSercop, etapasLocales])

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-amber-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
              <span>🏛️ Módulo de Contratación Pública</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Mis Proyectos de Contratación Pública (SERCOP)
            </h1>
            <p className="text-sm text-amber-100/80 max-w-2xl leading-relaxed">
              Monitorea el ciclo de vida de tus licitaciones estatales en curso: desde la formulación de preguntas y APUs hasta la convalidación de errores y firma de contrato.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => router.push('/dashboard/sercop/radar')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/10 backdrop-blur-sm transition-all"
            >
              <Search size={15} />
              <span>Explorar Radar SERCOP</span>
            </button>
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-600/30 transition-all"
            >
              <Plus size={15} />
              <span>Registrar Proyecto SERCOP</span>
            </button>
          </div>
        </div>

        {/* Resumen de Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <div className="text-gray-400 text-[11px]">Proyectos Registrados</div>
            <div className="text-lg font-black text-white mt-0.5">{proyectosSercop.length}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <div className="text-gray-400 text-[11px]">Volumen Total Licitado</div>
            <div className="text-lg font-black text-amber-300 mt-0.5">
              ${(totalMontoReferencial / 1000).toLocaleString('es-EC', { maximumFractionDigits: 1 })}k
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <div className="text-gray-400 text-[11px]">Adjudicados / Ganados</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{adjudicadosCount} obras</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <div className="text-gray-400 text-[11px]">Tasa de Éxito Estimada</div>
            <div className="text-lg font-black text-blue-300 mt-0.5">
              {proyectosSercop.length > 0 ? Math.round((adjudicadosCount / proyectosSercop.length) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Filtros por Etapa de Licitación */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Barra de Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por código de proceso, nombre de obra o entidad..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium text-gray-800 dark:text-gray-200"
            />
          </div>

          {/* Filtro de Etapas */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setEtapaFiltro("todas")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                etapaFiltro === "todas"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              Todas ({proyectosSercop.length})
            </button>
            {Object.entries(ETAPAS_CONFIG).map(([key, cfg]) => {
              const count = proyectosSercop.filter(p => getEtapa(p) === key).length
              return (
                <button
                  key={key}
                  onClick={() => setEtapaFiltro(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    etapaFiltro === key
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {cfg.label.split(".")[1]?.trim() || cfg.label} ({count})
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Lista de Proyectos SERCOP */}
      {filteredProyectos.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Building2 size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
              No tienes proyectos SERCOP en esta etapa
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Puedes postular a una licitación desde el Radar Nacional SERCOP o registrar tu contrato público de forma manual.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => router.push('/dashboard/sercop/radar')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs"
            >
              <Search size={14} />
              <span>Explorar Radar SERCOP</span>
            </button>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <Plus size={14} />
              <span>Registrar Manualmente</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProyectos.map(proj => {
            const etapaActual = getEtapa(proj)
            const etapaCfg = ETAPAS_CONFIG[etapaActual] || ETAPAS_CONFIG.oferta
            const isActive = activeProject?.id === proj.id

            return (
              <div
                key={proj.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border transition-all shadow-xs hover:shadow-md space-y-4 ${
                  isActive
                    ? "border-amber-500 ring-2 ring-amber-500/20"
                    : "border-gray-200 dark:border-slate-800"
                }`}
              >
                {/* Cabecera del Proyecto */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        {proj.codigo_proceso || "PROCESO-SERCOP-EC"}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${etapaCfg.badge}`}>
                        {etapaCfg.label}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 size={11} />
                          <span>Obra Activa en Suite</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                      {proj.nombre}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1 font-medium">
                        <Building2 size={13} className="text-amber-600" />
                        <span>{proj.entidad_contratante || "Entidad Pública del Estado"}</span>
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin size={13} className="text-emerald-600" />
                        <span>{proj.ubicacion || proj.provincia || "Ecuador"}</span>
                      </span>
                      {proj.presupuesto_referencial && (
                        <span className="flex items-center gap-1 font-bold text-gray-900 dark:text-gray-100">
                          <DollarSign size={13} className="text-emerald-500" />
                          <span>${proj.presupuesto_referencial.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Selector rápido de Etapa */}
                  <div className="shrink-0 flex items-center gap-2 bg-gray-50 dark:bg-slate-950 p-2 rounded-2xl border border-gray-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">
                      Fase SERCOP:
                    </span>
                    <select
                      value={etapaActual}
                      onChange={e => handleChangeEtapa(proj.id, e.target.value as EtapaSercop)}
                      className="bg-white dark:bg-slate-900 text-xs font-bold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      {Object.entries(ETAPAS_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pipeline visual de progreso */}
                <div className="pt-2">
                  <div className="grid grid-cols-6 gap-1.5 text-center text-[10px] font-semibold text-gray-400">
                    {Object.entries(ETAPAS_CONFIG).map(([k, cfg], index) => {
                      const stages = Object.keys(ETAPAS_CONFIG)
                      const currentIndex = stages.indexOf(etapaActual)
                      const isPassed = index <= currentIndex
                      const isCurrent = index === currentIndex

                      return (
                        <div key={k} className="space-y-1">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              isCurrent
                                ? "bg-amber-500 ring-2 ring-amber-400/30"
                                : isPassed
                                ? "bg-emerald-500"
                                : "bg-gray-100 dark:bg-slate-800"
                            }`}
                          />
                          <span className={`block truncate ${isCurrent ? "font-bold text-amber-600 dark:text-amber-400" : isPassed ? "text-gray-700 dark:text-gray-300" : "opacity-40"}`}>
                            {cfg.label.split(".")[1]?.trim()}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Barra de Acciones del Proyecto */}
                <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                    <Clock size={12} />
                    <span>Última actualización: {new Date(proj.created_at || Date.now()).toLocaleDateString('es-EC')}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Botón Presupuesto APU */}
                    <button
                      onClick={() => handleIrAPresupuesto(proj)}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 border border-blue-200 dark:border-blue-900/60 transition-colors"
                      title="Abrir Presupuesto y Análisis de Precios Unitarios"
                    >
                      <FileSpreadsheet size={14} />
                      <span>Presupuesto & APU</span>
                    </button>

                    {/* Botón Matriz VAE */}
                    <button
                      onClick={() => handleIrAVAE(proj)}
                      className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5 border border-purple-200 dark:border-purple-900/60 transition-colors"
                      title="Matriz de Valor Agregado Ecuatoriano"
                    >
                      <FileCheck size={14} />
                      <span>Matriz VAE</span>
                    </button>

                    {/* Botón Asesor Agente SERCOP */}
                    <button
                      onClick={() => handleConsultarAgente(proj)}
                      className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-200 dark:border-amber-900/60 transition-colors"
                      title="Auditor Normativo SARA-SERCOP"
                    >
                      <ShieldCheck size={14} />
                      <span>Auditor Normativo</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
