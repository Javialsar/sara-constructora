"use client"
import React, { useState, useEffect } from "react"
import { Palette, UploadCloud, Save, CheckCircle2, Image as ImageIcon, Building, FileText, User, Phone, Mail, Globe, MapPin, Map } from "lucide-react"

// Importamos el componente mapa entero dinámicamente para evitar SSR
import dynamic from 'next/dynamic'
const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false })

export default function MarcaPage() {
  const [logoBase64, setLogoBase64] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [position, setPosition] = useState<[number, number]>([-4.321, -79.932]) // Cariamanga by default
  const [isClient, setIsClient] = useState(false)

  const [formData, setFormData] = useState({
    nombre_comercial: "",
    razon_social: "",
    ruc: "",
    representante: "",
    telefono: "",
    email: "",
    website: "",
    direccion: ""
  })

  useEffect(() => {
    setIsClient(true)
    const savedLogo = localStorage.getItem("my_company_logo")
    if (savedLogo) setLogoBase64(savedLogo)

    const savedProfile = localStorage.getItem("my_company_profile")
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile)
        setFormData(parsed.formData || formData)
        if (parsed.position) setPosition(parsed.position)
      } catch(e) {}
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setIsSaved(false)
  }

  const handleSave = () => {
    if (logoBase64) localStorage.setItem("my_company_logo", logoBase64)
    localStorage.setItem("my_company_profile", JSON.stringify({ formData, position }))
    
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const handleRemove = () => {
    localStorage.removeItem("my_company_logo")
    localStorage.removeItem("my_company_profile")
    setLogoBase64(null)
    setFormData({
      nombre_comercial: "", razon_social: "", ruc: "", representante: "", telefono: "", email: "", website: "", direccion: ""
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
          <Building size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Identidad Corporativa</h1>
          <p className="text-slate-500 dark:text-slate-400">Configura la información de tu Constructora para los reportes y facturación</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: Formulario */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <FileText size={20} className="text-indigo-500"/> Datos Generales
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre Comercial</label>
                <div className="relative">
                  <Building size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="text" name="nombre_comercial" value={formData.nombre_comercial} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ej. Constructora Apex" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Razón Social</label>
                <input type="text" name="razon_social" value={formData.razon_social} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Apex S.A." />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">RUC / NIT</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="text" name="ruc" value={formData.ruc} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="110...001" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Representante Legal</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="text" name="representante" value={formData.representante} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Juan Pérez" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teléfono de Contacto</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+593 99 000 0000" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="contacto@apex.com" />
                </div>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sitio Web</label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://www.apex.com" />
                </div>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dirección Física</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                  <textarea name="direccion" value={formData.direccion} onChange={handleChange} rows={2} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Av. Principal y Secundaria, Edificio Centro" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
             <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Map size={20} className="text-indigo-500"/> Geolocalización de Oficinas
            </h2>
            <p className="text-sm text-slate-500 mb-4">Haz clic en el mapa para fijar el pin en la ubicación exacta de tu constructora.</p>
            <div className="w-full h-64 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 z-0 relative">
              {isClient && (
                <MapComponent position={position} setPosition={setPosition} />
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Logo y Guardar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Palette size={20} className="text-indigo-500"/> Logotipo Oficial
            </h2>

            <div className="flex flex-col gap-4">
              <div className="w-full aspect-[21/9] bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden p-4">
                {logoBase64 ? (
                  <img src={logoBase64} alt="Logo" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <ImageIcon size={32} className="mb-2 opacity-50" />
                    <span className="text-xs text-center">Sin logotipo<br/>(Se usará logo SARA)</span>
                  </div>
                )}
              </div>

              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 rounded-xl cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors group">
                <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleFileUpload} />
                <UploadCloud size={24} className="text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Subir Imagen</span>
              </label>

              <hr className="border-slate-100 dark:border-slate-800 my-2" />

              <button 
                onClick={handleSave}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
                {isSaved ? "Datos Guardados" : "Guardar Identidad"}
              </button>
              
              <button 
                onClick={handleRemove}
                className="w-full py-2 px-4 bg-white dark:bg-slate-800 text-rose-600 border border-rose-200 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl text-sm font-bold transition-all"
              >
                Limpiar Datos
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
