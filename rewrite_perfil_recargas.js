const fs = require('fs');
let c = fs.readFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', 'utf8');

// 1. Add 'recargas' to the activeTab state type
c = c.replace(
  "const [activeTab, setActiveTab] = useState<'vehiculo' | 'documentos' | 'billetera' | 'historial'>('vehiculo');",
  "const [activeTab, setActiveTab] = useState<'vehiculo' | 'documentos' | 'billetera' | 'historial' | 'recargas'>('vehiculo');"
);

// 2. Add the sidebar button
const sidebarRechargeBtn = `
          <button 
            onClick={() => setActiveTab('recargas')}
            className={\`w-full flex items-center p-4 transition-colors \${activeTab === 'recargas' ? 'bg-amber-500 text-slate-900 font-bold border-l-4 border-slate-900' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}
          >
            <History className="w-5 h-5 mr-3" />
            Historial de Recargas
          </button>
`;
c = c.replace(
  '<button \n            onClick={() => setActiveTab(\'historial\')}',
  sidebarRechargeBtn + '\n          <button \n            onClick={() => setActiveTab(\'historial\')}'
);

// We need to import History from lucide-react if it's not imported. Actually History is not imported, let's use List.
c = c.replace('History className', 'List className');
if (!c.includes('List,')) {
    c = c.replace('import { ', 'import { List, ');
}

// 3. Add the view for 'recargas'
const recargasView = `
        {activeTab === 'recargas' && (
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
                    <td className="p-4 text-slate-500 text-sm font-mono">TRX-99882211</td>
                    <td className="p-4"><span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">En Verificación</span></td>
                    <td className="p-4 font-black text-emerald-600 text-right">+$50.00</td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-600">01 Oct 2026, 09:15</td>
                    <td className="p-4 text-slate-500 text-sm font-mono">TRX-11223344</td>
                    <td className="p-4"><span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Aprobado</span></td>
                    <td className="p-4 font-black text-emerald-600 text-right">+$100.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
`;

c = c.replace(
  '      </div>\n      \n      {/* TOAST NOTIFICATION */}',
  recargasView + '\n      </div>\n      \n      {/* TOAST NOTIFICATION */}'
);

fs.writeFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', c, 'utf8');
