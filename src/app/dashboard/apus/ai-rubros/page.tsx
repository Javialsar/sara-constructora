"use client"

import React, { useState } from "react"
import Link from "next/link"
import { 
  Sparkles, 
  Send, 
  Layers, 
  Box, 
  Wrench, 
  Truck, 
  CheckCircle2, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  AlertTriangle,
  Plus, 
  Trash2, 
  ShieldCheck, 
  FileCheck, 
  Scale, 
  Info,
  CheckCircle,
  HelpCircle,
  Clock,
  Loader2,
  DollarSign
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useProject } from "@/contexts/ProjectContext"
import AiBulkRubrosModal from "@/app/admin/apus/rubros/components/AiBulkRubrosModal"
import { calcularRubroApu, RecursoApuInput } from "@/lib/calculadoras/saraApuEngine"

export type EstadoPrecio = "verificado" | "cotizado" | "estimado" | "historico"

export interface InsumoRow {
  id?: string
  codigo?: string
  nombre: string
  unidad: string
  cantidad: number
  precio_unitario: number
  desperdicio_pct?: number
  estado_precio?: EstadoPrecio
  fuente_precio?: string
  es_nacional?: boolean
  insumo_existente_id?: string | null
}

export interface ApuStructure {
  nombre_rubro: string
  unidad: string
  rendimiento_estimado: number
  especificaciones_tecnicas: string
  supuestos_tecnicos: string[]
  advertencias_ingenieria: string[]
  materiales: InsumoRow[]
  mano_de_obra: InsumoRow[]
  equipos: InsumoRow[]
  herramienta_menor_pct?: number
  costos: {
    costo_materiales: number
    costo_mano_de_obra: number
    costo_equipos_base: number
    costo_herramienta_menor: number
    costo_equipos_total: number
    costo_directo_unitario: number
  }
  costo_directo_estimado: number
  requiere_aprobacion_humana?: boolean
  estado_revision?: "pendiente_revision" | "aprobado" | "rechazado"
}

export default function SaraAiRubrosPage() {
  const supabase = createClient()
  const { activeProject } = useProject()
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<ApuStructure | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [guardadoExitoso, setGuardadoExitoso] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  
  // Gate de Aprobación Humana Obligatoria
  const [conformidadTecnica, setConformidadTecnica] = useState(false)
  const [observacionRevision, setObservacionRevision] = useState("")

  const ejemplosRapidos = [
    "Muro de contención de hormigón armado h=3.0m con zapatas corridas en suelo blando",
    "Mampostería de bloque de cemento de 15cm con mortero 1:4 y chicotes de anclaje",
    "Piso de porcelanato antideslizante 60x60cm pegado con bondex sobre contrapiso",
    "Excavación en zanja para tubería PVC 110mm en terreno rocoso con compresor"
  ]

  // Recálculo determinista a través del motor saraApuEngine
  const recalcularDeterminista = (apu: ApuStructure): ApuStructure => {
    const recursosEngine: RecursoApuInput[] = [
      ...apu.materiales.map(m => ({
        descripcion: m.nombre,
        categoria: 'material' as const,
        unidad: m.unidad,
        cantidad: Number(m.cantidad) || 0,
        precioUnitario: Number(m.precio_unitario) || 0,
        desperdicioPct: Number(m.desperdicio_pct) || 0,
        esNacional: m.es_nacional ?? true
      })),
      ...apu.mano_de_obra.map(mo => ({
        descripcion: mo.nombre,
        categoria: 'mano_de_obra' as const,
        unidad: mo.unidad,
        cantidad: Number(mo.cantidad) || 0,
        precioUnitario: Number(mo.precio_unitario) || 0,
        desperdicioPct: 0,
        esNacional: mo.es_nacional ?? true
      })),
      ...apu.equipos.map(eq => ({
        descripcion: eq.nombre,
        categoria: 'equipo' as const,
        unidad: eq.unidad,
        cantidad: Number(eq.cantidad) || 0,
        precioUnitario: Number(eq.precio_unitario) || 0,
        desperdicioPct: 0,
        esNacional: eq.es_nacional ?? true
      }))
    ]

    const herramPct = apu.herramienta_menor_pct !== undefined ? apu.herramienta_menor_pct : 5.0
    const calculo = calcularRubroApu({
      codigoRubro: 'TEMP-AI',
      descripcion: apu.nombre_rubro,
      unidad: apu.unidad,
      cantidadObra: 1,
      recursos: recursosEngine,
      herramientaMenorPct: herramPct
    })

    return {
      ...apu,
      herramienta_menor_pct: herramPct,
      costos: {
        costo_materiales: calculo.costoMateriales,
        costo_mano_de_obra: calculo.costoManoDeObra,
        costo_equipos_base: calculo.costoEquiposBase,
        costo_herramienta_menor: calculo.costoHerramientaMenor,
        costo_equipos_total: calculo.costoEquiposTotal,
        costo_directo_unitario: calculo.costoDirectoUnitario
      },
      costo_directo_estimado: calculo.costoDirectoUnitario
    }
  }

  const handleGenerarApu = async (texto: string) => {
    if (!texto.trim()) return
    setLoading(true)
    setResultado(null)
    setGuardadoExitoso(false)
    setConformidadTecnica(false)
    setObservacionRevision("")

    try {
      const res = await fetch("/api/ai-rubros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion_rubro: texto,
          complejidad: "estandar"
        })
      })

      const json = await res.json()
      if (json.success && json.data) {
        setResultado(recalcularDeterminista(json.data))
      } else {
        alert("No se pudo generar el rubro: " + (json.error || "Intente nuevamente"))
      }
    } catch {
      alert("Error de conexión al servidor de SARA-AI-RUBROS")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateInsumo = (tipo: 'materiales' | 'mano_de_obra' | 'equipos', index: number, campo: keyof InsumoRow, valor: any) => {
    if (!resultado) return
    const listaActual = [...resultado[tipo]]
    listaActual[index] = {
      ...listaActual[index],
      [campo]: campo === 'cantidad' || campo === 'precio_unitario' || campo === 'desperdicio_pct' 
        ? parseFloat(valor) || 0 
        : valor
    }

    const nuevoApu = recalcularDeterminista({
      ...resultado,
      [tipo]: listaActual
    })
    setResultado(nuevoApu)
  }

  const handleEliminarInsumo = (tipo: 'materiales' | 'mano_de_obra' | 'equipos', index: number) => {
    if (!resultado) return
    const listaActual = resultado[tipo].filter((_, i) => i !== index)
    const nuevoApu = recalcularDeterminista({
      ...resultado,
      [tipo]: listaActual
    })
    setResultado(nuevoApu)
  }

  const handleAgregarInsumo = (tipo: 'materiales' | 'mano_de_obra' | 'equipos') => {
    if (!resultado) return
    const nuevoItem: InsumoRow = {
      nombre: tipo === 'materiales' ? "Nuevo Material" : tipo === 'mano_de_obra' ? "Nuevo Obrero / Especialista" : "Nuevo Equipo / Maquinaria",
      unidad: tipo === 'materiales' ? "u" : "hora",
      cantidad: 1.0,
      precio_unitario: tipo === 'mano_de_obra' ? 4.25 : 5.00,
      desperdicio_pct: tipo === 'materiales' ? 5.0 : 0,
      estado_precio: "estimado",
      fuente_precio: "Ingreso manual de usuario"
    }
    const nuevoApu = recalcularDeterminista({
      ...resultado,
      [tipo]: [...resultado[tipo], nuevoItem]
    })
    setResultado(nuevoApu)
  }

  const renderBadgeEstadoPrecio = (estado?: EstadoPrecio, fuente?: string) => {
    switch (estado) {
      case "verificado":
        return (
          <span 
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60"
            title={fuente || "Precio verificado en catálogo maestro / MDT"}
          >
            <CheckCircle size={10} className="text-emerald-600 dark:text-emerald-400" />
            Verificado
          </span>
        )
      case "cotizado":
        return (
          <span 
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300 dark:border-sky-700/60"
            title={fuente || "Precio respaldado por cotización o proveedor formal"}
          >
            <DollarSign size={10} className="text-sky-600 dark:text-sky-400" />
            Cotizado
          </span>
        )
      case "historico":
        return (
          <span 
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
            title={fuente || "Precio histórico de proyectos previos"}
          >
            <Clock size={10} className="text-slate-500" />
            Histórico
          </span>
        )
      case "estimado":
      default:
        return (
          <span 
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60"
            title={fuente || "Estimación paramétrica IA - Requiere confirmación de compra"}
          >
            <HelpCircle size={10} className="text-amber-600 dark:text-amber-400" />
            Estimado
          </span>
        )
    }
  }

  // Aprobación Humana e Incorporación Segura
  const handleAprobarEInsertar = async () => {
    if (!resultado) return
    if (!conformidadTecnica) {
      alert("Debes marcar la casilla de conformidad técnica y revisión humana antes de incorporar esta propuesta.")
      return
    }

    setGuardando(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert("Debes iniciar sesión para guardar el rubro.")
        return
      }

      // 1. Crear rubro en public.rubros con user_id del cliente (es_maestro: false para aislamiento total)
      const codigoRubro = `AI-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
      const rubroPayload: any = {
        codigo: codigoRubro,
        nombre: resultado.nombre_rubro,
        unidad: resultado.unidad,
        herramienta_menor_pct: resultado.herramienta_menor_pct || 5.0,
        es_maestro: false,
        user_id: user.id
      }
      if (resultado.rendimiento_estimado !== undefined) {
        rubroPayload.rendimiento = resultado.rendimiento_estimado
      }

      const { data: nuevoRubro, error: errRubro } = await supabase
        .from('rubros')
        .insert([rubroPayload])
        .select()
        .single()

      if (errRubro || !nuevoRubro) {
        throw new Error(errRubro?.message || "No se pudo registrar el rubro")
      }

      // 2. Mapear o registrar insumos y ligar a rubro_insumos
      const todosLosInsumos = [
        ...resultado.materiales.map(m => ({ ...m, tipo: 'material' })),
        ...resultado.mano_de_obra.map(mo => ({ ...mo, tipo: 'mano_de_obra' })),
        ...resultado.equipos.map(eq => ({ ...eq, tipo: 'equipo' }))
      ]

      for (const item of todosLosInsumos) {
        let insumoId = item.insumo_existente_id

        if (!insumoId) {
          const { data: insumoCreado } = await supabase
            .from('insumos')
            .insert([{
              codigo: `${item.tipo.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
              nombre: item.nombre,
              unidad: item.unidad,
              tipo: item.tipo,
              precio_sin_iva: item.precio_unitario,
              es_maestro: false,
              user_id: user.id
            }])
            .select()
            .single()

          if (insumoCreado) insumoId = insumoCreado.id
        }

        if (insumoId) {
          await supabase.from('rubro_insumos').insert([{
            rubro_id: nuevoRubro.id,
            insumo_id: insumoId,
            cantidad: item.cantidad
          }])
        }
      }

      // 3. Registrar auditoría de aprobación humana
      await supabase.from('sara_ai_rubros_logs').insert([{
        user_id: user.id,
        prompt_usuario: prompt || resultado.nombre_rubro,
        rubro_sugerido_nombre: resultado.nombre_rubro,
        unidad_medida: resultado.unidad,
        rendimiento_estimado: resultado.rendimiento_estimado,
        estructura_apu: resultado,
        costo_directo_estimado: resultado.costo_directo_estimado,
        modelo_llm: 'sara-nlp-engine-v2-deterministico',
        estado_aprobacion: 'aprobado_por_usuario'
      }])

      setGuardadoExitoso(true)
      setTimeout(() => setGuardadoExitoso(false), 5000)
    } catch (err: any) {
      alert("Error al guardar en tu catálogo: " + err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2 border border-emerald-200/60 dark:border-emerald-800/60">
            <Sparkles size={14} className="text-emerald-600 animate-pulse" />
            SARA-AI-RUBROS • Generador Inteligente con Zod Estricto & Motor Determinista
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Diseño Autónomo & Revisión Técnica de APU
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-2xl">
            Genera rubros con supuestos técnicos, advertencias de ingeniería civil y trazabilidad de precios. <strong>Requiere aprobación técnica humana obligatoria</strong> antes de incorporarse a tu empresa.
          </p>
        </div>

        {/* Botones de Navegación */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Link
            href="/dashboard/apus/rubros"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 font-bold text-xs shadow-xs transition-all"
          >
            <Layers size={15} />
            <span>Banco Maestro de Rubros</span>
          </Link>
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all"
          >
            <Sparkles size={15} className="text-yellow-300 animate-pulse" />
            <span>Generar Lote por Categoría</span>
          </button>
        </div>
      </div>

      {/* Banner de Garantía y Regla de Inmutabilidad */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-2 border-blue-500/40 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 shrink-0 mt-0.5">
            <ShieldCheck size={22} className="text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-white font-black text-sm">
                Regla de Inmutabilidad & Aprobación Previa (Fase 2, 5 y 6)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Protegido
              </span>
            </div>
            <p className="text-slate-300 text-xs mt-1 leading-relaxed max-w-3xl">
              Ninguna sugerencia o cómputo generado por Inteligencia Artificial muta de forma directa los presupuestos aprobados ni el Catálogo Maestro de Grupo SARA. Cada propuesta requiere validación y aprobación profesional explícita.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <span className="text-[11px] font-mono text-blue-200/80 bg-blue-950/60 px-3 py-1.5 rounded-xl border border-blue-500/20">
            es_maestro: <strong className="text-emerald-400">false</strong> · Catálogo Privado
          </span>
        </div>
      </div>

      {/* Barra de Entrada / Chat Inteligente */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border-2 border-emerald-500/30 shadow-lg space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerarApu(prompt)}
            placeholder="Ej: 'Muro de contención de hormigón armado h=3.0m con zapatas corridas en suelo blando'..."
            className="flex-1 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={() => handleGenerarApu(prompt)}
            disabled={loading || !prompt.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0 text-sm"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
            Generar APU
          </button>
        </div>

        {/* Ejemplos Rápidos */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Sugerencias:</span>
          {ejemplosRapidos.map((ej, idx) => (
            <button
              key={idx}
              onClick={() => { setPrompt(ej); handleGenerarApu(ej); }}
              className="text-xs bg-gray-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-lg transition-colors border border-gray-200 dark:border-slate-700 text-left"
            >
              {ej.length > 40 ? ej.substring(0, 40) + "..." : ej}
            </button>
          ))}
        </div>
      </div>

      {/* Resultados Dinámicos del APU con Edición en Vivo y Contrato Estricto */}
      {resultado && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-0">
          
          {/* Alerta de Estado: Pendiente de Revisión Humana */}
          <div className="bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800/80 px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-xs font-bold">
              <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span>ESTADO DE LA PROPUESTA: PENDIENTE DE CONFIRMACIÓN Y REVISIÓN TÉCNICA</span>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
              Validación Zod & saraApuEngine OK
            </span>
          </div>

          {/* Cabecera del Rubro Generado */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border-b border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Unidad:
                  <input
                    type="text"
                    value={resultado.unidad}
                    onChange={e => setResultado({ ...resultado, unidad: e.target.value })}
                    className="ml-1 w-12 text-center bg-transparent border-b border-emerald-400 font-bold outline-none"
                  />
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  Rendimiento: 
                  <input
                    type="number"
                    step="0.05"
                    value={resultado.rendimiento_estimado}
                    onChange={e => setResultado({ ...resultado, rendimiento_estimado: parseFloat(e.target.value) || 0 })}
                    className="ml-1 w-16 text-center bg-transparent border-b border-gray-300 font-bold outline-none"
                  /> h/{resultado.unidad}
                </span>
              </div>
              <input
                type="text"
                value={resultado.nombre_rubro}
                onChange={e => setResultado({ ...resultado, nombre_rubro: e.target.value })}
                className="w-full text-xl font-black text-gray-900 dark:text-white bg-transparent border-b border-dashed border-gray-300 hover:border-gray-500 focus:border-emerald-500 outline-none pt-1"
              />
              <p className="text-xs text-gray-500 pt-1">
                {resultado.especificaciones_tecnicas}
              </p>
            </div>

            <div className="text-right bg-white dark:bg-slate-900 px-5 py-3 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs shrink-0">
              <span className="text-[10px] font-bold uppercase text-gray-400 block">Costo Directo Unitario Determinado</span>
              <div className="text-2xl font-black font-mono text-emerald-600">
                ${resultado.costo_directo_estimado.toFixed(2)}
              </div>
              <span className="text-[10px] text-gray-400">Sin IVA • Base de cálculo 2026</span>
            </div>
          </div>

          {/* Paneles de Supuestos Técnicos y Advertencias de Ingeniería Civil */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            {/* Supuestos Técnicos */}
            <div className="bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/60 shadow-xs">
              <div className="flex items-center gap-2 mb-2.5 text-blue-800 dark:text-blue-300 font-bold text-xs uppercase tracking-wide">
                <Scale size={15} className="text-blue-600 dark:text-blue-400" />
                <span>Supuestos Técnicos de Diseño</span>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                {(resultado.supuestos_tecnicos || []).map((supuesto, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{supuesto}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Advertencias de Ingeniería Civil */}
            <div className="bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/60 shadow-xs">
              <div className="flex items-center gap-2 mb-2.5 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wide">
                <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400" />
                <span>Advertencias de Ingeniería Civil (Norma NEC / INEN)</span>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                {(resultado.advertencias_ingenieria || []).map((adv, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold mt-0.5">⚠️</span>
                    <span className="leading-relaxed">{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sub-tablas APU Editables con Trazabilidad de Precio */}
          <div className="p-6 space-y-6">
            
            {/* 1. Materiales */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-2">
                  <Box size={14} /> 1. Materiales Puestos en Obra (Subtotal: ${resultado.costos.costo_materiales.toFixed(2)})
                </h3>
                <button
                  type="button"
                  onClick={() => handleAgregarInsumo('materiales')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Plus size={13} /> Agregar Material
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 font-bold">
                    <tr>
                      <th className="px-4 py-2.5">Descripción del Material</th>
                      <th className="px-3 py-2.5 text-center w-28">Calidad Precio</th>
                      <th className="px-3 py-2.5 text-center w-20">Unidad</th>
                      <th className="px-3 py-2.5 text-right w-24">Cantidad</th>
                      <th className="px-3 py-2.5 text-right w-24">Desp. (%)</th>
                      <th className="px-3 py-2.5 text-right w-28">P. Unitario ($)</th>
                      <th className="px-4 py-2.5 text-right w-28">Subtotal ($)</th>
                      <th className="px-2 py-2.5 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {resultado.materiales.map((m, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={m.nombre}
                            onChange={e => handleUpdateInsumo('materiales', idx, 'nombre', e.target.value)}
                            className="w-full bg-transparent border-none font-medium text-gray-800 dark:text-gray-200 outline-none"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          {renderBadgeEstadoPrecio(m.estado_precio, m.fuente_precio)}
                        </td>
                        <td className="px-3 py-2 text-center text-gray-500">
                          <input
                            type="text"
                            value={m.unidad}
                            onChange={e => handleUpdateInsumo('materiales', idx, 'unidad', e.target.value)}
                            className="w-12 text-center bg-gray-50 dark:bg-slate-800 rounded px-1 py-0.5 outline-none font-bold"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={m.cantidad}
                            onChange={e => handleUpdateInsumo('materiales', idx, 'cantidad', e.target.value)}
                            className="w-20 text-right bg-gray-50 dark:bg-slate-800 font-mono rounded px-2 py-1 outline-none font-bold"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            step="1"
                            value={m.desperdicio_pct || 0}
                            onChange={e => handleUpdateInsumo('materiales', idx, 'desperdicio_pct', e.target.value)}
                            className="w-16 text-right bg-gray-50 dark:bg-slate-800 font-mono rounded px-2 py-1 outline-none text-gray-500"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={m.precio_unitario}
                            onChange={e => handleUpdateInsumo('materiales', idx, 'precio_unitario', e.target.value)}
                            className="w-20 text-right bg-gray-50 dark:bg-slate-800 font-mono rounded px-2 py-1 outline-none"
                          />
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-bold text-gray-800 dark:text-gray-100">
                          ${((m.cantidad * (1 + (m.desperdicio_pct || 0) / 100)) * m.precio_unitario).toFixed(2)}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleEliminarInsumo('materiales', idx)}
                            className="text-gray-300 hover:text-red-500 p-1 rounded"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Mano de Obra */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <Wrench size={14} /> 2. Mano de Obra (CHR Sectorial MDT con Beneficios de Ley • Subtotal: ${resultado.costos.costo_mano_de_obra.toFixed(2)})
                </h3>
                <button
                  type="button"
                  onClick={() => handleAgregarInsumo('mano_de_obra')}
                  className="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1"
                >
                  <Plus size={13} /> Agregar Obrero
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 font-bold">
                    <tr>
                      <th className="px-4 py-2.5">Categoría / Ocupación</th>
                      <th className="px-3 py-2.5 text-center w-28">Calidad Precio</th>
                      <th className="px-3 py-2.5 text-center w-20">Unidad</th>
                      <th className="px-3 py-2.5 text-right w-28">Rendimiento (h)</th>
                      <th className="px-3 py-2.5 text-right w-28">Costo Horario Real ($)</th>
                      <th className="px-4 py-2.5 text-right w-28">Subtotal ($)</th>
                      <th className="px-2 py-2.5 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {resultado.mano_de_obra.map((mo, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={mo.nombre}
                            onChange={e => handleUpdateInsumo('mano_de_obra', idx, 'nombre', e.target.value)}
                            className="w-full bg-transparent border-none font-medium text-gray-800 dark:text-gray-200 outline-none"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          {renderBadgeEstadoPrecio(mo.estado_precio, mo.fuente_precio)}
                        </td>
                        <td className="px-3 py-2 text-center text-gray-500">
                          <input
                            type="text"
                            value={mo.unidad}
                            onChange={e => handleUpdateInsumo('mano_de_obra', idx, 'unidad', e.target.value)}
                            className="w-12 text-center bg-gray-50 dark:bg-slate-800 rounded px-1 py-0.5 outline-none font-bold"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            step="0.05"
                            value={mo.cantidad}
                            onChange={e => handleUpdateInsumo('mano_de_obra', idx, 'cantidad', e.target.value)}
                            className="w-20 text-right bg-gray-50 dark:bg-slate-800 font-mono rounded px-2 py-1 outline-none font-bold"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            step="0.05"
                            value={mo.precio_unitario}
                            onChange={e => handleUpdateInsumo('mano_de_obra', idx, 'precio_unitario', e.target.value)}
                            className="w-20 text-right bg-gray-50 dark:bg-slate-800 font-mono rounded px-2 py-1 outline-none"
                          />
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-bold text-gray-800 dark:text-gray-100">
                          ${(mo.cantidad * mo.precio_unitario).toFixed(2)}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleEliminarInsumo('mano_de_obra', idx)}
                            className="text-gray-300 hover:text-red-500 p-1 rounded"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Equipos y Herramienta Menor */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-2">
                  <Truck size={14} /> 3. Equipos & Herramienta Menor ({resultado.herramienta_menor_pct || 5}% M.O. • Subtotal: ${resultado.costos.costo_equipos_total.toFixed(2)})
                </h3>
                <button
                  type="button"
                  onClick={() => handleAgregarInsumo('equipos')}
                  className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                >
                  <Plus size={13} /> Agregar Equipo
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 font-bold">
                    <tr>
                      <th className="px-4 py-2.5">Equipo / Maquinaria</th>
                      <th className="px-3 py-2.5 text-center w-28">Calidad Precio</th>
                      <th className="px-3 py-2.5 text-center w-20">Unidad</th>
                      <th className="px-3 py-2.5 text-right w-28">Cantidad / Rend.</th>
                      <th className="px-3 py-2.5 text-right w-28">Tarifa Horaria ($)</th>
                      <th className="px-4 py-2.5 text-right w-28">Subtotal ($)</th>
                      <th className="px-2 py-2.5 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {resultado.equipos.map((eq, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={eq.nombre}
                            onChange={e => handleUpdateInsumo('equipos', idx, 'nombre', e.target.value)}
                            className="w-full bg-transparent border-none font-medium text-gray-800 dark:text-gray-200 outline-none"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          {renderBadgeEstadoPrecio(eq.estado_precio, eq.fuente_precio)}
                        </td>
                        <td className="px-3 py-2 text-center text-gray-500">
                          <input
                            type="text"
                            value={eq.unidad}
                            onChange={e => handleUpdateInsumo('equipos', idx, 'unidad', e.target.value)}
                            className="w-12 text-center bg-gray-50 dark:bg-slate-800 rounded px-1 py-0.5 outline-none font-bold"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            step="0.05"
                            value={eq.cantidad}
                            onChange={e => handleUpdateInsumo('equipos', idx, 'cantidad', e.target.value)}
                            className="w-20 text-right bg-gray-50 dark:bg-slate-800 font-mono rounded px-2 py-1 outline-none font-bold"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            step="0.1"
                            value={eq.precio_unitario}
                            onChange={e => handleUpdateInsumo('equipos', idx, 'precio_unitario', e.target.value)}
                            className="w-20 text-right bg-gray-50 dark:bg-slate-800 font-mono rounded px-2 py-1 outline-none"
                          />
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-bold text-gray-800 dark:text-gray-100">
                          ${(eq.cantidad * eq.precio_unitario).toFixed(2)}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleEliminarInsumo('equipos', idx)}
                            className="text-gray-300 hover:text-red-500 p-1 rounded"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {/* Fila Herramienta Menor calculada */}
                    <tr className="bg-slate-50/80 dark:bg-slate-800/40 text-gray-600 dark:text-gray-300 italic">
                      <td className="px-4 py-2 font-medium">
                        Herramienta menor ({resultado.herramienta_menor_pct || 5.0}% sobre Mano de Obra)
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Verificado</span>
                      </td>
                      <td className="px-3 py-2 text-center font-bold">%mo</td>
                      <td className="px-3 py-2 text-right font-mono">{resultado.herramienta_menor_pct || 5.0}</td>
                      <td className="px-3 py-2 text-right font-mono">—</td>
                      <td className="px-4 py-2 text-right font-mono font-bold text-purple-700 dark:text-purple-300">
                        ${resultado.costos.costo_herramienta_menor.toFixed(2)}
                      </td>
                      <td className="px-2 py-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* PANEL DE CONTROL DE REVISIÓN TÉCNICA Y CONFIRMACIÓN HUMANA */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t-2 border-emerald-500/30 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <FileCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Confirmación Técnica y Conformidad del Profesional
                </h4>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Para cumplir con la gobernanza agéntica y asegurar que ninguna IA modifique directamente datos contractuales sin inspección humana, marque la casilla de conformidad tras verificar rendimientos, insumos y advertencias.
              </p>

              <label className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={conformidadTecnica}
                  onChange={e => setConformidadTecnica(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    Certifico como profesional técnico que he revisado la estructura del APU, las dosificaciones y los precios referenciales.
                  </span>
                  <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                    Autorizo su incorporación formal a mi catálogo privado de rubros SARA-APU.
                  </p>
                </div>
              </label>
            </div>

            {/* Acciones de Aprobación */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              {guardadoExitoso ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-fadeIn">
                  <CheckCircle2 size={16} /> ¡Rubro validado técnicamente e incorporado con éxito en tu catálogo privado!
                </span>
              ) : (
                <span className="text-xs text-gray-400">
                  {conformidadTecnica ? "Listo para incorporar al catálogo privado." : "Se requiere verificación técnica previa antes de guardar."}
                </span>
              )}

              <button
                onClick={handleAprobarEInsertar}
                disabled={guardando || !conformidadTecnica}
                className={`text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all ${
                  conformidadTecnica 
                    ? "bg-emerald-600 hover:bg-emerald-700 hover:scale-105 active:scale-95 cursor-pointer" 
                    : "bg-gray-400 dark:bg-slate-700 opacity-60 cursor-not-allowed"
                }`}
              >
                {guardando ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Guardando en Catálogo Privado...</span>
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    <span>Aprobar e Incorporar al Presupuesto / Catálogo SARA-APU</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Generación Masiva por Categorías */}
      <AiBulkRubrosModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        esPrivado={true}
        proyectoId={activeProject?.id}
        proyectoNombre={activeProject?.nombre}
        onSuccess={() => {
          alert("¡Lote de rubros privados generado exitosamente para tu proyecto! Tu catálogo maestro de Grupo SARA no fue alterado.")
        }}
      />
    </div>
  )
}
