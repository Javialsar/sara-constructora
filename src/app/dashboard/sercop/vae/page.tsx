"use client"

import React, { useState, useMemo } from "react"
import { useProject } from "@/contexts/ProjectContext"
import { useRouter } from "next/navigation"
import { 
  FileCheck, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  ShieldCheck, 
  Download, 
  TrendingUp, 
  Scale, 
  Layers, 
  Sparkles,
  Info,
  DollarSign
} from "lucide-react"

export default function MatrizVAEPage() {
  const router = useRouter()
  const { activeProject, projects, setActiveProject } = useProject()

  // Umbral normativo exigido por el pliego (por CPC)
  const [umbralRequerido, setUmbralRequerido] = useState<number>(40.0)
  const [cpcSeleccionado, setCpcSeleccionado] = useState<string>("54122.00.1")

  // Componentes de la Matriz VAE (en USD)
  const [manoObraNac, setManoObraNac] = useState<number>(38500)
  const [materialesNac, setMaterialesNac] = useState<number>(54200)
  const [materialesImp, setMaterialesImp] = useState<number>(18300)
  const [equiposNac, setEquiposNac] = useState<number>(15400)
  const [equiposImp, setEquiposImp] = useState<number>(8500)
  const [serviciosNac, setServiciosNac] = useState<number>(7200)
  const [serviciosImp, setServiciosImp] = useState<number>(1200)

  // Cálculos VAE
  const costoNacional = useMemo(() => {
    return manoObraNac + materialesNac + equiposNac + serviciosNac
  }, [manoObraNac, materialesNac, equiposNac, serviciosNac])

  const costoImportado = useMemo(() => {
    return materialesImp + equiposImp + serviciosImp
  }, [materialesImp, equiposImp, serviciosImp])

  const costoDirectoTotal = useMemo(() => {
    return costoNacional + costoImportado
  }, [costoNacional, costoImportado])

  const porcentajeVAE = useMemo(() => {
    if (costoDirectoTotal === 0) return 0
    return Math.round(((costoNacional / costoDirectoTotal) * 100) * 100) / 100
  }, [costoNacional, costoDirectoTotal])

  const cumpleUmbral = porcentajeVAE >= umbralRequerido

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Banner Superior */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-blue-500/20 relative overflow-hidden print:hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
              <FileCheck size={14} className="text-blue-400" />
              <span>Metodología Oficial SERCOP • Art. 25.2 LOSNCP</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Matriz de Valor Agregado Ecuatoriano (VAE) & Desagregación
            </h1>
            <p className="text-sm text-blue-200/80 max-w-2xl leading-relaxed">
              Calcula y audita el porcentaje de incorporación de insumos y mano de obra nacional para garantizar la calificación de tu oferta como nacional y evitar la descalificación en compras públicas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => router.push('/dashboard/sercop/agente')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/10 backdrop-blur-sm transition-all"
            >
              <ShieldCheck size={15} className="text-amber-400" />
              <span>Consultar Normativa VAE</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <Printer size={15} />
              <span>Imprimir Formulario Oficial</span>
            </button>
          </div>
        </div>

        {/* Selector de Obra Activa vinculada */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-amber-400" />
            <span className="font-bold text-gray-300">Obra Seleccionada:</span>
            <span className="font-extrabold text-white">
              {activeProject ? activeProject.nombre : "Presupuesto General (Sin obra activa)"}
            </span>
            {activeProject?.codigo_proceso && (
              <span className="font-mono text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                {activeProject.codigo_proceso}
              </span>
            )}
          </div>

          {projects.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-[11px]">Cambiar obra:</span>
              <select
                value={activeProject?.id || ""}
                onChange={e => {
                  const sel = projects.find(p => p.id === e.target.value)
                  if (sel) setActiveProject(sel)
                }}
                className="bg-white/10 border border-white/20 text-white rounded-xl px-2.5 py-1 text-xs outline-none"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="text-gray-900">{p.nombre}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Dictamen VAE Principal */}
      <div className={`rounded-3xl p-6 border transition-all shadow-md ${
        cumpleUmbral
          ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
          : "bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 ${
              cumpleUmbral
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
            }`}>
              {cumpleUmbral ? <CheckCircle2 size={30} /> : <AlertTriangle size={30} />}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  cumpleUmbral
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border-rose-300"
                }`}>
                  {cumpleUmbral ? "✅ Oferta Considerada Nacional" : "❌ Oferta Considerada Extranjera"}
                </span>
                <span className="text-xs text-gray-400">
                  Umbral mínimo exigido: <strong className="text-gray-900 dark:text-white">{umbralRequerido}%</strong>
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                VAE Obtenido: <span className={cumpleUmbral ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>{porcentajeVAE}%</span>
              </h2>

              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
                {cumpleUmbral
                  ? "Tu presupuesto incorpora suficiente componente nacional para participar válidamente en procedimientos de reserva de mercado (Menor Cuantía, Cotización) y acceder al margen de preferencia."
                  : "Tu porcentaje de VAE está por debajo del umbral del pliego. Riesgo crítico de DESCALIFICACIÓN inmediata en la etapa de calificación técnica."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                Umbral Exigido en Pliego (%):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={umbralRequerido}
                  onChange={e => setUmbralRequerido(parseFloat(e.target.value) || 0)}
                  className="w-20 px-3 py-1.5 text-sm font-black bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 dark:text-white"
                />
                <span className="font-bold text-xs text-gray-500">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desglose de Componentes de Costo (A, B, C, D) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Componente A: Mano de Obra */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Mano de Obra Ecuatoriana</h4>
                <p className="text-[10px] text-gray-400">100% VAE Nacional (Obreros y Técnicos con IESS)</p>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
              ${manoObraNac.toLocaleString()}
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
              Mano de Obra Nacional ($)
            </label>
            <input
              type="number"
              value={manoObraNac}
              onChange={e => setManoObraNac(parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Componente B: Materiales */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold text-xs">
                B
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Materiales e Insumos</h4>
                <p className="text-[10px] text-gray-400">Cemento, áridos, tubería y acabados</p>
              </div>
            </div>
            <span className="text-xs font-black text-gray-900 dark:text-white">
              ${(materialesNac + materialesImp).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                Nacionales ($)
              </label>
              <input
                type="number"
                value={materialesNac}
                onChange={e => setMaterialesNac(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-rose-500 mb-1">
                Importados ($)
              </label>
              <input
                type="number"
                value={materialesImp}
                onChange={e => setMaterialesImp(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Componente C: Maquinaria y Equipos */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold text-xs">
                C
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Maquinaria & Equipos</h4>
                <p className="text-[10px] text-gray-400">Arrendamiento o depreciación de flota</p>
              </div>
            </div>
            <span className="text-xs font-black text-gray-900 dark:text-white">
              ${(equiposNac + equiposImp).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                Nacionales ($)
              </label>
              <input
                type="number"
                value={equiposNac}
                onChange={e => setEquiposNac(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-rose-500 mb-1">
                Importados ($)
              </label>
              <input
                type="number"
                value={equiposImp}
                onChange={e => setEquiposImp(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Componente D: Servicios Técnicos */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center font-bold text-xs">
                D
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Servicios & Ensayos</h4>
                <p className="text-[10px] text-gray-400">Laboratorio de suelos, topografía y software</p>
              </div>
            </div>
            <span className="text-xs font-black text-gray-900 dark:text-white">
              ${(serviciosNac + serviciosImp).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                Nacionales ($)
              </label>
              <input
                type="number"
                value={serviciosNac}
                onChange={e => setServiciosNac(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-rose-500 mb-1">
                Importados ($)
              </label>
              <input
                type="number"
                value={serviciosImp}
                onChange={e => setServiciosImp(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Formulario Estándar SERCOP (Apto para Impresión) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <Scale size={16} className="text-blue-600" />
            <span>Formulario Oficial de Declaración de Valor Agregado Ecuatoriano</span>
          </h3>
          <span className="text-[11px] font-mono text-gray-400">
            CPC: {cpcSeleccionado}
          </span>
        </div>

        <div className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-slate-950 text-gray-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Componente</th>
                <th className="p-3 text-right">Costo Nacional (USD)</th>
                <th className="p-3 text-right">Costo Importado (USD)</th>
                <th className="p-3 text-right">Costo Total (USD)</th>
                <th className="p-3 text-right">% VAE Específico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              <tr>
                <td className="p-3 font-semibold">A. Mano de Obra</td>
                <td className="p-3 text-right font-mono">${manoObraNac.toLocaleString()}</td>
                <td className="p-3 text-right font-mono">$0</td>
                <td className="p-3 text-right font-mono">${manoObraNac.toLocaleString()}</td>
                <td className="p-3 text-right font-bold text-emerald-600">100.0%</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">B. Materiales</td>
                <td className="p-3 text-right font-mono">${materialesNac.toLocaleString()}</td>
                <td className="p-3 text-right font-mono">${materialesImp.toLocaleString()}</td>
                <td className="p-3 text-right font-mono">${(materialesNac + materialesImp).toLocaleString()}</td>
                <td className="p-3 text-right font-bold">
                  {Math.round((materialesNac / (materialesNac + materialesImp || 1)) * 100)}%
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">C. Maquinaria y Equipos</td>
                <td className="p-3 text-right font-mono">${equiposNac.toLocaleString()}</td>
                <td className="p-3 text-right font-mono">${equiposImp.toLocaleString()}</td>
                <td className="p-3 text-right font-mono">${(equiposNac + equiposImp).toLocaleString()}</td>
                <td className="p-3 text-right font-bold">
                  {Math.round((equiposNac / (equiposNac + equiposImp || 1)) * 100)}%
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">D. Servicios Técnicos</td>
                <td className="p-3 text-right font-mono">${serviciosNac.toLocaleString()}</td>
                <td className="p-3 text-right font-mono">${serviciosImp.toLocaleString()}</td>
                <td className="p-3 text-right font-mono">${(serviciosNac + serviciosImp).toLocaleString()}</td>
                <td className="p-3 text-right font-bold">
                  {Math.round((serviciosNac / (serviciosNac + serviciosImp || 1)) * 100)}%
                </td>
              </tr>
              <tr className="bg-gray-50/80 dark:bg-slate-950/80 font-black text-gray-900 dark:text-white">
                <td className="p-3">TOTAL COSTO DIRECTO</td>
                <td className="p-3 text-right font-mono text-emerald-600">${costoNacional.toLocaleString()}</td>
                <td className="p-3 text-right font-mono text-rose-500">${costoImportado.toLocaleString()}</td>
                <td className="p-3 text-right font-mono">${costoDirectoTotal.toLocaleString()}</td>
                <td className={`p-3 text-right text-sm ${cumpleUmbral ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {porcentajeVAE}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
