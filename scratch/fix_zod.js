const fs = require('fs');
let c = fs.readFileSync('src/app/admin/proveedores/page.tsx', 'utf-8');
c = c.replace('z.coerce.number().min(0, "No puede ser negativo")', 'z.preprocess((val) => Number(val) || 0, z.number().min(0, "No puede ser negativo"))');
fs.writeFileSync('src/app/admin/proveedores/page.tsx', c);
