"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Search, Edit2, Trash2, X, Box, Users, Wrench } from "lucide-react"

export default function InsumosPage() {
  const supabase = createClient()
  const [insumos, setInsumos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTipo, setFilterTipo] = useState<string>('todos')
  const [searchTerm, setSearchTerm] = useState("")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInsumo, setEditingInsumo] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    tipo: 'material',
    categoria: '',
    codigo: '',
    nombre: '',
    unidad: 'u',
    costo: 0
  })

  useEffect(() => {
    fetchInsumos()
  }, [])

  const fetchInsumos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('insumos')
      .select('*')
      .order('nombre', { ascending: true })
    
    if (error) {
      console.error("Error fetching insumos:", error)
    } else {
      setInsumos(data || [])
    }
    setLoading(false)
  }

  const handleOpenModal = (insumo: any = null) => {
    if (insumo) {
      setEditingInsumo(insumo)
      setFormData({
        tipo: insumo.tipo,
        categoria: insumo.categoria,
        codigo: insumo.codigo,
        nombre: insumo.nombre,
        unidad: insumo.unidad,
        costo: insumo.costo
      })
    } else {
      setEditingInsumo(null)
      setFormData({
        tipo: 'material',
        categoria: '',
        codigo: '',
        nombre: '',
        unidad: 'u',
        costo: 0
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingInsumo) {
        const { error } = await supabase
          .from('insumos')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingInsumo.id)
          
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('insumos')
          .insert([formData])
          
        if (error) throw error
      }
      
      setIsModalOpen(false)
      fetchInsumos()
    } catch (error) {
      console.error("Error saving insumo:", error)
      alert("Hubo un error al guardar el insumo. Revisa que el código no esté duplicado.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este insumo? Si ya está usado en un Rubro, podría causar errores o bloquearse.")) return
    
    const { error } = await supabase
      .from('insumos')
      .delete()
      .eq('id', id)
      
    if (error) {
      alert("Error al eliminar. Es posible que el insumo ya esté en uso dentro de una receta/rubro.")
    } else {
      fetchInsumos()
    }
  }

  const filteredInsumos = insumos.filter(ins => {
    const matchTipo = filterTipo === 'todos' || ins.tipo === filterTipo
    const matchSearch = ins.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        ins.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ins.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    return matchTipo && matchSearch
  })

  const getTipoIcon = (tipo: string) => {
    if (tipo === 'material') return <Box size={16} className="text-blue-500" />
    if (tipo === 'mano_obra') return <Users size={16} className="text-orange-500" />
    if (tipo === 'equipo') return <Wrench size={16} className="text-purple-500" />
    return null
  }

  const getTipoLabel = (tipo: string) => {
    if (tipo === 'material') return "Material"
    if (tipo === 'mano_obra') return "Mano de Obra"
    if (tipo === 'equipo') return "Equipo"
    return tipo
  }

  return (
    <div className="p-6 md:p-10 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-dark tracking-tight">Catálogo de Insumos</h1>
          <p className="text-gray-500 mt-2">Base de datos de materiales, mano de obra y equipos para APUs.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-sage text-white font-bold py-2.5 px-6 rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} />
          Nuevo Insumo
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between bg-gray-50/50">
          <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm p-1 gap-1">
            <button 
              onClick={() => setFilterTipo('todos')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filterTipo === 'todos' ? 'bg-gray-800 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilterTipo('material')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${filterTipo === 'material' ? 'bg-blue-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Box size={14} /> Materiales
            </button>
            <button 
              onClick={() => setFilterTipo('mano_obra')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${filterTipo === 'mano_obra' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Users size={14} /> Mano de Obra
            </button>
            <button 
              onClick={() => setFilterTipo('equipo')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${filterTipo === 'equipo' ? 'bg-purple-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Wrench size={14} /> Equipos
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="Buscar por nombre, código..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage focus:border-brand-sage shadow-sm bg-white"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-gray-500 font-bold uppercase text-xs border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Nombre del Insumo</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Unidad</th>
                <th className="px-6 py-4 text-right">Costo Unit.</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Cargando insumos...
                  </td>
                </tr>
              ) : filteredInsumos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    No se encontraron insumos. Intenta cambiar los filtros o crea uno nuevo.
                  </td>
                </tr>
              ) : (
                filteredInsumos.map((ins) => (
                  <tr key={ins.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-3 font-mono text-xs text-gray-500">{ins.codigo}</td>
                    <td className="px-6 py-3 font-medium text-brand-dark">{ins.nombre}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {getTipoIcon(ins.tipo)}
                        <span className="text-gray-600">{getTipoLabel(ins.tipo)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">{ins.categoria}</span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{ins.unidad}</td>
                    <td className="px-6 py-3 text-right font-bold text-gray-800">
                      ${Number(ins.costo).toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(ins)}
                          className="p-1.5 text-gray-400 hover:text-brand-sage hover:bg-brand-sage/10 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(ins.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800">
                {editingInsumo ? "Editar Insumo" : "Nuevo Insumo"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Tipo de Insumo</label>
                  <select 
                    value={formData.tipo}
                    onChange={e => setFormData({...formData, tipo: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage bg-gray-50"
                    required
                  >
                    <option value="material">Materiales</option>
                    <option value="mano_obra">Mano de Obra</option>
                    <option value="equipo">Equipos y Maquinaria</option>
                  </select>
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Código Único</label>
                  <input 
                    type="text"
                    value={formData.codigo}
                    onChange={e => setFormData({...formData, codigo: e.target.value})}
                    placeholder="Ej. MAT-001"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage font-mono uppercase"
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Nombre / Descripción</label>
                  <input 
                    type="text"
                    value={formData.nombre}
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Ej. Cemento Portland Tipo I"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Categoría / Familia</label>
                  <input 
                    type="text"
                    value={formData.categoria}
                    onChange={e => setFormData({...formData, categoria: e.target.value})}
                    placeholder="Ej. Obra Gris, Eléctrico, Acabados..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage"
                    required
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Unidad</label>
                  <input 
                    type="text"
                    value={formData.unidad}
                    onChange={e => setFormData({...formData, unidad: e.target.value})}
                    placeholder="Ej. m3, kg, u, h, glb"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage"
                    required
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Costo ($)</label>
                  <input 
                    type="number"
                    step="0.0001"
                    min="0"
                    value={formData.costo}
                    onChange={e => setFormData({...formData, costo: parseFloat(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage text-right font-bold"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-lg text-sm font-bold bg-brand-dark text-white hover:bg-brand-sage hover:text-brand-dark transition-colors shadow-sm"
                >
                  Guardar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
