const fs = require('fs');
const path = 'src/app/admin/presupuestos_reales/page.tsx';
let code = fs.readFileSync(path, 'utf8');
const lines = code.split('\n');

// 1. Change grid-cols-1 lg:grid-cols-4 to w-full
let idx1 = lines.findIndex(l => l.includes('<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">'));
if (idx1 > -1) {
  lines[idx1] = lines[idx1].replace('grid grid-cols-1 lg:grid-cols-4 gap-6', 'w-full');
}

// 2. Change lg:col-span-3 to nothing
let idx2 = lines.findIndex(l => l.includes('<div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">'));
if (idx2 > -1) {
  lines[idx2] = lines[idx2].replace('lg:col-span-3 ', '');
}

// 3. Add GUARDAR button next to Actualizar Precios
let idx3 = lines.findIndex(l => l.includes('<button onClick={updatePricesFromCatalog} className="bg-white border text-gray-600 text-sm font-bold py-1.5 px-4 rounded hover:bg-gray-50 flex items-center gap-2">Actualizar Precios</button>'));
if (idx3 > -1) {
  lines.splice(idx3, 0, `                    <button onClick={savePresupuesto} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-1.5 px-4 rounded flex items-center gap-2 shadow-sm"><Save size={16} /> Guardar</button>`);
}

// 4. Find the sidebar starting point and end point
let sideStart = lines.findIndex(l => l.includes('<div className="bg-brand-dark rounded-xl p-6 text-white h-fit sticky top-6 flex flex-col gap-6">'));
let sideEnd = lines.findIndex((l, i) => i > sideStart && l.includes('{activeTab === \\\'indirectos\\\' && ('));

if (sideStart > -1 && sideEnd > -1) {
  // It should end before the closing </div> of the main grid, or maybe the sidebar has its own closing </div>s.
  // Actually, wait! In page.tsx:
  //       </div> // closes the lg:col-span-3 div
  //     </div> // closes the grid
  //   )} // closes activeTab === 'detalle'
  
  // Let's just remove the block from sideStart until it finds `{activeTab === 'indirectos' && (`
  // But wait! We need to leave the `</div>` that closes the grid!
  // It looks like:
  //           <div className="bg-brand-dark rounded-xl p-6 text-white h-fit sticky top-6 flex flex-col gap-6">
  //             ...
  //           </div>
  //         </div>
  //         )}
  
  // Let's just find sideStart.
  // The sidebar ends with </div>, then there's another </div>, then )}
  let actualEnd = sideEnd - 1; 
  while (!lines[actualEnd].includes(')}')) {
    actualEnd--;
  }
  // so actualEnd is the line with )}
  // we want to remove from sideStart to actualEnd - 2 (leaving the </div> that closes the w-full div).
  
  lines.splice(sideStart, actualEnd - sideStart - 1);
}

// 5. Add tfoot before </table> in 'detalle'
let tableEnd = lines.findIndex((l, i) => i > idx1 && i < sideStart && l.includes('</table>'));
if (tableEnd > -1) {
  const tfoot = `                <tfoot className="bg-gray-50 border-t-4 border-gray-200">
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-right text-gray-500 uppercase text-xs font-bold">Costo Directo (Suma Subtotales)</td>
                    <td className="px-4 py-3 text-right text-lg font-bold text-gray-800">\${costoDirectoTotal.toFixed(2)}</td>
                    <td colSpan={2}></td>
                  </tr>
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-right text-gray-500 uppercase text-xs font-bold">Indirectos (AIU)</td>
                    <td className="px-4 py-3 text-right text-lg font-bold text-gray-800">\${(a + i + u).toFixed(2)}</td>
                    <td colSpan={2}></td>
                  </tr>
                  <tr className="bg-brand-sage/10">
                    <td colSpan={6} className="px-4 py-3 text-right text-brand-dark uppercase text-xs font-black">Gran Total (Precio Venta)</td>
                    <td className="px-4 py-3 text-right text-xl font-black text-brand-sage">\${granTotal.toFixed(2)}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>`;
  lines.splice(tableEnd, 0, tfoot);
}

fs.writeFileSync(path, lines.join('\n'));
console.log("Patched layout");
