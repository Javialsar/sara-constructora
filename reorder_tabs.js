const fs = require('fs');
let c = fs.readFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', 'utf8');

// 1. Add state
c = c.replace(
  "const [activeTab, setActiveTab] = useState<'vehiculo'",
  "const [activeTab, setActiveTab] = useState<'sincronizacion' | 'vehiculo'"
);
c = c.replace(
  ">('vehiculo');",
  ">('sincronizacion');"
);

// 2. Sidebar replacement
const sidebarRegex = /<nav className="mt-8 space-y-2">[\s\S]*?<\/nav>/;
const newSidebar = `<nav className="mt-8 space-y-2">
            <button onClick={() => setActiveTab('sincronizacion')} className={\`w-full flex items-center px-4 py-3 rounded-lg transition-colors \${activeTab === 'sincronizacion' ? 'bg-emerald-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}\`}>
              <Navigation className="w-5 h-5 mr-3" /> Sincronización Fletes
            </button>
            <button onClick={() => setActiveTab('vehiculo')} className={\`w-full flex items-center px-4 py-3 rounded-lg transition-colors \${activeTab === 'vehiculo' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}\`}>
              <Truck className="w-5 h-5 mr-3" /> Vehículo y Perfil
            </button>
            <button onClick={() => setActiveTab('documentos')} className={\`w-full flex items-center px-4 py-3 rounded-lg transition-colors \${activeTab === 'documentos' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}\`}>
              <FileText className="w-5 h-5 mr-3" /> Mis Documentos
            </button>
            <button onClick={() => setActiveTab('billetera')} className={\`w-full flex items-center px-4 py-3 rounded-lg transition-colors \${activeTab === 'billetera' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}\`}>
              <Wallet className="w-5 h-5 mr-3" /> Billetera y Plan
            </button>
            <button onClick={() => setActiveTab('historial')} className={\`w-full flex items-center px-4 py-3 rounded-lg transition-colors \${activeTab === 'historial' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}\`}>
              <List className="w-5 h-5 mr-3" /> Historial de Viajes
            </button>
            <button onClick={() => setActiveTab('recargas')} className={\`w-full flex items-center px-4 py-3 rounded-lg transition-colors \${activeTab === 'recargas' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}\`}>
              <List className="w-5 h-5 mr-3" /> Historial de Recargas
            </button>
          </nav>`;
c = c.replace(sidebarRegex, newSidebar);

// 3. Extract MAP block and separate it from Vehiculo
const mapStartString = '{/* GEOREFERENCIA MAPA */}';
const mapIndex = c.indexOf(mapStartString);

// Find the end of the vehiculo block which is just before {/* TAB: DOCUMENTOS */}
const docTabIndex = c.indexOf('{/* TAB: DOCUMENTOS */}');
const mapEndIndex = c.lastIndexOf('</div>', docTabIndex) + 6; // roughly the end of the tab

let beforeMap = c.substring(0, mapIndex);
// Wait, the map block is inside the 'vehiculo' tab.
// I will just do a manual string replace of the map block out of vehiculo.

const mapBlockRegex = /\{\/\* GEOREFERENCIA MAPA \*\/\}[\s\S]*?(?=<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* TAB: DOCUMENTOS \*\/})/m;

const mapBlockMatch = c.match(mapBlockRegex);
if (mapBlockMatch) {
  const mapBlock = mapBlockMatch[0];
  
  // Remove the map block from vehiculo
  c = c.replace(mapBlock, '');

  // Inject it as a new Tab above vehiculo
  const tabSincronizacion = `
          {/* TAB: SINCRONIZACION */}
          {activeTab === 'sincronizacion' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-100px)]">
              <h2 className="text-3xl font-black mb-6">Mapa Interactivo de Fletes</h2>
              ${mapBlock.replace(/w-full h-96/, 'w-full h-full min-h-[70vh]')}
            </div>
          )}
  `;
  
  c = c.replace("{/* TAB: VEHICULO */}", tabSincronizacion + "\n          {/* TAB: VEHICULO */}");
}

fs.writeFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', c);
