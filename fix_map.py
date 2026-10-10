import re

with open('src/app/modulos/fletes/mi-perfil/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update activeTab state
content = content.replace("useState<'vehiculo'", "useState<'sincronizacion' | 'vehiculo'")
content = content.replace("('vehiculo');", "('sincronizacion');")

# Replace sidebar nav
nav_pattern = r'<nav className="space-y-2 flex-grow">.*?</nav>'
new_nav = """<nav className="space-y-2 flex-grow">
          <button onClick={() => setActiveTab('sincronizacion')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'sincronizacion' ? 'bg-emerald-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Navigation className="w-5 h-5 mr-3" /> Sincronización Fletes
          </button>
          <button onClick={() => setActiveTab('vehiculo')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'vehiculo' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Truck className="w-5 h-5 mr-3" /> Mi Cabina y Perfil
          </button>
          <button onClick={() => setActiveTab('documentos')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'documentos' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}>
            <FileText className="w-5 h-5 mr-3" /> Mis Documentos
          </button>
          <button onClick={() => setActiveTab('billetera')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'billetera' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Wallet className="w-5 h-5 mr-3" /> Billetera y Plan
          </button>
          <button onClick={() => setActiveTab('historial')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'historial' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}>
            <List className="w-5 h-5 mr-3" /> Historial de Viajes
          </button>
          <button onClick={() => setActiveTab('recargas')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'recargas' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}>
            <List className="w-5 h-5 mr-3" /> Historial de Recargas
          </button>
        </nav>"""
content = re.sub(nav_pattern, new_nav, content, flags=re.DOTALL)

# Extract Map Block
map_start_str = '{/* GEOREFERENCIA MAPA */}'
map_start = content.find(map_start_str)

if map_start > -1:
    vehiculo_end = content.find('{/* TAB: DOCUMENTOS */}', map_start)
    if vehiculo_end > -1:
        map_pattern = r'(\{\/\* GEOREFERENCIA MAPA \*\/\}.*?)(?=<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* TAB: DOCUMENTOS \*\/})'
        map_match = re.search(map_pattern, content, flags=re.DOTALL)
        
        if map_match:
            map_content = map_match.group(1)
            content = content.replace(map_content, "")
            
            # Change title
            content = content.replace("Datos del Conductor y Radar", "Datos de Mi Cabina y Perfil")
            
            # Inject new tab
            tab_sinc = f"""
          {{/* TAB: SINCRONIZACION */}}
          {{activeTab === 'sincronizacion' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full min-h-[85vh] flex flex-col">
              <h2 className="text-3xl font-black mb-6">Sincronización Fletes (Radar Activo)</h2>
              <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                {map_content.replace('w-full h-64 rounded-xl border border-slate-200 overflow-hidden relative', 'w-full h-[70vh] rounded-xl shadow-inner overflow-hidden relative')}
              </div>
            </div>
          )}}
          """
            content = content.replace("{/* TAB: VEHICULO */}", tab_sinc + "\n          {/* TAB: VEHICULO */}")
            print("Successfully refactored map block")
        else:
            print("Map block regex failed")
else:
    print("Map start not found")

with open('src/app/modulos/fletes/mi-perfil/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
