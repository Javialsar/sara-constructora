"use client"
import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Building2, Search, Plus, Globe, CheckCircle2, Loader2, Link as LinkIcon, Trash2, Edit, X } from "lucide-react"

export default function MisProveedores() {
  const [tab, setTab] = useState<'mis-proveedores' | 'catalogo'>('mis-proveedores')
  const [misProveedores, setMisProveedores] = useState<any[]>([])
  const [catalogoGlobal, setCatalogoGlobal] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ id: "", razon_social: "", ruc: "", direccion: "", telefono: "", sitio_web: "" })
  const [isEditing, setIsEditing] = useState(false)

  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Mis proveedores
      const { data: mis } = await supabase.from("proveedores").select("*").eq("user_id", user.id).order('razon_social', { ascending: true })
      if (mis) setMisProveedores(mis)

      // Catalogo Global
      const { data: global } = await supabase.from("proveedores").select("*").is("user_id", null).order('razon_social', { ascending: true })
      if (global) setCatalogoGlobal(global)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddFromGlobal = async (prov: any) => {
    if (confirm(`¿Agregar ${prov.razon_social} a tus proveedores?`)) {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from("proveedores").insert({
        razon_social: prov.razon_social,
        ruc: prov.ruc,
        direccion: prov.direccion,
        telefono: prov.telefono,
        email: prov.email,
        sitio_web: prov.sitio_web,
        logo_url: prov.logo_url,
        estado: true,
        user_id: user?.id
      })
      if (!error) {
        alert("¡Proveedor agregado exitosamente a tu lista!")
        setTab('mis-proveedores')
        fetchData()
      } else {
        alert("Error al agregar: " + error.message)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este proveedor de tu lista?")) {
      await supabase.from("proveedores").delete().eq("id", id)
      fetchData()
    }
  }

  const openCreate = () => {
    setFormData({ id: "", razon_social: "", ruc: "", direccion: "", telefono: "", sitio_web: "" })
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const openEdit = (p: any) => {
    setFormData({ id: p.id, razon_social: p.razon_social, ruc: p.ruc || "", direccion: p.direccion || "", telefono: p.telefono || "", sitio_web: p.sitio_web || "" })
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (isEditing) {
      const { error } = await supabase.from("proveedores").update({
        razon_social: formData.razon_social,
        ruc: formData.ruc,
        direccion: formData.direccion,
        telefono: formData.telefono,
        sitio_web: formData.sitio_web
      }).eq("id", formData.id)
      
      if (!error) { setIsModalOpen(false); fetchData(); }
    } else {
      const { error } = await supabase.from("proveedores").insert({
        razon_social: formData.razon_social,
        ruc: formData.ruc,
        direccion: formData.direccion,
        telefono: formData.telefono,
        sitio_web: formData.sitio_web,
        user_id: user?.id,
        estado: true
      })
      
      if (!error) { setIsModalOpen(false); fetchData(); }
    }
    setIsSubmitting(false)
  }

  const filteredGlobal = catalogoGlobal.filter(p => p.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="p-4 sm:p-8 w-full w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="text-emerald-500" />
            Directorio de Proveedores
          </h1>
          <p className="text-slate-500 mt-1">Gestiona tus proveedores o importa desde el catálogo global.</p>
        </div>
        <button onClick={openCreate} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all">
          <Plus size={20} /> Nuevo Proveedor
        </button>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl mb-6 max-w-md">
        <button onClick={() => setTab('mis-proveedores')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tab === 'mis-proveedores' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          Mis Proveedores ({misProveedores.length})
        </button>
        <button onClick={() => setTab('catalogo')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${tab === 'catalogo' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <Globe size={16} /> Catálogo Global
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
      ) : (
        <>
          {tab === 'mis-proveedores' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {misProveedores.length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl p-8 text-center border border-slate-200">
                  <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Building2 className="text-slate-400" size={24} /></div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No tienes proveedores</h3>
                  <p className="text-slate-500 mb-6">Puedes crear uno nuevo o importar desde el catálogo global.</p>
                  <button onClick={() => setTab('catalogo')} className="text-emerald-600 font-bold hover:underline">Explorar Catálogo</button>
                </div>
              ) : (
                misProveedores.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      {p.logo_url ? (
                        <div className="w-16 h-16 bg-slate-50 rounded-lg p-2 border border-slate-100 flex items-center justify-center shrink-0">
                          <img src={p.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                          <Building2 size={24} />
                        </div>
                      )}
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 line-clamp-2 min-h-[48px]">{p.razon_social}</h3>
                    <div className="mt-auto pt-4 space-y-2 text-sm text-slate-500">
                      {p.telefono && <p>📞 {p.telefono}</p>}
                      {p.sitio_web && <a href={p.sitio_web} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-emerald-600 hover:underline"><LinkIcon size={14} /> {new URL(p.sitio_web).hostname.replace('www.','')}</a>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'catalogo' && (
            <div className="space-y-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" placeholder="Buscar en catálogo oficial..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredGlobal.map(p => {
                  // Verificar si ya lo tiene agregado
                  const yaAgregado = misProveedores.some(mi => mi.razon_social === p.razon_social)
                  
                  return (
                    <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col items-center text-center">
                      {p.logo_url ? (
                        <div className="h-20 w-full mb-4 flex items-center justify-center p-2">
                          <img src={p.logo_url} alt="Logo" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                        </div>
                      ) : (
                        <div className="h-20 w-20 mb-4 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                          <Building2 size={32} />
                        </div>
                      )}
                      <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2 min-h-[40px]">{p.razon_social}</h4>
                      <p className="text-[10px] text-slate-400 mb-4 uppercase tracking-wider">{p.sitio_web ? new URL(p.sitio_web).hostname.replace('www.','') : 'PROVEEDOR OFICIAL'}</p>
                      
                      <div className="mt-auto w-full">
                        {yaAgregado ? (
                          <div className="w-full py-2.5 bg-slate-50 text-emerald-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1">
                            <CheckCircle2 size={14} /> Ya en tu lista
                          </div>
                        ) : (
                          <button onClick={() => handleAddFromGlobal(p)} className="w-full py-2.5 border border-slate-200 hover:border-emerald-500 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs font-bold rounded-xl transition-all">
                            + Añadir a mis proveedores
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Custom */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-black text-slate-900">{isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Razón Social *</label>
                <input required type="text" value={formData.razon_social} onChange={e => setFormData({...formData, razon_social: e.target.value})} className="w-full border-slate-300 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">RUC</label>
                  <input type="text" value={formData.ruc} onChange={e => setFormData({...formData, ruc: e.target.value})} className="w-full border-slate-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono</label>
                  <input type="text" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className="w-full border-slate-300 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dirección</label>
                <input type="text" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} className="w-full border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sitio Web</label>
                <input type="url" value={formData.sitio_web} onChange={e => setFormData({...formData, sitio_web: e.target.value})} className="w-full border-slate-300 rounded-lg text-sm" placeholder="https://" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Guardando...' : 'Guardar Proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
