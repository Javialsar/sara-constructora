const fs = require('fs');
const path = 'src/app/admin/presupuestos_reales/page.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /porcentaje_admin: currentPresupuesto\.porcentaje_admin,\s*porcentaje_imprevistos: currentPresupuesto\.porcentaje_imprevistos,\s*porcentaje_utilidad: currentPresupuesto\.porcentaje_utilidad/,
  `indirectos_config: currentPresupuesto.indirectos_config || indForm`
);

fs.writeFileSync(path, code);
console.log("Patched savePresupuesto");
