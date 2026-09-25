const fs = require('fs');
let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf-8');
c = c.replace(/s = s\.replace\(new RegExp\(.*?, 'g'\), v\);/g, "s = s.replace(new RegExp('\\\\$' + k + '\\\\b', 'g'), v);");
fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
console.log('Regex fixed!');
