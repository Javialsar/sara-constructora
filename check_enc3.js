const fs = require('fs');
let text = fs.readFileSync('src/app/admin/cotizador/page.tsx', 'utf8');
const lines = text.split('\n');
console.log(lines.find(l => l.includes('Módulo 1')));
console.log(lines.find(l => l.includes('MÃ³dulo 1')));
