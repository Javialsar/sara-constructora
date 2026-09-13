"use client"
import { useState, useEffect } from "react"
import { Settings, Shield, Bell, Key, Save, Camera, Plus, Trash2, Link as LinkIcon, Phone, MapPin, Mail, Loader2, Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface MiembroEquipo {
  id: string
  nombre: string
  cargo: string
  imagen_url: string
}

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const [configId, setConfigId] = useState(1)

  const [formData, setFormData] = useState({
    nombre_empresa: "",
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

  const addMiembro = () => {
    setEquipo([...equipo, { id: Date.now().toString(), nombre: "", cargo: "", imagen_url: "" }])
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
    const { error } = await supabase
      .from('configuracion_empresa')
      .update({
        ...formData,
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
