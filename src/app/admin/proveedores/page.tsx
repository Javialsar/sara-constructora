"use client"
import { useState, useEffect } from "react"
import { Briefcase, Plus, Search, X, Loader2, Edit, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Proveedor = {
  id: string
  razon_social: string
  ruc: string
  contacto_vendedor: string
  telefono: string
  email: string
  dias_credito: number
  estado: boolean
}

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  const [formData, setFormData] = useState({
    razon_social: "",
    ruc: "",
    contacto_vendedor: "",
    telefono: "",
    email: "",
    dias_credito: 0
  })

  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchProveedores()
  }, [])

  const fetchProveedores = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (!error && data) {
      setProveedores(data)
    }
    setLoading(false)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ razon_social: "", ruc: "", contacto_vendedor: "", telefono: "", email: "", dias_credito: 0 })
  }

  const handleEdit = (prov: Proveedor) => {
    setFormData({
      razon_social: prov.razon_social,
      ruc: prov.ruc || "",
      contacto_vendedor: prov.contacto_vendedor || "",
      telefono: prov.telefono || "",
      email: prov.email || "",
      dias_credito: prov.dias_credito || 0
    })
    setEditingId(prov.id)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este proveedor?")) return
    
    const { error } = await supabase
      .from('proveedores')
      .delete()
      .eq('id', id)
      
    if (!error) {
      fetchProveedores()
    } else {
      alert("Error al eliminar el proveedor")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    if (editingId) {
      const { error } = await supabase
        .from('proveedores')
        .update(formData)
        .eq('id', editingId)
        
      setSaving(false)
      if (!error) {
        closeModal()
        fetchProveedores()
      } else {
        alert("Error al actualizar el proveedor.")
        console.error(error)
      }
    } else {
      const { error } = await supabase
        .from('proveedores')
        .insert([formData])

      setSaving(false)
      if (!error) {
        closeModal()
        fetchProveedores()
      } else {
        alert("Error al guardar el proveedor. Asegúrate de tener conexión a la base de datos.")
        console.error(error)
      }
    }
  }

  const filteredProveedores = proveedores.filter(p => 
    p.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.ruc && p.ruc.includes(searchTerm))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Briefcase className="text-brand-sage" />
            Directorio de Proveedores
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestiona los proveedores de materiales y equipos para tus proyectos.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-sage text-brand-dark px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-opacity-90 transition-all"
        >
          <Plus size={18} />
          Nuevo Proveedor
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o RUC..." 
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
        ) : proveedores.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Briefcase size={48} className="mx-auto mb-3 opacity-20" />
            <p>La base de datos de proveedores está vacía.</p>
            <p className="text-sm mt-1">Haz clic en "Nuevo Proveedor" para comenzar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="py-3 px-4 font-semibold">Razón Social</th>
                  <th className="py-3 px-4 font-semibold">RUC</th>
                  <th className="py-3 px-4 font-semibold">Contacto</th>
                  <th className="py-3 px-4 font-semibold">Teléfono / Email</th>
                  <th className="py-3 px-4 font-semibold">Crédito</th>
                  <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProveedores.map(prov => (
                  <tr key={prov.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800">{prov.razon_social}</td>
                    <td className="py-3 px-4 text-gray-600">{prov.ruc || "-"}</td>
                    <td className="py-3 px-4 text-gray-600">{prov.contacto_vendedor || "-"}</td>
                    <td className="py-3 px-4 text-gray-600">
                      <div>{prov.telefono}</div>
                      <div className="text-xs text-gray-400">{prov.email}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${prov.dias_credito > 0 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {prov.dias_credito > 0 ? `${prov.dias_credito} días` : 'Contado'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => handleEdit(prov)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors" title="Editar">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(prov.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Eliminar">
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

      {/* Modal Nuevo/Editar Proveedor */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Briefcase className="text-brand-sage" size={20} />
                {editingId ? "Editar Proveedor" : "Registrar Nuevo Proveedor"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social o Empresa <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ej. Ferretería El Maestro S.A."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none"
                    value={formData.razon_social}
                    onChange={e => setFormData({...formData, razon_social: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RUC / Identificación</label>
                  <input 
                    type="text" 
                    placeholder="0999999999001"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none"
                    value={formData.ruc}
                    onChange={e => setFormData({...formData, ruc: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Días de Crédito (0 = Contado)</label>
                  <input 
                    type="number" 
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none"
                    value={formData.dias_credito}
                    onChange={e => setFormData({...formData, dias_credito: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contacto Comercial</label>
                  <input 
                    type="text" 
                    placeholder="Nombre del vendedor"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none"
                    value={formData.contacto_vendedor}
                    onChange={e => setFormData({...formData, contacto_vendedor: e.target.value})}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                  <input 
                    type="email" 
                    placeholder="ventas@empresa.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
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
                  {saving ? "Guardando..." : "Guardar Proveedor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
