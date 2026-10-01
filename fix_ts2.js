const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');
content = content.replace("estadoPago: 'vencido', ", "estadoPago: 'vencido' as const, ");
fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
