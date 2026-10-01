const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', 'utf8');

content = content.replace(
  'estado: item.estado || item.estado_verificacion || (item.publicado ? "publicado" : "en_verificacion"),',
  'estado: item.estado || (item.legalidad?.estado) || item.estado_verificacion || (item.publicado ? "publicado" : "en_verificacion"),'
);

fs.writeFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', content);
