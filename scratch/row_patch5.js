const fs = require('fs');
let content = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');
const lines = content.split(/\\r?\\n/);

const idx = lines.findIndex(l => l.includes('<div key={fam.id}>'));
if (idx > -1) {
  lines[idx] = lines[idx].replace('<div key={fam.id}>', '<div key={fam.id} className="group relative">');
}

const spanIdx = lines.findIndex((l, i) => i > idx && l.includes('rubros.filter(r => subs.map(sf=>sf.id)'));

if (spanIdx > -1) {
  lines[spanIdx+1] = lines[spanIdx+1] + `\n                    <button onClick={async (e) => { e.stopPropagation(); if (!confirm(\`¿Eliminar el grupo "\${fam.nombre}"?\`)) return; const { error } = await supabase.from('familias').delete().eq('id', fam.id); if (!error) { if (selectedFamilia === fam.id) setSelectedFamilia(null); setFamilias(familias.filter((f: any) => f.id !== fam.id)); } else alert('No se puede eliminar porque tiene rubros asignados.'); }} className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-sm"><Trash2 size={14} /></button>`;
}

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', lines.join('\n'));
