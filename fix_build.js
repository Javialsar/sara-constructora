const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', 'utf8');

content = content.replace(
  'let errData = {};',
  'let errData: any = {};'
);

fs.writeFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', content);
