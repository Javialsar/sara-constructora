"use client"
import { useState, useEffect } from "react"
import { Settings, Shield, Bell, Key, Save, Camera, Plus, Trash2, Link as LinkIcon, Phone, MapPin, Mail, Loader2, Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

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
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    loadConfig()
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

  const changeTheme = (themeClass: string) => {
    document.documentElement.classList.remove('theme-ocean', 'theme-gold', 'theme-apucons')
    if (themeClass) {
      document.documentElement.classList.add(themeClass)
    }
    localStorage.setItem('sara_theme', themeClass)
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
    let finalLogoUrl = formData.logo_url;

    if (logoFile) {
      setUploadingLogo(true)
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `logo-${Date.now()}.${fileExt}`
      const filePath = `identidad/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('sara-assets')
        .upload(filePath, logoFile)

      if (uploadError) {
        alert("Error subiendo el logo: " + uploadError.message)
        setUploadingLogo(false)
        setSaving(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('sara-assets')
        .getPublicUrl(filePath)
      
      finalLogoUrl = publicUrl
      setUploadingLogo(false)
      setFormData(prev => ({ ...prev, logo_url: publicUrl }))
    }

    const { error } = await supabase
      .from('configuracion_empresa')
      .update({
        ...formData,
        logo_url: finalLogoUrl,
        equipo_directivo: equipo
      })
      .eq('id', configId)

    setSaving(false)
    if (error) {
      alert("Error al guardar: " + error.message)
    } else {
      alert("Configuración guardada exitosamente.")
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 rounded-lg bg-brand-dark flex items-center justify-center text-brand-sage">
            <Camera size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Identidad Visual</h2>
        </div>
        <div className="flex items-center gap-8">
          {/* Preview del logo actual */}
          <div className="w-48 h-32 bg-brand-dark rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden">
            {logoFile ? (
              <img src={URL.createObjectURL(logoFile)} alt="Nuevo Logo" className="max-w-full max-h-full object-contain p-2" />
            ) : formData.logo_url ? (
              <img src={formData.logo_url} alt="Logo Actual" className="max-w-full max-h-full object-contain p-2" />
            ) : (
              <span className="text-gray-400 text-sm">Sin Logo</span>
            )}
            {uploadingLogo && (
              <div className="absolute inset-0 bg-brand-dark/80 flex items-center justify-center">
                <Loader2 className="animate-spin text-brand-sage" size={24} />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">Logotipo de la Empresa</label>
            <p className="text-xs text-gray-500 mb-4">Sube el logotipo oficial (formato PNG con fondo transparente recomendado). Se actualizará en toda la plataforma (Menús, Footer, Hero, etc).</p>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setLogoFile(e.target.files[0])
                }
              }}
              className="w-full max-w-sm border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-sage/10 file:text-brand-dark hover:file:bg-brand-sage/20 cursor-pointer"
            />
          </div></div>

      {/* Selector de Temas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Settings size={18} />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Apariencia y Tema (Administrador)</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <button onClick={() => changeTheme('')} className="flex flex-col gap-2 items-center text-center p-4 rounded-xl border-2 hover:border-brand-sage transition-all border-gray-200">
            <div className="flex gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-[#07130d]"></div>
              <div className="w-6 h-6 rounded-full bg-[#3c7a52]"></div>
            </div>
            <span className="font-bold text-gray-800">Sara Sage</span>
            <span className="text-xs text-gray-500">Tema Corporativo (Por defecto)</span>
          </button>

          <button onClick={() => changeTheme('theme-ocean')} className="flex flex-col gap-2 items-center text-center p-4 rounded-xl border-2 hover:border-blue-500 transition-all border-gray-200">
            <div className="flex gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-[#1e293b]"></div>
              <div className="w-6 h-6 rounded-full bg-[#3b82f6]"></div>
            </div>
            <span className="font-bold text-gray-800">Constructor Ocean</span>
            <span className="text-xs text-gray-500">Tonos azules y grises técnicos</span>
          </button>

          <button onClick={() => changeTheme('theme-gold')} className="flex flex-col gap-2 items-center text-center p-4 rounded-xl border-2 hover:border-yellow-500 transition-all border-gray-200">
            <div className="flex gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-[#171717]"></div>
              <div className="w-6 h-6 rounded-full bg-[#d4af37]"></div>
            </div>
            <span className="font-bold text-gray-800">Elegante Dark</span>
            <span className="text-xs text-gray-500">Oscuro alto contraste con dorado</span>
          </button>
        </div>
      </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Información de Contacto */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  )
}
