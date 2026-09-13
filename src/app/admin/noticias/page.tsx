"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Newspaper, Pencil, Trash2, X, Eye, Check } from "lucide-react"
import Link from "next/link"

export default function AdminNoticias() {
  const supabase = createClient()
  const [articulos, setArticulos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  const [formData, setFormData] = useState({
    titulo: "",
    slug: "",
    categoria: "Ingeniería",
    resumen: "",
    contenido: "",
    estado: "borrador",
    imagen_url: ""
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("articulos_blog")
      .select("*")
      .order('created_at', { ascending: false })
      
    if (data) setArticulos(data)
    setLoading(false)
  }

  const generateSlug = (text: string) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData({
      ...formData,
      titulo: title,
      slug: editId ? formData.slug : generateSlug(title)
    })
  }

  const openNewModal = () => {
    setEditId(null)
    setFile(null)
    setFormData({ titulo: "", slug: "", categoria: "Ingeniería", resumen: "", contenido: "", estado: "borrador", imagen_url: "" })
    setIsModalOpen(true)
  }

  const openEditModal = (articulo: any) => {
    setEditId(articulo.id)
    setFile(null)
    setFormData({ 
      titulo: articulo.titulo, 
      slug: articulo.slug, 
      categoria: articulo.categoria || "Ingeniería", 
      resumen: articulo.resumen || "", 
      contenido: articulo.contenido, 
      estado: articulo.estado, 
      imagen_url: articulo.imagen_url || "" 
    })
    setIsModalOpen(true)
  }

  const uploadImage = async () => {
    if (!file) return formData.imagen_url
    setUploadingFile(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `noticias/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('public')
      .upload(filePath, file)

    if (uploadError) {
      alert("Error al subir imagen")
      setUploadingFile(false)
      return formData.imagen_url
    }

    const { data } = supabase.storage.from('public').getPublicUrl(filePath)
    setUploadingFile(false)
    return data.publicUrl
  }

  const saveArticulo = async () => {
    if (!formData.titulo || !formData.slug || !formData.contenido) {
      alert("El título, slug y contenido son requeridos")
      return
    }

    const imgUrl = await uploadImage()
    const payload: any = {
      ...formData,
      imagen_url: imgUrl,
      fecha_publicacion: formData.estado === 'publicado' ? new Date().toISOString() : null
    }

    if (editId) {
      // Si ya estaba publicado, no sobreescribir la fecha
      const existing = articulos.find(a => a.id === editId)
      if (existing?.estado === 'publicado') {
        delete payload.fecha_publicacion
      }
      
      const { error } = await supabase.from('articulos_blog').update(payload).eq('id', editId)
      if (error) alert(error.message)
    } else {
      const { error } = await supabase.from('articulos_blog').insert([payload])
      if (error) alert(error.message)
    }

    setIsModalOpen(false)
    fetchData()
  }

  const toggleEstado = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'publicado' ? 'borrador' : 'publicado'
    const payload: any = { estado: nuevoEstado }
    
    if (nuevoEstado === 'publicado') {
      payload.fecha_publicacion = new Date().toISOString()
    }
    
    await supabase.from('articulos_blog').update(payload).eq('id', id)
    fetchData()
  }

  const deleteArticulo = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este artículo?")) {
      await supabase.from('articulos_blog').delete().eq('id', id)
      fetchData()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blog y Noticias</h1>
          <p className="text-gray-500 text-sm">Gestiona los artículos y novedades publicados en la web.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-brand-sage text-brand-dark px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-brand-sage/90 transition-colors"
        >
          <Plus size={20} /> Nuevo Artículo
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando artículos...</div>
        ) : articulos.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Newspaper size={48} className="mb-4 text-gray-300" />
            <p>No hay artículos redactados aún.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="p-4 font-medium">Artículo</th>
                  <th className="p-4 font-medium">Categoría</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4 font-medium">Fecha</th>
                  <th className="p-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articulos.map((art) => (
                  <tr key={art.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {art.imagen_url ? (
                          <img src={art.imagen_url} alt="" className="w-12 h-12 rounded object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                            <Newspaper size={20} />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-gray-800">{art.titulo}</div>
                          <div className="text-xs text-gray-400">/{art.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{art.categoria}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => toggleEstado(art.id, art.estado)}
                        className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${art.estado === 'publicado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                      >
                        {art.estado === 'publicado' ? <Check size={12} /> : <Eye size={12} />}
                        {art.estado}
                      </button>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(art.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {art.estado === 'publicado' && (
                          <Link href={`/noticias/${art.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-brand-sage transition-colors" title="Ver en la web">
                            <Eye size={18} />
                          </Link>
                        )}
                        <button onClick={() => openEditModal(art)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => deleteArticulo(art.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-dark/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full my-8 flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-gray-800">{editId ? 'Editar Artículo' : 'Nuevo Artículo'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Columna Principal */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Título del Artículo</label>
                    <input 
                      type="text" 
                      value={formData.titulo} 
                      onChange={handleTitleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-sage text-lg font-medium"
                      placeholder="Ej. Tendencias en Arquitectura 2027"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Enlace amigable (Slug)</label>
                    <input 
                      type="text" 
                      value={formData.slug} 
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none text-gray-500 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Resumen (Para previsualizaciones)</label>
                    <textarea 
                      value={formData.resumen} 
                      onChange={(e) => setFormData({...formData, resumen: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-sage h-24"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <label className="block text-sm font-bold text-gray-700">Contenido Completo</label>
                      <span className="text-xs text-gray-400">Admite etiquetas HTML básicas (&lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;)</span>
                    </div>
                    <textarea 
                      value={formData.contenido} 
                      onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-sage h-96 font-mono text-sm"
                      placeholder="<p>Escribe tu artículo aquí...</p>"
                    />
                  </div>
                </div>

                {/* Columna Lateral */}
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Estado de Publicación</label>
                    <select 
                      value={formData.estado}
                      onChange={(e) => setFormData({...formData, estado: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-sage mb-4"
                    >
                      <option value="borrador">Borrador (Oculto)</option>
                      <option value="publicado">Publicado (Visible)</option>
                    </select>

                    <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                    <select 
                      value={formData.categoria}
                      onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-sage"
                    >
                      <option value="Ingeniería Civil">Ingeniería Civil</option>
                      <option value="Arquitectura">Arquitectura</option>
                      <option value="Construcción">Construcción</option>
                      <option value="Empresa">Empresa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Imagen Principal</label>
                    {formData.imagen_url && !file && (
                      <div className="mb-2 relative rounded overflow-hidden">
                        <img src={formData.imagen_url} alt="Portada" className="w-full h-32 object-cover" />
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brand-sage/20 file:text-brand-dark hover:file:bg-brand-sage/30"
                    />
                  </div>
                </div>

              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50 rounded-b-xl">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={saveArticulo}
                disabled={uploadingFile}
                className="bg-brand-dark text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {uploadingFile ? "Subiendo..." : "Guardar Artículo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
