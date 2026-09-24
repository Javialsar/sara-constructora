"use client"
import { useState, useEffect } from "react"
import { FileText, Plus, Search, X, Loader2, Edit, Trash2, Box, Truck, Wrench, AlertTriangle, Calendar, ChevronDown, ChevronRight, Package, Layers, ArrowLeft } from "lucide-react"
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

// =============================================
// VISTA: GESTOR DE GRUPOS Y SUBGRUPOS (Pantalla completa 2 paneles)
// =============================================
function GruposManager({
  familias, subfamilias, setFamilias, setSubfamilias, onBack, onRefresh
}: {
  familias: Familia[], subfamilias: Subfamilia[], 
  setFamilias: (f: Familia[]) => void, setSubfamilias: (sf: Subfamilia[]) => void,
  onBack: () => void, onRefresh: () => void
}) {
  const supabase = createClient()
  const [selectedFamilia, setSelectedFamilia] = useState<Familia | null>(null)
  const [saving, setSaving] = useState(false)

  // Formulario inline para grupo
  const [newGrupoNombre, setNewGrupoNombre] = useState("")
  const [newGrupoTipo, setNewGrupoTipo] = useState("material")
  const [showGrupoForm, setShowGrupoForm] = useState(false)

  // Formulario inline para subgrupo
  const [newSubNombre, setNewSubNombre] = useState("")
  const [showSubForm, setShowSubForm] = useState(false)

  const subfsPorFamilia = (fid: string) => subfamilias.filter(sf => sf.familia_id === fid)

  const [subError, setSubError] = useState<string | null>(null)

  const handleAddGrupo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGrupoNombre.trim()) return
    setSaving(true)
    try {
      const id = 'FAM-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      const { data, error } = await supabase.from('familias').insert([{ id, nombre: newGrupoNombre.trim(), grupo_sugerido: newGrupoTipo }]).select()
      
      if (!error && data && data.length > 0) { 
        setNewGrupoNombre(""); setShowGrupoForm(false);
        setFamilias([...familias, data[0]]); 
      } else {
        alert(`Error al crear el grupo: ${error?.message || 'Fallo silencioso'}`)
      }
    } catch (err: any) {
      alert(`Excepción: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteGrupo = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar el grupo "${nombre}"? También eliminará todos sus subgrupos.`)) return
    const { error } = await supabase.from('familias').delete().eq('id', id)
    if (!error) {
      if (selectedFamilia?.id === id) setSelectedFamilia(null)
      setFamilias(familias.filter(f => f.id !== id))
    } else {
      alert("No se puede eliminar el grupo porque tiene elementos asignados.")
    }
  }

  const handleAddSubgrupo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFamilia || !newSubNombre.trim()) return
    setSaving(true)
    setSubError(null)
    try {
      const id = 'SF-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      const { data, error } = await supabase.from('subfamilias').insert([{ id, nombre: newSubNombre.trim(), familia_id: selectedFamilia.id }]).select()
      
      if (!error && data && data.length > 0) { 
        setNewSubNombre(""); setShowSubForm(false); 
        setSubfamilias([...subfamilias, data[0]]);
      } else {
        const msg = error?.message || 'Rechazado por la base de datos (Posible RLS o FK)'
        setSubError(msg)
        alert("Fallo al guardar: " + msg)
      }
    } catch (err: any) {
      setSubError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSubgrupo = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar el subgrupo "${nombre}"?`)) return
    const { error } = await supabase.from('subfamilias').delete().eq('id', id)
    if (error) {
      console.error(error)
      alert("No se puede eliminar este subgrupo porque tiene insumos asignados. Primero reasigna o elimina esos insumos.")
    }
    onRefresh()
  }

  const getFamiliaConfig = (grupo: string) => {
    switch (grupo) {
      case 'equipo': return { icon: <Truck size={18} />, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' }
      case 'mano_de_obra': return { icon: <Wrench size={18} />, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' }
      default: return { icon: <Package size={18} />, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-200', badge: 'bg-sky-100 text-sky-700' }
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-4 md:p-6 bg-gray-50/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-white border border-gray-200">
          <ArrowLeft size={16} /> Volver al Catálogo
        </button>
        <div>
          <h1 className="text-2xl font-black text-brand-dark flex items-center gap-2">
            <Layers className="text-brand-sage" /> Gestión de Grupos y Subgrupos
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Organiza los insumos en grupos y subgrupos para una clasificación precisa.</p>
        </div>
      </div>

      {/* Dos paneles */}
      <div className="flex gap-4 flex-1 overflow-hidden min-h-0">

        {/* PANEL IZQUIERDO: GRUPOS */}
        <div className="w-1/2 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
          {/* Header del panel */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            <div>
              <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Grupos</h2>
              <p className="text-xs text-gray-400">{familias.length} grupos registrados</p>
            </div>
            <button onClick={() => { setShowGrupoForm(!showGrupoForm); setShowSubForm(false) }}
              className={`flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors ${showGrupoForm ? 'bg-gray-200 text-gray-600' : 'bg-brand-sage text-white hover:bg-brand-dark'}`}>
              <Plus size={14} /> Agregar Grupo
            </button>
          </div>

          {/* Formulario agregar grupo */}
          {showGrupoForm && (
            <form onSubmit={handleAddGrupo} className="p-3 border-b border-gray-100 bg-brand-sage/5 flex flex-col gap-2 shrink-0">
              <input
                autoFocus type="text" placeholder="Nombre del grupo (Ej: Herramientas)" value={newGrupoNombre}
                onChange={e => setNewGrupoNombre(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage"
              />
              <select value={newGrupoTipo} onChange={e => setNewGrupoTipo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage">
                <option value="material">Materiales</option>
                <option value="equipo">Equipos y Maquinaria</option>
                <option value="mano_de_obra">Mano de Obra</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-2 bg-brand-sage text-white text-xs font-bold rounded-lg hover:bg-brand-dark transition-colors flex items-center justify-center gap-1 disabled:opacity-50">
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Guardar
                </button>
                <button type="button" onClick={() => setShowGrupoForm(false)} className="px-3 py-2 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
              </div>
            </form>
          )}

          {/* Lista de grupos */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {familias.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Layers size={40} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">No hay grupos creados.</p>
                <p className="text-xs mt-1">Haz clic en "+ Agregar Grupo" para comenzar.</p>
              </div>
            )}
            {familias.map(fam => {
              const cfg = getFamiliaConfig(fam.grupo_sugerido)
              const isSelected = selectedFamilia?.id === fam.id
              const subsCount = subfsPorFamilia(fam.id).length
              return (
                <div key={fam.id}
                  onClick={() => setSelectedFamilia(isSelected ? null : fam)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all group
                    ${isSelected ? `${cfg.bg} ${cfg.border} shadow-sm` : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-white shadow-sm' : 'bg-gray-100 group-hover:bg-white'} transition-colors`}>
                    <span className={cfg.color}>{cfg.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${isSelected ? 'text-gray-800' : 'text-gray-700'}`}>{fam.nombre}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{subsCount} subgrupo{subsCount !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isSelected ? cfg.badge : 'bg-gray-100 text-gray-500'}`}>
                      {fam.grupo_sugerido === 'mano_de_obra' ? 'M.O.' : fam.grupo_sugerido === 'equipo' ? 'Equipo' : 'Material'}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteGrupo(fam.id, fam.nombre) }}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* PANEL DERECHO: SUBGRUPOS */}
        <div className="w-1/2 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
          {/* Header del panel */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            <div>
              <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">
                Subgrupos {selectedFamilia && <span className="text-brand-sage">— {selectedFamilia.nombre}</span>}
              </h2>
              <p className="text-xs text-gray-400">
                {selectedFamilia ? `${subfsPorFamilia(selectedFamilia.id).length} subgrupos en este grupo` : 'Selecciona un grupo para ver sus subgrupos'}
              </p>
            </div>
            {selectedFamilia && (
              <button onClick={() => { setShowSubForm(!showSubForm); setShowGrupoForm(false) }}
                className={`flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors ${showSubForm ? 'bg-gray-200 text-gray-600' : 'bg-brand-sage text-white hover:bg-brand-dark'}`}>
                <Plus size={14} /> Agregar Subgrupo
              </button>
            )}
          </div>

          {/* Formulario agregar subgrupo */}
          {showSubForm && selectedFamilia && (
            <form onSubmit={handleAddSubgrupo} className="p-3 border-b border-gray-100 bg-brand-sage/5 flex flex-col gap-2 shrink-0">
              <input
                autoFocus type="text"
                placeholder={`Subgrupo dentro de "${selectedFamilia.nombre}"`}
                value={newSubNombre} onChange={e => setNewSubNombre(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage"
              />
              <div className="flex gap-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-2 bg-brand-sage text-white text-xs font-bold rounded-lg hover:bg-brand-dark transition-colors flex items-center justify-center gap-1 disabled:opacity-50">
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Guardar
                </button>
                <button type="button" onClick={() => setShowSubForm(false)} className="px-3 py-2 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
              </div>
              {subError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 text-red-600 rounded text-xs font-medium">
                  {subError}
                </div>
              )}
            </form>
          )}

          {/* Lista de subgrupos o estado vacío */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {!selectedFamilia ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <ChevronRight size={48} className="mb-3 opacity-30" />
                <p className="text-sm font-medium">Selecciona un grupo</p>
                <p className="text-xs mt-1">para ver y gestionar sus subgrupos</p>
              </div>
            ) : subfsPorFamilia(selectedFamilia.id).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <Box size={40} className="mb-2 opacity-20" />
                <p className="text-sm font-medium">Sin subgrupos</p>
                <p className="text-xs mt-1">Haz clic en "+ Agregar Subgrupo" para comenzar</p>
              </div>
            ) : (
              subfsPorFamilia(selectedFamilia.id).map(sf => {
                const cfg = getFamiliaConfig(selectedFamilia.grupo_sugerido)
                return (
                  <div key={sf.id} className={`flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group`}>
                    <div className={`w-1.5 h-8 rounded-full ${cfg.bg} border ${cfg.border}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-700 truncate">{sf.nombre}</p>
                      <p className="text-xs text-gray-400 font-mono">{sf.id}</p>
                    </div>
                    <button onClick={() => handleDeleteSubgrupo(sf.id, sf.nombre)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================
// VISTA PRINCIPAL: CATÁLOGO DE INSUMOS
// =============================================
export default function InsumosPage() {
  const supabase = createClient()
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [familias, setFamilias] = useState<Familia[]>([])
  const [subfamilias, setSubfamilias] = useState<Subfamilia[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [insumoProvMap, setInsumoProvMap] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)

  // Vista activa
  const [vista, setVista] = useState<'catalogo' | 'grupos'>('catalogo')

  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [searchCategoryTerm, setSearchCategoryTerm] = useState("")
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

  useEffect(() => { fetchData() }, [])
  useEffect(() => { setCurrentPage(1) }, [searchTerm, selectedFamilia, selectedSubfamilia])
  // Auto-expandir SIEMPRE que cambian las familias (carga inicial + regreso del gestor)
  useEffect(() => {
    if (familias.length > 0) {
      setExpandedFamilias(new Set(familias.map(f => f.id)))
    }
  }, [familias])

  const fetchAll = async (table: string, orderCol?: string) => {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (!count) return [];
    
    const step = 1000;
    const reqs = [];
    for (let i = 0; i < count; i += step) {
      let query = supabase.from(table).select('*');
      if (orderCol) query = query.order(orderCol, { ascending: true });
      reqs.push(query.range(i, i + step - 1));
    }
    
    const results = await Promise.all(reqs);
    let allData: any[] = [];
    for (const { data, error } of results) {
      if (error) console.error('Error fetching ' + table, error);
      if (data) allData = allData.concat(data);
    }
    return allData;
  }

  
  useEffect(() => {
    if (!editingId && isModalOpen) {
      let famCode = formData.tipo.substring(0,3).toUpperCase();
      let subCode = 'GEN';
      
      if (formData.subfamilia_id) {
         const currentSub = subfamilias.find(s => s.id === formData.subfamilia_id);
         if (currentSub) {
            subCode = currentSub.nombre.substring(0,3).toUpperCase();
            const currentFam = familias.find(f => f.id === currentSub.familia_id);
            if (currentFam) {
               famCode = currentFam.nombre.substring(0,3).toUpperCase();
            }
         }
      }
      
      const itemsInSub = insumos.filter(i => formData.subfamilia_id ? i.subfamilia_id === formData.subfamilia_id : (!i.subfamilia_id && i.tipo === formData.tipo));
      let maxSeq = 0;
      itemsInSub.forEach(item => {
         const parts = item.codigo ? item.codigo.split('-') : [];
         if (parts.length > 0) {
           const numStr = parts[parts.length - 1];
           const num = parseInt(numStr, 10);
           if (!isNaN(num) && num > maxSeq) maxSeq = num;
         }
      });
      const seq = maxSeq + 1;
      const generatedCode = `${famCode}-${subCode}-${seq.toString().padStart(3, '0')}`;
      setFormData(prev => prev.codigo !== generatedCode ? { ...prev, codigo: generatedCode } : prev);
    }
  }, [formData.subfamilia_id, formData.tipo, isModalOpen, editingId, insumos, familias, subfamilias]);

  const fetchData = async () => {
    setLoading(true)
    try {
      const [dInsumos, dFamilias, dSubfamilias, dProv, dIP] = await Promise.all([
        fetchAll('insumos', 'nombre'),
        fetchAll('familias', 'nombre').then(data => data.filter(f => f.grupo_sugerido !== 'rubro')),
        fetchAll('subfamilias', 'nombre'),
        supabase.from('proveedores').select('id, razon_social').order('razon_social', { ascending: true }).limit(10000).then(res => res.data || []),
        fetchAll('insumo_proveedores')
      ])
      
      if (dInsumos) setInsumos(dInsumos)
      if (dFamilias) {
        setFamilias(dFamilias)
        setExpandedFamilias(new Set(dFamilias.map((f: Familia) => f.id)))
      }
      if (dSubfamilias) setSubfamilias(dSubfamilias)
      if (dProv) setProveedores(dProv)
      if (dIP) {
        const map: Record<string, string[]> = {}
        dIP.forEach((ip: any) => {
          if (!map[ip.insumo_id]) map[ip.insumo_id] = []
          map[ip.insumo_id].push(ip.proveedor_id)
        })
        setInsumoProvMap(map)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }
  const toggleFamilia = (id: string) => {
    setExpandedFamilias(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }

  const selectFamilia = (id: string) => {
    setSearchTerm("");
    setCurrentPage(1);
    if (selectedFamilia === id && !selectedSubfamilia) { setSelectedFamilia(null) }
    else { setSelectedFamilia(id); setSelectedSubfamilia(null); if (!expandedFamilias.has(id)) toggleFamilia(id) }
  }

  const selectSubfamilia = (id: string, familiaId: string) => {
    setSearchTerm("");
    setCurrentPage(1);
    setSelectedFamilia(familiaId); setSelectedSubfamilia(selectedSubfamilia === id ? null : id)
  }

  let filteredInsumos = insumos.filter(i => {
    const matchSearch = i.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.codigo && i.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
    if (selectedSubfamilia) return matchSearch && i.subfamilia_id === selectedSubfamilia
    if (selectedFamilia) {
      const sfIds = subfamilias.filter(sf => sf.familia_id === selectedFamilia).map(sf => sf.id)
      return matchSearch && sfIds.includes(i.subfamilia_id || '')
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
    setEditingId(insumo.id); setIsModalOpen(true)
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
    if (!confirm("¿Eliminar este insumo de forma permanente?")) return
    
    // Primero, limpiar relaciones seguras (proveedores) para que no bloqueen el borrado
    await supabase.from('insumo_proveedores').delete().eq('insumo_id', id)
    
    const { error } = await supabase.from('insumos').delete().eq('id', id)
    
    if (!error) {
      fetchData()
    } else {
      console.error(error)
      if (error.code === '23503') {
        alert("⚠️ No se puede eliminar este insumo porque está siendo utilizado en la receta de uno o más Rubros (APU).\n\nDebes quitarlo de los Rubros correspondientes antes de poder eliminarlo.")
      } else {
        alert("Error al eliminar el insumo: " + error.message)
      }
    }
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
      case 'equipo': return <Truck size={15} className="text-orange-500" />
      case 'mano_de_obra': return <Wrench size={15} className="text-emerald-500" />
      default: return <Package size={15} className="text-sky-500" />
    }
  }

  const subfsPorFamilia = (fid: string) => subfamilias.filter(sf => sf.familia_id === fid)
  const countByFamilia = (fid: string) => {
    const sfIds = subfsPorFamilia(fid).map(sf => sf.id)
    return insumos.filter(i => sfIds.includes(i.subfamilia_id || '')).length
  }
  const countBySubfamilia = (sfid: string) => insumos.filter(i => i.subfamilia_id === sfid).length

  // ---- RENDER VISTA GRUPOS ----
  if (vista === 'grupos') {
    return (
      <GruposManager
        familias={familias}
        subfamilias={subfamilias}
        setFamilias={setFamilias}
        setSubfamilias={setSubfamilias}
        onBack={() => { setVista('catalogo'); fetchData() }}
        onRefresh={fetchData}
      />
    )
  }

  // ---- RENDER VISTA CATÁLOGO ----
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
          <button onClick={() => setVista('grupos')} className="border border-gray-300 text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-white transition-colors text-sm flex items-center gap-2 shadow-sm">
            <Layers size={15} /> Grupos
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
            <button onClick={() => { setSelectedFamilia(null); setSelectedSubfamilia(null); setSearchTerm(""); setCurrentPage(1); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center
                ${!selectedFamilia ? 'bg-brand-sage text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <span className="flex items-center gap-2"><Box size={15} /> Todos</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${!selectedFamilia ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>{insumos.length}</span>
            </button>
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
          <div className="p-3 border-b border-gray-100 bg-gray-50 shrink-0">
            <div className="relative max-w-md">
              <input type="text" placeholder="Buscar por código o nombre..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage" />
              <Search className="absolute left-3 top-2 text-gray-400" size={16} />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-brand-sage" size={32} /></div>
            ) : (
              <table className="w-full text-sm text-left divide-y divide-gray-100">
                <thead className="bg-slate-50 text-slate-600 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold">Código</th>
                    <th className="px-4 py-3 text-xs font-bold">Nombre del Insumo</th>
                    <th className="px-4 py-3 text-xs font-bold">Tipo</th>
                    <th className="px-4 py-3 text-xs font-bold text-center">Unidad</th>
                    <th className="px-4 py-3 text-xs font-bold text-right">Precio Ref. (sin IVA)</th>
                    <th className="px-4 py-3 text-xs font-bold text-center">Acciones</th>
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
                        <td className="px-4 py-3 font-mono text-xs text-gray-500 font-semibold">{insumo.codigo || "—"}</td>
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
                            {outdated && <span title="Precio desactualizado"><AlertTriangle size={14} className="text-amber-400" /></span>}
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
                            <button onClick={() => openEditModal(insumo)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit size={15} /></button>
                            <button onClick={() => handleDelete(insumo.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

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
                  {/* Fila 1: Subgrupo y Tipo */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Grupo / Subgrupo</label>
                    <select value={formData.subfamilia_id} onChange={e => {
                        const newSubId = e.target.value;
                        let newTipo = formData.tipo;
                        if (newSubId) {
                           const currentSub = subfamilias.find(s => s.id === newSubId);
                           const currentFam = familias.find(f => f.id === currentSub?.familia_id);
                           if (currentFam && currentFam.grupo_sugerido) {
                              newTipo = currentFam.grupo_sugerido;
                           }
                        }
                        setFormData({...formData, subfamilia_id: newSubId, tipo: newTipo});
                      }}
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
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tipo (Categoría) *</label>
                    <select required value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage">
                      <option value="material">Materiales</option>
                      <option value="equipo">Equipos y Maquinaria</option>
                      <option value="mano_de_obra">Mano de Obra</option>
                    </select>
                  </div>

                  {/* Fila 2: Código y Unidad */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Código</label>
                    <input type="text" placeholder="Ej. MAT-001" value={formData.codigo}
                      readOnly={!editingId}
                      onChange={e => setFormData({...formData, codigo: e.target.value})}
                      className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ${!editingId ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed font-mono' : 'border-gray-300 focus:border-brand-sage focus:ring-brand-sage'}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Unidad de Medida *</label>
                    <input required type="text" placeholder="kg, m3, glb, h, u" value={formData.unidad}
                      onChange={e => setFormData({...formData, unidad: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage" />
                  </div>

                  {/* Fila 3: Nombre */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nombre / Descripción *</label>
                    <input required type="text" placeholder="Ej. Cemento Portland Tipo I (Saco 50kg)" value={formData.nombre}
                      onChange={e => setFormData({...formData, nombre: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage" />
                  </div>

                  {/* Fila 4: Precio y Proveedor */}
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
    </div>
  )
}
