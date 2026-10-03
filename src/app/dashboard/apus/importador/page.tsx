"use client"
import React, { useState, useRef } from "react"
import { Database, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowRight, Download, Package, Layers } from "lucide-react"
import * as XLSX from "xlsx"
import { createClient } from "@/lib/supabase/client"

type TabType = 'insumos' | 'rubros'

export default function ImportadorApuPage() {
  const [activeTab, setActiveTab] = useState<TabType>('insumos')
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [validationMsg, setValidationMsg] = useState("")
  const [fullParsedData, setFullParsedData] = useState<any[]>([])

  const supabase = createClient()

  const EXPECTED_COLS_INSUMOS = ["codigo", "nombre", "unidad", "tipo", "precio_sin_iva"]
  const EXPECTED_COLS_RUBROS = ["codigo", "nombre", "unidad", "herramienta_menor_pct"]

  const validateColumns = (row: any, type: TabType) => {
    const cols = type === 'insumos' ? EXPECTED_COLS_INSUMOS : EXPECTED_COLS_RUBROS
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
        const missingCols = validateColumns(normalizedData[0], activeTab)

        if (missingCols.length > 0) {
          setErrorMsg(`Faltan columnas esperadas: ${missingCols.join(', ')}`)
          return
        }

        setFullParsedData(normalizedData)
        setPreviewData(normalizedData.slice(0, 10)) // Preview up to 10 rows
        setValidationMsg(`Se encontraron ${normalizedData.length} registros válidos listos para importar.`)
      } catch (err) {
        setErrorMsg("Error leyendo el archivo Excel. Asegúrate de usar la plantilla correcta.")
      }
    }
    reader.readAsBinaryString(uploadedFile)
  }

  const handleImport = async () => {
    if (!file || fullParsedData.length === 0) return
    setIsUploading(true)
    setErrorMsg("")

    try {
      let formattedData = []

      if (activeTab === 'insumos') {
        formattedData = fullParsedData.map((row: any) => ({
          codigo: row.codigo || "",
          nombre: row.nombre,
          unidad: row.unidad || "u",
          tipo: row.tipo?.toLowerCase() || "material", // material, equipo, mano_de_obra
          precio_sin_iva: parseFloat(row.precio_sin_iva || 0),
          descripcion: row.descripcion || "",
          fecha_actualizacion: new Date().toISOString()
        }))
        const { error } = await supabase.from('insumos').insert(formattedData)
        if (error) throw error
      } 
      else if (activeTab === 'rubros') {
        formattedData = fullParsedData.map((row: any) => ({
          codigo: row.codigo || "",
          nombre: row.nombre,
          unidad: row.unidad || "u",
          herramienta_menor_pct: parseFloat(row.herramienta_menor_pct || 0)
        }))
        const { error } = await supabase.from('rubros').insert(formattedData)
        if (error) throw error
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
    } else {
      ws = XLSX.utils.json_to_sheet([{ codigo: "RUB-001", nombre: "Muro de ladrillo", unidad: "m2", herramienta_menor_pct: 5 }])
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
        <div className="flex border-b border-gray-200">
          <button onClick={() => {setActiveTab('insumos'); setFile(null); setPreviewData([]); setFullParsedData([]); setErrorMsg(""); setValidationMsg("");}} 
                  className={`flex-1 py-4 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === 'insumos' ? 'bg-brand-sage/5 text-brand-sage border-b-2 border-brand-sage' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Package size={18} /> Insumos (Catálogo Maestro)
          </button>
          <button onClick={() => {setActiveTab('rubros'); setFile(null); setPreviewData([]); setFullParsedData([]); setErrorMsg(""); setValidationMsg("");}} 
                  className={`flex-1 py-4 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === 'rubros' ? 'bg-brand-sage/5 text-brand-sage border-b-2 border-brand-sage' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Layers size={18} /> Rubros (APU)
          </button>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-lg font-bold text-gray-800">
              Importar {activeTab === 'insumos' ? 'Insumos' : 'Rubros'}
            </h2>
            <button onClick={downloadTemplate} className="text-sm font-bold text-brand-sage bg-brand-sage/10 px-4 py-2.5 rounded-xl hover:bg-brand-sage/20 flex items-center gap-2 transition-colors">
              <Download size={16} /> Descargar Plantilla .XLSX
            </button>
          </div>

          {!file ? (
            <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-brand-sage/50 transition-all group">
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
              <div className="w-16 h-16 bg-gray-100 group-hover:bg-brand-sage/10 rounded-full flex items-center justify-center mb-4 transition-colors">
                <FileSpreadsheet size={32} className="text-gray-400 group-hover:text-brand-sage transition-colors" />
              </div>
              <span className="font-bold text-gray-700 group-hover:text-brand-dark text-lg">Arrastra tu Excel aquí o haz clic para explorar</span>
              <span className="text-sm text-gray-400 mt-2">Formatos soportados: .XLSX, .XLS</span>
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
                <button onClick={() => {setFile(null); setPreviewData([]); setFullParsedData([]); setErrorMsg(""); setValidationMsg("")}} className="text-sm font-bold text-red-500 hover:text-red-600 hover:underline px-2">
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

              {previewData.length > 0 && !errorMsg && (
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
                  disabled={isUploading}
                  className="w-full py-4 bg-brand-sage hover:bg-brand-dark text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-sage/20 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Importando {fullParsedData.length} registros...
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
              <h3 className="font-black text-emerald-800 text-xl mb-2">¡Importación Completada con Éxito!</h3>
              <p className="text-emerald-600/80 mb-6">Todos los registros han sido insertados en la base de datos de APUs.</p>
              
              <button onClick={() => {setUploadSuccess(false); setActiveTab(activeTab)}} className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors">
                Realizar otra importación
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
