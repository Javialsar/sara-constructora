const fs = require('fs');
let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8');
let start = c.indexOf("activeTab === 'reportes'");
console.log(c.substring(start, start + 2500));
