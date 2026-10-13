import re

with open('src/app/admin/apus/rubros/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change itemsPerPage to 10
content = content.replace('const itemsPerPage = 20', 'const itemsPerPage = 10')

# 2. Add searchCategoryTerm state
content = content.replace(
    'const [searchTerm, setSearchTerm] = useState("")',
    'const [searchTerm, setSearchTerm] = useState("")\n  const [searchCategoryTerm, setSearchCategoryTerm] = useState("")'
)

# 3. Filter categories
content = content.replace(
    "const categories = Array.from(new Set(rubros.map(r => r.categoria || 'Sin Categoría'))).sort()",
    "const categories = Array.from(new Set(rubros.map(r => r.categoria || 'Sin Categoría'))).sort().filter(c => c.toLowerCase().includes(searchCategoryTerm.toLowerCase()))"
)

# 4. Add search box to Panel 1
panel1_header = """<div className="p-3 border-b border-gray-100 bg-gray-50 font-bold text-gray-700 text-sm uppercase tracking-wider shrink-0 flex justify-between items-center">
              <span>Categorías / Grupos</span>
              <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">{categories.length}</span>
            </div>"""
            
panel1_search = """<div className="p-3 border-b border-gray-100 bg-gray-50 shrink-0 flex flex-col gap-2">
              <div className="flex justify-between items-center font-bold text-gray-700 text-sm uppercase tracking-wider">
                <span>Categorías</span>
                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">{categories.length}</span>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar grupo..." 
                  value={searchCategoryTerm}
                  onChange={(e) => setSearchCategoryTerm(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-brand-sage focus:border-brand-sage"
                />
                <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
              </div>
            </div>"""
            
content = content.replace(panel1_header, panel1_search)

# 5. Make top panel taller, bottom panel shorter
content = content.replace('min-h-[250px]', 'min-h-[400px]')
content = content.replace('h-[45%] md:h-[40%]', 'h-[40%] md:h-[35%]')

# 6. Change selected row color
content = content.replace(
    "currentRubro?.id === r.id ? 'bg-brand-sage/10 border-l-4 border-brand-sage' : 'hover:bg-gray-50 border-l-4 border-transparent'",
    "currentRubro?.id === r.id ? 'bg-blue-100 border-l-4 border-blue-600 shadow-inner' : 'hover:bg-gray-50 border-l-4 border-transparent'"
)

with open('src/app/admin/apus/rubros/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched successfully")
