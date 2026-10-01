const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('fetch("/api/inmobiliaria/inmuebles")'));
for(let i=idx-2; i<idx+50; i++) console.log(lines[i]);
