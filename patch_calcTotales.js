const fs = require('fs');
const path = 'src/app/admin/presupuestos_reales/page.tsx';
let code = fs.readFileSync(path, 'utf8');
const lines = code.split('\n');

const returnLineIdx = lines.findIndex(l => l.includes('return { costoDirectoTotal, a, i, u, granTotal }'));
if (returnLineIdx > -1) {
  lines[returnLineIdx] = `    return { 
      costoDirectoTotal, a, i, u, granTotal, 
      smaq, smob, smat, 
      dmaq1, dmob1, dmat1, 
      cmaq, cmob, cmat, 
      sggen, sgas1, sgas2, sgas3, 
      totalGastosGenerales, cnet, simp, sutil
    }`;
}

const destructureIdx = lines.findIndex(l => l.includes('const { costoDirectoTotal, a, i, u, granTotal } = calcTotales()'));
if (destructureIdx > -1) {
  lines[destructureIdx] = `        const { 
          costoDirectoTotal, a, i, u, granTotal, 
          smaq, smob, smat, 
          dmaq1, dmob1, dmat1, 
          cmaq, cmob, cmat, 
          sggen, sgas1, sgas2, sgas3, 
          totalGastosGenerales, cnet, simp, sutil 
        } = calcTotales()`;
}

// Ensure other usages of calcTotales() are not broken, wait... `savePresupuesto` does `const { costoDirectoTotal, granTotal } = calcTotales()`. That's fine.
// And `totales: calcTotales()` in `generatePresupuestoGeneralPDF`.
// In `pdfGenerator.ts`, `generatePresupuestoGeneralPDF` expects `totales` and extracts `{ costoDirectoTotal, a, i, u, granTotal } = totales`. This will still work.

// Also, the tfoot in `detalle` uses `totalGastosGenerales + simp + sutil` - wait!
// Let's ensure no other ReferenceErrors exist. The only variables that were defined in the main component body and used in the UI are the ones from `calcTotales`.

fs.writeFileSync(path, lines.join('\n'));
console.log("Patched calcTotales export and destructuring");
