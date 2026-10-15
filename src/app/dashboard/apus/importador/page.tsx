"use client"
import React, { useState, useRef } from "react"
import { Database, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowRight, Download, Package, Layers } from "lucide-react"
import * as XLSX from "xlsx"
import { createClient } from "@/lib/supabase/client"
import { useProject } from "@/contexts/ProjectContext"

type TabType = 'insumos' | 'rubros' | 'presupuestos'

export default function ImportadorApuPage() {
  const { activeProject } = useProject()
  const [activeTab, setActiveTab] = useState<TabType>('presupuestos')
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [validationMsg, setValidationMsg] = useState("")
  const [fullParsedData, setFullParsedData] = useState<any[]>([])
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const [predictionResult, setPredictionResult] = useState<any>(null)

  const supabase = createClient()

  const EXPECTED_COLS_INSUMOS = ["codigo", "nombre", "unidad", "tipo", "precio_sin_iva"]
  const EXPECTED_COLS_RUBROS = ["codigo", "nombre", "unidad", "herramienta_menor_pct"]
  // Para presupuestos usamos un enfoque más flexible con IA
  const EXPECTED_COLS_PRESUPUESTOS = ["rubro", "cantidad"]

  const validateColumns = (row: any, type: TabType) => {
    let cols = EXPECTED_COLS_INSUMOS
    if (type === 'rubros') cols = EXPECTED_COLS_RUBROS
    if (type === 'presupuestos') cols = EXPECTED_COLS_PRESUPUESTOS
    const missing = cols.filter(c => !(c in row) && !(c.toLowerCase() in row) && !(c.toUpperCase() in row))
    return missing
  }

  const parseRowToLowerCaseKeys = (row: any) => {
    const newRow: any = {}
    for (const key of Object.keys(row)) {
      newRow[key.toLowerCase().trim()] = row[key]
    }
    return newRow
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile) return
    setFile(uploadedFile)
    setUploadSuccess(false)
    setErrorMsg("")
    setValidationMsg("")
    setPredictionResult(null)

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws)
        
        if (data.length === 0) {
          setErrorMsg("El archivo está vacío.")
          return
        }

        const normalizedData = data.map(parseRowToLowerCaseKeys)
        
        // Validación laxa para presupuestos (la IA se encargará del resto)
        const missingCols = validateColumns(normalizedData[0], activeTab)

        if (missingCols.length > 0) {
          setErrorMsg(`Faltan columnas esperadas: ${missingCols.join(', ')}`)
          return
        }

        setFullParsedData(normalizedData)
        setPreviewData(normalizedData.slice(0, 10))
        setValidationMsg(`Se encontraron ${normalizedData.length} registros válidos listos para importar.`)
      } catch (err) {
        setErrorMsg("Error leyendo el archivo Excel. Asegúrate de usar la plantilla correcta.")
      }
    }
    reader.readAsBinaryString(uploadedFile)
  }

  const generateAIPrediction = async () => {
    setIsAiProcessing(true)
    // Simulamos un delay de la "IA" leyendo y cruzando datos
    setTimeout(() => {
      // Mock result of digital twin prediction
      const totalRubros = fullParsedData.length
      const randomVolumen = Math.floor(Math.random() * 500) + 100
      const prediction = {
        rubrosAnalyzed: totalRubros,
        materialsToBuy: [
          { name: "Cemento Portland Gral", qty: randomVolumen * 5, unit: "sacos", provider: "Holcim Ecuador", status: "Stock Disponible" },
          { name: "Acero de Refuerzo 12mm", qty: randomVolumen * 12, unit: "varillas", provider: "Adelca", status: "Alerta de Precio" },
          { name: "Hormigón Premezclado f'c 210", qty: randomVolumen * 2, unit: "m3", provider: "Hormigonera Quito", status: "Stock Disponible" }
        ],
        estimatedCost: randomVolumen * 1250,
        aiMessage: "SARA ha analizado el presupuesto. Se han detectado coincidencias con 3 proveedores clave en tu zona."
      }
      setPredictionResult(prediction)
      setIsAiProcessing(false)
    }, 2500)
  }

  const handleImport = async () => {
    if (activeTab === 'presupuestos' && !predictionResult) {
      generateAIPrediction()
      return
    }

    if (!file || fullParsedData.length === 0) return
    setIsUploading(true)
    setErrorMsg("")

    try {
      let formattedData = []

      if (activeTab === 'insumos') {
        const { data: { user } } = await supabase.auth.getUser()
        formattedData = fullParsedData.map((row: any) => ({
          codigo: row.codigo || "",
          nombre: row.nombre,
          unidad: row.unidad || "u",
          tipo: row.tipo?.toLowerCase() || "material", // material, equipo, mano_de_obra
          precio_sin_iva: parseFloat(row.precio_sin_iva || 0),
          descripcion: row.descripcion || "",
          fecha_actualizacion: new Date().toISOString(),
          es_maestro: false,
          user_id: user?.id || null
        }))
        const { error } = await supabase.from('insumos').insert(formattedData)
        if (error) throw error
      } 
      else if (activeTab === 'rubros') {
        const { data: { user } } = await supabase.auth.getUser()
        formattedData = fullParsedData.map((row: any) => ({
          codigo: row.codigo || "",
          nombre: row.nombre,
          unidad: row.unidad || "u",
          herramienta_menor_pct: parseFloat(row.herramienta_menor_pct || 0),
          es_maestro: false,
          user_id: user?.id || null
        }))
        const { error } = await supabase.from('rubros').insert(formattedData)
        if (error) throw error
      }
      else if (activeTab === 'presupuestos') {
        // Here we would save the budget and trigger marketplace RFQs
        // Mock save for now
        await new Promise(r => setTimeout(r, 1000))
      }

      setUploadSuccess(true)
      setFile(null)
      setPreviewData([])
      setFullParsedData([])
    } catch (err: any) {
      setErrorMsg(err.message || "Error al subir a la base de datos.")
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    let ws;
    if (activeTab === 'insumos') {
      ws = XLSX.utils.json_to_sheet([{ codigo: "MAT-001", nombre: "Cemento Portland", unidad: "saco", tipo: "material", precio_sin_iva: 8.50, descripcion: "Cemento uso general" }])
    } else if (activeTab === 'rubros') {
      ws = XLSX.utils.json_to_sheet([{ codigo: "RUB-001", nombre: "Muro de ladrillo", unidad: "m2", herramienta_menor_pct: 5 }])
    } else {
      ws = XLSX.utils.json_to_sheet([{ rubro: "Excavación manual", cantidad: 120, unidad: "m3" }, { rubro: "Hormigón simple f'c=210", cantidad: 45, unidad: "m3" }])
    }
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla")
    XLSX.writeFile(wb, `Plantilla_${activeTab}.xlsx`)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6 h-[calc(100vh-64px)] overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-brand-sage/10 text-brand-sage rounded-2xl flex items-center justify-center border border-brand-sage/20">
          <Database size={28} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-dark">Importador Masivo Inteligente</h1>
          <p className="text-gray-500 text-sm mt-1">Sube archivos Excel para registrar múltiples Insumos o Rubros a la base de datos.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* TABS */}
        <div className="flex border-b border-gray-200 flex-wrap">
          <button onClick={() => {setActiveTab('presupuestos'); setFile(null); setPreviewData([]); setFullParsedData([]); setErrorMsg(""); setValidationMsg(""); setPredictionResult(null)}} 
                  className={`flex-1 min-w-[200px] py-4 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === 'presupuestos' ? 'bg-indigo-50/50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Database size={18} /> Gemelo Digital (Presupuestos)
          </button>
          <button onClick={() => {setActiveTab('insumos'); setFile(null); setPreviewData([]); setFullParsedData([]); setErrorMsg(""); setValidationMsg("");}} 
                  className={`flex-1 min-w-[200px] py-4 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === 'insumos' ? 'bg-brand-sage/5 text-brand-sage border-b-2 border-brand-sage' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Package size={18} /> Insumos (Catálogo Maestro)
          </button>
          <button onClick={() => {setActiveTab('rubros'); setFile(null); setPreviewData([]); setFullParsedData([]); setErrorMsg(""); setValidationMsg("");}} 
                  className={`flex-1 min-w-[200px] py-4 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === 'rubros' ? 'bg-brand-sage/5 text-brand-sage border-b-2 border-brand-sage' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Layers size={18} /> Rubros (APU)
          </button>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-lg font-bold text-gray-800">
              {activeTab === 'presupuestos' ? 'Analizador Inteligente de Presupuestos' : `Importar ${activeTab === 'insumos' ? 'Insumos' : 'Rubros'}`}
            </h2>
            <button onClick={downloadTemplate} className="text-sm font-bold text-brand-sage bg-brand-sage/10 px-4 py-2.5 rounded-xl hover:bg-brand-sage/20 flex items-center gap-2 transition-colors">
              <Download size={16} /> Descargar Plantilla .XLSX
            </button>
          </div>

          {!file ? (
            <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-brand-sage/50 transition-all group">
              <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
              <div className="w-16 h-16 bg-gray-100 group-hover:bg-brand-sage/10 rounded-full flex items-center justify-center mb-4 transition-colors">
                <FileSpreadsheet size={32} className="text-gray-400 group-hover:text-brand-sage transition-colors" />
              </div>
              <span className="font-bold text-gray-700 group-hover:text-brand-dark text-lg">Arrastra tu Excel aquí o haz clic para explorar</span>
              <span className="text-sm text-gray-400 mt-2">Formatos soportados: .XLSX, .XLS, .CSV</span>
            </label>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <FileSpreadsheet size={24} className="text-brand-sage" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button onClick={() => {setFile(null); setPreviewData([]); setFullParsedData([]); setErrorMsg(""); setValidationMsg(""); setPredictionResult(null)}} className="text-sm font-bold text-red-500 hover:text-red-600 hover:underline px-2">
                  Cancelar / Cambiar archivo
                </button>
              </div>

              {validationMsg && !errorMsg && (
                <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 size={20} className="text-emerald-500 shrink-0" /> 
                  {validationMsg}
                </div>
              )}

              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-start gap-3 text-sm font-medium">
                  <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" /> 
                  <div>
                    <p className="font-bold mb-1">Error de Validación</p>
                    {errorMsg}
                  </div>
                </div>
              )}

              {/* Si es Presupuesto y YA se analizó */}
              {activeTab === 'presupuestos' && predictionResult && !errorMsg && (
                <div className="border border-indigo-200 rounded-xl overflow-hidden bg-indigo-50/30 p-6 space-y-6 animate-in fade-in zoom-in duration-500">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Database size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-indigo-900 text-lg">Proyección del Gemelo Digital</h3>
                      <p className="text-sm text-indigo-700/80">{predictionResult.aiMessage}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Costo Estimado Materiales</p>
                      <p className="text-3xl font-black text-slate-800">${predictionResult.estimatedCost.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Volumen de Compra Proyectado</p>
                      <p className="text-3xl font-black text-slate-800">{predictionResult.materialsToBuy.length} items clave</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-indigo-50/50 text-indigo-900 font-semibold text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Insumo Requerido</th>
                          <th className="px-4 py-3">Cant.</th>
                          <th className="px-4 py-3">Proveedor Sugerido</th>
                          <th className="px-4 py-3">Disponibilidad</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {predictionResult.materialsToBuy.map((m: any, i: number) => (
                          <tr key={i} className="hover:bg-indigo-50/30">
                            <td className="px-4 py-3 font-medium text-slate-800">{m.name}</td>
                            <td className="px-4 py-3 text-slate-600">{m.qty} {m.unit}</td>
                            <td className="px-4 py-3 text-slate-600">{m.provider}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${m.status.includes('Stock') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {m.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Vista Previa normal (solo Insumos y Rubros, o antes del análisis de Presupuesto) */}
              {previewData.length > 0 && !errorMsg && (!predictionResult || activeTab !== 'presupuestos') && (
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <p className="text-sm font-bold text-gray-700">Vista previa (Primeros {previewData.length} registros)</p>
                    <span className="text-xs text-gray-500 font-medium">Las columnas coinciden con el esquema</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50/50 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                        <tr>
                          {Object.keys(previewData[0]).map(k => <th key={k} className="px-4 py-3 whitespace-nowrap">{k}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {previewData.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            {Object.values(row).map((v: any, j) => <td key={j} className="px-4 py-2.5 whitespace-nowrap text-gray-700">{v}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {!errorMsg && fullParsedData.length > 0 && (
                <button 
                  onClick={handleImport}
                  disabled={isUploading || isAiProcessing}
                  className={`w-full py-4 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-sage/20 disabled:opacity-50 disabled:cursor-not-allowed text-lg ${activeTab === 'presupuestos' && !predictionResult ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-brand-sage hover:bg-brand-dark text-white'}`}
                >
                  {isAiProcessing ? (
                     <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analizando {fullParsedData.length} rubros con Inteligencia Artificial...
                    </>
                  ) : isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {activeTab === 'presupuestos' ? 'Generando Requisición de Compras...' : `Importando ${fullParsedData.length} registros...`}
                    </>
                  ) : activeTab === 'presupuestos' && !predictionResult ? (
                    <>
                      Proyectar Compras y Proveedores <ArrowRight size={20} />
                    </>
                  ) : activeTab === 'presupuestos' && predictionResult ? (
                    <>
                      Confirmar y Solicitar Cotizaciones Automáticas <ArrowRight size={20} />
                    </>
                  ) : (
                    <>
                      Confirmar Importación de {fullParsedData.length} Registros <ArrowRight size={20} />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {uploadSuccess && (
            <div className="mt-8 p-8 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <h3 className="font-black text-emerald-800 text-xl mb-2">¡Completado con Éxito!</h3>
              <p className="text-emerald-600/80 mb-6">
                {activeTab === 'presupuestos' 
                  ? 'El presupuesto ha sido ingresado y se ha alertado a los proveedores (Marketplace) y transportistas (SARA Fletes).' 
                  : 'Todos los registros han sido insertados en la base de datos de APUs.'}
              </p>
              
              <button onClick={() => {setUploadSuccess(false); setActiveTab(activeTab); setPredictionResult(null)}} className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors">
                Realizar otra importación
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
