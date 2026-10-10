const fs = require('fs');
let c = fs.readFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', 'utf8');

c = c.replace(
  '<List className="w-5 h-5 mr-3" /> Historial de Viajes\r\n            </button>',
  `<List className="w-5 h-5 mr-3" /> Historial de Viajes\n            </button>\n            <button onClick={() => setActiveTab('recargas')} className={\`w-full flex items-center px-4 py-3 rounded-lg transition-colors \${activeTab === 'recargas' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}\`}>\n               <List className="w-5 h-5 mr-3" /> Historial de Recargas\n            </button>`
);
// just in case line endings are \n
c = c.replace(
  '<List className="w-5 h-5 mr-3" /> Historial de Viajes\n            </button>',
  `<List className="w-5 h-5 mr-3" /> Historial de Viajes\n            </button>\n            <button onClick={() => setActiveTab('recargas')} className={\`w-full flex items-center px-4 py-3 rounded-lg transition-colors \${activeTab === 'recargas' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}\`}>\n               <List className="w-5 h-5 mr-3" /> Historial de Recargas\n            </button>`
);


if (!c.includes('Historial de Recargas de Billetera')) {
    c = c.replace(
        '{/* TOAST NOTIFICATION */}',
        `{activeTab === 'recargas' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black text-slate-800">Historial de Recargas de Billetera</h2>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="p-4">Fecha y Hora</th>
                    <th className="p-4">Referencia / Comprobante</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Valor Recargado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-600">12 Oct 2026, 15:30</td>
                    <td className="p-4 text-slate-500 text-sm font-mono flex items-center"><FileText className="w-4 h-4 mr-1 text-slate-400"/> TRX-99882211</td>
                    <td className="p-4"><span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">En Verificación</span></td>
                    <td className="p-4 font-black text-emerald-600 text-right">+$50.00</td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-600">01 Oct 2026, 09:15</td>
                    <td className="p-4 text-slate-500 text-sm font-mono flex items-center"><FileText className="w-4 h-4 mr-1 text-slate-400"/> TRX-11223344</td>
                    <td className="p-4"><span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Aprobado</span></td>
                    <td className="p-4 font-black text-emerald-600 text-right">+$100.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}\n\n      {/* TOAST NOTIFICATION */}`
    );
}

fs.writeFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', c);
