const fs = require('fs');
let content = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

const target1 = `<div key={fam.id}>
                    <button onClick={() => { setSelectedFamilia(fam.id); setSelectedSubfamilia(null); setExpandedFamilias(prev => { const n = new Set(prev); if (n.has(fam.id)) n.delete(fam.id); else n.add(fam.id); return n }) }}
                      className={\`w-full text-left px-2 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 \${isSelected ? 'bg-brand-sage text-white font-medium' : 'text-gray-700 hover:bg-gray-100'}\`}>`;

const replace1 = `<div key={fam.id} className="group relative">
                    <button onClick={() => { setSelectedFamilia(fam.id); setSelectedSubfamilia(null); setExpandedFamilias(prev => { const n = new Set(prev); if (n.has(fam.id)) n.delete(fam.id); else n.add(fam.id); return n }) }}
                      className={\`w-full text-left px-2 py-2 pr-8 rounded-lg text-sm transition-colors flex items-center gap-1 \${isSelected ? 'bg-brand-sage text-white font-medium' : 'text-gray-700 hover:bg-gray-100'}\`}>`;

// Handle CRLF manually
const s1 = target1.replace(/\n/g, '\r\n');
const r1 = replace1.replace(/\n/g, '\r\n');

content = content.replace(s1, r1);

const target2 = `{rubros.filter(r => subs.map(sf=>sf.id).includes(r.subfamilia_id || '')).length}</span>
                    </button>
                    
                  </div>`;

const replace2 = `{rubros.filter(r => subs.map(sf=>sf.id).includes(r.subfamilia_id || '')).length}</span>
                    </button>
                    <button onClick={async (e) => { e.stopPropagation(); if (!confirm(\`¿Eliminar el grupo "\${fam.nombre}"?\`)) return; const { error } = await supabase.from('familias').delete().eq('id', fam.id); if (!error) { if (selectedFamilia === fam.id) setSelectedFamilia(null); setFamilias(familias.filter((f: any) => f.id !== fam.id)); } else alert('No se puede eliminar porque tiene rubros.'); }} className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-sm"><Trash2 size={14} /></button>
                  </div>`;

const s2 = target2.replace(/\n/g, '\r\n');
const r2 = replace2.replace(/\n/g, '\r\n');

content = content.replace(s2, r2);

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', content);
