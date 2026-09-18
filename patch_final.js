const fs = require('fs');

let c = fs.readFileSync('src/app/admin/trabajadores/page.tsx', 'utf8');

const regex = /<button[\s\S]*?Registrar Personal\s*<\/button>/;

const replacement = `<div className="flex gap-3">
          <button 
            onClick={() => setIsCredModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-all shadow-sm"
          >
            <Key size={18} />
            Crear Credenciales
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-sage text-brand-dark px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-opacity-90 transition-all"
          >
            <Plus size={18} />
            Registrar Personal
          </button>
        </div>`;

c = c.replace(regex, replacement);

fs.writeFileSync('src/app/admin/trabajadores/page.tsx', c);
console.log('Fixed correctly');
