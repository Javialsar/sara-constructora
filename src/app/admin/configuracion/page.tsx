"use client"
import { useState, useEffect } from "react"
import { Settings, Shield, Bell, Key, Save, Camera, Plus, Trash2, Link as LinkIcon, Phone, MapPin, Mail, Loader2, Upload, Check, Palette, Building, CreditCard, Sparkles, RefreshCw, Home, Compass } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getCuentasBancarias, saveCuentasBancarias, CuentaBancariaEmpresa } from "@/lib/services/datosBancariosService"
import { getLogosEmpresa, saveLogosEmpresa, LogosEmpresa, DEFAULT_LOGOS_EMPRESA } from "@/lib/services/logosService"

interface MiembroEquipo {
  id: string
  nombre: string
  cargo: string
  imagen_url: string
  telefono?: string
  email?: string
}

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const [configId, setConfigId] = useState(1)

  const [formData, setFormData] = useState({
    nombre_empresa: "",
    logo_url: "",
    email_contacto: "",
    telefono_principal: "",
    whatsapp: "",
    direccion: "",
    facebook_url: "",
    instagram_url: "",
    tiktok_url: "",
    x_url: "",
  })

  const [equipo, setEquipo] = useState<MiembroEquipo[]>([])
  const [cuentasBancarias, setCuentasBancarias] = useState<CuentaBancariaEmpresa[]>([])
  
  // Logotipos para las 3 líneas de servicio de Grupo SARA
  const [logos, setLogos] = useState<LogosEmpresa>(DEFAULT_LOGOS_EMPRESA)
  const [logoFiles, setLogoFiles] = useState<{
    constructora: File | null
    inmobiliaria: File | null
    stays: File | null
    apu: File | null
  }>({
    constructora: null,
    inmobiliaria: null,
    stays: null,
    apu: null
  })
  const [uploadingLogoKey, setUploadingLogoKey] = useState<string | null>(null)

  const [currentTheme, setCurrentTheme] = useState<string>('')

  useEffect(() => {
    loadConfig()
    const saved = localStorage.getItem('sara_theme') || ''
    setCurrentTheme(saved)
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('configuracion_empresa')
      .select('*')
      .limit(1)
      .single()

    if (data) {
      setConfigId(data.id)
      setFormData({
        nombre_empresa: data.nombre_empresa || "",
        logo_url: data.logo_url || "",
        email_contacto: data.email_contacto || "",
        telefono_principal: data.telefono_principal || "",
        whatsapp: data.whatsapp || "",
        direccion: data.direccion || "",
        facebook_url: data.facebook_url || "",
        instagram_url: data.instagram_url || "",
        tiktok_url: data.tiktok_url || "",
        x_url: data.x_url || "",
      })
      setEquipo(data.equipo_directivo || [])
    }
    const ctas = await getCuentasBancarias()
    setCuentasBancarias(ctas)

    const logosData = await getLogosEmpresa()
    setLogos(logosData)

    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleEquipoChange = (index: number, field: string, value: string) => {
    const newEquipo = [...equipo]
    newEquipo[index] = { ...newEquipo[index], [field]: value }
    setEquipo(newEquipo)
  }

  const handleAddCuenta = () => {
    const nueva: CuentaBancariaEmpresa = {
      id: `cta-${Date.now()}`,
      banco: "Banco Pichincha",
      tipoCuenta: "Corriente",
      numeroCuenta: "",
      cedulaRuc: "0190458923001",
      beneficiario: formData.nombre_empresa || "SARA CONSTRUCTORA CIA. LTDA.",
      correoComprobantes: formData.email_contacto || "pagos@saraconstructora.com",
      activa: true
    }
    setCuentasBancarias(prev => [...prev, nueva])
  }

  const handleRemoveCuenta = (id: string) => {
    setCuentasBancarias(prev => prev.filter(c => c.id !== id))
  }

  const handleCuentaChange = (id: string, field: keyof CuentaBancariaEmpresa, value: any) => {
    setCuentasBancarias(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const changeTheme = (themeClass: string) => {
    document.documentElement.classList.remove('theme-ocean', 'theme-gold', 'theme-apucons', 'theme-sunset', 'theme-nordic', 'theme-ruby')
    if (themeClass) {
      document.documentElement.classList.add(themeClass)
    }
    localStorage.setItem('sara_theme', themeClass)
    setCurrentTheme(themeClass)
  }

  const addMiembro = () => {
    setEquipo([...equipo, { id: Date.now().toString(), nombre: "", cargo: "", imagen_url: "", telefono: "", email: "" }])
  }

  const removeMiembro = (index: number) => {
    const newEquipo = [...equipo]
    newEquipo.splice(index, 1)
    setEquipo(newEquipo)
  }

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    // Upload logic
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `team/${fileName}`

    setSaving(true) // Just to show some loading state during upload
    const { error: uploadError } = await supabase.storage
      .from('sara-assets')
      .upload(filePath, file)

    if (uploadError) {
      alert("Error subiendo la imagen: " + uploadError.message)
      setSaving(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('sara-assets')
      .getPublicUrl(filePath)

    handleEquipoChange(index, "imagen_url", publicUrl)
    setSaving(false)
  }

  const handleSave = async () => {
    setSaving(true)
    let finalLogos: LogosEmpresa = { ...logos }
    const logoKeys: (keyof LogosEmpresa)[] = ['constructora', 'inmobiliaria', 'stays', 'apu']

    for (const key of logoKeys) {
      const file = logoFiles[key]
      if (file) {
        setUploadingLogoKey(key)
        const fileExt = file.name.split('.').pop()
        const fileName = `logo-${key}-${Date.now()}.${fileExt}`
        const filePath = `identidad/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('sara-assets')
          .upload(filePath, file, { upsert: true })

        if (uploadError) {
          alert(`Error subiendo el logo de ${key}: ` + uploadError.message)
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('sara-assets')
            .getPublicUrl(filePath)
          finalLogos[key] = publicUrl
        }
      }
    }

    setUploadingLogoKey(null)
    setLogos(finalLogos)
    setLogoFiles({ constructora: null, inmobiliaria: null, stays: null, apu: null })

    // 1. Guardar logos de las 3 marcas en Supabase (parametros_globales y configuracion_empresa)
    const logosSaved = await saveLogosEmpresa(finalLogos)

    // 2. Guardar datos generales de empresa y equipo directivo
    const { error } = await supabase
      .from('configuracion_empresa')
      .update({
        ...formData,
        logo_url: finalLogos.constructora,
        equipo_directivo: equipo
      })
      .eq('id', configId)

    // 3. Guardar cuentas bancarias
    const bankSaved = await saveCuentasBancarias(cuentasBancarias)

    setSaving(false)
    if (error || !bankSaved || !logosSaved) {
      alert("Aviso al guardar: " + (error?.message || "Algunos cambios no se guardaron correctamente. Por favor verifica la conexión."))
    } else {
      alert("¡Configuración general, cuentas bancarias y logotipos de las 3 marcas actualizados con éxito!")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-brand-sage" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración Pública</h1>
          <p className="text-gray-500">Administra la información de contacto, redes sociales y el equipo directivo de la empresa.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-brand-sage text-brand-dark px-6 py-2.5 rounded-lg font-bold hover:bg-[#d64e0a] hover:text-white transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {/* ============================================================ */}
      {/* SECCIÓN IDENTIDAD VISUAL: LAS 3 LÍNEAS DE SERVICIO DE GRUPO SARA */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-dark flex items-center justify-center text-brand-sage shrink-0">
              <Camera size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Identidad Visual & Logotipos Multi-Marca</h2>
              <p className="text-xs text-gray-500">Configura y actualiza el logotipo correspondiente para cada una de las 4 líneas de negocio del Grupo SARA.</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
            <Sparkles size={12} className="text-emerald-500" />
            4 Marcas Sincronizadas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* 1. SARA CONSTRUCTORA */}
          <div className="bg-slate-50/70 rounded-xl p-5 border border-slate-200 hover:border-brand-sage/50 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-dark text-brand-sage uppercase">
                  <Building size={12} /> Constructora
                </span>
                <span className="text-[11px] font-semibold text-gray-400">Portal Principal</span>
              </div>
              <h3 className="font-bold text-gray-900 text-base">SARA Constructora</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Logotipo matriz usado en el Header general, Footer, Servicios, Obras y Panel Admin.
              </p>
            </div>

            {/* Preview Box */}
            <div className="w-full h-36 bg-slate-900 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-700 relative overflow-hidden p-3 shadow-inner">
              {uploadingLogoKey === "constructora" && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-10">
                  <Loader2 className="animate-spin text-brand-sage" size={26} />
                </div>
              )}
              {logoFiles.constructora ? (
                <img
                  src={URL.createObjectURL(logoFiles.constructora)}
                  alt="Nuevo Logo Constructora"
                  className="max-w-full max-h-full object-contain filter drop-shadow"
                />
              ) : logos.constructora ? (
                <img
                  src={logos.constructora}
                  alt="Logo SARA Constructora"
                  className="max-w-full max-h-full object-contain filter drop-shadow"
                />
              ) : (
                <span className="text-gray-400 text-xs font-medium">Sin Logotipo</span>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Subir nuevo logotipo (PNG transparente)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const file = e.target.files[0]
                      setLogoFiles(prev => ({ ...prev, constructora: file }))
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-sage/20 file:text-brand-dark hover:file:bg-brand-sage/30 cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setLogoFiles(prev => ({ ...prev, constructora: null }))
                    setLogos(prev => ({ ...prev, constructora: "/logo-hero.png" }))
                  }}
                  className="text-gray-500 hover:text-brand-dark flex items-center gap-1 transition-colors font-medium cursor-pointer"
                  title="Restablecer al logo predeterminado de constructora"
                >
                  <RefreshCw size={11} /> Logo Original
                </button>
                <span className="text-emerald-700 font-medium truncate max-w-[140px]" title={logos.constructora}>
                  {logoFiles.constructora ? "Archivo seleccionado" : logos.constructora.split('/').pop()}
                </span>
              </div>
            </div>
          </div>

          {/* 2. SARA INMOBILIARIA */}
          <div className="bg-slate-50/70 rounded-xl p-5 border border-slate-200 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-400 uppercase">
                  <Home size={12} /> Inmobiliaria
                </span>
                <span className="text-[11px] font-semibold text-gray-400">Portal Inmobiliario</span>
              </div>
              <h3 className="font-bold text-gray-900 text-base">SARA Inmobiliaria</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Logotipo para la división de Bienes Raíces: cabecera de <code className="text-[10px] bg-slate-200 px-1 py-0.5 rounded">/inmobiliaria</code>, pie de página y catálogo de propiedades.
              </p>
            </div>

            {/* Preview Box */}
            <div className="w-full h-36 bg-slate-900 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-700 relative overflow-hidden p-3 shadow-inner">
              {uploadingLogoKey === "inmobiliaria" && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-10">
                  <Loader2 className="animate-spin text-emerald-400" size={26} />
                </div>
              )}
              {logoFiles.inmobiliaria ? (
                <img
                  src={URL.createObjectURL(logoFiles.inmobiliaria)}
                  alt="Nuevo Logo Inmobiliaria"
                  className="max-w-full max-h-full object-contain filter drop-shadow"
                />
              ) : logos.inmobiliaria ? (
                <img
                  src={logos.inmobiliaria}
                  alt="Logo SARA Inmobiliaria"
                  className="max-w-full max-h-full object-contain filter drop-shadow"
                />
              ) : (
                <span className="text-gray-400 text-xs font-medium">Sin Logotipo</span>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Subir nuevo logotipo (PNG transparente)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const file = e.target.files[0]
                      setLogoFiles(prev => ({ ...prev, inmobiliaria: file }))
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/20 file:text-emerald-900 hover:file:bg-emerald-500/30 cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setLogoFiles(prev => ({ ...prev, inmobiliaria: null }))
                    setLogos(prev => ({ ...prev, inmobiliaria: "/sara-inmobiliaria.png" }))
                  }}
                  className="text-gray-500 hover:text-emerald-700 flex items-center gap-1 transition-colors font-medium cursor-pointer"
                  title="Restablecer al logo predeterminado de inmobiliaria"
                >
                  <RefreshCw size={11} /> Logo Original
                </button>
                <span className="text-emerald-700 font-medium truncate max-w-[140px]" title={logos.inmobiliaria}>
                  {logoFiles.inmobiliaria ? "Archivo seleccionado" : logos.inmobiliaria.split('/').pop()}
                </span>
              </div>
            </div>
          </div>

          {/* 3. SARA STAYS */}
          <div className="bg-slate-50/70 rounded-xl p-5 border border-slate-200 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950 text-amber-400 uppercase">
                  <Compass size={12} /> Stays
                </span>
                <span className="text-[11px] font-semibold text-gray-400">Portal Alojamientos</span>
              </div>
              <h3 className="font-bold text-gray-900 text-base">SARA Stays</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Logotipo para la división de Alojamientos: cabecera de <code className="text-[10px] bg-slate-200 px-1 py-0.5 rounded">/stays</code>, login de huéspedes, vouchers y confirmaciones.
              </p>
            </div>

            {/* Preview Box */}
            <div className="w-full h-36 bg-slate-900 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-700 relative overflow-hidden p-3 shadow-inner">
              {uploadingLogoKey === "stays" && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-10">
                  <Loader2 className="animate-spin text-amber-400" size={26} />
                </div>
              )}
              {logoFiles.stays ? (
                <img
                  src={URL.createObjectURL(logoFiles.stays)}
                  alt="Nuevo Logo Stays"
                  className="max-w-full max-h-full object-contain filter drop-shadow"
                />
              ) : logos.stays ? (
                <img
                  src={logos.stays}
                  alt="Logo SARA Stays"
                  className="max-w-full max-h-full object-contain filter drop-shadow"
                />
              ) : (
                <span className="text-gray-400 text-xs font-medium">Sin Logotipo</span>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Subir nuevo logotipo (PNG transparente)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const file = e.target.files[0]
                      setLogoFiles(prev => ({ ...prev, stays: file }))
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500/20 file:text-amber-900 hover:file:bg-amber-500/30 cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setLogoFiles(prev => ({ ...prev, stays: null }))
                    setLogos(prev => ({ ...prev, stays: "/sara-stays.png" }))
                  }}
                  className="text-gray-500 hover:text-amber-700 flex items-center gap-1 transition-colors font-medium cursor-pointer"
                  title="Restablecer al logo predeterminado de stays"
                >
                  <RefreshCw size={11} /> Logo Original
                </button>
                <span className="text-amber-700 font-medium truncate max-w-[140px]" title={logos.stays}>
                  {logoFiles.stays ? "Archivo seleccionado" : logos.stays.split('/').pop()}
                </span>
              </div>
            </div>
          </div>
        
            {/* 4. SARA APUS */}
          <div className="bg-slate-50/70 rounded-xl p-5 border border-slate-200 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-950 text-amber-400 uppercase">
                  <Compass size={12} /> Stays
                </span>
                <span className="text-[11px] font-semibold text-gray-400">Portal APUs</span>
              </div>
              <h3 className="font-bold text-gray-900 text-base">SaaS APU</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Logotipo para la plataforma SaaS: cabecera de <code className="text-[10px] bg-slate-200 px-1 py-0.5 rounded">/dashboard</code>, login de huéspedes, vouchers y confirmaciones.
              </p>
            </div>

            {/* Preview Box */}
            <div className="w-full h-36 bg-slate-900 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-700 relative overflow-hidden p-3 shadow-inner">
              {uploadingLogoKey === "apu" && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-10">
                  <Loader2 className="animate-spin text-amber-400" size={26} />
                </div>
              )}
              {logoFiles.apu ? (
                <img
                  src={URL.createObjectURL(logoFiles.apu)}
                  alt="Nuevo Logo Stays"
                  className="max-w-full max-h-full object-contain filter drop-shadow"
                />
              ) : logos.apu ? (
                <img
                  src={logos.apu}
                  alt="Logo SaaS APU"
                  className="max-w-full max-h-full object-contain filter drop-shadow"
                />
              ) : (
                <span className="text-gray-400 text-xs font-medium">Sin Logotipo</span>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Subir nuevo logotipo (PNG transparente)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const file = e.target.files[0]
                      setLogoFiles(prev => ({ ...prev, apu: file }))
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-500/20 file:text-blue-900 hover:file:bg-blue-500/30 cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setLogoFiles(prev => ({ ...prev, apu: null }))
                    setLogos(prev => ({ ...prev, apu: "/logo-hero.png" }))
                  }}
                  className="text-gray-500 hover:text-blue-700 flex items-center gap-1 transition-colors font-medium cursor-pointer"
                  title="Restablecer al logo predeterminado de apu"
                >
                  <RefreshCw size={11} /> Logo Original
                </button>
                <span className="text-blue-700 font-medium truncate max-w-[140px]" title={logos.apu}>
                  {logoFiles.apu ? "Archivo seleccionado" : logos.apu.split('/').pop()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Información de Contacto */}
        <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-lg bg-brand-dark flex items-center justify-center text-brand-sage">
              <Mail size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Contacto</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de la Empresa</label>
              <input type="text" name="nombre_empresa" value={formData.nombre_empresa} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email Público</label>
              <input type="email" name="email_contacto" value={formData.email_contacto} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><Phone size={14}/> Teléfono Fijo</label>
                <input type="text" name="telefono_principal" value={formData.telefono_principal} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><Phone size={14}/> WhatsApp</label>
                <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><MapPin size={14}/> Dirección Física</label>
              <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none" />
            </div>
          </div>
        </div>

        {/* Redes Sociales */}
        <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-lg bg-brand-dark flex items-center justify-center text-brand-sage">
              <LinkIcon size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Redes Sociales</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Facebook URL</label>
              <input type="url" name="facebook_url" value={formData.facebook_url} onChange={handleChange} placeholder="https://facebook.com/saraconstructora" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Instagram URL</label>
              <input type="url" name="instagram_url" value={formData.instagram_url} onChange={handleChange} placeholder="https://instagram.com/sara.constructora" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">TikTok URL</label>
              <input type="url" name="tiktok_url" value={formData.tiktok_url} onChange={handleChange} placeholder="https://tiktok.com/@saraconstructora" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">X (Twitter) URL</label>
              <input type="url" name="x_url" value={formData.x_url} onChange={handleChange} placeholder="https://x.com/saraconstructora" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none" />
            </div>
          </div>
        </div>

        {/* Equipo Directivo */}
        <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage p-6 md:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-dark flex items-center justify-center text-brand-sage">
                <Camera size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Equipo Directivo / Socios</h2>
            </div>
            <button 
              onClick={addMiembro}
              className="flex items-center gap-2 text-sm font-bold text-brand-sage hover:text-brand-dark transition-colors"
            >
              <Plus size={16} /> Añadir Miembro
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {equipo.map((miembro, index) => (
              <div key={miembro.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 relative group">
                <button 
                  onClick={() => removeMiembro(index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar miembro"
                >
                  <Trash2 size={16} />
                </button>
                
                <div className="mb-4 flex flex-col items-center">
                  <div className="relative w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-3 border-4 border-white shadow-sm flex items-center justify-center group/img cursor-pointer">
                    {miembro.imagen_url ? (
                      <img src={miembro.imagen_url} alt={miembro.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="text-gray-400" size={32} />
                    )}
                    <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer text-white">
                      <Upload size={16} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase">Subir Foto</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(index, e)} 
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Nombre</label>
                    <input 
                      type="text" 
                      value={miembro.nombre} 
                      onChange={(e) => handleEquipoChange(index, 'nombre', e.target.value)}
                      placeholder="Ej. Javier Sarango"
                      className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-sage outline-none bg-white font-semibold text-brand-dark" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Cargo</label>
                    <input 
                      type="text" 
                      value={miembro.cargo} 
                      onChange={(e) => handleEquipoChange(index, 'cargo', e.target.value)}
                      placeholder="Ej. Gerente General"
                      className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-sage outline-none bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Teléfono / WhatsApp</label>
                    <input 
                      type="text" 
                      value={miembro.telefono || ""} 
                      onChange={(e) => handleEquipoChange(index, 'telefono', e.target.value)}
                      placeholder="Ej. +593 999999999"
                      className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-sage outline-none bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Email</label>
                    <input 
                      type="email" 
                      value={miembro.email || ""} 
                      onChange={(e) => handleEquipoChange(index, 'email', e.target.value)}
                      placeholder="Ej. contacto@sara.com"
                      className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-sage outline-none bg-white" 
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {equipo.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                No hay miembros del equipo directivo registrados aún.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECCIÓN: CUENTAS BANCARIAS DE LA EMPRESA (AIRBNB & RESERVAS) */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-amber-500 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Building size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Cuentas Bancarias para Cobros & Reservas</h2>
              <p className="text-xs text-gray-500">
                Configura los datos de las cuentas bancarias que los clientes visualizarán para transferencias al reservar en <strong>Airbnb</strong>, comprar en <strong>Inmobiliaria</strong> o suscribirse a <strong>SaaS APU</strong>.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddCuenta}
            className="px-4 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus size={15} /> Agregar Cuenta Bancaria
          </button>
        </div>

        {/* Lista de Cuentas */}
        <div className="space-y-4">
          {cuentasBancarias.map((cta, index) => (
            <div key={cta.id || index} className="p-4 rounded-xl border border-gray-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-xs font-black uppercase text-amber-800 flex items-center gap-1.5">
                  <Building size={14} className="text-amber-600" /> Cuenta #{index + 1} — {cta.banco || "Nuevo Banco"}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveCuenta(cta.id)}
                  className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 p-1 cursor-pointer"
                >
                  <Trash2 size={13} /> Eliminar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Nombre del Banco */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Nombre del Banco</label>
                  <input
                    type="text"
                    value={cta.banco}
                    placeholder="Ej. Banco Pichincha"
                    onChange={(e) => handleCuentaChange(cta.id, "banco", e.target.value)}
                    className="w-full text-xs font-bold p-2 bg-white rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Tipo de Cuenta */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Tipo de Cta</label>
                  <select
                    value={cta.tipoCuenta}
                    onChange={(e) => handleCuentaChange(cta.id, "tipoCuenta", e.target.value as any)}
                    className="w-full text-xs font-bold p-2 bg-white rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Corriente">Cta. Corriente</option>
                    <option value="Ahorros">Cta. de Ahorros</option>
                  </select>
                </div>

                {/* Número de Cuenta */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Nro de Cta</label>
                  <input
                    type="text"
                    value={cta.numeroCuenta}
                    placeholder="Ej. 2100239485"
                    onChange={(e) => handleCuentaChange(cta.id, "numeroCuenta", e.target.value)}
                    className="w-full text-xs font-mono font-bold p-2 bg-white rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Cédula o RUC */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Cédula / RUC</label>
                  <input
                    type="text"
                    value={cta.cedulaRuc}
                    placeholder="Ej. 0190458923001"
                    onChange={(e) => handleCuentaChange(cta.id, "cedulaRuc", e.target.value)}
                    className="w-full text-xs font-mono font-bold p-2 bg-white rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Beneficiario / Titular */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Beneficiario / Titular</label>
                  <input
                    type="text"
                    value={cta.beneficiario}
                    placeholder="Ej. SARA CONSTRUCTORA CIA. LTDA."
                    onChange={(e) => handleCuentaChange(cta.id, "beneficiario", e.target.value)}
                    className="w-full text-xs font-medium p-2 bg-white rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Correo para Comprobantes */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Correo para Comprobantes</label>
                  <input
                    type="email"
                    value={cta.correoComprobantes || ""}
                    placeholder="Ej. pagos@saraconstructora.com"
                    onChange={(e) => handleCuentaChange(cta.id, "correoComprobantes", e.target.value)}
                    className="w-full text-xs font-medium p-2 bg-white rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                  {/* Código QR */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Código QR de Pago</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            try {
                              const { createClient } = await import("@/lib/supabase/client")
                              const supabase = createClient()
                              const fileExt = file.name.split('.').pop()
                              const fileName = `qr-${cta.id}-${Date.now()}.${fileExt}`
                              
                              // Asumimos que guardamos en sara-assets/qrs
                              const { error: uploadErr } = await supabase.storage.from('sara-assets').upload(`qrs/${fileName}`, file)
                              if (uploadErr) throw uploadErr
                              
                              const { data } = supabase.storage.from('sara-assets').getPublicUrl(`qrs/${fileName}`)
                              handleCuentaChange(cta.id, "qrUrl", data.publicUrl)
                            } catch (err) {
                              console.error("Error subiendo QR", err)
                              alert("No se pudo subir la imagen del QR.")
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-full text-xs font-bold p-2 bg-white rounded-lg border border-dashed border-amber-300 text-amber-700 flex items-center justify-center gap-2 hover:bg-amber-50 transition-colors">
                          <Upload size={14} />
                          {cta.qrUrl ? "Cambiar Imagen QR" : "Subir Imagen QR"}
                        </div>
                      </div>
                      {cta.qrUrl && (
                        <a href={cta.qrUrl} target="_blank" className="p-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600" title="Ver QR">
                          <LinkIcon size={14} />
                        </a>
                      )}
                    </div>
                  </div>

              </div>
            </div>
          ))}

          {cuentasBancarias.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <Building className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-sm font-bold text-gray-600">No hay cuentas bancarias registradas aún</p>
              <p className="text-xs text-gray-400 mt-1">Haz clic en "+ Agregar Cuenta Bancaria" para configurar los datos de cobro oficiales.</p>
            </div>
          )}
        </div>
      </div>

      {/* Selector de Temas */}
      <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage overflow-hidden mt-6">
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Palette size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Apariencia y Tema (Administrador)</h2>
              <p className="text-xs text-gray-500">Personaliza la paleta cromática de la suite administrativa de SARA Constructora</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            6 Estilos Disponibles
          </span>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              id: '',
              name: 'Sara Sage',
              category: 'Corporativo Oficial',
              desc: 'Verde esmeralda y bosque profundo característico de SARA',
              c1: '#07130d',
              c2: '#3c7a52',
              c3: '#f4fbf6',
              accentRing: 'ring-emerald-500'
            },
            {
              id: 'theme-sunset',
              name: 'Zafiro & Naranja',
              category: 'Contraste Moderno',
              desc: 'Azul zafiro ejecutivo combinado con naranja dinámico de alta visibilidad',
              c1: '#0f172a',
              c2: '#ea580c',
              c3: '#fff7ed',
              accentRing: 'ring-orange-500'
            },
            {
              id: 'theme-ocean',
              name: 'Constructor Ocean',
              category: 'Técnico Marítimo',
              desc: 'Tonos azul pizarra y cobalto brillante para ingeniería y planos',
              c1: '#1e293b',
              c2: '#3b82f6',
              c3: '#eff6ff',
              accentRing: 'ring-blue-500'
            },
            {
              id: 'theme-nordic',
              name: 'Nórdico Glaciar',
              category: 'Glaciar Minimal',
              desc: 'Aguamarina ártica y turquesa glaciar de balance cromático limpio',
              c1: '#042f2e',
              c2: '#06b6d4',
              c3: '#ecfeff',
              accentRing: 'ring-cyan-500'
            },
            {
              id: 'theme-ruby',
              name: 'Titanio & Rubí',
              category: 'Lujo Vanguardista',
              desc: 'Base zinc y carbón mate con acentos rubí neón de alto impacto',
              c1: '#18181b',
              c2: '#e11d48',
              c3: '#fff1f2',
              accentRing: 'ring-rose-500'
            },
            {
              id: 'theme-gold',
              name: 'Elegante Dark',
              category: 'Premium Dorado',
              desc: 'Negro obsidian de máximo contraste con sutil oro metálico',
              c1: '#171717',
              c2: '#d4af37',
              c3: '#fefce8',
              accentRing: 'ring-yellow-500'
            },
          ].map((theme) => {
            const isActive = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => changeTheme(theme.id)}
                className={`relative group text-left p-4 rounded-xl border-2 transition-all duration-200 flex flex-col justify-between hover:shadow-md ${
                  isActive 
                    ? 'border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-500/20 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {isActive && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    <Check size={12} strokeWidth={3} />
                    <span>Activo</span>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex -space-x-1.5 p-1 rounded-lg bg-gray-100/80 border border-gray-200">
                      <div className="w-5 h-5 rounded-full shadow-sm border border-white" style={{ backgroundColor: theme.c1 }} title="Color Primario" />
                      <div className="w-5 h-5 rounded-full shadow-sm border border-white" style={{ backgroundColor: theme.c2 }} title="Color Acento" />
                      <div className="w-5 h-5 rounded-full shadow-sm border border-white" style={{ backgroundColor: theme.c3 }} title="Color Fondo Suave" />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{theme.category}</span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                    {theme.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {theme.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-400 text-[11px]">Vista previa:</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-8 rounded-sm" style={{ backgroundColor: theme.c1 }} />
                    <div className="h-3 w-12 rounded-sm" style={{ backgroundColor: theme.c2 }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  )
}
