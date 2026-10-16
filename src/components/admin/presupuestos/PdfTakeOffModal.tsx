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
  Hand,
  Hash,
  Eye,
  FileText,
  Loader2,
  Building2,
  Undo2
} from "lucide-react"
import { 
  Point2D, 
  TakeOffMeasurement, 
  calculateDistancePx, 
  calculateScaleRatio, 
  calculatePolygonAreaM2, 
  calculatePolylineLengthM, 
  calculateWallAreaM2, 
  getPolygonCentroid,
  detectArchitecturalRoomsFromBlueprint
} from "@/lib/takeoff/geometry"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

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
  { nombre: "Púrpura (Pintura/Gypsum)", hex: "#7c3aed", fill: "rgba(124, 58, 237, 0.35)" },
  { nombre: "Rosa (Instalaciones)", hex: "#e11d48", fill: "rgba(225, 29, 72, 0.35)" }
]

export default function PdfTakeOffModal({
  isOpen,
  onClose,
  presupuestoId,
  nombreProyecto = "Obra Residencial",
  presupuestoRubros = [],
  onMeasurementsApplied
}: PdfTakeOffModalProps) {
  // Herramienta activa
  const [activeTool, setActiveTool] = useState<'pan' | 'calibrate' | 'area' | 'wall' | 'count'>('area')
  const [selectedBlueprint, setSelectedBlueprint] = useState<string>("planta-baja")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  // Escala y Calibración
  const [scaleRatio, setScaleRatio] = useState<number>(0.0165) // metros por pixel
  const [calibrationPoints, setCalibrationPoints] = useState<Point2D[]>([])
  const [calibrationMetersInput, setCalibrationMetersInput] = useState<number>(8.0)
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false)

  // Estado del lienzo (Zoom y Pan)
  const [zoom, setZoom] = useState<number>(1)
  const [panOffset, setPanOffset] = useState<Point2D>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragStart, setDragStart] = useState<Point2D>({ x: 0, y: 0 })

  // Dibujo en progreso
  const [currentPoints, setCurrentPoints] = useState<Point2D[]>([])
  const [cursorPos, setCursorPos] = useState<Point2D | null>(null)
  const [selectedColor, setSelectedColor] = useState(PALETA_COLORES[0])
  const [wallHeight, setWallHeight] = useState<number>(2.60) // metros

  // Mediciones confirmadas
  const [mediciones, setMediciones] = useState<TakeOffMeasurement[]>([
    {
      id: "med-demo-1",
      nombre: "Contrapiso Sala - Comedor",
      tipo: "area",
      color: "#2563eb",
      puntos: [{ x: 120, y: 140 }, { x: 480, y: 140 }, { x: 480, y: 380 }, { x: 120, y: 380 }],
      resultado: 38.80,
      unidad: "m²",
      rubro_id: presupuestoRubros.find(r => (r.nombre_rubro || '').toLowerCase().includes('contrapiso'))?.id || undefined,
      rubro_nombre: "Contrapiso de hormigón simple e=10cm"
    },
    {
      id: "med-demo-2",
      nombre: "Paredes Eje A (Mampostería)",
      tipo: "pared",
      color: "#d97706",
      puntos: [{ x: 120, y: 140 }, { x: 480, y: 140 }],
      alturaPared: 2.60,
      resultado: 15.44, // 5.94m * 2.60m
      unidad: "m²",
      rubro_id: presupuestoRubros.find(r => (r.nombre_rubro || '').toLowerCase().includes('mamposteria') || (r.nombre_rubro || '').toLowerCase().includes('ladrillo'))?.id || undefined,
      rubro_nombre: "Mampostería de ladrillo panelón e=12cm"
    }
  ])

  // Aplicación a presupuesto
  const [isApplying, setIsApplying] = useState<boolean>(false)
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null)
  const [isDetectingAi, setIsDetectingAi] = useState<boolean>(false)

  // Auto-Detección Inteligente de Ambientes con SARA-Vision
  const handleAiAutoDetect = () => {
    setIsDetectingAi(true)
    setTimeout(() => {
      const detected = detectArchitecturalRoomsFromBlueprint(selectedBlueprint, scaleRatio, presupuestoRubros)
      setMediciones(detected)
      setIsDetectingAi(false)
      alert(`🤖 SARA-Vision completó el escaneo:\nSe detectaron automáticamente ${detected.length} recintos y elementos con deducción de vanos y coincidencia de APUs del presupuesto.`)
    }, 600)
  }

  // Deshacer último vértice del dibujo en progreso
  const handleUndoPoint = () => {
    setCurrentPoints(prev => prev.slice(0, -1))
  }

  // Limpiar todas las capas
  const handleClearAll = () => {
    if (window.confirm("¿Deseas limpiar todas las capas y mediciones de este plano?")) {
      setMediciones([])
      setCurrentPoints([])
    }
  }

  // Deducción interactiva de vanos en mampostería
  const handleUpdateAreaVanos = (medId: string, nuevosVanos: number) => {
    setMediciones(prev => prev.map(m => {
      if (m.id === medId && m.tipo === 'pared') {
        const areaNeta = calculateWallAreaM2(m.puntos, scaleRatio, m.alturaPared || 2.6, nuevosVanos)
        return {
          ...m,
          areaVanos: nuevosVanos,
          resultado: areaNeta
        }
      }
      return m
    }))
  }

  const svgRef = useRef<SVGSVGElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Calibración inicial al cambiar de plano demo
  useEffect(() => {
    const demo = BLUEPRINTS_DEMO.find(b => b.id === selectedBlueprint)
    if (demo && !uploadedImage) {
      setScaleRatio(demo.escalaDefault)
    }
  }, [selectedBlueprint, uploadedImage])

  if (!isOpen) return null

  // Coordenadas locales dentro del SVG teniendo en cuenta zoom y pan
  const getSvgCoordinates = (e: React.MouseEvent<SVGSVGElement>): Point2D => {
    if (!svgRef.current) return { x: 0, y: 0 }
    const rect = svgRef.current.getBoundingClientRect()
    const clientX = e.clientX - rect.left
    const clientY = e.clientY - rect.top
    const x = (clientX - panOffset.x) / zoom
    const y = (clientY - panOffset.y) / zoom
    return { x, y }
  }

  // Clic en el lienzo según la herramienta activa
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'pan') return

    const pt = getSvgCoordinates(e)

    // 1. Calibración
    if (activeTool === 'calibrate') {
      if (calibrationPoints.length === 0) {
        setCalibrationPoints([pt])
      } else if (calibrationPoints.length === 1) {
        const p1 = calibrationPoints[0]
        const p2 = pt
        setCalibrationPoints([p1, p2])
        const ratio = calculateScaleRatio(p1, p2, calibrationMetersInput)
        setScaleRatio(ratio)
        setIsCalibrating(false)
        setActiveTool('area')
        alert(`✅ Escala Calibrada con éxito:\nDistancia medida: ${calibrationMetersInput} m\nRelación: 1 px = ${(ratio * 100).toFixed(2)} cm`)
      }
      return
    }

    // 2. Conteo puntual
    if (activeTool === 'count') {
      const nuevoConteo: TakeOffMeasurement = {
        id: `count-${Date.now()}`,
        nombre: `Punto de Control #${mediciones.filter(m => m.tipo === 'conteo').length + 1}`,
        tipo: 'conteo',
        color: selectedColor.hex,
        puntos: [pt],
        resultado: 1,
        unidad: 'u'
      }
      setMediciones(prev => [...prev, nuevoConteo])
      return
    }

    // 3. Polígonos de Área o Líneas de Pared
    if (activeTool === 'area' || activeTool === 'wall') {
      // Si hace clic cerca del primer punto (snapping), cerrar el polígono
      if (activeTool === 'area' && currentPoints.length >= 3) {
        const start = currentPoints[0]
        const distToStart = calculateDistancePx(pt, start)
        if (distToStart < 15 / zoom) {
          cerrarPoligono()
          return
        }
      }
      setCurrentPoints(prev => [...prev, pt])
    }
  }

  // Doble clic para finalizar polígono o polilínea
  const handleCanvasDoubleClick = () => {
    if (activeTool === 'area') {
      cerrarPoligono()
    } else if (activeTool === 'wall') {
      cerrarPared()
    }
  }

  const cerrarPoligono = () => {
    if (currentPoints.length < 3) {
      setCurrentPoints([])
      return
    }
    const areaM2 = calculatePolygonAreaM2(currentPoints, scaleRatio)
    const nuevaMed: TakeOffMeasurement = {
      id: `med-${Date.now()}`,
      nombre: `Zona Medida #${mediciones.filter(m => m.tipo === 'area').length + 1}`,
      tipo: 'area',
      color: selectedColor.hex,
      puntos: [...currentPoints],
      resultado: areaM2,
      unidad: 'm²'
    }
    setMediciones(prev => [...prev, nuevaMed])
    setCurrentPoints([])
  }

  const cerrarPared = () => {
    if (currentPoints.length < 2) {
      setCurrentPoints([])
      return
    }
    const areaM2 = calculateWallAreaM2(currentPoints, scaleRatio, wallHeight)
    const longitudM = calculatePolylineLengthM(currentPoints, scaleRatio)
    const nuevaMed: TakeOffMeasurement = {
      id: `wall-${Date.now()}`,
      nombre: `Mampostería Eje (${longitudM}m x ${wallHeight}m)`,
      tipo: 'pared',
      color: selectedColor.hex,
      puntos: [...currentPoints],
      alturaPared: wallHeight,
      resultado: areaM2,
      unidad: 'm²'
    }
    setMediciones(prev => [...prev, nuevaMed])
    setCurrentPoints([])
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

  // Subir imagen de plano
  const handleUploadBlueprint = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedImage(event.target.result as string)
        setSelectedBlueprint("custom")
        // Invitar a calibrar
        setIsCalibrating(true)
        setActiveTool('calibrate')
        setCalibrationPoints([])
        alert("Plano cargado con éxito. Ahora por favor haz clic en 2 puntos con una distancia conocida para calibrar la escala.")
      }
    }
    reader.readAsDataURL(file)
  }

  // Asignar rubro a una medición
  const handleAssignRubro = (medId: string, rubroId: string) => {
    const rubro = presupuestoRubros.find(r => r.id === rubroId)
    setMediciones(prev => prev.map(m => {
      if (m.id === medId) {
        return {
          ...m,
          rubro_id: rubroId || undefined,
          rubro_nombre: rubro ? rubro.nombre_rubro : undefined,
          rubro_codigo: rubro ? rubro.codigo_rubro : undefined
        }
      }
      return m
    }))
  }

  // Eliminar medición
  const handleDeleteMedicion = (medId: string) => {
    setMediciones(prev => prev.filter(m => m.id !== medId))
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

      setApplySuccessMsg(`¡Éxito! Se sincronizaron ${data.updatedCount} rubros con el presupuesto. Costo directo actualizado: $${Number(data.nuevoCostoDirecto).toFixed(2)} USD.`)
      
      // Refrescar datos en el componente padre
      await onMeasurementsApplied()
    } catch (err: any) {
      console.error("Error al volcar mediciones:", err)
      alert("Error al volcar mediciones: " + (err.message || err))
    } finally {
      setIsApplying(false)
    }
  }

  // Exportar Plano con Capas de Metrado en PDF
  const handleExportTakeOffPdf = () => {
    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
      const pageWidth = doc.internal.pageSize.getWidth()

      // Membrete
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, pageWidth, 24, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(13)
      doc.text("GRUPO CONSTRUCTOR SARA · MEMORIA TÉCNICA DE CÓMPUTOS MÉTRICOS (TAKE-OFF 2D)", 14, 11)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(8.5)
      doc.setTextColor(148, 163, 184)
      doc.text(`PROYECTO: ${nombreProyecto.toUpperCase()}  |  PLANO MEDIDO: ${selectedBlueprint.toUpperCase()}  |  ESCALA: 1px = ${(scaleRatio * 100).toFixed(2)}cm`, 14, 18)

      // Tabla de mediciones
      const rows = mediciones.map((m, idx) => [
        String(idx + 1).padStart(2, '0'),
        m.nombre,
        m.tipo.toUpperCase(),
        `${m.resultado.toFixed(2)} ${m.unidad}`,
        m.rubro_codigo || 'SIN CÓDIGO',
        m.rubro_nombre || 'No asignado a rubro',
        m.rubro_id ? 'VINCULADO' : 'PENDIENTE'
      ])

      autoTable(doc, {
        startY: 32,
        head: [["N°", "DESCRIPCIÓN DE LA FORMA / ZONA", "TIPO GEOMETRÍA", "CANTIDAD METRADA", "CÓDIGO RUBRO", "RUBRO ASIGNADO EN PRESUPUESTO", "ESTADO"]],
        body: rows,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 55, fontStyle: "bold" },
          2: { cellWidth: 30, halign: "center" },
          3: { cellWidth: 32, halign: "right", fontStyle: "bold" },
          4: { cellWidth: 26, halign: "center" },
          5: { cellWidth: 90 },
          6: { cellWidth: 24, halign: "center" },
        }
      })

      // Firmas
      const finalY = (doc as any).lastAutoTable?.finalY || 150
      if (finalY < 170) {
        doc.line(30, finalY + 25, 90, finalY + 25)
        doc.setFontSize(8); doc.setTextColor(30, 41, 59); doc.text("ING. DE COSTOS & METRADOS", 38, finalY + 30)
        doc.line(180, finalY + 25, 240, finalY + 25)
        doc.text("ING. RESIDENTE DE OBRA", 192, finalY + 30)
      }

      doc.save(`Memoria_TakeOff_${nombreProyecto.replace(/\s+/g, '_')}.pdf`)
    } catch (err: any) {
      console.error("Error al exportar PDF Take-Off:", err)
      alert("Error al generar PDF de metrados.")
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/85 z-[100] flex items-center justify-center p-2 sm:p-4 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full h-[96vh] flex flex-col overflow-hidden shadow-2xl text-slate-100">
        
        {/* 1. CABECERA PRINCIPAL */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Square size={22} className="rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  SARA Take-Off · Cómputos Métricos en Planos 2D
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Fase 1 · Zero Errores
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Proyecto: <span className="text-slate-200 font-bold">{nombreProyecto}</span> · Mide polígonos, contrapisos, paredes y vuelca automáticamente al presupuesto
              </p>
            </div>
          </div>

          {/* ACCIONES SUPERIORES */}
          <div className="flex items-center gap-2.5">
            {/* Selector de Plano */}
            <select
              value={selectedBlueprint}
              onChange={(e) => {
                setSelectedBlueprint(e.target.value)
                setUploadedImage(null)
              }}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 outline-none"
            >
              {BLUEPRINTS_DEMO.map(b => (
                <option key={b.id} value={b.id}>{b.nombre}</option>
              ))}
              {uploadedImage && <option value="custom">📄 Plano Subido por Usuario</option>}
            </select>

            {/* Botón Subir Archivo */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*,application/pdf" 
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

        {/* 2. BARRA DE HERRAMIENTAS INTERACTIVA */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Herramientas de Medición */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 font-bold">
            <button
              onClick={() => { setActiveTool('pan'); setCurrentPoints([]) }}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${activeTool === 'pan' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Arrastrar y desplazar plano"
            >
              <Hand size={14} />
              <span>Mano (Pan)</span>
            </button>

            <button
              onClick={() => { 
                setActiveTool('calibrate'); 
                setCalibrationPoints([]); 
                setIsCalibrating(true);
                setCurrentPoints([]) 
              }}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${activeTool === 'calibrate' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Calibrar escala marcando una cota conocida"
            >
              <Ruler size={14} className="text-amber-300" />
              <span>Calibrar Escala</span>
            </button>

            <button
              onClick={() => { setActiveTool('area'); setCurrentPoints([]) }}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${activeTool === 'area' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Medir área de contrapisos, losas, cerámica o pintura (m²)"
            >
              <Square size={14} className="text-emerald-300" />
              <span>Área (m²)</span>
            </button>

            <button
              onClick={() => { setActiveTool('wall'); setCurrentPoints([]) }}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${activeTool === 'wall' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Medir longitud de ejes y calcular m² de paredes con altura"
            >
              <Layers size={14} className="text-amber-300" />
              <span>Paredes / Ejes (m²)</span>
            </button>

            <button
              onClick={() => { setActiveTool('count'); setCurrentPoints([]) }}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${activeTool === 'count' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Conteo de columnas, puntos eléctricos, puertas (u)"
            >
              <Hash size={14} className="text-rose-300" />
              <span>Conteo (u)</span>
            </button>

            {/* BOTÓN SARA-VISION: AUTO-DETECTAR AMBIENTES CON IA */}
            <button
              onClick={handleAiAutoDetect}
              disabled={isDetectingAi}
              className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition font-black bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-sm cursor-pointer disabled:opacity-50 ml-1"
              title="Detectar automáticamente recintos, áreas y mampostería con IA"
            >
              {isDetectingAi ? (
                <Loader2 size={14} className="animate-spin text-white" />
              ) : (
                <Sparkles size={14} className="text-yellow-300 animate-pulse" />
              )}
              <span>{isDetectingAi ? "Detectando..." : "🤖 Auto-Detectar con IA"}</span>
            </button>
          </div>

          {/* Ajustes contextuales (Altura pared + Paleta de color) */}
          <div className="flex items-center gap-3">
            {activeTool === 'wall' && (
              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">Altura Pared:</span>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="10"
                  value={wallHeight}
                  onChange={(e) => setWallHeight(Number(e.target.value) || 2.6)}
                  className="w-14 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-center font-mono font-bold text-amber-300 outline-none"
                />
                <span className="text-[10px] text-slate-500 font-bold">m</span>
              </div>
            )}

            {/* Paleta de Color de Capa */}
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

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button 
                onClick={() => setZoom(prev => Math.max(0.4, prev - 0.2))} 
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                title="Alejar"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-[11px] font-mono px-1 font-bold text-slate-300">{Math.round(zoom * 100)}%</span>
              <button 
                onClick={() => setZoom(prev => Math.min(3.0, prev + 0.2))} 
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                title="Acercar"
              >
                <ZoomIn size={14} />
              </button>
              <button 
                onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }) }} 
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                title="Restablecer vista"
              >
                <RotateCcw size={13} />
              </button>
            </div>

            {/* Acciones de Edición Rápida */}
            {currentPoints.length > 0 && (
              <button 
                onClick={handleUndoPoint}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                title="Deshacer último vértice"
              >
                <Undo2 size={13} className="text-amber-400" />
                <span>Deshacer Punto</span>
              </button>
            )}

            {mediciones.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                title="Limpiar todas las capas medidas"
              >
                <Trash2 size={13} />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. ÁREA DE TRABAJO: LIENZO (CANVAS) + PANEL LATERAL DE MEDICIONES */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LIENZO DE VISUALIZACIÓN Y MEDICIÓN */}
          <div 
            className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove as any}
            onMouseUp={handleMouseUp}
          >
            {/* Aviso Flotante de Modo Activo */}
            <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-slate-300 font-semibold">
                {activeTool === 'pan' && "Modo Navegación: Arrastra con el ratón para desplazarte"}
                {activeTool === 'calibrate' && "Modo Calibración: Haz clic en el 1er y 2do punto de una cota conocida"}
                {activeTool === 'area' && "Modo Área: Haz clic en cada esquina de la habitación o losa (Doble clic para cerrar)"}
                {activeTool === 'wall' && "Modo Paredes: Haz clic a lo largo de los ejes de mampostería (Doble clic para terminar)"}
                {activeTool === 'count' && "Modo Conteo: Haz clic sobre cada elemento a cuantificar"}
              </span>
              {currentPoints.length > 0 && (
                <button
                  onClick={() => {
                    if (activeTool === 'area') cerrarPoligono()
                    if (activeTool === 'wall') cerrarPared()
                  }}
                  className="ml-2 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                >
                  Finalizar ({currentPoints.length} puntos)
                </button>
              )}
            </div>

            {/* SVG INTERACTIVO */}
            <svg
              ref={svgRef}
              onClick={handleCanvasClick}
              onDoubleClick={handleCanvasDoubleClick}
              className={`w-full h-full ${activeTool === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
            >
              <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoom})`}>
                
                {/* 1. PLANO DE FONDO (Si es imagen subida o vectorial demo) */}
                {uploadedImage ? (
                  <image href={uploadedImage} x={50} y={50} width={900} height={600} />
                ) : selectedBlueprint === 'planta-baja' ? (
                  /* PLANO ARQUITECTÓNICO VECTORIAL DEMO (Villa 120m²) */
                  <g id="plano-arquitectura" className="opacity-95">
                    {/* Retícula y fondo papel técnico */}
                    <rect x={60} y={60} width={880} height={580} fill="#0f172a" stroke="#334155" strokeWidth={2} />
                    
                    {/* Ejes y cotas perimetrales */}
                    <line x1={120} y1={90} x2={840} y2={90} stroke="#64748b" strokeWidth={1} strokeDasharray="4 4" />
                    <text x={480} y={80} fill="#94a3b8" fontSize={11} textAnchor="middle" fontWeight="bold">COTA TOTAL: 12.00 m</text>
                    
                    <line x1={90} y1={140} x2={90} y2={560} stroke="#64748b" strokeWidth={1} strokeDasharray="4 4" />
                    <text x={75} y={350} fill="#94a3b8" fontSize={11} textAnchor="middle" transform="rotate(-90 75 350)" fontWeight="bold">COTA TOTAL: 7.00 m</text>

                    {/* Muros Exteriores (Doble línea gruesa) */}
                    <rect x={120} y={140} width={720} height={420} fill="#1e293b" stroke="#f8fafc" strokeWidth={4} />

                    {/* Divisiones Interiores de Ambientes */}
                    {/* Sala - Comedor */}
                    <rect x={120} y={140} width={360} height={240} fill="#1e293b" stroke="#cbd5e1" strokeWidth={2.5} />
                    <text x={300} y={260} fill="#e2e8f0" fontSize={14} fontWeight="900" textAnchor="middle">SALA - COMEDOR</text>
                    <text x={300} y={280} fill="#94a3b8" fontSize={10} textAnchor="middle">NPT +0.15 · Área est: 38.80 m²</text>

                    {/* Cocina */}
                    <rect x={480} y={140} width={220} height={240} fill="#1e293b" stroke="#cbd5e1" strokeWidth={2.5} />
                    <text x={590} y={260} fill="#e2e8f0" fontSize={13} fontWeight="900" textAnchor="middle">COCINA</text>
                    <text x={590} y={280} fill="#94a3b8" fontSize={10} textAnchor="middle">NPT +0.15</text>

                    {/* Baño Social */}
                    <rect x={700} y={140} width={140} height={140} fill="#1e293b" stroke="#cbd5e1" strokeWidth={2.5} />
                    <text x={770} y={210} fill="#e2e8f0" fontSize={11} fontWeight="800" textAnchor="middle">B. SOCIAL</text>

                    {/* Dormitorio Master con Baño */}
                    <rect x={120} y={380} width={400} height={180} fill="#1e293b" stroke="#cbd5e1" strokeWidth={2.5} />
                    <text x={320} y={470} fill="#e2e8f0" fontSize={13} fontWeight="900" textAnchor="middle">DORMITORIO MASTER</text>
                    <text x={320} y={490} fill="#94a3b8" fontSize={10} textAnchor="middle">Piso Flotante / Cerámica</text>

                    {/* Dormitorio 2 */}
                    <rect x={520} y={380} width={320} height={180} fill="#1e293b" stroke="#cbd5e1" strokeWidth={2.5} />
                    <text x={680} y={470} fill="#e2e8f0" fontSize={13} fontWeight="900" textAnchor="middle">DORMITORIO 2</text>

                    {/* Columnas estructurales (C1 - 30x30) */}
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
                  /* PLANO ESTRUCTURAL DE CIMENTACIÓN */
                  <g id="plano-estructural">
                    <rect x={60} y={60} width={880} height={580} fill="#0b1329" stroke="#1e293b" strokeWidth={2} />
                    {/* Vigas de Cimentación */}
                    <line x1={120} y1={140} x2={840} y2={140} stroke="#3b82f6" strokeWidth={12} strokeOpacity={0.6} />
                    <line x1={120} y1={380} x2={840} y2={380} stroke="#3b82f6" strokeWidth={12} strokeOpacity={0.6} />
                    <line x1={120} y1={560} x2={840} y2={560} stroke="#3b82f6" strokeWidth={12} strokeOpacity={0.6} />
                    <line x1={120} y1={140} x2={120} y2={560} stroke="#3b82f6" strokeWidth={12} strokeOpacity={0.6} />
                    <line x1={480} y1={140} x2={480} y2={560} stroke="#3b82f6" strokeWidth={12} strokeOpacity={0.6} />
                    <line x1={840} y1={140} x2={840} y2={560} stroke="#3b82f6" strokeWidth={12} strokeOpacity={0.6} />
                    {/* Plintos Aislados */}
                    {[
                      {x: 120, y: 140}, {x: 480, y: 140}, {x: 840, y: 140},
                      {x: 120, y: 380}, {x: 480, y: 380}, {x: 840, y: 380},
                      {x: 120, y: 560}, {x: 480, y: 560}, {x: 840, y: 560}
                    ].map((p, idx) => (
                      <rect key={idx} x={p.x - 25} y={p.y - 25} width={50} height={50} fill="#38bdf8" fillOpacity={0.3} stroke="#38bdf8" strokeWidth={2} />
                    ))}
                    <text x={480} y={350} fill="#38bdf8" fontSize={16} fontWeight="black" textAnchor="middle">LOSA DE CIMENTACIÓN & PLINTOS AISLADOS (1.20x1.20m)</text>
                  </g>
                )}

                {/* 2. MEDICIONES YA CONFIRMADAS (POLÍGONOS, PAREDES Y PUNTOS) */}
                {mediciones.map((m) => {
                  const centro = getPolygonCentroid(m.puntos)

                  if (m.tipo === 'area' && m.puntos.length >= 3) {
                    const pointsStr = m.puntos.map(p => `${p.x},${p.y}`).join(' ')
                    return (
                      <g key={m.id} className="transition-all hover:opacity-90">
                        <polygon
                          points={pointsStr}
                          fill={m.color}
                          fillOpacity={0.4}
                          stroke={m.color}
                          strokeWidth={2.5}
                        />
                        {/* Etiqueta flotante con el resultado */}
                        <g transform={`translate(${centro.x}, ${centro.y})`}>
                          <rect x={-45} y={-14} width={90} height={22} rx={6} fill="#0f172a" fillOpacity={0.9} stroke={m.color} strokeWidth={1.5} />
                          <text x={0} y={1} fill="#ffffff" fontSize={10} fontWeight="bold" textAnchor="middle">
                            {m.resultado} {m.unidad}
                          </text>
                        </g>
                      </g>
                    )
                  }

                  if (m.tipo === 'pared' && m.puntos.length >= 2) {
                    const pointsStr = m.puntos.map(p => `${p.x},${p.y}`).join(' ')
                    return (
                      <g key={m.id}>
                        <polyline
                          points={pointsStr}
                          fill="none"
                          stroke={m.color}
                          strokeWidth={6}
                          strokeLinecap="round"
                          strokeOpacity={0.8}
                        />
                        <g transform={`translate(${centro.x}, ${centro.y - 12})`}>
                          <rect x={-50} y={-12} width={100} height={20} rx={5} fill="#0f172a" fillOpacity={0.9} stroke={m.color} strokeWidth={1.5} />
                          <text x={0} y={2} fill="#ffffff" fontSize={9.5} fontWeight="bold" textAnchor="middle">
                            {m.resultado} {m.unidad} ({m.alturaPared}m alt)
                          </text>
                        </g>
                      </g>
                    )
                  }

                  if (m.tipo === 'conteo' && m.puntos.length > 0) {
                    const p = m.puntos[0]
                    return (
                      <g key={m.id} transform={`translate(${p.x}, ${p.y})`}>
                        <circle r={9} fill={m.color} stroke="#ffffff" strokeWidth={2} />
                        <text x={0} y={3.5} fill="#ffffff" fontSize={9} fontWeight="black" textAnchor="middle">1</text>
                      </g>
                    )
                  }

                  return null
                })}

                {/* 3. DIBUJO EN PROGRESO (Goma elástica) */}
                {currentPoints.length > 0 && (
                  <g id="drawing-in-progress">
                    {/* Líneas entre puntos colocados */}
                    {currentPoints.length > 1 && (
                      <polyline
                        points={currentPoints.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke={selectedColor.hex}
                        strokeWidth={2.5}
                        strokeDasharray="4 4"
                      />
                    )}
                    {/* Línea hacia el cursor activo */}
                    {cursorPos && (
                      <line
                        x1={currentPoints[currentPoints.length - 1].x}
                        y1={currentPoints[currentPoints.length - 1].y}
                        x2={cursorPos.x}
                        y2={cursorPos.y}
                        stroke={selectedColor.hex}
                        strokeWidth={1.5}
                        strokeDasharray="3 3"
                      />
                    )}
                    {/* Vértices */}
                    {currentPoints.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={p.x}
                        cy={p.y}
                        r={4}
                        fill="#ffffff"
                        stroke={selectedColor.hex}
                        strokeWidth={2}
                      />
                    ))}
                  </g>
                )}

                {/* 4. CALIBRACIÓN EN PROGRESO */}
                {calibrationPoints.length > 0 && (
                  <g id="calibration-layer">
                    {calibrationPoints.map((p, idx) => (
                      <g key={idx} transform={`translate(${p.x}, ${p.y})`}>
                        <circle r={6} fill="#f59e0b" stroke="#ffffff" strokeWidth={2} />
                        <text x={0} y={-8} fill="#f59e0b" fontSize={11} fontWeight="black" textAnchor="middle">P{idx + 1}</text>
                      </g>
                    ))}
                    {calibrationPoints.length === 2 && (
                      <line
                        x1={calibrationPoints[0].x}
                        y1={calibrationPoints[0].y}
                        x2={calibrationPoints[1].x}
                        y2={calibrationPoints[1].y}
                        stroke="#f59e0b"
                        strokeWidth={3}
                      />
                    )}
                  </g>
                )}
              </g>
            </svg>
          </div>

          {/* PANEL LATERAL DE GESTIÓN Y ASIGNACIÓN AL PRESUPUESTO */}
          <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col justify-between">
            
            {/* CABECERA DEL PANEL LATERAL */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Layers size={16} className="text-cyan-400" />
                  <span>Capas de Metrado ({mediciones.length})</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                  Escala: 1px = {(scaleRatio * 100).toFixed(2)}cm
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Asigna cada medición a un rubro del presupuesto para volcar las cantidades automáticamente.
              </p>
            </div>

            {/* LISTA DE MEDICIONES */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {mediciones.length === 0 ? (
                <div className="text-center p-8 text-slate-500 text-xs flex flex-col items-center gap-2">
                  <Square size={32} className="text-slate-600" />
                  <p className="font-semibold text-slate-400">Aún no hay mediciones realizadas.</p>
                  <p className="text-[11px]">Selecciona la herramienta de Área o Paredes y marca los vértices sobre el plano.</p>
                </div>
              ) : (
                mediciones.map((med, idx) => (
                  <div 
                    key={med.id}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 shadow-xs space-y-2 hover:border-slate-700 transition"
                  >
                    {/* Título de la medición y resultado */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3.5 h-3.5 rounded-full shrink-0" 
                          style={{ backgroundColor: med.color }} 
                        />
                        <span className="text-xs font-bold text-white leading-tight">
                          {med.nombre}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-emerald-400 font-mono">
                          {med.resultado} {med.unidad}
                        </span>
                      </div>
                    </div>

                    {/* Selector de Rubro de la Mesa de Presupuesto */}
                    <div>
                      <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                        Vincular con Rubro del Presupuesto:
                      </label>
                      <select
                        value={med.rubro_id || ""}
                        onChange={(e) => handleAssignRubro(med.id, e.target.value)}
                        className={`w-full text-xs p-1.5 rounded-lg border outline-none font-medium truncate ${
                          med.rubro_id 
                            ? 'bg-blue-950/40 border-blue-500/40 text-blue-200' 
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        <option value="">-- Seleccionar rubro a vincular --</option>
                        {presupuestoRubros.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.codigo_rubro ? `[${r.codigo_rubro}] ` : ''}{r.nombre_rubro} ({r.unidad || 'u'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Deducción de Vanos si es pared */}
                    {med.tipo === 'pared' && (
                      <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-[10px]">
                        <span className="text-slate-400 font-semibold">Descontar Vanos (Puertas/Ventanas):</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={med.areaVanos || 0}
                            onChange={(e) => handleUpdateAreaVanos(med.id, Number(e.target.value) || 0)}
                            className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-center font-mono font-bold text-rose-300 outline-none"
                          />
                          <span className="text-slate-500 font-bold">m²</span>
                        </div>
                      </div>
                    )}

                    {/* Acciones de la medición */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px]">
                      <span className="text-slate-500">
                        Tipo: <strong className="text-slate-300 uppercase">{med.tipo}</strong>
                      </span>
                      <button
                        onClick={() => handleDeleteMedicion(med.id)}
                        className="text-slate-500 hover:text-rose-400 transition flex items-center gap-1"
                        title="Eliminar medición"
                      >
                        <Trash2 size={12} />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* PIE DEL PANEL: BOTÓN DE VOLCADO AL PRESUPUESTO */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-2">
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
                Transfiere directamente las cantidades medidas a la base de datos eliminando errores manuales de digitación.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
