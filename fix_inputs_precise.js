const fs = require('fs');

let code = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8');

const keys = ['pmaq1', 'pmob1', 'pmat1', 'ggen', 'pgas1', 'pgas2', 'pgas3', 'pimp', 'util'];

keys.forEach(k => {
    // Let's find exactly the line or string that contains the input.
    // The exact string in the file (from previous log) is:
    // <input type="number" step="0.1" value={indForm.pmaq1} onChange={e => setIndForm({...indForm, pmaq1: e.target.value})} className="w-20 h-9 text-base border-2 border-brand-sage/40 rounded-lg p-1 text-center bg-blue-50 focus:border-brand-sage focus:bg-white font-bold transition-all shadow-inner" />
    
    // Actually, I can just find `<input type="number" step="0.1" value={indForm.${k}}` and replace it up to `shadow-inner" />`
    const startStr = `<input type="number" step="0.1" value={indForm.${k}}`;
    const startIdx = code.indexOf(startStr);
    
    if (startIdx !== -1) {
        const endStr = `shadow-inner" />`;
        const endIdx = code.indexOf(endStr, startIdx);
        
        if (endIdx !== -1) {
            const oldInput = code.substring(startIdx, endIdx + endStr.length);
            
            // Build the new custom widget
            const widget = `<div className="flex items-center border-2 border-brand-sage/40 rounded-lg overflow-hidden w-28 h-9 shadow-inner bg-blue-50 focus-within:border-brand-sage focus-within:bg-white transition-all">
                          <button type="button" onClick={() => setIndForm({...indForm, ${k}: String(Math.max(0, (Number(indForm.${k})||0) - 0.1).toFixed(1))})} className="w-8 h-full bg-gray-200 hover:bg-gray-300 font-bold text-gray-600 flex items-center justify-center select-none">-</button>
                          <input type="number" step="0.1" value={indForm.${k} !== undefined && indForm.${k} !== null ? indForm.${k} : ''} onChange={e => setIndForm({...indForm, ${k}: e.target.value})} className="w-full h-full text-center bg-transparent outline-none font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-sm" />
                          <button type="button" onClick={() => setIndForm({...indForm, ${k}: String(((Number(indForm.${k})||0) + 0.1).toFixed(1))})} className="w-8 h-full bg-gray-200 hover:bg-gray-300 font-bold text-gray-600 flex items-center justify-center select-none">+</button>
                        </div>`;
                        
            code = code.replace(oldInput, widget);
        }
    }
});

fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', code);
console.log("Custom input widgets successfully added via precise string replacement!");
