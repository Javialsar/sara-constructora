const fs = require('fs');
let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8');

const regex = /<div className="space-y-2 relative">[\s\S]*?\{\/\* Modal Editar Receta del Proyecto \*\//;

c = c.replace(/<div className="space-y-2 relative">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\s*\}/, 
`<div className="space-y-2 relative">
                        {searchingInsumos && <div className="absolute inset-0 bg-gray-50/80 flex justify-center pt-4 z-10"><Loader2 className="animate-spin text-brand-sage" /></div>}
                        {allInsumos.map(ins => (
                          <div key={ins.id} className="bg-white p-3 rounded-lg border border-gray-200 text-sm flex justify-between items-center shadow-sm hover:border-brand-sage transition-colors">
                            <div>
                              <div className="font-bold text-gray-800 leading-tight">{ins.nombre}</div>
                              <div className="text-[10px] text-gray-400 font-mono mt-0.5">{ins.codigo}</div>
                              <div className="text-xs text-brand-dark font-medium mt-1">$\${Number(ins.precio_sin_iva).toFixed(4)} / {ins.unidad}</div>
                            </div>
                            <button onClick={() => handleAddInsumoToRecipe(ins)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded transition-colors"><Plus size={16}/></button>
                          </div>
                        ))}
                        {allInsumos.length === 0 && insumoSearch.length >= 2 && !searchingInsumos && (
                          <div className="text-center py-4 text-gray-400 text-sm">No se encontraron insumos.</div>
                        )}
                      </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )
    }`);

fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
console.log('Fixed syntax error!');
