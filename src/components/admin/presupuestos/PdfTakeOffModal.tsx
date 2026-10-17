"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { 
  X, 
  Upload, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Ruler, 
  Square, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  Download, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  ChevronRight,
  ChevronLeft,
  Hand,
  Hash,
  Eye,
  FileText,
  Loader2,
  Building2,
  Undo2,
  Redo2,
  EyeOff,
  Keyboard,
  Focus,
  MousePointer,
  Crosshair,
  Compass,
  Boxes,
  Maximize,
  Search,
  Check,
  FileBox,
  CornerDownRight,
  HelpCircle,
  TrendingUp,
  DollarSign
} from "lucide-react"
import { 
  Point2D, 
  TakeOffMeasurement, 
  TakeOffToolType,
  calculateDistancePx, 
  calculateScaleRatio, 
  calculatePolygonAreaM2, 
  calculateRectanglePoints,
  calculatePolylineLengthM, 
  calculateWallAreaM2, 
  calculateVolumeM3,
  getPolygonCentroid,
  snapToNearbyPoint,
  applyOrthoConstraint,
  detectArchitecturalRoomsFromBlueprint
} from "@/lib/takeoff/geometry"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { loadPdfDocument, renderPdfPageToDataUrl } from "@/lib/takeoff/pdfRenderer"

interface PdfTakeOffModalProps {
  isOpen: boolean
  onClose: () => void
  presupuestoId: string
  nombreProyecto?: string
  presupuestoRubros: any[]
  onMeasurementsApplied: () => Promise<void>
}

// Planos Arquitectónicos vectoriales pre-cargados de alta fidelidad
const BLUEPRINTS_DEMO = [
  {
    id: "planta-baja",
    nombre: "Plano Arquitectónico - Planta Baja (Villa 120m²)",
    tipo: "arquitectura",
    escalaDefault: 0.0165, // m/px
    cotaReferencia: "Eje A-D = 8.00m",
    svgWidth: 1000,
    svgHeight: 700
  },
  {
    id: "cimentacion",
    nombre: "Plano Estructural - Cimentación & Losas",
    tipo: "estructura",
    escalaDefault: 0.0180,
    cotaReferencia: "Eje 1-3 = 6.00m",
    svgWidth: 1000,
    svgHeight: 700
  }
]

const PALETA_COLORES = [
  { nombre: "Azul (Contrapisos/Losas)", hex: "#2563eb", fill: "rgba(37, 99, 235, 0.35)" },
  { nombre: "Esmeralda (Acabados/Cerámica)", hex: "#059669", fill: "rgba(5, 150, 105, 0.35)" },
  { nombre: "Ámbar (Paredes/Mampostería)", hex: "#d97706", fill: "rgba(217, 119, 6, 0.35)" },
  { nombre: "Cian (Volumen Hormigón)", hex: "#06b6d4", fill: "rgba(6, 182, 212, 0.35)" },
  { nombre: "Púrpura (Pintura/Gypsum)", hex: "#7c3aed", fill: "rgba(124, 58, 237, 0.35)" },
  { nombre: "Rosa (Instalaciones)", hex: "#e11d48", fill: "rgba(225, 29, 72, 0.35)" }
]

// Opciones de cotas arquitectónicas rápidas
const PRESET_COTAS_METROS = [0.90, 1.20, 2.60, 3.00, 3.40, 3.84, 4.00, 4.12, 6.00, 8.00, 12.00, 21.29]

export default function PdfTakeOffModal({
  isOpen,
  onClose,
  presupuestoId,
  nombreProyecto = "Obra Residencial",
  presupuestoRubros = [],
  onMeasurementsApplied
}: PdfTakeOffModalProps) {
  // Herramienta activa
  const [activeTool, setActiveTool] = useState<TakeOffToolType>('area')
  const [selectedBlueprint, setSelectedBlueprint] = useState<string>("planta-baja")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [blueprintDimensions, setBlueprintDimensions] = useState<{ width: number; height: number }>({ width: 1000, height: 700 })

  // PDF Multi-página y renderizado
  const [isRenderingPdf, setIsRenderingPdf] = useState<boolean>(false)
  const [pdfTotalPages, setPdfTotalPages] = useState<number>(1)
  const [pdfCurrentPage, setPdfCurrentPage] = useState<number>(1)

  // Escala y Calibración de Precisión
  const [scaleRatio, setScaleRatio] = useState<number>(0.0165) // metros por pixel
  const [calibrationPoints, setCalibrationPoints] = useState<Point2D[]>([])
  const [calibratedLine, setCalibratedLine] = useState<{ p1: Point2D; p2: Point2D; meters: number; pixels: number } | null>(null)
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false)

  // Modal interactivo de calibración
  const [isCalibrationModalOpen, setIsCalibrationModalOpen] = useState<boolean>(false)
  const [calibrationPendingPoints, setCalibrationPendingPoints] = useState<Point2D[]>([])
  const [realMetersInput, setRealMetersInput] = useState<string>("3.40")
  const [measuredPixels, setMeasuredPixels] = useState<number>(0)

  // Estado del lienzo (Zoom y Pan)
  const [zoom, setZoom] = useState<number>(1)
  const [panOffset, setPanOffset] = useState<Point2D>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragStart, setDragStart] = useState<Point2D>({ x: 0, y: 0 })

  // Dibujo en progreso y controles de precisión
  const [currentPoints, setCurrentPoints] = useState<Point2D[]>([])
  const [cursorPos, setCursorPos] = useState<Point2D | null>(null)
  const [selectedColor, setSelectedColor] = useState(PALETA_COLORES[0])
  const [wallHeight, setWallHeight] = useState<number>(2.60) // metros
  const [slabThickness, setSlabThickness] = useState<number>(0.15) // metros para volumen
  const [isOrthoActive, setIsOrthoActive] = useState<boolean>(false) // Tecla Shift presionada
  const [isMagnifierActive, setIsMagnifierActive] = useState<boolean>(false) // Lupa de precisión
  const [snappedPoint, setSnappedPoint] = useState<Point2D | null>(null)

  // Mediciones confirmadas (inicia en blanco para planos reales)
  const [mediciones, setMediciones] = useState<TakeOffMeasurement[]>([])

  // Pila de historial para Deshacer (Ctrl+Z) y Rehacer (Ctrl+Y)
  const [history, setHistory] = useState<TakeOffMeasurement[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState<number>(0)

  // Capa seleccionada en lienzo o panel
  const [selectedMedicionId, setSelectedMedicionId] = useState<string | null>(null)
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false)

  // Herramientas de Precisión Arquitectónica (Especialista Revit / AutoCAD)
  const [showCrosshair, setShowCrosshair] = useState<boolean>(true) // Mira en cruz infinita
  const [quickMeasurePoints, setQuickMeasurePoints] = useState<Point2D[]>([]) // Cinta métrica rápida
  const [quickMeasureResult, setQuickMeasureResult] = useState<{
    p1: Point2D
    p2: Point2D
    distanceM: number
    deltaXM: number
    deltaYM: number
    angleDeg: number
  } | null>(null)

  // Dimensiones del contenedor del lienzo para las Barras de Navegación (Scrollbars)
  const canvasContainerRef = useRef<HTMLDivElement | null>(null)
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 900, height: 600 })
  const [isDraggingScrollX, setIsDraggingScrollX] = useState<boolean>(false)
  const [isDraggingScrollY, setIsDraggingScrollY] = useState<boolean>(false)

  // Notificaciones y diálogos
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null)
  const [cadFormatNotice, setCadFormatNotice] = useState<{
    format: string
    title: string
    message: string
  } | null>(null)

  // Aplicación a presupuesto
  const [isApplying, setIsApplying] = useState<boolean>(false)
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null)
  const [isDetectingAi, setIsDetectingAi] = useState<boolean>(false)

  const svgRef = useRef<SVGSVGElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const metersInputRef = useRef<HTMLInputElement | null>(null)

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMsg({ text, type })
    setTimeout(() => setToastMsg(null), 4000)
  }

  // Medir tamaño del contenedor del lienzo para las barras de navegación
  useEffect(() => {
    if (!canvasContainerRef.current) return
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setContainerSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height
          })
        }
      }
    })
    ro.observe(canvasContainerRef.current)
    return () => ro.disconnect()
  }, [])

  // Actualizar mediciones registrando snapshot en el historial
  const updateMedicionesWithHistory = (
    updater: TakeOffMeasurement[] | ((prev: TakeOffMeasurement[]) => TakeOffMeasurement[])
  ) => {
    setMediciones(current => {
      const next = typeof updater === 'function' ? updater(current) : updater
      setHistory(prevH => {
        const truncated = prevH.slice(0, Math.max(0, historyIndex + 1))
        return [...truncated, next]
      })
      setHistoryIndex(prevIdx => prevIdx + 1)
      return next
    })
  }

  // Deshacer: quita vértice si dibuja, o retrocede en historial
  const handleUndo = () => {
    if (currentPoints.length > 0) {
      setCurrentPoints(prev => prev.slice(0, -1))
      showToast("Vértice anterior eliminado", "info")
      return
    }
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1
      const targetState = history[prevIdx]
      setHistoryIndex(prevIdx)
      setMediciones(targetState)
      showToast(`Deshecho (Ctrl+Z) · Estado ${prevIdx + 1}/${history.length}`, "info")
    } else {
      showToast("No hay más acciones para deshacer", "info")
    }
  }

  // Rehacer: avanza en el historial
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1
      const targetState = history[nextIdx]
      setHistoryIndex(nextIdx)
      setMediciones(targetState)
      showToast(`Rehecho (Ctrl+Y) · Estado ${nextIdx + 1}/${history.length}`, "info")
    } else {
      showToast("No hay más acciones para rehacer", "info")
    }
  }

  const canUndo = currentPoints.length > 0 || historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  // Alternar visibilidad de capa
  const toggleVisibility = (medId: string) => {
    updateMedicionesWithHistory(prev => prev.map(m => {
      if (m.id === medId) {
        return { ...m, visible: m.visible === false ? true : false }
      }
      return m
    }))
  }

  // Parámetros geométricos para las Barras de Navegación (Scrollbars X & Y)
  const scaledBlueprintW = (blueprintDimensions.width || 1000) * zoom
  const scaledBlueprintH = (blueprintDimensions.height || 700) * zoom

  // Rango dinámico de navegación para las barras de scroll
  const maxPanRangeX = Math.max(containerSize.width * 0.8, scaledBlueprintW)
  const maxPanRangeY = Math.max(containerSize.height * 0.8, scaledBlueprintH)

  // Fracción normalizada [0, 1] de la barra X y Y
  const scrollFractionX = useMemo(() => {
    const raw = (-panOffset.x + maxPanRangeX) / (2 * maxPanRangeX || 1)
    return Math.max(0, Math.min(1, raw))
  }, [panOffset.x, maxPanRangeX])

  const scrollFractionY = useMemo(() => {
    const raw = (-panOffset.y + maxPanRangeY) / (2 * maxPanRangeY || 1)
    return Math.max(0, Math.min(1, raw))
  }, [panOffset.y, maxPanRangeY])

  // Porcentaje del ancho y alto del Thumb
  const thumbWidthPercent = useMemo(() => {
    const ratio = containerSize.width / Math.max(containerSize.width, scaledBlueprintW + 200)
    return Math.max(8, Math.min(80, ratio * 100))
  }, [containerSize.width, scaledBlueprintW])

  const thumbHeightPercent = useMemo(() => {
    const ratio = containerSize.height / Math.max(containerSize.height, scaledBlueprintH + 200)
    return Math.max(8, Math.min(80, ratio * 100))
  }, [containerSize.height, scaledBlueprintH])

  // Pasos de navegación para botones de flechas (◄ ► ▲ ▼)
  const stepPanX = (delta: number) => {
    setPanOffset(prev => ({ ...prev, x: prev.x + delta }))
  }
  const stepPanY = (delta: number) => {
    setPanOffset(prev => ({ ...prev, y: prev.y + delta }))
  }

  // Interacción en la barra de desplazamiento X
  const handleScrollTrackXPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const fraction = Math.max(0, Math.min(1, clickX / rect.width))
    const targetPanX = maxPanRangeX - fraction * (2 * maxPanRangeX)
    setPanOffset(prev => ({ ...prev, x: targetPanX }))
  }

  const handleScrollThumbXPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const target = e.currentTarget
    target.setPointerCapture(e.pointerId)
    setIsDraggingScrollX(true)

    const startClientX = e.clientX
    const startPanX = panOffset.x

    const onPointerMove = (moveEv: PointerEvent) => {
      const deltaPx = moveEv.clientX - startClientX
      const trackWidth = containerSize.width - 40
      const fractionDelta = deltaPx / (trackWidth || 1)
      const panDelta = -fractionDelta * (2 * maxPanRangeX)
      setPanOffset(prev => ({ ...prev, x: startPanX + panDelta }))
    }

    const onPointerUp = (upEv: PointerEvent) => {
      target.releasePointerCapture(upEv.pointerId)
      setIsDraggingScrollX(false)
      target.removeEventListener('pointermove', onPointerMove)
      target.removeEventListener('pointerup', onPointerUp)
    }

    target.addEventListener('pointermove', onPointerMove)
    target.addEventListener('pointerup', onPointerUp)
  }

  // Interacción en la barra de desplazamiento Y
  const handleScrollTrackYPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    const fraction = Math.max(0, Math.min(1, clickY / rect.height))
    const targetPanY = maxPanRangeY - fraction * (2 * maxPanRangeY)
    setPanOffset(prev => ({ ...prev, y: targetPanY }))
  }

  const handleScrollThumbYPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const target = e.currentTarget
    target.setPointerCapture(e.pointerId)
    setIsDraggingScrollY(true)

    const startClientY = e.clientY
    const startPanY = panOffset.y

    const onPointerMove = (moveEv: PointerEvent) => {
      const deltaPx = moveEv.clientY - startClientY
      const trackHeight = containerSize.height - 40
      const fractionDelta = deltaPx / (trackHeight || 1)
      const panDelta = -fractionDelta * (2 * maxPanRangeY)
      setPanOffset(prev => ({ ...prev, y: startPanY + panDelta }))
    }

    const onPointerUp = (upEv: PointerEvent) => {
      target.releasePointerCapture(upEv.pointerId)
      setIsDraggingScrollY(false)
      target.removeEventListener('pointermove', onPointerMove)
      target.removeEventListener('pointerup', onPointerUp)
    }

    target.addEventListener('pointermove', onPointerMove)
    target.addEventListener('pointerup', onPointerUp)
  }

  // Zoom y desplazamiento con la rueda del ratón
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()

    // Si mantiene Shift: desplazamiento horizontal
    if (e.shiftKey) {
      setPanOffset(prev => ({ ...prev, x: prev.x - e.deltaY * 0.9 }))
      return
    }

    // Zoom continuo enfocado al cursor
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87
    const newZoom = Math.min(4.0, Math.max(0.25, Number((zoom * zoomFactor).toFixed(2))))
    
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      const scaleChange = newZoom / zoom
      setPanOffset(prev => ({
        x: mouseX - (mouseX - prev.x) * scaleChange,
        y: mouseY - (mouseY - prev.y) * scaleChange
      }))
    }
    setZoom(newZoom)
  }

  // Ajustar plano a los límites de pantalla (Fit / Zoom Extents)
  const handleFitToScreen = () => {
    if (!svgRef.current) {
      setZoom(1)
      setPanOffset({ x: 0, y: 0 })
      return
    }
    const rect = svgRef.current.getBoundingClientRect()
    const padding = 36
    const availW = Math.max(200, rect.width - padding * 2)
    const availH = Math.max(200, rect.height - padding * 2)
    
    const bpW = blueprintDimensions.width || 1000
    const bpH = blueprintDimensions.height || 700
    
    const fitScale = Math.min(availW / bpW, availH / bpH, 1.5)
    const finalZoom = Math.max(0.25, Number(fitScale.toFixed(2)))
    
    const centeredX = (rect.width - bpW * finalZoom) / 2
    const centeredY = (rect.height - bpH * finalZoom) / 2
    
    setZoom(finalZoom)
    setPanOffset({ x: centeredX, y: centeredY })
    showToast(`Plano ajustado y centrado (${Math.round(finalZoom * 100)}%)`, "info")
  }

  // Escuchar atajos globales de teclado (Ctrl+Z, Ctrl+Y, Shift, Esc, Backspace, L)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement
      const tagName = activeEl?.tagName?.toLowerCase()
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
        return
      }

      if (e.key === 'Shift') setIsOrthoActive(true)

      // Undo: Ctrl+Z o Meta+Z (sin Shift)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
        return
      }

      // Redo: Ctrl+Y o Ctrl+Shift+Z o Meta+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z'))
      ) {
        e.preventDefault()
        handleRedo()
        return
      }

      // Backspace: borrar último vértice si está dibujando
      if (e.key === 'Backspace' && currentPoints.length > 0) {
        e.preventDefault()
        setCurrentPoints(prev => prev.slice(0, -1))
        showToast("Vértice anterior eliminado", "info")
        return
      }

      // Escape: cancelar trazado, calibración o cinta métrica
      if (e.key === 'Escape') {
        setCurrentPoints([])
        setSelectedMedicionId(null)
        setQuickMeasurePoints([])
        setQuickMeasureResult(null)
        if (isCalibrating) {
          setIsCalibrating(false)
          setCalibrationPoints([])
        }
      }

      // Tecla L: alternar Lupa telescópica
      if (e.key === 'l' || e.key === 'L') {
        setIsMagnifierActive(prev => !prev)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsOrthoActive(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isCalibrating, currentPoints, history, historyIndex])

  // Calibración inicial al cambiar de plano demo
  useEffect(() => {
    const demo = BLUEPRINTS_DEMO.find(b => b.id === selectedBlueprint)
    if (demo && !uploadedImage) {
      setScaleRatio(demo.escalaDefault)
      setBlueprintDimensions({ width: demo.svgWidth, height: demo.svgHeight })
      setCalibratedLine(null)
    }
  }, [selectedBlueprint, uploadedImage])

  // Focus automático en el input de metros al abrir modal de calibración
  useEffect(() => {
    if (isCalibrationModalOpen) {
      setTimeout(() => metersInputRef.current?.focus(), 150)
    }
  }, [isCalibrationModalOpen])

  // Todos los vértices existentes para Snapping Magnético
  const allExistingVertices = useMemo(() => {
    return mediciones.flatMap(m => m.puntos)
  }, [mediciones])

  // Cálculo total de costos del plano
  const totalCostoPlano = useMemo(() => {
    return mediciones.reduce((acc, curr) => acc + (Number(curr.costoTotal) || 0), 0)
  }, [mediciones])

  // Coordenadas locales dentro del SVG con zoom, pan, orto y snapping magnético
  const getSvgCoordinates = (e: React.MouseEvent<SVGSVGElement>): Point2D => {
    if (!svgRef.current) return { x: 0, y: 0 }
    const rect = svgRef.current.getBoundingClientRect()
    const clientX = e.clientX - rect.left
    const clientY = e.clientY - rect.top
    let x = (clientX - panOffset.x) / zoom
    let y = (clientY - panOffset.y) / zoom

    // Modo Orto (Shift sostenido)
    if (isOrthoActive) {
      if (activeTool === 'calibrate' && calibrationPoints.length === 1) {
        const orthoPt = applyOrthoConstraint(calibrationPoints[0], { x, y })
        x = orthoPt.x
        y = orthoPt.y
      } else if (currentPoints.length > 0) {
        const lastPt = currentPoints[currentPoints.length - 1]
        const orthoPt = applyOrthoConstraint(lastPt, { x, y })
        x = orthoPt.x
        y = orthoPt.y
      }
    }

    // Snapping Magnético (si no está en modo Pan)
    if (activeTool !== 'pan' && allExistingVertices.length > 0) {
      const snapResult = snapToNearbyPoint({ x, y }, allExistingVertices, 14 / zoom)
      if (snapResult.isSnapped) {
        setSnappedPoint(snapResult.point)
        return snapResult.point
      }
    }

    setSnappedPoint(null)
    return { x, y }
  }

  // Clic en el lienzo según la herramienta activa
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'pan' || isDragging) return

    const pt = getSvgCoordinates(e)

    // 1. Calibración de Escala con Diálogo Interactivo
    if (activeTool === 'calibrate') {
      if (calibrationPoints.length === 0) {
        setCalibrationPoints([pt])
        showToast("Extremo 1 fijado. Haz clic en el 2do extremo de la cota conocida.", "info")
      } else if (calibrationPoints.length === 1) {
        const p1 = calibrationPoints[0]
        const p2 = pt
        const distPx = calculateDistancePx(p1, p2)

        if (distPx < 10) {
          showToast("La distancia entre puntos es muy pequeña. Selecciona una cota más amplia.", "error")
          return
        }

        setCalibrationPoints([p1, p2])
        setCalibrationPendingPoints([p1, p2])
        setMeasuredPixels(distPx)
        setIsCalibrationModalOpen(true)
      }
      return
    }

    // 1.5. Cinta Métrica Rápida de Precisión (Estilo Revit / AutoCAD Measure)
    if (activeTool === 'distancia') {
      if (quickMeasurePoints.length !== 1) {
        setQuickMeasurePoints([pt])
        setQuickMeasureResult(null)
        showToast("Extremo A fijado. Haz clic en el Extremo B para medir la distancia.", "info")
      } else {
        const p1 = quickMeasurePoints[0]
        const p2 = pt
        const distPx = calculateDistancePx(p1, p2)
        const distM = Number((distPx * scaleRatio).toFixed(3))
        const deltaXM = Number((Math.abs(p2.x - p1.x) * scaleRatio).toFixed(3))
        const deltaYM = Number((Math.abs(p2.y - p1.y) * scaleRatio).toFixed(3))
        const angleRad = Math.atan2(p2.y - p1.y, p2.x - p1.x)
        let angleDeg = Number((angleRad * (180 / Math.PI)).toFixed(1))
        if (angleDeg < 0) angleDeg += 360

        setQuickMeasureResult({
          p1,
          p2,
          distanceM: distM,
          deltaXM,
          deltaYM,
          angleDeg
        })
        setQuickMeasurePoints([p1, p2])
        showToast(`📏 Distancia: ${distM} m | ΔX: ${deltaXM} m | ΔY: ${deltaYM} m | Ángulo: ${angleDeg}°`, "success")
      }
      return
    }

    // 2. Conteo puntual
    if (activeTool === 'conteo') {
      const matchingRubro = presupuestoRubros.find(r => (r.nombre_rubro || '').toLowerCase().includes('columna') || (r.nombre_rubro || '').toLowerCase().includes('punto'))
      const pu = Number(matchingRubro?.precio_unitario) || 0
      const nuevoConteo: TakeOffMeasurement = {
        id: `count-${Date.now()}`,
        nombre: `Punto de Control #${mediciones.filter(m => m.tipo === 'conteo').length + 1}`,
        tipo: 'conteo',
        color: selectedColor.hex,
        puntos: [pt],
        resultado: 1,
        unidad: 'u',
        rubro_id: matchingRubro?.id,
        rubro_nombre: matchingRubro?.nombre_rubro,
        rubro_codigo: matchingRubro?.codigo_rubro,
        precioUnitario: pu,
        costoTotal: pu * 1,
        visible: true
      }
      updateMedicionesWithHistory(prev => [...prev, nuevoConteo])
      return
    }

    // 3. Rectángulo Rápido (2 clics)
    if (activeTool === 'rectangulo') {
      if (currentPoints.length === 0) {
        setCurrentPoints([pt])
        showToast("Primer vértice fijado. Haz clic en la esquina opuesta.", "info")
      } else {
        const p1 = currentPoints[0]
        const rectPts = calculateRectanglePoints(p1, pt)
        const areaM2 = calculatePolygonAreaM2(rectPts, scaleRatio)

        const matchingRubro = presupuestoRubros.find(r => (r.nombre_rubro || '').toLowerCase().includes('piso') || (r.nombre_rubro || '').toLowerCase().includes('contrapiso'))
        const pu = Number(matchingRubro?.precio_unitario) || 0

        const nuevaMed: TakeOffMeasurement = {
          id: `rect-${Date.now()}`,
          nombre: `Área Rectangular #${mediciones.filter(m => m.tipo === 'rectangulo' || m.tipo === 'area').length + 1}`,
          tipo: 'rectangulo',
          color: selectedColor.hex,
          puntos: rectPts,
          resultado: areaM2,
          unidad: 'm²',
          rubro_id: matchingRubro?.id,
          rubro_nombre: matchingRubro?.nombre_rubro,
          rubro_codigo: matchingRubro?.codigo_rubro,
          precioUnitario: pu,
          costoTotal: Number((areaM2 * pu).toFixed(2)),
          visible: true
        }
        updateMedicionesWithHistory(prev => [...prev, nuevaMed])
        setCurrentPoints([])
        showToast(`Área rectangular calculada: ${areaM2} m²`, "success")
      }
      return
    }

    // 4. Polígonos de Área o Volumen de Hormigón
    if (activeTool === 'area' || activeTool === 'volumen') {
      // Snapping al inicio para cerrar polígono
      if (currentPoints.length >= 3) {
        const start = currentPoints[0]
        const distToStart = calculateDistancePx(pt, start)
        if (distToStart < 16 / zoom) {
          cerrarPoligono()
          return
        }
      }
      setCurrentPoints(prev => [...prev, pt])
      return
    }

    // 5. Paredes o Longitud Lineal
    if (activeTool === 'pared' || activeTool === 'longitud') {
      setCurrentPoints(prev => [...prev, pt])
      return
    }
  }

  // Doble clic para finalizar medición
  const handleCanvasDoubleClick = () => {
    if (activeTool === 'area' || activeTool === 'volumen') {
      cerrarPoligono()
    } else if (activeTool === 'pared') {
      cerrarPared()
    } else if (activeTool === 'longitud') {
      cerrarLongitud()
    }
  }

  const cerrarPoligono = () => {
    if (currentPoints.length < 3) {
      setCurrentPoints([])
      return
    }
    const areaM2 = calculatePolygonAreaM2(currentPoints, scaleRatio)

    if (activeTool === 'volumen') {
      const volM3 = calculateVolumeM3(areaM2, slabThickness)
      const matchingRubro = presupuestoRubros.find(r => (r.nombre_rubro || '').toLowerCase().includes('hormigon') || (r.nombre_rubro || '').toLowerCase().includes('losa'))
      const pu = Number(matchingRubro?.precio_unitario) || 0

      const nuevaMed: TakeOffMeasurement = {
        id: `vol-${Date.now()}`,
        nombre: `Volumen de Losa (e=${slabThickness}m) #${mediciones.filter(m => m.tipo === 'volumen').length + 1}`,
        tipo: 'volumen',
        color: selectedColor.hex,
        puntos: [...currentPoints],
        espesor: slabThickness,
        resultado: volM3,
        unidad: 'm³',
        rubro_id: matchingRubro?.id,
        rubro_nombre: matchingRubro?.nombre_rubro,
        rubro_codigo: matchingRubro?.codigo_rubro,
        precioUnitario: pu,
        costoTotal: Number((volM3 * pu).toFixed(2)),
        visible: true
      }
      updateMedicionesWithHistory(prev => [...prev, nuevaMed])
      showToast(`Volumen calculado: ${volM3} m³ (Área: ${areaM2} m²)`, "success")
    } else {
      const matchingRubro = presupuestoRubros.find(r => (r.nombre_rubro || '').toLowerCase().includes('contrapiso') || (r.nombre_rubro || '').toLowerCase().includes('piso') || (r.nombre_rubro || '').toLowerCase().includes('ceramica'))
      const pu = Number(matchingRubro?.precio_unitario) || 0

      const nuevaMed: TakeOffMeasurement = {
        id: `med-${Date.now()}`,
        nombre: `Recinto #${mediciones.filter(m => m.tipo === 'area').length + 1}`,
        tipo: 'area',
        color: selectedColor.hex,
        puntos: [...currentPoints],
        resultado: areaM2,
        unidad: 'm²',
        rubro_id: matchingRubro?.id,
        rubro_nombre: matchingRubro?.nombre_rubro,
        rubro_codigo: matchingRubro?.codigo_rubro,
        precioUnitario: pu,
        costoTotal: Number((areaM2 * pu).toFixed(2)),
        visible: true
      }
      updateMedicionesWithHistory(prev => [...prev, nuevaMed])
      showToast(`Área calculada: ${areaM2} m²`, "success")
    }

    setCurrentPoints([])
  }

  const cerrarPared = () => {
    if (currentPoints.length < 2) {
      setCurrentPoints([])
      return
    }
    const lenM = calculatePolylineLengthM(currentPoints, scaleRatio)
    const areaM2 = calculateWallAreaM2(currentPoints, scaleRatio, wallHeight, 0)
    const matchingRubro = presupuestoRubros.find(r => (r.nombre_rubro || '').toLowerCase().includes('mamposteria') || (r.nombre_rubro || '').toLowerCase().includes('ladrillo') || (r.nombre_rubro || '').toLowerCase().includes('bloque'))
    const pu = Number(matchingRubro?.precio_unitario) || 0

    const nuevaMed: TakeOffMeasurement = {
      id: `wall-${Date.now()}`,
      nombre: `Muro de Mampostería (H=${wallHeight}m) #${mediciones.filter(m => m.tipo === 'pared').length + 1}`,
      tipo: 'pared',
      color: selectedColor.hex,
      puntos: [...currentPoints],
      alturaPared: wallHeight,
      areaVanos: 0,
      longitudLineal: lenM,
      resultado: areaM2,
      unidad: 'm²',
      rubro_id: matchingRubro?.id,
      rubro_nombre: matchingRubro?.nombre_rubro,
      rubro_codigo: matchingRubro?.codigo_rubro,
      precioUnitario: pu,
      costoTotal: Number((areaM2 * pu).toFixed(2)),
      visible: true
    }
    updateMedicionesWithHistory(prev => [...prev, nuevaMed])
    setCurrentPoints([])
    showToast(`Muro calculado: ${areaM2} m² (Longitud: ${lenM} m)`, "success")
  }

  const cerrarLongitud = () => {
    if (currentPoints.length < 2) {
      setCurrentPoints([])
      return
    }
    const lenM = calculatePolylineLengthM(currentPoints, scaleRatio)
    const matchingRubro = presupuestoRubros.find(r => (r.nombre_rubro || '').toLowerCase().includes('tuberia') || (r.nombre_rubro || '').toLowerCase().includes('cable') || (r.nombre_rubro || '').toLowerCase().includes('lineal') || (r.unidad || '').toLowerCase() === 'm')
    const pu = Number(matchingRubro?.precio_unitario) || 0

    const nuevaMed: TakeOffMeasurement = {
      id: `len-${Date.now()}`,
      nombre: `Trazado Lineal #${mediciones.filter(m => m.tipo === 'longitud').length + 1}`,
      tipo: 'longitud',
      color: selectedColor.hex,
      puntos: [...currentPoints],
      resultado: lenM,
      unidad: 'm',
      rubro_id: matchingRubro?.id,
      rubro_nombre: matchingRubro?.nombre_rubro,
      rubro_codigo: matchingRubro?.codigo_rubro,
      precioUnitario: pu,
      costoTotal: Number((lenM * pu).toFixed(2)),
      visible: true
    }
    updateMedicionesWithHistory(prev => [...prev, nuevaMed])
    setCurrentPoints([])
    showToast(`Longitud calculada: ${lenM} m`, "success")
  }

  // Confirmar y aplicar escala calibrada
  const handleApplyCalibration = () => {
    const meters = parseFloat(realMetersInput)
    if (isNaN(meters) || meters <= 0) {
      alert("Por favor introduce una distancia válida mayor a 0 metros.")
      return
    }

    if (calibrationPendingPoints.length < 2) return

    const p1 = calibrationPendingPoints[0]
    const p2 = calibrationPendingPoints[1]
    const distPx = calculateDistancePx(p1, p2)
    const newRatio = calculateScaleRatio(p1, p2, meters)

    setScaleRatio(newRatio)
    setCalibratedLine({
      p1,
      p2,
      meters,
      pixels: distPx
    })

    // Actualizar todas las mediciones existentes con la nueva escala de precisión
    updateMedicionesWithHistory(prev => prev.map(m => {
      let nuevoResultado = m.resultado
      if (m.tipo === 'area' || m.tipo === 'rectangulo') {
        nuevoResultado = calculatePolygonAreaM2(m.puntos, newRatio)
      } else if (m.tipo === 'longitud') {
        nuevoResultado = calculatePolylineLengthM(m.puntos, newRatio)
      } else if (m.tipo === 'pared') {
        nuevoResultado = calculateWallAreaM2(m.puntos, newRatio, m.alturaPared || 2.6, m.areaVanos || 0)
      } else if (m.tipo === 'volumen') {
        const area = calculatePolygonAreaM2(m.puntos, newRatio)
        nuevoResultado = calculateVolumeM3(area, m.espesor || 0.15)
      }

      const pu = m.precioUnitario || 0
      return {
        ...m,
        resultado: nuevoResultado,
        costoTotal: pu > 0 ? Number((nuevoResultado * pu).toFixed(2)) : m.costoTotal
      }
    }))

    setIsCalibrationModalOpen(false)
    setIsCalibrating(false)
    setCalibrationPoints([])
    setActiveTool('area')

    showToast(
      `✅ Escala calibrada: ${meters.toFixed(2)}m = ${Math.round(distPx)}px (1px = ${(newRatio * 100).toFixed(2)}cm)`,
      "success"
    )
  }

  // Pan / Arrastre del lienzo
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'pan' || e.button === 1 || e.shiftKey) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    } else {
      setCursorPos(getSvgCoordinates(e))
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Subir plano en PDF o imagen con validación CAD/BIM
  const handleUploadBlueprint = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const fileName = file.name.toLowerCase()

    // 1. Modelos BIM nativos (Revit / Archicad / IFC)
    if (fileName.endsWith('.rvt')) {
      setCadFormatNotice({
        format: 'Autodesk Revit (.rvt)',
        title: 'Modelo Nativo de Autodesk Revit (.rvt) Detectado',
        message: 'Los archivos .rvt son contenedores 3D completos de Revit.\n\n' +
          '• Para medir aquí en 2D Take-Off: En Revit, elije: Archivo > Exportar > PDF (o Imprime la lámina en PDF / PNG). Sube ese archivo aquí y se renderizará con todas sus cotas en alta definición.\n' +
          '• Para cómputos volumétricos 3D: Exporta en formato IFC (.ifc) e ingrésalo en SARA-BIM 3D.'
      })
      return
    }

    if (fileName.endsWith('.pln') || fileName.endsWith('.pla')) {
      setCadFormatNotice({
        format: 'Graphisoft Archicad (.pln)',
        title: 'Modelo Nativo de Archicad (.pln) Detectado',
        message: 'Los archivos .pln son proyectos BIM completos de Archicad.\n\n' +
          '• Para medir aquí en 2D Take-Off: En Archicad, ve a Archivo > Guardar como... > Documento PDF. Sube ese archivo PDF aquí para calibrar con máxima nitidez.\n' +
          '• Para análisis 3D: Exporta en formato IFC (.ifc) para SARA-BIM.'
      })
      return
    }

    if (fileName.endsWith('.ifc')) {
      setCadFormatNotice({
        format: 'Modelo IFC 3D (.ifc)',
        title: 'Archivo IFC (BIM 3D) Detectado',
        message: 'El archivo IFC es un modelo volumétrico 3D. Este módulo (SARA Take-Off) está calibrado para planos 2D.\n\nPuedes cargar tu modelo IFC en el módulo SARA-BIM (/dashboard/bim) para extraer cantidades automáticas de hormigón y armaduras.'
      })
      return
    }

    // 2. Renderizado nativo de PDF en alta resolución
    if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
      setIsRenderingPdf(true)
      try {
        const { totalPages } = await loadPdfDocument(file)
        setPdfTotalPages(totalPages)
        setPdfCurrentPage(1)

        const rendered = await renderPdfPageToDataUrl(1, 2.0)
        setUploadedImage(rendered.dataUrl)
        setBlueprintDimensions({ width: rendered.width, height: rendered.height })
        setSelectedBlueprint("custom")

        setIsCalibrating(true)
        setActiveTool('calibrate')
        setCalibrationPoints([])
        showToast("Plano PDF cargado en alta resolución. Haz clic en 2 puntos de una cota para calibrar.", "success")
      } catch (err: any) {
        console.error("Error al renderizar plano PDF:", err)
        alert("No se pudo renderizar el PDF: " + (err.message || err))
      } finally {
        setIsRenderingPdf(false)
      }
      return
    }

    // 3. Imágenes (PNG, JPG, WEBP)
    if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|svg)$/i.test(fileName)) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          const imgStr = event.target.result as string
          const img = new Image()
          img.onload = () => {
            setBlueprintDimensions({
              width: img.naturalWidth || 1000,
              height: img.naturalHeight || 700
            })
            setUploadedImage(imgStr)
            setPdfTotalPages(1)
            setSelectedBlueprint("custom")
            setIsCalibrating(true)
            setActiveTool('calibrate')
            setCalibrationPoints([])
            showToast("Imagen de plano cargada. Haz clic en 2 puntos para calibrar la escala.", "success")
          }
          img.src = imgStr
        }
      }
      reader.readAsDataURL(file)
      return
    }

    alert("Formato no reconocido. Por favor sube un plano en PDF o una imagen (PNG, JPG, WEBP).")
  }

  // Cambio de página en PDF
  const handleChangePdfPage = async (newPage: number) => {
    if (newPage < 1 || newPage > pdfTotalPages || isRenderingPdf) return
    setIsRenderingPdf(true)
    try {
      const rendered = await renderPdfPageToDataUrl(newPage, 2.0)
      setUploadedImage(rendered.dataUrl)
      setPdfCurrentPage(newPage)
      setBlueprintDimensions({ width: rendered.width, height: rendered.height })
    } catch (err: any) {
      console.error("Error al cambiar de página:", err)
    } finally {
      setIsRenderingPdf(false)
    }
  }

  // Deducción rápida de vanos
  const handleAddVanoToMuro = (medId: string, areaVanoM2: number) => {
    updateMedicionesWithHistory(prev => prev.map(m => {
      if (m.id === medId && m.tipo === 'pared') {
        const vanosActuales = Number(m.areaVanos) || 0
        const nuevosVanos = Number((vanosActuales + areaVanoM2).toFixed(2))
        const areaNeta = calculateWallAreaM2(m.puntos, scaleRatio, m.alturaPared || 2.6, nuevosVanos)
        const pu = m.precioUnitario || 0
        return {
          ...m,
          areaVanos: nuevosVanos,
          resultado: areaNeta,
          costoTotal: pu > 0 ? Number((areaNeta * pu).toFixed(2)) : m.costoTotal
        }
      }
      return m
    }))
    showToast(`Vano de ${areaVanoM2} m² descontado del muro.`, "info")
  }

  // Asignar rubro a una medición y actualizar costo
  const handleAssignRubro = (medId: string, rubroId: string) => {
    const rubro = presupuestoRubros.find(r => r.id === rubroId)
    const pu = Number(rubro?.precio_unitario) || 0

    updateMedicionesWithHistory(prev => prev.map(m => {
      if (m.id === medId) {
        return {
          ...m,
          rubro_id: rubroId || undefined,
          rubro_nombre: rubro ? rubro.nombre_rubro : undefined,
          rubro_codigo: rubro ? rubro.codigo_rubro : undefined,
          precioUnitario: pu,
          costoTotal: pu > 0 ? Number((m.resultado * pu).toFixed(2)) : undefined
        }
      }
      return m
    }))
  }

  // Eliminar medición
  const handleDeleteMedicion = (medId: string) => {
    updateMedicionesWithHistory(prev => prev.filter(m => m.id !== medId))
    if (selectedMedicionId === medId) setSelectedMedicionId(null)
  }

  // Auto-Detección Inteligente de Ambientes con SARA-Vision
  const handleAiAutoDetect = () => {
    setIsDetectingAi(true)
    setTimeout(() => {
      const detected = detectArchitecturalRoomsFromBlueprint(
        selectedBlueprint, 
        scaleRatio, 
        presupuestoRubros,
        blueprintDimensions
      )
      updateMedicionesWithHistory(detected.map(d => ({ ...d, visible: true })))
      setIsDetectingAi(false)
      showToast(`🤖 SARA-Vision detectó ${detected.length} recintos calibrados a escala.`, "success")
    }, 600)
  }

  // Volcar mediciones al presupuesto real
  const handleApplyToPresupuesto = async () => {
    const asignadas = mediciones.filter(m => m.rubro_id && Number(m.resultado) > 0)
    if (asignadas.length === 0) {
      alert("Debes asignar al menos una medición a un rubro del presupuesto antes de volcar.")
      return
    }

    setIsApplying(true)
    setApplySuccessMsg(null)

    try {
      const res = await fetch("/api/takeoff/mediciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "apply_to_presupuesto",
          presupuesto_id: presupuestoId,
          mediciones: asignadas
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al aplicar al presupuesto")

      setApplySuccessMsg(`¡Éxito! Se sincronizaron ${data.updatedCount} rubros. Nuevo Costo Directo: $${Number(data.nuevoCostoDirecto).toFixed(2)} USD.`)
      await onMeasurementsApplied()
      showToast("Metrados volcados exitosamente al presupuesto.", "success")
    } catch (err: any) {
      console.error("Error al volcar mediciones:", err)
      alert("Error al volcar mediciones: " + (err.message || err))
    } finally {
      setIsApplying(false)
    }
  }

  // Exportar Memoria en PDF
  const handleExportTakeOffPdf = () => {
    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
      const pageWidth = doc.internal.pageSize.getWidth()

      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, pageWidth, 24, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(13)
      doc.text("GRUPO CONSTRUCTOR SARA · MEMORIA TÉCNICA DE CÓMPUTOS MÉTRICOS (TAKE-OFF 2D)", 14, 11)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(8.5)
      doc.setTextColor(148, 163, 184)
      doc.text(`OBRA: ${nombreProyecto.toUpperCase()}  |  PLANO: ${selectedBlueprint.toUpperCase()}  |  ESCALA: 1px = ${(scaleRatio * 100).toFixed(2)}cm`, 14, 18)

      const rows = mediciones.map((m, idx) => [
        String(idx + 1).padStart(2, '0'),
        m.nombre,
        m.tipo.toUpperCase(),
        `${m.resultado.toFixed(2)} ${m.unidad}`,
        m.precioUnitario ? `$${m.precioUnitario.toFixed(2)}` : '-',
        m.costoTotal ? `$${m.costoTotal.toFixed(2)}` : '-',
        m.rubro_codigo || 'SIN CÓDIGO',
        m.rubro_nombre || 'No asignado a rubro'
      ])

      autoTable(doc, {
        startY: 32,
        head: [["N°", "DESCRIPCIÓN DE LA FORMA / ZONA", "TIPO", "CANTIDAD", "P.U. ($)", "SUBTOTAL ($)", "CÓDIGO APU", "RUBRO ASIGNADO"]],
        body: rows,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold" }
      })

      doc.save(`Memoria_TakeOff_${nombreProyecto.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (e) {
      console.error("Error al exportar PDF:", e)
      alert("Error al generar el PDF de cubicación.")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      
      {/* 1. CABECERA PRINCIPAL */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md">
            <Square size={16} className="rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold tracking-tight">
                SARA Take-Off · Cómputos Métricos en Planos 2D
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Precisión Quirúrgica
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Proyecto: <strong className="text-slate-200">{nombreProyecto}</strong> · Calibra cotas reales, mide áreas y vuelca directamente al APU
            </p>
          </div>
        </div>

        {/* Acciones y Selector */}
        <div className="flex items-center gap-2">
          {/* Paginación si es PDF multi-página */}
          {uploadedImage && pdfTotalPages > 1 && (
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 text-xs text-white">
              <button
                type="button"
                disabled={pdfCurrentPage <= 1 || isRenderingPdf}
                onClick={() => handleChangePdfPage(pdfCurrentPage - 1)}
                className="p-1 hover:bg-slate-700 rounded disabled:opacity-30 cursor-pointer"
                title="Página anterior"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="font-mono text-[11px] px-1 font-bold">
                Pág. {pdfCurrentPage} / {pdfTotalPages}
              </span>
              <button
                type="button"
                disabled={pdfCurrentPage >= pdfTotalPages || isRenderingPdf}
                onClick={() => handleChangePdfPage(pdfCurrentPage + 1)}
                className="p-1 hover:bg-slate-700 rounded disabled:opacity-30 cursor-pointer"
                title="Página siguiente"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Selector de Plano */}
          <select
            value={selectedBlueprint}
            onChange={(e) => {
              setSelectedBlueprint(e.target.value)
              setUploadedImage(null)
              setCalibratedLine(null)
            }}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 outline-none"
          >
            {BLUEPRINTS_DEMO.map(b => (
              <option key={b.id} value={b.id}>{b.nombre}</option>
            ))}
            {uploadedImage && (
              <option value="custom">
                {`📄 Plano Subido ${pdfTotalPages > 1 ? `(Pág. ${pdfCurrentPage}/${pdfTotalPages})` : ''}`}
              </option>
            )}
          </select>

          {/* Botón Subir Archivo */}
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".pdf,image/png,image/jpeg,image/webp,image/jpg,.rvt,.pln,.pla,.ifc,.dwg" 
            className="hidden" 
            onChange={handleUploadBlueprint} 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Subir plano en PDF o Imagen (PNG, JPG)"
          >
            <Upload size={14} className="text-cyan-400" />
            <span>Subir Plano</span>
          </button>

          {/* Exportar Memoria en PDF */}
          <button
            onClick={handleExportTakeOffPdf}
            className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download size={14} />
            <span>Exportar PDF</span>
          </button>

          {/* Botón Cerrar */}
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* 2. BARRA DE HERRAMIENTAS INTERACTIVA COMPLETA */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        
        {/* Herramientas de Medición */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 font-bold">
          
          <button
            onClick={() => { setActiveTool('pan'); setCurrentPoints([]) }}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${activeTool === 'pan' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            title="Mover y arrastrar el plano"
          >
            <Hand size={14} />
            <span>Mano</span>
          </button>

          {/* Calibrar Escala */}
          <button
            onClick={() => { 
              setActiveTool('calibrate'); 
              setCalibrationPoints([]); 
              setIsCalibrating(true);
              setCurrentPoints([]);
              showToast("Haz clic en el 1er y 2do punto de una cota conocida del plano.", "info");
            }}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${activeTool === 'calibrate' ? 'bg-amber-600 text-white shadow-sm animate-pulse' : 'text-slate-400 hover:text-white'}`}
            title="Calibrar escala con una cota real conocida"
          >
            <Ruler size={14} className="text-amber-300" />
            <span>Calibrar Escala</span>
          </button>

          {/* Cinta Métrica Rápida (Revit / AutoCAD Measure) */}
          <button
            onClick={() => {
              setActiveTool('distancia')
              setQuickMeasurePoints([])
              setQuickMeasureResult(null)
              setCurrentPoints([])
              showToast("Cinta Métrica: Haz clic en 2 puntos para medir distancia directa, ΔX, ΔY y ángulo.", "info")
            }}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${activeTool === 'distancia' ? 'bg-cyan-600 text-white shadow-sm ring-1 ring-cyan-300' : 'text-slate-400 hover:text-white'}`}
            title="Cinta métrica rápida entre 2 referencias (sin alterar presupuesto)"
          >
            <Compass size={14} className="text-cyan-300" />
            <span>Cinta Métrica</span>
          </button>

          {/* Área Poligonal */}
          <button
            onClick={() => { setActiveTool('area'); setCurrentPoints([]) }}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${activeTool === 'area' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            title="Medir área poligonal irregular (m²)"
          >
            <Square size={14} className="text-emerald-300" />
            <span>Área (m²)</span>
          </button>

          {/* Rectángulo Rápido */}
          <button
            onClick={() => { setActiveTool('rectangulo'); setCurrentPoints([]) }}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${activeTool === 'rectangulo' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            title="Medir habitación rectangular en 2 clics (m²)"
          >
            <Maximize size={14} className="text-indigo-300" />
            <span>Rectángulo</span>
          </button>

          {/* Longitud Lineal */}
          <button
            onClick={() => { setActiveTool('longitud'); setCurrentPoints([]) }}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${activeTool === 'longitud' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            title="Medir tuberías, zócalos o trazados lineales (m)"
          >
            <Compass size={14} className="text-purple-300" />
            <span>Longitud (m)</span>
          </button>

          {/* Muros / Paredes */}
          <button
            onClick={() => { setActiveTool('pared'); setCurrentPoints([]) }}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${activeTool === 'pared' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            title="Medir mampostería con deducción de vanos (m²)"
          >
            <Layers size={14} className="text-amber-300" />
            <span>Paredes (m²)</span>
          </button>

          {/* Volumen Hormigón */}
          <button
            onClick={() => { setActiveTool('volumen'); setCurrentPoints([]) }}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${activeTool === 'volumen' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            title="Medir losas y plintos en volumen (m³)"
          >
            <Boxes size={14} className="text-cyan-300" />
            <span>Volumen (m³)</span>
          </button>

          {/* Conteo */}
          <button
            onClick={() => { setActiveTool('conteo'); setCurrentPoints([]) }}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${activeTool === 'conteo' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            title="Conteo de columnas, salidas eléctricas y artefactos (u)"
          >
            <Hash size={14} className="text-rose-300" />
            <span>Conteo (u)</span>
          </button>

          {/* SARA-VISION: AUTO-DETECTAR CON IA */}
          <button
            onClick={handleAiAutoDetect}
            disabled={isDetectingAi}
            className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition font-black bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-sm cursor-pointer disabled:opacity-50 ml-1"
            title="Auto-detectar recintos con IA adaptados al plano"
          >
            {isDetectingAi ? (
              <Loader2 size={14} className="animate-spin text-white" />
            ) : (
              <Sparkles size={14} className="text-yellow-300 animate-pulse" />
            )}
            <span>{isDetectingAi ? "Detectando..." : "🤖 Auto-Detectar con IA"}</span>
          </button>
        </div>

        {/* Ajustes Contextuales (Altura Pared, Espesor Losa, Lupa y Zoom) */}
        <div className="flex items-center gap-2.5">
          
          {/* Altura de Pared */}
          {activeTool === 'pared' && (
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold">Altura Pared:</span>
              <input
                type="number"
                step="0.05"
                min="0.5"
                max="10"
                value={wallHeight}
                onChange={(e) => setWallHeight(Number(e.target.value) || 2.6)}
                className="w-14 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-center font-mono font-bold text-amber-300 outline-none"
              />
              <span className="text-[10px] text-slate-500 font-bold">m</span>
            </div>
          )}

          {/* Espesor de Losa */}
          {activeTool === 'volumen' && (
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold">Espesor:</span>
              <input
                type="number"
                step="0.01"
                min="0.05"
                max="2"
                value={slabThickness}
                onChange={(e) => setSlabThickness(Number(e.target.value) || 0.15)}
                className="w-14 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-center font-mono font-bold text-cyan-300 outline-none"
              />
              <span className="text-[10px] text-slate-500 font-bold">m</span>
            </div>
          )}

          {/* Cruz de Mira Ortogonal Revit / AutoCAD */}
          <button
            onClick={() => setShowCrosshair(!showCrosshair)}
            className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition ${
              showCrosshair 
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Alternar cruz ortogonal continua estilo Revit / AutoCAD"
          >
            <Crosshair size={14} className={showCrosshair ? "text-cyan-400" : ""} />
            <span className="hidden sm:inline">Cruz Revit</span>
          </button>

          {/* Lupa de Precisión */}
          <button
            onClick={() => setIsMagnifierActive(!isMagnifierActive)}
            className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition ${
              isMagnifierActive 
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Activar lupa de precisión para apuntar a esquinas"
          >
            <Search size={14} />
            <span className="hidden sm:inline">Lupa</span>
          </button>

          {/* Indicador de Modo Orto (Shift) */}
          <div className={`px-2 py-1 rounded-xl border text-[10px] font-mono font-bold flex items-center gap-1 transition ${
            isOrthoActive 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse' 
              : 'bg-slate-950 text-slate-500 border-slate-800'
          }`}>
            <span>Orto [Shift]</span>
          </div>

          {/* Paleta de Color */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {PALETA_COLORES.map(col => (
              <button
                key={col.hex}
                onClick={() => setSelectedColor(col)}
                className={`w-5 h-5 rounded-md transition-all ${selectedColor.hex === col.hex ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                style={{ backgroundColor: col.hex }}
                title={col.nombre}
              />
            ))}
          </div>

          {/* Botones de Deshacer (Ctrl+Z) y Rehacer (Ctrl+Y) */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button 
              type="button"
              disabled={!canUndo}
              onClick={handleUndo}
              className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-slate-500 hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title={currentPoints.length > 0 ? "Deshacer último vértice (Ctrl+Z)" : "Deshacer última capa (Ctrl+Z)"}
            >
              <Undo2 size={14} className="text-amber-400" />
              <span className="hidden sm:inline">Deshacer</span>
              <kbd className="hidden md:inline text-[9px] bg-slate-800 px-1 py-0.5 rounded text-slate-400 font-mono">^Z</kbd>
            </button>
            <button 
              type="button"
              disabled={!canRedo}
              onClick={handleRedo}
              className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-cyan-400 disabled:opacity-30 disabled:hover:text-slate-500 hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Rehacer capa (Ctrl+Y / Ctrl+Shift+Z)"
            >
              <Redo2 size={14} className="text-cyan-400" />
              <span className="hidden sm:inline">Rehacer</span>
              <kbd className="hidden md:inline text-[9px] bg-slate-800 px-1 py-0.5 rounded text-slate-400 font-mono">^Y</kbd>
            </button>
          </div>

          {/* Limpiar Capas */}
          {mediciones.length > 0 && (
            <button 
              onClick={() => {
                if (window.confirm("¿Deseas limpiar todas las capas de medición de este plano?")) {
                  updateMedicionesWithHistory([])
                  setCurrentPoints([])
                }
              }}
              className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              title="Limpiar todas las capas"
            >
              <Trash2 size={13} />
              <span className="hidden sm:inline">Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. ÁREA DE TRABAJO: LIENZO (CANVAS) + PANEL LATERAL */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LIENZO DE VISUALIZACIÓN Y MEDICIÓN CON BARRAS DE NAVEGACIÓN */}
        <div 
          ref={canvasContainerRef}
          className="flex-1 flex flex-col overflow-hidden relative bg-slate-950 select-none"
        >
          {/* ÁREA SUPERIOR: SVG + BARRA DE DESPLAZAMIENTO VERTICAL (SCROLLBAR Y) */}
          <div className="flex-1 flex overflow-hidden relative">
            <div 
              className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove as any}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
            >
          {/* Toast informativo flotante */}
          {toastMsg && (
            <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl border text-xs font-bold shadow-xl animate-in slide-in-from-top-3 flex items-center gap-2 ${
              toastMsg.type === 'success' ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40' :
              toastMsg.type === 'error' ? 'bg-rose-950/90 text-rose-300 border-rose-500/40' :
              'bg-slate-900/95 text-cyan-300 border-cyan-500/40'
            }`}>
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{toastMsg.text}</span>
            </div>
          )}

          {/* Aviso Flotante de Modo Activo */}
          <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-xs flex items-center gap-2.5 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-slate-200 font-semibold">
              {activeTool === 'pan' && "Modo Navegación: Arrastra el lienzo con el ratón"}
              {activeTool === 'calibrate' && (
                calibrationPoints.length === 0 
                  ? "Paso 1: Haz clic en el 1er punto de una cota conocida" 
                  : "Paso 2: Haz clic en el 2do punto de la cota (o mantén Shift para 90°)"
              )}
              {activeTool === 'area' && "Modo Área: Clic en esquinas (Doble clic o clic en primer vértice para cerrar)"}
              {activeTool === 'rectangulo' && (currentPoints.length === 0 ? "Modo Rectángulo: Clic en la primera esquina" : "Modo Rectángulo: Clic en la esquina opuesta")}
              {activeTool === 'longitud' && "Modo Longitud: Clic a lo largo del trazado (Doble clic para terminar)"}
              {activeTool === 'pared' && "Modo Paredes: Clic en los ejes de mampostería (Doble clic para terminar)"}
              {activeTool === 'volumen' && "Modo Volumen Hormigón: Clic en esquinas de la losa/zapata (Doble clic para cerrar)"}
              {activeTool === 'conteo' && "Modo Conteo: Clic sobre columnas o puntos técnicos"}
            </span>

            {currentPoints.length > 0 && (
              <button
                onClick={() => {
                  if (activeTool === 'area' || activeTool === 'volumen') cerrarPoligono()
                  if (activeTool === 'pared') cerrarPared()
                  if (activeTool === 'longitud') cerrarLongitud()
                }}
                className="ml-2 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition"
              >
                Finalizar ({currentPoints.length} pts)
              </button>
            )}
          </div>

          {/* Cota Calibrada Activa (Indicador Flotante) */}
          {calibratedLine && (
            <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/30 text-xs flex items-center gap-2 shadow-lg text-amber-300 font-mono">
              <Ruler size={14} className="text-amber-400" />
              <span>Escala Activa: 1px = {(scaleRatio * 100).toFixed(2)}cm (Calibrada a {calibratedLine.meters}m)</span>
              <button
                onClick={() => {
                  setActiveTool('calibrate')
                  setCalibrationPoints([])
                  setIsCalibrating(true)
                }}
                className="ml-1 text-[10px] uppercase font-bold text-slate-400 hover:text-white underline"
              >
                Re-calibrar
              </button>
            </div>
          )}

          {/* SVG INTERACTIVO */}
          <svg
            ref={svgRef}
            onClick={handleCanvasClick}
            onDoubleClick={handleCanvasDoubleClick}
            className={`w-full h-full ${activeTool === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
          >
            <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoom})`}>
              
              {/* 1. PLANO DE FONDO (PDF renderizado o vectorial demo) */}
              {uploadedImage ? (
                <image 
                  href={uploadedImage} 
                  x={0} 
                  y={0} 
                  width={blueprintDimensions.width} 
                  height={blueprintDimensions.height} 
                />
              ) : selectedBlueprint === 'planta-baja' ? (
                /* PLANO ARQUITECTÓNICO VECTORIAL DEMO (Villa 120m²) */
                <g id="plano-arquitectura" className="opacity-95">
                  <rect x={60} y={60} width={880} height={580} fill="#0f172a" stroke="#334155" strokeWidth={2} />
                  <line x1={120} y1={90} x2={840} y2={90} stroke="#64748b" strokeWidth={1} strokeDasharray="4 4" />
                  <text x={480} y={80} fill="#94a3b8" fontSize={11} textAnchor="middle" fontWeight="bold">COTA TOTAL: 12.00 m</text>
                  
                  <line x1={90} y1={140} x2={90} y2={560} stroke="#64748b" strokeWidth={1} strokeDasharray="4 4" />
                  <text x={75} y={350} fill="#94a3b8" fontSize={11} textAnchor="middle" transform="rotate(-90 75 350)" fontWeight="bold">COTA TOTAL: 7.00 m</text>

                  {/* Muros Exteriores */}
                  <rect x={120} y={140} width={720} height={420} fill="#1e293b" stroke="#f8fafc" strokeWidth={4} />

                  {/* Sala - Comedor */}
                  <rect x={120} y={140} width={360} height={240} fill="#1e293b" stroke="#cbd5e1" strokeWidth={2.5} />
                  <text x={300} y={260} fill="#e2e8f0" fontSize={14} fontWeight="900" textAnchor="middle">SALA - COMEDOR</text>
                  <text x={300} y={280} fill="#94a3b8" fontSize={10} textAnchor="middle">NPT +0.15 · Área est: 38.80 m²</text>

                  {/* Cocina */}
                  <rect x={480} y={140} width={220} height={240} fill="#1e293b" stroke="#cbd5e1" strokeWidth={2.5} />
                  <text x={590} y={260} fill="#e2e8f0" fontSize={13} fontWeight="900" textAnchor="middle">COCINA</text>

                  {/* Baño Social */}
                  <rect x={700} y={140} width={140} height={140} fill="#1e293b" stroke="#cbd5e1" strokeWidth={2.5} />
                  <text x={770} y={210} fill="#e2e8f0" fontSize={11} fontWeight="800" textAnchor="middle">B. SOCIAL</text>

                  {/* Dormitorio Master */}
                  <rect x={120} y={380} width={400} height={180} fill="#1e293b" stroke="#cbd5e1" strokeWidth={2.5} />
                  <text x={320} y={470} fill="#e2e8f0" fontSize={13} fontWeight="900" textAnchor="middle">DORMITORIO MASTER</text>

                  {/* Dormitorio 2 */}
                  <rect x={520} y={380} width={320} height={180} fill="#1e293b" stroke="#cbd5e1" strokeWidth={2.5} />
                  <text x={680} y={470} fill="#e2e8f0" fontSize={13} fontWeight="900" textAnchor="middle">DORMITORIO 2</text>

                  {/* Columnas */}
                  {[
                    {x: 120, y: 140}, {x: 480, y: 140}, {x: 840, y: 140},
                    {x: 120, y: 380}, {x: 480, y: 380}, {x: 840, y: 380},
                    {x: 120, y: 560}, {x: 520, y: 560}, {x: 840, y: 560}
                  ].map((col, idx) => (
                    <g key={idx}>
                      <rect x={col.x - 9} y={col.y - 9} width={18} height={18} fill="#ef4444" stroke="#ffffff" strokeWidth={1} />
                      <text x={col.x} y={col.y - 12} fill="#fca5a5" fontSize={8} fontWeight="bold" textAnchor="middle">C1</text>
                    </g>
                  ))}
                </g>
              ) : (
                /* ESTRUCTURAL CIMENTACIÓN DEMO */
                <g id="plano-cimentacion" className="opacity-95">
                  <rect x={60} y={60} width={880} height={580} fill="#0f172a" stroke="#1e293b" strokeWidth={2} />
                  <rect x={120} y={140} width={720} height={420} fill="#111827" stroke="#38bdf8" strokeWidth={3} strokeDasharray="6 4" />
                  <text x={480} y={350} fill="#38bdf8" fontSize={16} fontWeight="bold" textAnchor="middle">LOSA DE CIMENTACIÓN & ZAPATAS</text>
                </g>
              )}

              {/* 2. COTA DE CALIBRACIÓN PERMANENTE */}
              {calibratedLine && (
                <g id="cota-calibracion">
                  <line 
                    x1={calibratedLine.p1.x} 
                    y1={calibratedLine.p1.y} 
                    x2={calibratedLine.p2.x} 
                    y2={calibratedLine.p2.y} 
                    stroke="#f59e0b" 
                    strokeWidth={2.5} 
                    strokeDasharray="4 2" 
                  />
                  <circle cx={calibratedLine.p1.x} cy={calibratedLine.p1.y} r={4} fill="#f59e0b" />
                  <circle cx={calibratedLine.p2.x} cy={calibratedLine.p2.y} r={4} fill="#f59e0b" />
                  {/* Etiqueta flotante */}
                  <rect 
                    x={(calibratedLine.p1.x + calibratedLine.p2.x) / 2 - 40} 
                    y={(calibratedLine.p1.y + calibratedLine.p2.y) / 2 - 16} 
                    width={80} 
                    height={18} 
                    rx={4} 
                    fill="#1e293b" 
                    stroke="#f59e0b" 
                    strokeWidth={1} 
                  />
                  <text 
                    x={(calibratedLine.p1.x + calibratedLine.p2.x) / 2} 
                    y={(calibratedLine.p1.y + calibratedLine.p2.y) / 2 - 3} 
                    fill="#fef08a" 
                    fontSize={10} 
                    fontWeight="bold" 
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    ◄ {calibratedLine.meters} m ►
                  </text>
                </g>
              )}

              {/* 3. CAPAS DE MEDICIONES CONFIRMADAS */}
              {mediciones.map((m) => {
                if (m.visible === false) return null
                const isSelected = selectedMedicionId === m.id
                const centroid = getPolygonCentroid(m.puntos)

                if (m.tipo === 'area' || m.tipo === 'rectangulo' || m.tipo === 'volumen') {
                  const pointsStr = m.puntos.map(p => `${p.x},${p.y}`).join(' ')
                  return (
                    <g 
                      key={m.id} 
                      onClick={(e) => {
                        e.stopPropagation()
                        if (currentPoints.length === 0 && activeTool !== 'calibrate') {
                          setSelectedMedicionId(m.id)
                        }
                      }}
                      className="transition-opacity hover:opacity-95 cursor-pointer"
                    >
                      {/* Halo de selección */}
                      {isSelected && (
                        <polygon 
                          points={pointsStr} 
                          fill="none" 
                          stroke="#22d3ee" 
                          strokeWidth={4.5} 
                          strokeDasharray="6 3"
                        />
                      )}
                      <polygon 
                        points={pointsStr} 
                        fill={m.color} 
                        fillOpacity={isSelected ? 0.45 : 0.32} 
                        stroke={isSelected ? "#38bdf8" : m.color} 
                        strokeWidth={isSelected ? 2.5 : 2} 
                      />
                      {/* Vértices */}
                      {m.puntos.map((pt, pIdx) => (
                        <circle key={pIdx} cx={pt.x} cy={pt.y} r={isSelected ? 4 : 3} fill="#ffffff" stroke={isSelected ? "#22d3ee" : m.color} strokeWidth={1.5} />
                      ))}
                      {/* Etiqueta de Metrado */}
                      <rect 
                        x={centroid.x - 36} 
                        y={centroid.y - 12} 
                        width={72} 
                        height={24} 
                        rx={6} 
                        fill="#0f172a" 
                        fillOpacity={0.92} 
                        stroke={isSelected ? "#22d3ee" : m.color} 
                        strokeWidth={isSelected ? 2 : 1.5} 
                      />
                      <text 
                        x={centroid.x} 
                        y={centroid.y + 4} 
                        fill="#ffffff" 
                        fontSize={11} 
                        fontWeight="bold" 
                        textAnchor="middle"
                      >
                        {m.resultado} {m.unidad}
                      </text>
                    </g>
                  )
                }

                if (m.tipo === 'pared' || m.tipo === 'longitud') {
                  return (
                    <g 
                      key={m.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (currentPoints.length === 0 && activeTool !== 'calibrate') {
                          setSelectedMedicionId(m.id)
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {m.puntos.map((pt, idx) => {
                        if (idx === m.puntos.length - 1) return null
                        const next = m.puntos[idx + 1]
                        return (
                          <g key={idx}>
                            {isSelected && (
                              <line 
                                x1={pt.x} 
                                y1={pt.y} 
                                x2={next.x} 
                                y2={next.y} 
                                stroke="#22d3ee" 
                                strokeWidth={7} 
                                strokeLinecap="round" 
                                opacity={0.6}
                              />
                            )}
                            <line 
                              x1={pt.x} 
                              y1={pt.y} 
                              x2={next.x} 
                              y2={next.y} 
                              stroke={isSelected ? "#38bdf8" : m.color} 
                              strokeWidth={4} 
                              strokeLinecap="round" 
                            />
                          </g>
                        )
                      })}
                      {m.puntos.map((pt, pIdx) => (
                        <circle key={pIdx} cx={pt.x} cy={pt.y} r={isSelected ? 5 : 4} fill="#ffffff" stroke={isSelected ? "#22d3ee" : m.color} strokeWidth={2} />
                      ))}
                      {/* Etiqueta */}
                      <rect 
                        x={centroid.x - 45} 
                        y={centroid.y - 20} 
                        width={90} 
                        height={18} 
                        rx={4} 
                        fill="#0f172a" 
                        fillOpacity={0.92} 
                        stroke={isSelected ? "#22d3ee" : m.color} 
                        strokeWidth={isSelected ? 2 : 1} 
                      />
                      <text 
                        x={centroid.x} 
                        y={centroid.y - 7} 
                        fill="#ffffff" 
                        fontSize={9} 
                        fontWeight="bold" 
                        textAnchor="middle"
                      >
                        {m.resultado} {m.unidad} {m.tipo === 'pared' ? `(${m.alturaPared}m alt)` : ''}
                      </text>
                    </g>
                  )
                }

                if (m.tipo === 'conteo') {
                  const pt = m.puntos[0]
                  return (
                    <g 
                      key={m.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (currentPoints.length === 0 && activeTool !== 'calibrate') {
                          setSelectedMedicionId(m.id)
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {isSelected && (
                        <circle cx={pt.x} cy={pt.y} r={16} fill="none" stroke="#22d3ee" strokeWidth={2} strokeDasharray="3 3" />
                      )}
                      <circle cx={pt.x} cy={pt.y} r={8} fill={m.color} stroke="#ffffff" strokeWidth={2} />
                      <circle cx={pt.x} cy={pt.y} r={14} fill="none" stroke={m.color} strokeWidth={1} strokeDasharray="2 2" className="animate-spin" />
                      <text x={pt.x} y={pt.y + 3} fill="#ffffff" fontSize={9} fontWeight="bold" textAnchor="middle">✓</text>
                    </g>
                  )
                }

                return null
              })}

              {/* 4. DIBUJO EN PROGRESO */}
              {currentPoints.length > 0 && (
                <g id="drawing-in-progress">
                  {/* Líneas entre puntos confirmados */}
                  {currentPoints.map((pt, idx) => {
                    if (idx === currentPoints.length - 1) return null
                    const next = currentPoints[idx + 1]
                    return (
                      <line 
                        key={idx} 
                        x1={pt.x} 
                        y1={pt.y} 
                        x2={next.x} 
                        y2={next.y} 
                        stroke={selectedColor.hex} 
                        strokeWidth={2.5} 
                      />
                    )
                  })}

                  {/* Línea elástica hacia el cursor */}
                  {cursorPos && (
                    <line 
                      x1={currentPoints[currentPoints.length - 1].x} 
                      y1={currentPoints[currentPoints.length - 1].y} 
                      x2={cursorPos.x} 
                      y2={cursorPos.y} 
                      stroke={selectedColor.hex} 
                      strokeWidth={1.5} 
                      strokeDasharray="4 3" 
                    />
                  )}

                  {/* Rectángulo elástico en modo rectangulo */}
                  {activeTool === 'rectangulo' && cursorPos && currentPoints.length === 1 && (
                    <rect
                      x={Math.min(currentPoints[0].x, cursorPos.x)}
                      y={Math.min(currentPoints[0].y, cursorPos.y)}
                      width={Math.abs(cursorPos.x - currentPoints[0].x)}
                      height={Math.abs(cursorPos.y - currentPoints[0].y)}
                      fill={selectedColor.hex}
                      fillOpacity={0.2}
                      stroke={selectedColor.hex}
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Vértices */}
                  {currentPoints.map((pt, idx) => (
                    <circle key={idx} cx={pt.x} cy={pt.y} r={4.5} fill="#ffffff" stroke={selectedColor.hex} strokeWidth={2} />
                  ))}

                  {/* 4.5. INDICADOR FLOTANTE DE COTA EN TIEMPO REAL JUNTO AL CURSOR */}
                  {cursorPos && (
                    <g id="live-cursor-hud">
                      {activeTool === 'rectangulo' && currentPoints.length === 1 && (
                        (() => {
                          const p1 = currentPoints[0]
                          const wM = (Math.abs(cursorPos.x - p1.x) * scaleRatio).toFixed(2)
                          const hM = (Math.abs(cursorPos.y - p1.y) * scaleRatio).toFixed(2)
                          const aM2 = (Number(wM) * Number(hM)).toFixed(2)
                          return (
                            <g transform={`translate(${cursorPos.x + 14}, ${cursorPos.y - 12})`}>
                              <rect x={0} y={-14} width={100} height={22} rx={5} fill="#090d16" fillOpacity={0.92} stroke="#818cf8" strokeWidth={1} />
                              <text x={50} y={1} fill="#e0e7ff" fontSize={10} fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                                {wM}m × {hM}m ({aM2} m²)
                              </text>
                            </g>
                          )
                        })()
                      )}

                      {(activeTool === 'pared' || activeTool === 'longitud') && (
                        (() => {
                          const lastPt = currentPoints[currentPoints.length - 1]
                          const distM = (calculateDistancePx(lastPt, cursorPos) * scaleRatio).toFixed(2)
                          return (
                            <g transform={`translate(${cursorPos.x + 14}, ${cursorPos.y - 12})`}>
                              <rect x={0} y={-14} width={68} height={22} rx={5} fill="#090d16" fillOpacity={0.92} stroke="#38bdf8" strokeWidth={1} />
                              <text x={34} y={1} fill="#38bdf8" fontSize={10} fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                                📏 {distM} m
                              </text>
                            </g>
                          )
                        })()
                      )}

                      {(activeTool === 'area' || activeTool === 'volumen') && (
                        (() => {
                          const lastPt = currentPoints[currentPoints.length - 1]
                          const distM = (calculateDistancePx(lastPt, cursorPos) * scaleRatio).toFixed(2)
                          const isNearStart = currentPoints.length >= 3 && calculateDistancePx(cursorPos, currentPoints[0]) < 20 / zoom
                          return (
                            <g transform={`translate(${cursorPos.x + 14}, ${cursorPos.y - 12})`}>
                              <rect x={0} y={-14} width={isNearStart ? 116 : 74} height={22} rx={5} fill="#090d16" fillOpacity={0.92} stroke={isNearStart ? "#10b981" : "#06b6d4"} strokeWidth={1.5} />
                              <text x={isNearStart ? 58 : 37} y={1} fill={isNearStart ? "#a7f3d0" : "#67e8f9"} fontSize={10} fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                                {isNearStart ? "✓ Clic para cerrar" : `Seg: ${distM} m`}
                              </text>
                            </g>
                          )
                        })()
                      )}
                    </g>
                  )}
                </g>
              )}

              {/* 5. TRAZO EN PROGRESO DE CALIBRACIÓN */}
              {activeTool === 'calibrate' && calibrationPoints.length === 1 && cursorPos && (
                <g id="calibrating-rubberband">
                  <line 
                    x1={calibrationPoints[0].x} 
                    y1={calibrationPoints[0].y} 
                    x2={cursorPos.x} 
                    y2={cursorPos.y} 
                    stroke="#f59e0b" 
                    strokeWidth={2} 
                    strokeDasharray="5 3" 
                  />
                  <circle cx={calibrationPoints[0].x} cy={calibrationPoints[0].y} r={5} fill="#f59e0b" stroke="#ffffff" strokeWidth={2} />
                  <circle cx={cursorPos.x} cy={cursorPos.y} r={5} fill="#f59e0b" stroke="#ffffff" strokeWidth={2} />
                  {/* Distancia en píxeles temporal */}
                  <text 
                    x={(calibrationPoints[0].x + cursorPos.x) / 2} 
                    y={(calibrationPoints[0].y + cursorPos.y) / 2 - 8} 
                    fill="#fef08a" 
                    fontSize={10} 
                    fontWeight="bold" 
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {Math.round(calculateDistancePx(calibrationPoints[0], cursorPos))} px
                  </text>
                </g>
              )}

              {/* 6. INDICADOR DE SNAP MAGNÉTICO */}
              {snappedPoint && (
                <g id="magnetic-snap-indicator">
                  <rect 
                    x={snappedPoint.x - 6} 
                    y={snappedPoint.y - 6} 
                    width={12} 
                    height={12} 
                    fill="none" 
                    stroke="#06b6d4" 
                    strokeWidth={2} 
                    className="animate-pulse"
                  />
                  <circle cx={snappedPoint.x} cy={snappedPoint.y} r={2} fill="#06b6d4" />
                </g>
              )}

              {/* 7. CINTA MÉTRICA RÁPIDA: TRAZO EN PROGRESO (REVIT MEASURE) */}
              {activeTool === 'distancia' && quickMeasurePoints.length === 1 && cursorPos && (
                <g id="quick-measure-rubberband" pointerEvents="none">
                  <line 
                    x1={quickMeasurePoints[0].x} 
                    y1={quickMeasurePoints[0].y} 
                    x2={cursorPos.x} 
                    y2={cursorPos.y} 
                    stroke="#22d3ee" 
                    strokeWidth={2} 
                    strokeDasharray="4 3" 
                  />
                  <circle cx={quickMeasurePoints[0].x} cy={quickMeasurePoints[0].y} r={5} fill="#0891b2" stroke="#ffffff" strokeWidth={2} />
                  <circle cx={cursorPos.x} cy={cursorPos.y} r={5} fill="#22d3ee" stroke="#ffffff" strokeWidth={2} />
                  {(() => {
                    const distPx = calculateDistancePx(quickMeasurePoints[0], cursorPos)
                    const distM = (distPx * scaleRatio).toFixed(3)
                    const midX = (quickMeasurePoints[0].x + cursorPos.x) / 2
                    const midY = (quickMeasurePoints[0].y + cursorPos.y) / 2
                    return (
                      <g transform={`translate(${midX}, ${midY - 14})`}>
                        <rect x={-45} y={-10} width={90} height={20} rx={4} fill="#020617" fillOpacity={0.94} stroke="#22d3ee" strokeWidth={1} />
                        <text x={0} y={4} fill="#67e8f9" fontSize={10} fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          📏 {distM} m
                        </text>
                      </g>
                    )
                  })()}
                </g>
              )}

              {/* 8. CINTA MÉTRICA RÁPIDA: COTA CONFIRMADA ENTRE 2 REFERENCIAS */}
              {quickMeasureResult && (
                <g id="quick-measure-confirmed" pointerEvents="none">
                  <line
                    x1={quickMeasureResult.p1.x}
                    y1={quickMeasureResult.p1.y}
                    x2={quickMeasureResult.p2.x}
                    y2={quickMeasureResult.p2.y}
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                  />
                  {/* Ticks arquitectónicos de 45° en extremos */}
                  <line
                    x1={quickMeasureResult.p1.x - 7}
                    y1={quickMeasureResult.p1.y + 7}
                    x2={quickMeasureResult.p1.x + 7}
                    y2={quickMeasureResult.p1.y - 7}
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                  />
                  <line
                    x1={quickMeasureResult.p2.x - 7}
                    y1={quickMeasureResult.p2.y + 7}
                    x2={quickMeasureResult.p2.x + 7}
                    y2={quickMeasureResult.p2.y - 7}
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                  />
                  <circle cx={quickMeasureResult.p1.x} cy={quickMeasureResult.p1.y} r={3} fill="#ffffff" />
                  <circle cx={quickMeasureResult.p2.x} cy={quickMeasureResult.p2.y} r={3} fill="#ffffff" />

                  {/* Etiqueta dimensional arquitectónica con distancias y ángulos */}
                  {(() => {
                    const midX = (quickMeasureResult.p1.x + quickMeasureResult.p2.x) / 2
                    const midY = (quickMeasureResult.p1.y + quickMeasureResult.p2.y) / 2
                    return (
                      <g transform={`translate(${midX}, ${midY - 18})`}>
                        <rect x={-75} y={-14} width={150} height={28} rx={6} fill="#090d16" fillOpacity={0.96} stroke="#06b6d4" strokeWidth={1.5} />
                        <text x={0} y={-1} fill="#ffffff" fontSize={11} fontWeight="900" fontFamily="monospace" textAnchor="middle">
                          📏 {quickMeasureResult.distanceM} m
                        </text>
                        <text x={0} y={10} fill="#94a3b8" fontSize={8.5} fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          ΔX: {quickMeasureResult.deltaXM}m · ΔY: {quickMeasureResult.deltaYM}m · {quickMeasureResult.angleDeg}°
                        </text>
                      </g>
                    )
                  })()}
                </g>
              )}

              {/* 9. MIRA EN CRUZ ORTOGONAL CONTINUA (REVIT / AUTOCAD CROSSHAIRS) */}
              {showCrosshair && cursorPos && (
                <g id="revit-infinite-crosshairs" pointerEvents="none" opacity={0.65}>
                  <line
                    x1={-10000}
                    y1={cursorPos.y}
                    x2={10000}
                    y2={cursorPos.y}
                    stroke="#38bdf8"
                    strokeWidth={0.8}
                    strokeDasharray="6 4"
                  />
                  <line
                    x1={cursorPos.x}
                    y1={-10000}
                    x2={cursorPos.x}
                    y2={10000}
                    stroke="#38bdf8"
                    strokeWidth={0.8}
                    strokeDasharray="6 4"
                  />
                  <circle
                    cx={cursorPos.x}
                    cy={cursorPos.y}
                    r={5}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth={1}
                  />
                </g>
              )}

            </g>
          </svg>

          {/* LUPA DE PRECISIÓN FLOTANTE (ZOOM LENS) */}
          {isMagnifierActive && cursorPos && (
            <div className="absolute bottom-16 right-3 z-20 w-40 h-40 rounded-2xl bg-slate-900 border-2 border-cyan-400 overflow-hidden shadow-2xl pointer-events-none flex items-center justify-center">
              <svg className="w-full h-full bg-slate-950">
                <g transform={`scale(3.5) translate(${-cursorPos.x + 20}, ${-cursorPos.y + 20})`}>
                  {uploadedImage ? (
                    <image href={uploadedImage} x={0} y={0} width={blueprintDimensions.width} height={blueprintDimensions.height} />
                  ) : null}
                </g>
                {/* Cruz de mira de precisión */}
                <line x1={80} y1={20} x2={80} y2={140} stroke="#22d3ee" strokeWidth={1} strokeDasharray="3 3" />
                <line x1={20} y1={80} x2={140} y2={80} stroke="#22d3ee" strokeWidth={1} strokeDasharray="3 3" />
                <circle cx={80} cy={80} r={4} fill="none" stroke="#22d3ee" strokeWidth={1.5} />
              </svg>
              <div className="absolute top-1 left-2 text-[9px] font-mono font-bold text-cyan-300 bg-slate-900/80 px-1 rounded">
                Lupa 3.5x
              </div>
            </div>
          )}

          {/* HUD FLOTANTE DE ZOOM, NAVEGACIÓN Y DESHACER EXCLUSIVO DEL ÁREA DEL PLANO */}
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-slate-700/80 shadow-2xl text-white select-none">
            
            {/* Deshacer (Ctrl+Z) */}
            <button
              type="button"
              disabled={!canUndo}
              onClick={handleUndo}
              className="p-1.5 rounded-xl hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 hover:text-amber-400 transition cursor-pointer"
              title={currentPoints.length > 0 ? "Deshacer último vértice (Ctrl+Z o Backspace)" : "Deshacer última acción (Ctrl+Z)"}
            >
              <Undo2 size={16} />
            </button>

            {/* Rehacer (Ctrl+Y) */}
            <button
              type="button"
              disabled={!canRedo}
              onClick={handleRedo}
              className="p-1.5 rounded-xl hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 hover:text-cyan-400 transition cursor-pointer"
              title="Rehacer acción (Ctrl+Y o Ctrl+Shift+Z)"
            >
              <Redo2 size={16} />
            </button>

            <div className="w-px h-5 bg-slate-700 mx-0.5" />

            {/* Zoom Out (-) */}
            <button
              type="button"
              onClick={() => setZoom(prev => Math.max(0.25, Number((prev - 0.15).toFixed(2))))}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title="Alejar plano (Rueda de ratón hacia abajo)"
            >
              <ZoomOut size={16} />
            </button>

            {/* Porcentaje y Reset 100% */}
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="px-2 py-1 rounded-lg hover:bg-slate-800 font-mono text-[11px] font-bold text-cyan-300 hover:text-white transition cursor-pointer"
              title="Restablecer zoom al 100% (1:1)"
            >
              {Math.round(zoom * 100)}%
            </button>

            {/* Zoom In (+) */}
            <button
              type="button"
              onClick={() => setZoom(prev => Math.min(4.0, Number((prev + 0.15).toFixed(2))))}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title="Acercar plano (Rueda de ratón hacia arriba)"
            >
              <ZoomIn size={16} />
            </button>

            <div className="w-px h-5 bg-slate-700 mx-0.5" />

            {/* Ajustar a Pantalla (Fit to Screen) */}
            <button
              type="button"
              onClick={handleFitToScreen}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-emerald-400 transition cursor-pointer"
              title="Ajustar plano a toda la pantalla (Centrar)"
            >
              <Focus size={16} />
            </button>

            {/* Lupa 3.5x */}
            <button
              type="button"
              onClick={() => setIsMagnifierActive(prev => !prev)}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                isMagnifierActive 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' 
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Activar / Desactivar lupa de precisión (tecla L)"
            >
              <Search size={16} />
            </button>

            {/* Atajos de Teclado Modal */}
            <button
              type="button"
              onClick={() => setIsShortcutsModalOpen(true)}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-indigo-400 transition cursor-pointer"
              title="Ver atajos de teclado y ayuda rápida"
            >
              <Keyboard size={16} />
            </button>
          </div>

        </div>

        {/* BARRA DE DESPLAZAMIENTO VERTICAL (SCROLLBAR Y) */}
        <div className="w-4 bg-slate-900 border-l border-slate-800 flex flex-col justify-between items-center py-0.5 select-none shrink-0 z-20">
          {/* Botón arriba ▲ */}
          <button
            type="button"
            onClick={() => stepPanY(50)}
            className="w-3.5 h-3.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded flex items-center justify-center text-[9px] transition cursor-pointer"
            title="Desplazar hacia arriba"
          >
            ▲
          </button>

          {/* Pista Vertical (Track Y) */}
          <div 
            className="flex-1 w-full relative cursor-pointer my-0.5 flex justify-center"
            onPointerDown={handleScrollTrackYPointerDown}
          >
            {/* Deslizador (Thumb Y) */}
            <div
              onPointerDown={handleScrollThumbYPointerDown}
              className={`w-2.5 rounded-full transition-colors cursor-grab active:cursor-grabbing absolute ${
                isDraggingScrollY ? 'bg-cyan-400' : 'bg-slate-600 hover:bg-slate-500'
              }`}
              style={{
                height: `${thumbHeightPercent}%`,
                top: `${scrollFractionY * (100 - thumbHeightPercent)}%`
              }}
              title="Arrastrar para navegar verticalmente"
            />
          </div>

          {/* Botón abajo ▼ */}
          <button
            type="button"
            onClick={() => stepPanY(-50)}
            className="w-3.5 h-3.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded flex items-center justify-center text-[9px] transition cursor-pointer"
            title="Desplazar hacia abajo"
          >
            ▼
          </button>
        </div>
      </div>

      {/* ÁREA INFERIOR: BARRA DE DESPLAZAMIENTO HORIZONTAL (SCROLLBAR X) + ESQUINA */}
      <div className="h-4 bg-slate-900 border-t border-slate-800 flex items-center select-none shrink-0 z-20">
        {/* Botón izquierda ◄ */}
        <button
          type="button"
          onClick={() => stepPanX(50)}
          className="w-3.5 h-3.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded flex items-center justify-center text-[9px] transition cursor-pointer ml-0.5"
          title="Desplazar a la izquierda"
        >
          ◄
        </button>

        {/* Pista Horizontal (Track X) */}
        <div 
          className="flex-1 h-full relative cursor-pointer mx-1 flex items-center"
          onPointerDown={handleScrollTrackXPointerDown}
        >
          {/* Deslizador (Thumb X) */}
          <div
            onPointerDown={handleScrollThumbXPointerDown}
            className={`h-2.5 rounded-full transition-colors cursor-grab active:cursor-grabbing absolute ${
              isDraggingScrollX ? 'bg-cyan-400' : 'bg-slate-600 hover:bg-slate-500'
            }`}
            style={{
              width: `${thumbWidthPercent}%`,
              left: `${scrollFractionX * (100 - thumbWidthPercent)}%`
            }}
            title="Arrastrar para navegar horizontalmente"
          />
        </div>

        {/* Botón derecha ► */}
        <button
          type="button"
          onClick={() => stepPanX(-50)}
          className="w-3.5 h-3.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded flex items-center justify-center text-[9px] transition cursor-pointer mr-0.5"
          title="Desplazar a la derecha"
        >
          ►
        </button>

        {/* Esquina de unión */}
        <div className="w-4 h-full bg-slate-950 border-l border-slate-800 shrink-0 flex items-center justify-center text-[8px] text-slate-600 select-none">
          ◰
        </div>
      </div>
    </div>

        {/* PANEL LATERAL: CÓMPUTOS MÉTRICOS & APUS */}
        <div className="w-80 md:w-96 bg-slate-900 border-l border-slate-800 flex flex-col justify-between shrink-0 overflow-hidden">
          
          {/* Cabecera del Panel */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-cyan-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                Capas de Metrado ({mediciones.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold">
              Escala: 1px = {(scaleRatio * 100).toFixed(2)}cm
            </span>
          </div>

          {/* Lista de Mediciones */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {mediciones.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <Square size={28} className="mx-auto text-slate-600 opacity-50" />
                <p className="text-xs font-semibold">No hay mediciones registradas en este plano.</p>
                <p className="text-[11px] text-slate-600">
                  Selecciona una herramienta (Área, Rectángulo, Paredes, Conteo) y haz clic sobre el plano para comenzar.
                </p>
              </div>
            ) : (
              mediciones.map((m) => {
                const isSelected = selectedMedicionId === m.id
                return (
                  <div 
                    key={m.id} 
                    onClick={() => setSelectedMedicionId(m.id)}
                    className={`bg-slate-950 p-3.5 rounded-2xl border space-y-2.5 transition shadow-sm cursor-pointer ${
                      isSelected 
                        ? 'border-cyan-400 ring-1 ring-cyan-500/50 bg-slate-900/90' 
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Fila Superior: Nombre, Tipo, Ojo de visibilidad y Resultado */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {/* Botón Ocultar / Mostrar capa */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleVisibility(m.id)
                          }}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition shrink-0 cursor-pointer"
                          title={m.visible !== false ? "Ocultar capa en el plano" : "Mostrar capa en el plano"}
                        >
                          {m.visible !== false ? (
                            <Eye size={13} className="text-cyan-400" />
                          ) : (
                            <EyeOff size={13} className="text-slate-500" />
                          )}
                        </button>
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                        <input
                          type="text"
                          value={m.nombre}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const val = e.target.value
                            setMediciones(prev => prev.map(item => item.id === m.id ? { ...item, nombre: val } : item))
                          }}
                          className="text-xs font-bold text-white bg-transparent outline-none hover:border-b border-slate-700 focus:border-cyan-400 flex-1 min-w-0 truncate"
                        />
                      </div>
                      <span className="text-xs font-black text-emerald-400 font-mono whitespace-nowrap shrink-0">
                        {m.resultado} {m.unidad}
                      </span>
                    </div>

                  {/* Asignación de Rubro APU */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Vincular con Rubro del Presupuesto:
                    </label>
                    <select
                      value={m.rubro_id || ""}
                      onChange={(e) => handleAssignRubro(m.id, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 outline-none focus:border-cyan-500"
                    >
                      <option value="">-- Seleccionar rubro a vincular --</option>
                      {presupuestoRubros.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.codigo_rubro ? `[${r.codigo_rubro}] ` : ''}{r.nombre_rubro} ({r.unidad || 'u'} - ${Number(r.precio_unitario || 0).toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subtotal Económico Estimado */}
                  {m.precioUnitario && m.precioUnitario > 0 ? (
                    <div className="flex items-center justify-between text-[11px] bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800/80 font-mono">
                      <span className="text-slate-400">P.U: ${m.precioUnitario.toFixed(2)}/{m.unidad}</span>
                      <span className="text-cyan-300 font-bold">Subtotal: ${(m.costoTotal || 0).toFixed(2)} USD</span>
                    </div>
                  ) : null}

                  {/* Panel Especial para Muros: Deducción Paramétrica de Vanos */}
                  {m.tipo === 'pared' && (
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Longitud: <strong>{m.longitudLineal?.toFixed(2)} m</strong></span>
                        <span>Vanos: <strong className="text-amber-400">-{m.areaVanos || 0} m²</strong></span>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => handleAddVanoToMuro(m.id, 1.89)}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-[10px] font-bold border border-slate-700"
                          title="Puerta estándar 0.90m x 2.10m = 1.89 m²"
                        >
                          + Pta (1.89m²)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddVanoToMuro(m.id, 1.80)}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[10px] font-bold border border-slate-700"
                          title="Ventana estándar 1.50m x 1.20m = 1.80 m²"
                        >
                          + Vtn (1.80m²)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddVanoToMuro(m.id, 0.24)}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold border border-slate-700"
                          title="Ventana baño 0.60m x 0.40m = 0.24 m²"
                        >
                          + V.Baño (0.24m²)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Botón Eliminar */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleDeleteMedicion(m.id)}
                      className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold"
                    >
                      <Trash2 size={12} />
                      <span>Eliminar Capa</span>
                    </button>
                  </div>
                </div>
              )})
            )}
          </div>

          {/* PIE DEL PANEL: TOTALES Y VOLCADO AL PRESUPUESTO */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-2.5">
            {totalCostoPlano > 0 && (
              <div className="flex items-center justify-between text-xs bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Total Estimado Plano:</span>
                <span className="text-emerald-400 font-black font-mono text-sm">
                  ${totalCostoPlano.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </span>
              </div>
            )}

            {applySuccessMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />
                <p className="leading-tight">{applySuccessMsg}</p>
              </div>
            )}

            <button
              disabled={isApplying || mediciones.filter(m => m.rubro_id).length === 0}
              onClick={handleApplyToPresupuesto}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-40 cursor-pointer"
            >
              {isApplying ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white" />
                  <span>Volcando Metrados al Presupuesto...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="text-yellow-300" />
                  <span>⚡ Volcar Cantidades a la Mesa ({mediciones.filter(m => m.rubro_id).length})</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-500">
              Inyecta las cantidades directamente en presupuesto_rubros sin digitación manual.
            </p>
          </div>
        </div>

      </div>

      {/* MODAL INTERACTIVO DE CALIBRACIÓN DE ESCALA (SOLUCIÓN DEFINITIVA A LA PRECISIÓN) */}
      {isCalibrationModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Ruler size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Calibrar Escala de Precisión</h3>
                  <p className="text-xs text-slate-400">Segmento medido: {Math.round(measuredPixels)} píxeles en pantalla</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCalibrationModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                  Introduce la distancia real exacta entre los 2 puntos (metros):
                </label>
                <div className="relative">
                  <input
                    ref={metersInputRef}
                    type="number"
                    step="0.01"
                    min="0.05"
                    value={realMetersInput}
                    onChange={(e) => setRealMetersInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCalibration() }}
                    placeholder="Ej. 3.40"
                    className="w-full bg-slate-950 border-2 border-amber-500/60 rounded-xl px-4 py-3 text-lg font-black font-mono text-amber-300 outline-none focus:border-amber-400"
                  />
                  <span className="absolute right-4 top-3.5 text-sm font-bold text-slate-500">
                    metros
                  </span>
                </div>
              </div>

              {/* Botones de cotas comunes rápidas */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Cotas comunes en arquitectura:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COTAS_METROS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRealMetersInput(String(val))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition ${
                        parseFloat(realMetersInput) === val 
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black' 
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {val.toFixed(2)} m
                    </button>
                  ))}
                </div>
              </div>

              {/* Información de relación matemática calculada */}
              {parseFloat(realMetersInput) > 0 && measuredPixels > 0 && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Factor de Escala:</span>
                    <strong className="text-amber-300">
                      1 px = {((parseFloat(realMetersInput) / measuredPixels) * 100).toFixed(2)} cm
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Resolución:</span>
                    <span>{(measuredPixels / parseFloat(realMetersInput)).toFixed(1)} px/metro</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsCalibrationModalOpen(false)
                  setCalibrationPoints([])
                  setIsCalibrating(false)
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyCalibration}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <Check size={16} />
                <span>Aplicar Escala de Precisión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ORIENTACIÓN: FORMATOS BIM NATIVOS (REVIT / ARCHICAD / IFC) */}
      {cadFormatNotice && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <FileBox size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block">
                    {cadFormatNotice.format}
                  </span>
                  <h3 className="text-base font-black text-white">
                    {cadFormatNotice.title}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setCadFormatNotice(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
              {cadFormatNotice.message}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-end">
              <a
                href="/dashboard/bim"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <span>Ir al Visor SARA-BIM 3D</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setCadFormatNotice(null)
                  fileInputRef.current?.click()
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-black bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>Cargar Plano en PDF / Imagen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY DE RENDERIZADO EN ALTA RESOLUCIÓN */}
      {isRenderingPdf && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 p-6 rounded-3xl max-w-sm w-full text-center space-y-3 shadow-2xl">
            <Loader2 size={36} className="animate-spin text-cyan-400 mx-auto" />
            <h4 className="text-sm font-black text-white">Renderizando Plano Arquitectónico...</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Procesando cotas vectoriales y convirtiendo lámina a máxima resolución para calibración 2D.
            </p>
          </div>
        </div>
      )}

      {/* MODAL DE ATAJOS DE TECLADO Y GUÍA DE PRECISIÓN */}
      {isShortcutsModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Keyboard size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Atajos de Teclado & Productividad SARA Take-Off</h3>
                  <p className="text-[11px] text-slate-400">Optimiza tu velocidad al computar planos 2D</p>
                </div>
              </div>
              <button
                onClick={() => setIsShortcutsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-300 font-medium">Deshacer acción / vértice</span>
                <kbd className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-mono font-bold text-amber-400">Ctrl + Z</kbd>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-300 font-medium">Rehacer acción</span>
                <kbd className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-mono font-bold text-cyan-400">Ctrl + Y</kbd>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-300 font-medium">Modo Ortogonal (90°/180°)</span>
                <kbd className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-mono font-bold text-emerald-400">Shift</kbd>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-300 font-medium">Zoom enfocado al cursor</span>
                <span className="text-slate-400 font-mono text-[11px] font-bold">Rueda Ratón</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-300 font-medium">Mover plano (Pan)</span>
                <span className="text-slate-400 font-mono text-[11px] font-bold">Clic Central</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-300 font-medium">Borrar último punto</span>
                <kbd className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-mono font-bold text-slate-300">Backspace</kbd>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-300 font-medium">Cancelar / Soltar herramienta</span>
                <kbd className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-mono font-bold text-slate-300">Esc</kbd>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-300 font-medium">Alternar Lupa 3.5x</span>
                <kbd className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-mono font-bold text-cyan-400">L</kbd>
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60 text-[11px] text-slate-400 space-y-1">
              <p>💡 <strong className="text-slate-200">Tip de Precisión:</strong> Para cerrar un área o habitación, puedes hacer <strong>doble clic</strong> o simplemente hacer clic sobre el primer vértice marcado (punto cian imantado).</p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setIsShortcutsModalOpen(false)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
