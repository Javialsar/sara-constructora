import re

with open('src/app/admin/fletes/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find("{/* TABS COMPLEJOS */}")
end_idx = content.find("      {activeTab === 'dashboard' && <AnalyticsDashboard />}")

if start_idx != -1 and end_idx != -1:
    new_tabs = """{/* TABS COMPLEJOS */}
      <div className="flex gap-4 mb-6 border-b border-slate-200 overflow-x-auto pb-1 no-scrollbar">
        <button onClick={() => setActiveTab('dashboard')} className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'dashboard' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <div className="flex items-center"><FileText className="w-4 h-4 mr-2" /> Dashboard Analítico</div>
        </button>
        <button onClick={() => setActiveTab('mapa')} className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'mapa' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <div className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Monitoreo de Flota</div>
        </button>
        <button onClick={() => setActiveTab('vehiculos')} className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'vehiculos' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <div className="flex items-center"><Truck className="w-4 h-4 mr-2" /> Vehículos y Documentos</div>
        </button>
        <button onClick={() => setActiveTab('recargas')} className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'recargas' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <div className="flex items-center">
             <Wallet className="w-4 h-4 mr-2" /> Validación de Recargas 
             {recharges.filter(r => r.status === 'pending').length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {recharges.filter(r => r.status === 'pending').length}
                </span>
             )}
          </div>
        </button>
        <button onClick={() => setActiveTab('planes')} className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'planes' ? 'border-purple-500 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <div className="flex items-center"><ShieldCheck className="w-4 h-4 mr-2" /> Planes y Tarifas</div>
        </button>
      </div>\n\n"""
    
    content = content[:start_idx] + new_tabs + content[end_idx:]

with open('src/app/admin/fletes/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
