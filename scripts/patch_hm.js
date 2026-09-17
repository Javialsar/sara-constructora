const fs = require('fs');
let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8');

const oldCode = `          const mo = insumos.filter(r => (Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo === 'mano_de_obra');
          if (mo.length > 0) {
            apuRows.push([{ content: 'MANO DE OBRA', colSpan: 5, styles: { fontStyle: 'bold', fillColor: [255, 245, 235], textColor: [211, 84, 0] } }]);
            mo.forEach(m => {
               const iObj = Array.isArray(m.insumo) ? m.insumo[0] : m.insumo;
               apuRows.push([iObj?.nombre || '', iObj?.unidad || '', Number(m.cantidad).toFixed(4), Number(m.precio_sin_iva_snapshot).toFixed(4), (m.cantidad * m.precio_sin_iva_snapshot).toFixed(2)]);
            });
          }
          const eq = insumos.filter(r => ['equipo', 'herramienta_menor'].includes((Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo));
          if (eq.length > 0) {
            apuRows.push([{ content: 'EQUIPOS Y MAQUINARIA', colSpan: 5, styles: { fontStyle: 'bold', fillColor: [245, 235, 255], textColor: [142, 68, 173] } }]);
            eq.forEach(m => {
               const iObj = Array.isArray(m.insumo) ? m.insumo[0] : m.insumo;
               apuRows.push([iObj?.nombre || '', iObj?.unidad || '', Number(m.cantidad).toFixed(4), Number(m.precio_sin_iva_snapshot).toFixed(4), (m.cantidad * m.precio_sin_iva_snapshot).toFixed(2)]);
            });
          }`;

const newCode = `          const mo = insumos.filter(r => (Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo === 'mano_de_obra');
          let costoMO = 0;
          if (mo.length > 0) {
            apuRows.push([{ content: 'MANO DE OBRA', colSpan: 5, styles: { fontStyle: 'bold', fillColor: [255, 245, 235], textColor: [211, 84, 0] } }]);
            mo.forEach(m => {
               const iObj = Array.isArray(m.insumo) ? m.insumo[0] : m.insumo;
               const sub = m.cantidad * m.precio_sin_iva_snapshot;
               costoMO += sub;
               apuRows.push([iObj?.nombre || '', iObj?.unidad || '', Number(m.cantidad).toFixed(4), Number(m.precio_sin_iva_snapshot).toFixed(4), sub.toFixed(2)]);
            });
          }
          
          const eq = insumos.filter(r => ['equipo', 'herramienta_menor'].includes((Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo));
          
          const rubroMaestro = allRubros.find(ar => ar.id === rubro.rubro_id);
          const hmPct = rubroMaestro ? (Number(rubroMaestro.herramienta_menor_pct) || 0) : 5; // Default 5% si no se encuentra
          const hmValue = costoMO * (hmPct / 100);

          if (eq.length > 0 || hmValue > 0) {
            apuRows.push([{ content: 'EQUIPOS Y MAQUINARIA', colSpan: 5, styles: { fontStyle: 'bold', fillColor: [245, 235, 255], textColor: [142, 68, 173] } }]);
            eq.forEach(m => {
               const iObj = Array.isArray(m.insumo) ? m.insumo[0] : m.insumo;
               apuRows.push([iObj?.nombre || '', iObj?.unidad || '', Number(m.cantidad).toFixed(4), Number(m.precio_sin_iva_snapshot).toFixed(4), (m.cantidad * m.precio_sin_iva_snapshot).toFixed(2)]);
            });
            if (hmValue > 0) {
               apuRows.push([\`Herramienta Menor (\${hmPct}% de M.O.)\`, '%', hmPct.toFixed(2), costoMO.toFixed(4), hmValue.toFixed(2)]);
            }
          }`;

if (c.includes(oldCode)) {
  c = c.replace(oldCode, newCode);
  fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
  console.log("Patched successfully!");
} else {
  console.log("oldCode not found!");
}
