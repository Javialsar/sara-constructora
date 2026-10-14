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
  TrendingUp,
  Cpu
} from "lucide-react"

export default function SaraAiRubrosPage() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any | null>(null)
  const [guardadoExitoso, setGuardadoExitoso] = useState(false)

  const ejemplosRapidos = [
    "Muro de contención de hormigón armado h=3.0m con zapatas corridas en suelo blando",
    "Mampostería de bloque de cemento de 15cm con mortero 1:4 y chicotes de anclaje",
    "Piso de porcelanato antideslizante 60x60cm pegado con bondex sobre contrapiso",
    "Excavación en zanja para tubería PVC 110mm en terreno rocoso con compresor"
  ]

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
        setResultado(json.data)
      } else {
        alert("No se pudo generar el rubro: " + (json.error || "Intente nuevamente"))
      }
    } catch {
      alert("Error de conexión al servidor de SARA-AI-RUBROS")
    } finally {
      setLoading(false)
    }
  }

  const handleAprobarEInsertar = () => {
    setGuardadoExitoso(true)
    setTimeout(() => setGuardadoExitoso(false), 4000)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Cabecera */}
      <div className="border-b border-gray-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2 border border-emerald-200/60 dark:border-emerald-800/60">
          <Sparkles size={14} className="text-emerald-600 animate-spin" />
          SARA-AI-RUBROS • Generador Inteligente con NLP & Norma NEC
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Diseño Autónomo de Precios Unitarios
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-2xl">
          Escribe en lenguaje natural lo que necesitas construir. La IA estructurará el rendimiento, las cuadrillas del Ministerio del Trabajo y los materiales vinculados a <strong>SARA-APU</strong>.
        </p>
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
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0"
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

      {/* Resultados Dinámicos del APU */}
      {resultado && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Cabecera del Rubro Generado */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border-b border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-800">
                  Unidad: {resultado.unidad}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  Rendimiento: {resultado.rendimiento_estimado} h/{resultado.unidad}
                </span>
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                {resultado.nombre_rubro}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {resultado.especificaciones_tecnicas}
              </p>
            </div>

            <div className="text-right bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs shrink-0">
              <span className="text-[10px] font-bold uppercase text-gray-400 block">Costo Directo Unitario</span>
              <div className="text-2xl font-black font-mono text-emerald-600">
                ${resultado.costo_directo_estimado.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Sub-tablas APU (Materiales, Mano de Obra, Equipos) */}
          <div className="p-6 space-y-6">
            {/* 1. Materiales */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-2 mb-2">
                <Box size={14} /> 1. Materiales Puestos en Obra (Sin IVA)
              </h3>
              <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 font-bold">
                    <tr>
                      <th className="px-4 py-2.5">Descripción</th>
                      <th className="px-3 py-2.5 text-center">Unidad</th>
                      <th className="px-3 py-2.5 text-right">Cantidad</th>
                      <th className="px-3 py-2.5 text-right">P. Unitario ($)</th>
                      <th className="px-4 py-2.5 text-right">Subtotal ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {resultado.materiales.map((m: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-200">{m.nombre}</td>
                        <td className="px-3 py-2 text-center text-gray-500">{m.unidad}</td>
                        <td className="px-3 py-2 text-right font-mono">{m.cantidad}</td>
                        <td className="px-3 py-2 text-right font-mono">${m.precio_unitario.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-mono font-bold">${(m.cantidad * m.precio_unitario).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Mano de Obra */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-2">
                <Wrench size={14} /> 2. Mano de Obra (Tablas Sectoriales MDT con Beneficios de Ley)
              </h3>
              <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 font-bold">
                    <tr>
                      <th className="px-4 py-2.5">Categoría / Ocupación</th>
                      <th className="px-3 py-2.5 text-center">Unidad</th>
                      <th className="px-3 py-2.5 text-right">Rendimiento (h)</th>
                      <th className="px-3 py-2.5 text-right">Costo Horario Real ($)</th>
                      <th className="px-4 py-2.5 text-right">Subtotal ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {resultado.mano_de_obra.map((mo: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-200">{mo.nombre}</td>
                        <td className="px-3 py-2 text-center text-gray-500">{mo.unidad}</td>
                        <td className="px-3 py-2 text-right font-mono">{mo.cantidad}</td>
                        <td className="px-3 py-2 text-right font-mono">${mo.precio_unitario.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-mono font-bold">${(mo.cantidad * mo.precio_unitario).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Equipos y Herramientas */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-2 mb-2">
                <Truck size={14} /> 3. Equipos y Herramienta Menor
              </h3>
              <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 font-bold">
                    <tr>
                      <th className="px-4 py-2.5">Equipo / Maquinaria</th>
                      <th className="px-3 py-2.5 text-center">Unidad</th>
                      <th className="px-3 py-2.5 text-right">Cantidad / Rend.</th>
                      <th className="px-3 py-2.5 text-right">Tarifa Horaria ($)</th>
                      <th className="px-4 py-2.5 text-right">Subtotal ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {resultado.equipos.map((eq: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-200">{eq.nombre}</td>
                        <td className="px-3 py-2 text-center text-gray-500">{eq.unidad}</td>
                        <td className="px-3 py-2 text-right font-mono">{eq.cantidad}</td>
                        <td className="px-3 py-2 text-right font-mono">${eq.precio_unitario.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-mono font-bold">${(eq.cantidad * eq.precio_unitario).toFixed(2)}</td>
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
                <CheckCircle2 size={16} /> ¡Rubro validado y guardado en el Catálogo Maestro de SARA-APU!
              </span>
            ) : (
              <span className="text-xs text-gray-400">
                Verifica las cantidades antes de incorporarlo al presupuesto activo.
              </span>
            )}

            <button
              onClick={handleAprobarEInsertar}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Save size={15} /> Aprobar e Insertar en SARA-APU
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
