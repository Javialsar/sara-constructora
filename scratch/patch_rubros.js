const fs = require('fs');

let oldCode = fs.readFileSync('src/app/admin/apus/rubros/page_old.tsx', 'utf-8');

// 1. Add types and GruposManager at the top
const typesAndManager = `
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
`;

let finalCode = oldCode;

// Imports
finalCode = finalCode.replace(
  'import { Plus, Search, Trash2, X, Save, Box, PenTool, ChevronLeft, ChevronRight, Minus, Edit3, Wrench, HardHat, Package } from "lucide-react"',
  'import { Plus, Search, Trash2, X, Save, Box, PenTool, ChevronLeft, ChevronRight, Minus, Edit3, Wrench, HardHat, Package, Layers, ArrowLeft, ChevronDown } from "lucide-react"'
);

// Inject types before export default
finalCode = finalCode.replace('export default function RubrosPage() {', typesAndManager + '\n\nexport default function RubrosPage() {\n  const [vista, setVista] = useState<"catalogo"|"grupos">("catalogo");\n  const [familias, setFamilias] = useState<Familia[]>([]);\n  const [subfamilias, setSubfamilias] = useState<Subfamilia[]>([]);\n  const [expandedFamilias, setExpandedFamilias] = useState<Set<string>>(new Set());\n  const [selectedFamilia, setSelectedFamilia] = useState<string | null>(null);\n  const [selectedSubfamilia, setSelectedSubfamilia] = useState<string | null>(null);\n');

// State cleanups
finalCode = finalCode.replace('const [searchCategoryTerm, setSearchCategoryTerm] = useState("")', '');
finalCode = finalCode.replace('const [selectedCategory, setSelectedCategory] = useState<string | null>(null)', '');
finalCode = finalCode.replace('useEffect(() => { setCurrentPage(1) }, [searchTerm, selectedCategory])', 'useEffect(() => { setCurrentPage(1) }, [searchTerm, selectedFamilia, selectedSubfamilia])');

// update data fetching
const fetchCode = `
  const fetchAll = async (table: string, filter?: {col: string, val: string}) => {
    let allData: any[] = []; let from = 0; const step = 1000;
    while (true) {
      let q = supabase.from(table).select('*')
      if (filter) q = q.eq(filter.col, filter.val)
      const { data } = await q.range(from, from + step - 1)
      if (data && data.length > 0) { allData = allData.concat(data); if (data.length < step) break; from += step; } else break;
    }
    return allData;
  }

  const fetchRubros = async () => {
    setLoading(true)
    const [dRubros, dFam, dSub] = await Promise.all([
      fetchAll('rubros'), fetchAll('familias', {col:'grupo_sugerido', val:'rubro'}), fetchAll('subfamilias')
    ])
    if (dRubros) setRubros(dRubros.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    if (dFam) { dFam.sort((a,b)=>a.nombre.localeCompare(b.nombre)); setFamilias(dFam); setExpandedFamilias(new Set(dFam.map((f: any)=>f.id))) }
    if (dSub) setSubfamilias(dSub.sort((a,b)=>a.nombre.localeCompare(b.nombre)))
    setLoading(false)
  }
`;
finalCode = finalCode.replace(/const fetchRubros = async \(\) => \{[\s\S]*?setLoading\(false\)\n  \}/, fetchCode);

// Helpers
finalCode = finalCode.replace('const fetchAllInsumos = async () => {', `
  const toggleFamilia = (id: string) => { setExpandedFamilias(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n }) }
  const subfsPorFamilia = (fid: string) => subfamilias.filter(sf => sf.familia_id === fid)
  const countByFamilia = (fid: string) => { const sfIds = subfsPorFamilia(fid).map(sf => sf.id); return rubros.filter(r => sfIds.includes(r.subfamilia_id || '')).length }
  const countBySubfamilia = (sfid: string) => rubros.filter(r => r.subfamilia_id === sfid).length
  
  const fetchAllInsumos = async () => {`);

// Change handleCreateRubro
finalCode = finalCode.replace('const { data, error } = await supabase.from(\'rubros\').insert([newRubroData]).select().single()', 'const payload = { ...newRubroData, subfamilia_id: (newRubroData as any).subfamilia_id || null }; const { data, error } = await supabase.from(\'rubros\').insert([payload]).select().single()');

// Replace flat categories logic
finalCode = finalCode.replace(/const categories = Array\.from.*?searchCategoryTerm.*?\)\)/, '');

// Replace filtering logic
finalCode = finalCode.replace('if (selectedCategory) filteredRubros = filteredRubros.filter(r => (r.categoria || \'Sin Categoría\') === selectedCategory)', `
  if (selectedSubfamilia) { filteredRubros = filteredRubros.filter(r => r.subfamilia_id === selectedSubfamilia) }
  else if (selectedFamilia) { const valid = subfsPorFamilia(selectedFamilia).map(sf=>sf.id); filteredRubros = filteredRubros.filter(r => valid.includes(r.subfamilia_id)) }
`);

// Wrap return
finalCode = finalCode.replace('return (\n    <div className="flex flex-col', 'if (vista === "grupos") return <GruposManager familias={familias} subfamilias={subfamilias} setFamilias={setFamilias} setSubfamilias={setSubfamilias} onBack={() => { setVista("catalogo"); fetchRubros() }} />\n  return (\n    <div className="flex flex-col');

// Replace LEFT GROUPS panel
const leftGroupsPanel = `
        {/* LEFT: ÁRBOL DE GRUPOS */}
        <div className="w-full md:w-1/4 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50 shrink-0">
            <span className="font-bold text-gray-700 text-xs uppercase tracking-wider">Grupos / Subgrupos</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-0.5">
            <button onClick={() => { setSelectedFamilia(null); setSelectedSubfamilia(null) }}
              className={\`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center \${!selectedFamilia ? 'bg-brand-sage text-white' : 'text-gray-600 hover:bg-gray-100'}\`}>
              <span className="flex items-center gap-2"><Box size={15} /> Todos</span>
              <span className={\`text-xs px-1.5 py-0.5 rounded-full \${!selectedFamilia ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}\`}>{rubros.length}</span>
            </button>
            {familias.map(fam => {
              const subs = subfsPorFamilia(fam.id)
              const isExpanded = expandedFamilias.has(fam.id)
              const isSelected = selectedFamilia === fam.id && !selectedSubfamilia
              return (
                <div key={fam.id}>
                  <button onClick={() => { setSelectedFamilia(fam.id); setSelectedSubfamilia(null); toggleFamilia(fam.id) }}
                    className={\`w-full text-left px-2 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 \${isSelected ? 'bg-brand-sage text-white font-medium' : 'text-gray-700 hover:bg-gray-100'}\`}>
                    <span className="text-gray-400">{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                    <span className="mr-1"><Layers size={14} /></span>
                    <span className="flex-1 truncate text-xs font-semibold">{fam.nombre}</span>
                    <span className={\`text-xs px-1.5 py-0.5 rounded-full shrink-0 \${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}\`}>{countByFamilia(fam.id)}</span>
                  </button>
                  {isExpanded && subs.map(sf => {
                    const isSubSelected = selectedSubfamilia === sf.id
                    return (
                      <button key={sf.id} onClick={() => { setSelectedFamilia(fam.id); setSelectedSubfamilia(sf.id); }}
                        className={\`w-full text-left pl-8 pr-2 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between mt-0.5 \${isSubSelected ? 'bg-blue-100 text-blue-800 font-semibold border-l-2 border-blue-500' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}\`}>
                        <span className="truncate">• {sf.nombre}</span>
                        <span className={\`text-xs px-1.5 py-0.5 rounded-full shrink-0 ml-1 \${isSubSelected ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'}\`}>{countBySubfamilia(sf.id)}</span>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
`;
finalCode = finalCode.replace(/\{\/\* LEFT: GROUPS \*\/\}[\s\S]*?\{\/\* RIGHT: RUBROS TABLE \*\/\}/, leftGroupsPanel + '\n        {/* RIGHT: RUBROS TABLE */}');

// Add Grupos Button
finalCode = finalCode.replace(
  '<button onClick={() => setIsNewModalOpen(true)} className="bg-brand-sage text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap">\n          <Plus size={18} /> Nuevo Rubro\n        </button>',
  '<div className="flex gap-2"><button onClick={() => setVista(\'grupos\')} className="border border-gray-300 text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-white transition-colors text-sm flex items-center gap-2 shadow-sm"><Layers size={15} /> Grupos</button><button onClick={() => setIsNewModalOpen(true)} className="bg-brand-sage text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"><Plus size={18} /> Nuevo Rubro</button></div>'
);

// Replace Categoria input with Subgrupo Select
finalCode = finalCode.replace(
  '<div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Categoría</label><input type="text" value={newRubroData.categoria} onChange={e => setNewRubroData({...newRubroData, categoria: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage text-sm" placeholder="Ej. ESTRUCTURAS" /></div>',
  `<div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Subgrupo</label>
  <select required value={(newRubroData as any).subfamilia_id || ''} onChange={e => setNewRubroData({...newRubroData, subfamilia_id: e.target.value} as any)} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage text-sm bg-white">
    <option value="">Seleccione...</option>
    {familias.map(f => (
      <optgroup key={f.id} label={f.nombre}>
        {subfsPorFamilia(f.id).map(sf => <option key={sf.id} value={sf.id}>{sf.nombre}</option>)}
      </optgroup>
    ))}
  </select></div>`
);

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', finalCode);
