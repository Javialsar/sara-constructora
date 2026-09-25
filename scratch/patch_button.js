const fs = require('fs');
let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf-8');

c = c.replace(/<button className="px-4 py-2 text-sm font-bold bg-white border rounded text-gray-700 shadow-sm">% Porcentajes por defecto<\/button>/g,
  '<button onClick={() => setIndForm({...indForm, pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0})} className="px-4 py-2 text-sm font-bold bg-white border rounded text-gray-700 shadow-sm hover:bg-gray-50">% Porcentajes por defecto</button>'
);

fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
console.log('Button patched!');
