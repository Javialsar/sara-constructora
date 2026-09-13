"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Image as ImageIcon, Video, FileText, MapPin, X, Percent } from "lucide-react"

export default function AdminAvances() {
  const supabase = createClient()
  const [avances, setAvances] = useState<any[]>([])
  const [proyectos, setProyectos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  
  const [formData, setFormData] = useState({
    proyecto_id: "",
    titulo: "",
    descripcion: "",
    tipo: "foto",
    url: "",
    nuevo_porcentaje: "",
    notificar_cliente: true
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    // Cargar historial de avances
    const { data: dataAvances } = await supabase
      .from("avances")
      .select(`*, proyectos(nombre, cliente_id, clientes(nombre, apellido))`)
      .order('fecha', { ascending: false })
      
    if (dataAvances) setAvances(dataAvances)
    
    // Cargar proyectos para el selector
    const { data: dataProyectos } = await supabase
      .from("proyectos")
      .select("id, nombre, avance, cliente_id")
      
    if (dataProyectos) setProyectos(dataProyectos)
    
    setLoading(false)
  }

  const handleProyectoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p_id = e.target.value;
    const proyectoSeleccionado = proyectos.find(p => p.id === p_id);
    setFormData({
      ...formData,
      proyecto_id: p_id,
      nuevo_porcentaje: proyectoSeleccionado ? proyectoSeleccionado.avance.toString() : ""
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.proyecto_id) {
      alert("Por favor selecciona un proyecto.")
      return
    }

    let finalUrl = formData.url;

    if (file) {
      setUploadingFile(true)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avances')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        alert("Error al subir el archivo (recuerda correr el código SQL para crear el bucket 'avances'): " + uploadError.message);
        setUploadingFile(false);
        return;
      }
      
      const { data: publicUrlData } = supabase.storage.from('avances').getPublicUrl(filePath);
      finalUrl = publicUrlData.publicUrl;
      setUploadingFile(false);
    }

    // 1. Guardar el registro del avance (Bitácora)
    const payload = {
      proyecto_id: formData.proyecto_id,
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      tipo: formData.tipo,
      url: finalUrl
    }

    const { error: errAvance } = await supabase.from("avances").insert([payload])
    
    // 2. Actualizar el porcentaje global del proyecto si fue modificado
    if (formData.nuevo_porcentaje) {
      await supabase
        .from("proyectos")
        .update({ avance: parseInt(formData.nuevo_porcentaje) })
        .eq("id", formData.proyecto_id)
    }
    
    if (!errAvance) {
      if (formData.notificar_cliente) {
        const proyectoData = proyectos.find(p => p.id === formData.proyecto_id)
        if (proyectoData) {
          fetch('/api/notificaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cliente_id: proyectoData.cliente_id,
              proyecto_nombre: proyectoData.nombre,
              tipo_notificacion: "Nuevo Avance de Obra",
              titulo_avance: formData.titulo,
              enlace_portal: window.location.origin + "/portal"
            })
          }).catch(err => console.error("Error al notificar", err))
        }
      }

      setIsModalOpen(false)
      setFormData({ proyecto_id: "", titulo: "", descripcion: "", tipo: "foto", url: "", nuevo_porcentaje: "", notificar_cliente: true })
      setFile(null)
      fetchData()
    } else {
      alert("Error al guardar el avance: " + errAvance.message)
    }
  }

  const getIcon = (tipo: string) => {
    switch(tipo) {
      case 'foto': return <ImageIcon size={18} className="text-blue-500" />
      case 'video': return <Video size={18} className="text-red-500" />
      case 'documento': return <FileText size={18} className="text-gray-500" />
      default: return <MapPin size={18} className="text-brand-sage" />
    }
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Avances de Obra</h2>
          <p className="text-gray-500 text-sm mt-1">Sube fotos, videos o actualizaciones para el portal de tus clientes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand-dark hover:bg-brand-sage hover:text-brand-dark text-white px-4 py-2 rounded-lg font-bold transition-colors"
        >
          <Plus size={20} />
          <span>Registrar Avance</span>
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
                  <th className="px-6 py-4 font-bold">Tipo</th>
                  <th className="px-6 py-4 font-bold">Proyecto</th>
                  <th className="px-6 py-4 font-bold">Título / Descripción</th>
                  <th className="px-6 py-4 font-bold">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {avances.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      <ImageIcon size={48} className="mx-auto mb-3 opacity-20" />
                      <p>No se han registrado avances en ninguna obra.</p>
                    </td>
                  </tr>
                ) : (
                  avances.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center justify-center w-10 h-10 bg-gray-50 rounded-lg border border-gray-100">
                          {getIcon(a.tipo)}
                          <span className="text-[9px] uppercase mt-1 font-bold">{a.tipo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{a.proyectos?.nombre}</p>
                        {a.proyectos?.clientes && (
                          <p className="text-xs text-brand-sage font-medium">Cliente: {a.proyectos.clientes.nombre}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-800">{a.titulo}</p>
                        <p className="text-gray-500 line-clamp-1">{a.descripcion}</p>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(a.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nuevo Avance */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-brand-dark">Registrar Nuevo Avance</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">Seleccionar Proyecto *</label>
                  <select 
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none bg-white font-medium text-gray-800"
                    value={formData.proyecto_id}
                    onChange={handleProyectoChange}
                  >
                    <option value="">-- Elige una obra --</option>
                    {proyectos.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">Título de la actualización *</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ej. Fundición de losa del segundo piso terminada"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none"
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">Descripción (Opcional)</label>
                  <textarea 
                    rows={3}
                    placeholder="Detalles técnicos o mensaje para el cliente..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none resize-none"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Tipo de Archivo</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none bg-white"
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  >
                    <option value="foto">Fotografía</option>
                    <option value="video">Video (YouTube/Vimeo)</option>
                    <option value="documento">Documento (PDF)</option>
                    <option value="hito">Solo texto (Hito)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Subir Archivo o URL</label>
                  <div className="flex flex-col gap-2">
                    <input 
                      type="file" 
                      accept="image/*,video/*,.pdf"
                      onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-brand-sage file:text-brand-dark hover:file:bg-brand-dark hover:file:text-white"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 whitespace-nowrap">O ingresa un enlace:</span>
                      <input 
                        type="text" 
                        placeholder="https://youtube.com/..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none text-sm"
                        value={formData.url}
                        onChange={(e) => setFormData({...formData, url: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2 mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-sage/20 flex items-center justify-center text-brand-dark shrink-0">
                    <Percent size={24} />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-bold text-gray-700 block mb-1">Porcentaje Global de Avance de la Obra</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min="0" max="100" 
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-dark"
                        value={formData.nuevo_porcentaje || 0}
                        onChange={(e) => setFormData({...formData, nuevo_porcentaje: e.target.value})}
                      />
                      <span className="font-bold text-brand-dark w-12 text-right">{formData.nuevo_porcentaje || 0}%</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 mt-4 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="notificar"
                    checked={formData.notificar_cliente}
                    onChange={(e) => setFormData({...formData, notificar_cliente: e.target.checked})}
                    className="w-4 h-4 text-brand-dark bg-gray-100 border-gray-300 rounded focus:ring-brand-sage"
                  />
                  <label htmlFor="notificar" className="text-sm font-bold text-gray-700">
                    Notificar al cliente por WhatsApp/Email sobre este avance
                  </label>
                </div>

              </div>
              
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={uploadingFile}
                  className="px-6 py-2.5 rounded-lg font-bold bg-brand-dark text-white hover:bg-brand-sage hover:text-brand-dark transition-colors disabled:opacity-50"
                >
                  {uploadingFile ? "Subiendo archivo..." : "Guardar y Notificar al Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
