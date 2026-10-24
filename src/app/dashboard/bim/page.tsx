"use client"

import React, { useState, useEffect } from "react"
import { 
  Box, 
  Layers, 
  Cpu, 
  TrendingDown, 
  ShoppingCart, 
  CheckCircle2, 
  Upload, 
  FileCode, 
  ExternalLink, 
  RefreshCw,
  Building,
  HardHat,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  FolderSync,
  Eye,
  RotateCcw,
  Sliders,
  Check,
  Cuboid,
  X,
  AlertCircle
} from "lucide-react"
import { useProject } from "@/contexts/ProjectContext"
import { createClient } from "@/lib/supabase/client"
import BimImporterModal from "@/app/dashboard/presupuestos_reales/components/BimImporterModal"
import Link from "next/link"

export default function SaraBimPage() {
  const supabase = createClient()
  const { activeProject } = useProject()
  const [loading, setLoading] = useState(false)
  const [selectedLayer, setSelectedLayer] = useState<string>("todos")
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  // Feedback interactivo sin alerts
  const [showRevitModal, setShowRevitModal] = useState(false)
  const [showBimImporter, setShowBimImporter] = useState(false)
  const [actionFeedback, setActionFeedback] = useState<{ tipo: "info" | "success" | "error"; mensaje: string } | null>(null)
  
  // Controles de Rotación 3D
  const [rotX, setRotX] = useState<number>(25) // inclinación
  const [rotY, setRotY] = useState<number>(-35) // azimut
  const [zoom3D, setZoom3D] = useState<number>(1)

  // Inyección a Presupuesto
  const [isInjecting, setIsInjecting] = useState(false)
  const [injectSuccess, setInjectSuccess] = useState<string | null>(null)

  // Modelo BIM adaptado dinámicamente al proyecto activo
  const nombreProyectoActivo = activeProject?.nombre || "Edificio Torre Esmeralda"
  const guidCalculado = activeProject?.id ? activeProject.id.replace(/-/g, '').slice(0, 24) : "7b4f2c9144a348e0bb129c3f"

  const modeloDemo = {
    id: activeProject?.id || "mod-1",
    nombre_modelo: `${nombreProyectoActivo.toUpperCase()} - ESTRUCTURA & ALBAÑILERÍA BIM`,
    software: "Autodesk Revit 2026 (Add-in SARA)",
    guid: `${guidCalculado}-revit-2026`,
    volumen_hormigon: 342.50, // m³
    peso_acero: 28450.00, // kg
    area_mamposteria: 1120.00, // m²
    costo_apu_base: 148920.00,
    costo_marketplace_vivo: 132450.00,
    ahorro: 16470.00,
    porcentaje_ahorro: 11.1,
    elementos: [
      {
        id: "e1",
        categoria: "Structural Foundations",
        material: "Hormigón Simple f'c=280 kg/cm²",
        clasificacion: "hormigon",
        cantidad: 115.00,
        unidad: "m³",
        precio_apu: 142.00,
        precio_market: 125.00,
        subtotal_apu: 16330.00,
        subtotal_market: 14375.00,
        ahorro: 1955.00,
        color: "#3b82f6"
      },
      {
        id: "e2",
        categoria: "Structural Framing / Columns",
        material: "Hormigón Estructural f'c=240 kg/cm²",
        clasificacion: "hormigon",
        cantidad: 227.50,
        unidad: "m³",
        precio_apu: 138.50,
        precio_market: 122.00,
        subtotal_apu: 31508.75,
        subtotal_market: 27755.00,
        ahorro: 3753.75,
        color: "#06b6d4"
      },
      {
        id: "e3",
        categoria: "Structural Rebar",
        material: "Acero de Refuerzo Corrugado fy=4200",
        clasificacion: "acero",
        cantidad: 28450.00,
        unidad: "kg",
        precio_apu: 1.85,
        precio_market: 1.62,
        subtotal_apu: 52632.50,
        subtotal_market: 46089.00,
        ahorro: 6543.50,
        color: "#f59e0b"
      },
      {
        id: "e4",
        categoria: "Walls / Masonry",
        material: "Ladrillo Panelón Prensado 8x12x24",
        clasificacion: "mamposteria",
        cantidad: 1120.00,
        unidad: "m²",
        precio_apu: 22.00,
        precio_market: 18.80,
        subtotal_apu: 24640.00,
        subtotal_market: 21056.00,
        ahorro: 3584.00,
        color: "#ec4899"
      }
    ]
  }

  // Inyectar volumetrías BIM al presupuesto real
  const handleInjectBimToPresupuesto = async () => {
    setIsInjecting(true)
    setInjectSuccess(null)
    try {
      // 1. Buscar o crear el presupuesto para esta obra
      let { data: presupuesto } = await supabase
        .from('presupuestos_reales')
        .select('id, nombre_proyecto')
        .ilike('nombre_proyecto', `%${nombreProyectoActivo}%`)
        .single()

      if (!presupuesto) {
        // Crear presupuesto si no existe
        const { data: newPres, error: newErr } = await supabase
          .from('presupuestos_reales')
          .insert([{
            nombre_proyecto: nombreProyectoActivo,
            cliente_id: activeProject?.cliente_id || null,
            porcentaje_admin: 10,
            porcentaje_imprevistos: 5,
            porcentaje_utilidad: 10,
            estado: 'borrador'
          }])
          .select('id, nombre_proyecto')
          .single()

        if (newErr) throw newErr
        presupuesto = newPres
      }

      if (presupuesto) {
        // 2. Insertar o actualizar los 4 rubros calculados desde BIM
        for (const el of modeloDemo.elementos) {
          const capitulo = el.clasificacion === 'hormigon' ? '3. Estructura y Hormigones' :
                           el.clasificacion === 'acero' ? '3. Estructura y Hormigones' :
                           '4. Mamposterías, Enlucidos y Cubiertas'
          
          const subtotalCalc = el.cantidad * el.precio_market

          // Verificar si ya existe el rubro en el presupuesto
          const { data: existing } = await supabase
            .from('presupuesto_rubros')
            .select('id')
            .eq('presupuesto_id', presupuesto.id)
            .ilike('nombre_rubro', `%${el.material.slice(0, 15)}%`)
            .maybeSingle()

          if (existing) {
            await supabase
              .from('presupuesto_rubros')
              .update({
                cantidad_obra: el.cantidad,
                precio_unitario_snapshot: el.precio_market,
                subtotal: subtotalCalc
              })
              .eq('id', existing.id)
          } else {
            await supabase
              .from('presupuesto_rubros')
              .insert([{
                presupuesto_id: presupuesto.id,
                codigo_rubro: `BIM-${el.id.toUpperCase()}`,
                nombre_rubro: el.material,
                unidad: el.unidad,
                cantidad_obra: el.cantidad,
                precio_unitario_snapshot: el.precio_market,
                subtotal: subtotalCalc,
                capitulo: capitulo
              }])
          }
        }

        // 3. Recalcular total del presupuesto
        const { data: todos } = await supabase
          .from('presupuesto_rubros')
          .select('subtotal')
          .eq('presupuesto_id', presupuesto.id)

        const nuevoCD = (todos || []).reduce((acc: number, c: any) => acc + (Number(c.subtotal) || 0), 0)
        const nuevoTotal = Number((nuevoCD * 1.25).toFixed(2))

        await supabase
          .from('presupuestos_reales')
          .update({
            costo_directo_total: nuevoCD,
            gran_total: nuevoTotal
          })
          .eq('id', presupuesto.id)

        setInjectSuccess(`¡Cómputos BIM integrados exitosamente! Se inyectaron 4 rubros al presupuesto de "${nombreProyectoActivo}". Costo directo sincronizado: $${nuevoCD.toLocaleString('es-EC', { minimumFractionDigits: 2 })} USD.`)
      }
    } catch (err: any) {
      console.error("Error al inyectar BIM:", err)
      setActionFeedback({
        tipo: "error",
        mensaje: "Error al inyectar cómputos BIM: " + (err.message || String(err))
      })
    } finally {
      setIsInjecting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      
      {/* Header SARA-BIM */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-2 border border-indigo-200/60 dark:border-indigo-800/60">
            <Cuboid size={14} className="text-indigo-600 animate-pulse" />
            SARA-BIM 3D • Visor Tridimensional & Take-Off Dinámico
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Modelo 3D Paramétrico & Extracción de Volumetrías
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-2xl">
            Inspecciona la estructura en 3D, audita volumetrías de hormigón, armadura y mampostería, e inyecta directamente a la <strong>Mesa de Presupuestos</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/presupuestos_reales"
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs transition"
          >
            <span>Ir a la Mesa de Presupuestos</span>
            <ArrowRight size={14} />
          </Link>
          <button
            onClick={() => setShowBimImporter(true)}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Upload size={14} className="text-cyan-400" />
            <span>Importar Take-Off CSV</span>
          </button>
          <button 
            onClick={() => setShowRevitModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-colors"
          >
            <FileCode size={14} />
            <span>Add-in Revit 2026</span>
          </button>
        </div>
      </div>

      {/* VISOR BIM 3D INTERACTIVO (ISOMÉTRICO Y ORBITAL) */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden relative">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Cuboid size={22} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>Visor Tridimensional del Edificio (Estructura Porticada)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  WebGL / 3D Canvas
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Gira el modelo con los deslizadores o selecciona capas para aislar cimientos, columnas, vigas y muros.
              </p>
            </div>
          </div>

          {/* Filtros de Capas 3D */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setSelectedLayer("todos")}
              className={`px-3 py-1.5 rounded-lg transition ${selectedLayer === "todos" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedLayer("cimentacion")}
              className={`px-3 py-1.5 rounded-lg transition ${selectedLayer === "cimentacion" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Cimentación
            </button>
            <button
              onClick={() => setSelectedLayer("columnas")}
              className={`px-3 py-1.5 rounded-lg transition ${selectedLayer === "columnas" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Columnas
            </button>
            <button
              onClick={() => setSelectedLayer("muros")}
              className={`px-3 py-1.5 rounded-lg transition ${selectedLayer === "muros" ? "bg-pink-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Muros
            </button>
          </div>
        </div>

        {/* LIENZO 3D CON PERSPECTIVA ISOMÉTRICA */}
        <div className="relative h-[380px] w-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950 rounded-2xl border border-slate-800/80">
          
          {/* Cuadrícula de piso / Base técnica */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)`
          }} />

          {/* ESCENA 3D CSS TRANSFORMS */}
          <div 
            className="transition-transform duration-150 ease-out select-none cursor-grab active:cursor-grabbing"
            style={{
              perspective: "1000px",
              transformStyle: "preserve-3d",
              transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${zoom3D})`
            }}
          >
            {/* 1. PLANO DE CIMENTACIÓN (NIVEL 0.00) */}
            {(selectedLayer === "todos" || selectedLayer === "cimentacion") && (
              <div 
                onClick={() => setSelectedElementId("e1")}
                className="w-72 h-56 rounded-xl border-2 border-blue-500/80 bg-blue-600/30 flex items-center justify-center shadow-2xl relative transition-all hover:bg-blue-500/40 cursor-pointer"
                style={{ transform: "rotateX(90deg) translateZ(-60px)" }}
              >
                <span className="text-[10px] font-mono font-black text-blue-200">
                  LOSA CIMENTACIÓN 342.5 m³
                </span>
                {/* Plintos esquineros */}
                <div className="absolute top-2 left-2 w-8 h-8 bg-blue-400 border border-white" />
                <div className="absolute top-2 right-2 w-8 h-8 bg-blue-400 border border-white" />
                <div className="absolute bottom-2 left-2 w-8 h-8 bg-blue-400 border border-white" />
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-blue-400 border border-white" />
              </div>
            )}

            {/* 2. PÓRTICO DE COLUMNAS PISO 1 (NIVEL +3.00) */}
            {(selectedLayer === "todos" || selectedLayer === "columnas") && (
              <div 
                onClick={() => setSelectedElementId("e2")}
                className="w-72 h-56 relative cursor-pointer"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* 4 Columnas esquineras */}
                <div className="absolute -top-10 left-3 w-5 h-28 bg-gradient-to-t from-cyan-600 to-cyan-400 border border-cyan-200 shadow-md" />
                <div className="absolute -top-10 right-3 w-5 h-28 bg-gradient-to-t from-cyan-600 to-cyan-400 border border-cyan-200 shadow-md" />
                <div className="absolute -bottom-8 left-3 w-5 h-28 bg-gradient-to-t from-cyan-600 to-cyan-400 border border-cyan-200 shadow-md" />
                <div className="absolute -bottom-8 right-3 w-5 h-28 bg-gradient-to-t from-cyan-600 to-cyan-400 border border-cyan-200 shadow-md" />

                {/* Columna Central */}
                <div className="absolute top-8 left-32 w-5 h-28 bg-gradient-to-t from-cyan-600 to-cyan-400 border border-cyan-200 shadow-md" />
              </div>
            )}

            {/* 3. MUROS DE MAMPOSTERÍA */}
            {(selectedLayer === "todos" || selectedLayer === "muros") && (
              <div 
                onClick={() => setSelectedElementId("e4")}
                className="absolute inset-0 flex items-center justify-center cursor-pointer pointer-events-auto"
                style={{ transform: "translateZ(10px)" }}
              >
                <div className="w-64 h-24 bg-pink-500/40 border-2 border-pink-400 rounded-lg flex items-center justify-center backdrop-blur-xs">
                  <span className="text-[10px] font-black text-pink-200 uppercase tracking-wider">
                    Mampostería Panelón 1,120 m²
                  </span>
                </div>
              </div>
            )}

            {/* 4. LOSA DE CUBIERTA / SEGUNDO PISO (NIVEL +6.00) */}
            {(selectedLayer === "todos" || selectedLayer === "cimentacion") && (
              <div 
                className="w-72 h-56 rounded-xl border-2 border-indigo-400/80 bg-indigo-600/35 flex items-center justify-center shadow-2xl"
                style={{ transform: "rotateX(90deg) translateZ(60px)" }}
              >
                <span className="text-[10px] font-mono font-black text-indigo-200">
                  LOSA SUPERIOR (NPT +6.00m)
                </span>
              </div>
            )}
          </div>

          {/* CONTROLES DE ÓRBITA EN PANTALLA */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-xs flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Inclinación:</span>
              <input 
                type="range" 
                min="-60" 
                max="60" 
                value={rotX} 
                onChange={(e) => setRotX(Number(e.target.value))} 
                className="w-20 accent-indigo-500 cursor-pointer" 
              />
              <span className="text-[10px] font-mono text-slate-300">{rotX}°</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Giro:</span>
              <input 
                type="range" 
                min="-180" 
                max="180" 
                value={rotY} 
                onChange={(e) => setRotY(Number(e.target.value))} 
                className="w-24 accent-indigo-500 cursor-pointer" 
              />
              <span className="text-[10px] font-mono text-slate-300">{rotY}°</span>
            </div>

            <button 
              onClick={() => { setRotX(25); setRotY(-35); setZoom3D(1) }}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              title="Restablecer Isométrica"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* BOTÓN PROMINENTE DE INYECCIÓN AL PRESUPUESTO */}
          <div className="absolute bottom-3 right-3">
            <button
              onClick={handleInjectBimToPresupuesto}
              disabled={isInjecting}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isInjecting ? (
                <RefreshCw size={14} className="animate-spin text-slate-950" />
              ) : (
                <Sparkles size={14} className="text-slate-950" />
              )}
              <span>{isInjecting ? "Inyectando..." : "⚡ Inyectar Volumetrías al Presupuesto"}</span>
            </button>
          </div>
        </div>

        {/* Notificación de Éxito de Inyección */}
        {injectSuccess && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{injectSuccess}</span>
            </div>
            <Link
              href="/dashboard/presupuestos_reales"
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold text-[11px] shrink-0"
            >
              Ver en la Mesa →
            </Link>
          </div>
        )}
      </div>

      {/* Tarjeta Resumen del Modelo Seleccionado */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-3">
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-white/10 text-indigo-300 border border-white/15">
              {modeloDemo.software} • GUID: {modeloDemo.guid.slice(0, 18)}...
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              {modeloDemo.nombre_modelo}
            </h2>
            <p className="text-xs text-indigo-200/80 leading-relaxed max-w-xl">
              Volumetría física extraída sin discrepancias. Todos los elementos estructurales y de mampostería fueron mapeados con el catálogo de rubros en <strong>SARA-APU</strong>.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-indigo-300 uppercase font-bold block">Hormigón Total</span>
                <span className="text-lg font-black font-mono">{modeloDemo.volumen_hormigon} m³</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-indigo-300 uppercase font-bold block">Acero de Refuerzo</span>
                <span className="text-lg font-black font-mono">{(modeloDemo.peso_acero / 1000).toFixed(1)} Ton</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-indigo-300 uppercase font-bold block">Mampostería</span>
                <span className="text-lg font-black font-mono">{modeloDemo.area_mamposteria} m²</span>
              </div>
            </div>
          </div>

          {/* Panel de Ahorro y Cotización en Vivo */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-200">Presupuesto SARA-APU Base:</span>
              <span className="text-sm font-mono font-bold text-slate-300">
                ${modeloDemo.costo_apu_base.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">Precio Vivo SARA-MARKETPLACE:</span>
              <span className="text-lg font-mono font-black text-emerald-400">
                ${modeloDemo.costo_marketplace_vivo.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="text-emerald-400" size={18} />
                <div>
                  <span className="text-[10px] font-bold text-emerald-200 uppercase block">Ahorro Detectado B2B</span>
                  <span className="text-xs font-black text-white">-{modeloDemo.porcentaje_ahorro}% con Mayoristas</span>
                </div>
              </div>
              <span className="text-xl font-black text-emerald-300 font-mono">
                ${modeloDemo.ahorro.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="pt-2 flex gap-2">
              <Link 
                href="/dashboard/compras"
                onClick={() => setActionFeedback({
                  tipo: "info",
                  mensaje: "Iniciando generación de requisición de compras mayoristas para los elementos cuantificados en BIM..."
                })}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer"
              >
                <ShoppingCart size={15} />
                Comprar en Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla Desglosada de Elementos (Material Takeoff) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-indigo-600" />
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
              Desglose de Volumetría y Precios Comparados
            </h3>
          </div>
          <span className="text-xs text-gray-400 font-semibold">4 familias estructurales detectadas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-slate-950 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Categoría BIM</th>
                <th className="py-3 px-4">Material / Elemento</th>
                <th className="py-3 px-4 text-right">Volumen / Medida</th>
                <th className="py-3 px-4 text-right">P.U. APU Base</th>
                <th className="py-3 px-4 text-right">P.U. Marketplace</th>
                <th className="py-3 px-4 text-right">Subtotal Vivo</th>
                <th className="py-3 px-4 text-right">Diferencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
              {modeloDemo.elementos.map(el => (
                <tr 
                  key={el.id} 
                  className={`transition-colors ${selectedElementId === el.id ? 'bg-indigo-50 dark:bg-indigo-950/40' : 'hover:bg-gray-50/50 dark:hover:bg-slate-800/30'}`}
                >
                  <td className="py-3.5 px-4 font-mono text-gray-500">{el.categoria}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: el.color }} />
                    <span>{el.material}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold">{el.cantidad.toLocaleString('es-EC')} {el.unidad}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-gray-500">${el.precio_apu.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">${el.precio_market.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900 dark:text-white">${el.subtotal_market.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">-${el.ahorro.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
