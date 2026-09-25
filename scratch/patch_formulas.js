const fs = require('fs');
let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf-8');

c = c.replace(/\{showFormulas \? \(/g, '(');
c = c.replace(/\) : \( <div className='flex-1 font-mono text-gray-500'>\{.*?\}<\/div> \)/g, '');
c = c.replace(/\{showFormulas && \(/g, '(true && (');
c = c.replace(/\$\{showFormulas \? "w-24" : "flex-1"\}/g, 'w-24');
c = c.replace(/\$\{showFormulas \? '' : 'hidden'\}/g, '');

// Removing the checkbox visually
c = c.replace(/<label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox".*?Habilitar Edición de Fórmulas<\/label>/, '');

// Fix overlap
c = c.replace(/className="flex p-3 items-center/g, 'className="flex flex-wrap md:flex-nowrap p-3 items-center gap-y-2');
c = c.replace(/<div className="flex items-center w-48">/g, '<div className="flex items-center w-48 flex-shrink-0">');

fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
