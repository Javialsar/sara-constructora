const fs = require('fs');
let c = fs.readFileSync('src/app/admin/proveedores/[id]/page.tsx', 'utf8');
c = c.replace(/\\\`%\$\\\{searchTerm\}\%\\\`/g, '`%${searchTerm}%`');
fs.writeFileSync('src/app/admin/proveedores/[id]/page.tsx', c);
console.log('Fixed syntax');
