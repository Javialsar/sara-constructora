const fs = require('fs');
let code = fs.readFileSync('src/app/admin/proveedores/page.tsx', 'utf8');

code = code.replace('import { Briefcase', 'import { Briefcase, List, BookOpen');

const btnStr = `<button onClick={() => handleDelete(prov.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Eliminar">
                        <Trash2 size={16} />
                      </button>`;
                      
const newBtnStr = `<button onClick={() => window.location.href=\`/admin/proveedores/\${prov.id}\`} className="p-2 text-gray-400 hover:text-brand-sage transition-colors" title="Ver Catálogo">
                        <BookOpen size={16} />
                      </button>
                      ` + btnStr;
                      
if (!code.includes('BookOpen size={16}')) {
  code = code.replace(btnStr, newBtnStr);
}

fs.writeFileSync('src/app/admin/proveedores/page.tsx', code);
console.log('Fixed');
