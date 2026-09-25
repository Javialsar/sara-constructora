const fs = require('fs');
let content = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

const regex = /<div key=\{fam\.id\}>[\s\S]*?<\/div>/; // Wait, there's another div inside? No, just that.
// Let's use string split and slice to be exact.

const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('const isSelected = selectedFamilia === fam.id && !selectedSubfamilia'));
const end = lines.findIndex((l, i) => i > start && l.includes(')'));

const newBlock = `              return (
                <div key={fam.id} className="group relative flex items-center">
                  <button onClick={() => { setSelectedFamilia(fam.id); setSelectedSubfamilia(null); }}
                    className={\`w-full text-left px-2 py-2 pr-8 rounded-lg text-sm transition-colors flex items-center gap-1 \${isSelected ? 'bg-brand-sage text-white font-medium' : 'text-gray-700 hover:bg-gray-100'}\`}>
                    <span className="mr-1"><Layers size={14} /></span>
                    <span className="flex-1 truncate text-xs font-semibold">{fam.nombre}</span>
                    <span className={\`text-xs px-1.5 py-0.5 rounded-full shrink-0 \${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}\`}>{rubros.filter(r => subs.map(sf=>sf.id).includes(r.subfamilia_id || '')).length}</span>
                  </button>
                  <button onClick={async (e) => {
                    e.stopPropagation();
                    if (!confirm(\`¿Eliminar el grupo "\${fam.nombre}"?\`)) return;
                    const { error } = await supabase.from('familias').delete().eq('id', fam.id);
                    if (!error) {
                      if (selectedFamilia === fam.id) setSelectedFamilia(null);
                      setFamilias(familias.filter((f: any) => f.id !== fam.id));
                    } else alert('No se puede eliminar el grupo porque tiene rubros asignados.');
                  }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={12} />
                  </button>
                </div>
              )`;

lines.splice(start + 1, end - start, newBlock);
fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', lines.join('\n'));
