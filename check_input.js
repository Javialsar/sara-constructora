const fs = require('fs');
let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8').split('\n');
c.forEach(l => {
  if (l.includes('<input type="number"') && l.includes('pmob1')) console.log(l.trim());
});
