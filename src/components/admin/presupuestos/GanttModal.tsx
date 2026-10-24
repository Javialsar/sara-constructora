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
  Printer,
  Table,
  Pin,
  Bookmark,
  Plus,
  Minus,
  Search,
  Eye,
  ArrowUpRight,
  Check,
  Activity
} from "lucide-react"
import { Gantt, Task, ViewMode } from "gantt-task-react"
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
  const [activeTab, setActiveTab] = useState<'msproject' | 'gantt' | 'curva_s' | 'informe'>('msproject')
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

  // Herramientas Especialistas de Microsoft Project
  const [baselineTasks, setBaselineTasks] = useState<Record<string, { start: string; duration: number }> | null>(null)
  const [baselineDate, setBaselineDate] = useState<string | null>(null)
  const [msSearch, setMsSearch] = useState<string>("")
  const [msChapterFilter, setMsChapterFilter] = useState<string>("todos")
  const [onlyCriticalFilter, setOnlyCriticalFilter] = useState<boolean>(false)

  // Referencia y altura computada para el contenedor del Gantt y barra horizontal
  const ganttContainerRef = React.useRef<HTMLDivElement>(null)
  const [computedGanttHeight, setComputedGanttHeight] = useState<number>(460)
  const [timelineScrollPct, setTimelineScrollPct] = useState<number>(0)

  // Medir dinámicamente el alto disponible para que la barra horizontal quede visible en la parte inferior
  useEffect(() => {
    if (!isOpen || activeTab !== 'gantt') return
    const updateHeight = () => {
      if (ganttContainerRef.current) {
        const h = ganttContainerRef.current.clientHeight
        if (h > 120) {
          setComputedGanttHeight(Math.max(260, h - 70))
        }
      }
    }
    const t = setTimeout(updateHeight, 200)
    window.addEventListener('resize', updateHeight)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', updateHeight)
    }
  }, [isOpen, activeTab, viewMode])

  // Sincronizar el scrubber horizontal con el scroll del Gantt
  useEffect(() => {
    if (!isOpen || activeTab !== 'gantt') return
    const timer = setTimeout(() => {
      const scrollEl = document.querySelector('.gantt-root-contrast [class*="_2k9Ys"]') as HTMLDivElement 
        || document.querySelector('.gantt-root-contrast div[class*="scrollWrapper"]') as HTMLDivElement
      if (scrollEl) {
        const handleScroll = () => {
          const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth
          if (maxScroll > 0) {
            setTimelineScrollPct(Math.round((scrollEl.scrollLeft / maxScroll) * 100))
          }
        }
        scrollEl.addEventListener('scroll', handleScroll)
        return () => scrollEl.removeEventListener('scroll', handleScroll)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [isOpen, activeTab, viewMode, localRubros])

  const scrollGanttHorizontal = (direction: 'start' | 'prev' | 'next' | 'end' | number) => {
    const scrollEl = document.querySelector('.gantt-root-contrast [class*="_2k9Ys"]') as HTMLDivElement 
      || document.querySelector('.gantt-root-contrast div[class*="scrollWrapper"]') as HTMLDivElement
    if (!scrollEl) return

    const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth
    if (typeof direction === 'number') {
      scrollEl.scrollLeft = (direction / 100) * maxScroll
    } else if (direction === 'start') {
      scrollEl.scrollLeft = 0
    } else if (direction === 'end') {
      scrollEl.scrollLeft = maxScroll
    } else if (direction === 'prev') {
      scrollEl.scrollLeft = Math.max(0, scrollEl.scrollLeft - 240)
    } else if (direction === 'next') {
      scrollEl.scrollLeft = Math.min(maxScroll, scrollEl.scrollLeft + 240)
    }
  }

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

  // Lista de Capítulos disponibles para filtro WBS
  const capitulosDisponibles = useMemo(() => {
    const setCaps = new Set<string>()
    localRubros.forEach(r => {
      if (r.capitulo) setCaps.add(r.capitulo)
    })
    return Array.from(setCaps)
  }, [localRubros])

  // Rubros filtrados para la Hoja de Tareas estilo Microsoft Project
  const filteredRubrosMSProject = useMemo(() => {
    return localRubros.filter((r) => {
      if (onlyCriticalFilter && !criticalTaskIds.has(r.id)) return false
      if (msChapterFilter !== 'todos' && r.capitulo !== msChapterFilter) return false
      if (msSearch.trim()) {
        const q = msSearch.toLowerCase()
        const matchNom = (r.nombre_rubro || '').toLowerCase().includes(q)
        const matchCod = (r.codigo_rubro || '').toLowerCase().includes(q)
        if (!matchNom && !matchCod) return false
      }
      return true
    })
  }, [localRubros, onlyCriticalFilter, criticalTaskIds, msChapterFilter, msSearch])

  // Datos analíticos de Curva S (EVM - Planned Value Acumulado)
  const curvaSData = useMemo(() => {
    if (!localRubros || localRubros.length === 0) {
      return { points: [], totalCost: granTotal || 1, minTime: 0, maxTime: 0 }
    }
    const totalCost = Number(kpis.costoTotal) || 1
    const sorted = [...localRubros].sort((a, b) => {
      const da = a.fecha_inicio ? new Date(a.fecha_inicio + 'T00:00:00').getTime() : 0
      const db = b.fecha_inicio ? new Date(b.fecha_inicio + 'T00:00:00').getTime() : 0
      return da - db
    })

    let minTime = Infinity
    let maxTime = -Infinity
    sorted.forEach(r => {
      const s = r.fecha_inicio ? new Date(r.fecha_inicio + 'T00:00:00').getTime() : new Date().getTime()
      const dur = Math.max(1, parseInt(r.duracion_dias) || 1)
      const e = s + (dur * 86400000)
      if (s < minTime) minTime = s
      if (e > maxTime) maxTime = e
    })

    if (minTime >= maxTime) maxTime = minTime + (30 * 86400000)
    const totalSpan = maxTime - minTime

    const numSamples = 12
    const points: { x: number; y: number; pctTime: number; pctCost: number; costAccum: number; dateStr: string }[] = []

    for (let i = 0; i <= numSamples; i++) {
      const curTime = minTime + (totalSpan * (i / numSamples))
      const curDate = new Date(curTime)
      let costAccum = 0

      sorted.forEach(r => {
        const s = r.fecha_inicio ? new Date(r.fecha_inicio + 'T00:00:00').getTime() : minTime
        const dur = Math.max(1, (parseInt(r.duracion_dias) || 1)) * 86400000
        const e = s + dur
        const subtotal = Number(r.subtotal) || 0

        if (curTime >= e) {
          costAccum += subtotal
        } else if (curTime > s) {
          const frac = (curTime - s) / dur
          costAccum += subtotal * frac
        }
      })

      const pctCost = Math.min(100, Number(((costAccum / totalCost) * 100).toFixed(1)))
      points.push({
        x: Number((i * (100 / numSamples)).toFixed(1)),
        y: Number((100 - pctCost).toFixed(1)),
        pctTime: Math.round((i / numSamples) * 100),
        pctCost,
        costAccum: Math.round(costAccum),
        dateStr: curDate.toLocaleDateString('es-EC', { month: 'short', day: 'numeric' })
      })
    }

    return { points, totalCost, minTime, maxTime }
  }, [localRubros, kpis.costoTotal, granTotal])

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

  // 2.5. EXPORTAR A MICROSOFT PROJECT NATIVO (.XML COMPATIBLE 2016-365)
  const handleExportMSProjectXML = () => {
    if (!localRubros || localRubros.length === 0) {
      alert("No hay tareas en el cronograma para exportar a Microsoft Project.")
      return
    }

    const startDateIso = fechaInicioObra ? `${fechaInicioObra}T08:00:00` : new Date().toISOString()
    const safeName = (nombreProyecto || "Proyecto").replace(/[^a-zA-Z0-9]/g, "_")
    
    let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`
    xml += `<Project xmlns="http://schemas.microsoft.com/project">\n`
    xml += `  <Name>${(nombreProyecto || "Proyecto").replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Name>\n`
    xml += `  <Title>Cronograma Oficial SARA-Cronos CPM</Title>\n`
    xml += `  <Company>GRUPO CONSTRUCTOR SARA</Company>\n`
    xml += `  <StartDate>${startDateIso}</StartDate>\n`
    xml += `  <CurrencySymbol>$</CurrencySymbol>\n`
    xml += `  <Tasks>\n`

    localRubros.forEach((r, idx) => {
      const uid = idx + 1
      const taskStart = r.fecha_inicio ? `${r.fecha_inicio}T08:00:00` : startDateIso
      const durDias = Math.max(1, parseInt(r.duracion_dias) || 1)
      const endDate = new Date(taskStart)
      endDate.setDate(endDate.getDate() + durDias)
      const taskEnd = `${endDate.toISOString().split('T')[0]}T17:00:00`
      const isCrit = criticalTaskIds.has(r.id) ? 1 : 0
      const cost = Number(r.subtotal || 0).toFixed(2)

      const predIdx = r.predecesores ? localRubros.findIndex((p: any) => p.id === r.predecesores) : -1
      const predUID = predIdx >= 0 ? predIdx + 1 : null

      xml += `    <Task>\n`
      xml += `      <UID>${uid}</UID>\n`
      xml += `      <ID>${uid}</ID>\n`
      xml += `      <Name>${String(r.nombre_rubro || 'Actividad').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Name>\n`
      xml += `      <Type>0</Type>\n`
      xml += `      <IsNull>0</IsNull>\n`
      xml += `      <Start>${taskStart}</Start>\n`
      xml += `      <Finish>${taskEnd}</Finish>\n`
      xml += `      <Duration>PT${durDias * 8}H0M0S</Duration>\n`
      xml += `      <DurationFormat>7</DurationFormat>\n`
      xml += `      <Work>PT${durDias * 8}H0M0S</Work>\n`
      xml += `      <Cost>${cost}</Cost>\n`
      xml += `      <Critical>${isCrit}</Critical>\n`
      xml += `      <PercentComplete>0</PercentComplete>\n`
      if (predUID) {
        xml += `      <PredecessorLink>\n`
        xml += `        <PredecessorUID>${predUID}</PredecessorUID>\n`
        xml += `        <Type>1</Type>\n`
        xml += `        <CrossProject>0</CrossProject>\n`
        xml += `      </PredecessorLink>\n`
      }
      xml += `    </Task>\n`
    })

    xml += `  </Tasks>\n`
    xml += `</Project>\n`

    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Cronograma_MSProject_${safeName}.xml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 2.6. FIJAR LÍNEA BASE (BASELINE 0) ESTILO MS PROJECT
  const handleSetBaseline = () => {
    if (!localRubros || localRubros.length === 0) return
    const map: Record<string, { start: string; duration: number }> = {}
    localRubros.forEach(r => {
      map[r.id] = {
        start: r.fecha_inicio || fechaInicioObra,
        duration: Math.max(1, parseInt(r.duracion_dias) || 1)
      }
    })
    setBaselineTasks(map)
    const nowStr = new Date().toLocaleDateString('es-EC', { dateStyle: 'short', timeStyle: 'short' })
    setBaselineDate(nowStr)
    alert(`📌 ¡Línea Base 0 establecida con éxito!\nSe capturó el plazo contractual para ${localRubros.length} tareas.\nFecha de fijación: ${nowStr}.`)
  }

  // 2.7. AJUSTAR DURACIÓN O INICIO DIRECTAMENTE EN HOJA MS PROJECT
  const handleTaskFieldChange = (id: string, field: 'fecha_inicio' | 'duracion_dias' | 'predecesores', value: any) => {
    const target = localRubros.find(r => r.id === id)
    if (!target) return

    let finalVal = value
    if (field === 'duracion_dias') {
      finalVal = Math.max(1, parseInt(value) || 1)
    }

    const updated = { ...target, [field]: finalVal }
    setLocalRubros(prev => prev.map(r => r.id === id ? updated : r))

    updateTaskSchedule(id, {
      [field]: finalVal
    }, null)
  }

  const handleAdjustDuration = (id: string, delta: number) => {
    const target = localRubros.find(r => r.id === id)
    if (!target) return
    const currentDur = parseInt(target.duracion_dias) || 1
    const newDur = Math.max(1, currentDur + delta)
    handleTaskFieldChange(id, 'duracion_dias', newDur)
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

  // 3.1. DESCARGAR INFORME OPERATIVO COMPLETO LOOKAHEAD EN PDF (Días, Semanas o Meses)
  const handleExportInformeLookaheadPdf = () => {
    if (!localRubros || localRubros.length === 0) {
      alert("No hay actividades cargadas para exportar el informe.")
      return
    }

    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      const modoTexto = viewMode === ViewMode.Day 
        ? "PROGRAMACIÓN DIARIA DE OBRA" 
        : viewMode === ViewMode.Week 
        ? "LOOKAHEAD SEMANAL OPERATIVO" 
        : "PLANIFICACIÓN MENSUAL DE HITOS"

      // 1. Membrete Ejecutivo Corporativo SARA
      doc.setFillColor(15, 23, 42) // Slate-900
      doc.rect(0, 0, pageWidth, 28, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(13)
      doc.text("GRUPO CONSTRUCTOR SARA · DIRECCIÓN TÉCNICA DE OPERACIONES", 14, 11)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.setTextColor(168, 85, 247) // Purple-400
      doc.text(`INFORME OPERATIVO DETALLADO · ${modoTexto}`, 14, 18)

      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184) // Slate-400
      doc.text(`Asignación de Personal Técnico, Materiales para Bodega, Maquinaria y Procedimientos`, 14, 23)

      // 2. Metadatos de la Obra
      doc.setTextColor(30, 41, 59)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.text(`PROYECTO: ${nombreProyecto.toUpperCase()}`, 14, 34)
      doc.setFont("helvetica", "normal")
      doc.text(`Presupuesto Total: $${Number(kpis.costoTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD  |  Plazo: ${kpis.totalDias} días laborables`, 14, 39)
      doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-EC', { dateStyle: 'full' })}`, 14, 44)

      let currentY = 48

      // Recorrer cada período de reporte
      periodosReporte.forEach((periodo, pIdx) => {
        // Verificar espacio para el banner del período
        if (currentY > pageHeight - 45) {
          doc.addPage()
          currentY = 20
        }

        // Banner del Período
        doc.setFillColor(88, 28, 135) // Purple-900
        doc.roundedRect(14, currentY, pageWidth - 28, 9, 1.5, 1.5, "F")
        doc.setTextColor(255, 255, 255)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.text(`PERÍODO ${pIdx + 1}: ${periodo.label.toUpperCase()}`, 18, currentY + 6)

        doc.setFont("helvetica", "bold")
        doc.setFontSize(8.5)
        doc.text(`Inversión Período: $${Number(periodo.costo).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD  |  ${periodo.rubros.length} Actividades`, pageWidth - 20, currentY + 6, { align: "right" })

        currentY += 12

        // A. Tabla de Actividades y Procedimiento Constructivo
        const actRows = periodo.rubros.map((r: any) => {
          const faseInfo = clasificarFase(r.nombre_rubro, r.capitulo)
          return [
            String(r.indexGlobal).padStart(2, '0'),
            r.codigo_rubro || `R-${r.indexGlobal}`,
            r.nombre_rubro,
            `${Number(r.cantidad_obra || 1).toFixed(2)} ${r.unidad || 'u'}`,
            `${r.duracion_dias || 1} d`,
            faseInfo.procedimiento
          ]
        })

        autoTable(doc, {
          startY: currentY,
          head: [["N°", "CÓDIGO", "ACTIVIDAD / FRENTE DE TRABAJO", "CANT.", "DÍAS", "PROCEDIMIENTO TÉCNICO CONSTRUCTIVO"]],
          body: actRows,
          theme: "grid",
          styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
          headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7 },
          columnStyles: {
            0: { cellWidth: 8, halign: "center" },
            1: { cellWidth: 16, fontStyle: "bold" },
            2: { cellWidth: 42, fontStyle: "bold" },
            3: { cellWidth: 16, halign: "right" },
            4: { cellWidth: 12, halign: "center" },
            5: { cellWidth: 88, textColor: [71, 85, 105] }, // Slate-600
          },
          margin: { left: 14, right: 14 }
        })

        currentY = (doc as any).lastAutoTable?.finalY + 4

        // B. Consolidación de Recursos Requeridos para este Período
        const matMap = new Map<string, { nombre: string; unidad: string; cant: number; costo: number }>()
        const moMap = new Map<string, { nombre: string; unidad: string; cant: number; costo: number }>()
        const eqMap = new Map<string, { nombre: string; unidad: string; cant: number; costo: number }>()

        periodo.rubros.forEach((rubro: any) => {
          const insumos = rubrosRecipes[rubro.id] || []
          const cantObra = Number(rubro.cantidad_obra) || 1

          insumos.forEach((i: any) => {
            const tipo = (i.insumo?.tipo || '').toLowerCase()
            const nombre = i.insumo?.nombre || 'Insumo sin nombre'
            const unidad = i.insumo?.unidad || 'u'
            const cantTotal = Number(i.cantidad || 0) * cantObra
            const pu = Number(i.precio_sin_iva_snapshot || 0)
            const subtotal = cantTotal * pu

            if (tipo.includes('mat')) {
              const existing = matMap.get(nombre) || { nombre, unidad, cant: 0, costo: 0 }
              existing.cant += cantTotal
              existing.costo += subtotal
              matMap.set(nombre, existing)
            } else if (tipo.includes('mano') || tipo.includes('obr')) {
              const existing = moMap.get(nombre) || { nombre, unidad, cant: 0, costo: 0 }
              existing.cant += cantTotal
              existing.costo += subtotal
              moMap.set(nombre, existing)
            } else if (tipo.includes('equipo') || tipo.includes('maq')) {
              const existing = eqMap.get(nombre) || { nombre, unidad, cant: 0, costo: 0 }
              existing.cant += cantTotal
              existing.costo += subtotal
              eqMap.set(nombre, existing)
            }
          })
        })

        const resourceRows: any[] = []

        // 1. Mano de Obra
        if (moMap.size > 0) {
          Array.from(moMap.values()).forEach((item) => {
            resourceRows.push([
              "MANO DE OBRA / CUADRILLA",
              item.nombre,
              item.unidad,
              item.cant.toFixed(2),
              `$${item.costo.toFixed(2)}`
            ])
          })
        } else {
          resourceRows.push([
            "MANO DE OBRA",
            "Cuadrilla técnica estándar de albañilería / peones según avance",
            "jornal",
            "-",
            "Incluido en P.U."
          ])
        }

        // 2. Materiales en Bodega
        if (matMap.size > 0) {
          Array.from(matMap.values()).forEach((item) => {
            resourceRows.push([
              "MATERIAL (DESPACHO BODEGA)",
              item.nombre,
              item.unidad,
              item.cant.toFixed(2),
              `$${item.costo.toFixed(2)}`
            ])
          })
        } else {
          resourceRows.push([
            "MATERIAL",
            "Materiales e insumos menores especificados en planos",
            "global",
            "-",
            "Por stock"
          ])
        }

        // 3. Maquinaria & Equipos
        if (eqMap.size > 0) {
          Array.from(eqMap.values()).forEach((item) => {
            resourceRows.push([
              "MAQUINARIA & EQUIPO",
              item.nombre,
              item.unidad,
              item.cant.toFixed(2),
              `$${item.costo.toFixed(2)}`
            ])
          })
        }

        // Verificar espacio antes de imprimir la tabla de recursos
        if (currentY > pageHeight - 35) {
          doc.addPage()
          currentY = 20
        }

        autoTable(doc, {
          startY: currentY,
          head: [["CATEGORÍA", "RECURSO (PERSONAL / MATERIAL EN BODEGA / MAQUINARIA)", "UND.", "TOTAL REQUERIDO", "VALOR ESTIMADO ($)"]],
          body: resourceRows,
          theme: "striped",
          styles: { fontSize: 6.5, cellPadding: 1.8, textColor: [30, 41, 59] },
          headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7 },
          columnStyles: {
            0: { cellWidth: 42, fontStyle: "bold" },
            1: { cellWidth: 84 },
            2: { cellWidth: 14, halign: "center" },
            3: { cellWidth: 22, halign: "right", fontStyle: "bold" },
            4: { cellWidth: 20, halign: "right" },
          },
          margin: { left: 14, right: 14 },
          didParseCell: (data) => {
            if (data.section === "body" && data.column.dataKey === 0) {
              const val = String(data.cell.raw || '')
              if (val.includes("MANO")) {
                data.cell.styles.textColor = [8, 145, 178] // Cyan-600
              } else if (val.includes("MATERIAL")) {
                data.cell.styles.textColor = [217, 119, 6] // Amber-600
              } else if (val.includes("MAQUINARIA")) {
                data.cell.styles.textColor = [225, 29, 72] // Rose-600
              }
            }
          }
        })

        currentY = (doc as any).lastAutoTable?.finalY + 8
      })

      // Bloque final de Firmas Técnicas de Responsabilidad
      if (currentY > pageHeight - 40) {
        doc.addPage()
        currentY = 30
      } else {
        currentY = Math.max(currentY + 10, pageHeight - 35)
      }

      doc.setDrawColor(148, 163, 184)
      doc.setLineWidth(0.3)

      doc.line(14, currentY, 56, currentY)
      doc.setFontSize(7); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 59)
      doc.text("ING. RESIDENTE DE OBRA", 18, currentY + 4)
      doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139)
      doc.text("Dirección & Frente Técnico", 16, currentY + 7.5)

      doc.line(64, currentY, 106, currentY)
      doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 59)
      doc.text("MAESTRO MAYOR DE OBRA", 68, currentY + 4)
      doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139)
      doc.text("Asignación de Cuadrillas", 68, currentY + 7.5)

      doc.line(114, currentY, 156, currentY)
      doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 59)
      doc.text("BODEGA & LOGÍSTICA", 122, currentY + 4)
      doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139)
      doc.text("Despacho de Materiales", 120, currentY + 7.5)

      doc.line(164, currentY, 196, currentY)
      doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 59)
      doc.text("FISCALIZADOR", 172, currentY + 4)
      doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139)
      doc.text("Aprobación Semanal", 169, currentY + 7.5)

      const safeName = nombreProyecto.replace(/[^a-zA-Z0-9]/g, "_")
      doc.save(`Informe_Operativo_Lookahead_${safeName}.pdf`)
    } catch (err: any) {
      console.error("Error al exportar Informe Lookahead en PDF:", err)
      alert("Error al generar Informe Lookahead: " + (err.message || err))
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
        
        {/* CSS INYECTADO PARA FORZAR MÁXIMO CONTRASTE Y LEGIBILIDAD EN LA TABLA DEL GANTT (IMAGEN 2) */}
        <style dangerouslySetInnerHTML={{ __html: `
          .gantt-root-contrast {
            background-color: #ffffff !important;
            color: #0f172a !important;
          }
          .gantt-root-contrast * {
            color: #0f172a !important;
          }
          .gantt-root-contrast div[class*="taskListWrapper"],
          .gantt-root-contrast > div > div:first-child {
            background-color: #ffffff !important;
            border-right: 2px solid #cbd5e1 !important;
          }
          .gantt-root-contrast div[class*="taskListHeader"],
          .gantt-root-contrast > div > div:first-child > div:first-child {
            background-color: #f1f5f9 !important;
            border-bottom: 2px solid #cbd5e1 !important;
          }
          .gantt-root-contrast div[class*="taskListHeader"] *,
          .gantt-root-contrast > div > div:first-child > div:first-child * {
            color: #0f172a !important;
            font-weight: 800 !important;
            font-size: 11px !important;
            text-transform: uppercase !important;
          }
          .gantt-root-contrast div[class*="taskListTableRow"],
          .gantt-root-contrast div[class*="Row"],
          .gantt-root-contrast div[class*="_3lLk3"],
          .gantt-root-contrast div[class*="_34SS0"] > div {
            background-color: #ffffff !important;
            border-bottom: 1px solid #e2e8f0 !important;
            transition: background-color 0.15s ease;
          }
          .gantt-root-contrast div[class*="taskListTableRow"]:nth-child(even),
          .gantt-root-contrast div[class*="Row"]:nth-child(even),
          .gantt-root-contrast div[class*="_3lLk3"]:nth-child(even) {
            background-color: #f8fafc !important;
          }
          .gantt-root-contrast div[class*="taskListTableRow"]:hover,
          .gantt-root-contrast div[class*="Row"]:hover,
          .gantt-root-contrast div[class*="_3lLk3"]:hover {
            background-color: #eff6ff !important;
            cursor: pointer;
          }
          .gantt-root-contrast div[class*="taskListTableRow"] *,
          .gantt-root-contrast div[class*="Row"] *,
          .gantt-root-contrast div[class*="_3lLk3"] * {
            color: #0f172a !important;
            font-weight: 700 !important;
            font-size: 11.5px !important;
          }
          .gantt-root-contrast svg text {
            fill: #0f172a !important;
            font-weight: 700 !important;
          }
          /* BARRA DE DESPLAZAMIENTO HORIZONTAL (PARTE INFERIOR) */
          .gantt-root-contrast div[class*="scrollWrapper"],
          .gantt-root-contrast [class*="_2k9Ys"] {
            background-color: #f1f5f9 !important;
            border-top: 2px solid #64748b !important;
            border-bottom: 1px solid #cbd5e1 !important;
            height: 22px !important;
            min-height: 22px !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: sticky !important;
            bottom: 0 !important;
            z-index: 40 !important;
          }
          .gantt-root-contrast div[class*="scrollWrapper"]::-webkit-scrollbar,
          .gantt-root-contrast [class*="_2k9Ys"]::-webkit-scrollbar {
            height: 14px !important;
            background-color: #e2e8f0 !important;
          }
          .gantt-root-contrast div[class*="scrollWrapper"]::-webkit-scrollbar-track,
          .gantt-root-contrast [class*="_2k9Ys"]::-webkit-scrollbar-track {
            background-color: #e2e8f0 !important;
            border-radius: 4px !important;
          }
          .gantt-root-contrast div[class*="scrollWrapper"]::-webkit-scrollbar-thumb,
          .gantt-root-contrast [class*="_2k9Ys"]::-webkit-scrollbar-thumb {
            background-color: #2563eb !important;
            border-radius: 6px !important;
            border: 2px solid #e2e8f0 !important;
          }
          .gantt-root-contrast div[class*="scrollWrapper"]::-webkit-scrollbar-thumb:hover,
          .gantt-root-contrast [class*="_2k9Ys"]::-webkit-scrollbar-thumb:hover {
            background-color: #1d4ed8 !important;
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
                  Cronograma & Control de Obra
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                  SARA-Cronos · MS Project CPM
                </span>
                {baselineDate && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Pin size={10} /> Línea Base Activa
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Proyecto: <span className="text-slate-200 font-bold">{nombreProyecto}</span> · Planificación técnica, ruta crítica y control EVM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* PESTAÑAS: MS PROJECT, GANTT, CURVA S, INFORME */}
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
              <button 
                onClick={() => setActiveTab('msproject')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'msproject' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Hoja de tareas detallada estilo Microsoft Project (WBS, Duración, Predecesoras, Recursos)"
              >
                <Table size={13} />
                <span>Hoja MS Project</span>
              </button>
              <button 
                onClick={() => setActiveTab('gantt')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'gantt' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Diagrama de barras temporal interactivo Gantt"
              >
                <Layers size={13} />
                <span>Diagrama Gantt</span>
              </button>
              <button 
                onClick={() => setActiveTab('curva_s')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'curva_s' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Curva S de Inversión Acumulada (EVM - Planned Value)"
              >
                <TrendingUp size={13} />
                <span>Curva S (EVM)</span>
              </button>
              <button 
                onClick={() => setActiveTab('informe')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'informe' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Lookahead semanal y despacho logístico de materiales"
              >
                <FileText size={13} />
                <span>Lookahead</span>
              </button>
            </div>

            {/* VISTAS DÍAS / SEMANAS / MESES (Si está en Gantt o Lookahead) */}
            {(activeTab === 'gantt' || activeTab === 'informe') && (
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
            )}

            {/* BOTÓN: EXPORTAR A MICROSOFT PROJECT NATIVO (.XML) */}
            <button
              onClick={handleExportMSProjectXML}
              className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Descargar archivo .XML compatible directamente con Microsoft Project 2016, 2019, 2021 y Microsoft 365"
            >
              <Download size={14} className="text-indigo-400" />
              <span>MS Project (.xml)</span>
            </button>

            {/* BOTÓN: FIJAR LÍNEA BASE 0 */}
            <button
              onClick={handleSetBaseline}
              className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Guardar instantánea de fechas contractuales como Línea Base 0 para control de desviaciones"
            >
              <Pin size={14} className="text-amber-400" />
              <span>Línea Base 0</span>
            </button>

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
              <span>PDF</span>
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

        {/* ÁREA DE CONTENIDO: TAB 1: HOJA MS PROJECT */}
        {activeTab === 'msproject' && (
          <div className="flex-1 overflow-auto p-3 flex flex-col bg-slate-950 space-y-3">
            {/* BARRA DE HERRAMIENTAS MS PROJECT */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                {/* Búsqueda rápida */}
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar por nombre o código..."
                    value={msSearch}
                    onChange={(e) => setMsSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 w-56"
                  />
                  {msSearch && (
                    <button onClick={() => setMsSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Filtro por Capítulo / WBS */}
                {capitulosDisponibles.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 px-2.5 py-1 rounded-lg">
                    <span className="text-slate-400 text-[11px] font-medium">Capítulo:</span>
                    <select
                      value={msChapterFilter}
                      onChange={(e) => setMsChapterFilter(e.target.value)}
                      className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
                    >
                      <option value="todos" className="bg-slate-900 text-white">Todos los Capítulos</option>
                      {capitulosDisponibles.map(c => (
                        <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Filtro Sólo Ruta Crítica */}
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 border border-slate-700 px-2.5 py-1.5 rounded-lg select-none hover:border-slate-600 transition-all">
                  <input
                    type="checkbox"
                    checked={onlyCriticalFilter}
                    onChange={(e) => setOnlyCriticalFilter(e.target.checked)}
                    className="accent-rose-500 cursor-pointer w-3.5 h-3.5"
                  />
                  <span className="text-slate-300 font-bold text-xs flex items-center gap-1">
                    <Flame size={13} className="text-rose-400" />
                    Solo Ruta Crítica
                  </span>
                </label>
              </div>

              {/* Info de Tareas y Línea Base */}
              <div className="flex items-center gap-3 text-slate-400 text-xs">
                <span>
                  Mostrando <strong className="text-white font-mono">{filteredRubrosMSProject.length}</strong> de <strong className="text-white font-mono">{localRubros.length}</strong> tareas
                </span>
                {baselineDate && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-mono text-[11px] flex items-center gap-1">
                    <Pin size={11} /> LB0: {baselineDate}
                  </span>
                )}
              </div>
            </div>

            {/* TABLA ESTILO HOJA DE TAREAS MICROSOFT PROJECT */}
            <div className="flex-1 overflow-auto border border-slate-800 rounded-xl bg-slate-900 shadow-inner">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-300 uppercase font-black text-[10.5px] sticky top-0 z-20 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-2 text-center w-12 border-r border-slate-800">WBS</th>
                    <th className="py-2.5 px-2 text-center w-12 border-r border-slate-800" title="Modo de Programación: Automático">Modo</th>
                    <th className="py-2.5 px-2.5 w-24 border-r border-slate-800">Código</th>
                    <th className="py-2.5 px-3 min-w-[240px] border-r border-slate-800">Nombre de la Tarea</th>
                    <th className="py-2.5 px-2.5 text-center w-36 border-r border-slate-800">Duración (días)</th>
                    <th className="py-2.5 px-2.5 w-32 border-r border-slate-800">Comienzo</th>
                    <th className="py-2.5 px-2.5 w-32 border-r border-slate-800">Fin</th>
                    <th className="py-2.5 px-2.5 min-w-[140px] border-r border-slate-800">Predecesoras</th>
                    <th className="py-2.5 px-2.5 min-w-[170px] border-r border-slate-800">Nombres de Recursos</th>
                    <th className="py-2.5 px-2 text-center w-28 border-r border-slate-800">Holgura / Estado</th>
                    <th className="py-2.5 px-2 text-center w-24 border-r border-slate-800">Línea Base</th>
                    <th className="py-2.5 px-3 text-right w-28">Costo ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-medium">
                  {filteredRubrosMSProject.length > 0 ? (
                    filteredRubrosMSProject.map((r: any, idx: number) => {
                      const dur = Math.max(1, parseInt(r.duracion_dias) || 1)
                      const isCrit = criticalTaskIds.has(r.id)
                      const startStr = r.fecha_inicio || fechaInicioObra
                      const startDate = new Date(startStr + 'T00:00:00')
                      const endDate = new Date(startDate)
                      endDate.setDate(startDate.getDate() + dur)
                      const endStr = isNaN(endDate.getTime()) ? '-' : endDate.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
                      
                      const insumos = rubrosRecipes[r.id] || []
                      const mats = insumos.filter((i: any) => (i.insumo?.tipo || '').toLowerCase().includes('mat'))
                      const mo = insumos.filter((i: any) => (i.insumo?.tipo || '').toLowerCase().includes('mano') || (i.insumo?.tipo || '').toLowerCase().includes('obr'))
                      const eq = insumos.filter((i: any) => (i.insumo?.tipo || '').toLowerCase().includes('equipo') || (i.insumo?.tipo || '').toLowerCase().includes('maq'))

                      // Comparación Línea Base
                      const baseData = baselineTasks ? baselineTasks[r.id] : null
                      const durDiff = baseData ? dur - baseData.duration : null

                      return (
                        <tr 
                          key={r.id} 
                          className={`hover:bg-slate-800/50 transition-colors ${isCrit ? 'bg-rose-950/15' : idx % 2 === 0 ? 'bg-slate-900/60' : 'bg-slate-900/20'}`}
                        >
                          {/* WBS */}
                          <td className="py-2 px-2 text-center font-mono font-bold text-slate-400 border-r border-slate-800">
                            {idx + 1}
                          </td>

                          {/* Modo Tarea */}
                          <td className="py-2 px-2 text-center border-r border-slate-800" title="Auto-programada SARA CPM">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">
                              ⚡
                            </span>
                          </td>

                          {/* Código */}
                          <td className="py-2 px-2.5 font-mono text-slate-300 text-[11px] font-bold border-r border-slate-800">
                            {r.codigo_rubro || `R-${idx + 1}`}
                          </td>

                          {/* Nombre de la Tarea con botón de Ficha Técnica */}
                          <td className="py-2 px-3 border-r border-slate-800">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-white font-bold text-[11.5px] hover:text-indigo-300 transition-colors cursor-pointer" onClick={() => setSelectedTaskDetail(r)}>
                                {r.nombre_rubro}
                              </span>
                              <button
                                onClick={() => setSelectedTaskDetail(r)}
                                className="p-1 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-all shrink-0"
                                title="Ver Ficha Técnica, Procedimiento y Desglose APU"
                              >
                                <Eye size={12} />
                              </button>
                            </div>
                            {r.capitulo && (
                              <span className="text-[10px] text-slate-400 block font-normal truncate max-w-xs">
                                📁 {r.capitulo}
                              </span>
                            )}
                          </td>

                          {/* Duración con Stepper [ - ] [ input ] [ + ] */}
                          <td className="py-2 px-2 border-r border-slate-800">
                            <div className="flex items-center justify-center gap-1 bg-slate-950/90 border border-slate-700/80 rounded-lg p-0.5">
                              <button
                                onClick={() => handleAdjustDuration(r.id, -1)}
                                className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all font-bold"
                                title="Restar 1 día"
                              >
                                <Minus size={11} />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={dur}
                                onChange={(e) => handleTaskFieldChange(r.id, 'duracion_dias', e.target.value)}
                                className="w-10 text-center bg-transparent text-white font-mono font-black text-xs outline-none"
                              />
                              <span className="text-[10px] text-slate-400 pr-1">d</span>
                              <button
                                onClick={() => handleAdjustDuration(r.id, 1)}
                                className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all font-bold"
                                title="Sumar 1 día"
                              >
                                <Plus size={11} />
                              </button>
                            </div>
                          </td>

                          {/* Comienzo (Date Picker) */}
                          <td className="py-2 px-2.5 border-r border-slate-800">
                            <input
                              type="date"
                              value={startStr}
                              onChange={(e) => handleTaskFieldChange(r.id, 'fecha_inicio', e.target.value)}
                              className="bg-slate-950 border border-slate-700 text-white font-mono text-[11px] rounded px-2 py-1 outline-none w-full cursor-pointer focus:border-indigo-500 font-bold"
                            />
                          </td>

                          {/* Fin (Calculada) */}
                          <td className="py-2 px-2.5 font-mono text-slate-300 text-[11px] font-bold border-r border-slate-800">
                            {endStr}
                          </td>

                          {/* Predecesoras (Dropdown Selector) */}
                          <td className="py-2 px-2.5 border-r border-slate-800">
                            <select
                              value={r.predecesores || ""}
                              onChange={(e) => handleTaskFieldChange(r.id, 'predecesores', e.target.value || null)}
                              className="bg-slate-950 border border-slate-700 text-slate-200 text-[11px] rounded px-2 py-1 outline-none w-full cursor-pointer focus:border-indigo-500"
                            >
                              <option value="">Sin predecesora (Hito de inicio)</option>
                              {localRubros.filter(p => p.id !== r.id).map((p, pIdx) => (
                                <option key={p.id} value={p.id}>
                                  {pIdx + 1}. {p.nombre_rubro?.slice(0, 32)}... (FS)
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Nombres de Recursos (APU) */}
                          <td className="py-2 px-2.5 border-r border-slate-800">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {mo.length > 0 && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-800/40 flex items-center gap-1" title={mo.map((m: any) => m.insumo?.nombre).join(', ')}>
                                  <Users size={10} /> {mo.length} MO
                                </span>
                              )}
                              {mats.length > 0 && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950/70 text-amber-300 border border-amber-800/40 flex items-center gap-1" title={mats.map((m: any) => m.insumo?.nombre).join(', ')}>
                                  <Box size={10} /> {mats.length} Mat
                                </span>
                              )}
                              {eq.length > 0 && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950/70 text-rose-300 border border-rose-800/40 flex items-center gap-1" title={eq.map((e: any) => e.insumo?.nombre).join(', ')}>
                                  <Wrench size={10} /> {eq.length} Eq
                                </span>
                              )}
                              {insumos.length === 0 && (
                                <span className="text-slate-500 text-[10px] italic">Recursos estándar</span>
                              )}
                            </div>
                          </td>

                          {/* Holgura / Estado */}
                          <td className="py-2 px-2 text-center border-r border-slate-800">
                            {isCrit ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase animate-pulse">
                                RUTA CRÍTICA (0d)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                                Holgura &gt; 0
                              </span>
                            )}
                          </td>

                          {/* Variación Línea Base */}
                          <td className="py-2 px-2 text-center font-mono font-bold text-[11px] border-r border-slate-800">
                            {durDiff === null ? (
                              <span className="text-slate-500">-</span>
                            ) : durDiff === 0 ? (
                              <span className="text-emerald-400">±0d</span>
                            ) : durDiff > 0 ? (
                              <span className="text-rose-400">+{durDiff}d</span>
                            ) : (
                              <span className="text-cyan-400">{durDiff}d</span>
                            )}
                          </td>

                          {/* Costo ($) */}
                          <td className="py-2 px-3 text-right font-mono font-black text-slate-100 text-[11px]">
                            ${Number(r.subtotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-slate-400">
                        No se encontraron tareas con los filtros actuales.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DIAGRAMA GANTT */}
        {activeTab === 'gantt' && (
          <div className="flex-1 overflow-hidden p-3 flex flex-col bg-slate-950">
            <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-between shrink-0">
              <span className="flex items-center gap-1.5">
                <Info size={13} className="text-purple-400" />
                Haz clic en cualquier barra o fila de actividad para inspeccionar su Ficha Técnica, Procedimiento, Materiales y Mano de Obra.
              </span>
              <span className="text-slate-500">
                🔴 Barra Roja = Ruta Crítica · 🔵 Barra Azul = Holgura Normal
              </span>
            </div>

            <div 
              ref={ganttContainerRef}
              className="gantt-root-contrast border border-slate-800 rounded-xl bg-white flex-1 overflow-hidden p-1 shadow-inner flex flex-col min-h-0"
            >
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
                  ganttHeight={computedGanttHeight}
                  locale="es"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 p-8">
                  <Layers size={36} className="text-slate-600 animate-bounce" />
                  <p className="font-bold text-slate-300">No hay rubros cargados en el presupuesto.</p>
                </div>
              )}
            </div>

            {/* BARRA INFERIOR DE NAVEGACIÓN Y DESPLAZAMIENTO HORIZONTAL DEL CRONOGRAMA */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md mt-2 shrink-0">
              {/* Botones de Navegación Rápida */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollGanttHorizontal('start')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                  title="Ir al inicio de la obra"
                >
                  <span>⏪ Inicio</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollGanttHorizontal('prev')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                  title="Desplazar a la izquierda (-1 mes)"
                >
                  <span>◀ Anterior</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollGanttHorizontal('next')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                  title="Desplazar a la derecha (+1 mes)"
                >
                  <span>Siguiente ▶</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollGanttHorizontal('end')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                  title="Ir al fin de la obra"
                >
                  <span>Fin ⏩</span>
                </button>
              </div>

              {/* Scrubber / Slider de Tiempo Horizontal */}
              <div className="flex-1 max-w-md flex items-center gap-3 px-2">
                <span className="text-[11px] font-bold text-slate-400 shrink-0">Línea de Tiempo:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={timelineScrollPct}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    setTimelineScrollPct(val)
                    scrollGanttHorizontal(val)
                  }}
                  className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  title="Arrastra para desplazarte horizontalmente a lo largo del cronograma"
                />
                <span className="text-[11px] font-mono font-bold text-blue-400 shrink-0 w-10 text-right">
                  {timelineScrollPct}%
                </span>
              </div>

              {/* Rango de Fechas */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="text-slate-300 font-bold">Plazo:</span>
                <span className="font-mono text-white">{kpis.totalDias} días</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300 font-bold">Entrega:</span>
                <span className="font-mono text-cyan-300">{kpis.fechaFin || 'Por calcular'}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CURVA S (EVM - PLANNED VALUE) */}
        {activeTab === 'curva_s' && (
          <div className="flex-1 overflow-auto p-4 flex flex-col bg-slate-950 space-y-4">
            <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <TrendingUp className="text-cyan-400" size={18} />
                  Curva S de Avance Financiero & Control EVM (Earned Value Management)
                </h3>
                <p className="text-xs text-slate-400">
                  Proyección acumulada del Valor Planificado (PV). Monitorea el flujo de desembolsos contractuales a lo largo del plazo de ejecución.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Inversión Total Programada</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    ${Number(kpis.costoTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
              </div>
            </div>

            {/* GRÁFICO SVG INTERACTIVO CURVA S */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                <span>100% Inversión ($)</span>
                <span className="text-cyan-400 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block shadow-sm"></span>
                  Línea de Valor Planificado Acumulado (PV)
                </span>
                <span>Plazo: {kpis.totalDias} días</span>
              </div>

              <div className="relative w-full h-80 bg-slate-950 rounded-xl border border-slate-800 p-4 overflow-hidden">
                <svg viewBox="0 0 1000 300" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="curvaSGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines Horizontales */}
                  {[0, 25, 50, 75, 100].map((pct) => {
                    const y = 260 - (pct * 2.2)
                    return (
                      <g key={pct}>
                        <line x1="40" y1={y} x2="980" y2={y} stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                        <text x="32" y={y + 4} fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="end">
                          {pct}%
                        </text>
                      </g>
                    )
                  })}

                  {/* Curva S Path */}
                  {curvaSData.points.length > 1 && (() => {
                    const pts = curvaSData.points.map((p, idx) => {
                      const sx = 40 + (p.x * 9.4)
                      const sy = 260 - (p.pctCost * 2.2)
                      return { sx, sy, ...p }
                    })

                    const pathD = pts.reduce((acc, p, idx) => {
                      return idx === 0 ? `M ${p.sx} ${p.sy}` : `${acc} L ${p.sx} ${p.sy}`
                    }, "")

                    const areaD = `${pathD} L ${pts[pts.length - 1].sx} 260 L ${pts[0].sx} 260 Z`

                    return (
                      <>
                        <path d={areaD} fill="url(#curvaSGrad)" />
                        <path d={pathD} fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
                        {pts.map((pt, i) => (
                          <g key={i} className="cursor-pointer group">
                            <circle cx={pt.sx} cy={pt.sy} r="5" fill="#0891b2" stroke="#ffffff" strokeWidth="2" className="group-hover:r-7 transition-all" />
                            <title>{`${pt.dateStr}: $${pt.costAccum.toLocaleString('en-US')} (${pt.pctCost}%)`}</title>
                          </g>
                        ))}
                      </>
                    )
                  })()}
                </svg>
              </div>

              {/* Hitos Financieros Inferiores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {curvaSData.points.length > 0 && [
                  { label: "Arranque (0%)", pt: curvaSData.points[0] },
                  { label: "Primer Tercio (~33%)", pt: curvaSData.points[Math.floor(curvaSData.points.length * 0.33)] },
                  { label: "Pico de Producción (~66%)", pt: curvaSData.points[Math.floor(curvaSData.points.length * 0.66)] },
                  { label: "Cierre Contractual (100%)", pt: curvaSData.points[curvaSData.points.length - 1] },
                ].map((hito, hIdx) => (
                  <div key={hIdx} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">{hito.label}</span>
                    <span className="text-xs font-mono font-black text-cyan-300 block">{hito.pt?.dateStr || '-'}</span>
                    <span className="text-sm font-mono font-black text-white mt-1 block">
                      ${hito.pt?.costAccum ? hito.pt.costAccum.toLocaleString('en-US') : '0'} USD
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 block">{hito.pt?.pctCost || 0}% Acumulado</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INFORME DESCRIPTIVO Y DETALLADO (LOOKAHEAD OPERATIVO) */}
        {activeTab === 'informe' && (
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
                onClick={handleExportInformeLookaheadPdf}
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