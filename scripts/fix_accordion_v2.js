const fs = require('fs');
let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8');

const replacement = `
      const totalSuma = insumosList.reduce((acc, item) => {
         const iObj = Array.isArray(item.insumo) ? item.insumo[0] : item.insumo;
         let sub = Number(item.cantidad) * Number(item.precio_sin_iva_snapshot);
         return acc + sub;
      }, 0);

      return (
        <>
          {renderGroup('material', 'Materiales', 'text-blue-700 bg-blue-50/50')}
          {renderGroup('mano_de_obra', 'Mano de Obra', 'text-orange-700 bg-orange-50/50')}
          {renderGroup('equipo', 'Equipos y Maquinaria', 'text-purple-700 bg-purple-50/50')}
          {renderGroup('otros', 'Otros', 'text-gray-700 bg-gray-50/50')}
          <tr className="border-t-2 border-gray-200 bg-white">
            <td colSpan={isEditable ? 3 : 2} className="p-3 text-right font-black text-gray-700 text-sm uppercase">Costo Directo Total:</td>
            <td className="p-3 text-right font-black text-brand-dark text-sm">$\${totalSuma.toFixed(2)}</td>
            {isEditable && <td></td>}
          </tr>
        </>
      )
`;

// Find where it returns the groups
c = c.replace(/return \(\s*<>\s*\{renderGroup\('material'[^<]+<\/>\s*\)/, replacement);

fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
console.log('Fixed properly!');
