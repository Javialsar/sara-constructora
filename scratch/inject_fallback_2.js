const fs = require('fs');
let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf-8');

c = c.replace(
  'presupuestoRubros.forEach(pr => {',
  'let sumaSubtotales = 0; presupuestoRubros.forEach(pr => sumaSubtotales += Number(pr.subtotal || 0));\n    presupuestoRubros.forEach(pr => {'
);

fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
