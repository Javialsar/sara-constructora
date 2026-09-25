const fs = require('fs');
let content = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

const oldFetch = `  const fetchRubros = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('rubros').select('*').order('created_at', { ascending: false })
    if (!error) setRubros(data || [])
    setLoading(false)
  }`;

const newFetch = `  const fetchAll = async (table: string, filter?: {col: string, val: string}) => {
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
    if (dFam) { 
      dFam.sort((a,b)=>a.nombre.localeCompare(b.nombre)); 
      setFamilias(dFam); 
      setExpandedFamilias(new Set(dFam.map(f=>f.id))) 
    }
    if (dSub) setSubfamilias(dSub.sort((a,b)=>a.nombre.localeCompare(b.nombre)))
    setLoading(false)
  }`;

content = content.replace(oldFetch, newFetch);

// Also the user wanted a Search Bar and "Crear" buttons in the left sidebar
const oldLeftPanelHeader = `        {/* LEFT: ÁRBOL DE GRUPOS */}
        <div className="w-full md:w-1/4 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50 shrink-0">
            <span className="font-bold text-gray-700 text-xs uppercase tracking-wider">Grupos / Subgrupos</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-0.5">`;

const newLeftPanelHeader = `        {/* LEFT: ÁRBOL DE GRUPOS */}
        <div className="w-full md:w-1/4 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50 shrink-0 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-700 text-xs uppercase tracking-wider">Grupos / Subgrupos</span>
              <button onClick={() => setVista('grupos')} className="p-1.5 bg-gray-200 hover:bg-brand-sage hover:text-white rounded text-gray-600 transition-colors" title="Gestionar Grupos"><Wrench size={14} /></button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
              <input type="text" placeholder="Buscar grupo..." value={searchCategoryTerm} onChange={e => setSearchCategoryTerm(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded text-xs outline-none focus:border-brand-sage" />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-0.5">`;

content = content.replace(oldLeftPanelHeader, newLeftPanelHeader);

// I must also add searchCategoryTerm to state if it was removed
if (!content.includes('const [searchCategoryTerm, setSearchCategoryTerm] = useState("")')) {
  content = content.replace('const [searchTerm, setSearchTerm] = useState("")', 'const [searchTerm, setSearchTerm] = useState("")\n  const [searchCategoryTerm, setSearchCategoryTerm] = useState("")');
}

// And filter the tree view by searchCategoryTerm
const treeViewMap = `{familias.map(fam => {`;
const newTreeViewMap = `{familias.filter(f => f.nombre.toLowerCase().includes(searchCategoryTerm.toLowerCase()) || subfsPorFamilia(f.id).some(sf => sf.nombre.toLowerCase().includes(searchCategoryTerm.toLowerCase()))).map(fam => {`;
content = content.replace(treeViewMap, newTreeViewMap);

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', content);
