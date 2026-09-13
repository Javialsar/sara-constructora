"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, MapPin, Building2, Pencil, Trash2, X } from "lucide-react"

export default function AdminProyectos() {
  const supabase = createClient()
  const [proyectos, setProyectos] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [editId, setEditId] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  const [formData, setFormData] = useState({
    nombre: "",
    ubicacion: "",
    descripcion: "",
    estado: "en_diseno",
    latitud: "",
    longitud: "",
    cliente_id: "",
    imagen_url: "",
    destacado: false
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    // Cargar proyectos
    const { data: dataProyectos, error: errProyectos } = await supabase
      .from("proyectos")
      .select(`*, clientes (nombre, apellido)`)
      .order('created_at', { ascending: false })
      
    if (dataProyectos) setProyectos(dataProyectos)
    
    // Cargar clientes para el selector
    const { data: dataClientes } = await supabase
      .from("clientes")
      .select("id, nombre, apellido")
      
    if (dataClientes) setClientes(dataClientes)
    
    setLoading(false)
  }

  const openNewModal = () => {
    setEditId(null)
    setFile(null)
    setFormData({ nombre: "", ubicacion: "", descripcion: "", estado: "en_diseno", latitud: "", longitud: "", cliente_id: "", imagen_url: "", destacado: false })
    setIsModalOpen(true)
  }

  const handleEdit = (p: any) => {
    setEditId(p.id)
    setFile(null)
    setFormData({
      nombre: p.nombre,
      ubicacion: p.ubicacion,
      descripcion: p.descripcion || "",
      estado: p.estado,
      latitud: p.latitud ? p.latitud.toString() : "",
      longitud: p.longitud ? p.longitud.toString() : "",
      cliente_id: p.cliente_id || "",
      imagen_url: p.imagen_url || "",
      destacado: p.destacado || false
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este proyecto?")) return;
    
    setProyectos(proyectos.filter(p => p.id !== id)) // Optimistic update
    const { error } = await supabase.from("proyectos").delete().eq("id", id)
    if (error) {
      alert("Error al eliminar el proyecto: " + error.message)
      fetchData() // Revert on error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let finalUrl = formData.imagen_url;

    if (file) {
      setUploadingFile(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `portadas/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avances')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        alert("Error al subir la imagen: " + uploadError.message)
        setUploadingFile(false)
        return
      }
      
      const { data: publicUrlData } = supabase.storage.from('avances').getPublicUrl(filePath)
      finalUrl = publicUrlData.publicUrl
      setUploadingFile(false)
    }

    const payload = {
      nombre: formData.nombre,
      ubicacion: formData.ubicacion,
      descripcion: formData.descripcion,
      estado: formData.estado,
      latitud: formData.latitud ? parseFloat(formData.latitud) : null,
      longitud: formData.longitud ? parseFloat(formData.longitud) : null,
      cliente_id: formData.cliente_id || null,
      imagen_url: finalUrl,
      destacado: formData.destacado
    }

    let error;
    if (editId) {
      const { error: err } = await supabase.from("proyectos").update(payload).eq("id", editId)
      error = err;
    } else {
      const { error: err } = await supabase.from("proyectos").insert([payload])
      error = err;
    }
    
    if (!error) {
      setIsModalOpen(false)
      fetchData()
    } else {
      alert("Error al guardar el proyecto: " + error.message)
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'en_diseno': return 'bg-yellow-100 text-yellow-800'
      case 'en_construccion': return 'bg-blue-100 text-blue-800'
      case 'finalizado': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'en_diseno': return 'En Diseño'
      case 'en_construccion': return 'En Construcción'
      case 'finalizado': return 'Finalizado'
      default: return estado
    }
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Proyectos</h2>
          <p className="text-gray-500 text-sm mt-1">Administra todas las obras y ubícalas en el mapa.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="flex items-center gap-2 bg-brand-dark hover:bg-brand-sage hover:text-brand-dark text-white px-4 py-2 rounded-lg font-bold transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Proyecto</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-dark"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold">Proyecto</th>
                  <th className="px-6 py-4 font-bold">Cliente</th>
                  <th className="px-6 py-4 font-bold">Ubicación</th>
                  <th className="px-6 py-4 font-bold">Estado</th>
                  <th className="px-6 py-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {proyectos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      <Building2 size={48} className="mx-auto mb-3 opacity-20" />
                      <p>No hay proyectos registrados aún.</p>
                    </td>
                  </tr>
                ) : (
                  proyectos.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900">{p.nombre}</p>
                          {p.destacado && (
                            <span className="text-yellow-500 text-xs flex items-center bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200" title="Destacado en Landing Page">
                              ★ Destacado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">
                        {p.clientes ? `${p.clientes.nombre} ${p.clientes.apellido}` : <span className="text-gray-400 italic">Sin asignar</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-brand-sage" />
                          <span>{p.ubicacion}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(p.estado)}`}>
                          {getStatusLabel(p.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => handleEdit(p)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Proyecto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[95vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <h3 className="text-xl font-bold text-brand-dark">{editId ? "Editar Proyecto" : "Crear Nuevo Proyecto"}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700">Nombre del Proyecto *</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Ej. Casa Familia Pérez"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700">Cliente Asignado</label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none bg-white"
                      value={formData.cliente_id}
                      onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
                    >
                      <option value="">-- Ninguno (Proyecto Público) --</option>
                      {clientes.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700">Ciudad / Sector *</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Ej. Machala, El Oro"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none"
                      value={formData.ubicacion}
                      onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700">Descripción del Proyecto</label>
                    <textarea 
                      rows={4}
                      placeholder="Describe los detalles del proyecto, tipo de edificación, metros cuadrados..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none resize-none"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700">Fotografía Principal del Proyecto</label>
                    <p className="text-xs text-gray-500 mb-2">Esta imagen se mostrará en la página principal y en las tarjetas.</p>
                    
                    {formData.imagen_url && !file && (
                      <div className="mb-2 relative w-32 h-24 rounded-lg overflow-hidden border border-gray-200">
                        <img src={formData.imagen_url} alt="Portada" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, imagen_url: ""})}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}

                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setFile(e.target.files[0])
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-sage/10 file:text-brand-dark hover:file:bg-brand-sage/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700">Estado Actual</label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none bg-white"
                      value={formData.estado}
                      onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    >
                      <option value="en_diseno">En Diseño</option>
                      <option value="en_construccion">En Construcción</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                  </div>

                  <div className="space-y-1 flex flex-col justify-center mt-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-brand-sage rounded border-gray-300 focus:ring-brand-sage"
                        checked={formData.destacado}
                        onChange={(e) => setFormData({...formData, destacado: e.target.checked})}
                      />
                      <span className="text-sm font-bold text-gray-700">Mostrar en Landing Page (Destacado)</span>
                    </label>
                  </div>

                  <div className="space-y-1 md:col-span-2 mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-bold text-brand-dark mb-2">Coordenadas del Mapa</h4>
                    <p className="text-xs text-gray-500 mb-4">Ingresa las coordenadas de Google Maps para que aparezca en el mapa de proyectos (opcional).</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700">Latitud</label>
                        <input 
                          type="text" 
                          placeholder="Ej. -4.3276"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none"
                          value={formData.latitud}
                          onChange={(e) => setFormData({...formData, latitud: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700">Longitud</label>
                        <input 
                          type="text" 
                          placeholder="Ej. -79.5447"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none"
                          value={formData.longitud}
                          onChange={(e) => setFormData({...formData, longitud: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                  disabled={uploadingFile}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={uploadingFile}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold bg-brand-dark text-white hover:bg-brand-sage hover:text-brand-dark transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {uploadingFile ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    editId ? "Guardar Cambios" : "Guardar Proyecto"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
