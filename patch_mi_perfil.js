const fs = require('fs');

const path = 'src/app/modulos/fletes/mi-perfil/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add import
if (!content.includes('getFletesPlanes')) {
    content = content.replace(
        "import * as XLSX from 'xlsx';",
        "import { getFletesPlanes } from '@/lib/fletes-data';\nimport * as XLSX from 'xlsx';"
    );
}

// 2. Add state and effect for planes
const stateInjection = `  const [activeTab, setActiveTab] = useState<'sincronizacion' | 'vehiculo' | 'documentos' | 'billetera' | 'historial' | 'recargas'>('sincronizacion');
  const [planesList, setPlanesList] = useState<any[]>([]);

  React.useEffect(() => {
    getFletesPlanes().then(setPlanesList);
  }, []);
`;
content = content.replace(
    "  const [activeTab, setActiveTab] = useState<'sincronizacion' | 'vehiculo' | 'documentos' | 'billetera' | 'historial' | 'recargas'>('sincronizacion');",
    stateInjection
);

// 3. Add Balance to Sidebar
const sidebarBalance = `            <p className="text-white font-bold">Carlos Mendoza</p>
            <p className="text-slate-400 text-xs font-mono">PBA-1234</p>
            
            {/* SALDO WIDGET */}
            <div className="mt-4 bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Saldo Disponible</p>
                <p className="text-2xl font-black text-emerald-400">$119.00</p>
              </div>
              <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                <Wallet className="w-6 h-6 text-emerald-400" />
              </div>
            </div>`;

// Find where "PBA-1234</p>" is
const pbaIdx = content.indexOf('PBA-1234</p>');
if (pbaIdx !== -1 && !content.includes('SALDO WIDGET')) {
    const insertIdx = pbaIdx + 'PBA-1234</p>'.length;
    content = content.slice(0, insertIdx) + '\n' + sidebarBalance.substring(sidebarBalance.indexOf('<!--') !== -1 ? sidebarBalance.indexOf('SALDO') - 5 : sidebarBalance.indexOf('{/*')) + content.slice(insertIdx);
}

// 4. Make Plans Dynamic
const planTitle = '<h3 className="text-xl font-bold mb-4">';
const planTitleIdx = content.indexOf(planTitle);

const endOfBilleteraTab = content.indexOf('{/* TAB: HISTORIAL */}');

if (planTitleIdx !== -1 && endOfBilleteraTab !== -1) {
    // Replace everything between planTitle and endOfBilleteraTab (well, leaving the ending </div> tags)
    
    // Just find the <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> after planTitle
    const gridStart = content.indexOf('<div className="grid grid-cols-1 md:grid-cols-3 gap-6">', planTitleIdx);
    
    // Find the closing </div> of this grid. 
    // It's followed by "</div>\n              </div>\n\n            {/* TAB: HISTORIAL */}"
    // So we can find "</div>\n              </div>" before endOfBilleteraTab
    const beforeHistorial = content.lastIndexOf('</div>', endOfBilleteraTab) - 30; // rough estimate to find the double closing div
    
    const blockToEnd = content.substring(gridStart, endOfBilleteraTab);
    const lastClosingDivs = blockToEnd.lastIndexOf('</div>');
    
    const dynamicPlanesReplacement = `<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {planesList.length > 0 ? planesList.map((p: any) => (
                    <div key={p.id} onClick={() => setPlan(p.nombre)} className={\`cursor-pointer rounded-2xl p-6 border-2 transition-all \${plan === p.nombre ? 'border-amber-500 bg-amber-50 relative overflow-hidden' : 'border-slate-200 bg-white hover:border-slate-300'}\`}>
                      {plan === p.nombre && <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">ACTIVO</div>}
                      <div className="flex justify-between items-start mb-4">
                        <h4 className={\`font-black text-lg \${plan === p.nombre ? 'text-amber-900' : 'text-slate-800'}\`}>{p.nombre}</h4>
                        {plan === p.nombre && <CheckCircle className="w-6 h-6 text-amber-500" />}
                      </div>
                      <div className="text-3xl font-black text-slate-800 mb-2">{p.comision}% <span className="text-sm text-slate-500 font-medium">/ flete</span></div>
                      <ul className="text-sm text-slate-600 space-y-2 mt-4">
                        <li className="flex items-center"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2"/> Notificaciones estándar</li>
                        <li className="flex items-center"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2"/> Mapa nacional</li>
                      </ul>
                    </div>
                  )) : (
                    <div className="col-span-3 text-center text-slate-500 py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">Cargando planes de Supabase...</div>
                  )}
                </div>
              </div>
`;

    // Replace
    const finalContent = content.substring(0, gridStart) + dynamicPlanesReplacement + '\n            ' + content.substring(endOfBilleteraTab);
    content = finalContent;
}

fs.writeFileSync(path, content, 'utf8');
