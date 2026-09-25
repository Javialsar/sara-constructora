const fs = require('fs');
let c = fs.readFileSync('src/app/admin/proveedores/page.tsx', 'utf-8');
c = c.replace('z.preprocess((val) => Number(val) || 0, z.number().min(0, "No puede ser negativo"))', 'z.number().min(0, "No puede ser negativo")');
c = c.replace('{...register("dias_credito")}', '{...register("dias_credito", { valueAsNumber: true })}');
fs.writeFileSync('src/app/admin/proveedores/page.tsx', c);
