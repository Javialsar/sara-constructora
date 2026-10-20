"use client"
import React, { useState } from "react"
import { ShieldCheck, AlertTriangle, CheckCircle2, FileText, Download, TrendingUp, Info } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { membreteBase64 } from "@/lib/membreteBase64"

interface InsumoItem {
  id: string
  nombre: string
  tipo: string
  unidad: string
  es_nacional?: boolean
  costo_total: number
}

interface SercopVaeAnalyzerProps {
  presupuesto: any
  presupuestoRubros: any[]
  rubrosRecipes: Record<string, any[]>
  costoDirectoTotal: number
  granTotal: number
}

export default function SercopVaeAnalyzer({
  presupuesto,
  presupuestoRubros,
  rubrosRecipes,
  costoDirectoTotal,
  granTotal
}: SercopVaeAnalyzerProps) {
  // Umbral de pliego por defecto SERCOP (ej: 40% según pliego promedio de obra civil)
  const [umbralMinimo, setUmbralMinimo] = useState<number>(40.0)
  const [cpcProceso, setCpcProceso] = useState<string>("54121.00.1")
  const [entidadContratante, setEntidadContratante] = useState<string>("GAD Municipal / Prefectura")

  // Estado para overrides locales de nacionalidad de insumos { insumoId: boolean }
  const [insumoNacionalOverrides, setInsumoNacionalOverrides] = useState<Record<string, boolean>>({})

  // Consolidar todos los insumos únicos directos del presupuesto
  const consolidado: Record<string, InsumoItem> = {}
  presupuestoRubros.forEach(pr => {
    const q = Number(pr.cantidad_obra || 0)
    const items = rubrosRecipes[pr.id] || []
    items.forEach(item => {
      const iObj = Array.isArray(item.insumo) ? item.insumo[0] : item.insumo
      if (!iObj) return
      const cantRequerida = q * Number(item.cantidad)
      const costoTotal = cantRequerida * Number(item.precio_sin_iva_snapshot || 0)
      const insId = iObj.id
      if (!consolidado[insId]) {
        // Por defecto: Mano de obra es 100% nacional. Equipos y materiales se asumen nacionales salvo importados comunes
        const isLikelyImported = iObj.tipo === 'equipo' && /cat|komatsu|importad|dron|estaci[oó]n total|software/i.test(iObj.nombre || '')
        const defaultNacional = iObj.tipo === 'mano_de_obra' ? true : !isLikelyImported
        consolidado[insId] = {
          id: insId,
          nombre: iObj.nombre || "Insumo",
          tipo: iObj.tipo || "material",
          unidad: iObj.unidad || "u",
          es_nacional: defaultNacional,
          costo_total: 0
        }
      }
      consolidado[insId].costo_total += costoTotal
    })
  })

  const insumosArray = Object.values(consolidado).map(ins => {
    const override = insumoNacionalOverrides[ins.id]
    const isLikelyImported = ins.tipo === 'equipo' && /cat|komatsu|importad|dron|estaci[oó]n total|software/i.test(ins.nombre || '')
    const defaultNacional = ins.tipo === 'mano_de_obra' ? true : !isLikelyImported
    const esNacional: boolean = override !== undefined ? override : (ins.es_nacional ?? defaultNacional)
    return {
      ...ins,
      es_nacional: esNacional
    }
  })

  // Cálculos de VAE
  const costoTotalInsumos = insumosArray.reduce((acc, i) => acc + i.costo_total, 0) || costoDirectoTotal || 1
  const costoComponenteNacional = insumosArray
    .filter(i => i.es_nacional)
    .reduce((acc, i) => acc + i.costo_total, 0)

  const vaePorcentualCalculado = Math.min(100, Math.max(0, (costoComponenteNacional / costoTotalInsumos) * 100))
  const cumpleSercop = vaePorcentualCalculado >= umbralMinimo

  const toggleNacionalidad = (id: string, currentVal: boolean) => {
    setInsumoNacionalOverrides(prev => ({
      ...prev,
      [id]: !currentVal
    }))
  }

  // Exportar Formulario Oficial SERCOP de Desagregación Tecnológica
  const exportarFormularioSercopPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Membrete
    if (membreteBase64) {
      try {
        doc.addImage(membreteBase64, 'JPEG', 0, 0, pageWidth, 28)
      } catch (e) {
        console.error("Error al cargar membrete", e)
      }
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text("FORMULARIO DE DESAGREGACIÓN TECNOLÓGICA", pageWidth / 2, 38, { align: "center" })
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    doc.text("DECLARACIÓN DE VALOR AGREGADO ECUATORIANO (VAE) - SERCOP", pageWidth / 2, 44, { align: "center" })

    // Metadatos
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(30, 30, 30)
    doc.text(`PROYECTO: ${presupuesto?.nombre_proyecto || "PROYECTO DE OBRA CIVIL"}`, 14, 52)
    doc.text(`ENTIDAD CONTRATANTE: ${entidadContratante}`, 14, 57)
    doc.text(`CÓDIGO CPC: ${cpcProceso}`, 14, 62)
    doc.text(`FECHA DE EMISIÓN: ${new Date().toLocaleDateString()}`, pageWidth - 70, 52)
    doc.text(`UMBRAL MÍNIMO EXIGIDO: ${umbralMinimo.toFixed(2)}%`, pageWidth - 70, 57)
    doc.text(`VAE DECLARADO: ${vaePorcentualCalculado.toFixed(2)}%`, pageWidth - 70, 62)

    // Tabla de insumos y participación VAE
    const tableRows = insumosArray.map((i, idx) => [
      (idx + 1).toString(),
      i.nombre,
      i.tipo.toUpperCase(),
      i.unidad,
      `$${i.costo_total.toFixed(2)}`,
      i.es_nacional ? "NACIONAL" : "IMPORTADO",
      i.es_nacional ? `$${i.costo_total.toFixed(2)}` : "$0.00",
      `${((i.costo_total / costoTotalInsumos) * 100).toFixed(2)}%`
    ])

    autoTable(doc, {
      startY: 68,
      head: [["#", "Insumo / Descripción", "Tipo", "Unid", "Costo Total", "Origen", "Aporte VAE", "% Incid."]],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [40, 75, 99], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
      styles: { fontSize: 7, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        4: { halign: 'right' },
        5: { halign: 'center' },
        6: { halign: 'right' },
        7: { halign: 'right' }
      }
    })

    const finalY = (doc as any).lastAutoTable.finalY + 8

    // Resumen de cumplimiento
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text(`Costo Total Componente Nacional (VAE): $${costoComponenteNacional.toFixed(2)}`, 14, finalY)
    doc.text(`Costo Directo Total de la Oferta: $${costoTotalInsumos.toFixed(2)}`, 14, finalY + 5)
    doc.text(`PORCENTAJE DE VAE FINAL: ${vaePorcentualCalculado.toFixed(2)}%`, 14, finalY + 10)

    doc.setTextColor(cumpleSercop ? 0 : 200, cumpleSercop ? 120 : 0, 0)
    doc.text(
      cumpleSercop
        ? `DICTAMEN: CUMPLE UMBRAL MÍNIMO (${vaePorcentualCalculado.toFixed(2)}% >= ${umbralMinimo.toFixed(2)}%)`
        : `DICTAMEN: NO CUMPLE UMBRAL MÍNIMO (RIESGO DE DESCALIFICACIÓN INSUBSANABLE)`,
      14,
      finalY + 16
    )

    // Firmas de responsabilidad
    doc.setTextColor(50, 50, 50)
    doc.setFont("helvetica", "normal")
    const signY = finalY + 38
    doc.line(14, signY, 80, signY)
    doc.text("Representante Legal / Contratista", 14, signY + 5)
    doc.text("RUC: Oferente Habilitado", 14, signY + 10)

    doc.line(pageWidth - 85, signY, pageWidth - 15, signY)
    doc.text("Responsable Técnico de Presupuestos", pageWidth - 85, signY + 5)
    doc.text("Colegio de Ingenieros Civiles / Arq.", pageWidth - 85, signY + 10)

    doc.save(`SERCOP_Desagregacion_Tecnologica_${presupuesto?.nombre_proyecto || 'SARA'}.pdf`)
  }

  return (
    <div className="space-y-6 w-full animate-fadeIn">
      {/* Banner Principal de Cumplimiento SERCOP */}
      <div className={`p-6 rounded-2xl border-2 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm transition-all ${
        cumpleSercop
          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
          : 'bg-rose-50/70 border-rose-300 text-rose-950'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${cumpleSercop ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
            {cumpleSercop ? <ShieldCheck size={32} /> : <AlertTriangle size={32} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs uppercase tracking-widest font-black px-2.5 py-0.5 rounded-full ${
                cumpleSercop ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
              }`}>
                {cumpleSercop ? "Oferta Calificada para SERCOP" : "Alerta de Descalificación SERCOP"}
              </span>
              <span className="text-xs text-gray-500 font-mono">CPC: {cpcProceso}</span>
            </div>
            <h2 className="text-2xl font-black mt-1">
              {cumpleSercop
                ? "El Proyecto Supera el Umbral Mínimo de VAE"
                : "VAE Insuficiente: La Oferta Será Rechazada"}
            </h2>
            <p className="text-sm opacity-90 mt-1 max-w-2xl">
              {cumpleSercop
                ? `El Valor Agregado Ecuatoriano actual (${vaePorcentualCalculado.toFixed(2)}%) cumple con el umbral obligatorio de los pliegos (${umbralMinimo.toFixed(2)}%).`
                : `El VAE alcanzado (${vaePorcentualCalculado.toFixed(2)}%) está por debajo del ${umbralMinimo.toFixed(2)}% requerido. Cambia insumos importados por nacionales para habilitar la oferta.`}
            </p>
          </div>
        </div>

        {/* Métrica Circular / Gauge */}
        <div className="flex items-center gap-6 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-sm shrink-0">
          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">VAE Calculado</span>
            <div className={`text-3xl font-black font-mono ${cumpleSercop ? 'text-emerald-700' : 'text-rose-700'}`}>
              {vaePorcentualCalculado.toFixed(1)}%
            </div>
            <span className="text-[11px] text-gray-500 block">Mínimo Pliego: {umbralMinimo.toFixed(1)}%</span>
          </div>
          <button
            onClick={exportarFormularioSercopPDF}
            className="flex items-center gap-2 bg-brand-sage hover:bg-brand-dark text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow transition-all hover:scale-105 active:scale-95"
          >
            <Download size={15} /> Exportar Formulario SERCOP
          </button>
        </div>
      </div>

      {/* Panel de Configuración de Licitación */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-4">
          <Info size={16} className="text-brand-sage" /> Parámetros del Proceso de Contratación Pública
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-bold text-gray-600 block mb-1">Entidad Contratante</label>
            <input
              type="text"
              value={entidadContratante}
              onChange={e => setEntidadContratante(e.target.value)}
              className="w-full border rounded-lg p-2 font-medium focus:ring-1 focus:ring-brand-sage outline-none"
              placeholder="Ej: GAD Municipal de Loja"
            />
          </div>
          <div>
            <label className="font-bold text-gray-600 block mb-1">Código CPC de la Obra</label>
            <input
              type="text"
              value={cpcProceso}
              onChange={e => setCpcProceso(e.target.value)}
              className="w-full border rounded-lg p-2 font-mono font-medium focus:ring-1 focus:ring-brand-sage outline-none"
              placeholder="Ej: 54121.00.1"
            />
          </div>
          <div>
            <label className="font-bold text-gray-600 block mb-1">Umbral VAE Exigido en Pliegos (%)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="100"
              value={umbralMinimo}
              onChange={e => setUmbralMinimo(parseFloat(e.target.value) || 0)}
              className="w-full border rounded-lg p-2 font-bold font-mono text-brand-dark focus:ring-1 focus:ring-brand-sage outline-none"
            />
          </div>
        </div>
      </div>

      {/* Matriz de Insumos y Calificación de Origen */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800 text-sm">Matriz de Desagregación Tecnológica por Insumo</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Alterna el origen de los insumos (Nacional / Importado) para simular el impacto en el VAE de la oferta.
            </p>
          </div>
          <div className="text-xs font-semibold text-gray-600 bg-white border px-3 py-1.5 rounded-lg">
            Total Insumos Analizados: <strong>{insumosArray.length}</strong>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[450px]">
          <table className="w-full text-xs text-left divide-y divide-gray-200">
            <thead className="bg-slate-100 text-slate-700 sticky top-0 font-bold z-10">
              <tr>
                <th className="px-4 py-3">Insumo</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3 text-center">Unidad</th>
                <th className="px-4 py-3 text-right">Costo Total ($)</th>
                <th className="px-4 py-3 text-center">Origen Ecuatoriano</th>
                <th className="px-4 py-3 text-right">Aporte al VAE ($)</th>
                <th className="px-4 py-3 text-right">% Ponderación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {insumosArray.map(ins => {
                const ponderacion = (ins.costo_total / costoTotalInsumos) * 100
                return (
                  <tr key={ins.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{ins.nombre}</td>
                    <td className="px-4 py-2.5 uppercase font-mono text-[10px] text-gray-500">{ins.tipo}</td>
                    <td className="px-4 py-2.5 text-center font-bold text-gray-600">{ins.unidad}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold">${ins.costo_total.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => toggleNacionalidad(ins.id, ins.es_nacional)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all shadow-sm ${
                          ins.es_nacional
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {ins.es_nacional ? "🇪🇨 Nacional (Aporta VAE)" : "🌐 Importado (0% VAE)"}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-brand-sage">
                      {ins.es_nacional ? `$${ins.costo_total.toFixed(2)}` : "$0.00"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-500">
                      {ponderacion.toFixed(2)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t-2 border-gray-300">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right">TOTALES ACUMULADOS:</td>
                <td className="px-4 py-3 text-right font-mono font-black">${costoTotalInsumos.toFixed(2)}</td>
                <td className="px-4 py-3 text-center">VAE Calculado</td>
                <td className="px-4 py-3 text-right font-mono font-black text-emerald-700">${costoComponenteNacional.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono font-black text-brand-dark">{vaePorcentualCalculado.toFixed(2)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
