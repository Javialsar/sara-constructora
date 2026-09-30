const fs = require('fs');
let content = fs.readFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', 'utf8');

content = content.replace('"use client"', '');
content = '"use client"\n' + content;

fs.writeFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', content);
