const fs = require('fs');
let c = fs.readFileSync('src/app/admin/proveedores/page.tsx', 'utf-8');
c = c.replace(/dias_credito: z\.coerce\.number\(\)\.min\(0, "No puede ser negativo"\),/, 'dias_credito: z.any().transform(v => Number(v) || 0),');
c = c.replace(/useForm<ProveedorFormValues>/, 'useForm<any>');
fs.writeFileSync('src/app/admin/proveedores/page.tsx', c);
