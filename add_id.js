const fs = require('fs');
let content = fs.readFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', 'utf8');

content = content.replace(
  'finalInmueble.codigo = `SARA-${finalInmueble.tipo.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`',
  'finalInmueble.codigo = `SARA-${finalInmueble.tipo.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`\n    }\n    if (!(finalInmueble as any).id) {\n      (finalInmueble as any).id = crypto.randomUUID();'
);

fs.writeFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', content);
