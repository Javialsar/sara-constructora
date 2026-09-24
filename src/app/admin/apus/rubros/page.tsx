"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Search, Trash2, X, Save, Box, PenTool, ChevronLeft, ChevronRight, Minus, Edit3, Wrench, HardHat, Package, Layers, ArrowLeft, ChevronDown } from "lucide-react"


// Types
type Familia = { id: string, nombre: string, grupo_sugerido: string }
type Subfamilia = { id: string, nombre: string, familia_id: string }

function GruposManager({
  familias, subfamilias, setFamilias, setSubfamilias, onBack
}: {
  familias: Familia[], subfamilias: Subfamilia[], 
  setFamilias: (f: Familia[]) => void, setSubfamilias: (sf: Subfamilia[]) => void,
  onBack: () => void
}) {
  const supabase = createClient()
  const [selectedFamilia, setSelectedFamilia] = useState<Familia | null>(null)
  const [saving, setSaving] = useState(false)
  const [newGrupoNombre, setNewGrupoNombre] = useState("")
  const [showGrupoForm, setShowGrupoForm] = useState(false)
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
      const { data, error } = await supabase.from('familias').insert([{ id, nombre: newGrupoNombre.trim(), grupo_sugerido: 'rubro' }]).select()
      if (!error && data && data.length > 0) { 
        setNewGrupoNombre(""); setShowGrupoForm(false);
        setFamilias([...familias, data[0]]); 
      } else { alert("Error al crear el grupo: " + (error?.message || '')) }
    } catch (err: any) { alert(err.message) } finally { setSaving(false) }
  }

  const handleDeleteGrupo = async (id: string, nombre: string) => {
    if (!confirm("¿Eliminar el grupo " + nombre + "? También eliminará sus subgrupos.")) return
    const { error } = await supabase.from('familias').delete().eq('id', id)
    if (!error) {
      if (selectedFamilia?.id === id) setSelectedFamilia(null)
      setFamilias(familias.filter(f => f.id !== id))
    } else { alert("No se puede eliminar el grupo porque tiene elementos asignados.") }
  }

  const handleAddSubgrupo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFamilia || !newSubNombre.trim()) return
    setSaving(true)
    try {
      const id = 'SF-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      const { data, error } = await supabase.from('subfamilias').insert([{ id, nombre: newSubNombre.trim(), familia_id: selectedFamilia.id }]).select()
      if (!error && data && data.length > 0) { 
        setNewSubNombre(""); setShowSubForm(false); 
        setSubfamilias([...subfamilias, data[0]]);
      } else { alert("Fallo al guardar: " + (error?.message || '')) }
    } catch (err: any) { alert(err.message) } finally { setSaving(false) }
  }

  const handleDeleteSubgrupo = async (id: string, nombre: string) => {
    if (!confirm("¿Eliminar el subgrupo " + nombre + "?")) return
    const { error } = await supabase.from('subfamilias').delete().eq('id', id)
    if (error) { alert("No se puede eliminar porque tiene rubros asignados.") } 
    else { setSubfamilias(subfamilias.filter(sf => sf.id !== id)) }
  }

  if (vista === "grupos") return <GruposManager familias={familias} subfamilias={subfamilias} setFamilias={setFamilias} setSubfamilias={setSubfamilias} onBack={() => { setVista("catalogo"); fetchRubros() }} />
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-4 md:p-6 bg-gray-50/50 overflow-hidden">
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-white border border-gray-200">
          <ArrowLeft size={16} /> Volver al Catálogo
        </button>
        <div>
          <h1 className="text-2xl font-black text-brand-dark flex items-center gap-2"><Layers className="text-brand-sage" /> Gestión de Grupos de Rubros</h1>
          <p className="text-gray-500 text-sm mt-0.5">Organiza los rubros en categorías estructuradas.</p>
        </div>
      </div>
      <div className="flex gap-4 flex-1 overflow-hidden min-h-0">
        <div className="w-1/2 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            <div><h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Grupos</h2><p className="text-xs text-gray-400">{familias.length} grupos registrados</p></div>
            <button onClick={() => setShowGrupoForm(!showGrupoForm)} className="bg-brand-sage text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1"><Plus size={14} /> Agregar Grupo</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {showGrupoForm && (
              <form onSubmit={handleAddGrupo} className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4 flex flex-col gap-2">
                <input type="text" autoFocus placeholder="Nombre del Grupo (ej: Estructuras)" value={newGrupoNombre} onChange={e => setNewGrupoNombre(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none" />
                <div className="flex justify-end gap-2 mt-1">
                  <button type="button" onClick={() => setShowGrupoForm(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-200 rounded">Cancelar</button>
                  <button type="submit" disabled={saving || !newGrupoNombre.trim()} className="px-3 py-1.5 text-xs font-bold bg-brand-sage text-white rounded hover:bg-brand-dark disabled:opacity-50">Guardar</button>
                </div>
              </form>
            )}
            {familias.map(f => (
              <div key={f.id} onClick={() => setSelectedFamilia(f)} className={"p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center " + (selectedFamilia?.id === f.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-400' : 'bg-white border-gray-100 hover:border-blue-200')}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500 border-blue-200"><Layers size={16} /></div>
                  <div><h3 className="font-bold text-gray-800 text-sm">{f.nombre}</h3><p className="text-xs text-gray-400">{subfsPorFamilia(f.id).length} subgrupos</p></div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteGrupo(f.id, f.nombre) }} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
        <div className="w-1/2 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            <div><h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">SUBGRUPOS {selectedFamilia && <span className="text-brand-sage">— {selectedFamilia.nombre.toUpperCase()}</span>}</h2></div>
            {selectedFamilia && <button onClick={() => setShowSubForm(!showSubForm)} className="bg-brand-sage text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1"><Plus size={14} /> Agregar Subgrupo</button>}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {!selectedFamilia ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center"><ArrowLeft size={32} className="mb-2 opacity-20" /><p className="text-sm font-medium">Selecciona un grupo a la izquierda.</p></div>
            ) : (
              <>
                {showSubForm && (
                  <form onSubmit={handleAddSubgrupo} className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 mb-4 flex flex-col gap-2">
                    <input type="text" autoFocus placeholder="Nombre del Subgrupo" value={newSubNombre} onChange={e => setNewSubNombre(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none" />
                    <div className="flex justify-end gap-2 mt-1">
                      <button type="button" onClick={() => setShowSubForm(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-200 rounded">Cancelar</button>
                      <button type="submit" disabled={saving || !newSubNombre.trim()} className="px-3 py-1.5 text-xs font-bold bg-brand-sage text-white rounded hover:bg-brand-dark disabled:opacity-50">Guardar</button>
                    </div>
                  </form>
                )}
                {subfsPorFamilia(selectedFamilia.id).map(sf => (
                  <div key={sf.id} className="p-2.5 rounded-lg border border-gray-100 bg-white hover:border-gray-300 flex justify-between items-center group">
                    <div className="pl-2 border-l-2 border-brand-sage"><h3 className="font-bold text-gray-700 text-xs">{sf.nombre}</h3></div>
                    <button onClick={() => handleDeleteSubgrupo(sf.id, sf.nombre)} className="p-1.5 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


export default function RubrosPage() {
  const [vista, setVista] = useState<"catalogo"|"grupos">("catalogo");
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [subfamilias, setSubfamilias] = useState<Subfamilia[]>([]);
  const [expandedFamilias, setExpandedFamilias] = useState<Set<string>>(new Set());
  const [selectedFamilia, setSelectedFamilia] = useState<string | null>(null);
  const [selectedSubfamilia, setSelectedSubfamilia] = useState<string | null>(null);

  const supabase = createClient()
  
  const [rubros, setRubros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [newRubroData, setNewRubroData] = useState({
    codigo: '', nombre: '', categoria: '', unidad: 'm3', herramienta_menor_pct: 5.0
  })

  const [currentRubro, setCurrentRubro] = useState<any>(null)
  const [rubroInsumos, setRubroInsumos] = useState<any[]>([])
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  
  const [allInsumos, setAllInsumos] = useState<any[]>([])
  const [searchInsumoTerm, setSearchInsumoTerm] = useState("")
  const [isAddInsumoModalOpen, setIsAddInsumoModalOpen] = useState(false)

  useEffect(() => { fetchRubros(); fetchAllInsumos(); }, [])
  useEffect(() => { setCurrentPage(1) }, [searchTerm, selectedFamilia, selectedSubfamilia])

  const fetchRubros = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('rubros').select('*').order('created_at', { ascending: false })
    if (!error) setRubros(data || [])
    setLoading(false)
  }

  
  const toggleFamilia = (id: string) => { setExpandedFamilias(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n }) }
  const subfsPorFamilia = (fid: string) => subfamilias.filter(sf => sf.familia_id === fid)
  const countByFamilia = (fid: string) => { const sfIds = subfsPorFamilia(fid).map(sf => sf.id); return rubros.filter(r => sfIds.includes(r.subfamilia_id || '')).length }
  const countBySubfamilia = (sfid: string) => rubros.filter(r => r.subfamilia_id === sfid).length
  
  const fetchAllInsumos = async () => {
    const { data } = await supabase.from('insumos').select('*').order('nombre', { ascending: true })
    if (data) setAllInsumos(data)
  }

  const handleCreateRubro = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...newRubroData, subfamilia_id: (newRubroData as any).subfamilia_id || null }; const { data, error } = await supabase.from('rubros').insert([payload]).select().single()
    if (!error) { setIsNewModalOpen(false); fetchRubros(); openEditor(data); }
    else { alert("Error al crear el rubro. Revisa que el código no esté duplicado.") }
  }

  const handleDeleteRubro = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("¿Eliminar este rubro? Esto también borrará su receta.")) return
    await supabase.from('rubros').delete().eq('id', id)
    if (currentRubro && currentRubro.id === id) { setCurrentRubro(null); setRubroInsumos([]); setIsEditorOpen(false); }
    fetchRubros()
  }

  const openEditor = async (rubro: any) => {
    setCurrentRubro(rubro); setIsEditorOpen(true); fetchRubroInsumos(rubro.id)
  }
  const closeEditor = () => { setIsEditorOpen(false) }

  const fetchRubroInsumos = async (rubro_id: string) => {
    const { data, error } = await supabase.from('rubro_insumos')
      .select('id, cantidad, insumo_id, insumos ( id, codigo, nombre, unidad, tipo, precio_sin_iva )')
      .eq('rubro_id', rubro_id)
    if (!error) setRubroInsumos(data || [])
  }

  const handleAddInsumoToRubro = async (insumo: any) => {
    const { error } = await supabase.from('rubro_insumos').insert([{ rubro_id: currentRubro.id, insumo_id: insumo.id, cantidad: 1.000 }])
    if (!error) { setIsAddInsumoModalOpen(false); setSearchInsumoTerm(""); fetchRubroInsumos(currentRubro.id); }
  }

  const handleUpdateCantidad = async (item_id: string, nuevaCantidad: number) => {
    await supabase.from('rubro_insumos').update({ cantidad: nuevaCantidad }).eq('id', item_id)
    fetchRubroInsumos(currentRubro.id)
  }

  const stepCantidad = (item_id: string, currentVal: number, direction: number) => {
    const newVal = Math.max(0, parseFloat((currentVal + direction * 0.01).toFixed(6)))
    handleUpdateCantidad(item_id, newVal)
  }

  const handleRemoveInsumo = async (item_id: string) => {
    await supabase.from('rubro_insumos').delete().eq('id', item_id)
    fetchRubroInsumos(currentRubro.id)
  }

  const calcTotalesReceta = () => {
    let totMateriales = 0, totManoObra = 0, totEquipos = 0;
    rubroInsumos.forEach(item => {
      const costoItem = item.cantidad * (item.insumos.precio_sin_iva || 0);
      if (item.insumos.tipo === 'material') totMateriales += costoItem;
      if (item.insumos.tipo === 'mano_de_obra') totManoObra += costoItem;
      if (item.insumos.tipo === 'equipo') totEquipos += costoItem;
    })
    const herramientaMenor = totManoObra * ((currentRubro?.herramienta_menor_pct || 0) / 100);
    totEquipos += herramientaMenor;
    return { totMateriales, totManoObra, totEquipos, totalCostoDirecto: totMateriales + totManoObra + totEquipos, herramientaMenor }
  }

  const saveRubro = async () => {
    const { totalCostoDirecto } = calcTotalesReceta()
    const { error } = await supabase.from('rubros').update({ herramienta_menor_pct: currentRubro.herramienta_menor_pct, total_costo_directo: totalCostoDirecto }).eq('id', currentRubro.id)
    if (!error) {
      alert("Rubro guardado y costeado correctamente.")
      setRubros(rubros.map(r => r.id === currentRubro.id ? {...r, total_costo_directo: totalCostoDirecto, herramienta_menor_pct: currentRubro.herramienta_menor_pct} : r))
    }
  }

  let filteredRubros = rubros.filter(r => r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || (r.codigo && r.codigo.toLowerCase().includes(searchTerm.toLowerCase())))
  
  if (selectedSubfamilia) { filteredRubros = filteredRubros.filter(r => r.subfamilia_id === selectedSubfamilia) }
  else if (selectedFamilia) { const valid = subfsPorFamilia(selectedFamilia).map(sf=>sf.id); filteredRubros = filteredRubros.filter(r => valid.includes(r.subfamilia_id)) }


  const totalPages = Math.max(1, Math.ceil(filteredRubros.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRubros = filteredRubros.slice(startIndex, startIndex + itemsPerPage)

  const getPageNumbers = () => {
    const pages = []; const max = 5;
    let s = Math.max(1, currentPage - Math.floor(max / 2));
    let e = Math.min(totalPages, s + max - 1);
    if (e - s + 1 < max) s = Math.max(1, e - max + 1);
    for (let i = s; i <= e; i++) pages.push(i);
    return pages;
  }

  const filteredInsumosSearch = allInsumos.filter(i => i.nombre.toLowerCase().includes(searchInsumoTerm.toLowerCase()) || (i.codigo && i.codigo.toLowerCase().includes(searchInsumoTerm.toLowerCase()))).slice(0, 20)

  const mats = rubroInsumos.filter(i => i.insumos.tipo === 'material')
  const mos = rubroInsumos.filter(i => i.insumos.tipo === 'mano_de_obra')
  const eqs = rubroInsumos.filter(i => i.insumos.tipo === 'equipo')
  const { totMateriales, totManoObra, totEquipos, totalCostoDirecto, herramientaMenor } = currentRubro ? calcTotalesReceta() : { totMateriales:0, totManoObra:0, totEquipos:0, totalCostoDirecto:0, herramientaMenor:0 }

  const renderInsumoRow = (item: any) => (
    <tr key={item.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
      <td className="px-4 py-2.5 font-mono text-xs text-gray-500 font-semibold">{item.insumos.codigo}</td>
      <td className="px-4 py-2.5 font-medium text-gray-800 text-sm">{item.insumos.nombre}</td>
      <td className="px-4 py-2.5 text-center">
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">{item.insumos.unidad}</span>
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center justify-end gap-0">
          <button onClick={() => stepCantidad(item.id, item.cantidad, -1)} className="w-7 h-9 flex items-center justify-center rounded-l-md border border-gray-300 bg-gray-50 hover:bg-gray-200 text-gray-500 transition-colors">
            <Minus size={12} />
          </button>
          <input 
            type="text"
            inputMode="decimal"
            value={item.cantidad} 
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || val === '.' || /^\d*\.?\d*$/.test(val)) {
                handleUpdateCantidad(item.id, parseFloat(val) || 0)
              }
            }}
            className="w-28 h-9 text-center border-y border-gray-300 outline-none text-sm font-semibold text-gray-800 focus:border-blue-400 focus:bg-blue-50" 
          />
          <button onClick={() => stepCantidad(item.id, item.cantidad, 1)} className="w-7 h-9 flex items-center justify-center rounded-r-md border border-gray-300 bg-gray-50 hover:bg-gray-200 text-gray-500 transition-colors">
            <Plus size={12} />
          </button>
        </div>
      </td>
      <td className="px-4 py-2.5 text-right text-sm text-gray-500">${Number(item.insumos.precio_sin_iva).toFixed(4)}</td>
      <td className="px-4 py-2.5 text-right font-bold text-gray-900 text-sm">${(item.cantidad * item.insumos.precio_sin_iva).toFixed(4)}</td>
      <td className="px-2 py-2.5 text-center">
        <button onClick={() => handleRemoveInsumo(item.id)} className="p-1.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  )

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-4 md:p-6 bg-gray-50/50 overflow-hidden">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-3 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-dark tracking-tight flex items-center gap-2">
            <PenTool className="text-brand-sage" /> Catálogo de Rubros
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Crea las recetas (Análisis de Precios Unitarios) uniendo materiales, mano de obra y equipos.</p>
        </div>
        <button onClick={() => setIsNewModalOpen(true)} className="bg-brand-sage text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap">
          <Plus size={18} /> Nuevo Rubro
        </button>
      </div>

      {/* MAIN: 2 PANELES QUE LLENAN LA PANTALLA */}
      <div className="flex flex-col md:flex-row gap-4 flex-1 overflow-hidden min-h-0">
        
        
        {/* LEFT: ÁRBOL DE GRUPOS */}
        <div className="w-full md:w-1/4 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50 shrink-0">
            <span className="font-bold text-gray-700 text-xs uppercase tracking-wider">Grupos / Subgrupos</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-0.5">
            <button onClick={() => { setSelectedFamilia(null); setSelectedSubfamilia(null) }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${!selectedFamilia ? 'bg-brand-sage text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <span className="flex items-center gap-2"><Box size={15} /> Todos</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${!selectedFamilia ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>{rubros.length}</span>
            </button>
            {familias.map(fam => {
              const subs = subfsPorFamilia(fam.id)
              const isExpanded = expandedFamilias.has(fam.id)
              const isSelected = selectedFamilia === fam.id && !selectedSubfamilia
              return (
                <div key={fam.id}>
                  <button onClick={() => { setSelectedFamilia(fam.id); setSelectedSubfamilia(null); toggleFamilia(fam.id) }}
                    className={`w-full text-left px-2 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 ${isSelected ? 'bg-brand-sage text-white font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <span className="text-gray-400">{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                    <span className="mr-1"><Layers size={14} /></span>
                    <span className="flex-1 truncate text-xs font-semibold">{fam.nombre}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>{countByFamilia(fam.id)}</span>
                  </button>
                  {isExpanded && subs.map(sf => {
                    const isSubSelected = selectedSubfamilia === sf.id
                    return (
                      <button key={sf.id} onClick={() => { setSelectedFamilia(fam.id); setSelectedSubfamilia(sf.id); }}
                        className={`w-full text-left pl-8 pr-2 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between mt-0.5 ${isSubSelected ? 'bg-blue-100 text-blue-800 font-semibold border-l-2 border-blue-500' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
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

        {/* RIGHT: RUBROS TABLE */}
        <div className="w-full md:w-3/4 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50 flex gap-4 shrink-0">
            <div className="relative w-full max-w-md">
              <input type="text" placeholder="Buscar rubro por código o nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage focus:border-brand-sage" />
              <Search className="absolute left-3 top-2 text-gray-400" size={16} />
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left divide-y divide-gray-200">
              <thead className="bg-slate-50 text-slate-700 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Código</th>
                  <th className="px-4 py-3">Nombre del Rubro</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Unidad</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Costo Directo</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">Cargando...</td></tr>
                ) : paginatedRubros.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-500">No hay rubros en esta categoría.</td></tr>
                ) : (
                  paginatedRubros.map((r) => (
                    <tr key={r.id} className="transition-colors cursor-pointer hover:bg-blue-50 border-l-4 border-transparent hover:border-blue-400" onClick={() => openEditor(r)}>
                      <td className="px-4 py-2.5 font-mono text-xs text-brand-sage font-bold whitespace-nowrap">{r.codigo}</td>
                      <td className="px-4 py-2.5 font-medium text-gray-800 leading-tight">{r.nombre}</td>
                      <td className="px-4 py-2.5 text-center"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">{r.unidad}</span></td>
                      <td className="px-4 py-2.5 text-right font-black text-brand-dark whitespace-nowrap">${Number(r.total_costo_directo || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); openEditor(r); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar APU"><Edit3 size={16} /></button>
                          <button onClick={(e) => handleDeleteRubro(r.id, e)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Eliminar"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-2 border-t border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-2 shrink-0">
            <span className="text-xs text-gray-500">Mostrando {filteredRubros.length === 0 ? 0 : startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredRubros.length)} de {filteredRubros.length} registros</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-50 transition-colors"><ChevronLeft size={16} /></button>
              {getPageNumbers().map(num => (
                <button key={num} onClick={() => setCurrentPage(num)} className={`min-w-[28px] h-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${currentPage === num ? 'bg-brand-sage text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>{num}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-50 transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MODAL APU EDITOR ===== */}
      {isEditorOpen && currentRubro && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="bg-brand-dark text-white px-5 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <PenTool size={20} className="text-brand-sage shrink-0" />
                <div className="min-w-0">
                  <h2 className="font-bold text-base flex items-center gap-2 truncate">
                    <span className="text-brand-sage font-mono text-sm bg-white/10 px-2 py-0.5 rounded">{currentRubro.codigo}</span>
                    <span className="truncate">{currentRubro.nombre}</span>
                  </h2>
                  <p className="text-white/50 text-xs mt-0.5">Unidad: <span className="text-white/80 font-bold">{currentRubro.unidad}</span></p>
                </div>
              </div>
              <button onClick={closeEditor} className="text-white/50 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors shrink-0"><X size={22} /></button>
            </div>

            {/* Summary Cards */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 shrink-0">
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-white rounded-lg border border-purple-100 px-3 py-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <Wrench size={14} className="text-purple-400" />
                    <span className="text-xs font-semibold text-purple-600">Equipos</span>
                  </div>
                  <div className="text-lg font-black text-purple-700">${totEquipos.toFixed(2)}</div>
                </div>
                <div className="bg-white rounded-lg border border-amber-100 px-3 py-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <HardHat size={14} className="text-amber-400" />
                    <span className="text-xs font-semibold text-amber-600">Mano de Obra</span>
                  </div>
                  <div className="text-lg font-black text-amber-700">${totManoObra.toFixed(2)}</div>
                </div>
                <div className="bg-white rounded-lg border border-sky-100 px-3 py-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <Package size={14} className="text-sky-400" />
                    <span className="text-xs font-semibold text-sky-600">Materiales</span>
                  </div>
                  <div className="text-lg font-black text-sky-700">${totMateriales.toFixed(2)}</div>
                </div>
                <div className="bg-brand-dark rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <Save size={14} className="text-brand-sage" />
                    <span className="text-xs font-semibold text-white/60">Costo Directo</span>
                  </div>
                  <div className="text-lg font-black text-brand-sage">${totalCostoDirecto.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
              
              {/* EQUIPOS */}
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-purple-50 text-purple-800 px-4 py-2 flex justify-between items-center border-b border-purple-100">
                  <div className="flex items-center gap-2"><Wrench size={15} className="text-purple-400" /><span className="font-bold text-xs uppercase tracking-wide">1. Equipos y Maquinaria</span></div>
                  <span className="font-black text-sm">${totEquipos.toFixed(4)}</span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600"><tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold">Código</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold">Descripción</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold">Unid.</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Cantidad</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Costo U.</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Subtotal</th>
                    <th className="px-2 py-2 w-8"></th>
                  </tr></thead>
                  <tbody>
                    {eqs.length === 0 && <tr><td colSpan={7} className="px-4 py-3 text-center text-gray-400 italic text-sm">No hay equipos asignados</td></tr>}
                    {eqs.map(item => renderInsumoRow(item))}
                    <tr className="bg-purple-50/40 border-t border-purple-100">
                      <td colSpan={3} className="px-4 py-2.5 text-right text-sm text-purple-700 font-medium">
                        Herramienta Menor:
                        <input type="number" value={currentRubro.herramienta_menor_pct} onChange={(e) => setCurrentRubro({...currentRubro, herramienta_menor_pct: parseFloat(e.target.value)||0})} 
                          className="w-12 h-7 text-center border border-purple-200 rounded mx-2 font-bold text-purple-800 outline-none text-xs" />
                        <span className="text-purple-400">% s/M.O.</span>
                      </td>
                      <td colSpan={3} className="px-4 py-2.5 text-right font-bold text-purple-800 text-sm">${herramientaMenor.toFixed(4)}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* MANO DE OBRA */}
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-amber-50 text-amber-800 px-4 py-2 flex justify-between items-center border-b border-amber-100">
                  <div className="flex items-center gap-2"><HardHat size={15} className="text-amber-400" /><span className="font-bold text-xs uppercase tracking-wide">2. Mano de Obra</span></div>
                  <span className="font-black text-sm">${totManoObra.toFixed(4)}</span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600"><tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold">Código</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold">Descripción</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold">Unid.</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Cantidad</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Costo U.</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Subtotal</th>
                    <th className="px-2 py-2 w-8"></th>
                  </tr></thead>
                  <tbody>
                    {mos.length === 0 && <tr><td colSpan={7} className="px-4 py-3 text-center text-gray-400 italic text-sm">No hay mano de obra asignada</td></tr>}
                    {mos.map(item => renderInsumoRow(item))}
                  </tbody>
                </table>
              </div>

              {/* MATERIALES */}
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-sky-50 text-sky-800 px-4 py-2 flex justify-between items-center border-b border-sky-100">
                  <div className="flex items-center gap-2"><Package size={15} className="text-sky-400" /><span className="font-bold text-xs uppercase tracking-wide">3. Materiales</span></div>
                  <span className="font-black text-sm">${totMateriales.toFixed(4)}</span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600"><tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold">Código</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold">Descripción</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold">Unid.</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Cantidad</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Costo U.</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">Subtotal</th>
                    <th className="px-2 py-2 w-8"></th>
                  </tr></thead>
                  <tbody>
                    {mats.length === 0 && <tr><td colSpan={7} className="px-4 py-3 text-center text-gray-400 italic text-sm">No hay materiales asignados</td></tr>}
                    {mats.map(item => renderInsumoRow(item))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
              <button onClick={() => setIsAddInsumoModalOpen(true)} className="bg-brand-dark text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-sage hover:text-brand-dark transition-colors flex items-center gap-2 text-sm">
                <Plus size={16} /> Agregar Insumo
              </button>
              <div className="flex items-center gap-3">
                <button onClick={closeEditor} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-200 transition-colors">Cerrar</button>
                <button onClick={saveRubro} className="bg-brand-sage text-white font-bold py-2 px-5 rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2 text-sm shadow-sm">
                  <Save size={16} /> Guardar y Costear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Nuevo Rubro */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">Crear Nuevo Rubro</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateRubro} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Código</label><input type="text" value={newRubroData.codigo} onChange={e => setNewRubroData({...newRubroData, codigo: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage text-sm" placeholder="Ej. HOR-001" required /></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Unidad</label><input type="text" value={newRubroData.unidad} onChange={e => setNewRubroData({...newRubroData, unidad: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage text-sm" placeholder="m3, m2, ml, glb" required /></div>
              </div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nombre del Rubro</label><input type="text" value={newRubroData.nombre} onChange={e => setNewRubroData({...newRubroData, nombre: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage text-sm" placeholder="Ej. Hormigón simple f'c=210" required /></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Subgrupo</label>
  <select required value={(newRubroData as any).subfamilia_id || ''} onChange={e => setNewRubroData({...newRubroData, subfamilia_id: e.target.value} as any)} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage text-sm bg-white">
    <option value="">Seleccione...</option>
    {familias.map(f => (
      <optgroup key={f.id} label={f.nombre}>
        {subfsPorFamilia(f.id).map(sf => <option key={sf.id} value={sf.id}>{sf.nombre}</option>)}
      </optgroup>
    ))}
  </select></div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsNewModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-bold bg-brand-dark text-white hover:bg-brand-sage transition-colors">Crear Rubro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Buscar Insumo (z-60 para estar ENCIMA del modal APU) */}
      {isAddInsumoModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-100 flex gap-4 items-center bg-gray-50/50 shrink-0">
              <Search className="text-gray-400" size={20} />
              <input type="text" autoFocus placeholder="Buscar insumo por nombre o código..." value={searchInsumoTerm} onChange={(e) => setSearchInsumoTerm(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-lg text-gray-800 placeholder:text-gray-400" />
              <button onClick={() => setIsAddInsumoModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="overflow-y-auto p-2 grow">
              {searchInsumoTerm.length < 2 ? (
                <div className="text-center py-12 text-gray-400">Escribe al menos 2 letras para buscar.</div>
              ) : filteredInsumosSearch.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No hay insumos que coincidan.</div>
              ) : (
                <div className="space-y-1">
                  {filteredInsumosSearch.map(insumo => (
                    <div key={insumo.id} className="flex justify-between items-center p-3 hover:bg-gray-50 border border-transparent hover:border-gray-100 rounded-lg transition-colors cursor-pointer" onClick={() => handleAddInsumoToRubro(insumo)}>
                      <div className="flex gap-3 items-center">
                        <div className={`p-2 rounded-lg text-white ${insumo.tipo === 'material' ? 'bg-sky-500' : insumo.tipo === 'mano_de_obra' ? 'bg-amber-500' : 'bg-purple-500'}`}><Box size={16} /></div>
                        <div><div className="font-bold text-sm text-gray-800">{insumo.nombre}</div><div className="text-xs text-gray-500 font-mono">{insumo.codigo} • {insumo.tipo}</div></div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right"><div className="font-bold text-sm text-brand-dark">${Number(insumo.precio_sin_iva).toFixed(2)}</div><div className="text-xs text-gray-400">/ {insumo.unidad}</div></div>
                        <div className="bg-brand-sage text-white p-1.5 rounded hover:bg-brand-dark transition-colors"><Plus size={16} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
