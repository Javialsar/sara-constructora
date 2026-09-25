const fs = require('fs');
let content = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

// 1. Replace the header of the left panel (Grupos / Subgrupos -> Grupos with + button)
const headerRegex = /<div className="flex justify-between items-center">\s*<span className="font-bold text-gray-700 text-xs uppercase tracking-wider">Grupos \/ Subgrupos<\/span>\s*<button onClick=\{\(\) => setVista\('grupos'\)\} className="p-1.5 bg-gray-200 hover:bg-brand-sage hover:text-white rounded text-gray-600 transition-colors" title="Gestionar Grupos"><Wrench size=\{14\} \/><\/button>\s*<\/div>/;

const newHeader = `<div className="flex justify-between items-center">
  <span className="font-bold text-gray-700 text-xs uppercase tracking-wider">Grupos</span>
  <button onClick={async () => {
    const nombre = window.prompt('Nombre del nuevo Grupo:');
    if (!nombre || !nombre.trim()) return;
    const id = 'FAM-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const { data, error } = await supabase.from('familias').insert([{ id, nombre: nombre.trim(), grupo_sugerido: 'rubro' }]).select();
    if (!error && data) {
      setFamilias([...familias, data[0]]);
      const sfId = 'SF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const { data: sfData } = await supabase.from('subfamilias').insert([{ id: sfId, nombre: 'General', familia_id: id }]).select();
      if (sfData) setSubfamilias((prev: any) => [...prev, sfData[0]]);
    } else alert('Error al crear el grupo');
  }} className="p-1.5 bg-brand-sage hover:bg-brand-dark text-white rounded transition-colors" title="Crear Grupo"><Plus size={14} /></button>
</div>`;

content = content.replace(headerRegex, newHeader);

// 2. Add inline delete button to the group row
// Find the div wrapping the button
const rowRegex = /<div key=\{fam\.id\}>\s*<button onClick=\{\(\) => \{ setSelectedFamilia\(fam\.id\); setSelectedSubfamilia\(null\); setExpandedFamilias\(prev => \{ const n = new Set\(prev\); if \(n\.has\(fam\.id\)\) n\.delete\(fam\.id\); else n\.add\(fam\.id\); return n \}\) \}\} \s*className=\{`w-full text-left px-2 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 \$\{isSelected \? 'bg-brand-sage text-white font-medium' : 'text-gray-700 hover:bg-gray-100'\}\`\}>\s*<span className="mr-1"><Layers size=\{14\} \/><\/span>\s*<span className="flex-1 truncate text-xs font-semibold">\{fam\.nombre\}<\/span>\s*<span className=\{`text-xs px-1\.5 py-0\.5 rounded-full shrink-0 \$\{isSelected \? 'bg-white\/20 text-white' : 'bg-gray-200 text-gray-600'\}\`\}>\{rubros\.filter\(r => subs\.map\(sf=>sf\.id\)\.includes\(r\.subfamilia_id \|\| ''\)\)\.length\}<\/span>\s*<\/button>\s*<\/div>/g;

const newRow = `<div key={fam.id} className="group relative">
  <button onClick={() => { setSelectedFamilia(fam.id); setSelectedSubfamilia(null); }}
    className={\`w-full text-left px-2 py-2 pr-8 rounded-lg text-sm transition-colors flex items-center gap-1 \${isSelected ? 'bg-brand-sage text-white font-medium' : 'text-gray-700 hover:bg-gray-100'}\`}>
    <span className="mr-1"><Layers size={14} /></span>
    <span className="flex-1 truncate text-xs font-semibold">{fam.nombre}</span>
    <span className={\`text-xs px-1.5 py-0.5 rounded-full shrink-0 \${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}\`}>{rubros.filter((r: any) => subs.map((sf: any)=>sf.id).includes(r.subfamilia_id || '')).length}</span>
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
    <Trash size={12} />
  </button>
</div>`;

content = content.replace(rowRegex, newRow);

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', content);
