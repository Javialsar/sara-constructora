"use client"

import React, { useState } from "react"
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  Building2, 
  Scale, 
  DollarSign, 
  UserCheck, 
  RefreshCw,
  Printer
} from "lucide-react"

export default function SaraDocsPage() {
  const [tipoDoc, setTipoDoc] = useState("contrato_obra_civil")
  const [clienteNombre, setClienteNombre] = useState("Ing. Roberto Cordero")
  const [clienteCedula, setClienteCedula] = useState("0104589231")
  const [montoTotal, setMontoTotal] = useState(128500.00)
  const [plazoDias, setPlazoDias] = useState(120)
  const [ubicacion, setUbicacion] = useState("Sector Challuabamba, Cuenca, Azuay")
  const [linderos, setLinderos] = useState("Norte: 10m lote 4; Sur: 10m vía pública; Este: 21m; Oeste: 21m. Área total: 210 m2.")
  
  const [loading, setLoading] = useState(false)
  const [documentoGenerado, setDocumentoGenerado] = useState<string | null>(null)

  const handleGenerarDocumento = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setDocumentoGenerado(null)

    try {
      const res = await fetch("/api/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_documento: tipoDoc,
          cliente_nombre: clienteNombre,
          cliente_cedula_ruc: clienteCedula,
          monto_total: Number(montoTotal),
          plazo_dias: Number(plazoDias),
          ubicacion_inmueble: ubicacion,
          linderos_medidas: linderos
        })
      })

      const json = await res.json()
      if (json.success && json.markdown) {
        setDocumentoGenerado(json.markdown)
      } else {
        alert("Error: " + (json.error || "No se pudo generar el documento"))
      }
    } catch {
      alert("Error al conectar con el servidor de SARA-DOCS")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Cabecera */}
      <div className="border-b border-gray-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2 border border-blue-200/60 dark:border-blue-800/60">
          <Scale size={14} className="text-blue-600" />
          Módulo SARA-DOCS • Automatización Legal y Contractual
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Generador de Contratos y Pliegos Técnicos
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-2xl">
          Generación automática de contratos de obra civil con pagos en custodia Escrow, promesas de compraventa inmobiliaria y pliegos técnicos SERCOP.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulario de Variables */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-gray-800 dark:text-gray-200 uppercase tracking-wide">
            Parámetros del Documento
          </h2>

          <form onSubmit={handleGenerarDocumento} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-gray-600 dark:text-gray-400 block mb-1">Tipo de Documento</label>
              <select
                value={tipoDoc}
                onChange={e => setTipoDoc(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 font-bold focus:outline-none"
              >
                <option value="contrato_obra_civil">Contrato de Obra Civil a Precios Unitarios</option>
                <option value="promesa_compraventa_inmueble">Promesa de Compraventa de Inmueble (Suite/Lote)</option>
                <option value="pliego_especificaciones_sercop">Especificaciones Técnicas SERCOP</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-gray-600 dark:text-gray-400 block mb-1">Nombre Completo del Cliente / Entidad</label>
              <input
                type="text"
                value={clienteNombre}
                onChange={e => setClienteNombre(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-gray-600 dark:text-gray-400 block mb-1">Cédula / RUC</label>
                <input
                  type="text"
                  value={clienteCedula}
                  onChange={e => setClienteCedula(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-gray-600 dark:text-gray-400 block mb-1">Plazo (Días)</label>
                <input
                  type="number"
                  value={plazoDias}
                  onChange={e => setPlazoDias(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-600 dark:text-gray-400 block mb-1">Monto de Obra SARA-APU (USD $)</label>
              <input
                type="number"
                step="0.01"
                value={montoTotal}
                onChange={e => setMontoTotal(parseFloat(e.target.value) || 0)}
                required
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 font-black font-mono text-emerald-600"
              />
            </div>

            <div>
              <label className="font-bold text-gray-600 dark:text-gray-400 block mb-1">Ubicación del Inmueble / Obra</label>
              <input
                type="text"
                value={ubicacion}
                onChange={e => setUbicacion(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="font-bold text-gray-600 dark:text-gray-400 block mb-1">Linderos y Cabida (210 m²)</label>
              <textarea
                rows={2}
                value={linderos}
                onChange={e => setLinderos(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <RefreshCw size={15} className="animate-spin" /> : <FileText size={15} />}
              Generar Documento Legal
            </button>
          </form>
        </div>

        {/* Previsualización del Documento Generado */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
          <div className="p-4 bg-gray-50 dark:bg-slate-950/60 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 uppercase">Vista Previa de Documento</span>
            {documentoGenerado && (
              <button
                onClick={() => window.print()}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 border px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Printer size={13} /> Imprimir / Guardar PDF
              </button>
            )}
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {documentoGenerado ? (
              <pre className="text-xs font-sans whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                {documentoGenerado}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center py-16 space-y-3">
                <FileText size={48} className="opacity-20" />
                <p className="text-sm font-medium">Completa las variables y presiona "Generar Documento Legal".</p>
                <p className="text-xs max-w-sm">El sistema ensamblará las cláusulas de pago con custodia Escrow y especificaciones técnicas oficiales.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
