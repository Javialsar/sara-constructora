const fs = require('fs');
let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf-8');
c = c.replace(/className="flex items-center w-24"/g, 'className="flex items-center w-48"');
fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
