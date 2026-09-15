const fs = require('fs');
let text = fs.readFileSync('src/app/admin/cotizador/page.tsx', 'utf8');
console.log('Diseño:', text.includes('Diseño'));
console.log('DiseÃ±o:', text.includes('DiseÃ±o'));
console.log('Ingenierías:', text.includes('Ingenierías'));
console.log('IngenierÃas:', text.includes('IngenierÃas'));
