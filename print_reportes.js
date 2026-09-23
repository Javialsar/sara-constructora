const fs = require('fs');
let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8').split('\n');
let idx = c.findIndex(l => l.includes("activeTab === 'reportes' && ("));
console.log(c.slice(idx, idx+50).join('\n'));
