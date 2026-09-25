const fs = require('fs');

function patchFile() {
  let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf-8');

  // 1. Headers
  c = c.replace(/<div className="bg-\[#5a9bd4\] text-white p-2 font-bold flex justify-between( mt-4)?">/g, 
    '<div className="bg-brand-sage/10 text-brand-dark px-4 py-3 font-black text-sm uppercase tracking-wider flex justify-between items-center rounded-t-xl border border-brand-sage/20 border-b-0 mt-6 shadow-sm">');
  
  // 2. Row Containers
  c = c.replace(/<div className="bg-white divide-y border-b">/g, 
    '<div className="bg-white divide-y border border-gray-200 rounded-b-xl shadow-sm mb-4">');

  // 3. Normal Rows
  c = c.replace(/<div className="flex p-2 items-center">/g, 
    '<div className="flex p-3 items-center hover:bg-gray-50 transition-colors">');

  // 4. Input Rows (bg-blue-50/30)
  c = c.replace(/<div className="flex p-2 items-center bg-blue-50\/30">/g, 
    '<div className="flex p-3 items-center bg-gray-50/50 hover:bg-gray-100/80 transition-colors border-l-4 border-brand-sage">');

  // 5. Total Rows (bg-gray-50 font-bold)
  c = c.replace(/<div className="flex p-2 items-center bg-gray-50 font-bold">/g, 
    '<div className="flex p-3 items-center bg-gray-100 font-bold border-t border-gray-200">');

  // 6. Costo Directo Row (bg-white font-black py-4)
  c = c.replace(/<div className="flex p-2 items-center bg-white font-black py-4">/g, 
    '<div className="flex p-4 items-center bg-brand-dark text-white rounded-b-xl shadow-inner mt-px">');
    
  // 7. Text colors for Costo Directo (it had text-gray-900, we want text-white)
  // We'll just target the Costo directo text:
  c = c.replace(/<div className="w-1\/3 text-right pr-4 text-gray-900">Costo directo<\/div>/g,
    '<div className="w-1/3 text-right pr-4 text-brand-sage font-black uppercase tracking-wider">Costo directo</div>');

  // 8. Variables (e.g. $pmaq1)
  c = c.replace(/<span className="font-bold mr-2 text-gray-700">(\$[a-zA-Z0-9_]+)<\/span>/g, 
    '<span className={`font-mono text-xs text-gray-400 w-16 text-right mr-2 ${showFormulas ? \'\' : \'hidden\'}`}>$1</span>');

  // 9. Inputs
  const inputRegex = /<input type="number" step="0\.1" min="0" value=\{([^}]+)\} onChange=\{\(e\) => setIndForm\(\{\.\.\.indForm, [^:]+: e\.target\.value\}\)\} className="w-24 h-9 admin-spin bg-blue-200 border-none rounded font-bold text-center text-gray-800 outline-none focus:ring-2 focus:ring-brand-sage" \/>/g;
  
  c = c.replace(inputRegex, (match, val) => {
    // extract the variable being set from the onChange
    const varMatch = match.match(/indForm, ([^:]+):/);
    if (varMatch) {
      const varName = varMatch[1];
      return `<div className="relative"><input type="number" step="0.1" min="0" value={${val}} onChange={(e) => setIndForm({...indForm, ${varName}: e.target.value})} className="w-24 h-9 border border-gray-300 rounded-lg text-right pr-7 pl-2 text-sm font-bold text-brand-dark outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all bg-white shadow-sm" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span></div>`;
    }
    return match;
  });

  // 10. Fix text colors for Costo Neto, Precio de Venta, etc that might be unreadable if we didn't style them
  // Let's check "Costo neto"
  c = c.replace(/<div className="flex p-2 items-center bg-gray-50 font-black py-4">/g,
    '<div className="flex p-4 items-center bg-brand-dark text-white rounded-b-xl shadow-inner mt-px">');
    
  c = c.replace(/<div className="w-1\/3 text-right pr-4 text-gray-900">Costo neto<\/div>/g,
    '<div className="w-1/3 text-right pr-4 text-brand-sage font-black uppercase tracking-wider">Costo neto</div>');

  c = c.replace(/<div className="w-1\/3 text-right pr-4 text-gray-900">Precio de venta<\/div>/g,
    '<div className="w-1/3 text-right pr-4 text-brand-sage font-black uppercase tracking-wider">Precio de venta</div>');

  c = c.replace(/<div className="w-1\/3 text-right pr-4 text-gray-900">Total Precio Unitario<\/div>/g,
    '<div className="w-1/3 text-right pr-4 text-brand-sage font-black uppercase tracking-wider">Total Precio Unitario</div>');


  fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
  console.log('UI patch applied successfully!');
}

patchFile();
