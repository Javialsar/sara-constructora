const fs = require('fs');
let c = fs.readFileSync('src/app/admin/proveedores/page.tsx', 'utf-8');

c = c.replace(/dias_credito: z\.any\(\)\.transform\(v => Number\(v\) \|\| 0\),/, 'dias_credito: z.coerce.number().min(0, "No puede ser negativo"),');
c = c.replace(/useForm<any>/, 'useForm<ProveedorFormValues>');

c = c.replace(/\{errors\.razon_social\.message\}/g, '{errors.razon_social.message as string}');
c = c.replace(/\{errors\.dias_credito\.message\}/g, '{errors.dias_credito.message as string}');
c = c.replace(/\{errors\.email\.message\}/g, '{errors.email.message as string}');
c = c.replace(/\{errors\.sitio_web\.message\}/g, '{errors.sitio_web.message as string}');

fs.writeFileSync('src/app/admin/proveedores/page.tsx', c);
