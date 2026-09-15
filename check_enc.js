const fs = require('fs');
let text = fs.readFileSync('src/app/admin/cotizador/page.tsx', 'utf8');
console.log(text.includes('Consultoría'));
console.log(text.includes('ConsultorÃa'));
