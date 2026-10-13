const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

const regex = /publicado: true,[\s\n]*promocion: \{/g;
const rep = `publicado: true,
      estado: 'publicado',
      promocion: {`;

content = content.replace(regex, rep);
fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
