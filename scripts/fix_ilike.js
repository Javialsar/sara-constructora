const fs = require('fs');
const lines = fs.readFileSync('src/app/admin/proveedores/[id]/page.tsx', 'utf8').split('\n');
const fixed = lines.map(l => {
  if (l.includes('ilike')) {
    return "      .ilike('nombre', `%${searchTerm}%`)";
  }
  return l;
});
fs.writeFileSync('src/app/admin/proveedores/[id]/page.tsx', fixed.join('\n'));
console.log('Fixed');
