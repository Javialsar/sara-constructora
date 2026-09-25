const fs = require('fs');
let content = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

// 1. handleCreateRubro payload
content = content.replace(
  /delete \(payload as any\)\.categoria;/g,
  'delete (payload as any).categoria; delete (payload as any).familia_id_temp;'
);

// 2. Disable the code input in the modal
// Search for: placeholder="Se genera al elegir Grupo" required />
content = content.replace(
  /placeholder="Se genera al elegir Grupo" required \/>/g,
  'placeholder="Se genera al elegir Grupo" required readOnly disabled className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none text-sm bg-gray-100 text-gray-500 cursor-not-allowed font-mono" />'
);
// Also need to remove the original className just before the placeholder to avoid duplicates.
// The original input looks like: className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage text-sm bg-gray-50" placeholder="Se genera al elegir Grupo" required />
// Let's use a regex to replace the entire input tag
content = content.replace(
  /<input type="text" value=\{newRubroData\.codigo\} onChange=\{e => setNewRubroData\(\{\.\.\.newRubroData, codigo: e\.target\.value\}\)\} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage text-sm bg-gray-50" placeholder="Se genera al elegir Grupo" required \/>/,
  `<input type="text" value={newRubroData.codigo} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none text-sm bg-gray-100 text-gray-500 cursor-not-allowed font-mono" placeholder="Se genera al elegir Grupo" />`
);

// 3. Add addInsumoCategory state
content = content.replace(
  /const \[isAddInsumoModalOpen, setIsAddInsumoModalOpen\] = useState\(false\)/,
  `const [isAddInsumoModalOpen, setIsAddInsumoModalOpen] = useState(false)\n  const [addInsumoCategory, setAddInsumoCategory] = useState<string>('')`
);

// 4. Modify filteredInsumosSearch
content = content.replace(
  /const filteredInsumosSearch = allInsumos\.filter\(i => i\.nombre\.toLowerCase\(\)\.includes\(searchInsumoTerm\.toLowerCase\(\)\) \|\| \(i\.codigo && i\.codigo\.toLowerCase\(\)\.includes\(searchInsumoTerm\.toLowerCase\(\)\)\)\)\.slice\(0, 20\)/,
  `const filteredInsumosSearch = allInsumos.filter(i => addInsumoCategory ? i.tipo === addInsumoCategory : true).filter(i => i.nombre.toLowerCase().includes(searchInsumoTerm.toLowerCase()) || (i.codigo && i.codigo.toLowerCase().includes(searchInsumoTerm.toLowerCase()))).slice(0, 20)`
);

// 5. Remove global button
content = content.replace(
  /<button onClick=\{\(\) => setIsAddInsumoModalOpen\(true\)\} className="bg-brand-dark text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-sage hover:text-brand-dark transition-colors flex items-center gap-2 text-sm">\s*<Plus size=\{16\} \/> Agregar Insumo\s*<\/button>/g,
  ''
);

// 6. Add specific buttons to the headers
const equipoHeader = `<div className="flex items-center gap-2"><Wrench size={15} className="text-purple-400" /><span className="font-bold text-xs uppercase tracking-wide">1. Equipos y Maquinaria</span></div>`;
const equipoHeaderNew = `<div className="flex items-center gap-2"><Wrench size={15} className="text-purple-400" /><span className="font-bold text-xs uppercase tracking-wide">1. Equipos y Maquinaria</span><button onClick={() => { setAddInsumoCategory('equipo'); setIsAddInsumoModalOpen(true); }} className="ml-2 text-xs bg-purple-200 hover:bg-purple-300 text-purple-800 px-2 py-0.5 rounded font-semibold transition-colors flex items-center gap-1"><Plus size={12}/> Agregar</button></div>`;
content = content.replace(equipoHeader, equipoHeaderNew);

const manoHeader = `<div className="flex items-center gap-2"><HardHat size={15} className="text-amber-400" /><span className="font-bold text-xs uppercase tracking-wide">2. Mano de Obra</span></div>`;
const manoHeaderNew = `<div className="flex items-center gap-2"><HardHat size={15} className="text-amber-400" /><span className="font-bold text-xs uppercase tracking-wide">2. Mano de Obra</span><button onClick={() => { setAddInsumoCategory('mano_de_obra'); setIsAddInsumoModalOpen(true); }} className="ml-2 text-xs bg-amber-200 hover:bg-amber-300 text-amber-800 px-2 py-0.5 rounded font-semibold transition-colors flex items-center gap-1"><Plus size={12}/> Agregar</button></div>`;
content = content.replace(manoHeader, manoHeaderNew);

const materialHeader = `<div className="flex items-center gap-2"><Package size={15} className="text-sky-400" /><span className="font-bold text-xs uppercase tracking-wide">3. Materiales</span></div>`;
const materialHeaderNew = `<div className="flex items-center gap-2"><Package size={15} className="text-sky-400" /><span className="font-bold text-xs uppercase tracking-wide">3. Materiales</span><button onClick={() => { setAddInsumoCategory('material'); setIsAddInsumoModalOpen(true); }} className="ml-2 text-xs bg-sky-200 hover:bg-sky-300 text-sky-800 px-2 py-0.5 rounded font-semibold transition-colors flex items-center gap-1"><Plus size={12}/> Agregar</button></div>`;
content = content.replace(materialHeader, materialHeaderNew);

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', content);
