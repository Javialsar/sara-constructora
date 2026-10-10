const fs = require('fs');
let c = fs.readFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', 'utf8');

c = c.replace(
  /<List className="w-5 h-5 mr-3" \/> Historial de Viajes[\s\S]*?<\/button>/,
  `<List className="w-5 h-5 mr-3" /> Historial de Viajes\n            </button>\n            <button onClick={() => setActiveTab('recargas')} className={\`w-full flex items-center px-4 py-3 rounded-lg transition-colors \${activeTab === 'recargas' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}\`}>\n              <List className="w-5 h-5 mr-3" /> Historial de Recargas\n            </button>`
);

fs.writeFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', c);
