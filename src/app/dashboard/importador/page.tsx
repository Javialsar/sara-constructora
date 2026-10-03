"use client"
import React, { useState } from "react"
import { Database, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowRight, Download } from "lucide-react"
import * as XLSX from "xlsx"
import { createClient } from "@/lib/supabase/client"

export default function ImportadorPage() {
  const [activeTab, setActiveTab] = useState<'insumos'|'proveedores'|'clientes'>('insumos')
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const supabase = createClient()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile) return
    setFile(uploadedFile)
    setUploadSuccess(false)
    setErrorMsg("")

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws)
        setPreviewData(data.slice(0, 5)) // Preview 5 rows
      } catch (err) {
        setErrorMsg("Error leyendo el archivo Excel. Asegúrate de usar la plantilla correcta.")
      }
    }
    reader.readAsBinaryString(uploadedFile)
  }

  const handleImport = async () => {
    if (!file || previewData.length === 0) return
    setIsUploading(true)
    setErrorMsg("")

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No hay usuario autenticado")

      const reader = new FileReader()
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result
          const wb = XLSX.read(bstr, { type: 'binary' })
          const wsname = wb.SheetNames[0]
          const ws = wb.Sheets[wsname]
          const data = XLSX.utils.sheet_to_json(ws)

          let formattedData = []

          if (activeTab === 'insumos') {
            formattedData = data.map((row: any) => ({
              nombre: row.Nombre || row.nombre || "Insumo sin nombre",
              unidad: row.Unidad || row.unidad || "u",
              costo: parseFloat(row.Costo || row.costo || 0),
              categoria: row.Categoria || row.categoria || "Materiales",
              user_id: user.id
            }))
            const { error } = await supabase.from('insumos_user').insert(formattedData)
            if (error) throw error
          } 
          else if (activeTab === 'proveedores') {
            formattedData = data.map((row: any) => ({
              nombre: row.Nombre || row.nombre || "Proveedor",
              ruc: row.RUC || row.ruc || "",
              telefono: row.Telefono || row.telefono || "",
              email: row.Email || row.email || "",
              user_id: user.id
            }))
            const { error } = await supabase.from('proveedores').insert(formattedData)
            if (error) throw error
          }

          setUploadSuccess(true)
          setFile(null)
          setPreviewData([])
        } catch (err: any) {
          setErrorMsg(err.message || "Error al subir a la base de datos.")
        } finally {
          setIsUploading(false)
        }
      }
      reader.readAsBinaryString(file)
    } catch (err: any) {
      setErrorMsg(err.message)
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    let ws;
    if (activeTab === 'insumos') {
      ws = XLSX.utils.json_to_sheet([{ Nombre: "Cemento Selva", Unidad: "saco", Costo: "8.50", Categoria: "Materiales" }])
    } else if (activeTab === 'proveedores') {
      ws = XLSX.utils.json_to_sheet([{ Nombre: "Ferreteria XYZ", RUC: "1100000000001", Telefono: "0999999999", Email: "ventas@xyz.com" }])
    } else {
      ws = XLSX.utils.json_to_sheet([{ Nombre: "Constructora Beta", RUC: "110", Telefono: "099", Direccion: "Centro" }])
    }
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla")
    XLSX.writeFile(wb, `Plantilla_${activeTab}.xlsx`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
          <Database size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Migrador de Datos Masivo</h1>
          <p className="text-slate-500 dark:text-slate-400">Importa tus Insumos y Proveedores desde Excel hacia SARA APU al instante.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* TABS */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => {setActiveTab('insumos'); setFile(null); setPreviewData([])}} className={`flex-1 py-4 font-bold text-sm transition-colors ${activeTab === 'insumos' ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}>Insumos (Materiales)</button>
          <button onClick={() => {setActiveTab('proveedores'); setFile(null); setPreviewData([])}} className={`flex-1 py-4 font-bold text-sm transition-colors ${activeTab === 'proveedores' ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}>Directorio Proveedores</button>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Importar {activeTab === 'insumos' ? 'Insumos' : 'Proveedores'}</h2>
            <button onClick={downloadTemplate} className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 flex items-center gap-2">
              <Download size={16} /> Descargar Plantilla
            </button>
          </div>

          {!file ? (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-emerald-200 rounded-2xl cursor-pointer hover:bg-emerald-50 transition-colors group">
              <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
              <FileSpreadsheet size={40} className="text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-emerald-600">Arrastra tu Excel aquí o haz clic</span>
              <span className="text-xs text-slate-400 mt-2">Soporta .XLSX y .CSV</span>
            </label>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet size={24} className="text-emerald-500" />
                  <div>
                    <p className="font-bold text-sm">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button onClick={() => {setFile(null); setPreviewData([])}} className="text-xs font-bold text-rose-500 hover:underline">Cambiar archivo</button>
              </div>

              {previewData.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-2">Vista previa de las primeras 5 filas:</p>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-100 font-bold text-slate-700">
                        <tr>
                          {Object.keys(previewData[0]).map(k => <th key={k} className="px-4 py-2">{k}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, i) => (
                          <tr key={i} className="border-t border-slate-100">
                            {Object.values(row).map((v: any, j) => <td key={j} className="px-4 py-2">{v}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 bg-rose-50 text-rose-600 rounded-xl flex items-center gap-2 text-sm font-bold">
                  <AlertCircle size={18} /> {errorMsg}
                </div>
              )}

              <button 
                onClick={handleImport}
                disabled={isUploading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-600/20"
              >
                {isUploading ? "Importando a la Nube..." : "Comenzar Importación Masiva"} <ArrowRight size={18} />
              </button>
            </div>
          )}

          {uploadSuccess && (
            <div className="mt-6 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center text-center">
              <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
              <h3 className="font-bold text-emerald-800 text-lg">¡Importación Exitosa!</h3>
              <p className="text-emerald-600 text-sm mt-1">Todos los registros han sido guardados en tu base de datos privada en la nube.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
