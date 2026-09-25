const fs = require('fs');
let content = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');
let lines = content.split(/\r?\n/);

const idx = lines.findIndex(l => l.includes('<span className="flex-1 truncate text-xs font-semibold">{fam.nombre}</span>'));

if(idx > -1) {
  // Need to find the </button>
  const buttonEndIdx = lines.findIndex((l, i) => i > idx && l.includes('</button>'));
  if (buttonEndIdx > -1) {
    const editDeleteBlock = `
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
                    </div>`;
    
    // Check if it's already there
    if (!lines[buttonEndIdx+1].includes('absolute right-1 top-1/2')) {
       lines.splice(buttonEndIdx + 1, 0, editDeleteBlock);
    }
    
    // Also fix the button padding so text doesn't overlap with icons: pr-12
    const btnStartIdx = lines.findIndex((l, i) => i < idx && l.includes('className={`w-full text-left px-2 py-2'));
    if (btnStartIdx > -1) {
      lines[btnStartIdx] = lines[btnStartIdx].replace('px-2 py-2 rounded-lg', 'px-2 py-2 pr-16 rounded-lg');
    }
  }
}

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', lines.join('\n'));
console.log("Done");
