const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('value="destacado"'));
if (idx !== -1) {
  for(let i=idx-10; i<idx+20; i++) console.log(lines[i]);
}
