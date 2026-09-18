
"use client"
import { useState, useEffect } from "react"
import { FileText, Plus, Search, X, Loader2, Edit, Trash2, Box, Truck, Wrench, AlertTriangle, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Proveedor = {
  id: string
  razon_social: string
}

type Insumo = {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  unidad: string
  tipo: string
  precio_sin_iva: number
  proveedor_id: string | null
  estado: boolean
  categoria?: string
  fecha_actualizacion?: string
}

export default function InsumosPage() {
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [insumoProvMap, setInsumoProvMap] = useState<Record<string, string[]>>({})
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState<string>("todos")
  const [filterCategoria, setFilterCategoria] = useState<string>("todas")
  
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    unidad: "",
    tipo: "material",
    categoria: "Sin categoría",
    precio_sin_iva: 0,
    proveedor_id: ""
  })

  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    // Fetch Insumos
    const { data: dataInsumos, error: errorInsumos } = await supabase
      .from('insumos')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (!errorInsumos && dataInsumos) {
      setInsumos(dataInsumos)
    }

    // Fetch Proveedores para el select
    const { data: dataProv, error: errorProv } = await supabase
      .from('proveedores')
      .select('id, razon_social')
      .order('razon_social', { ascending: true })

    if (!errorProv && dataProv) {
      setProveedores(dataProv)
    }

    
    // Fetch Insumo_Proveedores
    const { data: dataIP } = await supabase.from('insumo_proveedores').select('*')
    if (dataIP) {
      const map: Record<string, string[]> = {}
      dataIP.forEach((ip: any) => {
        if (!map[ip.insumo_id]) map[ip.insumo_id] = []
        map[ip.insumo_id].push(ip.proveedor_id)
      })
      setInsumoProvMap(map)
    }

    setLoading(false)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ 
      codigo: "", 
      nombre: "", 
      descripcion: "", 
      unidad: "", 
      tipo: "material", 
      categoria: "Sin categoría",
      precio_sin_iva: 0,
      proveedor_id: "" 
    })
  }

  const handleEdit = (insumo: Insumo) => {
    setFormData({
      codigo: insumo.codigo || "",
      nombre: insumo.nombre,
      descripcion: insumo.descripcion || "",
      unidad: insumo.unidad,
      tipo: insumo.tipo || "material",
      categoria: insumo.categoria || "Sin categoría",
      precio_sin_iva: insumo.precio_sin_iva || 0,
      proveedor_id: insumo.proveedor_id || "",
      proveedores_ids: insumoProvMap[insumo.id] || (insumo.proveedor_id ? [insumo.proveedor_id] : [])
    })
    setEditingId(insumo.id)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este insumo?")) return
    
    const { error } = await supabase
      .from('insumos')
      .delete()
      .eq('id', id)
      
    if (!error) {
      fetchData()
    } else {
      alert("Error al eliminar el insumo")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    // Limpiar el proveedor si está vacío para que se guarde como NULL en BD
    const payload = {
      ...formData,
      proveedor_id: formData.proveedor_id === "" ? null : formData.proveedor_id,
      fecha_actualizacion: new Date().toISOString()
    }
    
    if (editingId) {
      const { error } = await supabase
        .from('insumos')
        .update(payload)
        .eq('id', editingId)
        
      setSaving(false)
      if (!error) {
        closeModal()
        fetchData()
      } else {
        alert("Error al actualizar el insumo.")
        console.error(error)
      }
    } else {
      const { error } = await supabase
        .from('insumos')
        .insert([payload])

      setSaving(false)
      if (!error) {
        closeModal()
        fetchData()
      } else {
        alert("Error al guardar el insumo. Verifica que el código no esté duplicado.")
        console.error(error)
      }
    }
  }

  // Filtrado múltiple (Buscador de texto + Select de Tipo + Categoria)
  const filteredInsumos = insumos.filter(i => {
    const matchesSearch = i.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (i.codigo && i.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesTipo = filterTipo === "todos" ? true : i.tipo === filterTipo;
    const catFormated = i.categoria || "Sin categoría";
    const matchesCategoria = filterCategoria === "todas" ? true : catFormated === filterCategoria;
    
    return matchesSearch && matchesTipo && matchesCategoria;
  })

  // Obtener categorías únicas dinámicamente
  const categoriasUnicas = Array.from(new Set(insumos.map(i => i.categoria || 'Sin categoría'))).sort();

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'material': return <Box size={16} className="text-blue-500 mr-2" />
      case 'equipo': return <Truck size={16} className="text-orange-500 mr-2" />
      case 'mano_de_obra': return <Wrench size={16} className="text-brand-sage mr-2" />
      default: return <FileText size={16} className="text-gray-500 mr-2" />
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'material': return "Material"
      case 'equipo': return "Equipo"
      case 'mano_de_obra': return "Mano de Obra"
      default: return tipo
    }
  }

  const isPriceOutdated = (fechaIso?: string) => {
    if (!fechaIso) return true; // Si nunca se actualizó, está desactualizado
    const d = new Date(fechaIso);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return d < threeMonthsAgo;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-brand-sage" />
            Catálogo de Insumos
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestión centralizada de Materiales, Equipos y Recursos.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-sage text-brand-dark px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-opacity-90 transition-all"
        >
          <Plus size={18} />
          Nuevo Insumo
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por código o nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-sage w-full"
            />
          </div>
          
          <div className="flex w-full md:w-auto gap-2 flex-col md:flex-row">
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-sage w-full md:w-auto"
            >
              <option value="todos">Todos los tipos</option>
              <option value="material">Materiales</option>
              <option value="equipo">Equipos y Maquinaria</option>
              <option value="mano_de_obra">Mano de Obra</option>
            </select>

            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-sage w-full md:w-auto max-w-[200px]"
            >
              <option value="todas">Todas las familias</option>
              {categoriasUnicas.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-brand-sage" size={32} />
          </div>
        ) : insumos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Box size={48} className="mx-auto mb-3 opacity-20" />
            <p>El catálogo de insumos está vacío.</p>
            <p className="text-sm mt-1">Haz clic en "Nuevo Insumo" para comenzar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="py-3 px-4 font-semibold">Código</th>
                  <th className="py-3 px-4 font-semibold">Nombre del Insumo / Categoría</th>
                  <th className="py-3 px-4 font-semibold">Tipo</th>
                  <th className="py-3 px-4 font-semibold text-center">Unidad</th>
                  <th className="py-3 px-4 font-semibold text-right">Precio Ref. (sin IVA)</th>
                  <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInsumos.map(insumo => {
                  const outDated = isPriceOutdated(insumo.fecha_actualizacion);
                  return (
                  <tr key={insumo.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-600 font-mono text-sm">{insumo.codigo || "-"}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-800">{insumo.nombre}</div>
                      <div className="flex flex-col text-xs mt-1 gap-1">
                        <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded w-fit">{insumo.categoria || "Sin categoría"}</span>
                        {insumo.proveedor_id && (
                          <span className="text-brand-sage">
                            Prov: {proveedores.find(p => p.id === insumo.proveedor_id)?.razon_social || "Desconocido"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <div className="flex items-center">
                        {getTipoIcon(insumo.tipo)}
                        <span className="text-xs font-medium">{getTipoLabel(insumo.tipo)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                        {insumo.unidad}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right relative group">
                      <div className="flex items-center justify-end gap-2">
                        {outDated && (
                          <div title="Precio desactualizado (> 3 meses)" className="text-amber-500 cursor-help">
                            <AlertTriangle size={16} />
                          </div>
                        )}
                        <span className={`font-medium ${outDated ? 'text-amber-600' : 'text-gray-800'}`}>
                          ${Number(insumo.precio_sin_iva).toFixed(4)}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 flex items-center justify-end gap-1" title="Última actualización">
                         <Calendar size={10} />
                         {insumo.fecha_actualizacion ? new Date(insumo.fecha_actualizacion).toLocaleDateString() : 'Nunca'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => handleEdit(insumo)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors" title="Editar">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(insumo.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nuevo/Editar Insumo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="text-brand-sage" size={20} />
                {editingId ? "Editar Insumo" : "Registrar Nuevo Insumo"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código (Opcional)</label>
                  <input 
                    type="text" 
                    placeholder="Ej. MAT-001"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none"
                    value={formData.codigo}
                    onChange={e => setFormData({...formData, codigo: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Insumo <span className="text-red-500">*</span></label>
                  <select 
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none"
                    value={formData.tipo}
                    onChange={e => setFormData({...formData, tipo: e.target.value})}
                  >
                    <option value="material">Materiales</option>
                    <option value="equipo">Equipos y Maquinaria</option>
                    <option value="mano_de_obra">Mano de Obra</option>
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre / Descripción Corta <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ej. Cemento Portland Tipo I (Saco 50kg)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none"
                    value={formData.nombre}
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría / Familia</label>
                  <input 
                    type="text" 
                    list="lista-categorias"
                    placeholder="Ej. Aceros, Pétreos, Maderas..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none"
                    value={formData.categoria}
                    onChange={e => setFormData({...formData, categoria: e.target.value})}
                  />
                  <datalist id="lista-categorias">
                    {categoriasUnicas.filter(c => c !== 'Sin categoría').map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de Medida <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="text" 
                    placeholder="kg, m3, glb, unidad, m, h"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none"
                    value={formData.unidad}
                    onChange={e => setFormData({...formData, unidad: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Ref. (sin IVA)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input 
                      type="number" 
                      step="0.0001"
                      min="0"
                      placeholder="8.50"
                      className="w-full pl-8 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none"
                      value={formData.precio_sin_iva || ''}
                      onChange={e => setFormData({...formData, precio_sin_iva: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                {formData.tipo === 'material' && (
                  <div className="col-span-2 mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Truck size={14} className="text-gray-500" />
                      Proveedor Vinculado (Opcional)
                    </label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none bg-white"
                      value={formData.proveedor_id}
                      onChange={e => setFormData({...formData, proveedor_id: e.target.value})}
                    >
                      <option value="">-- Ningún proveedor / Proveedor Genérico --</option>
                      {proveedores.map(p => (
                        <option key={p.id} value={p.id}>{p.razon_social}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">Vincular un proveedor te permite saber a quién comprar este material cuando ganes la obra.</p>
                  </div>
                )}
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
                  {saving ? "Guardando..." : "Guardar Insumo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
