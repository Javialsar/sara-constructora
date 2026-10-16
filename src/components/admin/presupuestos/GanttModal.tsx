import React, { useState, useMemo, useEffect } from "react"
import { 
  Calendar, 
  X, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  Download, 
  Flame, 
  CheckCircle2, 
  Play, 
  Layers, 
  RefreshCw,
  Sliders,
  DollarSign
} from "lucide-react"
import { Gantt, Task, ViewMode } from "gantt-task-react"
import "gantt-task-react/dist/index.css"
import * as XLSX from "xlsx"

interface GanttModalProps {
  isOpen: boolean
  onClose: () => void
  presupuestoRubros: any[]
  updateTaskSchedule: (id: string, fieldOrUpdates: any, value?: any) => Promise<void>
  nombreProyecto?: string
  granTotal?: number
  onBatchScheduleUpdate?: (updates: any[]) => Promise<void>
}

// Clasificación heurística de capítulos de obra en secuencia constructiva para Ecuador
const FASES_CONSTRUCTIVAS: { [key: string]: { peso: number; orden: number; paralela: boolean; rendDefault: number } } = {
  // Fase 0: Preliminares y Consultoría
  estudios: { peso: 1, orden: 1, paralela: false, rendDefault: 12 },
  diseño: { peso: 1, orden: 1, paralela: false, rendDefault: 12 },
  tramites: { peso: 1, orden: 1, paralela: false, rendDefault: 10 },
  preliminares: { peso: 2, orden: 2, paralela: false, rendDefault: 5 },
  desbroce: { peso: 2, orden: 2, paralela: false, rendDefault: 4 },
  replanteo: { peso: 2, orden: 2, paralela: false, rendDefault: 3 },
  cerramiento: { peso: 2, orden: 2, paralela: true, rendDefault: 4 },

  // Fase 1: Movimiento de Tierras y Cimentación
  excavacion: { peso: 3, orden: 3, paralela: false, rendDefault: 30 }, // m3/dia
  desalojo: { peso: 3, orden: 3, paralela: true, rendDefault: 35 },
  replantillo: { peso: 4, orden: 4, paralela: false, rendDefault: 15 },
  plintos: { peso: 5, orden: 5, paralela: false, rendDefault: 10 },
  cimentacion: { peso: 5, orden: 5, paralela: false, rendDefault: 8 },

  // Fase 2: Estructura y Losas (Norma NEC-15)
  columnas: { peso: 6, orden: 6, paralela: false, rendDefault: 8 },
  vigas: { peso: 6, orden: 6, paralela: false, rendDefault: 8 },
  muros: { peso: 6, orden: 6, paralela: false, rendDefault: 10 },
  losa: { peso: 7, orden: 7, paralela: false, rendDefault: 14 },
  cubierta: { peso: 8, orden: 8, paralela: false, rendDefault: 10 },

  // Fase 3: Mamposterías e Instalaciones Embutidas
  mamposteria: { peso: 9, orden: 9, paralela: false, rendDefault: 18 },
  paredes: { peso: 9, orden: 9, paralela: false, rendDefault: 18 },
  hidrosanitaria: { peso: 10, orden: 10, paralela: true, rendDefault: 10 },
  electrica: { peso: 10, orden: 10, paralela: true, rendDefault: 10 },
  tuberias: { peso: 10, orden: 10, paralela: true, rendDefault: 12 },

  // Fase 4: Enlucidos y Revestimientos
  enlucido: { peso: 11, orden: 11, paralela: false, rendDefault: 22 },
  masillado: { peso: 11, orden: 11, paralela: false, rendDefault: 20 },
  contrapiso: { peso: 11, orden: 11, paralela: false, rendDefault: 25 },
  impermeabilizacion: { peso: 12, orden: 12, paralela: false, rendDefault: 20 },
  porcelanato: { peso: 13, orden: 13, paralela: false, rendDefault: 16 },
  ceramica: { peso: 13, orden: 13, paralela: false, rendDefault: 16 },
  pisos: { peso: 13, orden: 13, paralela: false, rendDefault: 16 },

  // Fase 5: Acabados, Pintura y Wellness
  pintura: { peso: 14, orden: 14, paralela: false, rendDefault: 40 },
  ventanas: { peso: 15, orden: 15, paralela: true, rendDefault: 6 },
  puertas: { peso: 15, orden: 15, paralela: true, rendDefault: 6 },
  aluminio: { peso: 15, orden: 15, paralela: true, rendDefault: 8 },
  muebles: { peso: 15, orden: 15, paralela: true, rendDefault: 8 },
  bbq: { peso: 16, orden: 16, paralela: true, rendDefault: 10 },
  jacuzzi: { peso: 16, orden: 16, paralela: true, rendDefault: 10 },
  jardineria: { peso: 16, orden: 16, paralela: true, rendDefault: 8 },

  // Fase 6: Cierre y Entrega
  limpieza: { peso: 17, orden: 17, paralela: false, rendDefault: 3 },
  entrega: { peso: 17, orden: 17, paralela: false, rendDefault: 2 },
}

// Heurística de detección de fase
function clasificarFase(nombreRubro: string, capitulo?: string): { fase: string; peso: number; orden: number; paralela: boolean; rendDefault: number } {
  const texto = `${nombreRubro} ${capitulo || ''}`.toLowerCase()
  for (const [clave, config] of Object.entries(FASES_CONSTRUCTIVAS)) {
    if (texto.includes(clave)) {
      return { fase: clave, ...config }
    }
  }
  return { fase: 'general', peso: 10, orden: 10, paralela: false, rendDefault: 10 }
}

export default function GanttModal({
  isOpen,
  onClose,
  presupuestoRubros,
  updateTaskSchedule,
  nombreProyecto = "Proyecto de Construcción",
  granTotal = 0,
  onBatchScheduleUpdate
}: GanttModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day)
  const [fechaInicioObra, setFechaInicioObra] = useState<string>("2026-10-27")
  const [ritmoTrabajo, setRitmoTrabajo] = useState<'estandar' | 'acelerado'>('estandar')
  const [showCriticalPath, setShowCriticalPath] = useState<boolean>(true)
  const [isAiPlanning, setIsAiPlanning] = useState<boolean>(false)
  const [aiReport, setAiReport] = useState<string | null>(null)

  // Estado local reactivo de rubros para actualización en tiempo real instantánea
  const [localRubros, setLocalRubros] = useState<any[]>([])

  useEffect(() => {
    if (presupuestoRubros && presupuestoRubros.length > 0) {
      const sorted = [...presupuestoRubros].sort((a, b) => {
        const da = a.fecha_inicio ? new Date(a.fecha_inicio + 'T00:00:00').getTime() : 0
        const db = b.fecha_inicio ? new Date(b.fecha_inicio + 'T00:00:00').getTime() : 0
        return da - db
      })
      setLocalRubros(sorted)

      // Si el primer rubro tiene fecha de inicio, reflejarla en el selector
      const primerConFecha = sorted.find(r => r.fecha_inicio)
      if (primerConFecha) {
        setFechaInicioObra(primerConFecha.fecha_inicio)
      }
    } else {
      setLocalRubros([])
    }
  }, [presupuestoRubros])

  // Identificación de Tareas Críticas (CPM)
  const criticalTaskIds = useMemo(() => {
    if (!localRubros || localRubros.length === 0) return new Set<string>()
    let maxEndDate = 0
    let lastTaskId = ""
    localRubros.forEach((pr) => {
      const start = pr.fecha_inicio ? new Date(pr.fecha_inicio + 'T00:00:00').getTime() : 0
      const dur = parseInt(pr.duracion_dias) || 1
      const end = start + (dur * 86400000)
      if (end > maxEndDate) {
        maxEndDate = end
        lastTaskId = pr.id
      }
    })

    const criticalSet = new Set<string>()
    if (lastTaskId) {
      let currentId: string | null = lastTaskId
      while (currentId) {
        criticalSet.add(currentId)
        const task = localRubros.find((p) => p.id === currentId)
        currentId = task?.predecesores || null
      }
    }
    return criticalSet
  }, [localRubros])

  // KPIs de Planificación calculados en tiempo real
  const kpis = useMemo(() => {
    if (!localRubros || localRubros.length === 0) {
      return { totalDias: 0, fechaFin: null, tareasCriticas: 0, costoTotal: granTotal }
    }
    let minStart = Infinity
    let maxEnd = -Infinity
    let tareasCriticasCount = 0

    localRubros.forEach((pr) => {
      const s = pr.fecha_inicio ? new Date(pr.fecha_inicio + 'T00:00:00').getTime() : new Date().getTime()
      const dur = parseInt(pr.duracion_dias) || 1
      const e = s + (dur * 86400000)
      if (s < minStart) minStart = s
      if (e > maxEnd) maxEnd = e
      if (criticalTaskIds.has(pr.id)) tareasCriticasCount++
    })

    const totalDias = Math.max(1, Math.round((maxEnd - minStart) / 86400000))
    const fechaFin = new Date(maxEnd)

    return {
      totalDias,
      fechaFin: isNaN(fechaFin.getTime()) ? null : fechaFin.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }),
      tareasCriticas: tareasCriticasCount,
      costoTotal: granTotal || localRubros.reduce((acc, r) => acc + (Number(r.subtotal) || 0), 0)
    }
  }, [localRubros, criticalTaskIds, granTotal])

  // Tareas para gantt-task-react (ordenadas secuencialmente)
  const tasks: Task[] = useMemo(() => {
    if (!localRubros || localRubros.length === 0) return []
    
    return localRubros.map((pr: any, idx: number) => {
      const startDate = pr.fecha_inicio ? new Date(pr.fecha_inicio + 'T00:00:00') : new Date()
      const endDate = new Date(startDate)
      const duracion = Math.max(1, parseInt(pr.duracion_dias) || 1)
      endDate.setDate(startDate.getDate() + duracion)
      
      const deps = pr.predecesores ? [pr.predecesores] : []
      const isCritical = criticalTaskIds.has(pr.id) && showCriticalPath

      // Paleta visual: Rojo neón para ruta crítica, azul/violeta para secuencia estándar
      const progressColor = isCritical ? '#ef4444' : '#3b82f6'
      const progressSelectedColor = isCritical ? '#dc2626' : '#2563eb'

      return {
        id: pr.id,
        type: "task",
        name: `${idx + 1}. ${pr.nombre_rubro} (${duracion}d)`,
        start: startDate,
        end: endDate,
        progress: 100,
        isDisabled: false,
        dependencies: deps,
        styles: { 
          progressColor, 
          progressSelectedColor,
          backgroundColor: isCritical ? '#fee2e2' : '#dbeafe',
          backgroundSelectedColor: isCritical ? '#fecaca' : '#bfdbfe'
        }
      }
    })
  }, [localRubros, criticalTaskIds, showCriticalPath])

  if (!isOpen) return null

  // 1. MOTOR AGÉNTICO SARA-CRONOS: Planificación de Secuencia Constructiva & Ruta Crítica
  const handleAutoPlanificarSARA = async () => {
    if (!localRubros || localRubros.length === 0) {
      alert("No hay rubros en el presupuesto para planificar.")
      return
    }

    setIsAiPlanning(true)
    setAiReport(null)

    try {
      // Clasificar cada rubro por fase técnica constructiva
      const rubrosClasificados = localRubros.map((r) => {
        const info = clasificarFase(r.nombre_rubro, r.capitulo)
        const cantidad = Number(r.cantidad_obra) || 1
        
        let durCalculada = Math.ceil(cantidad / (info.rendDefault || 10))
        if (ritmoTrabajo === 'acelerado') {
          durCalculada = Math.ceil(durCalculada * 0.75)
        }
        durCalculada = Math.max(2, Math.min(durCalculada, 25))

        return {
          ...r,
          faseInfo: info,
          duracionCalculada: durCalculada
        }
      })

      // Ordenar por secuencia lógica constructiva
      rubrosClasificados.sort((a, b) => a.faseInfo.orden - b.faseInfo.orden)

      // Encadenar fechas y predecesores
      const fechaBase = new Date(fechaInicioObra + 'T00:00:00')
      let cursorFecha = new Date(fechaBase)
      const updates: any[] = []
      let predecesorIdAnterior: string | null = null

      rubrosClasificados.forEach((item) => {
        const itemStart = new Date(cursorFecha)
        const dependencias = (!item.faseInfo.paralela && predecesorIdAnterior) ? predecesorIdAnterior : null
        const itemEnd = new Date(itemStart)
        itemEnd.setDate(itemStart.getDate() + item.duracionCalculada)

        updates.push({
          id: item.id,
          fecha_inicio: itemStart.toISOString().split('T')[0],
          duracion_dias: item.duracionCalculada,
          predecesores: dependencias
        })

        if (!item.faseInfo.paralela) {
          cursorFecha = new Date(itemEnd)
          predecesorIdAnterior = item.id
        } else {
          cursorFecha.setDate(cursorFecha.getDate() + Math.ceil(item.duracionCalculada * 0.4))
        }
      })

      // Actualizar de inmediato el estado local en pantalla
      const mapUpdates = new Map(updates.map(u => [u.id, u]))
      const updatedLocal = rubrosClasificados.map(r => {
        const up = mapUpdates.get(r.id)
        return {
          ...r,
          fecha_inicio: up?.fecha_inicio,
          duracion_dias: up?.duracion_dias,
          predecesores: up?.predecesores
        }
      })
      setLocalRubros(updatedLocal)

      // Persistir de forma segura en Supabase (sin columna inexistente fecha_fin)
      if (onBatchScheduleUpdate) {
        await onBatchScheduleUpdate(updates)
      } else {
        for (const up of updates) {
          await updateTaskSchedule(up.id, {
            fecha_inicio: up.fecha_inicio,
            duracion_dias: up.duracion_dias,
            predecesores: up.predecesores
          })
        }
      }

      const totalDiasEst = Math.round((cursorFecha.getTime() - fechaBase.getTime()) / 86400000)
      setAiReport(
        `✅ Planificación optimizada por SARA-Cronos: ${updates.length} rubros organizados en orden cronológico real. Inicio: ${fechaInicioObra} · Duración total: ${totalDiasEst} días.`
      )
    } catch (err: any) {
      console.error("Error en auto-planificación SARA-Cronos:", err)
      alert("Error al planificar con SARA-Cronos: " + (err.message || err))
    } finally {
      setIsAiPlanning(false)
    }
  }

  // 2. EXPORTAR CRONOGRAMA VALORADO A EXCEL (.XLSX)
  const handleExportExcelValorado = () => {
    if (!localRubros || localRubros.length === 0) {
      alert("No hay rubros para exportar.")
      return
    }

    try {
      const wb = XLSX.utils.book_new()

      const cabecera = [
        ["GRUPO CONSTRUCTOR SARA - DIRECCIÓN DE PLANIFICACIÓN & CONTROL DE OBRAS"],
        [`CRONOGRAMA VALORADO DE TRABAJO Y RUTA CRÍTICA`],
        [`Proyecto: ${nombreProyecto}`],
        [`Fecha de Emisión: ${new Date().toLocaleDateString('es-EC')}`],
        [`Plazo Total Programado: ${kpis.totalDias} días laborables | Entrega estimada: ${kpis.fechaFin || 'Por definir'}`],
        [`Inversión Total Presupuestada: $${Number(kpis.costoTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`],
        []
      ]

      const headers = [
        "N°", 
        "Código", 
        "Descripción del Rubro", 
        "Unidad", 
        "Cantidad", 
        "P.U. ($)", 
        "Subtotal ($)", 
        "Fecha Inicio", 
        "Duración (Días)", 
        "Predecesor",
        "Ruta Crítica (CPM)"
      ]

      const rows = localRubros.map((r, idx) => [
        idx + 1,
        r.codigo_rubro || `RUB-${idx + 1}`,
        r.nombre_rubro,
        r.unidad || 'u',
        Number(r.cantidad_obra || 0).toFixed(2),
        Number(r.precio_unitario_snapshot || 0).toFixed(2),
        Number(r.subtotal || 0).toFixed(2),
        r.fecha_inicio || '-',
        r.duracion_dias || 1,
        r.predecesores ? `Tarea ${r.predecesores}` : 'Inicio / Sin predecesor',
        criticalTaskIds.has(r.id) ? 'SÍ (CRÍTICA)' : 'NO'
      ])

      const dataAOA = [...cabecera, headers, ...rows]
      const ws = XLSX.utils.aoa_to_sheet(dataAOA)

      ws['!cols'] = [
        { wch: 5 },
        { wch: 14 },
        { wch: 45 },
        { wch: 8 },
        { wch: 10 },
        { wch: 12 },
        { wch: 14 },
        { wch: 14 },
        { wch: 16 },
        { wch: 22 },
        { wch: 20 },
      ]

      XLSX.utils.book_append_sheet(wb, ws, "Cronograma Valorado")
      const safeName = nombreProyecto.replace(/[^a-zA-Z0-9]/g, "_")
      XLSX.writeFile(wb, `Cronograma_Gantt_SARA_${safeName}.xlsx`)
    } catch (err: any) {
      console.error("Error al exportar Excel:", err)
      alert("Error al exportar cronograma: " + (err.message || err))
    }
  }

  // 3. DESPLAZAMIENTO INTERACTIVO DE TAREAS (Arrastrar en Gantt)
  const handleTaskChange = (task: Task) => {
    const startDate = task.start
    const endDate = task.end
    
    const startIso = startDate.toISOString().split('T')[0]
    const duracion = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    
    const originalTask = localRubros.find((p: any) => p.id === task.id)
    let shiftDays = 0
    
    if (originalTask && originalTask.fecha_inicio) {
      const originalStart = new Date(originalTask.fecha_inicio + 'T00:00:00')
      shiftDays = Math.round((startDate.getTime() - originalStart.getTime()) / (1000 * 60 * 60 * 24))
    }

    // Actualizar estado local
    setLocalRubros(prev => prev.map(r => {
      if (r.id === task.id) {
        return { ...r, fecha_inicio: startIso, duracion_dias: duracion }
      }
      return r
    }))

    // Persistir sin fecha_fin
    updateTaskSchedule(task.id, {
      fecha_inicio: startIso,
      duracion_dias: duracion
    }, null)

    // Cascada para tareas dependientes
    if (shiftDays !== 0) {
      const shiftChildren = (parentId: string, currentShift: number) => {
        const children = localRubros.filter((p: any) => p.predecesores === parentId)
        children.forEach((child: any) => {
          if (child.fecha_inicio) {
            const childStart = new Date(child.fecha_inicio + 'T00:00:00')
            childStart.setDate(childStart.getDate() + currentShift)
            const newIso = childStart.toISOString().split('T')[0]

            setLocalRubros(prev => prev.map(r => r.id === child.id ? { ...r, fecha_inicio: newIso } : r))

            updateTaskSchedule(child.id, {
              fecha_inicio: newIso
            }, null)

            shiftChildren(child.id, currentShift)
          }
        })
      }
      shiftChildren(task.id, shiftDays)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/85 z-[100] flex items-center justify-center p-2 sm:p-4 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full h-[95vh] flex flex-col overflow-hidden shadow-2xl text-slate-100">
        
        {/* CABECERA PRINCIPAL */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/90 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Calendar size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  Cronograma de Ejecución de Obra (Gantt Interactivo)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                  SARA-Cronos CPM
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Proyecto: <span className="text-slate-200 font-bold">{nombreProyecto}</span> · Secuencia lógica constructiva y ruta crítica de obra
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* VISTAS DÍAS / SEMANAS / MESES */}
            <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs font-bold">
              <button 
                className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === ViewMode.Day ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`} 
                onClick={() => setViewMode(ViewMode.Day)}
              >
                Días
              </button>
              <button 
                className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === ViewMode.Week ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`} 
                onClick={() => setViewMode(ViewMode.Week)}
              >
                Semanas
              </button>
              <button 
                className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === ViewMode.Month ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`} 
                onClick={() => setViewMode(ViewMode.Month)}
              >
                Meses
              </button>
            </div>

            {/* BOTÓN EXCEL OFICIAL */}
            <button
              onClick={handleExportExcelValorado}
              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Descargar Cronograma Valorado en formato Excel (.xlsx)"
            >
              <Download size={14} />
              <span>Exportar Excel</span>
            </button>

            {/* CERRAR */}
            <button 
              onClick={onClose} 
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* BARRA DE ACCIONES DEL AGENTE SARA-CRONOS */}
        <div className="bg-slate-950/60 border-b border-slate-800 p-3.5 flex flex-wrap items-center justify-between gap-4">
          
          {/* CONTROL DE PARÁMETROS AGÉNTICOS */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-xl">
              <Calendar size={14} className="text-purple-400" />
              <span className="text-slate-400 font-medium">Inicio de Obra:</span>
              <input 
                type="date" 
                value={fechaInicioObra}
                onChange={(e) => setFechaInicioObra(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-xl">
              <Sliders size={14} className="text-amber-400" />
              <span className="text-slate-400 font-medium">Ritmo:</span>
              <select
                value={ritmoTrabajo}
                onChange={(e: any) => setRitmoTrabajo(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
              >
                <option value="estandar" className="bg-slate-900 text-white">Estándar (Lunes a Viernes)</option>
                <option value="acelerado" className="bg-slate-900 text-white">Acelerado (Lunes a Sábado - Fast-Track)</option>
              </select>
            </div>

            {/* TOGGLE RUTA CRÍTICA */}
            <button
              onClick={() => setShowCriticalPath(!showCriticalPath)}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                showCriticalPath 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-xs' 
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <Flame size={14} className={showCriticalPath ? 'text-rose-400 animate-pulse' : ''} />
              <span>Ruta Crítica ({kpis.tareasCriticas} tareas)</span>
            </button>
          </div>

          {/* BOTÓN DISPARADOR SARA-CRONOS */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoPlanificarSARA}
              disabled={isAiPlanning || !localRubros?.length}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isAiPlanning ? (
                <>
                  <RefreshCw size={14} className="animate-spin text-purple-200" />
                  <span>SARA-Cronos Analizando Rendimientos...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-purple-200" />
                  <span>⚡ Planificar con Agente SARA-Cronos (IA)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* FEEDBACK DEL AGENTE O RESUMEN TÉCNICO */}
        {aiReport && (
          <div className="bg-purple-950/40 border-b border-purple-500/30 px-4 py-2 text-xs text-purple-200 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={15} className="text-purple-400 shrink-0" />
            <span>{aiReport}</span>
          </div>
        )}

        {/* BARRA DE KPIS TÉCNICOS DE CRONOGRAMA */}
        <div className="bg-slate-900/80 px-4 py-2.5 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <Clock size={16} className="text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-black block">Plazo de Ejecución</span>
              <span className="text-sm font-black text-white font-mono">{kpis.totalDias} Días</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Calendar size={16} className="text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-black block">Entrega Estimada</span>
              <span className="text-sm font-black text-white">{kpis.fechaFin || 'Por calcular'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Flame size={16} className="text-rose-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-black block">Tareas en Ruta Crítica</span>
              <span className="text-sm font-black text-rose-300 font-mono">{kpis.tareasCriticas} de {localRubros?.length || 0}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <DollarSign size={16} className="text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-black block">Monto Total Obra</span>
              <span className="text-sm font-black text-emerald-400 font-mono">${Number(kpis.costoTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* ÁREA PRINCIPAL DEL GANTT */}
        <div className="flex-1 overflow-auto p-3 flex flex-col bg-slate-950">
          <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <AlertCircle size={13} className="text-purple-400" />
              Arrastra las barras en la línea de tiempo para ajustar fechas. Las tareas dependientes se reajustarán automáticamente en cascada.
            </span>
            <span className="text-slate-500">
              🔴 Barra Roja = Tarea de Ruta Crítica (Holgura = 0) · 🔵 Barra Azul = Tarea con Holgura
            </span>
          </div>

          <div className="border border-slate-800 rounded-xl bg-white flex-1 overflow-auto p-1 shadow-inner">
            {tasks.length > 0 ? (
              <Gantt
                tasks={tasks}
                viewMode={viewMode}
                onDateChange={handleTaskChange}
                onProgressChange={() => {}}
                onDoubleClick={() => {}}
                listCellWidth="300px"
                columnWidth={viewMode === ViewMode.Day ? 60 : viewMode === ViewMode.Week ? 120 : 180}
                locale="es"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 p-8">
                <Layers size={36} className="text-slate-600 animate-bounce" />
                <p className="font-bold text-slate-300">No hay rubros cargados en el presupuesto.</p>
                <p className="text-xs text-slate-500 text-center max-w-md">
                  Agrega rubros al presupuesto activo o pulsa "Planificar con Agente SARA-Cronos" para secuenciar automáticamente la obra.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}