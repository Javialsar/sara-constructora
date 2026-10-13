const fs = require('fs');
const path = 'src/app/admin/presupuestos_reales/page.tsx';
let code = fs.readFileSync(path, 'utf8');
const lines = code.split('\n');

let expIdx = lines.findIndex(l => l.includes('generateExplosionPDF({'));
if (expIdx > -1) {
  let extraBraceIdx = expIdx;
  let count = 0;
  while (count < 2 && extraBraceIdx < lines.length) {
    if (lines[extraBraceIdx] === '  }') {
      count++;
      if (count === 2) {
        lines.splice(extraBraceIdx, 1);
        break;
      }
    }
    extraBraceIdx++;
  }
}

fs.writeFileSync(path, lines.join('\n'));
console.log("Removed extra brace");
