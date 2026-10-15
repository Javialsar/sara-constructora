"use client"

import React, { useState } from "react"
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
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  Check,
  ChevronDown,
  Loader2,
  ShieldCheck
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useProject } from "@/contexts/ProjectContext"
import AiBulkRubrosModal from "@/app/admin/apus/rubros/components/AiBulkRubrosModal"

interface InsumoRow {
  nombre: string
  unidad: string
  cantidad: number
  precio_unitario: number
  es_nacional?: boolean
  insumo_existente_id?: string | null
}

interface ApuStructure {
  nombre_rubro: string
  unidad: string
  rendimiento_estimado: number
  especificaciones_tecnicas: string
  materiales: InsumoRow[]
  mano_de_obra: InsumoRow[]
  equipos: InsumoRow[]
  herramienta_menor_pct?: number
  costo_directo_estimado: number
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

  const ejemplosRapidos = [
    "Muro de contención de hormigón armado h=3.0m con zapatas corridas en suelo blando",
    "Mampostería de bloque de cemento de 15cm con mortero 1:4 y chicotes de anclaje",
    "Piso de porcelanato antideslizante 60x60cm pegado con bondex sobre contrapiso",
    "Excavación en zanja para tubería PVC 110mm en terreno rocoso con compresor"
  ]

  const recalcularCostoDirecto = (apu: ApuStructure): ApuStructure => {
    const totMat = apu.materiales.reduce((acc, m) => acc + (Number(m.cantidad) * Number(m.precio_unitario)), 0)
    const totMo = apu.mano_de_obra.reduce((acc, mo) => acc + (Number(mo.cantidad) * Number(mo.precio_unitario)), 0)
    const totEq = apu.equipos.reduce((acc, eq) => acc + (Number(eq.cantidad) * Number(eq.precio_unitario)), 0)
    const herramMenor = totMo * ((apu.herramienta_menor_pct || 5.0) / 100)
    const costoTotal = totMat + totMo + totEq + herramMenor

    return {
      ...apu,
      costo_directo_estimado: parseFloat(costoTotal.toFixed(2))
    }
  }

  const handleGenerarApu = async (texto: string) => {
    if (!texto.trim()) return
    setLoading(true)
    setResultado(null)
    setGuardadoExitoso(false)

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
        setResultado(recalcularCostoDirecto(json.data))
      } else {
        alert("No se pudo generar el rubro: " + (json.error || "Intente nuevamente"))
      }
    } catch {
      alert("Error de conexión al servidor de SARA-AI-RUBROS")
    } finally {
      setLoading(false)
    }
  }

  // Modificación de Insumos en tiempo real
  const handleUpdateInsumo = (tipo: 'materiales' | 'mano_de_obra' | 'equipos', index: number, campo: keyof InsumoRow, valor: any) => {
    if (!resultado) return
    const listaActual = [...resultado[tipo]]
    listaActual[index] = {
      ...listaActual[index],
      [campo]: campo === 'cantidad' || campo === 'precio_unitario' ? parseFloat(valor) || 0 : valor
    }

    const nuevoApu = recalcularCostoDirecto({
      ...resultado,
      [tipo]: listaActual
    })
    setResultado(nuevoApu)
  }

  const handleEliminarInsumo = (tipo: 'materiales' | 'mano_de_obra' | 'equipos', index: number) => {
    if (!resultado) return
    const listaActual = resultado[tipo].filter((_, i) => i !== index)
    const nuevoApu = recalcularCostoDirecto({
      ...resultado,
      [tipo]: listaActual
    })
    setResultado(nuevoApu)
  }

  const handleAgregarInsumo = (tipo: 'materiales' | 'mano_de_obra' | 'equipos') => {
    if (!resultado) return
    const nuevoItem: InsumoRow = {
      nombre: tipo === 'materiales' ? "Nuevo Material" : tipo === 'mano_de_obra' ? "Nuevo Obrero/Especialista" : "Nuevo Equipo/Herramienta",
      unidad: tipo === 'materiales' ? "u" : "hora",
      cantidad: 1.0,
      precio_unitario: tipo === 'mano_de_obra' ? 4.20 : 5.00
    }
    const nuevoApu = recalcularCostoDirecto({
      ...resultado,
      [tipo]: [...resultado[tipo], nuevoItem]
    })
    setResultado(nuevoApu)
  }

  const handleAprobarEInsertar = async () => {
    if (!resultado) return
    setGuardando(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert("Debes iniciar sesión para guardar el rubro.")
        return
      }

      // 1. Crear rubro en public.rubros con user_id del cliente y proyecto_id
      const codigoRubro = `AI-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
      const rubroPayload: any = {
        codigo: codigoRubro,
        nombre: resultado.nombre_rubro,
        unidad: resultado.unidad,
        rendimiento: resultado.rendimiento_estimado,
        herramienta_menor_pct: resultado.herramienta_menor_pct || 5.0,
        total_costo_directo: resultado.costo_directo_estimado,
        es_maestro: false,
        user_id: user.id
      }
      if (activeProject?.id) {
        rubroPayload.proyecto_id = activeProject.id
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
          // Crear insumo si no existe
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
            SARA-AI-RUBROS • Generador Inteligente con NLP & Norma NEC
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Diseño Autónomo de Precios Unitarios (APU)
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-2xl">
            Genera rubros individuales por lenguaje natural o genera <strong>lotes completos por categorías constructivas</strong>. Modifica cantidades y precios en vivo antes de incorporarlos a tu empresa.
          </p>
        </div>

        {/* Botón Lote Masivo por Categorías */}
        <button
          onClick={() => setIsBulkModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all shrink-0"
        >
          <Sparkles size={15} className="text-yellow-300 animate-pulse" />
          <span>Generar Lote por Categoría Constructiva</span>
        </button>
      </div>

      {/* Banner de Garantía de Aislamiento y Privacidad de Rubros */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-2 border-blue-500/40 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 shrink-0 mt-0.5">
            <ShieldCheck size={22} className="text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-white font-black text-sm">
                Aislamiento de Seguridad: Catálogo Privado del Cliente
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Protegido
              </span>
            </div>
            <p className="text-slate-300 text-xs mt-1 leading-relaxed max-w-3xl">
              Todos los rubros y APUs que diseñes o generes con Inteligencia Artificial pertenecen de forma <strong>exclusiva y confidencial a tu empresa</strong>{activeProject ? ` (asociados al proyecto: ${activeProject.nombre})` : ''}. <strong>Bajo ninguna circunstancia modifican, sobrescriben o alteran el Catálogo Maestro Oficial</strong> de Grupo SARA.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <span className="text-[11px] font-mono text-blue-200/80 bg-blue-950/60 px-3 py-1.5 rounded-xl border border-blue-500/20">
            es_maestro: <strong className="text-emerald-400">false</strong> · Privado
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
            placeholder="Ej: 'Viga de confinamiento de 20x25cm con 4 varillas de 12mm y estribos cada 15cm'..."
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

      {/* Resultados Dinámicos del APU con Edición en Vivo */}
      {resultado && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Cabecera del Rubro Generado */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border-b border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-800">
                  Unidad:
                  <input
                    type="text"
                    value={resultado.unidad}
                    onChange={e => setResultado({ ...resultado, unidad: e.target.value })}
                    className="ml-1 w-12 text-center bg-transparent border-b border-emerald-400 font-bold outline-none"
                  />
                </span>
                <span className="text-xs text-gray-400 font-mono">
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
              <span className="text-[10px] font-bold uppercase text-gray-400 block">Costo Directo Unitario</span>
              <div className="text-2xl font-black font-mono text-emerald-600">
                ${resultado.costo_directo_estimado.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Sub-tablas APU Editables (Materiales, Mano de Obra, Equipos) */}
          <div className="p-6 space-y-6">
            
            {/* 1. Materiales */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-2">
                  <Box size={14} /> 1. Materiales Puestos en Obra (Sin IVA)
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
                      <th className="px-3 py-2.5 text-center w-20">Unidad</th>
                      <th className="px-3 py-2.5 text-right w-28">Cantidad</th>
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
                        <td className="px-3 py-2 text-center text-gray-500">
                          <input
                            type="text"
                            value={m.unidad}
                            onChange={e => handleUpdateInsumo('materiales', idx, 'unidad', e.target.value)}
                            className="w-12 text-center bg-gray-50 dark:bg-slate-800 rounded px-1 py-0.5 outline-none"
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
                            step="0.01"
                            value={m.precio_unitario}
                            onChange={e => handleUpdateInsumo('materiales', idx, 'precio_unitario', e.target.value)}
                            className="w-20 text-right bg-gray-50 dark:bg-slate-800 font-mono rounded px-2 py-1 outline-none"
                          />
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-bold text-gray-800 dark:text-gray-100">
                          ${(m.cantidad * m.precio_unitario).toFixed(2)}
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
                  <Wrench size={14} /> 2. Mano de Obra (Tablas Sectoriales MDT con Beneficios de Ley)
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
                        <td className="px-3 py-2 text-center text-gray-500">
                          <input
                            type="text"
                            value={mo.unidad}
                            onChange={e => handleUpdateInsumo('mano_de_obra', idx, 'unidad', e.target.value)}
                            className="w-12 text-center bg-gray-50 dark:bg-slate-800 rounded px-1 py-0.5 outline-none"
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

            {/* 3. Equipos y Herramientas */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-2">
                  <Truck size={14} /> 3. Equipos y Herramienta Menor
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
                        <td className="px-3 py-2 text-center text-gray-500">
                          <input
                            type="text"
                            value={eq.unidad}
                            onChange={e => handleUpdateInsumo('equipos', idx, 'unidad', e.target.value)}
                            className="w-12 text-center bg-gray-50 dark:bg-slate-800 rounded px-1 py-0.5 outline-none"
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
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Acciones de Aprobación */}
          <div className="p-4 bg-gray-50 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 flex justify-between items-center">
            {guardadoExitoso ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 size={16} /> ¡Rubro validado y guardado en tu catálogo privado de SARA-APU!
              </span>
            ) : (
              <span className="text-xs text-gray-400">
                Modifica cualquier insumo arriba. El costo directo se recalcula automáticamente.
              </span>
            )}

            <button
              onClick={handleAprobarEInsertar}
              disabled={guardando}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              {guardando ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Guardando en Tu Catálogo...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>Aprobar e Insertar en Mis Rubros SARA-APU</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Modal de Generación Masiva por Categorías (Privado para el cliente) */}
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
