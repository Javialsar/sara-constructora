"use client"

import React, { useState, useEffect } from "react"
import { useProject } from "@/contexts/ProjectContext"
import { createClient } from "@/lib/supabase/client"
import PdfTakeOffModal from "@/components/admin/presupuestos/PdfTakeOffModal"
import { 
  Square, 
  Ruler, 
  Upload, 
  Sparkles, 
  ArrowLeft, 
  Layers, 
  FileSpreadsheet, 
  Building2, 
  CheckCircle2,
  Loader2
} from "lucide-react"
import Link from "next/link"

export default function TakeOffStandalonePage() {
  const supabase = createClient()
  const { activeProject, projects } = useProject()

  const [currentPresupuesto, setCurrentPresupuesto] = useState<any>(null)
  const [presupuestoRubros, setPresupuestoRubros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(true)

  const nombreProyecto = activeProject?.nombre || "Proyecto General"

  // Cargar presupuesto y rubros asociados a la obra activa
  const fetchPresupuestoData = async () => {
    setLoading(true)
    try {
      // 1. Buscar presupuesto por nombre del proyecto
      let { data: pres } = await supabase
        .from("presupuestos_reales")
        .select("*")
        .ilike("nombre_proyecto", `%${nombreProyecto}%`)
        .maybeSingle()

      if (!pres) {
        // Obtener el más reciente si no coincide exactamente
        const { data: latest } = await supabase
          .from("presupuestos_reales")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
        pres = latest
      }

      if (pres) {
        setCurrentPresupuesto(pres)
        const { data: rubros } = await supabase
          .from("presupuesto_rubros")
          .select("*")
          .eq("presupuesto_id", pres.id)
          .order("created_at", { ascending: true })

        setPresupuestoRubros(rubros || [])
      }
    } catch (err) {
      console.error("Error al cargar presupuesto para Take-Off:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPresupuestoData()
  }, [activeProject])

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-xs font-bold mb-2 border border-cyan-200/60 dark:border-cyan-800/60">
            <Square size={13} className="rotate-45 text-cyan-500" />
            SARA Take-Off • Cómputos Métricos en Planos 2D
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Medición de Planos en PDF & Cómputos Métricos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Obra Activa: <strong className="text-slate-800 dark:text-slate-200">{nombreProyecto}</strong> · 
            Mide polígonos, contrapisos, paredes con deducción de vanos y vuelca cantidades al presupuesto con 0 errores de digitación.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/presupuestos_reales"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-xs flex items-center gap-1.5"
          >
            <FileSpreadsheet size={15} className="text-blue-500" />
            <span>Mesa de Presupuestos</span>
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-md flex items-center gap-1.5 transition cursor-pointer"
          >
            <Ruler size={15} />
            <span>Abrir Espacio de Medición 2D</span>
          </button>
        </div>
      </div>

      {/* Banner Informativo y Acceso Rápido */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 p-6 rounded-3xl border border-slate-800 shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10 grid md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-white/10 text-cyan-300 border border-white/15">
              Presupuesto Conectado: {currentPresupuesto?.nombre_proyecto || nombreProyecto}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Lienzo Digital de Planos Arquitectónicos & Estructurales
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Sube tus planos en PDF o imágenes de planos, calibra una cota de referencia y utiliza la auto-detección inteligente con IA para medir salas, dormitorios, cocinas, paredes con vanos descontados y columnas en segundos.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <Square size={14} className="rotate-45" />
                <span>Lanzar SARA Take-Off (Lienzo Interactivo)</span>
              </button>

              <span className="text-xs text-slate-400">
                {presupuestoRubros.length} rubros disponibles para vincular
              </span>
            </div>
          </div>

          <div className="md:col-span-4 bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-3 text-xs">
            <h4 className="font-extrabold text-cyan-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sparkles size={14} />
              Capacidades Disponibles:
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>Calibración gráfica por cota real (m/px)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>Polígonos de Área Gauss (Shoelace) en m²</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>Paredes con deducción automática de vanos</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>Auto-Detección de Recintos con IA (SARA-Vision)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>Inyección instantánea de cantidades al presupuesto</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal Principal de Medición Take-Off */}
      {isModalOpen && (
        <PdfTakeOffModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          presupuestoId={currentPresupuesto?.id}
          nombreProyecto={currentPresupuesto?.nombre_proyecto || nombreProyecto}
          presupuestoRubros={presupuestoRubros}
          onMeasurementsApplied={async () => {
            await fetchPresupuestoData()
          }}
        />
      )}
    </div>
  )
}
