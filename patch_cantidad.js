const fs = require('fs');
const path = 'src/app/admin/presupuestos_reales/page.tsx';
let code = fs.readFileSync(path, 'utf8');
const lines = code.split('\n');

const calcLine = lines.findIndex(l => l.includes('const q = Number(pr.cantidad || 0);'));
if (calcLine > -1) {
  lines[calcLine] = lines[calcLine].replace('pr.cantidad', 'pr.cantidad_obra');
}

fs.writeFileSync(path, lines.join('\n'));
console.log("Patched cantidad to cantidad_obra in calcTotales");
