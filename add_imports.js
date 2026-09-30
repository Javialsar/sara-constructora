const fs = require('fs');
let content = fs.readFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', 'utf8');

if (!content.includes('Percent,')) {
  content = content.replace(
    'import {',
    'import { Percent, CheckCircle2, '
  );
  fs.writeFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', content);
  console.log('Added imports');
}
