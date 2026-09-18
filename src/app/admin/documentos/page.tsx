"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, FileText, Trash2, X, Download } from "lucide-react"

export default function AdminDocumentos() {
  const supabase = createClient()
  const [documentos, setDocumentos] = useState<any[]>([])
  const [proyectos, setProyectos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  const [formData, setFormData] = useState({
    proyecto_id: "",
    titulo: "",
    descripcion: "",
    notificar_cliente: true
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    // Cargar documentos
    const { data: docs } = await supabase
      .from("documentos_proyecto")
      .select(`*, proyectos(nombre, clientes(nombre, apellido))`)
      .order('fecha_subida', { ascending: false })
      
    if (docs) setDocumentos(docs)
    
    // Cargar proyectos para el selector
    const { data: proys } = await supabase
      .from("proyectos")
      .select("id, nombre, cliente_id")
      
    if (proys) setProyectos(proys)
    
    setLoading(false)
  }

  const openNewModal = () => {
    setFile(null)
    setFormData({ proyecto_id: "", titulo: "", descripcion: "", notificar_cliente: true })
    setIsModalOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      // Autocompletar título con el nombre del archivo si está vacío
      if (!formData.titulo) {
        setFormData({ ...formData, titulo: selectedFile.name.split('.')[0] })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.proyecto_id) {
      alert("Por favor selecciona un proyecto.")
      return
    }
    if (!formData.titulo) {
      alert("El título es requerido.")
      return
    }
    if (!file) {
      alert("Debes adjuntar un archivo (PDF, Word, Excel, etc).")
      return
    }

    setUploadingFile(true)

    // Subir el archivo al bucket
    const fileExt = file.name.split('.').pop()
    const fileName = `doc_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
    const filePath = `documentos_legales/${formData.proyecto_id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avances') // Reutilizamos el bucket de avances por simplicidad
      .upload(filePath, file)

    if (uploadError) {
      alert("Error al subir el archivo: " + uploadError.message)
      setUploadingFile(false)
      return
    }
    
    const { data: publicUrlData } = supabase.storage.from('avances').getPublicUrl(filePath)

    // Guardar el registro
    const payload = {
      proyecto_id: formData.proyecto_id,
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      archivo_url: publicUrlData.publicUrl,
      tipo: 'documento',
    }

    const { error: insertError } = await supabase.from('documentos_proyecto').insert([payload])

    setUploadingFile(false)

    if (insertError) {
      alert("Error al registrar el documento en la base de datos: " + insertError.message)
    } else {
      if (formData.notificar_cliente) {
        const proyectoData = proyectos.find(p => p.id === formData.proyecto_id)
        if (proyectoData) {
          fetch('/api/notificaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cliente_id: proyectoData.cliente_id,
              proyecto_nombre: proyectoData.nombre,
              tipo_notificacion: "Nuevo Documento Legal",
              titulo_avance: formData.titulo,
              enlace_portal: window.location.origin + "/portal"
            })
          }).catch(err => console.error("Error al notificar", err))
        }
      }
      setIsModalOpen(false)
      fetchData()
    }
  }

  const deleteDocumento = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este documento legal?")) {
      await supabase.from('documentos_proyecto').delete().eq('id', id)
      fetchData()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestor Documental</h1>
          <p className="text-gray-500 text-sm">Administra los planos, permisos y contratos de tus clientes.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-brand-sage text-brand-dark px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-brand-sage/90 transition-colors"
        >
          <Plus size={20} /> Subir Documento
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
                  <th className="px-6 py-4 font-bold">Documento</th>
                  <th className="px-6 py-4 font-bold">Proyecto Asociado</th>
                  <th className="px-6 py-4 font-bold">Fecha de Subida</th>
                  <th className="px-6 py-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documentos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      <FileText size={48} className="mx-auto mb-3 opacity-20" />
                      <p>No se han subido documentos legales.</p>
                    </td>
                  </tr>
                ) : (
                  documentos.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{doc.titulo}</p>
                            {doc.descripcion && <p className="text-xs text-gray-500 truncate max-w-xs">{doc.descripcion}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{doc.proyectos?.nombre}</p>
                        {doc.proyectos?.clientes && (
                          <p className="text-xs text-brand-sage font-medium">Cliente: {doc.proyectos.clientes.nombre}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(doc.fecha_subida).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <a href={doc.archivo_url} target="_blank" rel="noreferrer" className="text-brand-sage hover:text-green-700 transition-colors" title="Descargar/Ver">
                            <Download size={18} />
                          </a>
                          <button onClick={() => deleteDocumento(doc.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Agregar Documento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-dark/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Subir Documento Privado</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Proyecto Destino</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none bg-white"
                  value={formData.proyecto_id}
                  onChange={(e) => setFormData({...formData, proyecto_id: e.target.value})}
                  required
                >
                  <option value="">Selecciona un proyecto...</option>
                  {proyectos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Archivo PDF / Doc</label>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brand-sage/20 file:text-brand-dark hover:file:bg-brand-sage/30 cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Título del Documento</label>
                <input 
                  type="text" 
                  placeholder="Ej. Planos Estructurales Finales"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción (Opcional)</label>
                <textarea 
                  rows={2}
                  placeholder="Notas adicionales..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none resize-none"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="notificar"
                  checked={formData.notificar_cliente}
                  onChange={(e) => setFormData({...formData, notificar_cliente: e.target.checked})}
                  className="w-4 h-4 text-brand-dark bg-gray-100 border-gray-300 rounded focus:ring-brand-sage"
                />
                <label htmlFor="notificar" className="text-sm font-bold text-gray-700">
                  Notificar al cliente por WhatsApp/Email
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={uploadingFile}
                  className="bg-brand-dark text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {uploadingFile ? "Subiendo archivo..." : "Guardar Documento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
