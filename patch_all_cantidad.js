const fs = require('fs');
const path = 'src/app/admin/presupuestos_reales/page.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/pr\.cantidad \|\|/g, 'pr.cantidad_obra ||');
code = code.replace(/pr\.cantidad\)/g, 'pr.cantidad_obra)');

fs.writeFileSync(path, code);
console.log("Patched all pr.cantidad to pr.cantidad_obra");
