"use client"
import React, { useState, useEffect } from "react"
import { Palette, UploadCloud, Save, CheckCircle2, Image as ImageIcon } from "lucide-react"

export default function MarcaPage() {
  const [logoBase64, setLogoBase64] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const savedLogo = localStorage.getItem("my_company_logo")
    if (savedLogo) {
      setLogoBase64(savedLogo)
    }
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoBase64(reader.result as string)
        setIsSaved(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    if (logoBase64) {
      localStorage.setItem("my_company_logo", logoBase64)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    }
  }

  const handleRemove = () => {
    localStorage.removeItem("my_company_logo")
    setLogoBase64(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
          <Palette size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Marca y Reportes PDF</h1>
          <p className="text-slate-500 dark:text-slate-400">Personaliza los reportes de SARA con la identidad de tu Constructora</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Logotipo de la Empresa</h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Este logotipo se utilizará como membrete oficial en todos los PDFs exportados (Presupuestos Generales, Análisis de Precios Unitarios y Explosión de Insumos).
            </p>

            <div className="flex flex-col gap-4">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 rounded-2xl cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors group">
                <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleFileUpload} />
                <UploadCloud size={32} className="text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Seleccionar Imagen</span>
                <span className="text-xs text-slate-400 mt-1">PNG o JPG (Máx 2MB). Ideal formato horizontal.</span>
              </label>

              <div className="flex gap-3">
                <button 
                  onClick={handleSave}
                  disabled={!logoBase64}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
                  {isSaved ? "Guardado" : "Guardar Logotipo"}
                </button>
                {logoBase64 && (
                  <button 
                    onClick={handleRemove}
                    className="py-3 px-4 bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-xl font-bold transition-all"
                  >
                    Restablecer
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="w-full md:w-72 shrink-0">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Vista Previa</h3>
            <div className="w-full aspect-[21/9] bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden p-4">
              {logoBase64 ? (
                <img src={logoBase64} alt="Logo" className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <ImageIcon size={32} className="mb-2 opacity-50" />
                  <span className="text-xs">Sin logotipo (Se usará logo SARA)</span>
                </div>
              )}
            </div>
            
            {logoBase64 && (
              <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 size={14} className="inline mr-1" />
                  Tus próximos reportes PDF saldrán con este membrete.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
