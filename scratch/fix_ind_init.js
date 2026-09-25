const fs = require('fs');
let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf-8');

// 1. Fix openEditor setIndForm
c = c.replace(/setIndForm\(presupuesto\.indirectos_config \|\| \{ pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0 \}\)/g,
"setIndForm({ pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0, ...(presupuesto.indirectos_config || {}) })");

// 2. Fix calcTotales const ind
c = c.replace(/const ind = indForm \|\| currentPresupuesto\?\.indirectos_config \|\| \{ pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0 \};/g,
"const ind = { pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0, ...(currentPresupuesto?.indirectos_config || {}), ...(indForm || {}) };");

// Let's also ensure value={indForm.xxx || 0} in inputs just to be perfectly safe?
// Actually if we merge with defaults it will always have a number. So it's fine.

fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
console.log('Fixed indForm initialization!');
