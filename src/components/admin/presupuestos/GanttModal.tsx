import React, { useState, useMemo } from "react"
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
  losa: { peso: 7, orden: 7, paralela: false, rendDefault: 14 }, // Incluye encofrado + vaciado + fraguado
  cubierta: { peso: 8, orden: 8, paralela: false, rendDefault: 10 },

  // Fase 3: Mamposterías e Instalaciones Embutidas
  mamposteria: { peso: 9, orden: 9, paralela: false, rendDefault: 18 }, // m2/dia
  paredes: { peso: 9, orden: 9, paralela: false, rendDefault: 18 },
  hidrosanitaria: { peso: 10, orden: 10, paralela: true, rendDefault: 10 },
  electrica: { peso: 10, orden: 10, paralela: true, rendDefault: 10 },
  tuberias: { peso: 10, orden: 10, paralela: true, rendDefault: 12 },

  // Fase 4: Enlucidos y Revestimientos
  enlucido: { peso: 11, orden: 11, paralela: false, rendDefault: 22 }, // m2/dia
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
  const [fechaInicioObra, setFechaInicioObra] = useState<string>(() => {
    // Por defecto, el próximo lunes o hoy
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() + ((day === 0 ? 1 : 8) - day) // Siguiente lunes
    const nextMonday = new Date(d.setDate(diff))
    return nextMonday.toISOString().split('T')[0]
  })
  const [ritmoTrabajo, setRitmoTrabajo] = useState<'estandar' | 'acelerado'>('estandar')
  const [showCriticalPath, setShowCriticalPath] = useState<boolean>(true)
  const [isAiPlanning, setIsAiPlanning] = useState<boolean>(false)
  const [aiReport, setAiReport] = useState<string | null>(null)

  // Identificación de Tareas Críticas (CPM simplificado)
  const criticalTaskIds = useMemo(() => {
    if (!presupuestoRubros || presupuestoRubros.length === 0) return new Set<string>()
    // Las tareas que forman la cadena más larga hasta la fecha máxima
    let maxEndDate = 0
    let lastTaskId = ""
    presupuestoRubros.forEach((pr) => {
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
        const task = presupuestoRubros.find((p) => p.id === currentId)
        currentId = task?.predecesores || null
      }
    }
    return criticalSet
  }, [presupuestoRubros])

  // KPIs de Planificación
  const kpis = useMemo(() => {
    if (!presupuestoRubros || presupuestoRubros.length === 0) {
      return { totalDias: 0, fechaFin: null, tareasCriticas: 0, costoTotal: granTotal }
    }
    let minStart = Infinity
    let maxEnd = -Infinity
    let tareasCriticasCount = 0

    presupuestoRubros.forEach((pr) => {
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
      costoTotal: granTotal || presupuestoRubros.reduce((acc, r) => acc + (Number(r.subtotal) || 0), 0)
    }
  }, [presupuestoRubros, criticalTaskIds, granTotal])

  // Tareas para gantt-task-react
  const tasks: Task[] = useMemo(() => {
    if (!presupuestoRubros || presupuestoRubros.length === 0) return []
    
    return presupuestoRubros.map((pr: any, idx: number) => {
      const startDate = pr.fecha_inicio ? new Date(pr.fecha_inicio + 'T00:00:00') : new Date()
      const endDate = new Date(startDate)
      const duracion = parseInt(pr.duracion_dias) || 1
      endDate.setDate(startDate.getDate() + duracion)
      
      const deps = pr.predecesores ? [pr.predecesores] : []
      const isCritical = criticalTaskIds.has(pr.id) && showCriticalPath

      // Paleta visual: Rojo neón para ruta crítica, azul/cian para secuencia estándar
      const progressColor = isCritical ? '#ef4444' : '#2563eb'
      const progressSelectedColor = isCritical ? '#dc2626' : '#1d4ed8'

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
  }, [presupuestoRubros, criticalTaskIds, showCriticalPath])

  if (!isOpen) return null

  // 1. MOTOR AGÉNTICO SARA-CRONOS: Planificación de Secuencia y Ruta Crítica
  const handleAutoPlanificarSARA = async () => {
    if (!presupuestoRubros || presupuestoRubros.length === 0) {
      alert("No hay rubros en el presupuesto para planificar.")
      return
    }

    setIsAiPlanning(true)
    setAiReport(null)

    try {
      // Ordenar rubros por orden técnico de fases constructivas
      const rubrosClasificados = presupuestoRubros.map((r) => {
        const info = clasificarFase(r.nombre_rubro, r.capitulo)
        const cantidad = Number(r.cantidad_obra) || 1
        
        // Calcular duración estimada según rendimiento
        let durCalculada = Math.ceil(cantidad / (info.rendDefault || 10))
        if (ritmoTrabajo === 'acelerado') {
          durCalculada = Math.ceil(durCalculada * 0.75) // Turno intensivo
        }
        durCalculada = Math.max(2, Math.min(durCalculada, 25)) // Acotado entre 2 y 25 días por rubro

        return {
          ...r,
          faseInfo: info,
          duracionCalculada: durCalculada
        }
      })

      // Ordenar por orden de fase constructiva
      rubrosClasificados.sort((a, b) => a.faseInfo.orden - b.faseInfo.orden)

      // Asignar fechas secuenciales y dependencias
      const fechaBase = new Date(fechaInicioObra + 'T00:00:00')
      let cursorFecha = new Date(fechaBase)
      const updates: any[] = []
      let predecesorIdAnterior: string | null = null

      rubrosClasificados.forEach((item, index) => {
        const itemStart = new Date(cursorFecha)
        
        // Si no es paralela y existe predecesor, depende de la anterior
        const dependencias = (!item.faseInfo.paralela && predecesorIdAnterior) ? predecesorIdAnterior : null

        const itemEnd = new Date(itemStart)
        itemEnd.setDate(itemStart.getDate() + item.duracionCalculada)

        updates.push({
          id: item.id,
          fecha_inicio: itemStart.toISOString().split('T')[0],
          fecha_fin: itemEnd.toISOString().split('T')[0],
          duracion_dias: item.duracionCalculada,
          predecesores: dependencias
        })

        // Avanzar el cursor para la siguiente tarea si no es 100% paralela
        if (!item.faseInfo.paralela) {
          cursorFecha = new Date(itemEnd)
          predecesorIdAnterior = item.id
        } else {
          // Si es paralela, desplaza solo parcialmente (traslape del 30%)
          cursorFecha.setDate(cursorFecha.getDate() + Math.ceil(item.duracionCalculada * 0.4))
        }
      })

      // Ejecutar persistencia en base de datos
      if (onBatchScheduleUpdate) {
        await onBatchScheduleUpdate(updates)
      } else {
        // Fallback secuencial
        for (const up of updates) {
          await updateTaskSchedule(up.id, {
            fecha_inicio: up.fecha_inicio,
            fecha_fin: up.fecha_fin,
            duracion_dias: up.duracion_dias,
            predecesores: up.predecesores
          })
        }
      }

      setAiReport(
        `✅ Planificación optimizada por SARA-Cronos: ${updates.length} rubros organizados en ${rubrosClasificados.length} etapas constructivas. Fecha de inicio: ${fechaInicioObra}. Duración total estimada: ${Math.round((cursorFecha.getTime() - fechaBase.getTime()) / 86400000)} días.`
      )
    } catch (err: any) {
      console.error("Error en auto-planificación SARA-Cronos:", err)
      alert("Hubo un error al planificar con SARA-Cronos: " + (err.message || err))
    } finally {
      setIsAiPlanning(false)
    }
  }

  // 2. EXPORTAR CRONOGRAMA VALORADO A EXCEL (.XLSX)
  const handleExportExcelValorado = () => {
    if (!presupuestoRubros || presupuestoRubros.length === 0) {
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
        [] // Línea vacía
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
        "Fecha Fin", 
        "Duración (Días)", 
        "Predecesor",
        "Ruta Crítica (CPM)"
      ]

      const rows = presupuestoRubros.map((r, idx) => [
        idx + 1,
        r.codigo_rubro || `RUB-${idx + 1}`,
        r.nombre_rubro,
        r.unidad || 'u',
        Number(r.cantidad_obra || 0).toFixed(2),
        Number(r.precio_unitario_snapshot || 0).toFixed(2),
        Number(r.subtotal || 0).toFixed(2),
        r.fecha_inicio || '-',
        r.fecha_fin || '-',
        r.duracion_dias || 1,
        r.predecesores ? `Tarea ${r.predecesores}` : 'Inicio / Sin predecesor',
        criticalTaskIds.has(r.id) ? 'SÍ (CRÍTICA)' : 'NO'
      ])

      const dataAOA = [...cabecera, headers, ...rows]
      const ws = XLSX.utils.aoa_to_sheet(dataAOA)

      // Formato de anchos de columna
      ws['!cols'] = [
        { wch: 5 },  // N°
        { wch: 14 }, // Código
        { wch: 45 }, // Rubro
        { wch: 8 },  // Unidad
        { wch: 10 }, // Cantidad
        { wch: 12 }, // P.U.
        { wch: 14 }, // Subtotal
        { wch: 14 }, // Fecha Inicio
        { wch: 14 }, // Fecha Fin
        { wch: 16 }, // Duración
        { wch: 22 }, // Predecesor
        { wch: 20 }, // Ruta Crítica
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
    const endIso = endDate.toISOString().split('T')[0]
    const duracion = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    
    const originalTask = presupuestoRubros.find((p: any) => p.id === task.id)
    let shiftDays = 0
    
    if (originalTask && originalTask.fecha_inicio) {
      const originalStart = new Date(originalTask.fecha_inicio + 'T00:00:00')
      shiftDays = Math.round((startDate.getTime() - originalStart.getTime()) / (1000 * 60 * 60 * 24))
    }

    updateTaskSchedule(task.id, {
      fecha_inicio: startIso,
      fecha_fin: endIso,
      duracion_dias: duracion
    }, null)

    // Cascada para hijos
    if (shiftDays !== 0) {
      const shiftChildren = (parentId: string, currentShift: number) => {
        const children = presupuestoRubros.filter((p: any) => p.predecesores === parentId)
        children.forEach((child: any) => {
          if (child.fecha_inicio) {
            const childStart = new Date(child.fecha_inicio + 'T00:00:00')
            childStart.setDate(childStart.getDate() + currentShift)
            const childEnd = new Date(childStart)
            childEnd.setDate(childStart.getDate() + (parseInt(child.duracion_dias) || 1))

            updateTaskSchedule(child.id, {
              fecha_inicio: childStart.toISOString().split('T')[0],
              fecha_fin: childEnd.toISOString().split('T')[0]
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
              disabled={isAiPlanning || !presupuestoRubros?.length}
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
              <span className="text-sm font-black text-rose-300 font-mono">{kpis.tareasCriticas} de {presupuestoRubros?.length || 0}</span>
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