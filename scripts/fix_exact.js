const fs = require('fs');
let c = fs.readFileSync('src/app/admin/proveedores/[id]/page.tsx', 'utf8');
c = c.replace('.ilike(\'nombre\', `\\%\\$\\{searchTerm\\}\\%\\`)', '.ilike(\'nombre\', `%${searchTerm}%`)');
fs.writeFileSync('src/app/admin/proveedores/[id]/page.tsx', c);
console.log('Fixed exactly!');
