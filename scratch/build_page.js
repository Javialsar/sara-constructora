const fs = require('fs');

let content = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

// 1. Imports
content = content.replace(
  'import { Plus, Search, Trash2, X, Save, Box, PenTool, ChevronLeft, ChevronRight, Minus, Edit3, Wrench, HardHat, Package } from "lucide-react"',
  'import { Plus, Search, Trash2, X, Save, Box, PenTool, ChevronLeft, ChevronRight, Minus, Edit3, Wrench, HardHat, Package, Layers, ArrowLeft, ChevronDown } from "lucide-react"'
);

// 2. Types and GruposManager
const topCode = `
type Familia = { id: string, nombre: string, grupo_sugerido: string }
type Subfamilia = { id: string, nombre: string, familia_id: string }

function GruposManager({ familias, subfamilias, setFamilias, setSubfamilias, onBack }: any) {
  const supabase = createClient()
  const [selectedFamilia, setSelectedFamilia] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [newGrupoNombre, setNewGrupoNombre] = useState("")
  const [showGrupoForm, setShowGrupoForm] = useState(false)
  const [newSubNombre, setNewSubNombre] = useState("")
  const [showSubForm, setShowSubForm] = useState(false)
  const subfsPorFamilia = (fid: string) => subfamilias.filter((sf: any) => sf.familia_id === fid)

  const handleAddGrupo = async (e: any) => {
    e.preventDefault(); if (!newGrupoNombre.trim()) return; setSaving(true);
    try {
      const id = 'FAM-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      const { data, error } = await supabase.from('familias').insert([{ id, nombre: newGrupoNombre.trim(), grupo_sugerido: 'rubro' }]).select()
      if (!error && data) { setNewGrupoNombre(""); setShowGrupoForm(false); setFamilias([...familias, data[0]]); }
    } finally { setSaving(false) }
  }

  const handleDeleteGrupo = async (id: string, nombre: string) => {
    if (!confirm("¿Eliminar " + nombre + "?")) return
    const { error } = await supabase.from('familias').delete().eq('id', id)
    if (!error) { if (selectedFamilia?.id === id) setSelectedFamilia(null); setFamilias(familias.filter((f:any) => f.id !== id)) }
  }

  const handleAddSubgrupo = async (e: any) => {
    e.preventDefault(); if (!selectedFamilia || !newSubNombre.trim()) return; setSaving(true);
    try {
      const id = 'SF-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      const { data, error } = await supabase.from('subfamilias').insert([{ id, nombre: newSubNombre.trim(), familia_id: selectedFamilia.id }]).select()
      if (!error && data) { setNewSubNombre(""); setShowSubForm(false); setSubfamilias([...subfamilias, data[0]]); }
    } finally { setSaving(false) }
  }

  const handleDeleteSubgrupo = async (id: string, nombre: string) => {
    if (!confirm("¿Eliminar " + nombre + "?")) return
    const { error } = await supabase.from('subfamilias').delete().eq('id', id)
    if (!error) setSubfamilias(subfamilias.filter((sf:any) => sf.id !== id))
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-4 md:p-6 bg-gray-50/50 overflow-hidden">
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-white border border-gray-200">
          <ArrowLeft size={16} /> Volver al Catálogo
        </button>
        <div>
          <h1 className="text-2xl font-black text-brand-dark flex items-center gap-2"><Layers className="text-brand-sage" /> Gestión de Grupos</h1>
          <p className="text-gray-500 text-sm mt-0.5">Organiza los rubros en categorías estructuradas.</p>
        </div>
      </div>
      <div className="flex gap-4 flex-1 overflow-hidden min-h-0">
        <div className="w-1/2 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            <div><h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Grupos</h2></div>
            <button onClick={() => setShowGrupoForm(!showGrupoForm)} className="bg-brand-sage text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1"><Plus size={14} /> Agregar</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {showGrupoForm && (
              <form onSubmit={handleAddGrupo} className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4 flex flex-col gap-2">
                <input type="text" autoFocus value={newGrupoNombre} onChange={e => setNewGrupoNombre(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none" />
                <div className="flex justify-end gap-2 mt-1">
                  <button type="button" onClick={() => setShowGrupoForm(false)} className="px-3 py-1.5 text-xs text-gray-500">Cancelar</button>
                  <button type="submit" className="px-3 py-1.5 text-xs bg-brand-sage text-white rounded">Guardar</button>
                </div>
              </form>
            )}
            {familias.map((f:any) => (
              <div key={f.id} onClick={() => setSelectedFamilia(f)} className={"p-3 rounded-xl border cursor-pointer flex justify-between items-center " + (selectedFamilia?.id === f.id ? 'bg-blue-50 border-blue-200' : 'bg-white')}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-500"><Layers size={16} /></div>
                  <div><h3 className="font-bold text-sm">{f.nombre}</h3><p className="text-xs text-gray-400">{subfsPorFamilia(f.id).length} subgrupos</p></div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteGrupo(f.id, f.nombre) }} className="p-1.5 text-gray-300 hover:text-red-500"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
        <div className="w-1/2 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            <div><h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Subgrupos</h2></div>
            {selectedFamilia && <button onClick={() => setShowSubForm(!showSubForm)} className="bg-brand-sage text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1"><Plus size={14} /> Agregar</button>}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {!selectedFamilia ? (
              <div className="text-gray-400 p-6 text-center">Selecciona un grupo</div>
            ) : (
              <>
                {showSubForm && (
                  <form onSubmit={handleAddSubgrupo} className="bg-emerald-50 p-3 rounded-lg flex flex-col gap-2">
                    <input type="text" autoFocus value={newSubNombre} onChange={e => setNewSubNombre(e.target.value)} className="w-full px-3 py-2 border rounded text-sm outline-none" />
                    <div className="flex justify-end gap-2 mt-1">
                      <button type="button" onClick={() => setShowSubForm(false)} className="px-3 py-1.5 text-xs text-gray-500">Cancelar</button>
                      <button type="submit" className="px-3 py-1.5 text-xs bg-brand-sage text-white rounded">Guardar</button>
                    </div>
                  </form>
                )}
                {subfsPorFamilia(selectedFamilia.id).map((sf:any) => (
                  <div key={sf.id} className="p-2.5 rounded-lg border bg-white flex justify-between items-center">
                    <div className="pl-2 border-l-2 border-brand-sage"><h3 className="font-bold text-xs">{sf.nombre}</h3></div>
                    <button onClick={() => handleDeleteSubgrupo(sf.id, sf.nombre)} className="p-1.5 text-gray-200 hover:text-red-500"><Trash2 size={14} /></button>
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
  const [vista, setVista] = useState("catalogo");
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [subfamilias, setSubfamilias] = useState<Subfamilia[]>([]);
  const [expandedFamilias, setExpandedFamilias] = useState<Set<string>>(new Set());
  const [selectedFamilia, setSelectedFamilia] = useState<string | null>(null);
  const [selectedSubfamilia, setSelectedSubfamilia] = useState<string | null>(null);
`;

content = content.replace('export default function RubrosPage() {', topCode);

// 3. Remove old category states
content = content.replace('const [searchCategoryTerm, setSearchCategoryTerm] = useState("")', '');
content = content.replace('const [selectedCategory, setSelectedCategory] = useState<string | null>(null)', '');
content = content.replace('useEffect(() => { setCurrentPage(1) }, [searchTerm, selectedCategory])', 'useEffect(() => { setCurrentPage(1) }, [searchTerm, selectedFamilia, selectedSubfamilia])');

// 4. Update data fetching
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
    if (dFam) { dFam.sort((a:any,b:any)=>a.nombre.localeCompare(b.nombre)); setFamilias(dFam); setExpandedFamilias(new Set(dFam.map((f: any)=>f.id))) }
    if (dSub) setSubfamilias(dSub.sort((a:any,b:any)=>a.nombre.localeCompare(b.nombre)))
    setLoading(false)
  }
`;
content = content.replace(/const fetchRubros = async \(\) => \{[\s\S]*?setLoading\(false\)\n  \}/, fetchCode);

// 5. Replace filtering
content = content.replace(/const categories = Array\.from[^\n]+/, '');
content = content.replace("if (selectedCategory) filteredRubros = filteredRubros.filter(r => (r.categoria || 'Sin Categoría') === selectedCategory)", `
  const subfsPorFamilia = (fid: string) => subfamilias.filter(sf => sf.familia_id === fid)
  if (selectedSubfamilia) { filteredRubros = filteredRubros.filter(r => r.subfamilia_id === selectedSubfamilia) }
  else if (selectedFamilia) { const valid = subfsPorFamilia(selectedFamilia).map(sf=>sf.id); filteredRubros = filteredRubros.filter(r => valid.includes(r.subfamilia_id)) }
`);

// 6. Tree View Sidebar
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
                  <button onClick={() => { setSelectedFamilia(fam.id); setSelectedSubfamilia(null); setExpandedFamilias(prev => { const n = new Set(prev); if (n.has(fam.id)) n.delete(fam.id); else n.add(fam.id); return n }) }}
                    className={\`w-full text-left px-2 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 \${isSelected ? 'bg-brand-sage text-white font-medium' : 'text-gray-700 hover:bg-gray-100'}\`}>
                    <span className="text-gray-400">{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                    <span className="mr-1"><Layers size={14} /></span>
                    <span className="flex-1 truncate text-xs font-semibold">{fam.nombre}</span>
                    <span className={\`text-xs px-1.5 py-0.5 rounded-full shrink-0 \${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}\`}>{rubros.filter(r => subs.map(sf=>sf.id).includes(r.subfamilia_id || '')).length}</span>
                  </button>
                  {isExpanded && subs.map(sf => {
                    const isSubSelected = selectedSubfamilia === sf.id
                    return (
                      <button key={sf.id} onClick={() => { setSelectedFamilia(fam.id); setSelectedSubfamilia(sf.id); }}
                        className={\`w-full text-left pl-8 pr-2 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between mt-0.5 \${isSubSelected ? 'bg-blue-100 text-blue-800 font-semibold border-l-2 border-blue-500' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}\`}>
                        <span className="truncate">• {sf.nombre}</span>
                        <span className={\`text-xs px-1.5 py-0.5 rounded-full shrink-0 ml-1 \${isSubSelected ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'}\`}>{rubros.filter(r => r.subfamilia_id === sf.id).length}</span>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
`;
content = content.replace(/\{\/\* LEFT: GROUPS \*\/\}[\s\S]*?\{\/\* RIGHT: RUBROS TABLE \*\/\}/, leftGroupsPanel + '\n        {/* RIGHT: RUBROS TABLE */}');

// 7. Modals
content = content.replace(
  '<button onClick={() => setIsNewModalOpen(true)} className="bg-brand-sage text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap">\n          <Plus size={18} /> Nuevo Rubro\n        </button>',
  '<div className="flex gap-2"><button onClick={() => setVista(\'grupos\')} className="border border-gray-300 text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-white transition-colors text-sm flex items-center gap-2 shadow-sm"><Layers size={15} /> Grupos</button><button onClick={() => setIsNewModalOpen(true)} className="bg-brand-sage text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"><Plus size={18} /> Nuevo Rubro</button></div>'
);

content = content.replace(
  '<div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Categoría</label><input type="text" value={newRubroData.categoria} onChange={e => setNewRubroData({...newRubroData, categoria: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage text-sm" placeholder="Ej. ESTRUCTURAS" /></div>',
  `<div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Subgrupo</label>
  <select required value={(newRubroData as any).subfamilia_id || ''} onChange={e => setNewRubroData({...newRubroData, subfamilia_id: e.target.value} as any)} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage text-sm bg-white">
    <option value="">Seleccione...</option>
    {familias.map(f => (
      <optgroup key={f.id} label={f.nombre}>
        {subfamilias.filter(sf=>sf.familia_id === f.id).map(sf => <option key={sf.id} value={sf.id}>{sf.nombre}</option>)}
      </optgroup>
    ))}
  </select></div>`
);

content = content.replace('const { data, error } = await supabase.from(\'rubros\').insert([newRubroData]).select().single()', 'const payload = { ...newRubroData, subfamilia_id: (newRubroData as any).subfamilia_id || null }; delete (payload as any).categoria; const { data, error } = await supabase.from(\'rubros\').insert([payload]).select().single()');

content = content.replace('return (\n    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] p-3 md:p-6 bg-gray-50/50 overflow-hidden">', 'if (vista === "grupos") return <GruposManager familias={familias} subfamilias={subfamilias} setFamilias={setFamilias} setSubfamilias={setSubfamilias} onBack={() => { setVista("catalogo"); fetchRubros() }} />\n  return (\n    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] p-3 md:p-6 bg-gray-50/50 overflow-hidden">');

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', content);
