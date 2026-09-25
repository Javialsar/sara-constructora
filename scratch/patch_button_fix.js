const fs = require('fs');
let c = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

// 1. Fix the Supabase select to include subfamilia_id
c = c.replace(
  /.select\('id, cantidad, insumo_id, insumos \( id, codigo, nombre, unidad, tipo, precio_sin_iva \)'\)/,
  ".select('id, cantidad, insumo_id, insumos ( id, codigo, nombre, unidad, tipo, precio_sin_iva, subfamilia_id )')"
);

// 2. Remove the individual + Agregar buttons
c = c.replace(/<button onClick=\{\(\) => \{ setAddInsumoCategory\(famIns\.id\); setIsAddInsumoModalOpen\(true\); \}\} className=\"ml-2 text-xs bg-brand-sage\/10 hover:bg-brand-sage\/20 text-brand-dark px-2 py-0\.5 rounded font-semibold transition-colors flex items-center gap-1 shadow-sm\"><Plus size=\{12\}\/> Agregar<\/button>/g, '');

// 3. Add the single + Agregar Insumo button at the footer
const oldFooter = /<button onClick=\{closeEditor\} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-200 transition-colors">Cerrar<\/button>/;
const newFooter = `<button onClick={() => { setAddInsumoCategory(''); setIsAddInsumoModalOpen(true); }} className="px-4 py-2 rounded-lg text-sm font-bold bg-brand-sage/10 text-brand-dark hover:bg-brand-sage/20 transition-colors flex items-center gap-2 border border-brand-sage/20"><Plus size={16} /> Agregar Insumos</button>
                  <button onClick={closeEditor} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-200 transition-colors">Cerrar</button>`;

c = c.replace(oldFooter, newFooter);

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', c);
