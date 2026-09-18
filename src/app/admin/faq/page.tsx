"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, HelpCircle, Edit, Trash2, X, MoveUp, MoveDown } from "lucide-react"

export default function AdminFAQ() {
  const supabase = createClient()
  const [faqs, setFaqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    pregunta: "",
    respuesta: "",
    palabras_clave: "",
    orden: 0,
    estado: "publicado"
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: dataFaqs } = await supabase
      .from("preguntas_frecuentes")
      .select("*")
      .order('orden', { ascending: true })
      
    if (dataFaqs) setFaqs(dataFaqs)
    setLoading(false)
  }

  const openNewModal = () => {
    setEditId(null)
    setFormData({ 
      pregunta: "", 
      respuesta: "", 
      palabras_clave: "", 
      orden: faqs.length > 0 ? Math.max(...faqs.map(f => f.orden)) + 1 : 1,
      estado: "publicado" 
    })
    setIsModalOpen(true)
  }

  const openEditModal = (faq: any) => {
    setEditId(faq.id)
    setFormData({
      pregunta: faq.pregunta,
      respuesta: faq.respuesta,
      palabras_clave: faq.palabras_clave,
      orden: faq.orden,
      estado: faq.estado
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editId) {
      await supabase.from('preguntas_frecuentes').update(formData).eq('id', editId)
    } else {
      await supabase.from('preguntas_frecuentes').insert([formData])
    }
    
    setIsModalOpen(false)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta pregunta frecuente?")) {
      await supabase.from('preguntas_frecuentes').delete().eq('id', id)
      fetchData()
    }
  }

  const cambiarOrden = async (index: number, direccion: 'up'|'down') => {
    if (direccion === 'up' && index === 0) return;
    if (direccion === 'down' && index === faqs.length - 1) return;
    
    const newFaqs = [...faqs];
    const targetIndex = direccion === 'up' ? index - 1 : index + 1;
    
    // Intercambiar orden
    const tempOrden = newFaqs[index].orden;
    newFaqs[index].orden = newFaqs[targetIndex].orden;
    newFaqs[targetIndex].orden = tempOrden;

    // Actualizar BD (ambos registros)
    await supabase.from('preguntas_frecuentes').update({ orden: newFaqs[index].orden }).eq('id', newFaqs[index].id)
    await supabase.from('preguntas_frecuentes').update({ orden: newFaqs[targetIndex].orden }).eq('id', newFaqs[targetIndex].id)
    
    fetchData();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Preguntas Frecuentes (FAQ)</h1>
          <p className="text-gray-500 text-sm">Administra las preguntas del Landing Page y entrena al Chatbot.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-brand-sage text-brand-dark px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-brand-sage/90 transition-colors"
        >
          <Plus size={20} /> Nueva Pregunta
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
                  <th className="px-6 py-4 font-bold w-16">Orden</th>
                  <th className="px-6 py-4 font-bold">Pregunta</th>
                  <th className="px-6 py-4 font-bold">Palabras Clave (Chatbot)</th>
                  <th className="px-6 py-4 font-bold text-center">Estado</th>
                  <th className="px-6 py-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {faqs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      <HelpCircle size={48} className="mx-auto mb-3 opacity-20" />
                      <p>No has registrado ninguna pregunta frecuente.</p>
                    </td>
                  </tr>
                ) : (
                  faqs.map((faq, index) => (
                    <tr key={faq.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <button onClick={() => cambiarOrden(index, 'up')} disabled={index === 0} className="text-gray-400 hover:text-brand-dark disabled:opacity-20"><MoveUp size={16}/></button>
                          <span className="font-bold text-gray-700">{faq.orden}</span>
                          <button onClick={() => cambiarOrden(index, 'down')} disabled={index === faqs.length - 1} className="text-gray-400 hover:text-brand-dark disabled:opacity-20"><MoveDown size={16}/></button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-800 line-clamp-1">{faq.pregunta}</p>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">{faq.respuesta}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {faq.palabras_clave.split(',').map((kw: string, i: number) => (
                            <span key={i} className="bg-brand-sage/20 text-brand-dark px-2 py-0.5 rounded-full text-[10px] font-bold">
                              {kw.trim()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          faq.estado === 'publicado' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {faq.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => openEditModal(faq)} className="text-brand-sage hover:text-green-700 transition-colors">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(faq.id)} className="text-gray-400 hover:text-red-500 transition-colors">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-dark/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">{editId ? 'Editar Pregunta' : 'Nueva Pregunta'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Pregunta</label>
                <input 
                  type="text" 
                  placeholder="Ej. ¿Realizan diseño de interiores?"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none font-medium"
                  value={formData.pregunta}
                  onChange={(e) => setFormData({...formData, pregunta: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Respuesta</label>
                <textarea 
                  rows={4}
                  placeholder="Escribe la respuesta detallada aquí..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none resize-none"
                  value={formData.respuesta}
                  onChange={(e) => setFormData({...formData, respuesta: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Palabras Clave (Para el Chatbot de IA)</label>
                <input 
                  type="text" 
                  placeholder="Ej. diseño, interiores, muebles"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none"
                  value={formData.palabras_clave}
                  onChange={(e) => setFormData({...formData, palabras_clave: e.target.value})}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Separa las palabras por comas. Si el cliente usa alguna de estas palabras en el Chatbot, SARA IA responderá con esta pregunta.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Orden de visualización</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none"
                    value={formData.orden}
                    onChange={(e) => setFormData({...formData, orden: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Estado</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none bg-white"
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  >
                    <option value="publicado">Publicado (Visible)</option>
                    <option value="borrador">Borrador (Oculto)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-brand-dark text-white px-6 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-colors"
                >
                  {editId ? 'Guardar Cambios' : 'Crear Pregunta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
