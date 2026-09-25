const fs = require('fs');
let content = fs.readFileSync('src/app/admin/apus/insumos/page.tsx', 'utf-8');

// 1. Add Search Bar and Config Button to the left panel
const oldLeftPanelHeader = `        {/* LEFT: ÁRBOL DE GRUPOS */}
        <div className="w-64 shrink-0 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50 shrink-0">
            <span className="font-bold text-gray-700 text-xs uppercase tracking-wider">Grupos / Subgrupos</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-0.5">`;

const newLeftPanelHeader = `        {/* LEFT: ÁRBOL DE GRUPOS */}
        <div className="w-64 shrink-0 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
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

// Add searchCategoryTerm state to InsumosClient
if (!content.includes('const [searchCategoryTerm, setSearchCategoryTerm] = useState("")')) {
  content = content.replace('const [searchTerm, setSearchTerm] = useState("")', 'const [searchTerm, setSearchTerm] = useState("")\n  const [searchCategoryTerm, setSearchCategoryTerm] = useState("")');
}

// Filter the tree ONLY in the LEFT PANEL (after the Box / Todos button)
const treeViewMap = `<span className={\`text-xs px-1.5 py-0.5 rounded-full \${!selectedFamilia ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}\`}>{insumos.length}</span>
            </button>
            {familias.map(fam => {`;

const newTreeViewMap = `<span className={\`text-xs px-1.5 py-0.5 rounded-full \${!selectedFamilia ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}\`}>{insumos.length}</span>
            </button>
            {familias.filter(f => f.nombre.toLowerCase().includes(searchCategoryTerm.toLowerCase()) || subfsPorFamilia(f.id).some(sf => sf.nombre.toLowerCase().includes(searchCategoryTerm.toLowerCase()))).map(fam => {`;
content = content.replace(treeViewMap, newTreeViewMap);

// 2. Fetch only Insumos groups
content = content.replace("fetchAll('familias', 'nombre'),", "fetchAll('familias', 'nombre').then(data => data.filter(f => f.grupo_sugerido !== 'rubro')),");

fs.writeFileSync('src/app/admin/apus/insumos/page.tsx', content);
