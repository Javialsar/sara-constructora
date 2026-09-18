const fs = require('fs');
const path = 'src/app/admin/presupuestos_reales/page.tsx';

let code = fs.readFileSync(path, 'utf8');

// 1. Add `activeTab` to state if not present
if (!code.includes("const [activeTab,")) {
  code = code.replace(
    /const \[view, setView\] = useState\('lista'\)/,
    "const [view, setView] = useState('lista')\n  const [activeTab, setActiveTab] = useState('detalle')"
  );
}

// 2. Add indirect variables state for the Indirectos Tab
if (!code.includes("const [indForm,")) {
  code = code.replace(
    /const \[view, setView\] = useState\('lista'\)/,
    "const [view, setView] = useState('lista')\n  const [indForm, setIndForm] = useState({ admin: 10, imprevistos: 5, utilidad: 10 })"
  );
}

// 3. Update the indForm when opening the editor
code = code.replace(
  /const openEditor = \(p\) => \{([\s\S]*?)setView\('editor'\)/,
  `const openEditor = (p) => {$1setIndForm({ admin: p.porcentaje_admin || 0, imprevistos: p.porcentaje_imprevistos || 0, utilidad: p.porcentaje_utilidad || 0 })\n    setActiveTab('detalle')\n    setView('editor')`
);

// 4. Save Indirectos logic
if (!code.includes("const handleSaveIndirectos")) {
  code = code.replace(
    /const handleMarcarEntregado = async \(\) => \{/,
    `const handleSaveIndirectos = async () => {
    const { error } = await supabase.from('presupuestos_reales').update({
      porcentaje_admin: indForm.admin,
      porcentaje_imprevistos: indForm.imprevistos,
      porcentaje_utilidad: indForm.utilidad
    }).eq('id', currentPresupuesto.id)
    if(!error) {
      setCurrentPresupuesto({...currentPresupuesto, porcentaje_admin: indForm.admin, porcentaje_imprevistos: indForm.imprevistos, porcentaje_utilidad: indForm.utilidad})
      fetchPresupuestos()
      alert("Costos Indirectos guardados correctamente")
    }
  }

  const handleMarcarEntregado = async () => {`
  );
}

// 5. Inject Tabs UI
const tabHeader = `
        {/* TABS HEADER */}
        <div className="flex space-x-1 mb-6 border-b border-gray-200">
          <button onClick={() => setActiveTab('detalle')} className={\`px-6 py-3 text-sm font-bold border-b-2 transition-colors \${activeTab === 'detalle' ? 'border-brand-sage text-brand-dark' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}>
            <List size={16} className="inline mr-2"/> Detalle de Presupuesto
          </button>
          <button onClick={() => setActiveTab('indirectos')} className={\`px-6 py-3 text-sm font-bold border-b-2 transition-colors \${activeTab === 'indirectos' ? 'border-brand-sage text-brand-dark' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}>
            <Calculator size={16} className="inline mr-2"/> Costos Indirectos
          </button>
          <button onClick={() => setActiveTab('reportes')} className={\`px-6 py-3 text-sm font-bold border-b-2 transition-colors \${activeTab === 'reportes' ? 'border-brand-sage text-brand-dark' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}>
            <FileText size={16} className="inline mr-2"/> Reportes
          </button>
          <button onClick={() => setIsGanttModalOpen(true)} className={\`px-6 py-3 text-sm font-bold border-b-2 border-transparent text-gray-500 hover:text-gray-700\`}>
            <Calendar size={16} className="inline mr-2"/> Programación
          </button>
        </div>

        {activeTab === 'detalle' && (
`;

const tabIndirectos = `
        )}

        {activeTab === 'indirectos' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-4xl">
            <div className="p-4 bg-gray-50/50 flex justify-between items-center border-b border-gray-200">
              <div className="flex items-center gap-4">
                <button className="px-4 py-2 text-sm font-bold bg-white border border-gray-200 rounded-md text-gray-700">% Porcentajes por defecto</button>
                <button className="px-4 py-2 text-sm font-bold text-gray-500 flex items-center gap-2"><Calculator size={16}/> Fórmulas por defecto</button>
              </div>
              <button onClick={handleSaveIndirectos} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm">
                <Save size={18}/> Grabar
              </button>
            </div>
            
            <div className="divide-y divide-gray-200">
              {/* EQUIPOS */}
              <div className="bg-blue-500 text-white font-bold p-3 flex justify-between cursor-pointer">
                <span>1.- Equipos</span><ChevronDown size={18}/>
              </div>
              
              {/* MANO DE OBRA */}
              <div className="bg-blue-500 text-white font-bold p-3 flex justify-between cursor-pointer mt-1">
                <span>2.- Mano de Obra</span><ChevronDown size={18}/>
              </div>

              {/* MATERIALES */}
              <div className="bg-blue-500 text-white font-bold p-3 flex justify-between cursor-pointer mt-1">
                <span>3.- Materiales</span><ChevronDown size={18}/>
              </div>
              <div className="p-4 bg-white grid grid-cols-12 text-sm">
                <div className="col-span-8 text-right pr-4 py-2 font-medium text-gray-600">Costo Directo (1+2+3)</div>
                <div className="col-span-1 text-right py-2 font-black text-gray-800 border-b border-gray-200">\${costoDirectoTotal.toFixed(2)}</div>
                <div className="col-span-3 text-gray-400 py-2 pl-4 text-xs font-mono">= $cdir = Costo Directo Total</div>
              </div>

              {/* GASTOS GENERALES */}
              <div className="bg-blue-500 text-white font-bold p-3 flex justify-between cursor-pointer mt-1">
                <span>4.- Gastos generales y administrativos</span><ChevronDown size={18}/>
              </div>
              <div className="p-4 bg-white grid grid-cols-12 text-sm items-center gap-y-2">
                <div className="col-span-5 font-medium text-gray-700">Gastos generales = (% de 1+2+3)</div>
                <div className="col-span-1 text-center font-bold text-brand-dark">$ggen</div>
                <div className="col-span-2">
                  <input type="number" step="0.1" value={indForm.admin} onChange={e => setIndForm({...indForm, admin: parseFloat(e.target.value) || 0})} className="w-full border border-blue-300 rounded p-1.5 text-right bg-blue-50 focus:outline-none" />
                </div>
                <div className="col-span-1 text-right font-bold text-gray-800 border-b border-gray-200">\${a.toFixed(2)}</div>
                <div className="col-span-3 text-gray-400 text-xs font-mono pl-4">= $sggen = $cdir * $ggen / 100</div>

                <div className="col-span-8 text-right pr-4 py-2 font-medium text-gray-600 mt-2">Costo neto</div>
                <div className="col-span-1 text-right py-2 font-black text-gray-800 border-b border-gray-200 mt-2">\${(costoDirectoTotal + a).toFixed(2)}</div>
                <div className="col-span-3 text-gray-400 py-2 pl-4 text-xs font-mono mt-2">= $cnet = $cdir + $sggen</div>
              </div>

              {/* IMPREVISTOS */}
              <div className="bg-blue-500 text-white font-bold p-3 flex justify-between cursor-pointer mt-1">
                <span>5.- Imprevistos</span><ChevronDown size={18}/>
              </div>
              <div className="p-4 bg-white grid grid-cols-12 text-sm items-center">
                <div className="col-span-5 font-medium text-gray-700">Imprevistos = (% de 1+2+3)</div>
                <div className="col-span-1 text-center font-bold text-brand-dark">$imprv</div>
                <div className="col-span-2">
                  <input type="number" step="0.1" value={indForm.imprevistos} onChange={e => setIndForm({...indForm, imprevistos: parseFloat(e.target.value) || 0})} className="w-full border border-blue-300 rounded p-1.5 text-right bg-blue-50 focus:outline-none" />
                </div>
                <div className="col-span-1 text-right font-bold text-gray-800 border-b border-gray-200">\${i.toFixed(2)}</div>
                <div className="col-span-3 text-gray-400 text-xs font-mono pl-4">= $simprv = $cdir * $imprv / 100</div>
              </div>

              {/* UTILIDAD */}
              <div className="bg-blue-500 text-white font-bold p-3 flex justify-between cursor-pointer mt-1">
                <span>6.- Utilidad</span><ChevronDown size={18}/>
              </div>
              <div className="p-4 bg-white grid grid-cols-12 text-sm items-center gap-y-2">
                <div className="col-span-5 font-medium text-gray-700">Utilidad = (% de 1+2+3+4)</div>
                <div className="col-span-1 text-center font-bold text-brand-dark">$util</div>
                <div className="col-span-2">
                  <input type="number" step="0.1" value={indForm.utilidad} onChange={e => setIndForm({...indForm, utilidad: parseFloat(e.target.value) || 0})} className="w-full border border-blue-300 rounded p-1.5 text-right bg-blue-50 focus:outline-none" />
                </div>
                <div className="col-span-1 text-right font-bold text-gray-800 border-b border-gray-200">\${u.toFixed(2)}</div>
                <div className="col-span-3 text-gray-400 text-xs font-mono pl-4">= $sutil = $cnet * $util / 100</div>

                <div className="col-span-8 text-right pr-4 py-2 font-medium text-gray-600 mt-2">Precio de venta</div>
                <div className="col-span-1 text-right py-2 font-black text-gray-800 border-b border-gray-200 mt-2">\${granTotal.toFixed(2)}</div>
                <div className="col-span-3 text-gray-400 py-2 pl-4 text-xs font-mono mt-2">= $pven = $cnet + $sutil + $simprv</div>

                <div className="col-span-8 text-right pr-4 py-2 font-bold text-gray-800 bg-gray-50">Total Precio Unitario</div>
                <div className="col-span-1 text-right py-2 font-black text-brand-sage border-b-2 border-brand-sage bg-gray-50">\${granTotal.toFixed(2)}</div>
                <div className="col-span-3 text-gray-400 py-2 pl-4 text-xs font-mono bg-gray-50">= $Stotal = $pven</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reportes' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-4xl">
             <table className="w-full text-sm text-left">
              <thead className="bg-blue-500 text-white font-bold">
                <tr>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                  <th className="px-6 py-3">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-800">Presupuesto General</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={handleExportPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2 mx-auto">
                      <FileText size={14}/> Generar
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-600">Totales del presupuesto.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-800">Análisis de Precios Unitarios (APUs)</td>
                  <td className="px-6 py-4 text-center">
                    <button className="bg-gray-200 text-gray-500 cursor-not-allowed px-4 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2 mx-auto">
                      <FileText size={14}/> Próximamente
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-600">Análisis de precios unitarios detallado.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-800">Explosión de Insumos (Materiales)</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => {/* Aquí se puede poner un generador a futuro */}} className="bg-gray-200 text-gray-500 cursor-not-allowed px-4 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2 mx-auto">
                      <FileText size={14}/> Próximamente
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-600">Totales de materiales agrupados en unidades.</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
`;

code = code.replace(
  /<div className="flex items-center justify-between mb-6">([\s\S]*?)<\/div>\s*<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">/,
  `<div className="flex items-center justify-between mb-6">$1</div>\n${tabHeader}\n<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">`
);

code = code.replace(
  /<\/div>\s*<div className="bg-white rounded-xl shadow-sm overflow-hidden min-h-\[400px\]">([\s\S]*?)<\/div>\s*<\/div>\s*\)\s*\}\s*return \(/,
  `</div>\n        <div className="bg-white rounded-xl shadow-sm overflow-hidden min-h-[400px]">$1</div>\n        </div>\n${tabIndirectos}\n      </div>\n    )\n  }\n\n  return (`
)

fs.writeFileSync(path, code);
console.log('Tabs and Costos Indirectos tab injected successfully!');
