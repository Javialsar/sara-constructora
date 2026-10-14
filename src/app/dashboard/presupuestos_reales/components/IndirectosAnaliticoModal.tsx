"use client"
import React, { useState } from "react"
import { Calculator, Plus, Trash2, Save, FileText, Download, ShieldCheck, DollarSign } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { membreteBase64 } from "@/lib/membreteBase64"

interface IndirectoItem {
  id: string
  categoria: 'personal_tecnico' | 'instalaciones' | 'polizas_seguros' | 'laboratorio' | 'imprevistos_utilidad'
  descripcion: string
  unidad: string
  cantidad: number
  costo_unitario: number
}

interface IndirectosAnaliticoModalProps {
  isOpen: boolean
  onClose: () => void
  costoDirectoTotal: number
  onApplyPercentages: (adminPct: number, impPct: number, utilPct: number) => void
  projectName: string
}

export default function IndirectosAnaliticoModal({
  isOpen,
  onClose,
  costoDirectoTotal,
  onApplyPercentages,
  projectName
}: IndirectosAnaliticoModalProps) {
  if (!isOpen) return null

  // Partidas analíticas de costos indirectos estándar SERCOP
  const [items, setItems] = useState<IndirectoItem[]>([
    { id: '1', categoria: 'personal_tecnico', descripcion: 'Ingeniero Residente de Obra (Sueldo + Cargas IESS)', unidad: 'mes', cantidad: 3, costo_unitario: 1400 },
    { id: '2', categoria: 'personal_tecnico', descripcion: 'Bodeguero y Guardianía 24/7 de Obra', unidad: 'mes', cantidad: 3, costo_unitario: 650 },
    { id: '3', categoria: 'instalaciones', descripcion: 'Campamento provisional, bodega y letrina móvil', unidad: 'glb', cantidad: 1, costo_unitario: 800 },
    { id: '4', categoria: 'instalaciones', descripcion: 'Servicios básicos provisionales (Luz + Agua)', unidad: 'mes', cantidad: 3, costo_unitario: 120 },
    { id: '5', categoria: 'polizas_seguros', descripcion: 'Póliza de Buen Uso de Anticipo y Fiel Cumplimiento', unidad: 'glb', cantidad: 1, costo_unitario: 450 },
    { id: '6', categoria: 'laboratorio', descripcion: 'Ensayos de compresión probetas hormigón (f\'c)', unidad: 'ensayo', cantidad: 12, costo_unitario: 25 },
    { id: '7', categoria: 'imprevistos_utilidad', descripcion: 'Imprevistos de obra y contingencias de sitio', unidad: 'glb', cantidad: 1, costo_unitario: costoDirectoTotal * 0.03 },
    { id: '8', categoria: 'imprevistos_utilidad', descripcion: 'Honorarios / Utilidad Empresarial del Contratista', unidad: 'glb', cantidad: 1, costo_unitario: costoDirectoTotal * 0.08 }
  ])

  const [newItemDesc, setNewItemDesc] = useState("")
  const [newItemCat, setNewItemCat] = useState<IndirectoItem['categoria']>('personal_tecnico')
  const [newItemUnidad, setNewItemUnidad] = useState("mes")
  const [newItemCant, setNewItemCant] = useState(1)
  const [newItemCosto, setNewItemCosto] = useState(100)

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemDesc.trim()) return
    const newItem: IndirectoItem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ind-${Date.now()}`,
      categoria: newItemCat,
      descripcion: newItemDesc.trim(),
      unidad: newItemUnidad,
      cantidad: Number(newItemCant) || 1,
      costo_unitario: Number(newItemCosto) || 0
    }
    setItems([...items, newItem])
    setNewItemDesc("")
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id))
  }

  // Cálculos consolidados
  const totalIndirectosValor = items.reduce((acc, curr) => acc + (curr.cantidad * curr.costo_unitario), 0)
  const baseDirecta = costoDirectoTotal || 1
  const porcentajeTotalIndirectos = (totalIndirectosValor / baseDirecta) * 100

  // Desglose AIU
  const gastosAdmin = items.filter(i => i.categoria !== 'imprevistos_utilidad')
    .reduce((acc, curr) => acc + (curr.cantidad * curr.costo_unitario), 0)
  const adminPct = (gastosAdmin / baseDirecta) * 100

  const imprevistosUtilidadItems = items.filter(i => i.categoria === 'imprevistos_utilidad')
  const imprevistosVal = imprevistosUtilidadItems.length > 0 ? imprevistosUtilidadItems[0].cantidad * imprevistosUtilidadItems[0].costo_unitario : 0
  const utilidadVal = imprevistosUtilidadItems.length > 1 ? imprevistosUtilidadItems[1].cantidad * imprevistosUtilidadItems[1].costo_unitario : 0
  
  const impPct = (imprevistosVal / baseDirecta) * 100
  const utilPct = (utilidadVal / baseDirecta) * 100

  const handleApplyToBudget = () => {
    onApplyPercentages(
      parseFloat(adminPct.toFixed(2)),
      parseFloat(impPct.toFixed(2)),
      parseFloat(utilPct.toFixed(2))
    )
    alert(`Se actualizaron los porcentajes del presupuesto:\n- Administración: ${adminPct.toFixed(2)}%\n- Imprevistos: ${impPct.toFixed(2)}%\n- Utilidad: ${utilPct.toFixed(2)}%`)
    onClose()
  }

  // Exportar Anexo Analítico PDF para SERCOP
  const exportarAnexoPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    if (membreteBase64) {
      try {
        doc.addImage(membreteBase64, 'JPEG', 0, 0, pageWidth, 28)
      } catch (e) {
        console.error(e)
      }
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.text("ANEXO ANALÍTICO DE COSTOS INDIRECTOS (AIU)", pageWidth / 2, 38, { align: "center" })
    doc.setFontSize(9)
    doc.setTextColor(80, 80, 80)
    doc.text(`PROYECTO: ${projectName.toUpperCase()}`, pageWidth / 2, 44, { align: "center" })

    const rows = items.map((item, idx) => [
      (idx + 1).toString(),
      item.categoria.replace('_', ' ').toUpperCase(),
      item.descripcion,
      item.unidad,
      item.cantidad.toString(),
      `$${item.costo_unitario.toFixed(2)}`,
      `$${(item.cantidad * item.costo_unitario).toFixed(2)}`,
      `${(((item.cantidad * item.costo_unitario) / baseDirecta) * 100).toFixed(2)}%`
    ])

    autoTable(doc, {
      startY: 52,
      head: [["#", "Categoría", "Descripción", "Unid", "Cant", "P. Unit", "Subtotal", "% CD"]],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [40, 75, 99], textColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 7, cellPadding: 2 }
    })

    const finalY = (doc as any).lastAutoTable.finalY + 8
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(20, 20, 20)
    doc.text(`Costo Directo Base: $${baseDirecta.toFixed(2)}`, 14, finalY)
    doc.text(`Monto Total Costos Indirectos: $${totalIndirectosValor.toFixed(2)}`, 14, finalY + 5)
    doc.text(`FACTOR TOTAL DE INDIRECTOS: ${porcentajeTotalIndirectos.toFixed(2)}%`, 14, finalY + 10)

    doc.save(`Anexo_Indirectos_${projectName}.pdf`)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-lg font-black text-brand-dark flex items-center gap-2">
              <Calculator className="text-brand-sage" /> Justificación Analítica de Costos Indirectos (AIU)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Desglose respaldado requerido por el SERCOP y auditorías de obra para justificar el % de indirectos.
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg">
            ✕
          </button>
        </div>

        {/* Resumen Superior de Indicadores */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-brand-sage/5 border-b">
          <div className="bg-white p-3 rounded-xl border">
            <span className="text-[10px] font-bold uppercase text-gray-400">Costo Directo Base</span>
            <div className="text-base font-black text-brand-dark">${baseDirecta.toFixed(2)}</div>
          </div>
          <div className="bg-white p-3 rounded-xl border">
            <span className="text-[10px] font-bold uppercase text-gray-400">Gastos Administración</span>
            <div className="text-base font-black text-blue-700">{adminPct.toFixed(2)}% (${gastosAdmin.toFixed(2)})</div>
          </div>
          <div className="bg-white p-3 rounded-xl border">
            <span className="text-[10px] font-bold uppercase text-gray-400">Imprevistos + Utilidad</span>
            <div className="text-base font-black text-amber-700">{(impPct + utilPct).toFixed(2)}%</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-brand-sage bg-emerald-50/50">
            <span className="text-[10px] font-bold uppercase text-brand-sage">Factor Indirectos Total</span>
            <div className="text-xl font-black text-brand-sage font-mono">{porcentajeTotalIndirectos.toFixed(2)}%</div>
          </div>
        </div>

        {/* Tabla Desglose */}
        <div className="overflow-y-auto p-4 flex-1">
          <table className="w-full text-xs text-left divide-y divide-gray-200">
            <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
              <tr>
                <th className="px-3 py-2">Categoría</th>
                <th className="px-3 py-2">Descripción</th>
                <th className="px-3 py-2 text-center">Unidad</th>
                <th className="px-3 py-2 text-right">Cant.</th>
                <th className="px-3 py-2 text-right">C. Unit</th>
                <th className="px-3 py-2 text-right">Subtotal</th>
                <th className="px-3 py-2 text-right">% CD</th>
                <th className="px-3 py-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => {
                const sub = item.cantidad * item.costo_unitario
                const pct = (sub / baseDirecta) * 100
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-[10px] text-gray-500 uppercase">{item.categoria.replace('_', ' ')}</td>
                    <td className="px-3 py-2 font-medium text-gray-800">{item.descripcion}</td>
                    <td className="px-3 py-2 text-center text-gray-600 font-bold">{item.unidad}</td>
                    <td className="px-3 py-2 text-right">{item.cantidad}</td>
                    <td className="px-3 py-2 text-right font-mono">${item.costo_unitario.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-brand-dark">${sub.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right font-mono text-emerald-700">{pct.toFixed(2)}%</td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => handleRemoveItem(item.id)} className="text-gray-300 hover:text-red-500 p-1">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Formulario Agregar Partida */}
          <form onSubmit={handleAddItem} className="mt-4 p-3 bg-gray-50 rounded-xl border flex flex-wrap md:flex-nowrap gap-2 items-center text-xs">
            <select
              value={newItemCat}
              onChange={e => setNewItemCat(e.target.value as any)}
              className="border rounded-lg p-2 bg-white outline-none"
            >
              <option value="personal_tecnico">Personal Técnico</option>
              <option value="instalaciones">Instalaciones</option>
              <option value="polizas_seguros">Pólizas y Garantías</option>
              <option value="laboratorio">Ensayos y Control</option>
              <option value="imprevistos_utilidad">Imprevistos / Utilidad</option>
            </select>
            <input
              type="text"
              placeholder="Descripción del gasto indirecto..."
              value={newItemDesc}
              onChange={e => setNewItemDesc(e.target.value)}
              className="flex-1 border rounded-lg p-2 bg-white outline-none"
              required
            />
            <input
              type="text"
              placeholder="Unid"
              value={newItemUnidad}
              onChange={e => setNewItemUnidad(e.target.value)}
              className="w-16 border rounded-lg p-2 bg-white text-center outline-none"
            />
            <input
              type="number"
              placeholder="Cant"
              value={newItemCant}
              onChange={e => setNewItemCant(parseFloat(e.target.value) || 0)}
              className="w-20 border rounded-lg p-2 bg-white text-right outline-none"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Costo"
              value={newItemCosto}
              onChange={e => setNewItemCosto(parseFloat(e.target.value) || 0)}
              className="w-24 border rounded-lg p-2 bg-white text-right outline-none font-bold"
            />
            <button
              type="submit"
              className="bg-brand-sage hover:bg-brand-dark text-white px-3 py-2 rounded-lg font-bold flex items-center gap-1 shrink-0"
            >
              <Plus size={14} /> Agregar
            </button>
          </form>
        </div>

        {/* Footer con Acciones */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <button
            onClick={exportarAnexoPDF}
            className="flex items-center gap-2 text-xs font-bold text-gray-700 bg-white border px-4 py-2 rounded-lg hover:bg-gray-100 transition shadow-sm"
          >
            <Download size={14} /> Exportar Anexo Analítico PDF
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="text-xs font-semibold px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleApplyToBudget}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow transition"
            >
              <Save size={14} /> Aplicar Porcentajes al Presupuesto
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
