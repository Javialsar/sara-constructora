const fs = require('fs');
let code = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8');

// Replace table
code = code.replace(
  '<table className="w-full text-sm text-left">',
  '<table className="w-full text-sm text-left border-collapse border border-gray-800">'
);

// Replace thead
code = code.replace(
  '<thead className="bg-white text-gray-500 font-bold uppercase text-[10px] border-b">',
  '<thead className="bg-gray-100 text-gray-900 font-bold uppercase text-[10px] border-b border-gray-800">'
);

// Replace THs inside thead
const thOld = `                  <tr>
                    <th className="w-10"></th>
                    <th className="px-4 py-3">Cód</th>
                    <th className="px-4 py-3">Rubro</th>
                    <th className="px-4 py-3 text-center">Unidad</th>
                    <th className="px-4 py-3 text-right">Cant. Obra</th>
                    <th className="px-4 py-3 text-right">P. Unitario</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>`;
const thNew = `                  <tr>
                    <th className="w-10 border border-gray-800"></th>
                    <th className="px-4 py-3 border border-gray-800">Cód</th>
                    <th className="px-4 py-3 border border-gray-800">Rubro</th>
                    <th className="px-4 py-3 text-center border border-gray-800">Unidad</th>
                    <th className="px-4 py-3 text-right border border-gray-800">Cant. Obra</th>
                    <th className="px-4 py-3 text-right border border-gray-800">P. Unitario</th>
                    <th className="px-4 py-3 text-right border border-gray-800">Subtotal</th>
                    <th className="px-4 py-3 text-center border border-gray-800">Acciones</th>
                  </tr>`;
code = code.replace(thOld, thNew);

// Replace tbody
code = code.replace(
  '<tbody className="divide-y divide-gray-50">',
  '<tbody className="divide-y divide-gray-800">'
);

// Replace TR and TDs
const trOld = `                    <tr className="hover:bg-gray-50">
                      <td className="px-2 text-center">
                        <button onClick={() => toggleRubro(item.id)} className="p-1 rounded hover:bg-gray-200 text-gray-500">
                          {expandedRubros[item.id] ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-brand-sage font-bold">{item.codigo_rubro}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 text-xs cursor-pointer" onClick={() => toggleRubro(item.id)}>{item.nombre_rubro}</td>
                      <td className="px-4 py-3 text-center text-xs font-bold">{item.unidad}</td>
                      <td className="px-4 py-3 text-right">
                        {isBorrador ? (
                          <input type="number" step="0.01" min="0" value={item.cantidad_obra} onChange={(e) => handleUpdateCantidadObra(item.id, parseFloat(e.target.value) || 0, item.precio_unitario_snapshot)} className="w-24 text-right border rounded px-2 py-1 font-bold text-brand-dark" />
                        ) : (
                          <span className="font-bold">{item.cantidad_obra}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-500">\${Number(item.precio_unitario_snapshot).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-800">\${Number(item.subtotal).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center flex items-center justify-center gap-2">`;
const trNew = `                    <tr className="hover:bg-gray-100 transition-colors">
                      <td className="px-2 text-center border border-gray-800">
                        <button onClick={() => toggleRubro(item.id)} className="p-1 rounded hover:bg-gray-300 text-gray-800">
                          {expandedRubros[item.id] ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-brand-sage font-bold border border-gray-800">{item.codigo_rubro}</td>
                      <td className="px-4 py-3 font-medium text-black text-xs cursor-pointer border border-gray-800" onClick={() => toggleRubro(item.id)}>{item.nombre_rubro}</td>
                      <td className="px-4 py-3 text-center text-xs font-bold border border-gray-800 text-black">{item.unidad}</td>
                      <td className="px-4 py-3 text-right border border-gray-800">
                        {isBorrador ? (
                          <input type="number" step="0.01" min="0" value={item.cantidad_obra} onChange={(e) => handleUpdateCantidadObra(item.id, parseFloat(e.target.value) || 0, item.precio_unitario_snapshot)} className="w-24 text-right border border-gray-400 rounded px-2 py-1 font-bold text-black" />
                        ) : (
                          <span className="font-bold text-black">{item.cantidad_obra}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-black border border-gray-800">\${Number(item.precio_unitario_snapshot).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-bold text-black border border-gray-800">\${Number(item.subtotal).toFixed(2)}</td>
                      <td className="px-4 py-3 border border-gray-800">
                        <div className="flex items-center justify-center gap-2">`;
code = code.replace(trOld, trNew);

// We need to fix the closing tag for the actions TD
code = code.replace(
  `                      </td>\n                    </tr>`,
  `                        </div>\n                      </td>\n                    </tr>`
);

fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', code);
console.log("Patched table grid!");
