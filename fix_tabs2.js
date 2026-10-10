const fs = require('fs');
let c = fs.readFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', 'utf8');

const navStart = c.indexOf('<nav className="mt-8 space-y-2">');
const navEnd = c.indexOf('</nav>', navStart) + 6;

const newSidebar = `<nav className="mt-8 space-y-2">
            <button onClick={() => setActiveTab('sincronizacion')} className={\`w-full flex items-center px-4 py-3 rounded-lg transition-colors \${activeTab === 'sincronizacion' ? 'bg-emerald-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}\`}>
              <Navigation className="w-5 h-5 mr-3" /> Sincronización Fletes
            </button>
            <button onClick={() => setActiveTab('vehiculo')} className={\`w-full flex items-center px-4 py-3 rounded-lg transition-colors \${activeTab === 'vehiculo' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}\`}>
              <Truck className="w-5 h-5 mr-3" /> Mi Cabina y Perfil
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

c = c.substring(0, navStart) + newSidebar + c.substring(navEnd);

c = c.replace(
  "const [activeTab, setActiveTab] = useState<'vehiculo'",
  "const [activeTab, setActiveTab] = useState<'sincronizacion' | 'vehiculo'"
);
c = c.replace(
  ">('vehiculo');",
  ">('sincronizacion');"
);
c = c.replace(
  "useState<'sincronizacion' | 'sincronizacion' |",
  "useState<'sincronizacion' |"
);

const regexMap = /\{\/\* GEOREFERENCIA MAPA \*\/\}[\s\S]*?(?=<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* TAB: DOCUMENTOS \*\/})/;
const match = c.match(regexMap);
if (match) {
    let mapBlock = match[0];
    c = c.replace(mapBlock, ''); // remove it from vehiculo
    
    const tabSincronizacion = `
          {/* TAB: SINCRONIZACION */}
          {activeTab === 'sincronizacion' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
              <h2 className="text-3xl font-black mb-6">Mapa Interactivo de Fletes</h2>
              ${mapBlock.replace(/w-full h-96 rounded-xl/, 'w-full h-[calc(100vh-160px)] rounded-2xl shadow-xl')}
            </div>
          )}
    `;
    c = c.replace("{/* TAB: VEHICULO */}", tabSincronizacion + "\n          {/* TAB: VEHICULO */}");
}

fs.writeFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', c);
