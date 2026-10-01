const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('{(inm.promocion || {}).estadoPago === "al_dia"'));
if (idx !== -1) {
  for(let i=idx-2; i<idx+30; i++) console.log(lines[i]);
}
