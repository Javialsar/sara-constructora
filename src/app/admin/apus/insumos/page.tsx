"use client"
import { useState, useEffect } from "react"
import { FileText, Plus, Search, X, Loader2, Edit, Trash2, Box, Truck, Wrench, AlertTriangle, Calendar, ChevronDown, ChevronRight, Package } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Proveedor = { id: string; razon_social: string }
type Familia = { id: string; nombre: string; grupo_sugerido: string }
type Subfamilia = { id: string; familia_id: string; nombre: string }
type Insumo = {
  id: string; codigo: string; nombre: string; descripcion: string
  unidad: string; tipo: string; precio_sin_iva: number
  proveedor_id: string | null; estado: boolean
  categoria?: string; fecha_actualizacion?: string; subfamilia_id?: string
}

export default function InsumosPage() {
  const supabase = createClient()
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [familias, setFamilias] = useState<Familia[]>([])
  const [subfamilias, setSubfamilias] = useState<Subfamilia[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [insumoProvMap, setInsumoProvMap] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)

  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFamilia, setSelectedFamilia] = useState<string | null>(null)
  const [selectedSubfamilia, setSelectedSubfamilia] = useState<string | null>(null)
  const [expandedFamilias, setExpandedFamilias] = useState<Set<string>>(new Set())

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Modal insumo
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    codigo: "", nombre: "", descripcion: "", unidad: "",
    tipo: "material", categoria: "", precio_sin_iva: 0,
    proveedor_id: "", proveedores_ids: [] as string[], subfamilia_id: ""
  })

  // Modal gestión grupos
  const [isGruposModalOpen, setIsGruposModalOpen] = useState(false)
  const [grupoForm, setGrupoForm] = useState({ nombre: "", tipo: "familia", familia_id: "" })
  const [savingGrupo, setSavingGrupo] = useState(false)

  useEffect(() => { fetchData() }, [])
  useEffect(() => { setCurrentPage(1) }, [searchTerm, selectedFamilia, selectedSubfamilia])

  const fetchData = async () => {
    setLoading(true)
    const [{ data: dInsumos }, { data: dFamilias }, { data: dSubfamilias }, { data: dProv }, { data: dIP }] = await Promise.all([
      supabase.from('insumos').select('*').order('nombre', { ascending: true }),
      supabase.from('familias').select('*').order('nombre', { ascending: true }),
      supabase.from('subfamilias').select('*').order('nombre', { ascending: true }),
      supabase.from('proveedores').select('id, razon_social').order('razon_social', { ascending: true }),
      supabase.from('insumo_proveedores').select('*')
    ])
    if (dInsumos) setInsumos(dInsumos)
    if (dFamilias) setFamilias(dFamilias)
    if (dSubfamilias) setSubfamilias(dSubfamilias)
    if (dProv) setProveedores(dProv)
    if (dIP) {
      const map: Record<string, string[]> = {}
      dIP.forEach((ip: any) => { if (!map[ip.insumo_id]) map[ip.insumo_id] = []; map[ip.insumo_id].push(ip.proveedor_id) })
      setInsumoProvMap(map)
    }
    setLoading(false)
  }

  const toggleFamilia = (id: string) => {
    setExpandedFamilias(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const selectFamilia = (id: string) => {
    if (selectedFamilia === id && !selectedSubfamilia) { setSelectedFamilia(null) }
    else { setSelectedFamilia(id); setSelectedSubfamilia(null); if (!expandedFamilias.has(id)) toggleFamilia(id) }
  }

  const selectSubfamilia = (id: string, familiaId: string) => {
    setSelectedFamilia(familiaId)
    setSelectedSubfamilia(selectedSubfamilia === id ? null : id)
  }

  // Filtrado
  let filteredInsumos = insumos.filter(i => {
    const matchSearch = i.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.codigo && i.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
    if (selectedSubfamilia) return matchSearch && i.subfamilia_id === selectedSubfamilia
    if (selectedFamilia) {
      const sfIds = subfamilias.filter(sf => sf.familia_id === selectedFamilia).map(sf => sf.id)
      return matchSearch && (sfIds.includes(i.subfamilia_id || '') || i.tipo === familias.find(f => f.id === selectedFamilia)?.grupo_sugerido)
    }
    return matchSearch
  })

  const totalPages = Math.max(1, Math.ceil(filteredInsumos.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedInsumos = filteredInsumos.slice(startIndex, startIndex + itemsPerPage)

  const getPageNumbers = () => {
    const pages = []; const max = 5
    let s = Math.max(1, currentPage - Math.floor(max / 2))
    let e = Math.min(totalPages, s + max - 1)
    if (e - s + 1 < max) s = Math.max(1, e - max + 1)
    for (let i = s; i <= e; i++) pages.push(i)
    return pages
  }

  // Handlers Modal Insumo
  const openNewModal = () => {
    setEditingId(null)
    setFormData({ codigo: "", nombre: "", descripcion: "", unidad: "", tipo: "material", categoria: "", precio_sin_iva: 0, proveedor_id: "", proveedores_ids: [], subfamilia_id: selectedSubfamilia || "" })
    setIsModalOpen(true)
  }

  const openEditModal = (insumo: Insumo) => {
    setFormData({
      codigo: insumo.codigo || "", nombre: insumo.nombre, descripcion: insumo.descripcion || "",
      unidad: insumo.unidad, tipo: insumo.tipo || "material", categoria: insumo.categoria || "",
      precio_sin_iva: insumo.precio_sin_iva || 0, proveedor_id: insumo.proveedor_id || "",
      proveedores_ids: insumoProvMap[insumo.id] || [], subfamilia_id: insumo.subfamilia_id || ""
    })
    setEditingId(insumo.id)
    setIsModalOpen(true)
  }

  const closeModal = () => { setIsModalOpen(false); setEditingId(null) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { proveedores_ids, ...restForm } = formData
    const payload = {
      ...restForm,
      proveedor_id: formData.proveedor_id === "" ? null : formData.proveedor_id,
      subfamilia_id: formData.subfamilia_id === "" ? null : formData.subfamilia_id,
      fecha_actualizacion: new Date().toISOString()
    }

    if (editingId) {
      const { error } = await supabase.from('insumos').update(payload).eq('id', editingId)
      if (!error) {
        await supabase.from('insumo_proveedores').delete().eq('insumo_id', editingId)
        if (proveedores_ids.length > 0) await supabase.from('insumo_proveedores').insert(proveedores_ids.map(pid => ({ insumo_id: editingId, proveedor_id: pid })))
        setSaving(false); closeModal(); fetchData()
      } else { setSaving(false); alert("Error al actualizar el insumo."); console.error(error) }
    } else {
      const { data: newInsumo, error } = await supabase.from('insumos').insert([payload]).select().single()
      if (!error && newInsumo) {
        if (proveedores_ids.length > 0) await supabase.from('insumo_proveedores').insert(proveedores_ids.map(pid => ({ insumo_id: newInsumo.id, proveedor_id: pid })))
        setSaving(false); closeModal(); fetchData()
      } else { setSaving(false); alert("Error al guardar. Verifica que el código no esté duplicado."); console.error(error) }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este insumo?")) return
    const { error } = await supabase.from('insumos').delete().eq('id', id)
    if (!error) fetchData(); else alert("Error al eliminar el insumo")
  }

  // Handlers Grupos
  const handleSaveGrupo = async (e: React.FormEvent) => {
    e.preventDefault(); setSavingGrupo(true)
    if (grupoForm.tipo === 'familia') {
      const id = 'FAM-' + grupoForm.nombre.toUpperCase().replace(/\s/g, '-').slice(0, 8)
      const { error } = await supabase.from('familias').insert([{ id, nombre: grupoForm.nombre, grupo_sugerido: 'material' }])
      if (!error) { fetchData(); setGrupoForm({ nombre: "", tipo: "familia", familia_id: "" }) }
      else alert("Error al crear el grupo. ¿Ya existe?")
    } else {
      const id = 'SF-' + Date.now().toString().slice(-6)
      const { error } = await supabase.from('subfamilias').insert([{ id, nombre: grupoForm.nombre, familia_id: grupoForm.familia_id }])
      if (!error) { fetchData(); setGrupoForm({ nombre: "", tipo: "subfamilia", familia_id: grupoForm.familia_id }) }
      else alert("Error al crear el subgrupo.")
    }
    setSavingGrupo(false)
  }

  const handleDeleteFamilia = async (id: string) => {
    if (!confirm("¿Eliminar este grupo? También eliminará sus subgrupos.")) return
    await supabase.from('familias').delete().eq('id', id); fetchData()
  }

  const handleDeleteSubfamilia = async (id: string) => {
    if (!confirm("¿Eliminar este subgrupo?")) return
    await supabase.from('subfamilias').delete().eq('id', id); fetchData()
  }

  const isPriceOutdated = (fechaIso?: string) => {
    if (!fechaIso) return true
    return new Date(fechaIso) < new Date(new Date().setMonth(new Date().getMonth() - 3))
  }

  const getTipoConfig = (tipo: string) => {
    switch (tipo) {
      case 'material': return { icon: <Package size={14} />, color: 'bg-sky-100 text-sky-700', label: 'Material' }
      case 'equipo': return { icon: <Truck size={14} />, color: 'bg-orange-100 text-orange-700', label: 'Equipo' }
      case 'mano_de_obra': return { icon: <Wrench size={14} />, color: 'bg-emerald-100 text-emerald-700', label: 'Mano Obra' }
      default: return { icon: <FileText size={14} />, color: 'bg-gray-100 text-gray-600', label: tipo }
    }
  }

  const getFamiliaIcon = (grupo: string) => {
    switch (grupo) {
      case 'equipo': return <Truck size={16} className="text-orange-500" />
      case 'mano_de_obra': return <Wrench size={16} className="text-emerald-500" />
      default: return <Package size={16} className="text-sky-500" />
    }
  }

  const subfsPorFamilia = (fid: string) => subfamilias.filter(sf => sf.familia_id === fid)
  const countByFamilia = (fid: string) => {
    const sfIds = subfsPorFamilia(fid).map(sf => sf.id)
    const fam = familias.find(f => f.id === fid)
    return insumos.filter(i => sfIds.includes(i.subfamilia_id || '') || i.tipo === fam?.grupo_sugerido).length
  }
  const countBySubfamilia = (sfid: string) => insumos.filter(i => i.subfamilia_id === sfid).length

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-4 md:p-6 bg-gray-50/50 overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-start md:items-center mb-3 gap-3 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-dark flex items-center gap-2">
            <FileText className="text-brand-sage" /> Catálogo de Insumos
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Gestión centralizada de Materiales, Equipos y Recursos.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsGruposModalOpen(true)} className="border border-gray-300 text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors text-sm flex items-center gap-2">
            <ChevronDown size={16} /> Grupos
          </button>
          <button onClick={openNewModal} className="bg-brand-sage text-white font-bold py-2 px-5 rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-sm text-sm">
            <Plus size={16} /> Nuevo Insumo
          </button>
        </div>
      </div>

      {/* MAIN: 2 PANELES */}
      <div className="flex gap-4 flex-1 overflow-hidden min-h-0">
        
        {/* LEFT: ÁRBOL DE GRUPOS */}
        <div className="w-64 shrink-0 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50 shrink-0">
            <span className="font-bold text-gray-700 text-xs uppercase tracking-wider">Grupos / Subgrupos</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-0.5">
            {/* Todos */}
            <button onClick={() => { setSelectedFamilia(null); setSelectedSubfamilia(null) }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center
                ${!selectedFamilia ? 'bg-brand-sage text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <span className="flex items-center gap-2"><Box size={15} /> Todos</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${!selectedFamilia ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>{insumos.length}</span>
            </button>

            {/* Familias */}
            {familias.map(fam => {
              const subs = subfsPorFamilia(fam.id)
              const isExpanded = expandedFamilias.has(fam.id)
              const isSelected = selectedFamilia === fam.id && !selectedSubfamilia
              return (
                <div key={fam.id}>
                  <button onClick={() => { selectFamilia(fam.id); toggleFamilia(fam.id) }}
                    className={`w-full text-left px-2 py-2 rounded-lg text-sm transition-colors flex items-center gap-1
                      ${isSelected ? 'bg-brand-sage text-white font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <span className="text-gray-400">{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                    <span className="mr-1">{getFamiliaIcon(fam.grupo_sugerido)}</span>
                    <span className="flex-1 truncate text-xs font-semibold">{fam.nombre}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>{countByFamilia(fam.id)}</span>
                  </button>
                  {isExpanded && subs.map(sf => {
                    const isSubSelected = selectedSubfamilia === sf.id
                    return (
                      <button key={sf.id} onClick={() => selectSubfamilia(sf.id, fam.id)}
                        className={`w-full text-left pl-8 pr-2 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between mt-0.5
                          ${isSubSelected ? 'bg-blue-100 text-blue-800 font-semibold border-l-2 border-blue-500' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                        <span className="truncate">• {sf.nombre}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ml-1 ${isSubSelected ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{countBySubfamilia(sf.id)}</span>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT: TABLA DE INSUMOS */}
        <div className="flex-1 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden min-w-0">
          {/* Buscador */}
          <div className="p-3 border-b border-gray-100 bg-gray-50 shrink-0">
            <div className="relative max-w-md">
              <input type="text" placeholder="Buscar por código o nombre..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage focus:border-brand-sage" />
              <Search className="absolute left-3 top-2 text-gray-400" size={16} />
            </div>
          </div>

          {/* Tabla */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-brand-sage" size={32} /></div>
            ) : (
              <table className="w-full text-sm text-left divide-y divide-gray-100">
                <thead className="bg-slate-50 text-slate-600 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold whitespace-nowrap">Código</th>
                    <th className="px-4 py-3 text-xs font-bold">Nombre del Insumo</th>
                    <th className="px-4 py-3 text-xs font-bold whitespace-nowrap">Tipo</th>
                    <th className="px-4 py-3 text-xs font-bold text-center whitespace-nowrap">Unidad</th>
                    <th className="px-4 py-3 text-xs font-bold text-right whitespace-nowrap">Precio Ref. (sin IVA)</th>
                    <th className="px-4 py-3 text-xs font-bold text-center whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedInsumos.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400">No hay insumos en esta categoría.</td></tr>
                  ) : paginatedInsumos.map(insumo => {
                    const outdated = isPriceOutdated(insumo.fecha_actualizacion)
                    const tipo = getTipoConfig(insumo.tipo)
                    const subfamilia = subfamilias.find(sf => sf.id === insumo.subfamilia_id)
                    return (
                      <tr key={insumo.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500 font-semibold whitespace-nowrap">{insumo.codigo || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-800 text-sm">{insumo.nombre}</div>
                          {subfamilia && <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">{subfamilia.nombre}</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${tipo.color}`}>
                            {tipo.icon} {tipo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">{insumo.unidad}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {outdated && <AlertTriangle size={14} className="text-amber-400" title="Precio desactualizado" />}
                            <div>
                              <div className={`font-bold text-sm ${outdated ? 'text-amber-600' : 'text-gray-900'}`}>${Number(insumo.precio_sin_iva).toFixed(4)}</div>
                              <div className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                                <Calendar size={10} />
                                {insumo.fecha_actualizacion ? new Date(insumo.fecha_actualizacion).toLocaleDateString() : 'Nunca'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openEditModal(insumo)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar"><Edit size={15} /></button>
                            <button onClick={() => handleDelete(insumo.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Eliminar"><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Paginación */}
          <div className="p-2 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            <span className="text-xs text-gray-500">
              Mostrando {filteredInsumos.length === 0 ? 0 : startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredInsumos.length)} de {filteredInsumos.length} registros
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-50 transition-colors">‹</button>
              {getPageNumbers().map(num => (
                <button key={num} onClick={() => setCurrentPage(num)}
                  className={`min-w-[28px] h-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${currentPage === num ? 'bg-brand-sage text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
                  {num}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-50 transition-colors">›</button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Nuevo / Editar Insumo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText className="text-brand-sage" size={20} />
                {editingId ? "Editar Insumo" : "Registrar Nuevo Insumo"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Código</label>
                  <input type="text" placeholder="Ej. MAT-001" value={formData.codigo}
                    onChange={e => setFormData({...formData, codigo: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tipo *</label>
                  <select required value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage">
                    <option value="material">Materiales</option>
                    <option value="equipo">Equipos y Maquinaria</option>
                    <option value="mano_de_obra">Mano de Obra</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nombre / Descripción *</label>
                  <input required type="text" placeholder="Ej. Cemento Portland Tipo I (Saco 50kg)" value={formData.nombre}
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Subgrupo</label>
                  <select value={formData.subfamilia_id} onChange={e => setFormData({...formData, subfamilia_id: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage">
                    <option value="">— Sin subgrupo —</option>
                    {familias.map(fam => (
                      <optgroup key={fam.id} label={fam.nombre}>
                        {subfsPorFamilia(fam.id).map(sf => (
                          <option key={sf.id} value={sf.id}>{sf.nombre}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Unidad de Medida *</label>
                  <input required type="text" placeholder="kg, m3, glb, h, u" value={formData.unidad}
                    onChange={e => setFormData({...formData, unidad: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Precio Ref. (sin IVA)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input type="number" step="0.0001" min="0" placeholder="0.0000" value={formData.precio_sin_iva || ''}
                      onChange={e => setFormData({...formData, precio_sin_iva: parseFloat(e.target.value) || 0})}
                      className="w-full pl-8 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Proveedor Principal</label>
                  <select value={formData.proveedor_id} onChange={e => setFormData({...formData, proveedor_id: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage">
                    <option value="">— Sin proveedor —</option>
                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.razon_social}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg text-sm font-bold bg-brand-dark text-white hover:bg-brand-sage transition-colors flex items-center gap-2 disabled:opacity-50">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? "Guardando..." : "Guardar Insumo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Gestión de Grupos y Subgrupos */}
      {isGruposModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ChevronDown className="text-brand-sage" size={20} /> Gestión de Grupos y Subgrupos
              </h2>
              <button onClick={() => setIsGruposModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
              {/* Formulario */}
              <div className="w-full md:w-72 shrink-0 p-5 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Agregar nuevo:</h3>
                <form onSubmit={handleSaveGrupo} className="space-y-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setGrupoForm({...grupoForm, tipo: 'familia'})}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${grupoForm.tipo === 'familia' ? 'bg-brand-dark text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                      Grupo
                    </button>
                    <button type="button" onClick={() => setGrupoForm({...grupoForm, tipo: 'subfamilia'})}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${grupoForm.tipo === 'subfamilia' ? 'bg-brand-dark text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                      Subgrupo
                    </button>
                  </div>
                  {grupoForm.tipo === 'subfamilia' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Pertenece al Grupo</label>
                      <select required value={grupoForm.familia_id} onChange={e => setGrupoForm({...grupoForm, familia_id: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage">
                        <option value="">— Seleccionar —</option>
                        {familias.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nombre</label>
                    <input required type="text" placeholder={grupoForm.tipo === 'familia' ? "Ej. Herramientas" : "Ej. Carpintería"} value={grupoForm.nombre}
                      onChange={e => setGrupoForm({...grupoForm, nombre: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage" />
                  </div>
                  <button type="submit" disabled={savingGrupo} className="w-full py-2 rounded-lg bg-brand-sage text-white text-sm font-bold hover:bg-brand-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                    {savingGrupo ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Agregar
                  </button>
                </form>
              </div>

              {/* Lista de grupos */}
              <div className="flex-1 overflow-y-auto p-5 min-h-0">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Grupos existentes:</h3>
                <div className="space-y-3">
                  {familias.map(fam => (
                    <div key={fam.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="flex justify-between items-center px-4 py-2.5 bg-gray-50">
                        <div className="flex items-center gap-2 font-bold text-sm text-gray-700">
                          {getFamiliaIcon(fam.grupo_sugerido)} {fam.nombre}
                        </div>
                        <button onClick={() => handleDeleteFamilia(fam.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </div>
                      <div className="px-4 py-2 space-y-1">
                        {subfsPorFamilia(fam.id).length === 0 && <p className="text-xs text-gray-400 italic">Sin subgrupos</p>}
                        {subfsPorFamilia(fam.id).map(sf => (
                          <div key={sf.id} className="flex justify-between items-center py-1 pl-4 border-l-2 border-gray-200">
                            <span className="text-xs text-gray-600">• {sf.nombre} <span className="text-gray-400">({countBySubfamilia(sf.id)} insumos)</span></span>
                            <button onClick={() => handleDeleteSubfamilia(sf.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
