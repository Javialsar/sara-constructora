"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Users, Mail, Phone, ShieldCheck, ShieldAlert, MoreVertical, Edit, Trash2, Image as ImageIcon, X } from "lucide-react"
import { createClientAccount } from "./actions"

export default function AdminClientes() {
  const supabase = createClient()
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditDataModalOpen, setIsEditDataModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    usuario: "",
    password: "",
    imagen_url: ""
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order('created_at', { ascending: false })
      
    if (data) setClientes(data)
    setLoading(false)
  }

  const toggleEstado = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo'
    
    // Optimistic update
    setClientes(clientes.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c))

    const { error } = await supabase
      .from("clientes")
      .update({ estado: nuevoEstado })
      .eq("id", id)

    if (error) {
      alert("Error al actualizar el estado: " + error.message)
      fetchData() // revert on error
    }
  }

  const getStatusStyle = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactivo': return 'bg-red-100 text-red-800 border-red-200'
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Directorio de Clientes</h2>
          <p className="text-gray-500 text-sm mt-1">Administra los usuarios registrados en el portal privado.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ nombre: "", apellido: "", email: "", telefono: "", usuario: "", password: "", imagen_url: "" })
            setIsCreateModalOpen(true)
          }}
          className="bg-brand-dark text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <span>+ Nuevo Cliente</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-dark"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 divide-y divide-gray-200">
              <thead className="bg-slate-100 text-slate-700 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-bold">Cliente</th>
                  <th className="px-6 py-4 font-bold">Contacto</th>
                  <th className="px-6 py-4 font-bold">Fecha de Registro</th>
                  <th className="px-6 py-4 font-bold">Estado</th>
                  <th className="px-6 py-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clientes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      <Users size={48} className="mx-auto mb-3 opacity-20" />
                      <p>No hay clientes registrados aún.</p>
                    </td>
                  </tr>
                ) : (
                  clientes.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-sage flex items-center justify-center font-bold text-brand-dark shrink-0">
                            {c.nombre.charAt(0)}{c.apellido.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{c.nombre} {c.apellido}</p>
                            <p className="text-xs text-gray-400">Usuario: {c.usuario}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={14} className="text-brand-sage" />
                          <a href={`mailto:${c.email}`} className="hover:text-brand-dark">{c.email}</a>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={14} className="text-brand-sage" />
                          <a href={`tel:${c.telefono}`} className="hover:text-brand-dark">{c.telefono}</a>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-500">
                        {new Date(c.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleEstado(c.id, c.estado)}
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors hover:opacity-80 ${getStatusStyle(c.estado)}`}
                          title="Clic para cambiar estado"
                        >
                          {c.estado}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            setEditId(c.id)
                            setFormData({
                              nombre: c.nombre,
                              apellido: c.apellido,
                              email: c.email, // Readonly en editar
                              telefono: c.telefono,
                              usuario: c.usuario,
                              password: "",
                              imagen_url: c.imagen_url || ""
                            })
                            setIsEditDataModalOpen(true)
                          }}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Editar Datos del Cliente"
                        >
                          <Edit size={16} />
                        </button>

                        <button 
                          onClick={() => {
                            setEditId(c.id)
                            setFormData({
                              nombre: c.nombre,
                              apellido: c.apellido,
                              email: c.email,
                              telefono: c.telefono,
                              usuario: c.usuario,
                              password: c.password,
                              imagen_url: c.imagen_url || ""
                            })
                            setFile(null)
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-brand-sage bg-brand-sage/10 hover:bg-brand-sage/20 rounded-lg transition-colors"
                          title="Subir Logo"
                        >
                          <ImageIcon size={16} />
                        </button>
                        
                        <button 
                          onClick={async () => {
                            if (window.confirm("¿Estás seguro de que deseas eliminar este cliente? Se eliminarán todos sus datos y no podrá acceder al portal. Si tiene proyectos activos, primero debes eliminarlos.")) {
                              const { error } = await supabase.from('clientes').delete().eq('id', c.id)
                              if (error) {
                                alert("Error al eliminar cliente: " + error.message)
                              } else {
                                fetchData()
                              }
                            }
                          }}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="Eliminar Cliente"
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

      {/* Modal Logo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-brand-dark">Logo del Cliente</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <span className="text-xl">×</span>
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault()
              let finalUrl = formData.imagen_url;

              if (file) {
                setUploadingFile(true)
                const fileExt = file.name.split('.').pop()
                const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
                const filePath = `logos/${fileName}`

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

              const { error: err } = await supabase.from("clientes").update({ imagen_url: finalUrl }).eq("id", editId)
              
              if (!err) {
                setIsModalOpen(false)
                fetchData()
              } else {
                alert("Error al guardar logo: " + err.message)
              }
            }} className="p-6">
              
              <div className="space-y-4 mb-6">
                <p className="text-sm text-gray-500">
                  Sube el logotipo o foto de la empresa/cliente que se mostrará en la sección "Nuestros Clientes".
                </p>
                
                {formData.imagen_url && !file && (
                  <div className="mb-2 relative w-32 h-32 mx-auto rounded-lg overflow-hidden border border-gray-200">
                    <img src={formData.imagen_url} alt="Logo" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, imagen_url: ""})}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <span className="text-xs px-1">×</span>
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
              
              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
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
                  {uploadingFile ? "Subiendo..." : "Guardar Logo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Cliente */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-brand-dark">Crear Cuenta de Cliente</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <span className="text-xl">×</span>
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault()
              setIsSubmitting(true)
              
              const res = await createClientAccount({
                nombre: formData.nombre,
                apellido: formData.apellido,
                email: formData.email,
                telefono: formData.telefono,
                password: formData.password
              })

              setIsSubmitting(false)
              if (res.success) {
                setIsCreateModalOpen(false)
                fetchData() // Refresh list
                alert("Cliente creado correctamente y listo para iniciar sesión.")
              } else {
                alert("Error al crear cliente: " + res.error)
              }
            }} className="p-6">
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre *</label>
                  <input required type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none bg-white" placeholder="Ej. Carlos" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Apellido *</label>
                  <input required type="text" value={formData.apellido} onChange={(e) => setFormData({...formData, apellido: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none bg-white" placeholder="Ej. Mendoza" />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico *</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none bg-white" placeholder="carlos@empresa.com" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono / WhatsApp</label>
                <input type="text" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none bg-white" placeholder="Ej. 098 765 4321" />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña Temporal *</label>
                <input required type="text" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none bg-white" placeholder="Ej. Sara2026" />
                <p className="text-xs text-gray-400 mt-1">Comparte esta clave con el cliente. Podrá cambiarla desde su panel.</p>
              </div>
              
              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors" disabled={isSubmitting}>Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-lg text-sm font-bold bg-brand-dark text-white hover:bg-brand-sage hover:text-brand-dark transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? "Creando..." : "Crear Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Datos del Cliente */}
      {isEditDataModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-brand-dark">Editar Datos del Cliente</h3>
              <button onClick={() => setIsEditDataModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault()
              setIsSubmitting(true)
              
              const { error } = await supabase.from('clientes').update({
                nombre: formData.nombre,
                apellido: formData.apellido,
                telefono: formData.telefono
              }).eq('id', editId)

              setIsSubmitting(false)
              if (!error) {
                setIsEditDataModalOpen(false)
                fetchData() // Refresh list
              } else {
                alert("Error al actualizar cliente: " + error.message)
              }
            }} className="p-6">
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre *</label>
                  <input required type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none bg-white" placeholder="Ej. Carlos" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Apellido *</label>
                  <input required type="text" value={formData.apellido} onChange={(e) => setFormData({...formData, apellido: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none bg-white" placeholder="Ej. Mendoza" />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico (No modificable aquí)</label>
                <input type="email" value={formData.email} disabled className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono / WhatsApp</label>
                <input type="text" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none bg-white" placeholder="Ej. 098 765 4321" />
              </div>
              
              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditDataModalOpen(false)} className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors" disabled={isSubmitting}>Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-lg text-sm font-bold bg-brand-dark text-white hover:bg-brand-sage hover:text-brand-dark transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
