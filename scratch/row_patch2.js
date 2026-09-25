const fs = require('fs');
let content = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

const searchStr = '<span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${isSelected ? \\'bg-white/20 text-white\\' : \\'bg-gray-200 text-gray-600\\'}`}>{rubros.filter(r => subs.map(sf=>sf.id).includes(r.subfamilia_id || \\'\\')).length}</span>\\n                    </button>';

const replaceStr = `<span className={\`text-xs px-1.5 py-0.5 rounded-full shrink-0 \${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}\`}>{rubros.filter(r => subs.map(sf=>sf.id).includes(r.subfamilia_id || '')).length}</span>
                    </button>
                    <button onClick={async (e) => { e.stopPropagation(); if (!confirm(\`¿Eliminar el grupo "\${fam.nombre}"?\`)) return; const { error } = await supabase.from('familias').delete().eq('id', fam.id); if (!error) { if (selectedFamilia === fam.id) setSelectedFamilia(null); setFamilias(familias.filter((f: any) => f.id !== fam.id)); } else alert('No se puede eliminar porque tiene rubros.'); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded"><Trash2 size={14} /></button>`;

// Fix escaping by doing a simpler split
const lines = content.split('\\n');
const targetLineIndex = lines.findIndex(l => l.includes('{rubros.filter(r => subs.map(sf=>sf.id).includes(r.subfamilia_id || \\'\\')).length}</span>'));

if(targetLineIndex > -1) {
  // Just insert the button below this line, since `</button>` is the next line
  lines.splice(targetLineIndex + 2, 0, `<button onClick={async (e) => { e.stopPropagation(); if (!confirm(\`¿Eliminar el grupo "\${fam.nombre}"?\`)) return; const { error } = await supabase.from('familias').delete().eq('id', fam.id); if (!error) { if (selectedFamilia === fam.id) setSelectedFamilia(null); setFamilias(familias.filter((f: any) => f.id !== fam.id)); } else alert('No se puede eliminar porque tiene rubros asignados.'); }} className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-sm"><Trash2 size={14} /></button>`);
  
  // also make the wrapper group relative
  const divIndex = lines.findIndex((l, i) => i < targetLineIndex && l.includes('<div key={fam.id}>'));
  if(divIndex > -1) {
    lines[divIndex] = lines[divIndex].replace('<div key={fam.id}>', '<div key={fam.id} className="group relative">');
  }
}

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', lines.join('\\n'));
console.log('Done');
