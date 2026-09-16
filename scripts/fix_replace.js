const fs = require('fs');
let code = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8');

const regexAccordion = /<table className="w-full text-xs">\s*<thead className="text-gray-400 border-b">[\s\S]*?<\/thead>\s*<tbody>[\s\S]*?<\/tbody>\s*<\/table>/;
const replacementAccordion = `<table className="w-full text-xs">
                              <thead className="text-gray-400 border-b"><tr><th className="text-left py-1">Insumo</th><th className="text-right">Rendimiento</th><th className="text-right">Costo U.</th><th className="text-right">Subtotal</th></tr></thead>
                              <tbody>
                                {renderGroupedInsumos(rubrosRecipes[item.id], false)}
                              </tbody>
                            </table>`;

const regexModal = /<table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-500 uppercase text-\[10px\]"><tr><th className="p-2">Insumo<\/th><th className="p-2">Cant\/Rendimiento<\/th><th className="p-2">Costo U.<\/th><th className="p-2">Total<\/th><th className="p-2"><\/th><\/tr><\/thead><tbody>[\s\S]*?<\/tbody><\/table>/;
const replacementModal = `<table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-500 uppercase text-[10px]"><tr><th className="p-2">Insumo</th><th className="p-2 text-right">Cant/Rendimiento</th><th className="p-2 text-right">Costo U.</th><th className="p-2 text-right">Total</th><th className="p-2"></th></tr></thead>
                  <tbody>
                    {renderGroupedInsumos(rubrosRecipes[currentRecipeRubro.id], true)}
                  </tbody></table>`;

code = code.replace(regexAccordion, replacementAccordion);
code = code.replace(regexModal, replacementModal);

fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', code);
console.log('Fixed replacements!');
