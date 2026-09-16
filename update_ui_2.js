const fs = require('fs');

let f2 = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf8');
f2 = f2.replace(/<Wrench size=\{14\} className="text-purple-500" \/>\}/, "<Wrench size={14} className=\"text-purple-500\" /> : item.insumo.tipo === 'herramienta_menor' ? <Hammer size={14} className=\"text-teal-500\" /> : <Tag size={14} className=\"text-gray-500\" />}");
f2 = f2.replace(/ins.tipo === 'mano_obra' \? 'bg-orange-50 text-orange-500' : 'bg-purple-50 text-purple-500'/, "ins.tipo === 'mano_obra' ? 'bg-orange-50 text-orange-500' : ins.tipo === 'equipo' ? 'bg-purple-50 text-purple-500' : ins.tipo === 'herramienta_menor' ? 'bg-teal-50 text-teal-500' : 'bg-gray-50 text-gray-500'");
f2 = f2.replace(/ins.tipo === 'mano_obra' \? <Users size=\{16\} \/> : <Wrench size=\{16\} \/>\}/, "ins.tipo === 'mano_obra' ? <Users size={16} /> : ins.tipo === 'equipo' ? <Wrench size={16} /> : ins.tipo === 'herramienta_menor' ? <Hammer size={16} /> : <Tag size={16} />}");
fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', f2);

let f3 = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8');
f3 = f3.replace(/let totEq = explosionData.filter\\(i => i.tipo === 'equipo'\\).reduce\\(\\(acc, curr\\) => acc \\+ curr.costo_total, 0\\)/, 
"let totEq = explosionData.filter(i => i.tipo === 'equipo' || i.tipo === 'herramienta_menor').reduce((acc, curr) => acc + curr.costo_total, 0)\n    let totOtros = explosionData.filter(i => i.tipo === 'otros').reduce((acc, curr) => acc + curr.costo_total, 0)");
f3 = f3.replace(/ins.tipo === 'mano_obra' \? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'/, "ins.tipo === 'mano_obra' ? 'bg-orange-50 text-orange-600' : ins.tipo === 'equipo' ? 'bg-purple-50 text-purple-600' : ins.tipo === 'herramienta_menor' ? 'bg-teal-50 text-teal-600' : 'bg-gray-50 text-gray-600'");
fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', f3);

console.log('Fixed files 2 and 3');
