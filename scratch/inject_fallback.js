const fs = require('fs');
let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf-8');

const target = `    presupuestoRubros.forEach(pr => {
      const q = Number(pr.cantidad_obra || 0);`;

const replacement = `
    let sumaSubtotales = 0;
    presupuestoRubros.forEach(pr => sumaSubtotales += Number(pr.subtotal || 0));

    presupuestoRubros.forEach(pr => {
      const q = Number(pr.cantidad_obra || 0);`;

c = c.replace(target, replacement);

const target2 = `    const ind = { pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0, ...(currentPresupuesto?.indirectos_config || {}), ...(indForm || {}) };`;

const replacement2 = `
    if (smat === 0 && smob === 0 && smaq === 0 && sumaSubtotales > 0) {
      // Fallback: si las recetas internas fallan o no existen en este presupuesto antiguo, se traslada todo el costo directo a materiales para no romper las matematicas
      smat = sumaSubtotales;
    }

    const ind = { pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0, ...(currentPresupuesto?.indirectos_config || {}), ...(indForm || {}) };`;

c = c.replace(target2, replacement2);

fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
