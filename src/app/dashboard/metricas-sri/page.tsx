"use client"

import React, { useState, useEffect } from "react"
import { 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  ShieldCheck, 
  Building2, 
  PieChart, 
  Lock, 
  ArrowUpRight,
  ArrowDownRight,
  Receipt
} from "lucide-react"
import { useProject } from "@/contexts/ProjectContext"

export default function SaraDashboardSriPage() {
  const { activeProject, isGlobalMode } = useProject()
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetricas()
  }, [])

  const fetchMetricas = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/dashboard-sri")
      const json = await res.json()
      if (json.success && json.data) {
        setData(json.data)
      }
    } catch {
      console.warn("Fallo cargando métricas SRI")
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-gray-400">
        Cargando auditoría financiera y retenciones SRI...
      </div>
    )
  }

  const { kpis_financieros, inteligencia_tributaria_sri } = data

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Cabecera */}
      <div className="border-b border-gray-200 dark:border-slate-800 pb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200/60 dark:border-rose-800/60">
            <Receipt size={14} className="text-rose-600" />
            SARA-DASHBOARD • Control Financiero Real & Auditor SRI
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
            🏗️ {!isGlobalMode && activeProject ? `${activeProject.nombre} (${activeProject.provincia})` : "Portafolio Global Multi-Obra"}
          </span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Inteligencia de Utilidades y Blindaje Fiscal (SRI)
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-2xl">
          Contraste matemático del presupuesto de <strong>{!isGlobalMode && activeProject ? activeProject.nombre : "todas las obras"}</strong> contra adquisiciones en <strong>SARA-MARKETPLACE</strong> y avances de <strong>SARA-FISCALIZA</strong>. Bloqueo preventivo de fondos de retención para evitar multas.
        </p>
      </div>

      {/* Banner de Estado Tributario */}
      <div className={`p-6 rounded-2xl border-2 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs ${
        inteligencia_tributaria_sri.alerta_descalce_tributario
          ? 'bg-rose-50 border-rose-300 text-rose-950 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
          : 'bg-emerald-50 border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${
            inteligencia_tributaria_sri.alerta_descalce_tributario ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
          }`}>
            {inteligencia_tributaria_sri.alerta_descalce_tributario ? <AlertTriangle size={28} /> : <ShieldCheck size={28} />}
          </div>
          <div>
            <h2 className="text-xl font-black">
              {inteligencia_tributaria_sri.alerta_descalce_tributario
                ? "Alerta SRI: Riesgo de Descalce Tributario Detectado"
                : "Posición Tributaria Saludable y Blindada"}
            </h2>
            <p className="text-xs opacity-90 mt-1 max-w-2xl">
              {inteligencia_tributaria_sri.recomendacion_contable}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-xs shrink-0 text-right">
          <span className="text-[10px] font-bold uppercase text-gray-400 block">Fondo Preventivo SRI Inmovilizado</span>
          <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
            ${inteligencia_tributaria_sri.total_inmovilizado_preventivo_sri.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-gray-400 block">Retenciones IVA 30% + Renta 1.75%</span>
        </div>
      </div>

      {/* Grid de KPIs Financieros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-gray-400 block">Presupuesto Teórico APU</span>
          <div className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
            ${kpis_financieros.presupuesto_teorico_apu.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-gray-500 mt-1 block">Meta base calculada</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-gray-400 block">Gasto Real Ejecutado</span>
          <div className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
            ${kpis_financieros.costo_real_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-emerald-600 font-bold mt-1 block flex items-center gap-1">
            <ArrowDownRight size={14} /> {kpis_financieros.variacion_frente_a_teorico}% frente a presupuesto
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-gray-400 block">Facturación Acumulada</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
            ${kpis_financieros.monto_facturado_cliente.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-gray-500 mt-1 block">Planillas aprobadas</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-gray-400 block">Utilidad Neta Real</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            ${kpis_financieros.utilidad_neta_real.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full inline-block mt-1">
            Margen: {kpis_financieros.margen_utilidad_pct}%
          </span>
        </div>
      </div>

      {/* Desglose Comparativo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 uppercase tracking-wide">
            Distribución Real de Costos de Obra
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>Materiales (SARA-MARKETPLACE / Facturas)</span>
                <span className="font-mono">${kpis_financieros.desglose_real.materiales_marketplace.toFixed(2)}</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-[52%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>Mano de Obra (SARA-FISCALIZA / Planillas IESS)</span>
                <span className="font-mono">${kpis_financieros.desglose_real.mano_obra_fiscaliza.toFixed(2)}</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-600 w-[31%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>Maquinaria & Equipos (SARA-MAQUINARIA / Escrow)</span>
                <span className="font-mono">${kpis_financieros.desglose_real.maquinaria_alquiler.toFixed(2)}</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 w-[9%]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 uppercase tracking-wide flex items-center gap-2">
            <Lock size={15} className="text-rose-600" /> Custodia Tributaria Bloqueada (SRI 2026)
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl flex justify-between items-center border">
              <div>
                <span className="font-bold block">Retención de IVA (30% sobre tarifa 15%)</span>
                <span className="text-gray-400 text-[11px]">Obligación mensual formulario 104</span>
              </div>
              <span className="font-bold font-mono text-sm">${inteligencia_tributaria_sri.retencion_iva_estimada.toFixed(2)}</span>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl flex justify-between items-center border">
              <div>
                <span className="font-bold block">Retención en la Fuente IR (1.75%)</span>
                <span className="text-gray-400 text-[11px]">Sector de la construcción civil</span>
              </div>
              <span className="font-bold font-mono text-sm">${inteligencia_tributaria_sri.retencion_renta_estimada.toFixed(2)}</span>
            </div>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 font-bold flex justify-between items-center">
              <span>Capital Inmovilizado en Caja Preventiva</span>
              <span className="font-mono text-base">${inteligencia_tributaria_sri.total_inmovilizado_preventivo_sri.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
