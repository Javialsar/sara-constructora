const fs = require('fs');
const path = 'src/app/admin/presupuestos_reales/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const regexSidebar = /<div className="space-y-3 bg-white\/5 p-3 rounded-lg">([\s\S]*?)<\/div>\s*<\/div>/;

const newSidebar = `<div className="space-y-3 bg-white/5 p-3 rounded-lg"><h3 className="text-xs font-bold text-gray-400 uppercase">Cálculo de Indirectos</h3>
                <div className="flex justify-between gap-4"><span className="text-sm">Gastos Gen (A)</span>
                  <span className="font-bold text-right text-brand-sage">{indForm?.ggen || 0}%</span>
                  <span className="text-sm text-gray-300 w-16 text-right">\${a.toFixed(2)}</span></div>
                <div className="flex justify-between gap-4"><span className="text-sm">Imprevistos (I)</span>
                  <span className="font-bold text-right text-brand-sage">{indForm?.pimp || 0}%</span>
                  <span className="text-sm text-gray-300 w-16 text-right">\${i.toFixed(2)}</span></div>
                <div className="flex justify-between gap-4"><span className="text-sm">Utilidad (U)</span>
                  <span className="font-bold text-right text-brand-sage">{indForm?.util || 0}%</span>
                  <span className="text-sm text-gray-300 w-16 text-right">\${u.toFixed(2)}</span></div>
                <div className="text-center pt-2 mt-2 border-t border-white/10 text-xs text-gray-400">Edita los porcentajes en la pestaña "Costos Indirectos"</div>
              </div>
            </div>`;

code = code.replace(regexSidebar, newSidebar);
fs.writeFileSync(path, code);
console.log("Patched right sidebar");
