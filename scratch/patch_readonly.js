const fs = require('fs');
let c = fs.readFileSync('src/app/admin/apus/insumos/page.tsx', 'utf-8');

const oldCode = `<input type="text" placeholder="Ej. MAT-001" value={formData.codigo}
                      readOnly={!editingId}
                      onChange={e => setFormData({...formData, codigo: e.target.value})}
                      className={\`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 \${!editingId ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed font-mono' : 'border-gray-300 focus:border-brand-sage focus:ring-brand-sage'}\`} />`;

const newCode = `<input type="text" placeholder="Ej. MAT-001" value={formData.codigo}
                      readOnly={true}
                      className="w-full border bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed font-mono rounded-lg px-3 py-2 text-sm outline-none" />`;

if (c.includes('readOnly={!editingId}')) {
    c = c.replace(oldCode, newCode);
    fs.writeFileSync('src/app/admin/apus/insumos/page.tsx', c);
    console.log('Patched');
} else {
    console.log('Not found!');
}
