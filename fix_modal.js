const fs = require('fs');

let code = fs.readFileSync('src/app/admin/apus/insumos/page.tsx', 'utf8');

code = code.replace(/proveedor_id:\s*""\s*}/g, 'proveedor_id: "", proveedores_ids: []}');

fs.writeFileSync('src/app/admin/apus/insumos/page.tsx', code);
