const fs = require('fs');
let content = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

// 1. Group row in Left Panel
// Find the <div key={fam.id}>
const famDivRegex = /<div key=\{fam\.id\}>([\s\S]*?)<\/div>/;
const famDivMatch = content.match(famDivRegex);
if(famDivMatch) {
  const original = famDivMatch[0];
  const replaced = `<div key={fam.id} className="group relative">
                    <button onClick={() => { setSelectedFamilia(fam.id); setSelectedSubfamilia(null); setExpandedFamilias(prev => { const n = new Set(prev); if (n.has(fam.id)) n.delete(fam.id); else n.add(fam.id); return n }) }}
                      className={\`w-full text-left px-2 py-2 pr-12 rounded-lg text-sm transition-colors flex items-center gap-1 \${isSelected ? 'bg-brand-sage text-white font-medium' : 'text-gray-700 hover:bg-gray-100'}\`}>
                      <span className="mr-1"><Layers size={14} /></span>
                      <span className="flex-1 truncate text-xs font-semibold">{fam.nombre}</span>
                      <span className={\`text-xs px-1.5 py-0.5 rounded-full shrink-0 \${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}\`}>{rubros.filter(r => subs.map(sf=>sf.id).includes(r.subfamilia_id || '')).length}</span>
                    </button>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-0.5 rounded shadow-sm">
                      <button onClick={async (e) => {
                        e.stopPropagation();
                        const newName = window.prompt("Nuevo nombre del grupo:", fam.nombre);
                        if(newName && newName.trim() !== fam.nombre) {
                          const { error } = await supabase.from('familias').update({ nombre: newName.trim() }).eq('id', fam.id);
                          if(!error) setFamilias(familias.map((f:any) => f.id === fam.id ? {...f, nombre: newName.trim()} : f));
                        }
                      }} className="p-1 text-gray-400 hover:text-blue-500 rounded" title="Editar"><Edit3 size={12} /></button>
                      <button onClick={async (e) => {
                        e.stopPropagation();
                        if (!confirm(\`¿Eliminar el grupo "\${fam.nombre}"?\`)) return;
                        const { error } = await supabase.from('familias').delete().eq('id', fam.id);
                        if (!error) {
                          if (selectedFamilia === fam.id) setSelectedFamilia(null);
                          setFamilias(familias.filter((f: any) => f.id !== fam.id));
                        } else alert('No se puede eliminar porque tiene rubros asignados.');
                      }} className="p-1 text-gray-400 hover:text-red-500 rounded" title="Eliminar"><Trash2 size={12} /></button>
                    </div>
                  </div>`;
  content = content.replace(original, replaced);
}

// 2. APU Editor Header (Editable nombre and unidad)
const headerNameRegex = /<span className="truncate">\{currentRubro\.nombre\}<\/span>/;
const headerNameReplacement = `<input type="text" value={currentRubro.nombre} onChange={e => setCurrentRubro({...currentRubro, nombre: e.target.value})} className="truncate bg-transparent border-b border-dashed border-gray-400 hover:border-brand-sage focus:border-brand-sage outline-none flex-1" />`;
content = content.replace(headerNameRegex, headerNameReplacement);

const headerUnidadRegex = /Unidad de Medida: <span className="text-gray-700 font-bold">\{currentRubro\.unidad\}<\/span>/;
const headerUnidadReplacement = `Unidad de Medida: <input type="text" value={currentRubro.unidad} onChange={e => setCurrentRubro({...currentRubro, unidad: e.target.value})} className="ml-1 w-16 text-gray-700 font-bold bg-transparent border-b border-dashed border-gray-400 hover:border-brand-sage focus:border-brand-sage outline-none text-center" />`;
content = content.replace(headerUnidadRegex, headerUnidadReplacement);

// 3. saveRubro to save nombre and unidad
const saveRubroRegex = /const \{ error \} = await supabase\.from\('rubros'\)\.update\(\{ herramienta_menor_pct: currentRubro\.herramienta_menor_pct, total_costo_directo: totalCostoDirecto \}\)\.eq\('id', currentRubro\.id\)/;
const saveRubroReplacement = `const { error } = await supabase.from('rubros').update({ herramienta_menor_pct: currentRubro.herramienta_menor_pct, total_costo_directo: totalCostoDirecto, nombre: currentRubro.nombre, unidad: currentRubro.unidad }).eq('id', currentRubro.id)`;
content = content.replace(saveRubroRegex, saveRubroReplacement);

const updateStateRegex = /setRubros\(rubros\.map\(r => r\.id === currentRubro\.id \? \{\.\.\.r, total_costo_directo: totalCostoDirecto, herramienta_menor_pct: currentRubro\.herramienta_menor_pct\} : r\)\)/;
const updateStateReplacement = `setRubros(rubros.map((r:any) => r.id === currentRubro.id ? {...r, total_costo_directo: totalCostoDirecto, herramienta_menor_pct: currentRubro.herramienta_menor_pct, nombre: currentRubro.nombre, unidad: currentRubro.unidad} : r))`;
content = content.replace(updateStateRegex, updateStateReplacement);

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', content);
