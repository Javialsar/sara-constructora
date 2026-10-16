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
  DollarSign,
  FileText,
  Users,
  Box,
  Truck,
  Wrench,
  ChevronRight,
  Info,
  Printer
} from "lucide-react"
import { Gantt, Task, ViewMode } from "gantt-task-react"
import "gantt-task-react/dist/index.css"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface GanttModalProps {
  isOpen: boolean
  onClose: () => void
  presupuestoRubros: any[]
  updateTaskSchedule: (id: string, fieldOrUpdates: any, value?: any) => Promise<void>
  nombreProyecto?: string
  granTotal?: number
  rubrosRecipes?: Record<string, any[]>
  onBatchScheduleUpdate?: (updates: any[]) => Promise<void>
}

// Clasificación heurística de capítulos de obra en secuencia constructiva para Ecuador
const FASES_CONSTRUCTIVAS: { [key: string]: { peso: number; orden: number; paralela: boolean; rendDefault: number; procedimiento: string } } = {
  estudios: { 
    peso: 1, orden: 1, paralela: false, rendDefault: 12,
    procedimiento: "Levantamiento de campo, ensayos geotécnicos y modelación estructural bajo norma NEC-SE-DS."
  },
  diseño: { 
    peso: 1, orden: 1, paralela: false, rendDefault: 12,
    procedimiento: "Desarrollo de planimetría 2D, modelado BIM y renders fotorrealistas para aprobación ejecutiva."
  },
  tramites: { 
    peso: 1, orden: 1, paralela: false, rendDefault: 10,
    procedimiento: "Ingreso de expedientes al GAD Municipal, validación de línea de fábrica y pago de tasas de construcción."
  },
  preliminares: { 
    peso: 2, orden: 2, paralela: false, rendDefault: 5,
    procedimiento: "Limpieza manual y mecánica, instalación de bodega provisional, acometidas provisionales de luz y agua."
  },
  desbroce: { 
    peso: 2, orden: 2, paralela: false, rendDefault: 4,
    procedimiento: "Retiro de capa vegetal y maleza superficial con retroexcavadora y acopio para posterior desalojo."
  },
  replanteo: { 
    peso: 2, orden: 2, paralela: false, rendDefault: 3,
    procedimiento: "Trazado de ejes y linderos con estación total y manguera de nivel, colocación de caballetes de madera."
  },
  cerramiento: { 
    peso: 2, orden: 2, paralela: true, rendDefault: 4,
    procedimiento: "Construcción de cerca perimetral provisional con postes y malla/bloque para seguridad perimetral de obra."
  },
  excavacion: { 
    peso: 3, orden: 3, paralela: false, rendDefault: 30,
    procedimiento: "Excavación a máquina para cimentaciones de plintos y zanjas de riostras. Control de cotas de desplante."
  },
  desalojo: { 
    peso: 3, orden: 3, paralela: true, rendDefault: 35,
    procedimiento: "Carga mecánica y transporte de tierra no apta en volquetas hacia escombrera municipal autorizada."
  },
  replantillo: { 
    peso: 4, orden: 4, paralela: false, rendDefault: 15,
    procedimiento: "Vaciado de hormigón simple f'c=140 kg/cm² e=5cm en fondo de excavaciones para asentar armaduras."
  },
  plintos: { 
    peso: 5, orden: 5, paralela: false, rendDefault: 10,
    procedimiento: "Armado de canastillas de acero fy=4200, encofrado y fundición con hormigón estructural f'c=210 kg/cm²."
  },
  cimentacion: { 
    peso: 5, orden: 5, paralela: false, rendDefault: 8,
    procedimiento: "Colocación de riostras y vigas de cimentación sismorresistentes con vibrado mecánico de concreto."
  },
  columnas: { 
    peso: 6, orden: 6, paralela: false, rendDefault: 8,
    procedimiento: "Amarre de estribos según diseño sismo-resistente NEC-15, aplomado de encofrados metálicos y vaciado."
  },
  vigas: { 
    peso: 6, orden: 6, paralela: false, rendDefault: 8,
    procedimiento: "Armado de vigas principales y secundarias de entrepiso, apuntalamiento con puntales metálicos regulables."
  },
  muros: { 
    peso: 6, orden: 6, paralela: false, rendDefault: 10,
    procedimiento: "Encofrado a dos caras y vaciado de muros de corte y contención para absorción de empujes laterales."
  },
  losa: { 
    peso: 7, orden: 7, paralela: false, rendDefault: 14,
    procedimiento: "Tendido de viguetas y bloques de alivianamiento, colocación de malla electrosoldada, vaciado y curado continuo por 14 días."
  },
  cubierta: { 
    peso: 8, orden: 8, paralela: false, rendDefault: 10,
    procedimiento: "Instalación de estructura metálica de perfilería liviana y fijación de paneles térmicos/teja impermeabilizada."
  },
  mamposteria: { 
    peso: 9, orden: 9, paralela: false, rendDefault: 18,
    procedimiento: "Levantamiento de paredes de bloque prensado/ladrillo con mortero 1:4 y anclajes metálicos cada 2 hiladas."
  },
  paredes: { 
    peso: 9, orden: 9, paralela: false, rendDefault: 18,
    procedimiento: "Pegado de bloques aplomados y alineados con reventones de nivel y refuerzo horizontal."
  },
  hidrosanitaria: { 
    peso: 10, orden: 10, paralela: true, rendDefault: 10,
    procedimiento: "Tendido de tuberías PVC desagüe y distribución de agua potable Termofusión Tuboplus con pruebas de presión hidrostática."
  },
  electrica: { 
    peso: 10, orden: 10, paralela: true, rendDefault: 10,
    procedimiento: "Canalización de manguera corrugada/conduit, cableado de cobre THHN, cajas de pase y cuadro de breakers."
  },
  tuberias: { 
    peso: 10, orden: 10, paralela: true, rendDefault: 12,
    procedimiento: "Instalación de bajantes de aguas pluviales y tuberías de ventilación según planos sanitarios."
  },
  enlucido: { 
    peso: 11, orden: 11, paralela: false, rendDefault: 22,
    procedimiento: "Paleteado y frotachado con mortero cemento-arena 1:3 en muros interiores y exteriores a plomo y regla."
  },
  masillado: { 
    peso: 11, orden: 11, paralela: false, rendDefault: 20,
    procedimiento: "Aplicación de empaste para interiores y exteriores sobre paredes enlucidas para dejar superficie lisa."
  },
  contrapiso: { 
    peso: 11, orden: 11, paralela: false, rendDefault: 25,
    procedimiento: "Fundición de contrapiso de hormigón simple e=8cm con polietileno aislante de humedad sobre suelo compactado."
  },
  impermeabilizacion: { 
    peso: 12, orden: 12, paralela: false, rendDefault: 20,
    procedimiento: "Colocación de manto asfáltico o membrana líquida poliuretánica en losas y áreas húmedas con prueba de estanqueidad de 24h."
  },
  porcelanato: { 
    peso: 13, orden: 13, paralela: false, rendDefault: 16,
    procedimiento: "Instalación de piezas con pegamento bondex plus, nivelación con cuñas y crucetas de 2mm, emporcelanado final."
  },
  ceramica: { 
    peso: 13, orden: 13, paralela: false, rendDefault: 16,
    procedimiento: "Colocación de revestimiento cerámico en paredes de baños y cocina con mortero adhesivo impermeable."
  },
  pisos: { 
    peso: 13, orden: 13, paralela: false, rendDefault: 16,
    procedimiento: "Tendido de pavimentos y rodapiés rectificados con pulido y limpieza final."
  },
  pintura: { 
    peso: 14, orden: 14, paralela: false, rendDefault: 40,
    procedimiento: "Aplicación de 2 a 3 manos de pintura látex vinílica antibacterial sobre base de sellador enlucido."
  },
  ventanas: { 
    peso: 15, orden: 15, paralela: true, rendDefault: 6,
    procedimiento: "Fijación de perfiles de aluminio serie pesada con vidrio templado de 6mm y sellado perimetral con silicona estructural."
  },
  puertas: { 
    peso: 15, orden: 15, paralela: true, rendDefault: 6,
    procedimiento: "Instalación de marcos, batientes y hojas de puertas en madera/melamínico con cerraduras de alta seguridad."
  },
  aluminio: { 
    peso: 15, orden: 15, paralela: true, rendDefault: 8,
    procedimiento: "Montaje de mamparas corredizas y perfiles con felpas herméticas acústicas."
  },
  muebles: { 
    peso: 15, orden: 15, paralela: true, rendDefault: 8,
    procedimiento: "Instalación de muebles modulares de cocina y clósets en melamina RH con herrajes de cierre suave."
  },
  bbq: { 
    peso: 16, orden: 16, paralela: true, rendDefault: 10,
    procedimiento: "Construcción de asador con ladrillo refractario, parrilla de acero inoxidable y pérgola de madera tratada."
  },
  jacuzzi: { 
    peso: 16, orden: 16, paralela: true, rendDefault: 10,
    procedimiento: "Instalación de hidromasaje exterior con bomba de calor, jets de hidroterapia, conexiones y pruebas hidráulicas."
  },
  jardineria: { 
    peso: 16, orden: 16, paralela: true, rendDefault: 8,
    procedimiento: "Siembra de césped en tepes, plantas ornamentales y sistema de riego por goteo."
  },
  limpieza: { 
    peso: 17, orden: 17, paralela: false, rendDefault: 3,
    procedimiento: "Limpieza profunda de vidrios, pisos y artefactos, retiro de escombros y entrega formal con acta de obra."
  },
  entrega: { 
    peso: 17, orden: 17, paralela: false, rendDefault: 2,
    procedimiento: "Revisión final con el cliente y entrega formal de llaves y planos as-built."
  },
}

function clasificarFase(nombreRubro: string, capitulo?: string): { fase: string; peso: number; orden: number; paralela: boolean; rendDefault: number; procedimiento: string } {
  const texto = `${nombreRubro} ${capitulo || ''}`.toLowerCase()
  for (const [clave, config] of Object.entries(FASES_CONSTRUCTIVAS)) {
    if (texto.includes(clave)) {
      return { fase: clave, ...config }
    }
  }
  return { 
    fase: 'general', peso: 10, orden: 10, paralela: false, rendDefault: 10,
    procedimiento: "Ejecución técnica según planos ejecutivos y especificaciones técnicas generales de la construcción."
  }
}

export default function GanttModal({
  isOpen,
  onClose,
  presupuestoRubros,
  updateTaskSchedule,
  nombreProyecto = "Proyecto de Construcción",
  granTotal = 0,
  rubrosRecipes = {},
  onBatchScheduleUpdate
}: GanttModalProps) {
  const [activeTab, setActiveTab] = useState<'gantt' | 'informe'>('gantt')
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day)
  const [fechaInicioObra, setFechaInicioObra] = useState<string>("2026-10-27")
  const [ritmoTrabajo, setRitmoTrabajo] = useState<'estandar' | 'acelerado'>('estandar')
  const [showCriticalPath, setShowCriticalPath] = useState<boolean>(true)
  const [isAiPlanning, setIsAiPlanning] = useState<boolean>(false)
  const [aiReport, setAiReport] = useState<string | null>(null)

  // Estado local reactivo de rubros para sincronización instantánea
  const [localRubros, setLocalRubros] = useState<any[]>([])

  // Modal / Drawer de Ficha Técnica de la Actividad
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<any | null>(null)

  useEffect(() => {
    if (presupuestoRubros && presupuestoRubros.length > 0) {
      const sorted = [...presupuestoRubros].sort((a, b) => {
        const da = a.fecha_inicio ? new Date(a.fecha_inicio + 'T00:00:00').getTime() : 0
        const db = b.fecha_inicio ? new Date(b.fecha_inicio + 'T00:00:00').getTime() : 0
        return da - db
      })
      setLocalRubros(sorted)

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

  // KPIs de Planificación
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

  // Tareas para gantt-task-react con enumeración clara y formato de dos dígitos
  const tasks: Task[] = useMemo(() => {
    if (!localRubros || localRubros.length === 0) return []
    
    return localRubros.map((pr: any, idx: number) => {
      const startDate = pr.fecha_inicio ? new Date(pr.fecha_inicio + 'T00:00:00') : new Date()
      const endDate = new Date(startDate)
      const duracion = Math.max(1, parseInt(pr.duracion_dias) || 1)
      endDate.setDate(startDate.getDate() + duracion)
      
      const deps = pr.predecesores ? [pr.predecesores] : []
      const isCritical = criticalTaskIds.has(pr.id) && showCriticalPath

      const progressColor = isCritical ? '#ef4444' : '#2563eb'
      const progressSelectedColor = isCritical ? '#dc2626' : '#1d4ed8'

      const numStr = String(idx + 1).padStart(2, '0')

      return {
        id: pr.id,
        type: "task",
        name: `${numStr}. ${pr.nombre_rubro} (${duracion}d)`,
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

  // Agrupación cronológica para el Informe Operativo (Lookahead Semanal / Mensual)
  const periodosReporte = useMemo(() => {
    if (!localRubros || localRubros.length === 0) return []

    // Agrupar según viewMode
    if (viewMode === ViewMode.Week) {
      // Agrupación por semanas
      const semanasMap: { [key: string]: { label: string; rubros: any[]; inicio: Date; fin: Date; costo: number } } = {}
      localRubros.forEach((r, idx) => {
        const s = r.fecha_inicio ? new Date(r.fecha_inicio + 'T00:00:00') : new Date()
        // Calcular número de semana relativo al inicio
        const startBase = new Date(fechaInicioObra + 'T00:00:00')
        const diffWeeks = Math.max(1, Math.ceil(((s.getTime() - startBase.getTime()) / 86400000 + 1) / 7))
        const key = `Semana ${diffWeeks}`

        if (!semanasMap[key]) {
          const wStart = new Date(startBase)
          wStart.setDate(startBase.getDate() + (diffWeeks - 1) * 7)
          const wEnd = new Date(wStart)
          wEnd.setDate(wStart.getDate() + 6)

          semanasMap[key] = {
            label: `${key} (${wStart.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' })} - ${wEnd.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' })})`,
            rubros: [],
            inicio: wStart,
            fin: wEnd,
            costo: 0
          }
        }
        semanasMap[key].rubros.push({ ...r, indexGlobal: idx + 1 })
        semanasMap[key].costo += Number(r.subtotal) || 0
      })
      return Object.values(semanasMap)
    } else if (viewMode === ViewMode.Month) {
      // Agrupación por meses
      const mesesMap: { [key: string]: { label: string; rubros: any[]; inicio: Date; fin: Date; costo: number } } = {}
      localRubros.forEach((r, idx) => {
        const s = r.fecha_inicio ? new Date(r.fecha_inicio + 'T00:00:00') : new Date()
        const mesYear = s.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' })
        const key = mesYear.charAt(0).toUpperCase() + mesYear.slice(1)

        if (!mesesMap[key]) {
          mesesMap[key] = {
            label: key,
            rubros: [],
            inicio: s,
            fin: s,
            costo: 0
          }
        }
        mesesMap[key].rubros.push({ ...r, indexGlobal: idx + 1 })
        mesesMap[key].costo += Number(r.subtotal) || 0
      })
      return Object.values(mesesMap)
    } else {
      // Modo Días: agrupar por cada fecha de arranque
      const diasMap: { [key: string]: { label: string; rubros: any[]; inicio: Date; fin: Date; costo: number } } = {}
      localRubros.forEach((r, idx) => {
        const key = r.fecha_inicio ? new Date(r.fecha_inicio + 'T00:00:00').toLocaleDateString('es-EC', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin fecha'
        if (!diasMap[key]) {
          diasMap[key] = {
            label: key,
            rubros: [],
            inicio: new Date(),
            fin: new Date(),
            costo: 0
          }
        }
        diasMap[key].rubros.push({ ...r, indexGlobal: idx + 1 })
        diasMap[key].costo += Number(r.subtotal) || 0
      })
      return Object.values(diasMap)
    }
  }, [localRubros, viewMode, fechaInicioObra])

  if (!isOpen) return null

  // 1. MOTOR AGÉNTICO SARA-CRONOS
  const handleAutoPlanificarSARA = async () => {
    if (!localRubros || localRubros.length === 0) {
      alert("No hay rubros en el presupuesto para planificar.")
      return
    }

    setIsAiPlanning(true)
    setAiReport(null)

    try {
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

      rubrosClasificados.sort((a, b) => a.faseInfo.orden - b.faseInfo.orden)

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
        `✅ Planificación optimizada por SARA-Cronos: ${updates.length} rubros organizados en orden constructivo real. Inicio: ${fechaInicioObra} · Duración total: ${totalDiasEst} días.`
      )
    } catch (err: any) {
      console.error("Error en auto-planificación SARA-Cronos:", err)
      alert("Error al planificar con SARA-Cronos: " + (err.message || err))
    } finally {
      setIsAiPlanning(false)
    }
  }

  // 2. EXPORTAR EXCEL OFICIAL (.XLSX)
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
        [`Plazo Total: ${kpis.totalDias} días laborables | Entrega estimada: ${kpis.fechaFin || 'Por definir'}`],
        [`Monto Total Obra: $${Number(kpis.costoTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`],
        []
      ]

      const headers = [
        "N°", "Código", "Descripción de la Actividad", "Unidad", "Cantidad", "P.U. ($)", "Subtotal ($)", 
        "Fecha Inicio", "Duración (Días)", "Predecesor", "Ruta Crítica (CPM)"
      ]

      const rows = localRubros.map((r, idx) => [
        String(idx + 1).padStart(2, '0'),
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
        { wch: 6 }, { wch: 14 }, { wch: 45 }, { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, 
        { wch: 14 }, { wch: 16 }, { wch: 22 }, { wch: 20 },
      ]

      XLSX.utils.book_append_sheet(wb, ws, "Cronograma Valorado")
      const safeName = nombreProyecto.replace(/[^a-zA-Z0-9]/g, "_")
      XLSX.writeFile(wb, `Cronograma_Gantt_SARA_${safeName}.xlsx`)
    } catch (err: any) {
      console.error("Error al exportar Excel:", err)
      alert("Error al exportar cronograma: " + (err.message || err))
    }
  }

  // 3. DESCARGAR CRONOGRAMA VALORADO EN PDF OFICIAL (jspdf + autotable)
  const handleExportPdfGantt = () => {
    if (!localRubros || localRubros.length === 0) {
      alert("No hay rubros para exportar.")
      return
    }

    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
      const pageWidth = doc.internal.pageSize.getWidth()

      // 1. Membrete Ejecutivo Corporativo
      doc.setFillColor(15, 23, 42) // Slate-900
      doc.rect(0, 0, pageWidth, 28, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.text("GRUPO CONSTRUCTOR SARA · DIRECCIÓN DE PLANIFICACIÓN & CONTROL DE OBRAS", 14, 12)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.setTextColor(148, 163, 184) // Slate-400
      doc.text("CRONOGRAMA OFICIAL VALORADO DE EJECUCIÓN & RUTA CRÍTICA (CPM - NORMA NEC-15)", 14, 19)

      // 2. Metadatos de la Obra
      doc.setTextColor(30, 41, 59)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.text(`PROYECTO: ${nombreProyecto.toUpperCase()}`, 14, 35)
      doc.text(`INVERSIÓN TOTAL PROGRAMADA: $${Number(kpis.costoTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`, 14, 40)

      doc.text(`PLAZO CONTRACTUAL: ${kpis.totalDias} DÍAS LABORABLES`, 170, 35)
      doc.text(`FECHA DE INICIO: ${fechaInicioObra}   |   ENTREGA ESTIMADA: ${kpis.fechaFin || 'Por definir'}`, 170, 40)

      // 3. Tabla Estructurada con jsPDF AutoTable
      const columns = [
        { header: "N°", dataKey: "num" },
        { header: "CÓDIGO", dataKey: "cod" },
        { header: "ACTIVIDAD / RUBRO DE OBRA", dataKey: "rubro" },
        { header: "UND.", dataKey: "und" },
        { header: "CANT.", dataKey: "cant" },
        { header: "P.U. ($)", dataKey: "pu" },
        { header: "SUBTOTAL ($)", dataKey: "subtotal" },
        { header: "INICIO", dataKey: "inicio" },
        { header: "DÍAS", dataKey: "dias" },
        { header: "ESTADO CPM", dataKey: "cpm" }
      ]

      const rows = localRubros.map((r, idx) => {
        const isCrit = criticalTaskIds.has(r.id)
        return {
          num: String(idx + 1).padStart(2, '0'),
          cod: r.codigo_rubro || `R-${idx + 1}`,
          rubro: r.nombre_rubro,
          und: r.unidad || 'u',
          cant: Number(r.cantidad_obra || 0).toFixed(2),
          pu: `$${Number(r.precio_unitario_snapshot || 0).toFixed(2)}`,
          subtotal: `$${Number(r.subtotal || 0).toFixed(2)}`,
          inicio: r.fecha_inicio || '-',
          dias: `${r.duracion_dias || 1} d`,
          cpm: isCrit ? "CRÍTICA" : "Normal"
        }
      })

      autoTable(doc, {
        startY: 45,
        columns,
        body: rows,
        theme: "grid",
        styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.5 },
        columnStyles: {
          num: { cellWidth: 10, halign: "center" },
          cod: { cellWidth: 20, fontStyle: "bold" },
          rubro: { cellWidth: 90 },
          und: { cellWidth: 12, halign: "center" },
          cant: { cellWidth: 16, halign: "right" },
          pu: { cellWidth: 20, halign: "right" },
          subtotal: { cellWidth: 24, halign: "right", fontStyle: "bold" },
          inicio: { cellWidth: 24, halign: "center" },
          dias: { cellWidth: 14, halign: "center" },
          cpm: { cellWidth: 22, halign: "center" },
        },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.dataKey === "cpm") {
            if (data.cell.raw === "CRÍTICA") {
              data.cell.styles.textColor = [220, 38, 38] // Red-600
              data.cell.styles.fontStyle = "bold"
            }
          }
        }
      })

      // 4. Bloque de Firmas de Responsabilidad Técnica
      const finalY = (doc as any).lastAutoTable?.finalY || 160
      if (finalY < 175) {
        doc.line(20, finalY + 25, 80, finalY + 25)
        doc.setFontSize(8); doc.text("ING. DIRECTOR DE OBRA", 30, finalY + 30)
        doc.text("GRUPO SARA CONSTRUCTORA", 28, finalY + 34)

        doc.line(110, finalY + 25, 170, finalY + 25)
        doc.text("ING. RESIDENTE DE OBRA", 122, finalY + 30)
        doc.text("RESPONSABLE DE FRENTE", 123, finalY + 34)

        doc.line(200, finalY + 25, 260, finalY + 25)
        doc.text("FISCALIZADOR TÉCNICO", 215, finalY + 30)
        doc.text("APROBACIÓN DE AVANCE", 214, finalY + 34)
      }

      const safeName = nombreProyecto.replace(/[^a-zA-Z0-9]/g, "_")
      doc.save(`Cronograma_Oficial_${safeName}.pdf`)
    } catch (err: any) {
      console.error("Error al generar PDF:", err)
      alert("Error al generar PDF del cronograma: " + (err.message || err))
    }
  }

  // 4. DESCARGAR FICHA TÉCNICA DE ACTIVIDAD INDIVIDUAL EN PDF
  const handleExportTaskDetailPdf = (rubro: any) => {
    if (!rubro) return
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const faseInfo = clasificarFase(rubro.nombre_rubro, rubro.capitulo)
      const insumos = rubrosRecipes[rubro.id] || []
      const cantidad = Number(rubro.cantidad_obra || 1)

      // Encabezado
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, 210, 25, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text("GRUPO CONSTRUCTOR SARA · FICHA TÉCNICA Y ORDEN DE TRABAJO", 14, 11)
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      doc.text(`PROYECTO: ${nombreProyecto.toUpperCase()} · PLANIFICACIÓN SARA-CRONOS`, 14, 18)

      // Datos de la Actividad
      doc.setTextColor(30, 41, 59)
      doc.setFontSize(13)
      doc.setFont("helvetica", "bold")
      doc.text(rubro.nombre_rubro, 14, 34)

      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text(`Código: ${rubro.codigo_rubro || 'RUB-00'}   |   Capítulo: ${rubro.capitulo || 'General'}`, 14, 40)
      doc.text(`Cantidad de Obra: ${Number(rubro.cantidad_obra).toFixed(2)} ${rubro.unidad}   |   P.U.: $${Number(rubro.precio_unitario_snapshot || 0).toFixed(2)}   |   Total: $${Number(rubro.subtotal || 0).toFixed(2)} USD`, 14, 46)
      doc.text(`Fecha Inicio Programada: ${rubro.fecha_inicio || '-'}   |   Duración: ${rubro.duracion_dias || 1} días laborables`, 14, 52)

      // Procedimiento
      doc.setFillColor(241, 245, 249)
      doc.roundedRect(14, 57, 182, 22, 2, 2, "F")
      doc.setFont("helvetica", "bold")
      doc.text("PROCEDIMIENTO CONSTRUCTIVO / QUÉ SE REALIZARÁ:", 18, 63)
      doc.setFont("helvetica", "normal")
      const procLines = doc.splitTextToSize(faseInfo.procedimiento, 174)
      doc.text(procLines, 18, 69)

      // Tabla de Insumos Requeridos
      const insumoRows = insumos.map((i: any) => {
        const cantTotal = Number(i.cantidad) * cantidad
        const subt = cantTotal * Number(i.precio_sin_iva_snapshot || 0)
        return [
          (i.insumo?.tipo || 'Insumo').toUpperCase(),
          i.insumo?.nombre || 'Insumo sin nombre',
          i.insumo?.unidad || 'u',
          cantTotal.toFixed(2),
          `$${Number(i.precio_sin_iva_snapshot || 0).toFixed(2)}`,
          `$${subt.toFixed(2)}`
        ]
      })

      if (insumoRows.length > 0) {
        autoTable(doc, {
          startY: 84,
          head: [["CATEGORÍA", "INSUMO / RECURSO HUMANO / EQUIPO", "UND.", "TOTAL REQUERIDO", "P. UNIT ($)", "SUBTOTAL ($)"]],
          body: insumoRows,
          theme: "grid",
          styles: { fontSize: 8 },
          headStyles: { fillColor: [44, 62, 80] }
        })
      } else {
        doc.text("No existen insumos analíticos desglosados para este rubro.", 14, 90)
      }

      // Firmas al pie
      doc.line(20, 260, 80, 260)
      doc.setFontSize(8); doc.text("RESIDENTE DE OBRA", 30, 265)
      doc.line(130, 260, 190, 260)
      doc.text("MAESTRO MAYOR DE OBRA", 138, 265)

      doc.save(`Ficha_Tecnica_${rubro.codigo_rubro || 'Rubro'}.pdf`)
    } catch (err) {
      console.error("Error al exportar ficha técnica:", err)
      alert("Error al generar ficha técnica en PDF.")
    }
  }

  // 5. CLICK EN UNA TAREA (ABRIR FICHA TÉCNICA)
  const handleOpenTaskDetail = (task: Task) => {
    const rubro = localRubros.find(r => r.id === task.id)
    if (rubro) {
      setSelectedTaskDetail(rubro)
    }
  }

  // 6. DESPLAZAMIENTO INTERACTIVO DE TAREAS (Arrastrar en Gantt)
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

    setLocalRubros(prev => prev.map(r => {
      if (r.id === task.id) {
        return { ...r, fecha_inicio: startIso, duracion_dias: duracion }
      }
      return r
    }))

    updateTaskSchedule(task.id, {
      fecha_inicio: startIso,
      duracion_dias: duracion
    }, null)

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
        
        {/* CSS INYECTADO PARA FORZAR MÁXIMO CONTRASTE Y LEGIBILIDAD EN LA TABLA DEL GANTT */}
        <style dangerouslySetInnerHTML={{ __html: `
          .gantt-root-contrast div[class*="taskListWrapper"] {
            background-color: #ffffff !important;
            border-right: 2px solid #cbd5e1 !important;
          }
          .gantt-root-contrast div[class*="taskListHeader"] {
            background-color: #f1f5f9 !important;
            border-bottom: 2px solid #cbd5e1 !important;
          }
          .gantt-root-contrast div[class*="taskListHeader"] * {
            color: #0f172a !important;
            font-weight: 800 !important;
            font-size: 11px !important;
            text-transform: uppercase !important;
          }
          .gantt-root-contrast div[class*="taskListTableRow"] {
            background-color: #ffffff !important;
            border-bottom: 1px solid #e2e8f0 !important;
            transition: background-color 0.15s ease;
          }
          .gantt-root-contrast div[class*="taskListTableRow"]:hover {
            background-color: #eff6ff !important;
            cursor: pointer;
          }
          .gantt-root-contrast div[class*="taskListTableRow"] * {
            color: #0f172a !important;
            font-weight: 700 !important;
            font-size: 11.5px !important;
          }
          .gantt-root-contrast svg text {
            fill: #1e293b !important;
            font-weight: 600 !important;
          }
        `}} />

        {/* CABECERA PRINCIPAL */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/90 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Calendar size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  Cronograma de Ejecución de Obra
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                  SARA-Cronos CPM
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Proyecto: <span className="text-slate-200 font-bold">{nombreProyecto}</span> · Secuencia técnica de obra y control de hitos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* SWITCH ENTRE GANTT E INFORME LOOKAHEAD */}
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
              <button 
                onClick={() => setActiveTab('gantt')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'gantt' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers size={13} />
                <span>Diagrama Gantt</span>
              </button>
              <button 
                onClick={() => setActiveTab('informe')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'informe' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText size={13} />
                <span>Informe Lookahead</span>
              </button>
            </div>

            {/* VISTAS DÍAS / SEMANAS / MESES */}
            <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs font-bold">
              <button 
                className={`px-2.5 py-1.5 rounded-lg transition-all ${viewMode === ViewMode.Day ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`} 
                onClick={() => setViewMode(ViewMode.Day)}
              >
                Días
              </button>
              <button 
                className={`px-2.5 py-1.5 rounded-lg transition-all ${viewMode === ViewMode.Week ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`} 
                onClick={() => setViewMode(ViewMode.Week)}
              >
                Semanas
              </button>
              <button 
                className={`px-2.5 py-1.5 rounded-lg transition-all ${viewMode === ViewMode.Month ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`} 
                onClick={() => setViewMode(ViewMode.Month)}
              >
                Meses
              </button>
            </div>

            {/* BOTÓN EXPORTAR EXCEL */}
            <button
              onClick={handleExportExcelValorado}
              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Descargar Cronograma Valorado en formato Excel (.xlsx)"
            >
              <Download size={14} />
              <span>Excel</span>
            </button>

            {/* BOTÓN DESCARGAR PDF OFICIAL */}
            <button
              onClick={handleExportPdfGantt}
              className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Descargar Cronograma Oficial en PDF de Alta Resolución"
            >
              <FileText size={14} />
              <span>Descargar PDF</span>
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
        <div className="bg-slate-950/60 border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-4">
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

        {/* FEEDBACK DEL AGENTE */}
        {aiReport && (
          <div className="bg-purple-950/40 border-b border-purple-500/30 px-4 py-2 text-xs text-purple-200 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={15} className="text-purple-400 shrink-0" />
            <span>{aiReport}</span>
          </div>
        )}

        {/* BARRA DE KPIS TÉCNICOS */}
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

        {/* ÁREA DE CONTENIDO: GANTT vs INFORME LOOKAHEAD */}
        {activeTab === 'gantt' ? (
          <div className="flex-1 overflow-auto p-3 flex flex-col bg-slate-950">
            <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Info size={13} className="text-purple-400" />
                Haz clic en cualquier barra o fila de actividad para inspeccionar su Ficha Técnica, Procedimiento, Materiales y Mano de Obra.
              </span>
              <span className="text-slate-500">
                🔴 Barra Roja = Ruta Crítica · 🔵 Barra Azul = Holgura Normal
              </span>
            </div>

            <div className="gantt-root-contrast border border-slate-800 rounded-xl bg-white flex-1 overflow-auto p-1 shadow-inner">
              {tasks.length > 0 ? (
                <Gantt
                  tasks={tasks}
                  viewMode={viewMode}
                  onDateChange={handleTaskChange}
                  onClick={handleOpenTaskDetail}
                  onDoubleClick={handleOpenTaskDetail}
                  onProgressChange={() => {}}
                  listCellWidth="340px"
                  columnWidth={viewMode === ViewMode.Day ? 60 : viewMode === ViewMode.Week ? 120 : 180}
                  locale="es"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 p-8">
                  <Layers size={36} className="text-slate-600 animate-bounce" />
                  <p className="font-bold text-slate-300">No hay rubros cargados en el presupuesto.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* TAB 2: INFORME DESCRIPTIVO Y DETALLADO (LOOKAHEAD OPERATIVO) */
          <div className="flex-1 overflow-auto p-4 flex flex-col bg-slate-950 space-y-4">
            <div className="flex items-center justify-between bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <FileText className="text-purple-400" size={16} />
                  Informe Operativo & Asignación de Recursos · {viewMode === ViewMode.Day ? 'Vista Diaria' : viewMode === ViewMode.Week ? 'Lookahead Semanal' : 'Hitos Mensuales'}
                </h3>
                <p className="text-xs text-slate-400">
                  Planificación táctica: qué se ejecuta en cada período, qué materiales deben abastecerse y qué cuadrillas operan en campo.
                </p>
              </div>
              <button
                onClick={handleExportPdfGantt}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Download size={13} />
                <span>Exportar Informe PDF</span>
              </button>
            </div>

            <div className="space-y-4">
              {periodosReporte.map((periodo, pIdx) => (
                <div key={pIdx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xs font-black">
                        {pIdx + 1}
                      </span>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">{periodo.label}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {periodo.rubros.length} Actividades
                      </span>
                    </div>
                    <div className="text-xs font-mono font-black text-emerald-400">
                      Inversión Período: ${Number(periodo.costo).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {periodo.rubros.map((rubro: any) => {
                      const faseInfo = clasificarFase(rubro.nombre_rubro, rubro.capitulo)
                      const insumos = rubrosRecipes[rubro.id] || []
                      const mats = insumos.filter((i: any) => (i.insumo?.tipo || '').toLowerCase().includes('mat'))
                      const mo = insumos.filter((i: any) => (i.insumo?.tipo || '').toLowerCase().includes('mano') || (i.insumo?.tipo || '').toLowerCase().includes('obr'))
                      const eq = insumos.filter((i: any) => (i.insumo?.tipo || '').toLowerCase().includes('equipo') || (i.insumo?.tipo || '').toLowerCase().includes('maq'))

                      return (
                        <div 
                          key={rubro.id}
                          onClick={() => setSelectedTaskDetail(rubro)}
                          className="bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 rounded-xl p-3 flex flex-col justify-between transition-all hover:shadow-md cursor-pointer group"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <span className="text-[11px] font-black text-purple-300 group-hover:text-purple-200">
                                {String(rubro.indexGlobal).padStart(2, '0')}. {rubro.nombre_rubro}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono shrink-0">
                                {rubro.duracion_dias || 1}d
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-400 leading-relaxed mb-2.5 line-clamp-2">
                              {faseInfo.procedimiento}
                            </p>

                            {/* RESUMEN DE RECURSOS EN MINIATURA */}
                            <div className="space-y-1 text-[10px] bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                              <div className="flex items-center gap-1.5 text-slate-300">
                                <Box size={11} className="text-amber-400 shrink-0" />
                                <span className="font-semibold truncate">
                                  {mats.length > 0 ? `${mats.length} Materiales (ej: ${mats[0].insumo?.nombre})` : 'Materiales menores / estándar'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-300">
                                <Users size={11} className="text-cyan-400 shrink-0" />
                                <span className="font-semibold truncate">
                                  {mo.length > 0 ? `${mo.length} Puestos / Cuadrilla CCEC` : 'Cuadrilla de Albañilería'}
                                </span>
                              </div>
                              {eq.length > 0 && (
                                <div className="flex items-center gap-1.5 text-slate-300">
                                  <Wrench size={11} className="text-rose-400 shrink-0" />
                                  <span className="font-semibold truncate">
                                    {eq[0].insumo?.nombre}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 mt-2 text-[10px]">
                            <span className="text-slate-500">Subtotal Rubro:</span>
                            <span className="font-black text-slate-200 font-mono">${Number(rubro.subtotal || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL / DRAWER: FICHA TÉCNICA Y DESGLOSE DE RECURSOS DEL HITO */}
        {selectedTaskDetail && (() => {
          const rubro = selectedTaskDetail
          const faseInfo = clasificarFase(rubro.nombre_rubro, rubro.capitulo)
          const insumos = rubrosRecipes[rubro.id] || []
          const cantObra = Number(rubro.cantidad_obra || 1)
          const isCrit = criticalTaskIds.has(rubro.id)

          const mats = insumos.filter((i: any) => (i.insumo?.tipo || '').toLowerCase().includes('mat'))
          const mo = insumos.filter((i: any) => (i.insumo?.tipo || '').toLowerCase().includes('mano') || (i.insumo?.tipo || '').toLowerCase().includes('obr'))
          const eq = insumos.filter((i: any) => (i.insumo?.tipo || '').toLowerCase().includes('equipo') || (i.insumo?.tipo || '').toLowerCase().includes('maq'))
          const tr = insumos.filter((i: any) => (i.insumo?.tipo || '').toLowerCase().includes('trans'))

          return (
            <div className="fixed inset-0 bg-black/70 z-[110] flex items-center justify-center p-3 sm:p-6 backdrop-blur-sm animate-fade-in">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-slate-100">
                
                {/* CABECERA DE LA FICHA TÉCNICA */}
                <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isCrit ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-purple-600/20 text-purple-400 border border-purple-500/30'}`}>
                      {isCrit ? <Flame size={18} /> : <FileText size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">{rubro.codigo_rubro || 'RUB-00'}</span>
                        {isCrit && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                            Hito de Ruta Crítica (Holgura = 0)
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-black text-white leading-tight mt-0.5">
                        {rubro.nombre_rubro}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportTaskDetailPdf(rubro)}
                      className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Printer size={13} />
                      <span>Imprimir / PDF</span>
                    </button>
                    <button 
                      onClick={() => setSelectedTaskDetail(null)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* CONTENIDO DE LA FICHA TÉCNICA */}
                <div className="flex-1 overflow-auto p-5 space-y-4 text-xs">
                  
                  {/* METADATOS Y PROGRAMACIÓN */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Fecha de Inicio</span>
                      <span className="font-mono font-black text-white text-xs">{rubro.fecha_inicio || 'No programada'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Duración</span>
                      <span className="font-mono font-black text-cyan-300 text-xs">{rubro.duracion_dias || 1} Días Laborables</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Cantidad de Obra</span>
                      <span className="font-mono font-black text-amber-300 text-xs">{cantObra.toFixed(2)} {rubro.unidad}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Subtotal Presupuesto</span>
                      <span className="font-mono font-black text-emerald-400 text-xs">${Number(rubro.subtotal || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* QUÉ SE VA A HACER AHÍ: PROCEDIMIENTO CONSTRUCTIVO */}
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                    <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} className="text-purple-400" />
                      ¿Qué se va a hacer aquí? (Procedimiento Constructivo)
                    </h4>
                    <p className="text-slate-300 leading-relaxed text-xs">
                      {faseInfo.procedimiento}
                    </p>
                  </div>

                  {/* DESGLOSE DE RECURSOS HUMANOS (MANO DE OBRA CCEC) */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={14} className="text-cyan-400" />
                      Recursos Humanos & Cuadrilla Asignada ({mo.length} categorías)
                    </h4>
                    {mo.length > 0 ? (
                      <div className="border border-slate-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-800/70 text-slate-400 uppercase font-bold text-[10px]">
                            <tr>
                              <th className="p-2">Categoría Obrero</th>
                              <th className="p-2">Unidad</th>
                              <th className="p-2 text-right">Rendimiento Total</th>
                              <th className="p-2 text-right">Costo Total ($)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {mo.map((m: any) => (
                              <tr key={m.id} className="hover:bg-slate-800/30">
                                <td className="p-2 font-medium text-slate-200">{m.insumo?.nombre}</td>
                                <td className="p-2 text-slate-400">{m.insumo?.unidad}</td>
                                <td className="p-2 text-right font-mono text-cyan-300">{(Number(m.cantidad) * cantObra).toFixed(2)}</td>
                                <td className="p-2 text-right font-mono font-bold text-slate-100">${((Number(m.cantidad) * cantObra) * Number(m.precio_sin_iva_snapshot || 0)).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-slate-500 italic text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800/60">
                        Cuadrilla técnica estándar de albañilería (1 Maestro + 2 Peones) estimada según rendimiento de obra.
                      </p>
                    )}
                  </div>

                  {/* DESGLOSE DE MATERIALES E INSUMOS */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Box size={14} className="text-amber-400" />
                      Materiales & Suministros Requeridos en Bodega ({mats.length} insumos)
                    </h4>
                    {mats.length > 0 ? (
                      <div className="border border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-800/70 text-slate-400 uppercase font-bold text-[10px] sticky top-0">
                            <tr>
                              <th className="p-2">Material</th>
                              <th className="p-2">Unidad</th>
                              <th className="p-2 text-right">Total a Comprar</th>
                              <th className="p-2 text-right">P.U. ($)</th>
                              <th className="p-2 text-right">Subtotal ($)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {mats.map((m: any) => {
                              const totalReq = Number(m.cantidad) * cantObra
                              const subtotalReq = totalReq * Number(m.precio_sin_iva_snapshot || 0)
                              return (
                                <tr key={m.id} className="hover:bg-slate-800/30">
                                  <td className="p-2 font-medium text-slate-200">{m.insumo?.nombre}</td>
                                  <td className="p-2 text-slate-400">{m.insumo?.unidad}</td>
                                  <td className="p-2 text-right font-mono font-bold text-amber-300">{totalReq.toFixed(2)}</td>
                                  <td className="p-2 text-right font-mono text-slate-400">${Number(m.precio_sin_iva_snapshot || 0).toFixed(2)}</td>
                                  <td className="p-2 text-right font-mono font-bold text-slate-100">${subtotalReq.toFixed(2)}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-slate-500 italic text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800/60">
                        Insumos estándar asignados desde catálogo maestro.
                      </p>
                    )}
                  </div>

                  {/* MAQUINARIA, EQUIPOS Y TRANSPORTE */}
                  {(eq.length > 0 || tr.length > 0) && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Wrench size={14} className="text-rose-400" />
                        Equipos, Maquinaria & Logística de Fletes
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {eq.map((e: any) => (
                          <div key={e.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                            <span className="text-slate-300 font-medium">{e.insumo?.nombre}</span>
                            <span className="font-mono text-rose-300 font-bold">{((Number(e.cantidad) * cantObra)).toFixed(2)} {e.insumo?.unidad}</span>
                          </div>
                        ))}
                        {tr.map((t: any) => (
                          <div key={t.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                            <span className="text-slate-300 font-medium">{t.insumo?.nombre}</span>
                            <span className="font-mono text-cyan-300 font-bold">{((Number(t.cantidad) * cantObra)).toFixed(2)} {t.insumo?.unidad}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* PIE DEL MODAL DE DETALLE */}
                <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => setSelectedTaskDetail(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                  >
                    Entendido / Cerrar Ficha
                  </button>
                </div>
              </div>
            </div>
          )
        })()}

      </div>
    </div>
  )
}