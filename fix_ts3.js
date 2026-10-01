const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');
content = content.replace("estado: 'publicado',", "estado: 'publicado' as const,");
fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
