const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', 'utf8');
const lines = content.split('\n');

console.log("=== BADGES ===");
const start = lines.findIndex(l => l.includes('const getStatusBadge ='));
if (start !== -1) {
  for(let i=start; i<start+20; i++) console.log(lines[i]);
}

console.log("\n=== CARD FOOTER ===");
const start2 = lines.findIndex(l => l.includes('<div className="p-5 space-y-4">'));
if (start2 !== -1) {
  for(let i=start2; i<start2+30; i++) console.log(lines[i]);
}
