const fs = require('fs');

let code = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8');

const groupFunc = `
  const renderGroupedInsumos = (insumosList, isEditable) => {
    if (!insumosList || insumosList.length === 0) {
      return <tr><td colSpan={isEditable ? 5 : 4} className="py-4 text-center text-gray-400 italic">No hay insumos.</td></tr>
    }
    
    const grouped = { material: [], mano_de_obra: [], equipo: [], otros: [] };
    insumosList.forEach(r => {
      const type = Array.isArray(r.insumo) ? r.insumo[0]?.tipo : r.insumo?.tipo;
      if (type === 'material') grouped.material.push(r);
      else if (type === 'mano_de_obra') grouped.mano_de_obra.push(r);
      else if (type === 'equipo' || type === 'herramienta_menor') grouped.equipo.push(r);
      else grouped.otros.push(r);
    });

    const renderGroup = (groupName, title, colorClass) => {
      if (grouped[groupName].length === 0) return null;
      return (
        <React.Fragment key={groupName}>
          <tr>
            <td colSpan={isEditable ? 5 : 4} className={\`py-1.5 px-2 font-bold text-[11px] uppercase \${colorClass}\`}>
              {title}
            </td>
          </tr>
          {grouped[groupName].map(item => {
             const insObj = Array.isArray(item.insumo) ? item.insumo[0] : item.insumo;
             const st = Number(item.cantidad) * Number(item.precio_sin_iva_snapshot);
             return (
               <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                 <td className="p-2"><div className="font-medium text-gray-800">{insObj?.nombre}</div><div className="text-[10px] text-gray-400">{insObj?.codigo}</div></td>
                 <td className="p-2 text-right font-mono text-xs">
                   {isEditable ? (
                     <div className="flex justify-end items-center gap-1">
                       <input type="number" step="0.0001" min="0" value={item.cantidad} onChange={(e) => handleUpdateRecipeCantidad(item.id, parseFloat(e.target.value) || 0)} className="w-20 border rounded p-1 text-right font-bold" /> 
                       <span className="w-6 text-left">{insObj?.unidad}</span>
                     </div>
                   ) : (
                     <>{item.cantidad} {insObj?.unidad}</>
                   )}
                 </td>
                 <td className="p-2 text-right text-gray-500">\${Number(item.precio_sin_iva_snapshot).toFixed(4)}</td>
                 <td className="p-2 text-right font-bold text-gray-800">\${st.toFixed(2)}</td>
                 {isEditable && (
                   <td className="p-2 text-center"><button onClick={() => handleRemoveRecipeInsumo(item.id)} className="text-red-400 hover:text-red-600 p-1"><X size={14}/></button></td>
                 )}
               </tr>
             )
          })}
        </React.Fragment>
      )
    };

    return (
      <>
        {renderGroup('material', 'Materiales', 'text-blue-700 bg-blue-50/50')}
        {renderGroup('mano_de_obra', 'Mano de Obra', 'text-orange-700 bg-orange-50/50')}
        {renderGroup('equipo', 'Equipos y Maquinaria', 'text-purple-700 bg-purple-50/50')}
        {renderGroup('otros', 'Otros Insumos', 'text-gray-700 bg-gray-50/50')}
      </>
    );
  };
`;

if (!code.includes('renderGroupedInsumos')) {
    code = code.replace('const handleUpdateCantidadObra =', groupFunc + '\n  const handleUpdateCantidadObra =');
}
if (!code.includes('import React')) {
    code = code.replace('import { useState', 'import React, { useState');
}

// 1. Reemplazo del acordeón (NO REGEX, usar indexOf y slice)
const accordionStartStr = '<tbody>\n                                {(!rubrosRecipes[item.id] || rubrosRecipes[item.id].length === 0) && (\n                                  <tr><td colSpan={5} className="py-4 text-center text-gray-400 italic">No hay insumos en este rubro. Haz clic en Modificar Insumos.</td></tr>\n                                )}\n                                {(rubrosRecipes[item.id] || []).map(r => {\n                                  const ins = Array.isArray(r.insumo) ? r.insumo[0] : r.insumo;\n                                  return (\n                                  <tr key={r.id} className="border-b border-gray-50">\n                                    <td className="py-2 text-gray-700 font-medium">{ins?.nombre}</td>\n                                    <td className="py-2 text-center text-gray-500">{ins?.tipo?.replace(/_/g, \' \')}</td>\n                                    <td className="py-2 text-right font-mono">{r.cantidad} {ins?.unidad}</td>\n                                    <td className="py-2 text-right">${Number(r.precio_sin_iva_snapshot).toFixed(4)}</td>\n                                    <td className="py-2 text-right font-bold">${(Number(r.cantidad) * Number(r.precio_sin_iva_snapshot)).toFixed(4)}</td>\n                                  </tr>\n                                )})}\n                              </tbody>';
const accordionReplacement = '<tbody>\n                                {renderGroupedInsumos(rubrosRecipes[item.id], false)}\n                              </tbody>';
code = code.replace(accordionStartStr, accordionReplacement);

// 2. Reemplazo del modal
const modalStartStr = '<tbody>\n                    {(rubrosRecipes[currentRecipeRubro.id] || []).map(item => {\n                      const st = Number(item.cantidad) * Number(item.precio_sin_iva_snapshot);\n                      const insObj = Array.isArray(item.insumo) ? item.insumo[0] : item.insumo;\n                      return (\n                      <tr key={item.id} className="border-b">\n                        <td className="p-2"><div className="font-bold text-gray-800">{insObj?.nombre}</div><div className="text-xs text-gray-400">{insObj?.tipo?.replace(/_/g, \' \').toUpperCase()}</div></td>\n                        <td className="p-2"><input type="number" step="0.0001" min="0" value={item.cantidad} onChange={(e) => handleUpdateRecipeCantidad(item.id, parseFloat(e.target.value) || 0)} className="w-24 border rounded p-1 font-bold" /> {insObj?.unidad}</td>\n                        <td className="p-2 text-gray-500">${Number(item.precio_sin_iva_snapshot).toFixed(4)}</td>\n                        <td className="p-2 font-bold">${st.toFixed(2)}</td>\n                        <td className="p-2"><button onClick={() => handleRemoveRecipeInsumo(item.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={16}/></button></td>\n                      </tr>\n                    )})}\n                  </tbody>';
const modalReplacement = '<tbody>\n                    {renderGroupedInsumos(rubrosRecipes[currentRecipeRubro.id], true)}\n                  </tbody>';
code = code.replace(modalStartStr, modalReplacement);


fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', code);
console.log('Replaced perfectly!');
