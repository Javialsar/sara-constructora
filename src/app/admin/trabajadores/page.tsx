"use client"
import { useState, useEffect } from "react"
import { Wrench, Plus, Search, X, Loader2, Edit, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import salariosData from "@/lib/salariosData.json"

type Trabajador = {
  id: string
  nombre_completo: string
  cedula: string
  telefono: string
  categoria_ocupacional: string
  jornal_real: number
  costo_horario: number
  estado: boolean
}

export default function TrabajadoresPage() {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  const [formData, setFormData] = useState({
    nombre_completo: "",
    cedula: "",
    telefono: "",
    categoria_ocupacional: "",
    jornal_real: 0,
    costo_horario: 0
  })

  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchTrabajadores()
  }, [])

  const fetchTrabajadores = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('trabajadores')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (!error && data) {
      setTrabajadores(data)
    }
    setLoading(false)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ nombre_completo: "", cedula: "", telefono: "", categoria_ocupacional: "", jornal_real: 0, costo_horario: 0 })
  }

  const handleEdit = (trab: Trabajador) => {
    setFormData({
      nombre_completo: trab.nombre_completo,
      cedula: trab.cedula || "",
      telefono: trab.telefono || "",
      categoria_ocupacional: trab.categoria_ocupacional || "",
      jornal_real: trab.jornal_real || 0,
      costo_horario: trab.costo_horario || 0
    })
    setEditingId(trab.id)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este trabajador?")) return
    
    const { error } = await supabase
      .from('trabajadores')
      .delete()
      .eq('id', id)
      
    if (!error) {
      fetchTrabajadores()
    } else {
      alert("Error al eliminar el trabajador")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    if (editingId) {
      const { error } = await supabase
        .from('trabajadores')
        .update(formData)
        .eq('id', editingId)
        
      setSaving(false)
      if (!error) {
        closeModal()
        fetchTrabajadores()
      } else {
        alert("Error al actualizar el trabajador.")
        console.error(error)
      }
    } else {
      const { error } = await supabase
        .from('trabajadores')
        .insert([formData])

      setSaving(false)
      if (!error) {
        closeModal()
        fetchTrabajadores()
      } else {
        alert("Error al guardar el trabajador. Asegúrate de tener conexión a la base de datos.")
        console.error(error)
      }
    }
  }

  const filteredTrabajadores = trabajadores.filter(t => 
    t.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.cedula && t.cedula.includes(searchTerm)) ||
    (t.categoria_ocupacional && t.categoria_ocupacional.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Wrench className="text-brand-sage" />
            Personal de Obra (Mano de Obra)
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Catálogo de trabajadores, maestros y operarios para el cálculo de APUs.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-sage text-brand-dark px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-opacity-90 transition-all"
        >
          <Plus size={18} />
          Registrar Personal
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, cédula o categoría..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-sage w-80"
            />
          </div>
        </div>
        
        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-brand-sage" size={32} />
          </div>
        ) : trabajadores.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Wrench size={48} className="mx-auto mb-3 opacity-20" />
            <p>El directorio de personal está vacío.</p>
            <p className="text-sm mt-1">Haz clic en "Registrar Personal" para comenzar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="py-3 px-4 font-semibold">Nombre Completo</th>
                  <th className="py-3 px-4 font-semibold">Cédula</th>
                  <th className="py-3 px-4 font-semibold">Categoría Ocupacional</th>
                  <th className="py-3 px-4 font-semibold text-right">Jornal Real</th>
                  <th className="py-3 px-4 font-semibold text-right">Costo Horario</th>
                  <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrabajadores.map(trab => (
                  <tr key={trab.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800">
                      <div>{trab.nombre_completo}</div>
                      <div className="text-xs text-gray-400">{trab.telefono}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{trab.cedula || "-"}</td>
                    <td className="py-3 px-4 text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium border border-gray-200">
                        {trab.categoria_ocupacional}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-800 font-medium text-right">${Number(trab.jornal_real).toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-800 font-medium text-right">${Number(trab.costo_horario).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => handleEdit(trab)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors" title="Editar">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(trab.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nuevo/Editar Trabajador */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Wrench className="text-brand-sage" size={20} />
                {editingId ? "Editar Trabajador" : "Registrar Nuevo Trabajador"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ej. Juan Pérez"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none"
                    value={formData.nombre_completo}
                    onChange={e => setFormData({...formData, nombre_completo: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cédula de Identidad</label>
                  <input 
                    type="text" 
                    placeholder="0999999999"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none"
                    value={formData.cedula}
                    onChange={e => setFormData({...formData, cedula: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input 
                    type="text" 
                    placeholder="099 999 9999"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none"
                    value={formData.telefono}
                    onChange={e => setFormData({...formData, telefono: e.target.value})}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría Ocupacional <span className="text-red-500">*</span></label>
                  <input 
                      required
                      type="text" 
                      list="categorias-list"
                      placeholder="Ej. Albañil, Ayudante, Maestro de Obra..."
                      className="w-full border-2 border-brand-sage rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none bg-brand-sage/5"
                      value={formData.categoria_ocupacional}
                      onChange={e => {
                        const val = e.target.value;
                        const found = salariosData.find(s => s.actividad === val);
                        if (found) {
                          setFormData({...formData, categoria_ocupacional: val, jornal_real: found.jornal, costo_horario: found.hora});
                        } else {
                          setFormData({...formData, categoria_ocupacional: val});
                        }
                      }}
                    />
                    <datalist id="categorias-list">
                      {salariosData.map(s => <option key={s.actividad} value={s.actividad} />)}
                    </datalist>
                  <p className="text-xs text-gray-500 mt-1">Utilice las categorías oficiales de CAMICON si aplica.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jornal Real ($/día)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      placeholder="35.15"
                      className="w-full pl-8 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none"
                      value={formData.jornal_real || ''}
                      onChange={e => setFormData({...formData, jornal_real: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo Horario ($/hora)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      placeholder="4.39"
                      className="w-full pl-8 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none"
                      value={formData.costo_horario || ''}
                      onChange={e => setFormData({...formData, costo_horario: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-brand-dark text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? "Guardando..." : "Guardar Trabajador"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
