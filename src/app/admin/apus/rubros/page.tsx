"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Search, Trash2, X, Save, Box, PenTool, ChevronLeft, ChevronRight, Minus, Edit3, Wrench, HardHat, Package, Layers, ArrowLeft, ChevronDown } from "lucide-react"

// Types
type Familia = { id: string, nombre: string, grupo_sugerido: string }
type Subfamilia = { id: string, nombre: string, familia_id: string }

// =============================================
// VISTA: GESTOR DE GRUPOS Y SUBGRUPOS
// =============================================
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
      } else {
        alert(`Error al crear el grupo: ${error?.message || 'Fallo silencioso'}`)
      }
    } catch (err: any) { alert(`Excepción: ${err.message}`)
    } finally { setSaving(false) }
  }

  const handleDeleteGrupo = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar el grupo "${nombre}"? También eliminará todos sus subgrupos.`)) return
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
    setSubError(null)
    try {
      const id = 'SF-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      const { data, error } = await supabase.from('subfamilias').insert([{ id, nombre: newSubNombre.trim(), familia_id: selectedFamilia.id }]).select()
      
      if (!error && data && data.length > 0) { 
        setNewSubNombre(""); setShowSubForm(false); 
        setSubfamilias([...subfamilias, data[0]]);
      } else {
        const msg = error?.message || 'Rechazado'
        setSubError(msg); alert("Fallo al guardar: " + msg)
      }
    } catch (err: any) { setSubError(err.message)
    } finally { setSaving(false) }
  }

  const handleDeleteSubgrupo = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar el subgrupo "${nombre}"?`)) return
    const { error } = await supabase.from('subfamilias').delete().eq('id', id)
    if (error) {
      alert("No se puede eliminar este subgrupo porque tiene rubros asignados.")
    } else {
      setSubfamilias(subfamilias.filter(sf => sf.id !== id))
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-4 md:p-6 bg-gray-50/50 overflow-hidden">
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-white border border-gray-200">
          <ArrowLeft size={16} /> Volver al Catálogo
        </button>
        <div>
          <h1 className="text-2xl font-black text-brand-dark flex items-center gap-2">
            <Layers className="text-brand-sage" /> Gestión de Grupos de Rubros
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Organiza los rubros en categorías estructuradas.</p>
        </div>
      </div>

      <div className="flex gap-4 flex-1 overflow-hidden min-h-0">
        <div className="w-1/2 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            <div>
              <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Grupos</h2>
              <p className="text-xs text-gray-400">{familias.length} grupos registrados</p>
            </div>
            <button onClick={() => setShowGrupoForm(!showGrupoForm)} className="bg-brand-sage text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1">
              <Plus size={14} /> Agregar Grupo
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {showGrupoForm && (
              <form onSubmit={handleAddGrupo} className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4 flex flex-col gap-2">
                <input type="text" autoFocus placeholder="Nombre del Grupo (ej: Estructuras)" value={newGrupoNombre} onChange={e => setNewGrupoNombre(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage" />
                <div className="flex justify-end gap-2 mt-1">
                  <button type="button" onClick={() => setShowGrupoForm(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-200 rounded">Cancelar</button>
                  <button type="submit" disabled={saving || !newGrupoNombre.trim()} className="px-3 py-1.5 text-xs font-bold bg-brand-sage text-white rounded hover:bg-brand-dark disabled:opacity-50">Guardar</button>
                </div>
              </form>
            )}
            {familias.map(f => (
              <div key={f.id} onClick={() => setSelectedFamilia(f)} className={`p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${selectedFamilia?.id === f.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-400' : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500 border-blue-200`}>
                    <Layers size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{f.nombre}</h3>
                    <p className="text-xs text-gray-400">{subfsPorFamilia(f.id).length} subgrupos</p>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteGrupo(f.id, f.nombre) }} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={15} /></button>
              </div>
            ))}
            {familias.length === 0 && !showGrupoForm && <div className="text-center py-10 text-gray-400 text-sm">No hay grupos creados.</div>}
          </div>
        </div>

        <div className="w-1/2 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            <div>
              <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">
                SUBGRUPOS {selectedFamilia && <span className="text-brand-sage">— {selectedFamilia.nombre.toUpperCase()}</span>}
              </h2>
              <p className="text-xs text-gray-400">{selectedFamilia ? `${subfsPorFamilia(selectedFamilia.id).length} subgrupos en este grupo` : 'Selecciona un grupo primero'}</p>
            </div>
            {selectedFamilia && (
              <button onClick={() => setShowSubForm(!showSubForm)} className="bg-brand-sage text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1">
                <Plus size={14} /> Agregar Subgrupo
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {!selectedFamilia ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                <ArrowLeft size={32} className="mb-2 opacity-20" />
                <p className="text-sm font-medium">Selecciona un grupo a la izquierda para ver y gestionar sus subgrupos.</p>
              </div>
            ) : (
              <>
                {showSubForm && (
                  <form onSubmit={handleAddSubgrupo} className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 mb-4 flex flex-col gap-2">
                    <input type="text" autoFocus placeholder="Nombre del Subgrupo (ej: Hormigón Armado)" value={newSubNombre} onChange={e => setNewSubNombre(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage" />
                    {subError && <p className="text-xs text-red-500">{subError}</p>}
                    <div className="flex justify-end gap-2 mt-1">
                      <button type="button" onClick={() => setShowSubForm(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-200 rounded">Cancelar</button>
                      <button type="submit" disabled={saving || !newSubNombre.trim()} className="px-3 py-1.5 text-xs font-bold bg-brand-sage text-white rounded hover:bg-brand-dark disabled:opacity-50">Guardar</button>
                    </div>
                  </form>
                )}
                {subfsPorFamilia(selectedFamilia.id).map(sf => (
                  <div key={sf.id} className="p-2.5 rounded-lg border border-gray-100 bg-white hover:border-gray-300 transition-colors flex justify-between items-center group">
                    <div className="pl-2 border-l-2 border-brand-sage">
                      <h3 className="font-bold text-gray-700 text-xs">{sf.nombre}</h3>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{sf.id}</p>
                    </div>
                    <button onClick={() => handleDeleteSubgrupo(sf.id, sf.nombre)} className="p-1.5 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                  </div>
                ))}
                {subfsPorFamilia(selectedFamilia.id).length === 0 && !showSubForm && <div className="text-center py-10 text-gray-400 text-sm">Este grupo aún no tiene subgrupos.</div>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


// =============================================
// VISTA PRINCIPAL
// =============================================
export default function RubrosPage() {
  const supabase = createClient()
  
  const [vista, setVista] = useState<'catalogo'|'grupos'>('catalogo')
  
  const [rubros, setRubros] = useState<any[]>([])
  const [familias, setFamilias] = useState<Familia[]>([])
  const [subfamilias, setSubfamilias] = useState<Subfamilia[]>([])
  
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Arbol State
  const [selectedFamilia, setSelectedFamilia] = useState<string | null>(null)
  const [selectedSubfamilia, setSelectedSubfamilia] = useState<string | null>(null)
  const [expandedFamilias, setExpandedFamilias] = useState<Set<string>>(new Set())
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [newRubroData, setNewRubroData] = useState({
    codigo: '', nombre: '', subfamilia_id: '', unidad: 'm3', herramienta_menor_pct: 5.0
  })

  const [currentRubro, setCurrentRubro] = useState<any>(null)
  const [rubroInsumos, setRubroInsumos] = useState<any[]>([])
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  
  const [allInsumos, setAllInsumos] = useState<any[]>([])
  const [searchInsumoTerm, setSearchInsumoTerm] = useState("")
  const [isAddInsumoModalOpen, setIsAddInsumoModalOpen] = useState(false)

  const fetchAll = async (table: string, filter?: {col: string, val: string}) => {
    let allData: any[] = []
    let from = 0
    const step = 1000
    while (true) {
      let q = supabase.from(table).select('*')
      if (filter) q = q.eq(filter.col, filter.val)
      const { data } = await q.range(from, from + step - 1)
      if (data && data.length > 0) {
        allData = allData.concat(data)
        if (data.length < step) break
        from += step
      } else break
    }
    return allData
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [dRubros, dFamilias, dSubfamilias, dInsumos] = await Promise.all([
        fetchAll('rubros'),
        fetchAll('familias', { col: 'grupo_sugerido', val: 'rubro' }),
        fetchAll('subfamilias'),
        fetchAll('insumos')
      ])
      
      if (dRubros) setRubros(dRubros.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
      if (dFamilias) {
        dFamilias.sort((a,b) => a.nombre.localeCompare(b.nombre))
        setFamilias(dFamilias)
        setExpandedFamilias(new Set(dFamilias.map((f: Familia) => f.id)))
      }
      if (dSubfamilias) setSubfamilias(dSubfamilias.sort((a,b) => a.nombre.localeCompare(b.nombre)))
      if (dInsumos) setAllInsumos(dInsumos.sort((a,b) => a.nombre.localeCompare(b.nombre)))
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])
  useEffect(() => { setCurrentPage(1) }, [searchTerm, selectedFamilia, selectedSubfamilia])

  const toggleFamilia = (id: string) => {
    setExpandedFamilias(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }

  const selectFamilia = (id: string) => {
    setSelectedFamilia(id); setSelectedSubfamilia(null);
  }

  const selectSubfamilia = (sfid: string, fid: string) => {
    setSelectedFamilia(fid); setSelectedSubfamilia(sfid);
  }

  const subfsPorFamilia = (fid: string) => subfamilias.filter(sf => sf.familia_id === fid)
  const countByFamilia = (fid: string) => {
    const sfIds = subfsPorFamilia(fid).map(sf => sf.id)
    return rubros.filter(r => sfIds.includes(r.subfamilia_id || '')).length
  }
  const countBySubfamilia = (sfid: string) => rubros.filter(r => r.subfamilia_id === sfid).length

  const handleCreateRubro = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...newRubroData, subfamilia_id: newRubroData.subfamilia_id || null }
    const { data, error } = await supabase.from('rubros').insert([payload]).select().single()
    if (!error) { 
      setIsNewModalOpen(false)
      setRubros([data, ...rubros])
      openEditor(data)
    } else { alert("Error al crear el rubro. Revisa que el código no esté duplicado.") }
  }

  const handleDeleteRubro = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("¿Eliminar este rubro? Esto también borrará su receta.")) return
    await supabase.from('rubros').delete().eq('id', id)
    if (currentRubro && currentRubro.id === id) { setCurrentRubro(null); setRubroInsumos([]); setIsEditorOpen(false); }
    setRubros(rubros.filter(r => r.id !== id))
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
  
  if (selectedSubfamilia) {
    filteredRubros = filteredRubros.filter(r => r.subfamilia_id === selectedSubfamilia)
  } else if (selectedFamilia) {
    const validSubIds = subfsPorFamilia(selectedFamilia).map(sf => sf.id)
    filteredRubros = filteredRubros.filter(r => r.subfamilia_id && validSubIds.includes(r.subfamilia_id))
  }

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
      <td className="px-4 py-2.5 text-center"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">{item.insumos.unidad}</span></td>
      <td className="px-4 py-2.5">
        <div className="flex items-center justify-end gap-0">
          <button onClick={() => stepCantidad(item.id, item.cantidad, -1)} className="w-7 h-9 flex items-center justify-center rounded-l-md border border-gray-300 bg-gray-50 hover:bg-gray-200 text-gray-500 transition-colors"><Minus size={12} /></button>
          <input type="text" inputMode="decimal" value={item.cantidad} onChange={(e) => { const val = e.target.value; if (val === '' || val === '.' || /^\d*\.?\d*$/.test(val)) handleUpdateCantidad(item.id, parseFloat(val) || 0) }} className="w-28 h-9 text-center border-y border-gray-300 outline-none text-sm font-semibold text-gray-800 focus:border-blue-400 focus:bg-blue-50" />
          <button onClick={() => stepCantidad(item.id, item.cantidad, 1)} className="w-7 h-9 flex items-center justify-center rounded-r-md border border-gray-300 bg-gray-50 hover:bg-gray-200 text-gray-500 transition-colors"><Plus size={12} /></button>
        </div>
      </td>
      <td className="px-4 py-2.5 text-right text-sm text-gray-500">${Number(item.insumos.precio_sin_iva).toFixed(4)}</td>
      <td className="px-4 py-2.5 text-right font-bold text-gray-900 text-sm">${(item.cantidad * item.insumos.precio_sin_iva).toFixed(4)}</td>
      <td className="px-2 py-2.5 text-center"><button onClick={() => handleRemoveInsumo(item.id)} className="p-1.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button></td>
    </tr>
  )

  if (vista === 'grupos') {
    return <GruposManager familias={familias} subfamilias={subfamilias} setFamilias={setFamilias} setSubfamilias={setSubfamilias} onBack={() => { setVista('catalogo'); fetchData() }} />
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-4 md:p-6 bg-gray-50/50 overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-start md:items-center mb-3 gap-3 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-dark flex items-center gap-2">
            <PenTool className="text-brand-sage" /> Catálogo de Rubros
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Crea las recetas (Análisis de Precios Unitarios) uniendo materiales, mano de obra y equipos.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setVista('grupos')} className="border border-gray-300 text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-white transition-colors text-sm flex items-center gap-2 shadow-sm">
            <Layers size={15} /> Grupos
          </button>
          <button onClick={() => setIsNewModalOpen(true)} className="bg-brand-sage text-white font-bold py-2 px-5 rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-sm text-sm">
            <Plus size={16} /> Nuevo Rubro
          </button>
        </div>
      </div>

      {/* MAIN: 2 PANELES QUE LLENAN LA PANTALLA */}
      <div className="flex gap-4 flex-1 overflow-hidden min-h-0">
        
        {/* LEFT: ÁRBOL DE GRUPOS */}
        <div className="w-64 shrink-0 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50 shrink-0">
            <span className="font-bold text-gray-700 text-xs uppercase tracking-wider">Grupos / Subgrupos</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-0.5">
            <button onClick={() => { setSelectedFamilia(null); setSelectedSubfamilia(null) }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center
                ${!selectedFamilia ? 'bg-brand-sage text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <span className="flex items-center gap-2"><Box size={15} /> Todos</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${!selectedFamilia ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>{rubros.length}</span>
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
                    <span className="mr-1"><Layers size={14} /></span>
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

        {/* RIGHT: RUBROS TABLE */}
        <div className="flex-1 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden min-w-0">
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
                  <tr><td colSpan={5} className="text-center py-8 text-gray-500">No hay rubros en este grupo.</td></tr>
                ) : (
                  paginatedRubros.map(rubro => (
                    <tr key={rubro.id} className="hover:bg-blue-50/50 transition-colors cursor-pointer group" onClick={() => openEditor(rubro)}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{rubro.codigo}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{rubro.nombre}</td>
                      <td className="px-4 py-3 text-center"><span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded text-xs font-bold">{rubro.unidad}</span></td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">${Number(rubro.total_costo_directo || 0).toFixed(4)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); openEditor(rubro) }} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded" title="Editar receta"><Edit3 size={16} /></button>
                          <button onClick={(e) => handleDeleteRubro(rubro.id, e)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Eliminar"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-gray-100 bg-white flex justify-between items-center shrink-0">
            <span className="text-xs text-gray-500">Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredRubros.length)} de {filteredRubros.length} registros</span>
            <div className="flex gap-1">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"><ChevronLeft size={16} /></button>
              {getPageNumbers().map(p => (
                <button key={p} onClick={() => setCurrentPage(p)} className={`w-7 h-7 rounded text-xs font-medium flex items-center justify-center ${currentPage === p ? 'bg-brand-sage text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
              ))}
              <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
              <h2 className="font-bold flex items-center gap-2"><Plus size={18} /> Nuevo Rubro</h2>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateRubro} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Código</label>
                <input required type="text" value={newRubroData.codigo} onChange={e => setNewRubroData({...newRubroData, codigo: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-sage" placeholder="RUB-001" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre / Descripción</label>
                <textarea required rows={3} value={newRubroData.nombre} onChange={e => setNewRubroData({...newRubroData, nombre: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-sage" placeholder="Hormigón simple f'c=210 kg/cm2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Unidad</label>
                  <input required type="text" value={newRubroData.unidad} onChange={e => setNewRubroData({...newRubroData, unidad: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-sage" placeholder="m3, m2, u" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subgrupo</label>
                  <select required value={newRubroData.subfamilia_id} onChange={e => setNewRubroData({...newRubroData, subfamilia_id: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-sage bg-white">
                    <option value="">Seleccione...</option>
                    {familias.map(f => (
                      <optgroup key={f.id} label={f.nombre}>
                        {subfsPorFamilia(f.id).map(sf => (
                          <option key={sf.id} value={sf.id}>{sf.nombre}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsNewModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold bg-brand-sage text-white rounded-lg hover:bg-brand-dark transition-colors">Crear y Editar Receta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditorOpen && currentRubro && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-slate-800 p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-500/20 text-blue-200 px-2 py-0.5 rounded text-xs font-mono border border-blue-500/30">{currentRubro.codigo}</span>
                  <h2 className="font-bold text-lg">{currentRubro.nombre}</h2>
                </div>
                <span className="text-slate-400 text-xs mt-1">Unidad: {currentRubro.unidad}</span>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={saveRubro} className="bg-brand-sage hover:bg-brand-sage/90 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"><Save size={16} /> Guardar Cambios</button>
                <button onClick={closeEditor} className="p-1 text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-gray-50 p-6">
              <div className="flex justify-between items-end mb-4">
                <h3 className="font-black text-gray-800 uppercase tracking-tight flex items-center gap-2"><Layers className="text-brand-sage" size={20} /> Receta del Rubro (APU)</h3>
                <button onClick={() => setIsAddInsumoModalOpen(true)} className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"><Plus size={16} /> Agregar Insumo</button>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-gray-200 text-xs uppercase">
                    <tr><th className="px-4 py-3">Código</th><th className="px-4 py-3">Descripción</th><th className="px-4 py-3 text-center">Und</th><th className="px-4 py-3 text-center">Rendimiento / Cantidad</th><th className="px-4 py-3 text-right">Precio Unit.</th><th className="px-4 py-3 text-right">Costo Total</th><th className="px-4 py-3 text-center">Quitar</th></tr>
                  </thead>
                  <tbody>
                    <tr className="bg-brand-sage/10 border-y border-brand-sage/20"><td colSpan={7} className="px-4 py-2 text-xs font-black text-brand-dark uppercase tracking-wider flex items-center gap-2"><Box size={14} /> Materiales</td></tr>
                    {mats.length === 0 ? <tr><td colSpan={7} className="px-4 py-3 text-center text-gray-400 text-sm">No hay materiales agregados</td></tr> : mats.map(renderInsumoRow)}
                    <tr className="bg-emerald-50 border-y border-emerald-100"><td colSpan={7} className="px-4 py-2 text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-2"><Wrench size={14} /> Mano de Obra</td></tr>
                    {mos.length === 0 ? <tr><td colSpan={7} className="px-4 py-3 text-center text-gray-400 text-sm">No hay mano de obra agregada</td></tr> : mos.map(renderInsumoRow)}
                    <tr className="bg-orange-50 border-y border-orange-100"><td colSpan={7} className="px-4 py-2 text-xs font-black text-orange-800 uppercase tracking-wider flex items-center gap-2"><HardHat size={14} /> Equipos</td></tr>
                    {eqs.length === 0 ? <tr><td colSpan={7} className="px-4 py-3 text-center text-gray-400 text-sm">No hay equipos agregados</td></tr> : eqs.map(renderInsumoRow)}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-800 rounded-xl p-6 shadow-lg text-white grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">Parámetros Adicionales</h4>
                  <div className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                    <span className="text-sm font-medium">% Herramienta Menor (sobre M.O.)</span>
                    <div className="flex items-center gap-2">
                      <input type="number" step="0.1" value={currentRubro.herramienta_menor_pct} onChange={(e) => setCurrentRubro({...currentRubro, herramienta_menor_pct: parseFloat(e.target.value) || 0})} className="w-20 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-center outline-none focus:border-brand-sage" />
                      <span className="text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">Resumen de Costos Directos</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-300">Total Materiales:</span><span className="font-mono font-medium">${totMateriales.toFixed(4)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-300">Total Mano de Obra:</span><span className="font-mono font-medium">${totManoObra.toFixed(4)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-300">Equipos Directos:</span><span className="font-mono font-medium">${(totEquipos - herramientaMenor).toFixed(4)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-300">Herramienta Menor ({currentRubro.herramienta_menor_pct}% M.O.):</span><span className="font-mono font-medium">${herramientaMenor.toFixed(4)}</span></div>
                    <div className="border-t border-slate-600 my-2 pt-2 flex justify-between items-center"><span className="font-bold text-brand-sage uppercase tracking-wider">Costo Directo Total:</span><span className="text-2xl font-black text-white bg-slate-900 px-3 py-1 rounded-lg border border-slate-700 shadow-inner">${totalCostoDirecto.toFixed(4)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddInsumoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col h-[80vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2"><Plus size={18} className="text-brand-sage"/> Agregar Insumo al Rubro</h2>
              <button onClick={() => setIsAddInsumoModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-4 border-b border-gray-100 shrink-0">
              <div className="relative">
                <input autoFocus type="text" placeholder="Buscar por código o nombre..." value={searchInsumoTerm} onChange={e => setSearchInsumoTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage outline-none" />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-2">
                {filteredInsumosSearch.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">No se encontraron insumos</div>
                ) : filteredInsumosSearch.map(insumo => {
                  const yaEsta = rubroInsumos.some(ri => ri.insumo_id === insumo.id)
                  return (
                    <div key={insumo.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:border-brand-sage hover:shadow-sm transition-all group bg-white">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${insumo.tipo === 'material' ? 'bg-blue-100 text-blue-700' : insumo.tipo === 'mano_de_obra' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{insumo.tipo.replace('_', ' ')}</span>
                          <span className="font-mono text-xs text-gray-500 font-semibold">{insumo.codigo}</span>
                        </div>
                        <span className="font-bold text-gray-800 mt-1">{insumo.nombre}</span>
                        <div className="flex gap-4 mt-1 text-xs text-gray-500 font-medium"><span>Unidad: {insumo.unidad}</span><span>Precio: ${Number(insumo.precio_sin_iva || 0).toFixed(4)}</span></div>
                      </div>
                      <button disabled={yaEsta} onClick={() => handleAddInsumoToRubro(insumo)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${yaEsta ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-brand-sage text-brand-sage hover:bg-brand-sage hover:text-white'}`}>
                        {yaEsta ? 'Agregado' : 'Agregar'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
