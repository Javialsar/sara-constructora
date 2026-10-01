const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('<th className="py-3 px-4">'));
if (idx !== -1) {
  for(let i=idx-2; i<idx+15; i++) console.log(lines[i]);
}
