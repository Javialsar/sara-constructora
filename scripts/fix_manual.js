const fs = require('fs');
let c = fs.readFileSync('temp.txt', 'utf8');

const badBlock = `                    <div className="space-y-2 relative">
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
                    </div><div className="text-xs text-gray-500">$\${ins.precio_sin_iva} / {ins.unidad}</div></div>
                        <button onClick={() => handleAddInsumoToRecipe(ins)} className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-2 rounded"><Plus size={16}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    )
  }`;

const goodBlock = `                    <div className="space-y-2 relative h-96 overflow-y-auto">
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
    }`;

if (c.includes(badBlock)) {
   c = c.replace(badBlock, goodBlock);
   fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
   console.log("Fixed manually with direct string replace");
} else {
   console.log("Could not find the exact bad block.");
}
