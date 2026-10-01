const fs = require('fs');
let content = fs.readFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('titularCedula: '));
if (idx !== -1) {
  for(let i=idx-2; i<idx+30; i++) console.log(lines[i]);
}
