import re
import sys

def main():
    path = 'src/app/admin/presupuestos_reales/page.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Main Dashboard Header & Table
    content = re.sub(
        r'<button onClick=\{.*?setIsNewModalOpen\(true\).*?className="bg-brand-sage text-white font-bold py-2\.5 px-6 rounded-lg flex items-center gap-2">',
        r'<button onClick={() => setIsNewModalOpen(true)} className="bg-brand-sage text-white font-semibold py-2.5 px-5 rounded-full hover:shadow-md hover:opacity-90 transition-all flex items-center gap-2">',
        content
    )

    # 2. Main Dashboard Table Container
    content = content.replace(
        'className="bg-white rounded-xl shadow-md border-gray-200 border-t-4 border-t-brand-sage mb-6"',
        'className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 mb-6 overflow-hidden"'
    )

    # 3. Main Dashboard Table Header
    content = content.replace(
        'className="bg-slate-50 text-slate-700 font-bold uppercase text-xs border-b"',
        'className="bg-slate-50 text-slate-500 font-medium uppercase text-[11px] tracking-wider border-b border-gray-200"'
    )

    # 4. State Pill (BORRADOR)
    content = content.replace(
        'bg-gray-100 text-gray-600',
        'bg-slate-100 text-slate-600 ring-1 ring-slate-500/20'
    )
    content = content.replace(
        'bg-green-100 text-green-700',
        'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20'
    )

    # 5. Editor Back Button & Title
    content = content.replace(
        'className="p-2 border rounded-lg hover:bg-gray-100 mr-4"',
        'className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-slate-600 shadow-sm mr-4 transition-all"'
    )
    content = content.replace(
        '<span className="text-xs font-bold uppercase bg-brand-sage/20 text-brand-sage px-3 py-1 rounded-full ml-4">',
        '<span className="text-[10px] font-bold uppercase bg-amber-50 text-amber-600 ring-1 ring-amber-500/20 px-3 py-1 rounded-full ml-4 tracking-wider">'
    )
    content = content.replace(
        '<h2 className="text-2xl font-black text-brand-dark flex items-center">',
        '<h2 className="text-2xl font-black text-slate-800 flex items-center tracking-tight">'
    )

    # 6. Marcar Entregado Button
    content = content.replace(
        '<button onClick={() => updatePresupuestoEstado(\'Entregado\')} className="bg-green-600 text-white font-bold py-2 px-6 rounded flex items-center gap-2 shadow-sm hover:bg-green-700">',
        '<button onClick={() => updatePresupuestoEstado(\'Entregado\')} className="bg-emerald-600 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-all">'
    )
    content = content.replace(
        '<button onClick={() => updatePresupuestoEstado(\'Borrador\')} className="bg-yellow-500 text-white font-bold py-2 px-6 rounded flex items-center gap-2 shadow-sm hover:bg-yellow-600">',
        '<button onClick={() => updatePresupuestoEstado(\'Borrador\')} className="bg-amber-500 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-sm shadow-amber-500/20 hover:bg-amber-600 transition-all">'
    )

    # 7. Navigation Tabs
    content = content.replace(
        '<div className="flex border-b border-brand-sage mb-6 overflow-x-auto custom-scrollbar">',
        '<div className="flex space-x-2 border-b border-gray-200 mb-8 overflow-x-auto custom-scrollbar">'
    )
    # the active tab style
    content = re.sub(
        r'className={`flex items-center gap-2 px-5 py-3 font-bold text-sm transition-colors \$\{activeTab === \'(.*?)\' \? \'bg-brand-sage/10 text-brand-dark border-b-2 border-brand-dark\' : \'text-gray-500 hover:text-brand-dark hover:bg-gray-50\'\}`}',
        r'className={`flex items-center gap-2 px-6 py-4 font-medium text-[13px] tracking-wide transition-all ${activeTab === \'\1\' ? \'text-brand-sage border-b-2 border-brand-sage bg-brand-sage/5\' : \'text-slate-500 hover:text-slate-800 border-b-2 border-transparent\'}`}',
        content
    )

    # 8. Detalle de Presupuesto - Action Bar
    content = content.replace(
        '<div className="flex items-center gap-3">',
        '<div className="flex items-center gap-2">'
    )
    content = content.replace(
        '<button onClick={savePresupuesto} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 flex items-center gap-2 shadow-sm">',
        '<button onClick={savePresupuesto} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-700 flex items-center gap-2 shadow-sm transition-colors text-sm">'
    )
    content = content.replace(
        '<button onClick={updatePricesFromCatalog} className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded font-bold hover:bg-gray-50 shadow-sm text-sm">',
        '<button onClick={updatePricesFromCatalog} className="border border-gray-200 bg-white text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 shadow-sm text-sm transition-colors">'
    )
    content = content.replace(
        '<button onClick={() => setIsAddRubroModalOpen(true)} className="bg-brand-sage text-white px-4 py-2 rounded font-bold hover:opacity-90 flex items-center gap-2 shadow-sm">',
        '<button onClick={() => setIsAddRubroModalOpen(true)} className="bg-brand-sage text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 flex items-center gap-2 shadow-sm transition-opacity text-sm">'
    )
    
    # 9. Rubros Table Container
    content = content.replace(
        '<div className="bg-white rounded-xl shadow-md border border-gray-200 border-t-4 border-t-brand-sage mb-6">',
        '<div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 mb-6 overflow-hidden">'
    )
    # Rubros Table Header
    content = content.replace(
        '<thead className="bg-slate-50 text-slate-700 font-bold text-xs uppercase border-b border-gray-200">',
        '<thead className="bg-slate-50 text-slate-500 font-medium text-[11px] tracking-wider uppercase border-b border-gray-200">'
    )

    # 10. Costos Indirectos Header Buttons
    content = content.replace(
        '<button onClick={() => setIndForm({...indForm, pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0})} className=\'px-4 py-2 text-sm font-bold bg-white border rounded text-gray-700 shadow-sm hover:bg-gray-50\'>% Porcentajes por defecto</button>',
        '<button onClick={() => setIndForm({...indForm, pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0})} className=\'px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg text-slate-600 shadow-sm hover:bg-slate-50 transition-colors\'>% Porcentajes por defecto</button>'
    )
    content = content.replace(
        '<button onClick={() => setIndForm({...indForm, formulas: defaultFormulas})} className=\'px-4 py-2 text-sm font-bold bg-gray-200 border rounded text-gray-500 hover:bg-gray-300\'>Restaurar Fórmulas por defecto</button>',
        '<button onClick={() => setIndForm({...indForm, formulas: defaultFormulas})} className=\'px-4 py-2 text-sm font-medium bg-slate-100 border border-transparent rounded-lg text-slate-600 hover:bg-slate-200 transition-colors\'>Restaurar Fórmulas por defecto</button>'
    )
    content = content.replace(
        '<button onClick={handleSaveIndirectos} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-bold flex items-center gap-2 transition-colors">',
        '<button onClick={handleSaveIndirectos} className="bg-brand-sage hover:opacity-90 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm text-sm">'
    )
    
    # 11. Costos Indirectos category headers
    content = content.replace(
        'className="bg-brand-sage/10 text-brand-dark px-4 py-3 font-black text-sm uppercase tracking-wider flex justify-between items-center rounded-t-xl border border-brand-sage/20 border-b-0 mt-6 shadow-sm"',
        'className="bg-slate-50 text-slate-700 px-5 py-3.5 font-bold text-xs uppercase tracking-widest flex justify-between items-center rounded-t-xl border border-gray-200 border-b-0 mt-8"'
    )
    content = content.replace(
        'className="bg-white divide-y border border-gray-200 rounded-b-xl shadow-sm mb-4"',
        'className="bg-white divide-y divide-gray-100 border border-gray-200 rounded-b-xl shadow-sm mb-4"'
    )

    # 12. Explosión de Insumos - Cards
    content = content.replace(
        '<div className="bg-white p-4 rounded-xl shadow-md border-b-4 border-brand-sage">',
        '<div className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-900/5">'
    )
    content = content.replace(
        '<div className="bg-white p-4 rounded-xl shadow-md border-b-4 border-blue-500">',
        '<div className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-900/5">'
    )
    content = content.replace(
        '<div className="bg-white p-4 rounded-xl shadow-md border-b-4 border-orange-500">',
        '<div className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-900/5">'
    )
    content = content.replace(
        '<div className="bg-white p-4 rounded-xl shadow-md border-b-4 border-purple-500">',
        '<div className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-900/5">'
    )
    content = content.replace(
        '<div className="bg-white p-4 rounded-xl shadow-md border-b-4 border-gray-500">',
        '<div className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-900/5">'
    )
    
    # 13. Explosión text colors
    content = content.replace(
        '<div className="text-2xl font-black text-blue-600">${smat.toFixed(2)}</div>',
        '<div className="text-2xl font-black text-slate-800">${smat.toFixed(2)}</div>'
    )
    content = content.replace(
        '<div className="text-2xl font-black text-orange-600">${smob.toFixed(2)}</div>',
        '<div className="text-2xl font-black text-slate-800">${smob.toFixed(2)}</div>'
    )
    content = content.replace(
        '<div className="text-2xl font-black text-purple-600">${smaq.toFixed(2)}</div>',
        '<div className="text-2xl font-black text-slate-800">${smaq.toFixed(2)}</div>'
    )
    content = content.replace(
        '<div className="text-2xl font-black text-gray-600">$0.00</div>',
        '<div className="text-2xl font-black text-slate-800">$0.00</div>'
    )

    # 14. Reportes view
    content = content.replace(
        '<div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">',
        '<div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">'
    )
    content = content.replace(
        '<thead className="bg-brand-sage text-white">',
        '<thead className="bg-slate-50 text-slate-500 border-b border-gray-200">'
    )
    content = content.replace(
        '<th className="px-6 py-4 font-bold text-left">Nombre</th>',
        '<th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase text-left">Nombre</th>'
    )
    content = content.replace(
        '<th className="px-6 py-4 font-bold text-center">PDF</th>',
        '<th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase text-center">PDF</th>'
    )
    content = content.replace(
        '<th className="px-6 py-4 font-bold text-center"><Settings className="mx-auto" size={18}/></th>',
        '<th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase text-center"><Settings className="mx-auto" size={16}/></th>'
    )
    content = content.replace(
        '<th className="px-6 py-4 font-bold text-left">Descripción</th>',
        '<th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase text-left">Descripción</th>'
    )
    
    # Reportes Buttons
    content = content.replace(
        'className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded text-sm flex items-center justify-center gap-2 mx-auto transition-colors"',
        'className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-1.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 mx-auto transition-colors shadow-sm"'
    )
    content = content.replace(
        'className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded text-sm flex items-center justify-center gap-2 mx-auto transition-colors opacity-50 cursor-not-allowed"',
        'className="bg-slate-800 opacity-50 text-white font-medium py-1.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 mx-auto cursor-not-allowed"'
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("UI overhaul complete")

if __name__ == '__main__':
    main()
