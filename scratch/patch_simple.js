const fs = require('fs');
let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf-8');

c = c.replace('const [showFormulas, setShowFormulas] = useState(false)', 'const [showFormulas, setShowFormulas] = useState(true)');
c = c.replace(/<label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox".*?Habilitar Edición de Fórmulas<\/label>/, '');

c = c.replace(/className="flex p-3 items-center/g, 'className="flex flex-wrap md:flex-nowrap p-3 items-center gap-y-2');
c = c.replace(/<div className="flex items-center w-48">/g, '<div className="flex items-center w-48 flex-shrink-0">');

fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
