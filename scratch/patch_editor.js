const fs = require('fs');
let content = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

// 1. Modify saveRubro to close the modal instead of alert
const oldSave = `  const saveRubro = async () => {
    const { totalCostoDirecto } = calcTotalesReceta()
    const { error } = await supabase.from('rubros').update({ herramienta_menor_pct: currentRubro.herramienta_menor_pct, total_costo_directo: totalCostoDirecto }).eq('id', currentRubro.id)
    if (!error) {
      alert("Rubro guardado y costeado correctamente.")
      setRubros(rubros.map(r => r.id === currentRubro.id ? {...r, total_costo_directo: totalCostoDirecto, herramienta_menor_pct: currentRubro.herramienta_menor_pct} : r))
    }
  }`;

const newSave = `  const saveRubro = async () => {
    const { totalCostoDirecto } = calcTotalesReceta()
    const { error } = await supabase.from('rubros').update({ herramienta_menor_pct: currentRubro.herramienta_menor_pct, total_costo_directo: totalCostoDirecto }).eq('id', currentRubro.id)
    if (!error) {
      setRubros(rubros.map(r => r.id === currentRubro.id ? {...r, total_costo_directo: totalCostoDirecto, herramienta_menor_pct: currentRubro.herramienta_menor_pct} : r))
      closeEditor()
    }
  }`;

if (content.includes('alert("Rubro guardado y costeado correctamente.")')) {
  // Use a targeted replacement that accounts for \r\n differences
  content = content.replace(/alert\("Rubro guardado y costeado correctamente\."\)\r?\n\s+setRubros\([\s\S]*?\)/, `setRubros(rubros.map(r => r.id === currentRubro.id ? {...r, total_costo_directo: totalCostoDirecto, herramienta_menor_pct: currentRubro.herramienta_menor_pct} : r))\n      closeEditor()`);
}

// 2. Modify Modal Colors
content = content.replace(
  '<div className="bg-brand-dark text-white px-5 py-4 flex justify-between items-center shrink-0">',
  '<div className="bg-white border-b border-gray-200 px-5 py-4 flex justify-between items-center shrink-0">'
);
content = content.replace(
  '<PenTool size={20} className="text-brand-sage shrink-0" />',
  '<div className="p-2 bg-brand-sage/10 rounded-lg text-brand-sage shrink-0"><PenTool size={20} /></div>'
);
content = content.replace(
  '<span className="text-brand-sage font-mono text-sm bg-white/10 px-2 py-0.5 rounded">{currentRubro.codigo}</span>',
  '<span className="text-gray-500 font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200">{currentRubro.codigo}</span>'
);
content = content.replace(
  '<h2 className="font-bold text-base flex items-center gap-2 truncate">',
  '<h2 className="font-bold text-lg text-gray-800 flex items-center gap-2 truncate">'
);
content = content.replace(
  '<p className="text-white/50 text-xs mt-0.5">Unidad: <span className="text-white/80 font-bold">{currentRubro.unidad}</span></p>',
  '<p className="text-gray-500 text-xs mt-0.5">Unidad de Medida: <span className="text-gray-700 font-bold">{currentRubro.unidad}</span></p>'
);
content = content.replace(
  '<button onClick={closeEditor} className="text-white/50 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors shrink-0"><X size={22} /></button>',
  '<button onClick={closeEditor} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors shrink-0"><X size={20} /></button>'
);

// 3. Improve Summary Cards colors
content = content.replace(
  '<div className="bg-white rounded-lg border border-purple-100 px-3 py-2.5">',
  '<div className="bg-white rounded-lg border border-gray-200 shadow-sm px-3 py-2.5">'
);
content = content.replace(
  '<span className="text-xs font-semibold text-purple-600">Equipos</span>',
  '<span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Equipos</span>'
);
content = content.replace(
  '<div className="text-lg font-black text-purple-700">${totEquipos.toFixed(2)}</div>',
  '<div className="text-lg font-black text-gray-800">${totEquipos.toFixed(2)}</div>'
);
content = content.replace(
  '<Wrench size={14} className="text-purple-400" />',
  '<Wrench size={14} className="text-gray-400" />'
);

content = content.replace(
  '<div className="bg-white rounded-lg border border-amber-100 px-3 py-2.5">',
  '<div className="bg-white rounded-lg border border-gray-200 shadow-sm px-3 py-2.5">'
);
content = content.replace(
  '<span className="text-xs font-semibold text-amber-600">Mano de Obra</span>',
  '<span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mano de Obra</span>'
);
content = content.replace(
  '<div className="text-lg font-black text-amber-700">${totManoObra.toFixed(2)}</div>',
  '<div className="text-lg font-black text-gray-800">${totManoObra.toFixed(2)}</div>'
);
content = content.replace(
  '<HardHat size={14} className="text-amber-400" />',
  '<HardHat size={14} className="text-gray-400" />'
);

content = content.replace(
  '<div className="bg-white rounded-lg border border-sky-100 px-3 py-2.5">',
  '<div className="bg-white rounded-lg border border-gray-200 shadow-sm px-3 py-2.5">'
);
content = content.replace(
  '<span className="text-xs font-semibold text-sky-600">Materiales</span>',
  '<span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Materiales</span>'
);
content = content.replace(
  '<div className="text-lg font-black text-sky-700">${totMateriales.toFixed(2)}</div>',
  '<div className="text-lg font-black text-gray-800">${totMateriales.toFixed(2)}</div>'
);
content = content.replace(
  '<Package size={14} className="text-sky-400" />',
  '<Package size={14} className="text-gray-400" />'
);

content = content.replace(
  '<div className="bg-brand-dark rounded-lg px-3 py-2.5">',
  '<div className="bg-brand-sage rounded-lg border border-brand-sage px-3 py-2.5 text-white shadow-sm">'
);

// Improve Table Section Headers
content = content.replace(
  '<div className="px-4 py-2 bg-purple-50 border-b border-purple-100 flex items-center justify-between">',
  '<div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">'
);
content = content.replace(
  '<h3 className="font-bold text-xs text-purple-700 flex items-center gap-2"><Wrench size={14} /> 1. EQUIPOS Y MAQUINARIA</h3>',
  '<h3 className="font-bold text-xs text-gray-700 flex items-center gap-2 uppercase tracking-wide"><Wrench size={14} /> 1. EQUIPOS Y MAQUINARIA</h3>'
);
content = content.replace(
  '<span className="font-black text-sm text-purple-700">${totEquipos.toFixed(4)}</span>',
  '<span className="font-black text-sm text-gray-800">${totEquipos.toFixed(4)}</span>'
);

content = content.replace(
  '<div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center justify-between">',
  '<div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">'
);
content = content.replace(
  '<h3 className="font-bold text-xs text-amber-700 flex items-center gap-2"><HardHat size={14} /> 2. MANO DE OBRA</h3>',
  '<h3 className="font-bold text-xs text-gray-700 flex items-center gap-2 uppercase tracking-wide"><HardHat size={14} /> 2. MANO DE OBRA</h3>'
);
content = content.replace(
  '<span className="font-black text-sm text-amber-700">${totManoObra.toFixed(4)}</span>',
  '<span className="font-black text-sm text-gray-800">${totManoObra.toFixed(4)}</span>'
);

content = content.replace(
  '<div className="px-4 py-2 bg-sky-50 border-b border-sky-100 flex items-center justify-between">',
  '<div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">'
);
content = content.replace(
  '<h3 className="font-bold text-xs text-sky-700 flex items-center gap-2"><Package size={14} /> 3. MATERIALES</h3>',
  '<h3 className="font-bold text-xs text-gray-700 flex items-center gap-2 uppercase tracking-wide"><Package size={14} /> 3. MATERIALES</h3>'
);
content = content.replace(
  '<span className="font-black text-sm text-sky-700">${totMateriales.toFixed(4)}</span>',
  '<span className="font-black text-sm text-gray-800">${totMateriales.toFixed(4)}</span>'
);

// Bottom buttons
content = content.replace(
  '<button onClick={() => setSelectInsumoModal(true)} className="bg-black text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm shadow-sm">',
  '<button onClick={() => setSelectInsumoModal(true)} className="border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm shadow-sm">'
);
content = content.replace(
  '<Save size={16} /> Guardar y Costear',
  '<Save size={16} /> Guardar Cambios'
);

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', content);
